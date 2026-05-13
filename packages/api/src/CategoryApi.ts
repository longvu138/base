import { ApiClient } from "@repo/util";

export const CategoryApi = {
    getCurrentExchangeRate: () => {
        return ApiClient.auth.get("customer/exchange_rates/current");
    },
    getNavigationMenus: () => {
        return ApiClient.auth.get("categories/navigation_menus");
    },
    getDepositQr: (amount: number | string) => {
        return ApiClient.auth.get(`customer/bank-accounts/deposit?amount=${amount}`);
    },
    getFees: () => {
        return ApiClient.auth.get("categories/fees");
    },
};
