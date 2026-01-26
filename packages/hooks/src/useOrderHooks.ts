import { useQuery } from '@tanstack/react-query';
import { OrderApi } from '@repo/api';

export const useListOrderQuery = (params: any) => {
    return useQuery({
        queryKey: ['orders.list', params],
        queryFn: async () => {
            const res = await OrderApi.getOrders(params);
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

export const useOrderStatusesQuery = () => {
    return useQuery({
        queryKey: ['orders.statuses'],
        queryFn: async () => {
            const res = await OrderApi.getOrderStatuses();
            return res.data;
        },
    });
};

export const useOrderStatisticQuery = () => {
    return useQuery({
        queryKey: ['orders.statistic'],
        queryFn: async () => {
            const res = await OrderApi.getOrderStatistic();
            return res.data;
        },
    });
};

export const useWarehouseQuery = (delivered: boolean) => {
    return useQuery({
        queryKey: ['orders.warehouses', delivered],
        queryFn: async () => {
            const res = await OrderApi.getWarehouse(delivered);
            return res.data;
        },
    });
};

export const useOrderServicesQuery = () => {
    return useQuery({
        queryKey: ['orders.services'],
        queryFn: async () => {
            const res = await OrderApi.getOrderServices();
            return res.data;
        },
    });
};

export const useMarketplacesQuery = () => {
    return useQuery({
        queryKey: ['orders.marketplaces'],
        queryFn: async () => {
            const res = await OrderApi.getMarketplaces();
            return res.data;
        },
    });
};
