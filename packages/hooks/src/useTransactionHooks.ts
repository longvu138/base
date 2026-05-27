import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { TransactionApi } from '@repo/api';

const toNumber = (value: unknown, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const getHeaderNumber = (headers: any, key: string, fallback = 0) =>
    toNumber(headers?.[key], fallback);

const normalizeTransactionListResponse = (res: any, pageParam = 0) => {
    const body = res?.data;
    const data = Array.isArray(body)
        ? body
        : Array.isArray(body?.data)
            ? body.data
            : Array.isArray(body?.items)
                ? body.items
                : Array.isArray(body?.content)
                    ? body.content
                    : Array.isArray(body?.result)
                        ? body.result
                        : [];
    const pageSize = toNumber(
        body?.pageSize ?? body?.size ?? body?.limit,
        getHeaderNumber(res?.headers, 'x-page-size', data.length || 20),
    );
    const total = toNumber(
        body?.total ?? body?.totalElements ?? body?.totalCount ?? body?.totalItems,
        getHeaderNumber(res?.headers, 'x-total-count', data.length),
    );

    return {
        data,
        total,
        pageSize,
        current: toNumber(
            body?.current ?? body?.page ?? body?.pageNumber ?? body?.number,
            getHeaderNumber(res?.headers, 'x-page-number', pageParam),
        ),
        totalPage: toNumber(
            body?.totalPage ?? body?.totalPages ?? body?.pageCount,
            getHeaderNumber(
                res?.headers,
                'x-page-count',
                pageSize ? Math.ceil(total / pageSize) : 0,
            ),
        ),
    };
};

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
            return normalizeTransactionListResponse(res, Number(params?.page || 0));
        },
        enabled: !!accountId && !!params,
    });
};

export const useListTransactionInfiniteQuery = (accountId: string | undefined, params: any) => {
    return useInfiniteQuery({
        queryKey: ['transactions.list.infinite', accountId, params],
        initialPageParam: 0,
        queryFn: async ({ pageParam = 0 }) => {
            if (!accountId) {
                return { data: [], total: 0, pageSize: 0, current: 0, totalPage: 0 };
            }

            const res = await TransactionApi.getTransactions(accountId, {
                ...params,
                page: Number(pageParam),
            });
            return normalizeTransactionListResponse(res, Number(pageParam));
        },
        getNextPageParam: (lastPage, allPages) => {
            const loaded = allPages.reduce((sum, page) => sum + page.data.length, 0);
            if (!lastPage.data.length) return undefined;
            if (lastPage.total && loaded >= lastPage.total) return undefined;
            if (lastPage.pageSize && lastPage.data.length < lastPage.pageSize) return undefined;
            return allPages.length;
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
