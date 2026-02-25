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
};
