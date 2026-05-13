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
  getChannels: () => {
    return ApiClient.auth.get(
      `${appConfig.apiKunLun}/notification-service/categories/channels`
    );
  },
  getEvents: () => {
    return ApiClient.auth.get(
      `${appConfig.apiKunLun}/notification-service/categories/events`
    );
  },
  getEventSettings: () => {
    return ApiClient.auth.get(
      `${appConfig.apiKunLun}/notification-service/categories/event_settings`
    );
  },
  getNotificationSettings: () => {
    return ApiClient.auth.get(
      `${appConfig.apiKunLun}/notification-service/customer/notification_settings`,
      {
        params: { offset: 0, limit: 10000 },
      }
    );
  },
  updateNotificationSetting: (data: Record<string, any>) => {
    return ApiClient.auth.post(
      `${appConfig.apiKunLun}/notification-service/customer/notification_settings`,
      data
    );
  },
  updateNotificationSettingsBatch: (data: Record<string, any>) => {
    return ApiClient.auth.post(
      `${appConfig.apiKunLun}/notification-service/customer/notification_settings/batch`,
      data
    );
  },
  connectTelegram: (telegramUsername: string) => {
    return ApiClient.auth.post(
      `${appConfig.apiKunLun}/subscribe/customer/telegram/generate_deep_link`,
      { telegramUsername }
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
