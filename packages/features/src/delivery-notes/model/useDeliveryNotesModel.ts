import { useEffect, useState } from "react";
import { Form } from "antd";
import { useTranslation } from "@repo/i18n";
import { useFilterWithURL, usePaginationWithURL } from "@repo/hooks";
import { normalizeDeliveryNoteFilters } from "../domain/filters";
import { useDeliveryNotesLogic } from "./useDeliveryNotesLogic";

export const useDeliveryNotesModel = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [expandedId, setExpandedId] = useState<string | number>();

  const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
    defaultPage: 1,
    defaultPageSize: 25,
  });

  const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });
  const logic = useDeliveryNotesLogic({ page, pageSize, filters });
  const filterSignature = JSON.stringify(filters);

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(filters);
  }, [filterSignature, form, filters]);

  const applyDeliveryNoteFilters = (values: Record<string, any>) => {
    applyFilters(normalizeDeliveryNoteFilters(values));
  };

  const handleSearch = () => {
    applyDeliveryNoteFilters(form.getFieldsValue(true));
  };

  const handleReset = () => {
    setExpandedId(undefined);
    clearFilters();
  };

  const syncFiltersToForm = () => {
    form.resetFields();
    form.setFieldsValue(filters);
  };

  const handleExpand = (expanded: boolean, record: any) => {
    setExpandedId(expanded ? record?.delivery_note?.id : undefined);
  };

  const state = {
    page,
    pageSize,
    filters,
    expandedId,
    listData: logic.listData,
    isDeliveryNoteLoading: logic.isDeliveryNoteLoading,
    isDeliveryNotesLoading: logic.isDeliveryNotesLoading,
    apiParams: logic.apiParams,
  };

  const options = {};

  const actions = {
    setPage,
    setPageSize,
    applyFilters: applyDeliveryNoteFilters,
    search: handleSearch,
    reset: handleReset,
    syncFiltersToForm,
    expand: handleExpand,
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
    expandedId,
    ...logic,
    handleSearch,
    handleReset,
    syncFiltersToForm,
    handleExpand,
    applyFilters: applyDeliveryNoteFilters,
  };
};
