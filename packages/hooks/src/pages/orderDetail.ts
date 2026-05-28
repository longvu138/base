import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  useCancelOrderMutation,
  useOrderDetailQuery,
  useOrderStatusesQuery,
  useReorderMutation,
  useUpdateOrderMutation,
} from "../useOrderHooks";
import { useCustomerLevelsQuery } from "../useCustomerHooks";
import { moneyFormat } from "@repo/util";

const DISPLAY_EMPTY = "---";

export const displayOrderDetailValue = (value: any, suffix = "") => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    (typeof value === "number" && Number.isNaN(value))
  ) {
    return DISPLAY_EMPTY;
  }

  return `${value}${suffix}`;
};

export const displayOrderDetailMoney = (value: any) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return DISPLAY_EMPTY;
  }

  return moneyFormat(value);
};

export const displayOrderDetailYuan = (value: any) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return DISPLAY_EMPTY;
  }

  return moneyFormat(value, "CNY");
};

export const displayOrderDetailPercent = (value: any) => {
  if (value === null || value === undefined || value === "") {
    return DISPLAY_EMPTY;
  }

  return `${Math.round(Number(value) * 100)}%`;
};

export const useOrderDetailPage = () => {
  const { code = "" } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "products";

  const detailQuery = useOrderDetailQuery(code);
  const statusesQuery = useOrderStatusesQuery();
  const updateMutation = useUpdateOrderMutation();
  const cancelMutation = useCancelOrderMutation(code);
  const reorderMutation = useReorderMutation(code);
  const customerLevelsQuery = useCustomerLevelsQuery();

  const order = detailQuery.data;
  const customerLevels = customerLevelsQuery.data || [];

  const memberLevelName = useMemo(() => {
    if (!order) return DISPLAY_EMPTY;
    if (order.customerGroup?.name && order.customerGroup?.code !== "default") {
      return order.customerGroup.name;
    }
    if (order.customerLevelId === null || order.customerLevelId === undefined) {
      return "Chưa có cấp";
    }
    const level = customerLevels.find((item: any) => item.id === order.customerLevelId);
    return level ? level.name : "Chưa có cấp";
  }, [order, customerLevels]);

  const statusInfo = useMemo(
    () => statusesQuery.data?.find((status: any) => status.code === order?.status),
    [order?.status, statusesQuery.data],
  );

  const services = useMemo(() => {
    if (!order?.services) return DISPLAY_EMPTY;

    if (Array.isArray(order?.services)) {
      const serviceNames = order?.services
        .map((service: any) => (typeof service === "object" ? service.name : service))
        .filter(Boolean);

      return serviceNames.length > 0 ? serviceNames.join(", ") : DISPLAY_EMPTY;
    }

    return displayOrderDetailValue(order?.services);
  }, [order?.services]);

  const handleTabChange = (key: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", key);
    setSearchParams(nextParams, { replace: true });
  };

  const handleUpdate = (field: string, value: string, originalValue?: string) => {
    if (!code || value === (originalValue || "")) return;

    updateMutation.mutate({
      code,
      data: {
        [field]: value,
      },
    });
  };

  const handleCancelOrder = async () => {
    if (!code || cancelMutation.isPending) return;
    await cancelMutation.mutateAsync();
  };

  const handleReorder = async () => {
    if (!code || reorderMutation.isPending) return;
    await reorderMutation.mutateAsync();
  };

  return {
    activeTab,
    code,
    detailQuery,
    handleCancelOrder,
    handleReorder,
    handleTabChange,
    handleUpdate,
    isCancellingOrder: cancelMutation.isPending,
    isReordering: reorderMutation.isPending,
    isUpdating: updateMutation.isPending,
    navigate,
    order,
    services,
    statusInfo,
    memberLevelName,
  };
};
