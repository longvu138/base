import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Form } from 'antd';
import {
    useDeliveryNotesInfiniteQuery,
    useDeliveryNotesQuery,
} from '../useDeliveryNoteHooks';
import { useFilterWithURL } from '../useFilterWithURL';
import { usePaginationWithURL } from '../usePaginationWithURL';
import { useTranslation } from '@repo/i18n';

export interface UseDeliveryNotesLogicProps {
    page: number;
    pageSize: number;
    filters: Record<string, any>;
}

/**
 * Shared logic for Delivery Notes Page
 */
export const useDeliveryNotesLogic = ({ page, pageSize, filters }: UseDeliveryNotesLogicProps) => {
    // 1. Format params for API
    const apiParams = useMemo(() => {
        const params: Record<string, any> = {
            page: page - 1,
            size: pageSize,
            sort: 'exported_at:desc',
            ...filters,
        };
        if (params.exportedAtRange) {
            params.exportedAtFrom = params.exportedAtRange[0]?.toISOString();
            params.exportedAtTo = params.exportedAtRange[1]?.toISOString();
            delete params.exportedAtRange;
        }
        if (dayjs.isDayjs(params.exportedAtFrom)) {
            params.exportedAtFrom = params.exportedAtFrom.startOf('day').toISOString();
        }
        if (dayjs.isDayjs(params.exportedAtTo)) {
            params.exportedAtTo = params.exportedAtTo.endOf('day').toISOString();
        }
        return params;
    }, [page, pageSize, filters]);

    // 2. Fetch data
    const { data: listData, isLoading: isDeliveryNoteLoading } = useDeliveryNotesQuery(apiParams);

    return {
        listData,
        isDeliveryNoteLoading,
        isDeliveryNotesLoading: isDeliveryNoteLoading, // alias cho UI
        apiParams
    };
};

const normalizeDeliveryNoteFilters = (values: Record<string, any>) => {
    const next = { ...values };
    if (next.exportedAtRange) {
        next.exportedAtFrom = next.exportedAtRange[0]?.toISOString();
        next.exportedAtTo = next.exportedAtRange[1]?.toISOString();
        delete next.exportedAtRange;
    }
    if (dayjs.isDayjs(next.exportedAtFrom)) {
        next.exportedAtFrom = next.exportedAtFrom.startOf('day').toISOString();
    }
    if (dayjs.isDayjs(next.exportedAtTo)) {
        next.exportedAtTo = next.exportedAtTo.endOf('day').toISOString();
    }
    return next;
};

export const useDeliveryNotesPage = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [expandedId, setExpandedId] = useState<string | number>();

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 25,
    });

    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });
    const logic = useDeliveryNotesLogic({ page, pageSize, filters });
    const filterSignature = JSON.stringify(filters);

    useEffect(() => {
        form.resetFields();
        form.setFieldsValue(filters);
    }, [filterSignature, form, filters]);

    const handleSearch = () => {
        applyFilters(normalizeDeliveryNoteFilters(form.getFieldsValue(true)));
    };

    const handleReset = () => {
        setExpandedId(undefined);
        clearFilters();
    };

    const syncFiltersToForm = () => {
        form.resetFields();
        form.setFieldsValue(filters);
    };

    const handleExpand = (expanded: boolean, record: any) => {
        setExpandedId(expanded ? record?.delivery_note?.id : undefined);
    };

    return {
        t,
        form,
        page,
        pageSize,
        setPage,
        setPageSize,
        filters,
        expandedId,
        ...logic,
        handleSearch,
        handleReset,
        syncFiltersToForm,
        handleExpand,
    };
};

export const useDeliveryNotesMobilePage = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [expandedId, setExpandedId] = useState<string | number>();
    const pageSize = 25;

    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });
    const filterSignature = JSON.stringify(filters);

    useEffect(() => {
        form.resetFields();
        form.setFieldsValue(filters);
    }, [filterSignature, form, filters]);

    const apiParams = useMemo(() => ({
        page: 0,
        size: pageSize,
        sort: 'exported_at:desc',
        ...normalizeDeliveryNoteFilters(filters),
    }), [filterSignature, filters]);

    const infiniteQuery = useDeliveryNotesInfiniteQuery(apiParams);
    const pages = infiniteQuery.data?.pages || [];
    const rows = pages.flatMap((page) => page.data || []);
    const firstPage = pages[0];

    const handleSearch = () => {
        setExpandedId(undefined);
        applyFilters(normalizeDeliveryNoteFilters(form.getFieldsValue(true)));
    };

    const handleReset = () => {
        setExpandedId(undefined);
        clearFilters();
    };

    const syncFiltersToForm = () => {
        form.resetFields();
        form.setFieldsValue(filters);
    };

    const handleExpand = (expanded: boolean, record: any) => {
        setExpandedId(expanded ? record?.delivery_note?.id : undefined);
    };

    return {
        t,
        form,
        page: 1,
        pageSize,
        setPage: () => undefined,
        setPageSize: () => undefined,
        filters,
        expandedId,
        listData: {
            data: rows,
            total: firstPage?.total || 0,
            pageSize: firstPage?.pageSize || pageSize,
            current: firstPage?.current || 0,
            totalPage: firstPage?.totalPage || 0,
        },
        isDeliveryNoteLoading: infiniteQuery.isLoading,
        isDeliveryNotesLoading: infiniteQuery.isLoading,
        isFetchingNextPage: infiniteQuery.isFetchingNextPage,
        hasNextPage: infiniteQuery.hasNextPage,
        fetchNextPage: infiniteQuery.fetchNextPage,
        apiParams,
        handleSearch,
        handleReset,
        syncFiltersToForm,
        handleExpand,
    };
};
