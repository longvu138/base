import { useMemo, useState } from "react";
import type { Key } from "react";
import { Form } from "antd";
import type { Dayjs } from "dayjs";
import { useRewardPointTransactionsQuery } from "../useCustomerHooks";

const defaultPageSize = 25;

type VipLevelFilters = {
  orderCode?: string;
  trxTimeFrom?: Dayjs;
  trxTimeTo?: Dayjs;
};

const cleanFilters = (values: VipLevelFilters) => ({
  orderCode: values.orderCode?.trim() || undefined,
  trxTimeFrom: values.trxTimeFrom,
  trxTimeTo: values.trxTimeTo,
});

export const useProfileVipLevelsPage = () => {
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<VipLevelFilters>({});
  const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>([]);

  const apiParams = useMemo(() => {
    const params: Record<string, any> = {
      page: page - 1,
      size: defaultPageSize,
      sort: "createdAt:desc",
    };

    if (filters.orderCode) params.orderCode = filters.orderCode;
    if (filters.trxTimeFrom) {
      params.trxTimeFrom = filters.trxTimeFrom.startOf("day").toISOString();
    }
    if (filters.trxTimeTo) {
      params.trxTimeTo = filters.trxTimeTo.endOf("day").toISOString();
    }

    return params;
  }, [filters, page]);

  const { data, isLoading } = useRewardPointTransactionsQuery(apiParams);

  const handleSearch = () => {
    setPage(1);
    setFilters(cleanFilters(form.getFieldsValue()));
  };

  const handleReset = () => {
    form.resetFields();
    setPage(1);
    setFilters({});
  };

  return {
    expandedRowKeys,
    form,
    handleReset,
    handleSearch,
    isLoading,
    page,
    pageSize: defaultPageSize,
    setExpandedRowKeys,
    setPage,
    total: data?.total || 0,
    transactions: data?.data || [],
  };
};
