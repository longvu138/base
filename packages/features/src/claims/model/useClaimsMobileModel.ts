import { useEffect, useMemo } from "react";
import { Form } from "antd";
import { useTranslation } from "@repo/i18n";
import {
  useClaimStatusesQuery,
  useClaimsInfiniteQuery,
  useFilterWithURL,
  useSolutionsQuery,
} from "@repo/hooks";
import { buildClaimApiParams, normalizeClaimFilters } from "../domain/filters";
import {
  buildClaimSolutionOptions,
  buildClaimStatusOptions,
} from "../domain/options";

const MOBILE_PAGE_SIZE = 25;

export const useClaimsMobileModel = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const pageSize = MOBILE_PAGE_SIZE;
  const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });
  const filterSignature = JSON.stringify(filters);

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(filters);
  }, [filterSignature, form, filters]);

  const apiParams = useMemo(
    () =>
      buildClaimApiParams({
        page: 1,
        pageSize,
        filters: normalizeClaimFilters(filters),
      }),
    [filterSignature, filters, pageSize],
  );

  const infiniteQuery = useClaimsInfiniteQuery(apiParams);
  const { data: statusData } = useClaimStatusesQuery();
  const { data: solutionData } = useSolutionsQuery();
  const pages = infiniteQuery.data?.pages || [];
  const rows = pages.flatMap((page) => page.data || []);
  const firstPage = pages[0];

  const statusOptions = useMemo(
    () => buildClaimStatusOptions(statusData),
    [statusData],
  );

  const solutionOptions = useMemo(
    () => buildClaimSolutionOptions(solutionData),
    [solutionData],
  );

  const applyClaimFilters = (values: Record<string, any>) => {
    applyFilters(normalizeClaimFilters(values));
  };

  const handleSearch = () => {
    applyClaimFilters(form.getFieldsValue(true));
  };

  const handleReset = () => {
    clearFilters();
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
    listData,
    isClaimLoading: infiniteQuery.isLoading,
    isClaimsLoading: infiniteQuery.isLoading,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    hasNextPage: infiniteQuery.hasNextPage,
    apiParams,
  };

  const options = {
    statusData: statusData || [],
    solutionData: solutionData || [],
    statusOptions,
    solutionOptions,
  };

  const actions = {
    setPage: () => undefined,
    setPageSize: () => undefined,
    applyFilters: applyClaimFilters,
    search: handleSearch,
    reset: handleReset,
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
    listData,
    isClaimLoading: infiniteQuery.isLoading,
    isClaimsLoading: infiniteQuery.isLoading,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    hasNextPage: infiniteQuery.hasNextPage,
    fetchNextPage: infiniteQuery.fetchNextPage,
    statusData: statusData || [],
    solutionData: solutionData || [],
    statusOptions,
    solutionOptions,
    apiParams,
    handleSearch,
    handleReset,
    applyFilters: applyClaimFilters,
  };
};
