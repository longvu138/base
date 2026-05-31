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
import { getNotificationEventLabel } from "../domain/labels";
import { getNotificationLink } from "../domain/navigation";
import type { NotificationEventGroup, NotificationItem } from "../domain/types";

export const useNotificationsModel = () => {
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
          label: getNotificationEventLabel(item.code, t, item.name),
        })),
    ],
    [eventGroups, t, unreadCount],
  );

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead.mutate(item.id);
    navigate(getNotificationLink(item));
  };

  const state = {
    activeGroup,
    unreadCount,
    notifications,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    isMarkingAllAsRead: markAllAsRead.isPending,
  };

  const options = {
    tabs,
    eventGroups,
  };

  const actions = {
    setActiveGroup,
    fetchNextPage,
    markAllAsRead: () => markAllAsRead.mutate(),
    handleNotificationClick,
  };

  return {
    state,
    options,
    actions,
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
