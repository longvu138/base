import { useQuery } from '@tanstack/react-query';
import { TransactionApi } from '@repo/api';

export const useWalletAccountsQuery = () => {
    return useQuery({
        queryKey: ['wallet.accounts'],
        queryFn: async () => {
            const res = await TransactionApi.getWalletAccounts();
            return res.data;
        },
    });
};

export const useListTransactionQuery = (accountId: string | undefined, params: any) => {
    return useQuery({
        queryKey: ['transactions.list', accountId, params],
        queryFn: async () => {
            if (!accountId) {
                return { data: [], total: 0, pageSize: 0, current: 0, totalPage: 0 };
            }
            const res = await TransactionApi.getTransactions(accountId, params);

            // Try to get total from headers first, then fallback to response body
            const total = res.headers['x-total-count']
                ? parseInt(res.headers['x-total-count'], 10)
                : (res.data?.totalElements || res.data?.length || 0);

            return {
                data: res.data?.content || res.data || [],
                total: total,
                pageSize: parseInt(res.headers['x-page-size'] || params.size || '20', 10),
                current: parseInt(res.headers['x-page-number'] || params.page || '0', 10),
                totalPage: parseInt(res.headers['x-page-count'] || '0', 10),
            };
        },
        enabled: !!accountId && !!params,
    });
};

export const useTransactionTypesQuery = () => {
    return useQuery({
        queryKey: ['transactions.types'],
        queryFn: async () => {
            const res = await TransactionApi.getTransactionTypes();
            return res.data;
        },
    });
};
