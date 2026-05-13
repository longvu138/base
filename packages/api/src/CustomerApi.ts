import { ApiClient } from "@repo/util"

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
    getCartItems: () => {
        return ApiClient.auth.get("customer/cart?page=0&size=9999&sort=modifiedAt:desc");
    },
    getThirdPartyLoans: (orderCodes: string) => {
        return ApiClient.auth.get("customer/third-parties/shopkeeper/loans", {
            params: { orderCodes },
        });
    },
    register: (payload: any) => {
        return ApiClient.noAuth.post("api/customer/profile/register", payload);
    },
};
