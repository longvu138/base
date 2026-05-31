import { useEffect } from "react";
import { Form } from "antd";
import { useTranslation } from "@repo/i18n";
import { useFilterWithURL, usePaginationWithURL } from "@repo/hooks";
import { normalizeClaimFilters } from "../domain/filters";
import { useClaimsLogic } from "./useClaimsLogic";

export const useClaimsModel = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
    defaultPage: 1,
    defaultPageSize: 25,
  });

  const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });
  const logic = useClaimsLogic({ page, pageSize, filters });
  const filterSignature = JSON.stringify(filters);

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(filters);
  }, [filterSignature, form, filters]);

  const applyClaimFilters = (values: Record<string, any>) => {
    applyFilters(normalizeClaimFilters(values));
  };

  const handleSearch = () => {
    applyClaimFilters(form.getFieldsValue(true));
  };

  const handleReset = () => {
    clearFilters();
  };

  const state = {
    page,
    pageSize,
    filters,
    listData: logic.listData,
    isClaimLoading: logic.isClaimLoading,
    isClaimsLoading: logic.isClaimsLoading,
    apiParams: logic.apiParams,
  };

  const options = {
    statusData: logic.statusData || [],
    solutionData: logic.solutionData || [],
    statusOptions: logic.statusOptions,
    solutionOptions: logic.solutionOptions,
  };

  const actions = {
    setPage,
    setPageSize,
    applyFilters: applyClaimFilters,
    search: handleSearch,
    reset: handleReset,
  };

  return {
    state,
    options,
    actions,
    t,
    form,
    page,
    pageSize,
    setPage,
    setPageSize,
    filters,
    ...logic,
    handleSearch,
    handleReset,
    applyFilters: applyClaimFilters,
  };
};
