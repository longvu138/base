import { useEffect, useMemo, useState } from "react";
import { App, Form } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@repo/i18n";
import {
  useCustomerProfile,
  useExportOrdersMutation,
  useFilterWithURL,
  useListOrderQuery,
  useMarketplacesQuery,
  useOrderServicesQuery,
  useOrderStatisticQuery,
  useOrderStatusesQuery,
  usePaginationWithURL,
  useUpdateOrderNoteMutation,
} from "@repo/hooks";
import { buildOrderApiParams, normalizeOrderFilters } from "../domain/filters";

const downloadOrdersBlob = (response: any) => {
  const disposition = response.headers?.["content-disposition"] || "";
  const fileName =
    disposition.split("filename=")[1]?.replaceAll('"', "") ||
    `orders_${Date.now()}.xlsx`;
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", decodeURIComponent(fileName));
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const getExportErrorTitle = async (error: any) => {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      const text = await data.text();
      return JSON.parse(text)?.title;
    } catch {
      return "";
    }
  }
  return data?.title || error?.title;
};

export const useOrdersModel = () => {
  const { t } = useTranslation();
  const { notification } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isAdvancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
    defaultPage: 1,
    defaultPageSize: 20,
  });

  const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });
  const filterSignature = JSON.stringify(filters);

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(filters);
  }, [filterSignature, form]);

  const apiParams = useMemo(
    () => buildOrderApiParams({ page, pageSize, filters }),
    [page, pageSize, filters],
  );

  const { data: orderData, isLoading: isOrderLoading } =
    useListOrderQuery(apiParams);
  const { data: statusData } = useOrderStatusesQuery();
  const { data: statisticData } = useOrderStatisticQuery();
  const { data: servicesData } = useOrderServicesQuery();
  const { data: marketplacesData } = useMarketplacesQuery();
  const updateOrderNote = useUpdateOrderNoteMutation();

  const statusOptions = useMemo(() => {
    if (!statusData) return [];
    return statusData.map((status: any) => {
      const statistic = statisticData?.find(
        (item: any) => item.status === status.code,
      );
      return {
        label: status.name,
        value: status.code,
        count: statistic ? statistic.total : "0",
      };
    });
  }, [statusData, statisticData]);

  const deliveryReadyCount = useMemo(() => {
    const statistic =
      statisticData?.find((item: any) => item.status === "DELIVERY_READY") ||
      statisticData?.find((item: any) => item.status === "READY_FOR_DELIVERY");
    return Number(statistic?.total || 0);
  }, [statisticData]);

  const applyOrderFilters = (values: Record<string, any>) => {
    applyFilters(normalizeOrderFilters(values));
  };

  const handleSearch = () => {
    applyOrderFilters(form.getFieldsValue(true));
  };

  const handleReset = () => {
    clearFilters();
  };

  const syncFiltersToForm = () => {
    form.resetFields();
    form.setFieldsValue(filters);
  };

  const toggleAdvancedFilter = () => {
    setAdvancedFilterOpen((open) => !open);
  };

  const { data: profile } = useCustomerProfile();
  const exportMutation = useExportOrdersMutation();

  const closeExportModal = () => {
    setExportOpen(false);
  };

  const handleExport = async (secret: string) => {
    if (!secret) {
      notification.error({ message: t("cartCheckout.incorrect_pin") });
      return;
    }

    try {
      const username = profile?.username || "";
      const response = await exportMutation.mutateAsync({
        params: {
          ...apiParams,
          refCustomerCode: username,
        },
        secret,
      });

      downloadOrdersBlob(response);
      setExportOpen(false);
    } catch (error: any) {
      const title = await getExportErrorTitle(error);
      notification.error({
        message:
          title === "invalid_pin" || title === "invalid_password"
            ? t("cartCheckout.incorrect_pin")
            : t("shipments.export_error") || "Lỗi xuất file",
      });
    }
  };

  return {
    t,
    form,
    page,
    pageSize,
    setPage,
    setPageSize,
    filters,
    applyFilters: applyOrderFilters,
    orderData,
    isOrderLoading,
    isOrdersLoading: isOrderLoading,
    statusData,
    statisticData,
    servicesData,
    marketplacesData,
    statusOptions,
    deliveryReadyCount,
    apiParams,
    updateOrderNote,
    handleSearch,
    handleReset,
    syncFiltersToForm,
    navigateToDetail: (code: string) => navigate(`/orders/${code}`),
    navigateToCreateDelivery: () => navigate("/delivery/create"),
    isAdvancedFilterOpen,
    toggleAdvancedFilter,
    exportOpen,
    setExportOpen,
    handleExport,
    closeExportModal,
    exportMutation,
  };
};
