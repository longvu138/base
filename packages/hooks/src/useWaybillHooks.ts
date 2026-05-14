import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { WaybillApi } from '@repo/api';
import { notification } from 'antd';

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

const getErrorMessage = (error: any, fallback: string) =>
    error?.response?.data?.message || error?.response?.data?.title || fallback;

export const useCreateWaybillsMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => WaybillApi.createWaybills(data),
        onSuccess: () => {
            notification.success({ message: 'Tạo vận đơn thành công' });
            queryClient.invalidateQueries({ queryKey: ['waybills.list'] });
        },
        onError: (error: any) => {
            notification.error({
                message: getErrorMessage(error, 'Không thể tạo vận đơn'),
            });
        },
    });
};

export const useUpdateWaybillMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: any }) =>
            WaybillApi.updateWaybill(id, data),
        onSuccess: () => {
            notification.success({ message: 'Cập nhật vận đơn thành công' });
            queryClient.invalidateQueries({ queryKey: ['waybills.list'] });
        },
        onError: (error: any) => {
            notification.error({
                message: getErrorMessage(error, 'Không thể cập nhật vận đơn'),
            });
        },
    });
};

export const useDeleteWaybillMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (code: string) => WaybillApi.deleteWaybill(code),
        onSuccess: () => {
            notification.success({ message: 'Xóa vận đơn thành công' });
            queryClient.invalidateQueries({ queryKey: ['waybills.list'] });
        },
        onError: (error: any) => {
            notification.error({
                message: getErrorMessage(error, 'Không thể xóa vận đơn'),
            });
        },
    });
};

export const useExportWaybillsMutation = () => {
    return useMutation({
        mutationFn: ({ params, secret }: { params: any; secret: string }) =>
            WaybillApi.exportWaybills(params, { secret }),
        onError: (error: any) => {
            notification.error({
                message: getErrorMessage(error, 'Không thể xuất Excel'),
            });
        },
    });
};
