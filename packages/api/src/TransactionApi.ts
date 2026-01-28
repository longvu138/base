import { apiClientAuth } from '@repo/util';

export const TransactionApi = {
    getWalletAccounts: () => {
        return apiClientAuth.get('/customer/wallet/accounts');
    },

    getTransactions: (accountId: string, params?: any) => {
        return apiClientAuth.get(`/customer/wallet/accounts/${accountId}/transactions`, { params });
    },

    getTransactionTypes: () => {
        return apiClientAuth.get('/categories/financial_types', {
            params: { size: 1000 }
        });
    },

    exportTransactions: (accountId: string, params?: any) => {
        return apiClientAuth.get(`/customer/wallet/accounts/${accountId}/transactions/export`, {
            params,
            responseType: 'blob'
        });
    },
};
