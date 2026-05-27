import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { DeliveryNoteApi } from '@repo/api';

export const useDeliveryNotesQuery = (params: any) => {
    return useQuery({
        queryKey: ['delivery_notes.list', params],
        queryFn: async () => {
            const res = await DeliveryNoteApi.getDeliveryNotes(params);
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

export const useDeliveryNotesInfiniteQuery = (params: any) => {
    return useInfiniteQuery({
        queryKey: ['delivery_notes.list.infinite', params],
        initialPageParam: 0,
        queryFn: async ({ pageParam = 0 }) => {
            const res = await DeliveryNoteApi.getDeliveryNotes({
                ...params,
                page: Number(pageParam),
            });
            return {
                data: res.data,
                total: parseInt(res.headers['x-total-count'] || '0', 10),
                pageSize: parseInt(res.headers['x-page-size'] || '0', 10),
                current: parseInt(res.headers['x-page-number'] || String(pageParam), 10),
                totalPage: parseInt(res.headers['x-page-count'] || '0', 10),
            };
        },
        getNextPageParam: (lastPage) => {
            const nextPage = lastPage.current + 1;
            return nextPage < lastPage.totalPage ? nextPage : undefined;
        },
        enabled: !!params,
    });
};
