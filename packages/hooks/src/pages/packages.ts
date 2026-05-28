import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { App, Form } from "antd";
import { useNavigate } from "react-router-dom";
import {
  useExportPackagesMutation,
  usePackagesInfiniteQuery,
  usePackagesQuery,
  useParcelStatusesQuery,
  usePackageStatusesQuery,
} from "../usePackageHooks";
import { useFilterWithURL } from "../useFilterWithURL";
import { useTranslation } from "@repo/i18n";

export interface UsePackagesLogicProps {
  page: number;
  pageSize: number;
  filters: Record<string, any>;
}

const MOBILE_PAGE_SIZE = 25;

const getExportFilename = (headers: Record<string, any>) => {
  const disposition = headers?.["content-disposition"] || "";
  const matched = /filename\*?=(?:UTF-8'')?("?)([^";]+)\1/i.exec(disposition);
  return matched?.[2] ? decodeURIComponent(matched[2]) : undefined;
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const normalizePackageFilters = (values: Record<string, any>) => {
  const next = { ...values };

  if (next.createdFromTo) {
    next.createdFrom = next.createdFromTo[0];
    next.createdTo = next.createdFromTo[1];
    delete next.createdFromTo;
  }

  if (dayjs.isDayjs(next.createdFrom)) {
    next.createdFrom = next.createdFrom.startOf("day").toISOString();
  }

  if (dayjs.isDayjs(next.createdTo)) {
    next.createdTo = next.createdTo.endOf("day").toISOString();
  }

  if (Array.isArray(next.statuses) && next.statuses.length === 0) {
    delete next.statuses;
  }

  if (
    next.typeSearch === "equal" &&
    next.handlingTimeFrom !== undefined &&
    next.handlingTimeFrom !== null &&
    next.handlingTimeFrom !== ""
  ) {
    next.handlingTimeTo = next.handlingTimeFrom;
  }

  if (!next.handlingTimeFrom && !next.handlingTimeTo) {
    delete next.typeSearch;
    delete next.cutOffStatus;
    delete next.handlingTimeFrom;
    delete next.handlingTimeTo;
  }

  return next;
};

export const buildPackageApiParams = ({
  page,
  pageSize,
  filters,
}: {
  page: number;
  pageSize: number;
  filters: Record<string, any>;
}) => {
  const params: Record<string, any> = {
    page: page - 1,
    size: pageSize,
    sort: "createdAt:desc",
    ...normalizePackageFilters(filters),
  };

  if (Array.isArray(params.statuses)) {
    params.statuses = params.statuses.join(",");
  }

  return params;
};

/**
 * Shared logic for Packages Page
 */
export const usePackagesLogic = ({
  page,
  pageSize,
  filters,
}: UsePackagesLogicProps) => {
  // 1. Format params for API
  const apiParams = useMemo(() => {
    return buildPackageApiParams({ page, pageSize, filters });
  }, [page, pageSize, filters]);

  // 2. Fetch data
  const { data: packageData, isLoading: isPackageLoading } =
    usePackagesQuery(apiParams);
  const { data: statusData } = usePackageStatusesQuery();
  const { data: parcelStatusData } = useParcelStatusesQuery();
  const allStatusData = useMemo(() => {
    const packageStatuses = statusData || [];
    const parcelStatuses = parcelStatusData || [];
    const maxLength = Math.max(packageStatuses.length, parcelStatuses.length);

    return Array.from({ length: maxLength }, (_, index) => ({
      ...(packageStatuses[index] || {}),
      ...(parcelStatuses[index] || {}),
    })).filter((item: any) => item.code);
  }, [parcelStatusData, statusData]);
  // 3. Derived State
  const statusOptions = useMemo(
    () => allStatusData.map((s: any) => ({ label: s.name, value: s.code })),
    [allStatusData],
  );

  return {
    packageData,
    listData: packageData, // alias cho StyleGobiz
    isPackageLoading,
    isPackagesLoading: isPackageLoading, // alias cho StyleGobiz
    statusData: allStatusData,
    packageStatusData: statusData,
    parcelStatusData,
    statusOptions,
    apiParams,
  };
};

