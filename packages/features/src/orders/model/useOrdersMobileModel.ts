import { useEffect, useMemo } from "react";
import { App, Form } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@repo/i18n";
import {
  useCustomerProfile,
  useExportOrdersMutation,
  useFilterWithURL,
  useMarketplacesQuery,
  useOrderServicesQuery,
  useOrderStatisticQuery,
  useOrderStatusesQuery,
  useOrdersInfiniteQuery,
  useUpdateOrderNoteMutation,
} from "@repo/hooks";
import { buildOrderApiParams, normalizeOrderFilters } from "../domain/filters";
import {
  buildOrderStatusOptions,
  getDeliveryReadyCount,
} from "../domain/options";
import { downloadOrdersBlob, getExportErrorTitle } from "./exportOrders";

export type OrdersMobileModelOptions = {
  defaultPageSize?: number;
};

const DEFAULT_MOBILE_PAGE_SIZE = 25;

export const useOrdersMobileModel = ({
  defaultPageSize = DEFAULT_MOBILE_PAGE_SIZE,
}: OrdersMobileModelOptions = {}) => {
  const { t } = useTranslation();
  const { notification } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const pageSize = defaultPageSize;
  const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });
  const filterSignature = JSON.stringify(filters);

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(filters);
  }, [filterSignature, form]);

  const apiParams = useMemo(
    () => buildOrderApiParams({ page: 1, pageSize, filters }),
    [filterSignature, filters, pageSize],
  );

  const infiniteQuery = useOrdersInfiniteQuery(apiParams);
  const { data: statusData } = useOrderStatusesQuery();
  const { data: statisticData } = useOrderStatisticQuery();
  const { data: servicesData } = useOrderServicesQuery();
  const { data: marketplacesData } = useMarketplacesQuery();
  const updateOrderNote = useUpdateOrderNoteMutation();
  const { data: profile } = useCustomerProfile();
  const exportMutation = useExportOrdersMutation();
  const pages = infiniteQuery.data?.pages || [];
  const rows = pages.flatMap((page) => page.data || []);
  const firstPage = pages[0];

  const statusOptions = useMemo(
    () => buildOrderStatusOptions(statusData, statisticData),
    [statusData, statisticData],
  );

  const deliveryReadyCount = useMemo(
    () => getDeliveryReadyCount(statisticData),
    [statisticData],
  );

  const applyOrderFilters = (values: Record<string, any>) => {
    applyFilters(normalizeOrderFilters(values));
  };

  const handleSearch = () => {
    applyOrderFilters(form.getFieldsValue(true));
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
      const response = await exportMutation.mutateAsync({
        params: {
          ...apiParams,
          refCustomerCode: profile?.username || "",
        },
        secret,
      });
      downloadOrdersBlob(response);
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

  const orderData = {
    data: rows,
    total: firstPage?.total || 0,
    pageSize: firstPage?.pageSize || pageSize,
    current: firstPage?.current || 0,
    totalPage: firstPage?.totalPage || 0,
  };

  const state = {
    filters,
    orderData,
    isOrderLoading: infiniteQuery.isLoading,
    isOrdersLoading: infiniteQuery.isLoading,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    hasNextPage: infiniteQuery.hasNextPage,
    deliveryReadyCount,
    apiParams,
  };

  const options = {
    statusData,
    statisticData,
    servicesData,
    marketplacesData,
    statusOptions,
  };

  const actions = {
    applyFilters: applyOrderFilters,
    search: handleSearch,
    reset: handleReset,
    fetchNextPage: infiniteQuery.fetchNextPage,
    goToDetail: (code: string) => navigate(`/orders/${code}`),
    goToCreateDelivery: () => navigate("/delivery/create"),
    export: handleExport,
    updateNote: updateOrderNote.mutateAsync,
  };

  return {
    state,
    options,
    actions,
    t,
    form,
    filters,
    applyFilters: applyOrderFilters,
    handleSearch,
    handleReset,
    orderData,
    isOrderLoading: infiniteQuery.isLoading,
    isOrdersLoading: infiniteQuery.isLoading,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    hasNextPage: infiniteQuery.hasNextPage,
    fetchNextPage: infiniteQuery.fetchNextPage,
    statusData,
    statisticData,
    servicesData,
    marketplacesData,
    statusOptions,
    deliveryReadyCount,
    apiParams,
    updateOrderNote,
    navigateToDetail: actions.goToDetail,
    navigateToCreateDelivery: actions.goToCreateDelivery,
    handleExport,
    exportMutation,
  };
};
