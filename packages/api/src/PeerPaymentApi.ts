import { ApiClient, appConfig, LocalStoreUtil } from "@repo/util";

const trimTrailingSlash = (value?: string) =>
  String(value || "").replace(/\/+$/, "");

const clarkBaseUrl = (path: string) => {
  const paymentApi = trimTrailingSlash(appConfig.apiPayment);
  return paymentApi && !paymentApi.startsWith("undefined")
    ? `${paymentApi}/clark/${path.replace(/^\/+/, "")}`
    : `clark/${path.replace(/^\/+/, "")}`;
};

const johnBaseUrl = (path: string) => {
  const paymentApi = trimTrailingSlash(appConfig.apiPayment);
  return paymentApi && !paymentApi.startsWith("undefined")
    ? `${paymentApi}/john/${path.replace(/^\/+/, "")}`
    : `john/${path.replace(/^\/+/, "")}`;
};

const barryBaseUrl = (path: string) => {
  const paymentApi = trimTrailingSlash(appConfig.apiPayment);
  return paymentApi && !paymentApi.startsWith("undefined")
    ? `${paymentApi}/barry/${path.replace(/^\/+/, "")}`
    : `barry/${path.replace(/^\/+/, "")}`;
};

const currentTenantCode = () => {
  const currentProjectInfo = LocalStoreUtil.getJson("currentProjectInfo") || {};
  return (
    currentProjectInfo.code ||
    currentProjectInfo.id ||
    appConfig.tenant
  );
};

const tenantHeaders = () => {
  const tenantCode = currentTenantCode();
  return tenantCode ? { "X-Tenant": tenantCode } : undefined;
};

