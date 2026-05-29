import { ApiClient } from "@repo/util";

export const WithdrawalSlipApi = {
    getWithdrawalSlips: (params: any) => {
        return ApiClient.auth.get(`customer/withdrawal_slip`, { params });
    },
    createWithdrawalSlip: (payload: any) => {
        return ApiClient.auth.post(`customer/withdrawal_slip`, payload);
    },
    cancelWithdrawalSlip: (code: string) => {
        return ApiClient.auth.post(`customer/withdrawal_slip/${code}/cancel`);
    },
    getWithdrawalSlipLogs: (code: string) => {
        return ApiClient.auth.get(`customer/withdrawal_slip/${code}/logs`, {
            params: { sort: 'timestamp:desc' },
        });
    },
    getStatistics: () => {
        return ApiClient.auth.get(`customer/withdrawal_slip/statistics`);
    },
    getStatuses: () => {
        return ApiClient.auth.get(`categories/withdrawal_slip_public_status`);
    },
    getBanks: () => {
        return ApiClient.auth.get(`categories/banks?size=1000`);
    },
};
