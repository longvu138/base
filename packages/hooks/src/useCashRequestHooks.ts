import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export const useCreateCashRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => CashRequestApi.createCashRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash_requests.list"] });
    },
  });
};

export const useCancelCashRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => CashRequestApi.cancelCashRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash_requests.list"] });
    },
  });
};
