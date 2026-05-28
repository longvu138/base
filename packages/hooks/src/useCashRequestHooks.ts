import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CashRequestApi } from "@repo/api";

const getCashRequestItems = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

const getCashRequestTotal = (listPayload: any, countHeaders: any) => {
  const total =
    countHeaders?.["x-count"] ??
    countHeaders?.["x-total-count"] ??
    listPayload?.total ??
    listPayload?.totalElements ??
    listPayload?.count;

  return Number(total ?? getCashRequestItems(listPayload).length ?? 0);
};

export const useCashRequestsQuery = (params: any) => {
  return useQuery({
    queryKey: ["cash_requests.list", params],
    queryFn: async () => {
      const [listRes, countRes] = await Promise.all([
        CashRequestApi.getCashRequests(params),
        CashRequestApi.getCashRequestsCount(params),
      ]);

      return {
        data: getCashRequestItems(listRes.data),
        total: getCashRequestTotal(listRes.data, countRes.headers),
      };
    },
    enabled: !!params,
  });
};

export const useCashRequestsInfiniteQuery = (params: any) => {
  return useInfiniteQuery({
    queryKey: ["cash_requests.list.infinite", params],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const requestParams = {
        ...params,
        offset: Number(pageParam),
      };
      const [listRes, countRes] = await Promise.all([
        CashRequestApi.getCashRequests(requestParams),
        CashRequestApi.getCashRequestsCount(requestParams),
      ]);
      const data = getCashRequestItems(listRes.data);
      const total = getCashRequestTotal(listRes.data, countRes.headers);
      const limit = Number(params?.limit || data.length || 25);

      return {
        data,
        total,
        pageSize: limit,
        current: Number(pageParam),
        totalPage: limit ? Math.ceil(total / limit) : 0,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, page) => sum + page.data.length, 0);
      if (!lastPage.data.length) return undefined;
      if (lastPage.total && loaded >= lastPage.total) return undefined;
      if (lastPage.pageSize && lastPage.data.length < lastPage.pageSize) return undefined;
      return allPages.length;
    },
    enabled: !!params,
  });
};

export const useCreateCashRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => CashRequestApi.createCashRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash_requests.list"] });
      queryClient.invalidateQueries({ queryKey: ["cash_requests.list.infinite"] });
    },
  });
};

export const useCancelCashRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => CashRequestApi.cancelCashRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash_requests.list"] });
      queryClient.invalidateQueries({ queryKey: ["cash_requests.list.infinite"] });
    },
  });
};
