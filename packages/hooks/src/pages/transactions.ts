import { useEffect, useMemo, useState } from "react";
import { App, Form } from "antd";
import { useTranslation } from "@repo/i18n";
import { TransactionApi } from "@repo/api";
import {
  useListTransactionInfiniteQuery,
  useListTransactionQuery,
  useTransactionTypesQuery,
  useWalletAccountsQuery,
} from "../useTransactionHooks";
import { useFilterWithURL } from "../useFilterWithURL";

export interface UseTransactionsLogicProps {
  accountId?: string;
  page: number;
  pageSize: number;
  filters: Record<string, any>;
}

const MOBILE_PAGE_SIZE = 25;

const cleanTransactionFilters = (values: Record<string, any>) => ({
  externalTypes: values.externalTypes?.length
    ? values.externalTypes
    : undefined,
  nominalTimestampFrom: values.nominalTimestampFrom,
  nominalTimestampTo: values.nominalTimestampTo,
  query: values.query?.trim() || undefined,
});

const normalizeTransactionFilters = (filters: Record<string, any>) => {
  const params: Record<string, any> = { ...filters };

  if (Array.isArray(params.externalTypes)) {
    params.externalTypes = params.externalTypes.join(",");
  }

  if (params.nominalTimestampFrom?.startOf) {
    params.nominalTimestampFrom = params.nominalTimestampFrom
      .startOf("day")
      .toISOString();
  }
  if (params.nominalTimestampTo?.endOf) {
    params.nominalTimestampTo = params.nominalTimestampTo
      .endOf("day")
      .toISOString();
  }

  return params;
};

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
  const match = disposition?.match(
    /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i,
  );
  return match?.[1]
    ? decodeURIComponent(match[1])
    : `transactions_${Date.now()}.xlsx`;
};

/**
 * Shared logic for Transactions Page
 */
export const useTransactionsLogic = ({
  accountId,
  page,
  pageSize,
  filters,
}: UseTransactionsLogicProps) => {
  // 1. Format params for API
  const apiParams = useMemo(() => {
    const params: Record<string, any> = {
      page: page - 1,
      size: pageSize,
      ...normalizeTransactionFilters(filters),
    };

    return params;
  }, [filters, page, pageSize]);

  // 2. Fetch data
  const { data: walletAccounts, isLoading: isLoadingAccounts } =
    useWalletAccountsQuery();

  const activeAccountId = useMemo(() => {
    if (accountId) return accountId;
    const defaultAcc =
      walletAccounts?.find((acc: any) => acc.isDefault) || walletAccounts?.[0];
    return defaultAcc?.account;
  }, [accountId, walletAccounts]);

  const { data: transactionData, isLoading: isTransactionLoading } =
    useListTransactionQuery(activeAccountId, apiParams);
  const { data: transactionTypes } = useTransactionTypesQuery();

  // 3. Derived State
  const defaultAccount = useMemo(
    () =>
      walletAccounts?.find((acc: any) => acc.isDefault) || walletAccounts?.[0],
    [walletAccounts],
  );

  const transactionTypeOptions = useMemo(() => {
    if (!transactionTypes) return [];
    return transactionTypes.map((type: any) => ({
      label: type.name,
      value: type.code,
    }));
  }, [transactionTypes]);

  return {
    walletAccounts,
    isLoadingAccounts,
    transactionData,
    isTransactionLoading,
    transactionTypes,
    defaultAccount,
    transactionTypeOptions,
    apiParams,
  };
};

export const useTransactionsMobilePage = () => {
  const { t } = useTranslation();
  const { notification } = App.useApp();
  const [form] = Form.useForm();
  const [exporting, setExporting] = useState(false);
  const pageSize = MOBILE_PAGE_SIZE;
  const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });
  const filterSignature = JSON.stringify(filters);

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(filters);
  }, [filterSignature, filters, form]);

  const { data: walletAccounts = [], isLoading: isLoadingAccounts } =
    useWalletAccountsQuery();
  const { data: transactionTypes = [], isLoading: isLoadingTypes } =
    useTransactionTypesQuery();

  const activeAccountId = useMemo(() => {
    const defaultAccount =
      walletAccounts.find((item: any) => item.isDefault) || walletAccounts[0];
    return defaultAccount?.account;
  }, [walletAccounts]);

  const apiParams = useMemo(
    () => ({
      page: 0,
      size: pageSize,
      // sort: 'createdAt:desc',
      ...normalizeTransactionFilters(filters),
    }),
    [filterSignature, filters, pageSize],
  );

  const infiniteQuery = useListTransactionInfiniteQuery(
    activeAccountId,
    apiParams,
  );
  const pages = infiniteQuery.data?.pages || [];
  const rows = pages.flatMap((page) => page.data || []);
  const firstPage = pages[0];

  const handleSearch = () => {
    applyFilters(cleanTransactionFilters(form.getFieldsValue(true)));
  };

  const handleReset = () => {
    clearFilters();
  };

  const toggleTransactionType = (code: string) => {
    const currentTypes = form.getFieldValue("externalTypes") || [];
    const externalTypes = currentTypes.includes(code)
      ? currentTypes.filter((item: string) => item !== code)
      : [...currentTypes, code];

    form.setFieldValue("externalTypes", externalTypes);
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
        { ...apiParams },
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
    t,
    form,
    accountId: activeAccountId,
    transactionTypes,
    filters,
    listData: {
      data: rows,
      total: firstPage?.total || 0,
      pageSize: firstPage?.pageSize || pageSize,
      current: firstPage?.current || 0,
      totalPage: firstPage?.totalPage || 0,
    },
    isLoading: isLoadingAccounts || isLoadingTypes || infiniteQuery.isLoading,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    hasNextPage: infiniteQuery.hasNextPage,
    fetchNextPage: infiniteQuery.fetchNextPage,
    isExporting: exporting,
    apiParams,
    handleSearch,
    handleReset,
    handleExport,
    toggleTransactionType,
  };
};