export const usePackagesMobilePage = () => {
  const { t } = useTranslation();
  const { notification } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [exportOpen, setExportOpen] = useState(false);
  const pageSize = MOBILE_PAGE_SIZE;
  const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });
  const filterSignature = JSON.stringify(filters);

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(filters);
  }, [filterSignature, form]);

  const apiParams = useMemo(
    () => buildPackageApiParams({ page: 1, pageSize, filters }),
    [filterSignature, filters, pageSize],
  );

  const infiniteQuery = usePackagesInfiniteQuery(apiParams);
  const { data: packageStatusData } = usePackageStatusesQuery();
  const { data: parcelStatusData } = useParcelStatusesQuery();
  const exportMutation = useExportPackagesMutation();
  const pages = infiniteQuery.data?.pages || [];
  const rows = pages.flatMap((page) => page.data || []);
  const firstPage = pages[0];

  const statusData = useMemo(() => {
    const packageStatuses = packageStatusData || [];
    const parcelStatuses = parcelStatusData || [];
    const maxLength = Math.max(packageStatuses.length, parcelStatuses.length);

    return Array.from({ length: maxLength }, (_, index) => ({
      ...(packageStatuses[index] || {}),
      ...(parcelStatuses[index] || {}),
    })).filter((item: any) => item.code);
  }, [packageStatusData, parcelStatusData]);

  const statusOptions = useMemo(
    () => statusData.map((status: any) => ({ label: status.name, value: status.code })),
    [statusData],
  );

  const handleSearch = () => {
    applyFilters(normalizePackageFilters(form.getFieldsValue(true)));
  };

  const handleReset = () => {
    clearFilters();
  };

  const handleExport = async (secret: string) => {
    if (!secret) {
      notification.error({ message: t("cartCheckout.incorrect_pin") });
      return;
    }

    try {
      const res = await exportMutation.mutateAsync({
        params: apiParams,
        secret,
      });
      downloadBlob(
        res.data,
        getExportFilename(res.headers) || `packages-${dayjs().format("YYYYMMDD-HHmm")}.xlsx`,
      );
      setExportOpen(false);
    } catch (error: any) {
      const data = error?.response?.data;
      let title = "";
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          title = JSON.parse(text)?.title;
        } catch {}
      } else {
        title = data?.title || error?.title;
      }
      notification.error({
        message:
          title === "invalid_pin" || title === "invalid_password"
            ? t("cartCheckout.incorrect_pin")
            : t("shipments.export_error") || "Lỗi xuất file",
      });
    }
  };

  const navigateToOrder = (record: any) => {
    const code = record?.orderCode;
    if (!code) return;
    navigate(record?.isShipment ? `/shipments/${code}` : `/orders/${code}`);
  };

  return {
    t,
    form,
    filters,
    packageData: {
      data: rows,
      total: firstPage?.total || 0,
      pageSize: firstPage?.pageSize || pageSize,
      current: firstPage?.current || 0,
      totalPage: firstPage?.totalPage || 0,
    },
    listData: {
      data: rows,
      total: firstPage?.total || 0,
      pageSize: firstPage?.pageSize || pageSize,
      current: firstPage?.current || 0,
      totalPage: firstPage?.totalPage || 0,
    },
    isPackageLoading: infiniteQuery.isLoading,
    isPackagesLoading: infiniteQuery.isLoading,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    hasNextPage: infiniteQuery.hasNextPage,
    fetchNextPage: infiniteQuery.fetchNextPage,
    statusData,
    packageStatusData,
    parcelStatusData,
    statusOptions,
    apiParams,
    exportOpen,
    isExporting: exportMutation.isPending,
    setExportOpen,
    handleExport,
    handleExportOpen: () => setExportOpen(true),
    handleSearch,
    handleReset,
    navigateToOrder,
    applyFilters,
    normalizeFilters: normalizePackageFilters,
  };
};
