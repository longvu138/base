import { useEffect, useMemo, useState } from "react";
import { App, Form } from "antd";
import { useInfiniteQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { PeerPaymentApi } from "@repo/api";
import { useTranslation } from "@repo/i18n";
import { moneyFormat, quantityFormat } from "@repo/util";
import {
  useAskForPayMutation,
  useAskToPayAnInvoiceMutation,
  useBetterOfferMutation,
  useChargePeerPaymentMutation,
  useCreatePayAnInvoiceMutation,
  useCreatePeerPaymentTransferMutation,
  useCreateRequestForPayMutation,
  useExportPeerPaymentsMutation,
  usePeerPaymentAccountsQuery,
  usePeerPaymentExchangeRateMutation,
  usePeerPaymentExchangeRatesBatchMutation,
  usePeerPaymentMethodsQuery,
  usePeerPaymentQuotationMutation,
  usePeerPaymentsQuery,
  usePeerPaymentStatusesQuery,
  usePeerPaymentTenantConfigQuery,
  usePeerPaymentDailySummaryQuery,
  usePeerPaymentExchangeRatesBatchQuery,
  usePeerPaymentFeesQuery,
  usePeerPaymentMarkupRateGroupsQuery,
  usePlaceOrderBetterOfferMutation,
  useUploadPeerPaymentQrCodeMutation,
} from "../usePeerPaymentHooks";
import { useCustomerBalance } from "../useCustomerHooks";
import { useFilterWithURL } from "../useFilterWithURL";
import { usePaginationWithURL } from "../usePaginationWithURL";

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

const hydratePeerPaymentFiltersForForm = (values: Record<string, any>) => {
  const next = { ...values };
  ["timestampFrom", "timestampTo", "milestoneFrom", "milestoneTo"].forEach(
    (key) => {
      if (next[key] && !dayjs.isDayjs(next[key])) {
        next[key] = dayjs(next[key]);
      }
    },
  );
  return next;
};

const normalizePeerPaymentFilters = (values: Record<string, any>) => {
  const next = { ...values };

  if (dayjs.isDayjs(next.timestampFrom)) {
    next.timestampFrom = next.timestampFrom.startOf("day").toISOString();
  }

  if (dayjs.isDayjs(next.timestampTo)) {
    next.timestampTo = next.timestampTo.endOf("day").toISOString();
  }

  if (dayjs.isDayjs(next.milestoneFrom)) {
    next.milestoneFrom = next.milestoneFrom.toISOString();
  }

  if (dayjs.isDayjs(next.milestoneTo)) {
    next.milestoneTo = next.milestoneTo.toISOString();
  }

  if (next.hasCollateral === "pass") {
    next.hasCollateral = true;
  } else if (next.hasCollateral === "fail") {
    next.hasCollateral = false;
  }

  Object.keys(next).forEach((key) => {
    if (
      next[key] === undefined ||
      next[key] === null ||
      next[key] === "" ||
      (Array.isArray(next[key]) && next[key].length === 0)
    ) {
      delete next[key];
    }
  });

  return next;
};

export const usePeerPaymentsPage = () => {
  const { t } = useTranslation();
  const { notification } = App.useApp();
  const [form] = Form.useForm();
  const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
    defaultPage: 1,
    defaultPageSize: 10,
  });
  const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });
  const logic = usePeerPaymentsLogic({ page, pageSize, filters });
  const { data: userBalance = {}, refetch: refetchUserBalance } =
    useCustomerBalance();
  const chargeMutation = useChargePeerPaymentMutation();
  const exchangeRateMutation = usePeerPaymentExchangeRateMutation();
  const exchangeRatesBatchMutation = usePeerPaymentExchangeRatesBatchMutation();
  const exportMutation = useExportPeerPaymentsMutation();
  const createRequestForPayMutation = useCreateRequestForPayMutation();
  const askForPayMutation = useAskForPayMutation();
  const createPayAnInvoiceMutation = useCreatePayAnInvoiceMutation();
  const askToPayAnInvoiceMutation = useAskToPayAnInvoiceMutation();
  const paymentQuotationMutation = usePeerPaymentQuotationMutation();
  const betterOfferMutation = useBetterOfferMutation();
  const placeOrderBetterOfferMutation = usePlaceOrderBetterOfferMutation();
  const uploadQrCodeMutation = useUploadPeerPaymentQrCodeMutation();
  const createTransferMutation = useCreatePeerPaymentTransferMutation();
  const [chargingCode, setChargingCode] = useState<string>();
  const filterSignature = JSON.stringify(filters);

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(hydratePeerPaymentFiltersForForm(filters));
  }, [filterSignature, form]);

  const handleSearch = () => {
    applyFilters(normalizePeerPaymentFilters(form.getFieldsValue(true)));
  };

  const handleReset = () => {
    clearFilters();
  };

  const handleTypeChange = (peerPaymentType: string) => {
    form.resetFields();
    applyFilters({ peerPaymentType });
  };

  const isChargeTimeoutError = (error: any) =>
    error?.code === "ECONNABORTED" ||
    error?.code === "ERR_CANCELED" ||
    error?.name === "CanceledError" ||
    String(error?.message || "").toLowerCase().includes("timeout");

  const handleCharge = async (code: string, row?: Record<string, any>) => {
    setChargingCode(code);
    let latestBalance = userBalance;
    try {
      const balanceResponse = await refetchUserBalance();
      latestBalance = balanceResponse.data || latestBalance;
      await chargeMutation.mutateAsync(code);
      refetchUserBalance();
      notification.success({ message: t("message.success") });
    } catch (error: any) {
      const title = error?.response?.data?.title || error?.title;
      if (isChargeTimeoutError(error)) {
        notification.error({ message: t("peer_payment.charge_timeout") });
      } else if (title === "invalid_amount") {
        notification.error({ message: t("peer_payment.invalid_amount") });
      } else if (title === "insufficient_balance") {
        const totalMoney =
          Number(row?.totalFee || 0) + Number(row?.exchangedAmount || 0);
        const topUpMoney =
          totalMoney -
          (Number(latestBalance?.balance || 0) +
            Number(latestBalance?.creditLimit || 0));
        notification.error({
          message: t("cartCheckout.notEnoughMoney").replace(
            "${money}",
            moneyFormat(topUpMoney),
          ),
        });
      } else {
        const status = error?.response?.status;
        const messageKey =
          status === 500 || !error?.response
            ? "error.oops"
            : error?.response?.data?.message || error?.message;
        notification.error({
          message: messageKey ? t(messageKey) : "",
        });
      }
    } finally {
      setChargingCode(undefined);
    }
  };

  const handleCreatePaymentRequest = async (
    values: Record<string, any>,
    options: { needPayOnRequest?: boolean } = {},
  ) => {
    const {
      requestForPayType,
      originalReceiptCode: _originalReceiptCode,
      exchangeRate: _exchangeRate,
      ...payloadValues
    } = values;
    const originalReceiptCode =
      typeof values.originalReceipts === "string"
        ? values.originalReceipts.trim()
        : values.originalReceipts?.[0]?.code;
    const payload = {
      ...payloadValues,
      amount: Number(values.amount || 0),
      paymentMethodCode: values.paymentMethodCode || "alipay",
      originalReceipts: originalReceiptCode
        ? [
            {
              code: originalReceiptCode,
              billTo: values.billTo,
            },
          ]
        : undefined,
      force: true,
    };

    const needPayOnRequest = options.needPayOnRequest;
    const isCompany = requestForPayType === "company";
    if (isCompany) {
      if (needPayOnRequest) {
        await createPayAnInvoiceMutation.mutateAsync(payload);
      } else {
        await askToPayAnInvoiceMutation.mutateAsync(payload);
      }
    } else if (needPayOnRequest) {
      await createRequestForPayMutation.mutateAsync(payload);
    } else {
      await askForPayMutation.mutateAsync(payload);
    }
    notification.success({ message: t("message.success") });
  };

  const handleCreateTransferRequest = async (values: Record<string, any>) => {
    await createTransferMutation.mutateAsync({
      ...values,
      amount: Number(values.amount || 0),
    });
    notification.success({ message: t("message.success") });
  };

  const handleExport = async (pin: string) => {
    if (!pin) {
      notification.error({ message: t("cartCheckout.incorrect_pin") });
      return false;
    }

    const params: Record<string, any> = {
      ...logic.apiParams,
      page: page - 1,
      size: pageSize,
    };
    delete params.offset;
    delete params.limit;

    try {
      const response = await exportMutation.mutateAsync({
        params,
        data: { pin, secret: pin },
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const disposition = response.headers?.["content-disposition"] || "";
      const fileName =
        disposition.split("filename=")[1] || "peer-payments.xlsx";
      const link = document.createElement("a");
      link.href = url;
      link.download = decodeURIComponent(fileName.replaceAll('"', ""));
      link.click();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error: any) {
      const data = error?.response?.data;
      let title = "";
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          title = JSON.parse(text)?.title;
        } catch {
          title = "";
        }
      } else {
        title = data?.title || error?.title;
      }
      notification.error({
        message:
          title === "invalid_pin" || title === "invalid_password"
            ? t("cartCheckout.incorrect_pin")
            : t("shipments.export_error"),
      });
      return false;
    }
  };

  return {
    t,
    form,
    page,
    pageSize,
    setPage,
    setPageSize,
    filters,
    userBalance,
    refetchUserBalance,
    ...logic,
    handleSearch,
    handleReset,
    handleTypeChange,
    handleCharge,
    handleCreatePaymentRequest,
    handleCreateTransferRequest,
    handleExport,
    chargeMutation,
    chargingCode,
    exchangeRateMutation,
    exchangeRatesBatchMutation,
    paymentQuotationMutation,
    betterOfferMutation,
    placeOrderBetterOfferMutation,
    uploadQrCodeMutation,
    exportMutation,
    createRequestForPayMutation,
    askForPayMutation,
    createPayAnInvoiceMutation,
    askToPayAnInvoiceMutation,
    createTransferMutation,
  };
};

