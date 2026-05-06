import { useMemo } from 'react';
import { useWishlistQuery, useDeleteWishlistItemMutation } from '../useWishlistHooks';

export interface UseWishlistLogicProps {
    page: number;
    pageSize: number;
    filters: Record<string, any>;
}

/**
 * Shared logic for Wishlist Page
 */
export const useWishlistLogic = ({ page, pageSize, filters }: UseWishlistLogicProps) => {
    // 1. Format params for API
    const apiParams = useMemo(() => {
        const params: Record<string, any> = {
            page: page - 1,
            size: pageSize,
            sort: 'createdAt:desc',
            ...filters,
        };
        if (params.dateRange) {
            params.createdFrom = params.dateRange[0]?.toISOString?.() ?? params.dateRange[0];
            params.createdTo   = params.dateRange[1]?.toISOString?.() ?? params.dateRange[1];
            delete params.dateRange;
        }
        return params;
    }, [page, pageSize, filters]);

    // 2. Fetch data
    const { data: wishlistData, isLoading: isWishlistLoading } = useWishlistQuery(apiParams);
    const deleteWishlistItemMutation = useDeleteWishlistItemMutation(apiParams);

    return {
        wishlistData,
        isWishlistLoading,
        deleteWishlistItemMutation,
        apiParams
    };
};
