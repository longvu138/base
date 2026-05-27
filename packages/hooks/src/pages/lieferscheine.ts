import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Form } from "antd";
import { useTranslation } from "@repo/i18n";
import {
  useCouriersQuery,
  useLieferscheineDeliveriesQuery,
  useLieferscheineInfiniteQuery,
  useLieferscheinePackagesQuery,
  useLieferscheineQuery,
} from "../useLieferscheineHooks";
import { useFilterWithURL } from "../useFilterWithURL";
import { usePaginationWithURL } from "../usePaginationWithURL";

export interface UseLieferscheineLogicProps {
  page: number;
  pageSize: number;
  filters: Record<string, any>;
  expandedCode?: string;
}

const STATUS_PARAMS: Record<string, Record<string, boolean>> = {
  prepared: { prepared: true, storekeeper: false, delivered: false, received: false },
  storekeeper: { storekeeper: true, delivered: false, received: false },
  delivered: { delivered: true, received: false },
  received: { received: true },
  cancelled: { cancelled: true },
};

export const LIEFERSCHEINE_STATUSES = [
  { label: "Mới", value: "prepared", color: "#f6c343" },
  { label: "Đang xử lý", value: "storekeeper", color: "#438ff0" },
  { label: "Đang giao", value: "delivered", color: "#7c5cff" },
  { label: "Giao thành công", value: "received", color: "#38b26c" },
];

const normalizeLieferscheineFilters = (values: Record<string, any>) => {
  const next = { ...values };
  if (dayjs.isDayjs(next.issueDateFrom)) {
    next.issueDateFrom = next.issueDateFrom.toISOString();
  }
  if (dayjs.isDayjs(next.issueDateTo)) {
    next.issueDateTo = next.issueDateTo.toISOString();
  }
  return next;
};

const buildLieferscheineParams = ({
  page,
  pageSize,
  filters,
}: {
  page: number;
  pageSize: number;
  filters: Record<string, any>;
}) => {
  const params: Record<string, any> = {
    page,
    size: pageSize,
    sort: "createdAt:desc",
    ...normalizeLieferscheineFilters(filters),
  };

  if (params.status) {
    Object.assign(params, STATUS_PARAMS[params.status] || {});
    delete params.status;
  }

  return params;
};

export const useLieferscheineLogic = ({
  page,
  pageSize,
  filters,
  expandedCode,
}: UseLieferscheineLogicProps) => {
  const apiParams = useMemo(() => {
    return buildLieferscheineParams({
      page: page - 1,
      pageSize,
      filters,
    });
  }, [filters, page, pageSize]);

  const { data: listData, isLoading: isLieferscheineLoading } =
    useLieferscheineQuery(apiParams);
  const { data: packages = [], isLoading: isPackagesLoading } =
    useLieferscheinePackagesQuery(expandedCode);
  const { data: deliveries = [], isLoading: isDeliveriesLoading } =
    useLieferscheineDeliveriesQuery(expandedCode);
  const { data: couriers = [] } = useCouriersQuery();

  return {
    apiParams,
    listData,
    packages,
    deliveries,
    couriers,
    isLieferscheineLoading,
    isPackagesLoading,
    isDeliveriesLoading,
  };
};

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
  }, [filterSignature, form, filters]);

  const handleSearch = () => {
    applyFilters(normalizeLieferscheineFilters(form.getFieldsValue(true)));
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

export const useLieferscheineMobilePage = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [expandedCode, setExpandedCode] = useState<string>();
  const pageSize = 25;

  const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });
  const filterSignature = JSON.stringify(filters);

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(filters);
  }, [filterSignature, form, filters]);

  const apiParams = useMemo(
    () => buildLieferscheineParams({ page: 0, pageSize, filters }),
    [filterSignature, filters],
  );

  const infiniteQuery = useLieferscheineInfiniteQuery(apiParams);
  const pages = infiniteQuery.data?.pages || [];
  const rows = pages.flatMap((page) => page.data || []);
  const firstPage = pages[0];
  const { data: packages = [], isLoading: isPackagesLoading } =
    useLieferscheinePackagesQuery(expandedCode);
  const { data: deliveries = [], isLoading: isDeliveriesLoading } =
    useLieferscheineDeliveriesQuery(expandedCode);
  const { data: couriers = [] } = useCouriersQuery();

  const handleSearch = () => {
    setExpandedCode(undefined);
    applyFilters(normalizeLieferscheineFilters(form.getFieldsValue(true)));
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
    page: 1,
    pageSize,
    setPage: () => undefined,
    setPageSize: () => undefined,
    filters,
    expandedCode,
    statuses: LIEFERSCHEINE_STATUSES,
    apiParams,
    listData: {
      data: rows,
      total: firstPage?.total || 0,
      pageSize: firstPage?.pageSize || pageSize,
      current: firstPage?.current || 0,
      totalPage: firstPage?.totalPage || 0,
    },
    packages,
    deliveries,
    couriers,
    isLieferscheineLoading: infiniteQuery.isLoading,
    isPackagesLoading,
    isDeliveriesLoading,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    hasNextPage: infiniteQuery.hasNextPage,
    fetchNextPage: infiniteQuery.fetchNextPage,
    handleSearch,
    handleReset,
    syncFiltersToForm,
    handleExpand,
  };
};