export const normalizePeerPaymentListResponse = (
  response: any,
  current: number,
  pageSize: number,
) => {
  const raw = response?.data;
  const rows = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.content)
      ? raw.content
      : Array.isArray(raw)
        ? raw
        : [];
  const hasExtra = rows.length > pageSize;
  const data = hasExtra ? rows.slice(0, pageSize) : rows;
  const total =
    raw?.total ??
    raw?.totalElements ??
    raw?.totalItems ??
    response?.headers?.["x-total-count"] ??
    (hasExtra ? current * pageSize + 1 : (current - 1) * pageSize + data.length);

  return {
    data,
    total: Number(total || 0),
    pageSize,
    current,
    totalPage: Math.ceil(Number(total || 0) / pageSize),
    hasMore: hasExtra || current * pageSize < Number(total || 0),
  };
};

const parseViewTemplate = (value?: string) => {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const getMarkupRateValue = (item: any, tier: any, exchangeRate: any) => {
  const sourceRate = Number(exchangeRate?.rate || 0);
  const price = Number(tier?.price || 0);

  if (String(item?.scope || "").toLowerCase() === "value") {
    return sourceRate + price;
  }
  if (String(item?.scope || "").toLowerCase() === "rate") {
    return sourceRate + sourceRate * (price / 100);
  }
  return 0;
};

export const useMobilePeerPaymentsPage = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const pageSize = 10;
  const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });
  const peerPaymentType = filters.peerPaymentType || "payment";
  const filterSignature = JSON.stringify(filters);

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(hydratePeerPaymentFiltersForForm(filters));
  }, [filterSignature, form]);

  const apiBaseParams = useMemo(() => {
    const params: Record<string, any> = {
      sort: "createdAt:desc",
      peerPaymentType,
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
  }, [filters, peerPaymentType]);

  const paymentMethodParams = useMemo(() => {
    const method = Array.isArray(filters.paymentMethod)
      ? filters.paymentMethod[0]
      : filters.paymentMethod;
    return method ? { paymentMethodCode: method, limit: 1000 } : { limit: 1000 };
  }, [filters.paymentMethod]);

  const query = useInfiniteQuery({
    queryKey: ["peer-payments-mobile", apiBaseParams, pageSize],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const current = Number(pageParam);
      const response = await PeerPaymentApi.getPeerPayments({
        ...apiBaseParams,
        offset: (current - 1) * pageSize,
        limit: pageSize + 1,
      });
      return normalizePeerPaymentListResponse(response, current, pageSize);
    },
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce(
        (sum, page) => sum + page.data.length,
        0,
      );
      if (!lastPage.hasMore) return undefined;
      if (lastPage.total && loaded >= lastPage.total) return undefined;
      return lastPage.current + 1;
    },
  });

  const { data: statuses = [] } = usePeerPaymentStatusesQuery();
  const { data: paymentMethods = [] } = usePeerPaymentMethodsQuery();
  const { data: paymentAccounts = [] } = usePeerPaymentAccountsQuery(paymentMethodParams);
  const { data: tenantConfigPayment = {} } = usePeerPaymentTenantConfigQuery();
  const { data: dailySummary = [] } = usePeerPaymentDailySummaryQuery();
  const { data: peerPaymentFees = [] } = usePeerPaymentFeesQuery();
  const { data: markupRateGroups = {} } = usePeerPaymentMarkupRateGroupsQuery();
  const exchangeRateBatchBody = useMemo(
    () => [{ refId: "payment", peerPaymentType: "payment" }],
    [],
  );
  const { data: exchangeRatesBatch = [] } =
    usePeerPaymentExchangeRatesBatchQuery(exchangeRateBatchBody);
  const { data: userBalance = {}, refetch: refetchUserBalance } = useCustomerBalance();
  const chargeMutation = useChargePeerPaymentMutation();
  const exchangeRateMutation = usePeerPaymentExchangeRateMutation();
  const exportMutation = useExportPeerPaymentsMutation();
  const createRequestForPayMutation = useCreateRequestForPayMutation();
  const askForPayMutation = useAskForPayMutation();
  const createPayAnInvoiceMutation = useCreatePayAnInvoiceMutation();
  const askToPayAnInvoiceMutation = useAskToPayAnInvoiceMutation();
  const createTransferMutation = useCreatePeerPaymentTransferMutation();
  const paymentQuotationMutation = usePeerPaymentQuotationMutation();
  const betterOfferMutation = useBetterOfferMutation();
  const placeOrderBetterOfferMutation = usePlaceOrderBetterOfferMutation();
  const uploadQrCodeMutation = useUploadPeerPaymentQrCodeMutation();
  const [chargingCode, setChargingCode] = useState<string>();
  const { notification } = App.useApp();

  const rows = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) || [],
    [query.data],
  );
  const total = query.data?.pages[0]?.total || rows.length;
  const currentProjectInfo =
    Boolean((globalThis as any)?.localStorage) &&
    JSON.parse(globalThis.localStorage.getItem("currentProjectInfo") || "{}");
  const dailyPayment =
    Array.isArray(dailySummary) &&
    dailySummary.find((item: any) => item.paymentMethodCode === "alipay");
  const dailyTransfer =
    Array.isArray(dailySummary) &&
    dailySummary.find(
      (item: any) => item.paymentMethodCode === "bank_transfer",
    );
  const dailyMessage = t("peer_payment.daily_message", {
    date: dayjs().format("DD/MM/YYYY"),
    paymentNum: quantityFormat(dailyPayment?.totalPeerPayment || 0),
    paymentAmount: moneyFormat(dailyPayment?.totalAmount || 0, "CNY"),
    transferNum: quantityFormat(dailyTransfer?.totalPeerPayment || 0),
    transferAmount: moneyFormat(dailyTransfer?.totalAmount || 0, "CNY"),
    tenantName: currentProjectInfo.name || currentProjectInfo.id || "",
  });
  const m24Enabled = Boolean(currentProjectInfo?.tenantConfig?.m24Config?.enabled);
  const exchangeRate = useMemo(
    () =>
      exchangeRatesBatch.find((item: any) => item.refId === "payment")
        ?.exchangeRate || {},
    [exchangeRatesBatch],
  );
  const filteredMarkupRateGroups = useMemo(() => {
    const listMarkupRates = Array.isArray(markupRateGroups?.listMarkupRates)
      ? markupRateGroups.listMarkupRates
      : [];
    return {
      ...markupRateGroups,
      listMarkupRates: m24Enabled
        ? listMarkupRates
        : listMarkupRates.filter(
            (item: any) => item?.exchangeRateSource !== "market",
          ),
    };
  }, [m24Enabled, markupRateGroups]);
  const listExchangeRate = useMemo(() => {
    const list: any[] = [];
    (filteredMarkupRateGroups.listMarkupRates || []).forEach((item: any) => {
      const template = parseViewTemplate(item.viewTemplate);
      const currency = item.exchangeRate
        ? String(item.exchangeRate).split("/")
        : [];
      template.forEach((tier: any) => {
        const value = getMarkupRateValue(item, tier, exchangeRate);
        list.push({ base: currency[0], value, currency: currency[1] });
      });
    });
    return list.sort((a, b) => Number(a.value || 0) - Number(b.value || 0));
  }, [exchangeRate, filteredMarkupRateGroups]);
  const firstExchangeRate = listExchangeRate[0];
  const lastExchangeRate = [...listExchangeRate]
    .reverse()
    .find((item) => Number(item.value || 0) > 0);
  const exchangeRangeText =
    firstExchangeRate && lastExchangeRate
      ? `${t("peer_payment.exchange_range")} : ${moneyFormat(1, firstExchangeRate.base)} = ${moneyFormat(
          firstExchangeRate.value,
          firstExchangeRate.currency,
        )}${
          firstExchangeRate.value !== lastExchangeRate.value &&
          listExchangeRate.length > 1
            ? ` - ${moneyFormat(
                lastExchangeRate.value,
                lastExchangeRate.currency,
              )}`
            : ""
        }`
      : t("peer_payment.exchange_range");

  const handleSearch = () => {
    applyFilters(normalizePeerPaymentFilters(form.getFieldsValue(true)));
  };

  const handleReset = () => {
    clearFilters();
  };

  const handleTypeChange = (nextType: string) => {
    form.resetFields();
    applyFilters({ peerPaymentType: nextType });
  };

  const handleCharge = async (code: string, row?: Record<string, any>) => {
    setChargingCode(code);
    let latestBalance = userBalance;
    try {
      const balanceResponse = await refetchUserBalance();
      latestBalance = balanceResponse.data || latestBalance;
      await chargeMutation.mutateAsync(code);
      refetchUserBalance();
      notification.success({ message: t("message.success") });
    } catch (error: any) {
      const title = error?.response?.data?.title || error?.title;
      if (title === "invalid_amount") {
        notification.error({ message: t("peer_payment.invalid_amount") });
      } else if (title === "insufficient_balance") {
        const totalMoney =
          Number(row?.totalFee || 0) + Number(row?.exchangedAmount || 0);
        const topUpMoney =
          totalMoney -
          (Number(latestBalance?.balance || 0) +
            Number(latestBalance?.creditLimit || 0));
        notification.error({
          message: t("cartCheckout.notEnoughMoney").replace(
            "${money}",
            moneyFormat(topUpMoney),
          ),
        });
      } else {
        notification.error({
          message: t(error?.response?.data?.message || error?.message || "error.oops"),
        });
      }
    } finally {
      setChargingCode(undefined);
    }
  };

  const handleCreatePaymentRequest = async (
    values: Record<string, any>,
    options: { needPayOnRequest?: boolean } = {},
  ) => {
    const {
      requestForPayType,
      originalReceiptCode: _originalReceiptCode,
      exchangeRate: _exchangeRate,
      ...payloadValues
    } = values;
    const originalReceiptCode =
      typeof values.originalReceipts === "string"
        ? values.originalReceipts.trim()
        : values.originalReceipts?.[0]?.code;
    const payload = {
      ...payloadValues,
      amount: Number(values.amount || 0),
      paymentMethodCode: values.paymentMethodCode || "alipay",
      originalReceipts: originalReceiptCode
        ? [
            {
              code: originalReceiptCode,
              billTo: values.billTo,
            },
          ]
        : undefined,
      force: true,
    };

    const needPayOnRequest = options.needPayOnRequest;
    const isCompany = requestForPayType === "company";
    if (isCompany) {
      if (needPayOnRequest) {
        await createPayAnInvoiceMutation.mutateAsync(payload);
      } else {
        await askToPayAnInvoiceMutation.mutateAsync(payload);
      }
    } else if (needPayOnRequest) {
      await createRequestForPayMutation.mutateAsync(payload);
    } else {
      await askForPayMutation.mutateAsync(payload);
    }
    notification.success({ message: t("message.success") });
  };

  const handleCreateTransferRequest = async (values: Record<string, any>) => {
    await createTransferMutation.mutateAsync({
      ...values,
      amount: Number(values.amount || 0),
    });
    notification.success({ message: t("message.success") });
  };

  const handleExport = async (pin: string) => {
    if (!pin) {
      notification.error({ message: t("cartCheckout.incorrect_pin") });
      return false;
    }

    const params: Record<string, any> = {
      ...apiBaseParams,
      page: 0,
      size: pageSize,
    };
    delete params.offset;
    delete params.limit;

    try {
      const response = await exportMutation.mutateAsync({
        params,
        data: { pin, secret: pin },
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const disposition = response.headers?.["content-disposition"] || "";
      const fileName =
        disposition.split("filename=")[1] || "peer-payments.xlsx";
      const link = document.createElement("a");
      link.href = url;
      link.download = decodeURIComponent(fileName.replaceAll('"', ""));
      link.click();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error: any) {
      const data = error?.response?.data;
      let title = "";
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          title = JSON.parse(text)?.title;
        } catch {
          title = "";
        }
      } else {
        title = data?.title || error?.title;
      }
      notification.error({
        message:
          title === "invalid_pin" || title === "invalid_password"
            ? t("cartCheckout.incorrect_pin")
            : t("shipments.export_error"),
      });
      return false;
    }
  };

  return {
    t,
    form,
    filters,
    peerPaymentType,
    rows,
    total,
    dailyMessage,
    statuses,
    paymentMethods,
    paymentAccounts,
    tenantConfigPayment,
    peerPaymentFees,
    exchangeRangeText,
    firstExchangeRate,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    handleSearch,
    handleReset,
    handleTypeChange,
    handleCharge,
    handleCreatePaymentRequest,
    handleCreateTransferRequest,
    handleExport,
    chargeMutation,
    exchangeRateMutation,
    paymentQuotationMutation,
    betterOfferMutation,
    placeOrderBetterOfferMutation,
    uploadQrCodeMutation,
    exportMutation,
    createRequestForPayMutation,
    askForPayMutation,
    createPayAnInvoiceMutation,
    askToPayAnInvoiceMutation,
    createTransferMutation,
    chargingCode,
  };
};
