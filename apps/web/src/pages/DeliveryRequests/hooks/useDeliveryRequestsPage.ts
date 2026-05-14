import { useEffect, useMemo, useState } from "react";
import { Form } from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import {
  useDeliveryRequestsLogic,
  useFilterWithURL,
  usePaginationWithURL,
} from "@repo/hooks";
import { useTranslation } from "@repo/i18n";

export const useDeliveryRequestsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [expandedCode, setExpandedCode] = useState<string>();

  const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
    defaultPage: 1,
    defaultPageSize: 25,
  });

  const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });
  const logic = useDeliveryRequestsLogic({ page, pageSize, filters, expandedCode });
  const filterSignature = JSON.stringify(filters);

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(filters);
  }, [filterSignature, form]);

  const normalizeFilters = (values: Record<string, any>) => {
    const next = { ...values };

    if (dayjs.isDayjs(next.createdFrom)) {
      next.createdFrom = next.createdFrom.startOf("day").toISOString();
    }
    if (dayjs.isDayjs(next.createdTo)) {
      next.createdTo = next.createdTo.endOf("day").toISOString();
    }
    if (Array.isArray(next.statuses) && next.statuses.length === 0) {
      delete next.statuses;
    }

    return next;
  };

  const handleSearch = () => {
    applyFilters(normalizeFilters(form.getFieldsValue(true)));
  };

  const handleReset = () => {
    setExpandedCode(undefined);
    clearFilters();
  };

  const handleStatusChange = (status: string) => {
    applyFilters({
      ...filters,
      statuses: status === "ALL" ? undefined : [status],
    });
  };

  const syncFiltersToForm = () => {
    form.resetFields();
    form.setFieldsValue(filters);
  };

  const handleExpand = (expanded: boolean, record: any) => {
    setExpandedCode(expanded ? record.code : undefined);
  };

  const activeStatus = useMemo(() => {
    if (Array.isArray(filters.statuses)) return filters.statuses[0] || "ALL";
    return filters.statuses || "ALL";
  }, [filters.statuses]);

  return {
    t,
    form,
    page,
    pageSize,
    setPage,
    setPageSize,
    filters,
    activeStatus,
    expandedCode,
    ...logic,
    handleSearch,
    handleReset,
    handleStatusChange,
    syncFiltersToForm,
    handleExpand,
    navigateToCreateDelivery: () => navigate("/delivery/create"),
    navigateToOrderDetail: (code: string, isShipment?: boolean) =>
      navigate(`/${isShipment ? "shipments" : "orders"}/${code}`),
  };
};
