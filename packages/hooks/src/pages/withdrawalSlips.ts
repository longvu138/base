import { useEffect, useMemo, useState } from "react";
import { Form, notification } from "antd";
import {
  useCancelWithdrawalSlipMutation,
  useCreateWithdrawalSlipMutation,
  useListWithdrawalSlipQuery,
  useWithdrawalSlipLogsQuery,
  useWithdrawalSlipStatusesQuery,
  useBanksQuery,
  useWithdrawalSlipsInfiniteQuery,
} from "../useWithdrawalSlipHooks";
import { useCustomerBalance } from "../useCustomerHooks";
import { useFilterWithURL } from "../useFilterWithURL";
import { useTranslation } from "@repo/i18n";

export interface UseWithdrawalSlipsLogicProps {
  page: number;
  pageSize: number;
  filters: Record<string, any>;
}

const MOBILE_PAGE_SIZE = 25;

const normalizeWithdrawalSlipFilters = (filters: Record<string, any>) => {
  const params: Record<string, any> = { ...filters };
  if (Array.isArray(params.statuses)) {
    params.statuses = params.statuses.join(",");
  }
  if (params.createdAtRange) {
    params.createdAtFrom =
      params.createdAtRange[0]?.startOf?.("day")?.toISOString?.() ||
      params.createdAtRange[0]?.toISOString?.();
    params.createdAtTo =
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

const buildWithdrawalSlipPayload = (values: any, banksData: any[] = []) => {
  const bankCode = values.beneficiaryBank;
  const bank = banksData.find((item) => item.code === bankCode);

  return {
    amount: parseMoneyInput(values.amount),
    beneficiaryName: values.beneficiaryName,
    beneficiaryAccount: values.beneficiaryAccount,
    beneficiaryBank: bankCode,
    beneficiaryBankName:
      bankCode === "other" ? values.beneficiaryBankName : bank?.name,
    beneficiaryBankBranch: values.beneficiaryBankBranch,
    memo: values.memo,
  };
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
) => {
  const [createForm] = Form.useForm();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [logCode, setLogCode] = useState<string>();
  const createMutation = useCreateWithdrawalSlipMutation();
  const cancelMutation = useCancelWithdrawalSlipMutation();
  const logsQuery = useWithdrawalSlipLogsQuery(logCode);
  const { data: balanceData } = useCustomerBalance();

  const submitCreateSlip = async () => {
    const values = await createForm.validateFields();
    await createMutation.mutateAsync(
      buildWithdrawalSlipPayload(values, banksData),
    );
    notification.success({ message: "Tạo yêu cầu rút tiền thành công" });
    createForm.resetFields();
    setCreateModalOpen(false);
  };

  const cancelWithdrawalSlip = async (code: string) => {
    await cancelMutation.mutateAsync(code);
    notification.success({ message: "Hủy yêu cầu rút tiền thành công" });
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
  const { data: banksData } = useBanksQuery();
  const actions = useWithdrawalSlipActions(banksData, statusData);

  // 3. Derived State
  const statusOptions = useMemo(
    () =>
      (statusData || []).map((s: any) => ({ label: s.name, value: s.code })),
    [statusData],
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
    bankOptions,
    apiParams,
    ...actions,
  };
};

export const useWithdrawalSlipsMobilePage = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const pageSize = MOBILE_PAGE_SIZE;
  const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });
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
  const { data: banksData } = useBanksQuery();
  const actions = useWithdrawalSlipActions(banksData, statusData);
  const pages = infiniteQuery.data?.pages || [];
  const rows = pages.flatMap((page) => page.data || []);
  const firstPage = pages[0];

  const statusOptions = useMemo(
    () =>
      (statusData || []).map((s: any) => ({ label: s.name, value: s.code })),
    [statusData],
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
    bankOptions,
    apiParams,
    handleSearch,
    handleReset,
    applyFilters,
    ...actions,
  };
};
