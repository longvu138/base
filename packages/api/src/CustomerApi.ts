import { ApiClient, LocalStoreUtil } from "@repo/util"

export const CustomerApi = {
    getProfile: () => {
        return ApiClient.auth.get("customer/profile");
    },
    getBalance: () => {
        return ApiClient.auth.get("customer/profile/balance");
    },
    updateProfile: (payload: any) => {
        return ApiClient.auth.patch("customer/profile", payload);
    },
    updatePreferredServices: (serviceCodes: string[]) => {
        return ApiClient.auth.patch("customer/profile/preferred_services", serviceCodes);
    },
    changePassword: (payload: any) => {
        return ApiClient.auth.post("customer/profile/change_password", payload);
    },
    changePin: (payload: any) => {
        return ApiClient.auth.post("customer/profile/change_pin", payload);
    },
    recoverPin: (payload: any) => {
        return ApiClient.auth.post("customer/profile/recover_pin", payload);
    },
    getCustomerLevels: () => {
        return ApiClient.auth.get("customer/customer_level");
    },
    getRewardPointTransactions: (params: any) => {
        return ApiClient.auth.get("customer/reward_point/transaction", { params });
    },
    getPurchasingAccounts: () => {
        return ApiClient.auth.get("customer/purchasing_accounts", {
            params: { size: 200, sort: "createdAt:desc" },
        });
    },
    getCustomerDiscount: () => {
        return ApiClient.auth.get("customer/customer_discount");
    },
    getTotalSkusInCart: () => {
        return ApiClient.auth.get("customer/cart/statistics");
    },
    getCartItems: (params: { page?: number; size?: number } = {}) => {
        return ApiClient.auth.get("customer/cart", {
            params: {
                page: params.page ?? 0,
                size: params.size ?? 5,
                sort: "modifiedAt:desc",
            },
        });
    },
    updateCartSku: (id: string, payload: any) => {
        return ApiClient.auth.patch(`customer/skus/${id}`, payload);
    },
    deleteCartSku: (id: string) => {
        return ApiClient.auth.delete(`customer/skus/${id}`);
    },
    deleteCartSkus: (ids: string[]) => {
        return ApiClient.auth.delete(`customer/skus?skus=${ids.join(",")}`);
    },
    deleteCartGroup: (id: string) => {
        return ApiClient.auth.delete(`customer/cart/${id}`);
    },
    updateCartGroup: (id: string, payload: any) => {
        return ApiClient.auth.patch(`customer/cart/${id}`, payload);
    },
    deleteAllCart: () => {
        return ApiClient.auth.delete("customer/cart/delete_all");
    },
    updateCartServices: (id: string, serviceCodes: string[]) => {
        return ApiClient.auth.post(`customer/cart/${id}/services`, serviceCodes);
    },
    getCartFees: (id: string) => {
        return ApiClient.auth.get(`customer/cart/${id}/fees`);
    },
    importCartProducts: (file: File) => {
        const formData = new FormData();
        formData.append("attachments", new Blob([file]), file.name);
        return ApiClient.auth.post("customer/cart/products/import_excel", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
    createCartProduct: (payload: any, images: File[]) => {
        const formData = new FormData();
        images.forEach((file) => {
            formData.append("attachments", new Blob([file]), file.name);
        });
        formData.append(
            "command",
            new Blob([JSON.stringify(payload)], { type: "application/json" }),
        );
        return ApiClient.auth.post("customer/cart/products", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
    fetchTaobaoProduct: (itemId: string) => {
        return ApiClient.auth.get(`customer/taobao/fetch_global_product?itemId=${itemId}`);
    },
    fetchAlibabaProduct: (itemId: string) => {
        return ApiClient.auth.get(`customer/alibaba/fetch_global_product?itemId=${itemId}`);
    },
    resolveMarketplaceShortLink: (marketplace: "taobao" | "alibaba", shortLink: string) => {
        return ApiClient.auth.get(`customer/${marketplace}/get-link?shortLink=${shortLink}`);
    },
    addCartSkus: (payload: any) => {
        return ApiClient.auth.post("customer/cart/skus", payload);
    },
    createDraftOrder: (payload: { skus: string[] }) => {
        return ApiClient.auth.post("customer/draft_orders", payload);
    },
    getDraftOrder: (id: string) => {
        return ApiClient.auth.get(`customer/draft_orders/${id}`);
    },
    updateDraftOrder: (id: string, payload: any) => {
        return ApiClient.auth.patch(`customer/draft_orders/${id}`, payload);
    },
    applyDraftOrderCoupon: (id: string, payload: { couponCode?: string }) => {
        return ApiClient.auth.post(`customer/draft_orders/${id}/apply_coupon`, payload);
    },
    checkShoppingCartLoanable: (payload: any) => {
        return ApiClient.auth.post("customer/third-parties/shopkeeper/create", payload);
    },
    getConnectedToBiffin: () => {
        return ApiClient.auth.get("customer/third-parties/shopkeeper");
    },
    createCustomerOrder: (payload: any) => {
        const pinToken = LocalStoreUtil.getItem("pinToken") || "";
        const headers: Record<string, any> = {};
        const { password, savePassword, ...body } = payload || {};

        if (pinToken) {
            headers["X-PIN-TOKEN"] = pinToken;
        } else if (password) {
            headers["X-PIN"] = password;
            if (savePassword) {
                headers["X-REMEMBER-PIN"] = true;
            }
        }

        return ApiClient.auth.post("customer/orders", body, { headers });
    },
    trackAddToCart: () => {
        return ApiClient.auth.post("tenants/current/tracking-add-to-cart");
    },
    getArticles: () => {
        return ApiClient.auth.get("customer/article");
    },
    register: (payload: any) => {
        return ApiClient.noAuth.post("api/customer/profile/register", payload);
    },
};