export const PeerPaymentApi = {
  getPeerPayments: (params: Record<string, any>) =>
    ApiClient.auth.get(clarkBaseUrl("payment/peer_payments"), {
      params,
      headers: tenantHeaders(),
    }),

  getPeerPayment: (code: string) =>
    ApiClient.auth.get(clarkBaseUrl(`payment/peer_payments/${code}`), {
      headers: tenantHeaders(),
    }),

  cancelPeerPayment: (code: string) =>
    ApiClient.auth.post(clarkBaseUrl(`payment/peer_payments/${code}/cancel`), undefined, {
      headers: tenantHeaders(),
    }),

  getOriginalReceipts: (code: string) =>
    ApiClient.auth.get(clarkBaseUrl(`payment/peer_payments/${code}/original_receipts`), {
      headers: tenantHeaders(),
    }),

  addOriginalReceipt: (code: string, data: Record<string, any>) =>
    ApiClient.auth.post(clarkBaseUrl(`payment/peer_payments/${code}/original_receipts`), data, {
      headers: tenantHeaders(),
    }),

  deleteOriginalReceipts: (code: string, listCodes: string[]) =>
    ApiClient.auth.delete(clarkBaseUrl(`payment/peer_payments/${code}/original_receipts`), {
      params: { listCodes: listCodes.join(",") },
      headers: tenantHeaders(),
    }),

  getFinancials: (code: string, params?: Record<string, any>) =>
    ApiClient.auth.get(clarkBaseUrl(`payment/peer_payments/${code}/financials`), {
      params,
      headers: tenantHeaders(),
    }),

  getMilestones: (code: string) =>
    ApiClient.auth.get(clarkBaseUrl(`payment/peer_payments/${code}/milestones`), {
      params: { sort: "timestamp:desc" },
      headers: tenantHeaders(),
    }),

  getLogs: (code: string, params?: Record<string, any>) =>
    ApiClient.auth.get(barryBaseUrl(`payment/peer_payments/${code}/logs`), {
      params,
      headers: tenantHeaders(),
    }),

  getDetailFees: (code: string) =>
    ApiClient.auth.get(johnBaseUrl(`customer/peer_payments/${code}/fees`), {
      headers: tenantHeaders(),
    }),

  getFinancialTypes: () =>
    ApiClient.auth.get("categories/financial_types", {
      params: { size: 1000 },
      headers: tenantHeaders(),
    }),

  exportPeerPayments: (params: Record<string, any>, data: { pin?: string; secret?: string }) =>
    ApiClient.auth.post(clarkBaseUrl("export/peer_payments"), data, {
      params,
      headers: tenantHeaders(),
      responseType: "blob",
    }),

  chargeRequest: (code: string) =>
    ApiClient.auth.post(
      clarkBaseUrl(`payment/peer_payments/${code}/charge_request`),
      undefined,
      { headers: tenantHeaders() },
    ),

  getPaymentMethods: () =>
    ApiClient.auth.get(clarkBaseUrl("categories/payment_methods"), {
      headers: tenantHeaders(),
    }),

  getPaymentStatuses: () =>
    ApiClient.auth.get(clarkBaseUrl("categories/peer_payment_public_status"), {
      headers: tenantHeaders(),
    }),

  getPaymentAccounts: (params?: Record<string, any>) =>
    ApiClient.auth.get(clarkBaseUrl("categories/payment_accounts"), {
      params,
      headers: tenantHeaders(),
    }),

  getPeerPaymentFees: (params?: Record<string, any>) =>
    ApiClient.auth.get(johnBaseUrl("categories/peer_payment_fees"), {
      params,
      headers: tenantHeaders(),
    }),

  getTenantConfigPayment: () =>
    ApiClient.auth.get(clarkBaseUrl("categories/tenant/current"), {
      headers: tenantHeaders(),
    }),

  getExchangeRate: (params: Record<string, any>) =>
    ApiClient.auth.get(clarkBaseUrl("customer/exchange_rates"), {
      params,
      headers: tenantHeaders(),
    }),

  getExchangeRatesBatch: (data: Array<Record<string, any>>) =>
    ApiClient.auth.post(clarkBaseUrl("customer/exchange_rates/batch"), data, {
      headers: tenantHeaders(),
    }),

  getMarkupRateGroups: () =>
    ApiClient.auth.get(clarkBaseUrl("customer/markup_rate_groups"), {
      headers: tenantHeaders(),
    }),

  getDailySummary: () =>
    ApiClient.auth.get(clarkBaseUrl("customer/summaries/daily_summary"), {
      headers: tenantHeaders(),
    }),

  createRequestForPay: (data: Record<string, any>) =>
    ApiClient.auth.post(
      clarkBaseUrl("payment/peer_payments/request_for_pay"),
      data,
      { headers: tenantHeaders() },
    ),

  askForPay: (data: Record<string, any>) =>
    ApiClient.auth.post(clarkBaseUrl("payment/peer_payments/ask_for_pay"), data, {
      headers: tenantHeaders(),
    }),

  createPayAnInvoice: (data: Record<string, any>) =>
    ApiClient.auth.post(clarkBaseUrl("payment/peer_payments/pay_an_invoice"), data, {
      headers: tenantHeaders(),
    }),

  askToPayAnInvoice: (data: Record<string, any>) =>
    ApiClient.auth.post(clarkBaseUrl("payment/peer_payments/ask_to_pay_invoice"), data, {
      headers: tenantHeaders(),
    }),

  getPaymentQuotation: (data: Record<string, any>) =>
    ApiClient.auth.post(johnBaseUrl("payment/peer_payment_quotation"), data, {
      headers: tenantHeaders(),
    }),

  getBetterOffer: (data: Record<string, any>) =>
    ApiClient.auth.post("customer/alibaba/orders/better-offer", data, {
      headers: tenantHeaders(),
    }),

  placeOrderBetterOffer: (data: Record<string, any>) =>
    ApiClient.auth.post(clarkBaseUrl("payment/peer_payments/ask-for-pay-by-gobiz-way"), data, {
      headers: tenantHeaders(),
    }),

  uploadQrCodeImage: (file: File) => {
    const formData = new FormData();
    formData.append("attachments", new Blob([file]), file.name);
    return ApiClient.auth.post("customer/images/upload", formData, {
      headers: {
        ...tenantHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
  },

  createPeerPaymentTransfer: (data: Record<string, any>) =>
    ApiClient.auth.post(
      clarkBaseUrl("payment/peer_payments/request_for_transfer"),
      data,
      { headers: tenantHeaders() },
    ),
};
