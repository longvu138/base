import { useEffect, useMemo, useState } from "react";
import { Form, notification } from "antd";
import {
  useCancelWithdrawalSlipMutation,
  useCreateWithdrawalSlipMutation,
  useListWithdrawalSlipQuery,
  useWithdrawalSlipLogsQuery,
  useWithdrawalSlipStatisticsQuery,
  useWithdrawalSlipStatusesQuery,
  useBanksQuery,
  useWithdrawalSlipsInfiniteQuery,
} from "../useWithdrawalSlipHooks";
import { useCustomerBalance } from "../useCustomerHooks";
import { useWalletAccountsQuery } from "../useTransactionHooks";
import { useFilterWithURL } from "../useFilterWithURL";
import { useTranslation } from "@repo/i18n";

export interface UseWithdrawalSlipsLogicProps {
  page: number;
  pageSize: number;
  filters: Record<string, any>;
}

const MOBILE_PAGE_SIZE = 25;
const WITHDRAWAL_SLIP_DATE_RANGE_PARAMS = {
  createdAtRange: { from: "timestampFrom", to: "timestampTo" },
};

const normalizeWithdrawalSlipFilters = (filters: Record<string, any>) => {
  const params: Record<string, any> = { ...filters };
  if (Array.isArray(params.statuses)) {
    params.statuses = params.statuses.join(",");
  }
  if (params.createdAtRange) {
    params.timestampFrom =
      params.createdAtRange[0]?.startOf?.("day")?.toISOString?.() ||
      params.createdAtRange[0]?.toISOString?.();
    params.timestampTo =
      params.createdAtRange[1]?.endOf?.("day")?.toISOString?.() ||
      params.createdAtRange[1]?.toISOString?.();
    delete params.createdAtRange;
  }
  return params;
};

const parseMoneyInput = (value: unknown) => {
  if (typeof value === "number") return value;
  return Number(String(value || "").replace(/[^\d.-]/g, ""));
};

const getWithdrawalSlipErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message ||
  error?.response?.data?.detail ||
  error?.response?.data?.title ||
  error?.message ||
  fallback;

const getStatisticStatus = (item: any) =>
  item?.status?.code || item?.status || item?.code || item?.name;

const getStatisticTotal = (item: any) =>
  Number(item?.total ?? item?.count ?? item?.quantity ?? item?.value ?? 0);

const buildStatusCounts = (statisticsData: any) => {
  const counts: Record<string, number> = {};

  if (Array.isArray(statisticsData)) {
    statisticsData.forEach((item) => {
      const status = getStatisticStatus(item);
      if (status) counts[status] = getStatisticTotal(item);
    });
    return counts;
  }

  Object.entries(statisticsData || {}).forEach(([status, value]) => {
    counts[status] =
      typeof value === "number"
        ? value
        : getStatisticTotal({ ...(value as any), status });
  });

  return counts;
};

const formatQuantity = (value: number) => value.toLocaleString("vi-VN");

const getWalletAccountValue = (item: any) =>
  item?.account || item?.code || item?.id;

const getDefaultWalletAccount = (items: any[] = []) =>
  items.find((item) => item?.isDefault) || items[0];

const getWalletAccountLabel = (item: any) => {
  const account = getWalletAccountValue(item) || "---";
  const currency = item?.currency ? ` (${item.currency})` : "";
  return `${account}${currency}`;
};

const buildWithdrawalSlipPayload = (
  values: any,
  banksData: any[] = [],
  walletAccounts: any[] = [],
) => {
  const bankCode = values.beneficiaryBank;
  const bank = banksData.find((item) => item.code === bankCode);
  const defaultWalletAccount = getDefaultWalletAccount(walletAccounts);
  const account = values.account || getWalletAccountValue(defaultWalletAccount);

  const payload: Record<string, any> = {
    amount: parseMoneyInput(values.amount),
    beneficiaryName: values.beneficiaryName,
    beneficiaryAccount: values.beneficiaryAccount,
    beneficiaryBank: bankCode,
    beneficiaryBankName:
      bankCode === "other" ? values.beneficiaryBankName : bank?.name,
    beneficiaryBankBranch: values.beneficiaryBankBranch,
    memo: values.memo,
  };

  if (account) {
    payload.account = account;
  }

  return payload;
};

