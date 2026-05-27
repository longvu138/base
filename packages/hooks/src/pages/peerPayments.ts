import { useMemo } from "react";
import {
  usePeerPaymentAccountsQuery,
  usePeerPaymentMethodsQuery,
  usePeerPaymentsQuery,
  usePeerPaymentStatusesQuery,
  usePeerPaymentTenantConfigQuery,
  usePeerPaymentDailySummaryQuery,
  usePeerPaymentExchangeRatesBatchQuery,
  usePeerPaymentFeesQuery,
  usePeerPaymentMarkupRateGroupsQuery,
} from "../usePeerPaymentHooks";

export interface UsePeerPaymentsLogicProps {
  page: number;
  pageSize: number;
  filters: Record<string, any>;
}

export const usePeerPaymentsLogic = ({
  page,
  pageSize,
  filters,
}: UsePeerPaymentsLogicProps) => {
  const apiParams = useMemo(() => {
    const params: Record<string, any> = {
      offset: (page - 1) * pageSize,
      limit: pageSize + 1,
      sort: "createdAt:desc",
      peerPaymentType: "payment",
      ...filters,
    };
    if (params.peerPaymentType === "taobao_global") {
      params.peerPaymentType = "payment";
    }

    ["statuses", "paymentMethod"].forEach((key) => {
      if (Array.isArray(params[key])) params[key] = params[key].join(",");
    });

    Object.keys(params).forEach((key) => {
      if (params[key] === undefined || params[key] === null || params[key] === "") {
        delete params[key];
      }
    });

    return params;
  }, [filters, page, pageSize]);

  const paymentMethodParams = useMemo(() => {
    const method = Array.isArray(filters.paymentMethod)
      ? filters.paymentMethod[0]
      : filters.paymentMethod;
    return method ? { paymentMethodCode: method, limit: 1000 } : { limit: 1000 };
  }, [filters.paymentMethod]);

  const { data: rawPayments = [], isLoading, isFetching } =
    usePeerPaymentsQuery(apiParams);
  const { data: statuses = [] } = usePeerPaymentStatusesQuery();
  const { data: paymentMethods = [] } = usePeerPaymentMethodsQuery();
  const { data: paymentAccounts = [] } = usePeerPaymentAccountsQuery(paymentMethodParams);
  const { data: tenantConfigPayment = {} } = usePeerPaymentTenantConfigQuery();
  const { data: dailySummary = [] } = usePeerPaymentDailySummaryQuery();
  const currentLoggedUser =
    Boolean((globalThis as any)?.localStorage) &&
    JSON.parse(globalThis.localStorage.getItem("currentLoggedUser") || "{}");
  const peerPaymentConfigGroupId = currentLoggedUser?.peerPaymentConfigGroupId;
  const { data: peerPaymentFees = [] } = usePeerPaymentFeesQuery(
    peerPaymentConfigGroupId ? { configGroupId: peerPaymentConfigGroupId } : undefined,
  );
  const { data: markupRateGroups = {} } = usePeerPaymentMarkupRateGroupsQuery();
  const m24Enabled =
    Boolean((globalThis as any)?.localStorage) &&
    JSON.parse(globalThis.localStorage.getItem("currentProjectInfo") || "{}")
      ?.tenantConfig?.m24Config?.enabled;
  const exchangeRateBatchBody = useMemo(() => {
    return [{ refId: "payment", peerPaymentType: "payment" }];
  }, []);
  const { data: exchangeRatesBatch = [] } =
    usePeerPaymentExchangeRatesBatchQuery(exchangeRateBatchBody);

  const payments = useMemo(
    () => rawPayments.slice(0, pageSize),
    [pageSize, rawPayments],
  );
  const hasMore = rawPayments.length > pageSize;
  return {
    apiParams,
    payments,
    hasMore,
    isLoading,
    isFetching,
    statuses,
    paymentMethods,
    paymentAccounts,
    tenantConfigPayment,
    dailySummary,
    peerPaymentFees,
    markupRateGroups,
    exchangeRatesBatch,
    m24Enabled,
  };
};
