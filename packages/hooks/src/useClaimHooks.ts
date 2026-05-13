import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClaimApi } from '@repo/api';
import type { CreateClaimPayload } from '@repo/api';

export const useListClaimQuery = (params: any) => {
    return useQuery({
        queryKey: ['claims.list', params],
        queryFn: async () => {
            const res = await ClaimApi.getClaims(params);
            return {
                data: res.data,
                total: parseInt(res.headers['x-total-count'] || '0', 10),
                pageSize: parseInt(res.headers['x-page-size'] || '0', 10),
                current: parseInt(res.headers['x-page-number'] || '0', 10),
                totalPage: parseInt(res.headers['x-page-count'] || '0', 10),
            };
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
