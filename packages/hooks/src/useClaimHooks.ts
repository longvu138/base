import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClaimApi } from '@repo/api';
import type { CreateClaimPayload } from '@repo/api';

const toNumber = (value: unknown, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeClaimListResponse = (res: any, pageParam = 0) => {
    const body = res?.data;
    const data = Array.isArray(body)
        ? body
        : Array.isArray(body?.data)
            ? body.data
            : Array.isArray(body?.items)
                ? body.items
                : Array.isArray(body?.content)
                    ? body.content
                    : [];
    const pageSize = toNumber(
        body?.pageSize ?? body?.size ?? body?.limit,
        toNumber(res?.headers?.['x-page-size'], data.length || 25),
    );
    const total = toNumber(
        body?.total ?? body?.totalElements ?? body?.totalCount,
        toNumber(res?.headers?.['x-total-count'], data.length),
    );

    return {
        data,
        total,
        pageSize,
        current: toNumber(
            body?.current ?? body?.page ?? body?.pageNumber ?? body?.number,
            toNumber(res?.headers?.['x-page-number'], pageParam),
        ),
        totalPage: toNumber(
            body?.totalPage ?? body?.totalPages ?? body?.pageCount,
            toNumber(
                res?.headers?.['x-page-count'],
                pageSize ? Math.ceil(total / pageSize) : 0,
            ),
        ),
    };
};

export const useListClaimQuery = (params: any) => {
    return useQuery({
        queryKey: ['claims.list', params],
        queryFn: async () => {
            const res = await ClaimApi.getClaims(params);
            return normalizeClaimListResponse(res, Number(params?.page || 0));
        },
        enabled: !!params,
    });
};

export const useClaimsInfiniteQuery = (params: any) => {
    return useInfiniteQuery({
        queryKey: ['claims.list.infinite', params],
        initialPageParam: 0,
        queryFn: async ({ pageParam = 0 }) => {
            const res = await ClaimApi.getClaims({
                ...params,
                page: Number(pageParam),
            });
            return normalizeClaimListResponse(res, Number(pageParam));
        },
        getNextPageParam: (lastPage, allPages) => {
            const loaded = allPages.reduce((sum, page) => sum + page.data.length, 0);
            if (!lastPage.data.length) return undefined;
            if (lastPage.total && loaded >= lastPage.total) return undefined;
            if (lastPage.pageSize && lastPage.data.length < lastPage.pageSize) return undefined;
            return allPages.length;
        },
        enabled: !!params,
    });
};

export const useClaimStatusesQuery = () => {
    return useQuery({
        queryKey: ['claims.statuses'],
        queryFn: async () => {
            const res = await ClaimApi.getClaimStatuses();
            return res.data as Array<{ id: number; code: string; name: string; color?: string }>;
        },
        staleTime: Infinity,
    });
};

export const useSolutionsQuery = (ticketTypes?: string[]) => {
    return useQuery({
        queryKey: ['claims.solutions', ticketTypes],
        queryFn: async () => {
            const res = await ClaimApi.getSolutions(ticketTypes);
            return res.data as Array<{ id: number; code: string; name: string }>;
        },
        staleTime: Infinity,
    });
};

export const useClaimReasonsQuery = (ticketType: string) => {
    return useQuery({
        queryKey: ['claims.reasons', ticketType],
        queryFn: async () => {
            const res = await ClaimApi.getReasons(ticketType);
            return res.data as Array<{ id: number; code: string; name: string }>;
        },
        enabled: !!ticketType,
        staleTime: Infinity,
    });
};

export const useClaimDetailQuery = (code?: string) => {
    return useQuery({
        queryKey: ['claims.detail', code],
        queryFn: async () => {
            const res = await ClaimApi.getClaimDetail(String(code));
            return res.data;
        },
        enabled: !!code,
        retry: false,
    });
};

export const useClaimHistoriesQuery = (code?: string) => {
    return useQuery({
        queryKey: ['claims.histories', code],
        queryFn: async () => {
            const res = await ClaimApi.getClaimHistories(String(code));
            return res.data;
        },
        enabled: !!code,
    });
};

export const useArchiveClaimMutation = (code?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => ClaimApi.archiveClaim(String(code)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['claims.detail', code] });
            queryClient.invalidateQueries({ queryKey: ['claims.list'] });
            queryClient.invalidateQueries({ queryKey: ['claims.list.infinite'] });
        },
    });
};

export const useUpdateClaimRatingMutation = (code?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: { rating: number; comment?: string }) =>
            ClaimApi.updateRating(String(code), payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['claims.detail', code] });
        },
    });
};

export const useOrderClaimsQuery = (orderCode: string) => {
    return useQuery({
        queryKey: ['claims.order', orderCode],
        queryFn: async () => {
            const res = await ClaimApi.getClaimsByOrder(orderCode);
            return res.data;
        },
        enabled: !!orderCode,
        retry: false,
    });
};

export const useCreateClaimMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { payload: CreateClaimPayload; files?: File[] }) => ClaimApi.createClaim(data),
        onSuccess: (_res, variables) => {
            queryClient.invalidateQueries({ queryKey: ['claims.list'] });
            queryClient.invalidateQueries({ queryKey: ['claims.order', variables.payload.relatedOrder] });
        },
    });
};
