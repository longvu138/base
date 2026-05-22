import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PeerPaymentApi } from "@repo/api";

export const usePeerPaymentsQuery = (params: Record<string, any>) =>
  useQuery({
    queryKey: ["peer-payments", params],
    queryFn: async () => {
      const res = await PeerPaymentApi.getPeerPayments(params);
      return res.data || [];
    },
  });

export const usePeerPaymentQuery = (code?: string) =>
  useQuery({
    queryKey: ["peer-payment", code],
    enabled: !!code,
    retry: false,
    queryFn: async () => {
      const res = await PeerPaymentApi.getPeerPayment(code || "");
      return res.data || {};
    },
  });

export const usePeerPaymentStatusesQuery = () =>
  useQuery({
    queryKey: ["peer-payment-statuses"],
    queryFn: async () => {
      const res = await PeerPaymentApi.getPaymentStatuses();
      return res.data || [];
    },
  });

export const usePeerPaymentMethodsQuery = () =>
  useQuery({
    queryKey: ["peer-payment-methods"],
    queryFn: async () => {
      const res = await PeerPaymentApi.getPaymentMethods();
      return res.data || [];
    },
  });

export const usePeerPaymentAccountsQuery = (
  params?: Record<string, any>,
  enabled = true,
) =>
  useQuery({
    queryKey: ["peer-payment-accounts", params],
    enabled,
    queryFn: async () => {
      const res = await PeerPaymentApi.getPaymentAccounts(params);
      return res.data || [];
    },
  });

export const usePeerPaymentTenantConfigQuery = () =>
  useQuery({
    queryKey: ["peer-payment-tenant-config"],
    queryFn: async () => {
      const res = await PeerPaymentApi.getTenantConfigPayment();
      return res.data || {};
    },
  });

export const usePeerPaymentOriginalReceiptsQuery = (code?: string) =>
  useQuery({
    queryKey: ["peer-payment-original-receipts", code],
    enabled: !!code,
    queryFn: async () => {
      const res = await PeerPaymentApi.getOriginalReceipts(code || "");
      return res.data || [];
    },
  });

export const usePeerPaymentFeesQuery = (params?: Record<string, any>) =>
  useQuery({
    queryKey: ["peer-payment-fees", params],
    queryFn: async () => {
      const res = await PeerPaymentApi.getPeerPaymentFees(params);
      return res.data || [];
    },
  });

export const usePeerPaymentDailySummaryQuery = () =>
  useQuery({
    queryKey: ["peer-payment-daily-summary"],
    queryFn: async () => {
      const res = await PeerPaymentApi.getDailySummary();
      return res.data || [];
    },
  });

export const usePeerPaymentMarkupRateGroupsQuery = () =>
  useQuery({
    queryKey: ["peer-payment-markup-rate-groups"],
    queryFn: async () => {
      const res = await PeerPaymentApi.getMarkupRateGroups();
      return res.data || {};
    },
  });

export const usePeerPaymentExchangeRatesBatchQuery = (
  data: Array<Record<string, any>>,
) =>
  useQuery({
    queryKey: ["peer-payment-exchange-rates-batch", data],
    queryFn: async () => {
      const res = await PeerPaymentApi.getExchangeRatesBatch(data);
      return res.data || [];
    },
  });

export const usePeerPaymentExchangeRateMutation = () =>
  useMutation({
    mutationFn: async (params: Record<string, any>) => {
      const res = await PeerPaymentApi.getExchangeRate(params);
      return res.data || {};
    },
  });

export const usePeerPaymentFinancialsQuery = (code?: string) =>
  useQuery({
    queryKey: ["peer-payment-financials", code],
    enabled: !!code,
    queryFn: async () => {
      const res = await PeerPaymentApi.getFinancials(code || "");
      return res.data || [];
    },
  });

export const usePeerPaymentMilestonesQuery = (code?: string) =>
  useQuery({
    queryKey: ["peer-payment-milestones", code],
    enabled: !!code,
    queryFn: async () => {
      const res = await PeerPaymentApi.getMilestones(code || "");
      return res.data || [];
    },
  });

export const usePeerPaymentLogsQuery = (code?: string) =>
  useQuery({
    queryKey: ["peer-payment-logs", code],
    enabled: !!code,
    queryFn: async () => {
      const res = await PeerPaymentApi.getLogs(code || "", {
        page: 0,
        size: 25,
        sort: "timestamp:desc",
      });
      return res.data || [];
    },
  });