const normalizeLogItems = (items: any[] = [], statusData: any[] = []) =>
  items.map((item) => {
    const statusChange = Array.isArray(item.data)
      ? item.data.find((entry: any) => entry?.property === "status")
      : undefined;
    const oldStatusCode = statusChange?.oldValue?.code;
    const newStatusCode = statusChange?.newValue?.code;
    const oldStatus = statusData.find(
      (status: any) => status.code === oldStatusCode,
    );
    const newStatus = statusData.find(
      (status: any) => status.code === newStatusCode,
    );

    return {
      ...item,
      actorName: item?.actor?.fullname || "---",
      code: item?.data?.code || item?.code,
      oldStatusName: oldStatus?.name || oldStatusCode,
      newStatusName: newStatus?.name || newStatusCode,
    };
  });

const useWithdrawalSlipActions = (
  banksData: any[] = [],
  statusData: any[] = [],
  walletAccounts: any[] = [],
) => {
  const [createForm] = Form.useForm();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [logCode, setLogCode] = useState<string>();
  const selectedAccount = Form.useWatch("account", createForm);
  const createMutation = useCreateWithdrawalSlipMutation();
  const cancelMutation = useCancelWithdrawalSlipMutation();
  const logsQuery = useWithdrawalSlipLogsQuery(logCode);
  const { data: balanceData } = useCustomerBalance();
  const defaultWalletAccount = useMemo(
    () => getDefaultWalletAccount(walletAccounts),
    [walletAccounts],
  );
  const selectedWalletAccount = useMemo(() => {
    const selectedValue = selectedAccount || getWalletAccountValue(defaultWalletAccount);
    return (
      walletAccounts.find(
        (item) => getWalletAccountValue(item) === selectedValue,
      ) || defaultWalletAccount
    );
  }, [defaultWalletAccount, selectedAccount, walletAccounts]);

  useEffect(() => {
    if (!isCreateModalOpen) return;
    const defaultAccount = getWalletAccountValue(defaultWalletAccount);
    if (defaultAccount && !createForm.getFieldValue("account")) {
      createForm.setFieldValue("account", defaultAccount);
    }
  }, [createForm, defaultWalletAccount, isCreateModalOpen]);

  const submitCreateSlip = async () => {
    const values = await createForm.validateFields();
    try {
      await createMutation.mutateAsync(
        buildWithdrawalSlipPayload(values, banksData, walletAccounts),
      );
      notification.success({ message: "Tạo yêu cầu rút tiền thành công" });
      createForm.resetFields();
      setCreateModalOpen(false);
    } catch (error) {
      notification.error({
        message: getWithdrawalSlipErrorMessage(
          error,
          "Không thể tạo yêu cầu rút tiền",
        ),
      });
    }
  };

  const cancelWithdrawalSlip = async (code: string) => {
    try {
      await cancelMutation.mutateAsync(code);
      notification.success({ message: "Hủy yêu cầu rút tiền thành công" });
    } catch (error) {
      notification.error({
        message: getWithdrawalSlipErrorMessage(
          error,
          "Không thể hủy yêu cầu rút tiền",
        ),
      });
    }
  };

  return {
    createForm,
    isCreateModalOpen,
    setCreateModalOpen,
    openCreateModal: () => setCreateModalOpen(true),
    closeCreateModal: () => {
      createForm.resetFields();
      setCreateModalOpen(false);
    },
    submitCreateSlip,
    isCreatingWithdrawalSlip: createMutation.isPending,
    cancelWithdrawalSlip,
    isCancellingWithdrawalSlip: cancelMutation.isPending,
    logCode,
    isLogModalOpen: !!logCode,
    openLogModal: (code: string) => setLogCode(code),
    closeLogModal: () => setLogCode(undefined),
    logs: normalizeLogItems(logsQuery.data || [], statusData),
    isLogsLoading: logsQuery.isLoading,
    balanceData,
    walletAccounts,
    walletAccountOptions: walletAccounts.map((item) => ({
      label: getWalletAccountLabel(item),
      value: getWalletAccountValue(item),
    })),
    selectedWalletAccount,
  };
};

/**
 * Shared logic for Withdrawal Slips Page
 */
