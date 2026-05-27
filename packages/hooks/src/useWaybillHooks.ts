import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { WaybillApi } from '@repo/api';
import { notification } from 'antd';

const toNumber = (value: unknown, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const getHeaderNumber = (headers: any, key: string, fallback = 0) => {
    return toNumber(headers?.[key], fallback);
};

const normalizeListResponse = (res: any, pageParam = 0) => {
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
        getHeaderNumber(res?.headers, 'x-page-size', data.length || 25),
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

export const useWaybillsQuery = (params: any) => {
    return useQuery({
        queryKey: ['waybills.list', params],
        queryFn: async () => {
            const res = await WaybillApi.getWaybills(params);
            return normalizeListResponse(res);
        },
        enabled: !!params,
    });
};

export const useWaybillsInfiniteQuery = (params: any) => {
    return useInfiniteQuery({
        queryKey: ['waybills.list.infinite', params],
        initialPageParam: 0,
        queryFn: async ({ pageParam = 0 }) => {
            const res = await WaybillApi.getWaybills({
                ...params,
                page: Number(pageParam),
            });
            return normalizeListResponse(res, Number(pageParam));
        },
        getNextPageParam: (lastPage, allPages) => {
            const loaded = allPages.reduce((sum, page) => sum + page.data.length, 0);
            if (!lastPage.data.length) return undefined;
            if (lastPage.total && loaded >= lastPage.total) return undefined;
            if (lastPage.pageSize && lastPage.data.length < lastPage.pageSize) {
                return undefined;
            }
            return allPages.length;
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