export const usePeerPaymentLogsInfiniteQuery = (code?: string) => {
  const size = 25;
  return useInfiniteQuery({
    queryKey: ["peer-payment-logs-infinite", code],
    initialPageParam: 0,
    enabled: !!code,
    retry: false,
    queryFn: async ({ pageParam = 0 }) => {
      const res = await PeerPaymentApi.getLogs(code || "", {
        sort: "timestamp:desc",
        limit: size + 1,
        offset: Number(pageParam) * size,
      });
      const data = res.data || [];
      return {
        data: data.slice(0, size),
        page: Number(pageParam),
        hasNextPage: data.length > size,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
  });
};

export const usePeerPaymentDetailFeesQuery = (code?: string) =>
  useQuery({
    queryKey: ["peer-payment-detail-fees", code],
    enabled: !!code,
    queryFn: async () => {
      const res = await PeerPaymentApi.getDetailFees(code || "");
      return res.data || [];
    },
  });

export const usePeerPaymentFinancialTypesQuery = () =>
  useQuery({
    queryKey: ["peer-payment-financial-types"],
    queryFn: async () => {
      const res = await PeerPaymentApi.getFinancialTypes();
      return res.data || [];
    },
  });

export const usePeerPaymentExchangeRatesBatchMutation = () =>
  useMutation({
    mutationFn: async (data: Array<Record<string, any>>) => {
      const res = await PeerPaymentApi.getExchangeRatesBatch(data);
      return res.data || [];
    },
  });

export const useExportPeerPaymentsMutation = () =>
  useMutation({
    mutationFn: ({ params, data }: { params: Record<string, any>; data: { pin?: string; secret?: string } }) =>
      PeerPaymentApi.exportPeerPayments(params, data),
  });

export const useCreateRequestForPayMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => PeerPaymentApi.createRequestForPay(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["peer-payments"] }),
  });
};

export const useAskForPayMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => PeerPaymentApi.askForPay(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["peer-payments"] }),
  });
};

export const useCreatePayAnInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => PeerPaymentApi.createPayAnInvoice(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["peer-payments"] }),
  });
};

export const useAskToPayAnInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => PeerPaymentApi.askToPayAnInvoice(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["peer-payments"] }),
  });
};

export const usePeerPaymentQuotationMutation = () =>
  useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await PeerPaymentApi.getPaymentQuotation(data);
      return res.data || {};
    },
  });

export const useBetterOfferMutation = () =>
  useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await PeerPaymentApi.getBetterOffer(data);
      return res.data || {};
    },
  });

export const usePlaceOrderBetterOfferMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => PeerPaymentApi.placeOrderBetterOffer(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["peer-payments"] }),
  });
};

export const useUploadPeerPaymentQrCodeMutation = () =>
  useMutation({
    mutationFn: async (file: File) => {
      const res = await PeerPaymentApi.uploadQrCodeImage(file);
      return res.data || {};
    },
  });

export const useCreatePeerPaymentTransferMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => PeerPaymentApi.createPeerPaymentTransfer(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["peer-payments"] }),
  });
};

export const useChargePeerPaymentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => PeerPaymentApi.chargeRequest(code),
    onSuccess: (_res, code) => {
      queryClient.invalidateQueries({ queryKey: ["peer-payments"] });
      queryClient.invalidateQueries({ queryKey: ["peer-payment", code] });
    },
  });
};

export const useCancelPeerPaymentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => PeerPaymentApi.cancelPeerPayment(code),
    onSuccess: (_res, code) => {
      queryClient.invalidateQueries({ queryKey: ["peer-payments"] });
      queryClient.invalidateQueries({ queryKey: ["peer-payment", code] });
    },
  });
};

export const useAddPeerPaymentOriginalReceiptMutation = (code?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) =>
      PeerPaymentApi.addOriginalReceipt(code || "", data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["peer-payment-original-receipts", code],
      });
    },
  });
};

export const useDeletePeerPaymentOriginalReceiptsMutation = (code?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listCodes: string[]) =>
      PeerPaymentApi.deleteOriginalReceipts(code || "", listCodes),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["peer-payment-original-receipts", code],
      });
    },
  });
};