export const useWithdrawalSlipsLogic = ({
  page,
  pageSize,
  filters,
}: UseWithdrawalSlipsLogicProps) => {
  // 1. Format params for API
  const apiParams = useMemo(() => {
    const params: Record<string, any> = {
      page: page - 1,
      size: pageSize,
      sort: "createdAt:desc",
      ...normalizeWithdrawalSlipFilters(filters),
    };
    return params;
  }, [page, pageSize, filters]);

  // 2. Fetch data
  const { data: listData, isLoading: isWithdrawalSlipLoading } =
    useListWithdrawalSlipQuery(apiParams);
  const { data: statusData } = useWithdrawalSlipStatusesQuery();
  const { data: statisticsData } = useWithdrawalSlipStatisticsQuery();
  const { data: banksData } = useBanksQuery();
  const { data: walletAccounts = [] } = useWalletAccountsQuery();
  const actions = useWithdrawalSlipActions(banksData, statusData, walletAccounts);

  // 3. Derived State
  const statusCounts = useMemo(
    () => buildStatusCounts(statisticsData),
    [statisticsData],
  );

  const statusOptions = useMemo(
    () =>
      (statusData || []).map((s: any) => {
        const total = statusCounts[s.code];
        return {
          label:
            total === undefined ? s.name : `${s.name} (${formatQuantity(total)})`,
          value: s.code,
        };
      }),
    [statusData, statusCounts],
  );

  const bankOptions = useMemo(
    () =>
      (banksData || []).map((b: any) => ({
        label: b.name + " (" + b.code + ")",
        value: b.code,
      })),
    [banksData],
  );

  return {
    listData,
    isWithdrawalSlipLoading,
    isWithdrawalSlipsLoading: isWithdrawalSlipLoading, // alias cho UI
    statusData,
    banksData,
    statusOptions,
    statusCounts,
    statisticsData,
    bankOptions,
    apiParams,
    ...actions,
  };
};

export const useWithdrawalSlipsMobilePage = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const pageSize = MOBILE_PAGE_SIZE;
  const { applyFilters, clearFilters, filters } = useFilterWithURL({
    form,
    dateRangeParamMap: WITHDRAWAL_SLIP_DATE_RANGE_PARAMS,
  });
  const filterSignature = JSON.stringify(filters);

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(filters);
  }, [filterSignature, filters, form]);

  const apiParams = useMemo(
    () => ({
      page: 0,
      size: pageSize,
      sort: "createdAt:desc",
      ...normalizeWithdrawalSlipFilters(filters),
    }),
    [filterSignature, filters, pageSize],
  );

  const infiniteQuery = useWithdrawalSlipsInfiniteQuery(apiParams);
  const { data: statusData } = useWithdrawalSlipStatusesQuery();
  const { data: statisticsData } = useWithdrawalSlipStatisticsQuery();
  const { data: banksData } = useBanksQuery();
  const { data: walletAccounts = [] } = useWalletAccountsQuery();
  const actions = useWithdrawalSlipActions(banksData, statusData, walletAccounts);
  const pages = infiniteQuery.data?.pages || [];
  const rows = pages.flatMap((page) => page.data || []);
  const firstPage = pages[0];

  const statusCounts = useMemo(
    () => buildStatusCounts(statisticsData),
    [statisticsData],
  );

  const statusOptions = useMemo(
    () =>
      (statusData || []).map((s: any) => {
        const total = statusCounts[s.code];
        return {
          label:
            total === undefined ? s.name : `${s.name} (${formatQuantity(total)})`,
          value: s.code,
        };
      }),
    [statusData, statusCounts],
  );

  const bankOptions = useMemo(
    () =>
      (banksData || []).map((b: any) => ({
        label: b.name + " (" + b.code + ")",
        value: b.code,
      })),
    [banksData],
  );

  const handleSearch = () => {
    applyFilters(form.getFieldsValue(true));
  };

  const handleReset = () => {
    clearFilters();
  };

  return {
    t,
    form,
    filters,
    listData: {
      data: rows,
      total: firstPage?.total || 0,
      pageSize: firstPage?.pageSize || pageSize,
      current: firstPage?.current || 0,
      totalPage: firstPage?.totalPage || 0,
    },
    isWithdrawalSlipLoading: infiniteQuery.isLoading,
    isWithdrawalSlipsLoading: infiniteQuery.isLoading,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    hasNextPage: infiniteQuery.hasNextPage,
    fetchNextPage: infiniteQuery.fetchNextPage,
    statusData,
    banksData,
    statusOptions,
    statusCounts,
    statisticsData,
    bankOptions,
    apiParams,
    handleSearch,
    handleReset,
    applyFilters,
    ...actions,
  };
};
