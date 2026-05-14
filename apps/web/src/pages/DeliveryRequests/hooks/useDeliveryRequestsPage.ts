import { Form } from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import {
  useFilterWithURL,
  usePaginationWithURL,
  useDeliveryRequestsLogic,
} from "@repo/hooks";

/**
 * Điều phối (Orchestration) đặc thù cho trang Yêu cầu giao hàng trên Web
 */
export const useDeliveryRequestsPage = () => {
  const [form] = Form.useForm();
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
    defaultPage: 1,
    defaultPageSize: 25,
  });

  const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

  const expandedCode = expandedRowKeys[0];
  const logic = useDeliveryRequestsLogic({
    page,
    pageSize,
    filters,
    expandedCode,
  });

  const normalizeFilters = (values: Record<string, any>) => ({
    ...values,
    createdFrom: values.createdFrom
      ? dayjs(values.createdFrom).startOf("day")
      : undefined,
    createdTo: values.createdTo
      ? dayjs(values.createdTo).endOf("day")
      : undefined,
  });

  const handleSearch = () => {
    setExpandedRowKeys([]);
    applyFilters(normalizeFilters(form.getFieldsValue()));
  };

  const handleReset = () => {
    setExpandedRowKeys([]);
    clearFilters();
  };

  const handleExpand = (expanded: boolean, record: any) => {
    setExpandedRowKeys(expanded ? [record.code] : []);
  };

  return {
    form,
    page,
    pageSize,
    setPage,
    setPageSize,
    filters,
    expandedRowKeys,
    ...logic,
    handleSearch,
    handleReset,
    handleExpand,
    normalizeFilters,
    applyFilters,
  };
};
