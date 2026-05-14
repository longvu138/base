import { useEffect, useState } from "react";
import { Form } from "antd";
import dayjs from "dayjs";
import {
  useFilterWithURL,
  useLieferscheineLogic,
  usePaginationWithURL,
} from "@repo/hooks";
import { useTranslation } from "@repo/i18n";

export const LIEFERSCHEINE_STATUSES = [
  { label: "Mới", value: "prepared", color: "#f6c343" },
  { label: "Đang xử lý", value: "storekeeper", color: "#438ff0" },
  { label: "Đang giao", value: "delivered", color: "#7c5cff" },
  { label: "Giao thành công", value: "received", color: "#38b26c" },
];

export const useLieferscheinePage = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [expandedCode, setExpandedCode] = useState<string>();

  const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
    defaultPage: 1,
    defaultPageSize: 25,
  });

  const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });
  const logic = useLieferscheineLogic({ page, pageSize, filters, expandedCode });
  const filterSignature = JSON.stringify(filters);

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSignature, form]);

  const normalizeFilters = (values: Record<string, any>) => {
    const next = { ...values };
    if (dayjs.isDayjs(next.issueDateFrom)) {
      next.issueDateFrom = next.issueDateFrom.toISOString();
    }
    if (dayjs.isDayjs(next.issueDateTo)) {
      next.issueDateTo = next.issueDateTo.toISOString();
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

  const syncFiltersToForm = () => {
    form.resetFields();
    form.setFieldsValue(filters);
  };

  const handleExpand = (expanded: boolean, record: any) => {
    setExpandedCode(expanded ? record.code : undefined);
  };

  return {
    t,
    form,
    page,
    pageSize,
    setPage,
    setPageSize,
    filters,
    expandedCode,
    statuses: LIEFERSCHEINE_STATUSES,
    ...logic,
    handleSearch,
    handleReset,
    syncFiltersToForm,
    handleExpand,
  };
};
