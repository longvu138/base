import { useEffect, useMemo, useState } from "react";
import { Form } from "antd";
import { useTranslation } from "@repo/i18n";
import { useDeliveryNotesInfiniteQuery, useFilterWithURL } from "@repo/hooks";
import {
  buildDeliveryNoteApiParams,
  normalizeDeliveryNoteFilters,
} from "../domain/filters";

const MOBILE_PAGE_SIZE = 25;

export const useDeliveryNotesMobileModel = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [expandedId, setExpandedId] = useState<string | number>();
  const pageSize = MOBILE_PAGE_SIZE;

  const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });
  const filterSignature = JSON.stringify(filters);

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(filters);
  }, [filterSignature, form, filters]);

  const apiParams = useMemo(
    () =>
      buildDeliveryNoteApiParams({
        page: 1,
        pageSize,
        filters: normalizeDeliveryNoteFilters(filters),
      }),
    [filterSignature, filters, pageSize],
  );

  const infiniteQuery = useDeliveryNotesInfiniteQuery(apiParams);
  const pages = infiniteQuery.data?.pages || [];
  const rows = pages.flatMap((page) => page.data || []);
  const firstPage = pages[0];

  const applyDeliveryNoteFilters = (values: Record<string, any>) => {
    applyFilters(normalizeDeliveryNoteFilters(values));
  };

  const handleSearch = () => {
    setExpandedId(undefined);
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

  const listData = {
    data: rows,
    total: firstPage?.total || 0,
    pageSize: firstPage?.pageSize || pageSize,
    current: firstPage?.current || 0,
    totalPage: firstPage?.totalPage || 0,
  };

  const state = {
    page: 1,
    pageSize,
    filters,
    expandedId,
    listData,
    isDeliveryNoteLoading: infiniteQuery.isLoading,
    isDeliveryNotesLoading: infiniteQuery.isLoading,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    hasNextPage: infiniteQuery.hasNextPage,
    apiParams,
  };

  const options = {};

  const actions = {
    setPage: () => undefined,
    setPageSize: () => undefined,
    applyFilters: applyDeliveryNoteFilters,
    search: handleSearch,
    reset: handleReset,
    syncFiltersToForm,
    expand: handleExpand,
    fetchNextPage: infiniteQuery.fetchNextPage,
  };

  return {
    state,
    options,
    actions,
    t,
    form,
    page: 1,
    pageSize,
    setPage: actions.setPage,
    setPageSize: actions.setPageSize,
    filters,
    expandedId,
    listData,
    isDeliveryNoteLoading: infiniteQuery.isLoading,
    isDeliveryNotesLoading: infiniteQuery.isLoading,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    hasNextPage: infiniteQuery.hasNextPage,
    fetchNextPage: infiniteQuery.fetchNextPage,
    apiParams,
    handleSearch,
    handleReset,
    syncFiltersToForm,
    handleExpand,
    applyFilters: applyDeliveryNoteFilters,
  };
};
