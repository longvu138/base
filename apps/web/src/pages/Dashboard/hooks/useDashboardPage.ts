import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@repo/i18n";
import {
  useCustomerBalance,
  useOrderStatisticQuery,
  useOrderStatusesQuery,
} from "@repo/hooks";
import { appConfig } from "@repo/config";

export type DashboardProduct = {
  itemId?: string | number;
  image?: string;
  translateName?: string;
  price?: number;
  monthSold?: number;
};

export type DashboardStatusAmountConfig = {
  field: string;
  color: "success" | "error";
  negative?: boolean;
  tooltip: string;
};

const STATUS_SHOW = [
  "DEPOSITED",
  "INITIALIZE",
  "PUTAWAY",
  "TRANSPORTING",
  "READY_FOR_DELIVERY",
  "DELIVERING",
];

export const useDashboardPage = () => {
  const { t } = useTranslation();
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const { data: balanceData, isLoading: isBalanceLoading } = useCustomerBalance();
  const { data: orderStatuses = [], isLoading: isStatusesLoading } =
    useOrderStatusesQuery();
  const { data: orderStatistics = [], isLoading: isStatisticsLoading } =
    useOrderStatisticQuery();

  const { data: suggestProducts = [], isLoading: isSuggestLoading } = useQuery({
    queryKey: ["dashboard.suggest-products"],
    queryFn: async () => {
      if (!appConfig.goodwayUrl) return [];

      const response = await fetch(
        `${appConfig.goodwayUrl}/chase/public/recommend-product?limit=48`,
      );
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    retry: false,
  });

  const statusAmountConfig: Record<string, DashboardStatusAmountConfig> = useMemo(
    () => ({
      DEPOSITED: {
        field: "totalPaid",
        color: "success",
        tooltip: t("dashboard.depositedAmountTooltip"),
      },
      PUTAWAY: {
        field: "totalUnpaid",
        color: "error",
        negative: true,
        tooltip: t("dashboard.putawayAmountTooltip"),
      },
      TRANSPORTING: {
        field: "totalUnpaid",
        color: "error",
        negative: true,
        tooltip: t("dashboard.transportingAmountTooltip"),
      },
      READY_FOR_DELIVERY: {
        field: "totalUnpaid",
        color: "error",
        negative: true,
        tooltip: t("dashboard.readyForDeliveryAmountTooltip"),
      },
      DELIVERING: {
        field: "grandTotal",
        color: "success",
        tooltip: t("dashboard.deliveringAmountTooltip"),
      },
    }),
    [t],
  );

  const getOrderStatusStatistic = (code: string) =>
    orderStatistics.find((item: any) => item.status === code);

  const visibleOrderStatuses = useMemo(
    () => orderStatuses.filter((item: any) => STATUS_SHOW.includes(item?.code)),
    [orderStatuses],
  );

  const deliveryReadyCount =
    getOrderStatusStatistic("DELIVERY_READY")?.total ||
    getOrderStatusStatistic("READY_FOR_DELIVERY")?.total ||
    0;

  return {
    t,
    balance: Math.ceil(balanceData?.balance || 0),
    deliveryReadyCount,
    visibleOrderStatuses,
    orderStatistics,
    statusAmountConfig,
    suggestProducts: suggestProducts as DashboardProduct[],
    isLoading:
      isBalanceLoading ||
      isStatusesLoading ||
      isStatisticsLoading ||
      isSuggestLoading,
    isSuggestLoading,
    isDepositModalOpen,
    setDepositModalOpen,
    getOrderStatusStatistic,
  };
};
