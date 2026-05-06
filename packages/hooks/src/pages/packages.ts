import { useMemo } from 'react';
import {
    usePackagesQuery,
    usePackageStatusesQuery,
} from '../usePackageHooks';

export interface UsePackagesLogicProps {
    page: number;
    pageSize: number;
    filters: Record<string, any>;
}

/**
 * Shared logic for Packages Page
 */
export const usePackagesLogic = ({ page, pageSize, filters }: UsePackagesLogicProps) => {
    // 1. Format params for API
    const apiParams = useMemo(() => {
        const params: Record<string, any> = {
            page: page - 1,
            size: pageSize,
            sort: 'createdAt:desc',
            ...filters,
        };

        // Handle date range
        if (filters.createdFromTo) {
            params.createdFrom = filters.createdFromTo[0]?.toISOString();
            params.createdTo = filters.createdFromTo[1]?.toISOString();
            delete params.createdFromTo;
        }

        // Handle array status
        if (Array.isArray(params.statuses)) {
            params.statuses = params.statuses.join(',');
        }

        return params;
    }, [page, pageSize, filters]);

    // 2. Fetch data
    const { data: packageData, isLoading: isPackageLoading } = usePackagesQuery(apiParams);
    const { data: statusData } = usePackageStatusesQuery();

    // 3. Derived State
    const statusOptions = useMemo(
        () => (statusData || []).map((s: any) => ({ label: s.name, value: s.code })),
        [statusData],
    );

    return {
        packageData,
        listData: packageData, // alias cho Style3
        isPackageLoading,
        isPackagesLoading: isPackageLoading, // alias cho Style3
        statusData,
        statusOptions,
        apiParams
    };
};
