import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WishlistApi } from '@repo/api';

export const useWishlistQuery = (params: any) => {
    return useQuery({
        queryKey: ['wishlist.list', params],
        queryFn: async () => {
            const res = await WishlistApi.getWishlist(params);
            return {
                data: res.data as any[],
                total: parseInt(res.headers['x-total-count'] || '0', 10),
            };
        },
    });
};

export const useDeleteWishlistItemMutation = (queryParams: any) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string | number) => WishlistApi.deleteWishlistItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist.list', queryParams] });
        },
    });
};
