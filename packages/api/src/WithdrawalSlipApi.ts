import { ApiClient } from "@repo/util";

export const WithdrawalSlipApi = {
    getWithdrawalSlips: (params: any) => {
        return ApiClient.auth.get(`customer/withdrawal_slip`, { params });
    },
    getStatistics: () => {
        return ApiClient.auth.get(`customer/withdrawal_slip/statistics`);
    },
    getStatuses: () => {
        return ApiClient.auth.get(`categories/withdrawal_slip_public_status`);
    },
    getBanks: () => {
        return ApiClient.auth.get(`categories/banks`);
    },
};
