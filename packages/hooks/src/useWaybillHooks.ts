import { useQuery } from '@tanstack/react-query';
import { WaybillApi } from '@repo/api';

export const useWaybillsQuery = (params: any) => {
    return useQuery({
        queryKey: ['waybills.list', params],
        queryFn: async () => {
            const res = await WaybillApi.getWaybills(params);
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

export const useWaybillStatusesQuery = () => {
    return useQuery({
        queryKey: ['waybills.statuses'],
        queryFn: async () => {
            const res = await WaybillApi.getWaybillStatuses();
            return res.data as Array<{ id: number; code: string; name: string; position: number; color?: string }>;
        },
        staleTime: Infinity,
    });
};
