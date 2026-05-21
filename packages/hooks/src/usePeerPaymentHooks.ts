import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PeerPaymentApi } from "@repo/api";

export const usePeerPaymentsQuery = (params: Record<string, any>) =>
  useQuery({
    queryKey: ["peer-payments", params],
    queryFn: async () => {
      const res = await PeerPaymentApi.getPeerPayments(params);
      return res.data || [];
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peer-payments"] });
    },
  });
};
