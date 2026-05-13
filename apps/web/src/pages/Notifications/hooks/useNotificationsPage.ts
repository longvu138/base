import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@repo/i18n";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotificationEventGroups,
  useNotifications,
  useNotificationUnreadCount,
} from "@repo/hooks";

export type NotificationItem = {
  id: string | number;
  read?: boolean;
  messageData?: string;
  publishDate?: string;
  eventCode?: string;
  refData?: {
    order?: {
      code?: string;
      image?: string;
      isShipment?: boolean;
      updatedPackageCode?: string;
    };
    deliveryRequest?: {
      code?: string;
    };
  };
};

type NotificationEventGroup = {
  code?: string;
  name?: string;
};

const getNotificationLink = (item: NotificationItem) => {
  const refData = item.refData || {};
  const order = refData.order;

  switch (item.eventCode) {
    case "FINANCIAL_COLLECT":
    case "FINANCIAL_EMD":
    case "FINANCIAL_PAYMENT":
    case "FINANCIAL_CLAIM":
    case "FINANCIAL_DEPOSIT":
      return "/profile?tab=transactions";
    case "DELIVERY_REQ_STATUS_UPDATE":
      return refData.deliveryRequest?.code
        ? `/delivery-requests?query=${refData.deliveryRequest.code}`
        : "/delivery-requests";
    case "ORDER_PACKAGE_UPDATE":
    case "SHIPMENT_PACKAGE_UPDATE":
      if (order?.updatedPackageCode) {
        return `/packages?query=${order.updatedPackageCode}`;
      }
      if (order?.code) {
        return `/${order.isShipment ? "shipments" : "orders"}/${order.code}`;
      }
      return "/packages";
    case "PROFILE":
      return "/profile";
    default:
      if (order?.code) {
        return `/${order.isShipment ? "shipments" : "orders"}/${order.code}`;
      }
      return "/dashboard";
  }
};

export const useNotificationsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeGroup, setActiveGroup] = useState("all");
  const { data: unreadCount = 0 } = useNotificationUnreadCount();
  const { data: eventGroups = [] } = useNotificationEventGroups(true);
  const {
    data: notificationsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useNotifications({
    enabled: true,
    groupCode: activeGroup === "all" ? undefined : activeGroup,
  });

  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const notifications =
    notificationsData?.pages.flatMap((page) => page.items) || [];

  const tabs = useMemo(
    () => [
      {
        key: "all",
        label: `${t("notifications.all")}${unreadCount ? ` (${unreadCount})` : ""}`,
      },
      ...(eventGroups as NotificationEventGroup[])
        .filter((item) => item.code)
        .map((item) => ({
          key: item.code as string,
          label: item.name || item.code,
        })),
    ],
    [eventGroups, t, unreadCount],
  );

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead.mutate(item.id);
    navigate(getNotificationLink(item));
  };

  return {
    t,
    i18n,
    activeGroup,
    setActiveGroup,
    unreadCount,
    tabs,
    notifications,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    markAllAsRead,
    handleNotificationClick,
  };
};
