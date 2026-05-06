import { useMemo } from 'react';
import {
    useListClaimQuery,
    useClaimStatusesQuery,
    useSolutionsQuery,
} from '../useClaimHooks';

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
        // Convert arrays to comma strings for API
        ['publicStates', 'ticketTypes', 'solutionCodes'].forEach(key => {
            if (Array.isArray(params[key])) {
                params[key] = params[key].join(',');
            }
        });
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
