import { useMemo } from 'react';
import {
    useListWithdrawalSlipQuery,
    useWithdrawalSlipStatusesQuery,
    useBanksQuery,
} from '../useWithdrawalSlipHooks';

export interface UseWithdrawalSlipsLogicProps {
    page: number;
    pageSize: number;
    filters: Record<string, any>;
}

/**
 * Shared logic for Withdrawal Slips Page
 */
export const useWithdrawalSlipsLogic = ({ page, pageSize, filters }: UseWithdrawalSlipsLogicProps) => {
    // 1. Format params for API
    const apiParams = useMemo(() => {
        const params: Record<string, any> = {
            page: page - 1,
            size: pageSize,
            sort: 'createdAt:desc',
            ...filters,
        };
        if (Array.isArray(params.statuses)) {
            params.statuses = params.statuses.join(',');
        }
        return params;
    }, [page, pageSize, filters]);

    // 2. Fetch data
    const { data: listData, isLoading: isWithdrawalSlipLoading } = useListWithdrawalSlipQuery(apiParams);
    const { data: statusData } = useWithdrawalSlipStatusesQuery();
    const { data: banksData } = useBanksQuery();

    // 3. Derived State
    const statusOptions = useMemo(() => 
        (statusData || []).map((s: any) => ({ label: s.name, value: s.code }))
    , [statusData]);
    
    const bankOptions = useMemo(() => 
        (banksData || []).map((b: any) => ({ label: b.name, value: b.code }))
    , [banksData]);

    return {
        listData,
        isWithdrawalSlipLoading,
        isWithdrawalSlipsLoading: isWithdrawalSlipLoading, // alias cho UI
        statusData,
        banksData,
        statusOptions,
        bankOptions,
        apiParams
    };
};
