import { ApiClient, appConfig } from "@repo/util";

export type StatisticType = "order" | "shipment" | "request_payment";

const trimTrailingSlash = (value?: string) => String(value || "").replace(/\/+$/, "");

const clarkBaseUrl = () => {
  const paymentApi = trimTrailingSlash(appConfig.apiPayment);
  return paymentApi && !paymentApi.startsWith("undefined")
    ? `${paymentApi}/clark/customer/summaries`
    : "clark/customer/summaries";
};

export const StatisticApi = {
  getStatisticMonthly: (type: Exclude<StatisticType, "request_payment">, year: string, month: string) => {
    return ApiClient.auth.get(`customer/summaries/${type}/monthly/${year}/${month}`);
  },

  getStatisticYearly: (type: Exclude<StatisticType, "request_payment">, year: string) => {
    return ApiClient.auth.get(`customer/summaries/${type}/yearly/${year}`);
  },

  getStatisticClarkMonthly: (year: string, month: string, tenantCode?: string) => {
    return ApiClient.auth.get(`${clarkBaseUrl()}/monthly/${year}/${month}`, {
      headers: tenantCode ? { "X-Tenant": tenantCode } : undefined,
    });
  },

  getStatisticClarkYearly: (year: string, tenantCode?: string) => {
    return ApiClient.auth.get(`${clarkBaseUrl()}/yearly/${year}`, {
      headers: tenantCode ? { "X-Tenant": tenantCode } : undefined,
    });
  },
};
