import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { DeliveryNoteApi } from '@repo/api';

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

export const useDeliveryNotesQuery = (params: any) => {
    return useQuery({
        queryKey: ['delivery_notes.list', params],
        queryFn: async () => {
            const res = await DeliveryNoteApi.getDeliveryNotes(params);
            return normalizeListResponse(res);
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
