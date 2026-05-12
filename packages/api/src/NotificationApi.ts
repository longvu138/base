import { ApiClient, appConfig } from "@repo/util";

export type NotificationQuery = {
  offset?: number;
  limit?: number;
  groupCode?: string;
  sort?: string;
};

export const NotificationApi = {
  getUnreadCount: () => {
    return ApiClient.auth.get(
      `${appConfig.apiKunLun}/notification-service/customer/unread_count`
    );
  },
  getNotifications: (params: NotificationQuery = {}) => {
    return ApiClient.auth.get(
      `${appConfig.apiKunLun}/notification-service/customer/all`,
      {
        params: {
          offset: params.offset ?? 0,
          limit: params.limit ?? 25,
          sort: params.sort ?? "publishDate:desc",
          ...(params.groupCode ? { groupCode: params.groupCode } : {}),
        },
      }
    );
  },
  getEventGroups: () => {
    return ApiClient.auth.get(
      `${appConfig.apiKunLun}/notification-service/categories/event_groups`
    );
  },
  markAsRead: (id: string | number) => {
    return ApiClient.auth.patch(
      `${appConfig.apiKunLun}/notification-service/customer/mark_as_read`,
      { id }
    );
  },
  markAllAsRead: () => {
    return ApiClient.auth.patch(
      `${appConfig.apiKunLun}/notification-service/customer/mark_as_read_all`
    );
  },
};
