import { useEffect, useMemo } from 'react';
import { Form } from 'antd';
import {
    useClaimsInfiniteQuery,
    useListClaimQuery,
    useClaimStatusesQuery,
    useSolutionsQuery,
} from '../useClaimHooks';
import { useFilterWithURL } from '../useFilterWithURL';
import { usePaginationWithURL } from '../usePaginationWithURL';
import { useTranslation } from '@repo/i18n';

export interface UseClaimsLogicProps {
    page: number;
    pageSize: number;
    filters: Record<string, any>;
}

/**
 * Shared logic for Claims Page
 */
export const useClaimsLogic = ({ page, pageSize, filters }: UseClaimsLogicProps) => {
    // 1. Format params for API
    const apiParams = useMemo(() => {
        const params: Record<string, any> = {
            page: page - 1,
            size: pageSize,
            sort: 'createdAt:desc',
            ...filters,
        };
        // Convert arrays to comma strings for API. Amphitrite uses these exact param names.
        ['publicStates', 'solutionCode'].forEach(key => {
            if (Array.isArray(params[key])) {
                params[key] = params[key].join(',');
            }
        });
        if (Array.isArray(params.ticketType)) {
            params.ticketType = params.ticketType[0];
        }
        return params;
    }, [page, pageSize, filters]);

    // 2. Fetch data
    const { data: listData, isLoading: isClaimLoading } = useListClaimQuery(apiParams);
    const { data: statusData } = useClaimStatusesQuery();
    const { data: solutionData } = useSolutionsQuery();

    // 3. Derived State
    const statusOptions = useMemo(() => {
        if (!statusData) return [];
        return statusData.map((s: any) => ({ label: s.name, value: s.code }));
    }, [statusData]);

    const solutionOptions = useMemo(() => {
        if (!solutionData) return [];
        return solutionData.map((s: any) => ({ label: s.name, value: s.code }));
    }, [solutionData]);

    return {
        listData,
        isClaimLoading,
        isClaimsLoading: isClaimLoading, // alias cho UI
        statusData,
        solutionData,
        statusOptions,
        solutionOptions,
        apiParams
    };
};

const MOBILE_PAGE_SIZE = 25;

const normalizeClaimFilters = (values: Record<string, any>) => {
    const next = { ...values };
    if (Array.isArray(next.ticketType)) {
        next.ticketType = next.ticketType[0];
    }
    return next;
};

export const useClaimsPage = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 25,
    });

    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });
    const logic = useClaimsLogic({ page, pageSize, filters });
    const filterSignature = JSON.stringify(filters);

    useEffect(() => {
        form.resetFields();
        form.setFieldsValue(filters);
    }, [filterSignature, form, filters]);

    const handleSearch = () => {
        applyFilters(normalizeClaimFilters(form.getFieldsValue(true)));
    };

    const handleReset = () => {
        clearFilters();
    };

    return {
        t,
        form,
        page,
        pageSize,
        setPage,
        setPageSize,
        filters,
        ...logic,
        handleSearch,
        handleReset,
        applyFilters,
    };
};

export const useClaimsMobilePage = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const pageSize = MOBILE_PAGE_SIZE;
    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });
    const filterSignature = JSON.stringify(filters);

    useEffect(() => {
        form.resetFields();
        form.setFieldsValue(filters);
    }, [filterSignature, form, filters]);

    const apiParams = useMemo(() => {
        const params: Record<string, any> = {
            page: 0,
            size: pageSize,
            sort: 'createdAt:desc',
            ...normalizeClaimFilters(filters),
        };
        ['publicStates', 'solutionCode'].forEach(key => {
            if (Array.isArray(params[key])) {
                params[key] = params[key].join(',');
            }
        });
        return params;
    }, [filterSignature, filters, pageSize]);

    const infiniteQuery = useClaimsInfiniteQuery(apiParams);
    const { data: statusData } = useClaimStatusesQuery();
    const { data: solutionData } = useSolutionsQuery();
    const pages = infiniteQuery.data?.pages || [];
    const rows = pages.flatMap((page) => page.data || []);
    const firstPage = pages[0];

    const statusOptions = useMemo(
        () => (statusData || []).map((s: any) => ({ label: s.name, value: s.code })),
        [statusData],
    );

    const solutionOptions = useMemo(
        () => (solutionData || []).map((s: any) => ({ label: s.name, value: s.code })),
        [solutionData],
    );

    const handleSearch = () => {
        applyFilters(normalizeClaimFilters(form.getFieldsValue(true)));
    };

    const handleReset = () => {
        clearFilters();
    };

    return {
        t,
        form,
        page: 1,
        pageSize,
        setPage: () => undefined,
        setPageSize: () => undefined,
        filters,
        listData: {
            data: rows,
            total: firstPage?.total || 0,
            pageSize: firstPage?.pageSize || pageSize,
            current: firstPage?.current || 0,
            totalPage: firstPage?.totalPage || 0,
        },
        isClaimLoading: infiniteQuery.isLoading,
        isClaimsLoading: infiniteQuery.isLoading,
        isFetchingNextPage: infiniteQuery.isFetchingNextPage,
        hasNextPage: infiniteQuery.hasNextPage,
        fetchNextPage: infiniteQuery.fetchNextPage,
        statusData: statusData || [],
        solutionData: solutionData || [],
        statusOptions,
        solutionOptions,
        apiParams,
        handleSearch,
        handleReset,
        applyFilters,
    };
};
