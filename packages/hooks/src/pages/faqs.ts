import { useMemo } from 'react';
import { useFaqsQuery } from '../useFaqHooks';

export interface UseFaqsLogicProps {
    page: number;
    pageSize: number;
    filters: Record<string, any>;
}

/**
 * Shared logic for FAQs Page
 */
export const useFaqsLogic = ({ page, pageSize, filters }: UseFaqsLogicProps) => {
    // 1. Format params for API
    const apiParams = useMemo(() => {
        const params: Record<string, any> = {
            page: page - 1,
            size: pageSize,
            sort: 'position:asc',
            ...filters,
        };

        return params;
    }, [page, pageSize, filters]);

    // 2. Fetch data
    const { data: faqsData, isLoading: isFaqsLoading } = useFaqsQuery(apiParams);

    return {
        faqsData,
        isFaqsLoading,
        // Aliases for compatibility
        listData: faqsData,
        isListLoading: isFaqsLoading,
        apiParams
    };
};
