import { useQuery } from '@tanstack/react-query';
import { DeliveryRequestApi } from '@repo/api';

export const useListDeliveryRequestQuery = (params: any) => {
    return useQuery({
        queryKey: ['delivery_requests.list', params],
        queryFn: async () => {
            const res = await DeliveryRequestApi.getDeliveryRequests(params);
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

export const useDeliveryRequestStatusesQuery = () => {
    return useQuery({
        queryKey: ['delivery_requests.statuses'],
        queryFn: async () => {
            const res = await DeliveryRequestApi.getDeliveryRequestStatuses();
            return res.data as Array<{ id: number; code: string; name: string; position: number; color?: string }>;
        },
        staleTime: Infinity,
    });
};
