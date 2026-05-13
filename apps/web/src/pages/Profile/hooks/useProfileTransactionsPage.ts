import { useMemo, useState } from "react";
import { App, Form } from "antd";
import type { Dayjs } from "dayjs";
import {
  useListTransactionQuery,
  useTransactionTypesQuery,
  useWalletAccountsQuery,
} from "@repo/hooks";
import { TransactionApi } from "@repo/api";

const defaultPageSize = 25;

type TransactionFilters = {
  externalTypes?: string[];
  nominalTimestampFrom?: Dayjs;
  nominalTimestampTo?: Dayjs;
  query?: string;
};

const cleanFilters = (values: TransactionFilters) => ({
  externalTypes: values.externalTypes?.length
    ? values.externalTypes
    : undefined,
  nominalTimestampFrom: values.nominalTimestampFrom,
  nominalTimestampTo: values.nominalTimestampTo,
  query: values.query?.trim() || undefined,
});

const resolveTransactionError = (error: any, fallback: string) =>
  error?.response?.data?.message ||
  error?.response?.data?.detail ||
  error?.response?.data?.title ||
  error?.message ||
  fallback;

const getExportFileName = (response: any) => {
  const disposition =
    response?.headers?.["content-disposition"] ||
    response?.headers?.["Content-Disposition"];
  const match = disposition?.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
  return match?.[1]
    ? decodeURIComponent(match[1])
    : `transactions_${Date.now()}.xlsx`;
};

export const useProfileTransactionsPage = (t: (key: string) => string) => {
  const [form] = Form.useForm();
  const { notification } = App.useApp();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [exporting, setExporting] = useState(false);

  const { data: walletAccounts = [], isLoading: isLoadingAccounts } =
    useWalletAccountsQuery();
  const { data: transactionTypes = [], isLoading: isLoadingTypes } =
    useTransactionTypesQuery();

  const activeAccountId = useMemo(() => {
    const defaultAccount =
      walletAccounts.find((item: any) => item.isDefault) || walletAccounts[0];
    return defaultAccount?.account;
  }, [walletAccounts]);

  const apiParams = useMemo(() => {
    const params: Record<string, any> = {
      page: page - 1,
      size: pageSize,
    };

    if (filters.externalTypes?.length) {
      params.externalTypes = filters.externalTypes.join(",");
    }

    if (filters.nominalTimestampFrom) {
      params.nominalTimestampFrom = filters.nominalTimestampFrom
        .startOf("day")
        .toISOString();
    }

    if (filters.nominalTimestampTo) {
      params.nominalTimestampTo = filters.nominalTimestampTo
        .endOf("day")
        .toISOString();
    }

    if (filters.query) {
      params.query = filters.query;
    }

    return params;
  }, [filters, page, pageSize]);

  const {
    data: transactionData,
    isLoading: isTransactionLoading,
    refetch,
  } = useListTransactionQuery(activeAccountId, apiParams);

  const handleSearch = () => {
    setPage(1);
    setFilters(cleanFilters(form.getFieldsValue()));
  };

  const handleReset = () => {
    form.resetFields();
    setPage(1);
    setFilters({});
  };

  const toggleTransactionType = (code: string) => {
    const currentTypes = form.getFieldValue("externalTypes") || [];
    const externalTypes = currentTypes.includes(code)
      ? currentTypes.filter((item) => item !== code)
      : [...currentTypes, code];

    form.setFieldValue("externalTypes", externalTypes);
  };

  const changePage = (nextPage: number, nextPageSize?: number) => {
    setPage(nextPage);
    if (nextPageSize && nextPageSize !== pageSize) {
      setPageSize(nextPageSize);
    }
  };

  const handleExport = async (
    secret?: string,
    onSuccess?: () => void,
    setError?: (message: string) => void,
  ) => {
    if (!secret) {
      setError?.(t("cartCheckout.incorrect_pin"));
      return;
    }

    try {
      setExporting(true);
      const response = await TransactionApi.exportTransactions(
        { ...apiParams, sort: "createdAt:desc" },
        { secret },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", getExportFileName(response));
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notification.success({ message: "Đang tải file export..." });
      onSuccess?.();
    } catch (error: any) {
      const errorTitle = error?.response?.data?.title || error?.title;
      if (errorTitle === "invalid_pin" || errorTitle === "invalid_password") {
        setError?.(t("cartCheckout.incorrect_pin"));
        return;
      }
      notification.error({
        message: resolveTransactionError(error, t("common.error")),
      });
    } finally {
      setExporting(false);
    }
  };

  return {
    form,
    accountId: activeAccountId,
    transactionTypes,
    transactionData,
    filters,
    page,
    pageSize,
    isLoading: isLoadingAccounts || isLoadingTypes || isTransactionLoading,
    isExporting: exporting,
    changePage,
    handleSearch,
    handleReset,
    handleExport,
    refetch,
    toggleTransactionType,
  };
};
