import { App } from "antd";
import {
  useNotificationChannelsQuery,
  useNotificationEventGroups,
  useNotificationEventsQuery,
  useNotificationEventSettingsQuery,
  useNotificationSettingsQuery,
  useOrderStatusesQuery,
  useShipmentStatusesQuery,
  useUpdateNotificationSetting,
  useUpdateNotificationSettingsBatch,
} from "@repo/hooks";

const resolveNotificationError = (error: any, fallback: string) =>
  error?.response?.data?.message ||
  error?.response?.data?.detail ||
  error?.response?.data?.title ||
  error?.message ||
  fallback;

export const parseAdditionalCondition = (value?: string | null) => {
  if (!value) return [];

  try {
    const normalized = value
      .replace("{", "[")
      .replace("}", "]")
      .replaceAll("'", '"')
      .replace(".contains", "")
      .replace(/\(.*?\)/g, "");
    const parsed = JSON.parse(normalized);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const formatAdditionalCondition = (values: string[]) => {
  if (!values.length) return null;
  return `${JSON.stringify(values)
    .replace("[", "{")
    .replace("]", "}")
    .replaceAll('"', "'")}.contains(statusCode)`;
};

export const useProfileNotificationSettingsPage = (
  t: (key: string) => string,
) => {
  const { notification } = App.useApp();
  const enabled = true;
  const { data: eventGroups = [], isLoading: isLoadingGroups } =
    useNotificationEventGroups(enabled);
  const { data: channels = [], isLoading: isLoadingChannels } =
    useNotificationChannelsQuery(enabled);
  const { data: events = [], isLoading: isLoadingEvents } =
    useNotificationEventsQuery(enabled);
  const { data: eventSettings = [], isLoading: isLoadingEventSettings } =
    useNotificationEventSettingsQuery(enabled);
  const {
    data: notificationSettings = [],
    isLoading: isLoadingSettings,
    refetch,
  } = useNotificationSettingsQuery(enabled);
  const { data: orderStatuses = [] } = useOrderStatusesQuery();
  const { data: shipmentStatuses = [] } = useShipmentStatusesQuery();
  const updateSetting = useUpdateNotificationSetting();
  const updateBatch = useUpdateNotificationSettingsBatch();

  const getEventsByGroup = (groupCode: string) =>
    events
      .filter((event: any) => event.groupCode === groupCode)
      .map((event: any) => {
        const setting = eventSettings.find(
          (item: any) => item.eventCode === event.eventCode,
        );
        if (!setting?.channels?.length) return null;
        return { ...event, channelsSetting: setting.channels };
      })
      .filter(Boolean);

  const isEventChecked = (eventCode: string, channel: string) => {
    const setting = notificationSettings.find(
      (item: any) => item.eventCode === eventCode,
    );
    return !!setting?.[channel];
  };

  const getEventSetting = (eventCode: string) =>
    notificationSettings.find((item: any) => item.eventCode === eventCode);

  const changeEventChannel = async (
    event: any,
    channel: string,
    value: boolean,
  ) => {
    try {
      await updateSetting.mutateAsync({
        eventCode: event.eventCode,
        [channel]: value,
      });
      notification.success({ message: t("message.success") });
      refetch();
    } catch (error: any) {
      notification.error({
        message: resolveNotificationError(error, t("common.error")),
      });
    }
  };

  const changeGroupChannel = async (
    groupEvents: any[],
    channel: string,
    value: boolean,
  ) => {
    try {
      await updateBatch.mutateAsync({
        events: groupEvents.map((event) => event.eventCode),
        channel,
        value,
      });
      notification.success({ message: t("message.success") });
      refetch();
    } catch (error: any) {
      notification.error({
        message: resolveNotificationError(error, t("common.error")),
      });
    }
  };

  const changeStatusCondition = async (
    event: any,
    statusCode: string,
    value: boolean,
  ) => {
    const current = parseAdditionalCondition(
      getEventSetting(event.eventCode)?.additionalCondition,
    );
    const next = value
      ? Array.from(new Set([...current, statusCode]))
      : current.filter((item) => item !== statusCode);

    try {
      await updateSetting.mutateAsync({
        eventCode: event.eventCode,
        additionalCondition: formatAdditionalCondition(next),
      });
      notification.success({ message: t("message.success") });
      refetch();
    } catch (error: any) {
      notification.error({
        message: resolveNotificationError(error, t("common.error")),
      });
    }
  };

  return {
    channels,
    eventGroups,
    events,
    eventSettings,
    notificationSettings,
    orderStatuses,
    shipmentStatuses,
    isLoading:
      isLoadingGroups ||
      isLoadingChannels ||
      isLoadingEvents ||
      isLoadingEventSettings ||
      isLoadingSettings,
    isSubmitting: updateSetting.isPending || updateBatch.isPending,
    changeEventChannel,
    changeGroupChannel,
    changeStatusCondition,
    getEventSetting,
    getEventsByGroup,
    isEventChecked,
  };
};
