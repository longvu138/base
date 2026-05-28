import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { WithdrawalSlipApi } from "@repo/api";

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getHeaderNumber = (headers: any, key: string, fallback = 0) =>
  toNumber(headers?.[key], fallback);

const normalizeWithdrawalSlipListResponse = (res: any, pageParam = 0) => {
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
    getHeaderNumber(res?.headers, "x-page-size", data.length || 20),
  );
  const total = toNumber(
    body?.total ?? body?.totalElements ?? body?.totalCount ?? body?.totalItems,
    getHeaderNumber(res?.headers, "x-total-count", data.length),
  );

  return {
    data,
    total,
    pageSize,
    current: toNumber(
      body?.current ?? body?.page ?? body?.pageNumber ?? body?.number,
      getHeaderNumber(res?.headers, "x-page-number", pageParam),
    ),
    totalPage: toNumber(
      body?.totalPage ?? body?.totalPages ?? body?.pageCount,
      getHeaderNumber(
        res?.headers,
        "x-page-count",
        pageSize ? Math.ceil(total / pageSize) : 0,
      ),
    ),
  };
};

export const useListWithdrawalSlipQuery = (params: any) => {
  return useQuery({
    queryKey: ["withdrawal_slip.list", params],
    queryFn: async () => {
      const res = await WithdrawalSlipApi.getWithdrawalSlips(params);
      return normalizeWithdrawalSlipListResponse(res, Number(params?.page || 0));
    },
    enabled: !!params,
  });
};

export const useWithdrawalSlipsInfiniteQuery = (params: any) => {
  return useInfiniteQuery({
    queryKey: ["withdrawal_slip.list.infinite", params],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const res = await WithdrawalSlipApi.getWithdrawalSlips({
        ...params,
        page: Number(pageParam),
      });
      return normalizeWithdrawalSlipListResponse(res, Number(pageParam));
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

export const useWithdrawalSlipStatusesQuery = () => {
  return useQuery({
    queryKey: ["withdrawal_slip.statuses"],
    queryFn: async () => {
      const res = await WithdrawalSlipApi.getStatuses();
      return res.data;
    },
    staleTime: Infinity,
  });
};

export const useWithdrawalSlipStatisticsQuery = () => {
  return useQuery({
    queryKey: ["withdrawal_slip.statistics"],
    queryFn: async () => {
      const res = await WithdrawalSlipApi.getStatistics();
      return res.data;
    },
    staleTime: 60000,
  });
};

export const useBanksQuery = () => {
  return useQuery({
    queryKey: ["categories.banks"],
    queryFn: async () => {
      const res = await WithdrawalSlipApi.getBanks();
      return res.data;
    },
    staleTime: Infinity,
  });
};

export const useCreateWithdrawalSlipMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await WithdrawalSlipApi.createWithdrawalSlip(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawal_slip.list"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawal_slip.list.infinite"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawal_slip.statistics"] });
      queryClient.invalidateQueries({ queryKey: ["customer.balance"] });
    },
  });
};

export const useCancelWithdrawalSlipMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const res = await WithdrawalSlipApi.cancelWithdrawalSlip(code);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawal_slip.list"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawal_slip.list.infinite"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawal_slip.statistics"] });
      queryClient.invalidateQueries({ queryKey: ["customer.balance"] });
    },
  });
};

export const useWithdrawalSlipLogsQuery = (code?: string) => {
  return useQuery({
    queryKey: ["withdrawal_slip.logs", code],
    queryFn: async () => {
      const res = await WithdrawalSlipApi.getWithdrawalSlipLogs(code as string);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!code,
  });
};
