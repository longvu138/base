import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DeliveryRequestApi } from '@repo/api';
import { notification } from 'antd';

export const useAvailableDeliveryOrdersQuery = () => {
    return useQuery({
        queryKey: ['delivery_requests.available_orders'],
        queryFn: async () => {
            const res = await DeliveryRequestApi.getAvailableOrders();
            return res.data || [];
        },
    });
};

export const useShippingMethodsQuery = () => {
    return useQuery({
        queryKey: ['delivery_requests.shipping_methods'],
        queryFn: async () => {
            const res = await DeliveryRequestApi.getShippingMethods();
            return res.data || [];
        },
    });
};

export const useCreateDeliveryRequestMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => DeliveryRequestApi.createDeliveryRequest(data),
        onSuccess: () => {
            notification.success({ message: 'Tạo yêu cầu giao thành công' });
            queryClient.invalidateQueries({ queryKey: ['delivery_requests.available_orders'] });
            queryClient.invalidateQueries({ queryKey: ['delivery_requests.list'] });
            queryClient.invalidateQueries({ queryKey: ['orders.statistic'] });
        },
        onError: (error: any) => {
            notification.error({
                message:
                    error?.response?.data?.message ||
                    error?.response?.data?.title ||
                    'Không thể tạo yêu cầu giao',
            });
        },
    });
};

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
