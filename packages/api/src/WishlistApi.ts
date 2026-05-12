import { ApiClient } from "@repo/util"

export const WishlistApi = {
    getWishlist: (params: any) =>
        ApiClient.auth.get(`customer/wishlist`, { params }),
    addWishlistItem: (source: string, data: string | number) =>
        ApiClient.auth.post(`customer/wishlist`, null, {
            params: {
                source,
                data,
            },
        }),
    deleteWishlistItem: (id: string | number) =>
        ApiClient.auth.delete(`customer/wishlist/${id}`),
};
