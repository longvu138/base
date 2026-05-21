import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CashRequestApi } from "@repo/api";

export const useCashRequestsQuery = (params: any) => {
  return useQuery({
    queryKey: ["cash_requests.list", params],
    queryFn: async () => {
      const [listRes, countRes] = await Promise.all([
        CashRequestApi.getCashRequests(params),
        CashRequestApi.getCashRequestsCount(params),
      ]);

      return {
        data: listRes.data?.data || listRes.data || [],
        total: Number(countRes.headers["x-count"] || 0),
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
