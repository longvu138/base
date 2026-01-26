import { useQuery } from '@tanstack/react-query';
import { ShipmentApi } from '@repo/api';

export const useListShipmentQuery = (params: any) => {
    return useQuery({
        queryKey: ['shipments.list', params],
        queryFn: async () => {
            const res = await ShipmentApi.getShipments(params);
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

export const useShipmentStatusesQuery = () => {
    return useQuery({
        queryKey: ['shipments.statuses'],
        queryFn: async () => {
            const res = await ShipmentApi.getShipmentStatuses();
            return res.data;
        },
    });
};

export const useShipmentStatisticQuery = () => {
    return useQuery({
        queryKey: ['shipments.statistic'],
        queryFn: async () => {
            const res = await ShipmentApi.getShipmentStatistic();
            return res.data;
        },
    });
};
