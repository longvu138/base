import { useMemo } from 'react';
import { useVouchersQuery } from '../useVoucherHooks';

export interface UseVouchersLogicProps {
    page: number;
    pageSize: number;
    filters: Record<string, any>;
}

/**
 * Shared logic for Vouchers Page
 */
export const useVouchersLogic = ({ page, pageSize, filters }: UseVouchersLogicProps) => {
    // 1. Format params for API
    const apiParams = useMemo(() => {
        const params: Record<string, any> = {
            page: page - 1,
            size: pageSize,
            ...filters,
        };

        if (params.dateRange) {
            params.createdAtFrom = params.dateRange[0]?.toISOString?.() ?? params.dateRange[0];
            params.createdAtTo = params.dateRange[1]?.toISOString?.() ?? params.dateRange[1];
            delete params.dateRange;
        }

        return params;
    }, [page, pageSize, filters]);

    // 2. Fetch data
    const { data: vouchersData, isLoading: isVouchersLoading } = useVouchersQuery(apiParams);

    return {
        vouchersData,
        isVouchersLoading,
        // Aliases for compatibility
        listData: vouchersData,
        isListLoading: isVouchersLoading,
        apiParams
    };
};
