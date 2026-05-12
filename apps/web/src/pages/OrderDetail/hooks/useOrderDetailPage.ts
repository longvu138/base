import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  useOrderDetailQuery,
  useOrderStatusesQuery,
  useUpdateOrderMutation,
} from "@repo/hooks";

const DISPLAY_EMPTY = "---";

export const displayValue = (value: any, suffix = "") => {
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

export const displayMoney = (value: any) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return DISPLAY_EMPTY;
  }

  return `${Number(value).toLocaleString("vi-VN")} đ`;
};

export const displayPercent = (value: any) => {
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

  const order = detailQuery.data;

  const statusInfo = useMemo(
    () => statusesQuery.data?.find((status: any) => status.code === order?.status),
    [order?.status, statusesQuery.data],
  );

  const services = useMemo(() => {
    if (!order?.services) return DISPLAY_EMPTY;

    if (Array.isArray(order.services)) {
      const serviceNames = order.services
        .map((service: any) => (typeof service === "object" ? service.name : service))
        .filter(Boolean);

      return serviceNames.length > 0 ? serviceNames.join(", ") : DISPLAY_EMPTY;
    }

    return displayValue(order.services);
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

  return {
    activeTab,
    code,
    detailQuery,
    handleTabChange,
    handleUpdate,
    isUpdating: updateMutation.isPending,
    navigate,
    order,
    services,
    statusInfo,
  };
};
