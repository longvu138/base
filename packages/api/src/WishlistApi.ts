import { ApiClient } from "@repo/util"

export const WishlistApi = {
    getWishlist: (params: any) =>
        ApiClient.auth.get(`customer/wishlist`, { params }),
    deleteWishlistItem: (id: string | number) =>
        ApiClient.auth.delete(`customer/wishlist/${id}`),
};
