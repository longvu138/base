import {
  Avatar,
  Badge,
  Button,
  Empty,
  Flex,
  List,
  Popover,
  Spin,
  Tabs,
  Typography,
  theme,
} from "antd";
import { BellOutlined } from "@ant-design/icons";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotificationEventGroups,
  useNotifications,
  useNotificationUnreadCount,
} from "@repo/hooks";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@repo/i18n";

dayjs.extend(relativeTime);
dayjs.locale("vi");

type NotificationItem = {
  id: string | number;
  read?: boolean;
  messageData?: string;
  publishDate?: string;
  eventCode?: string;
  refData?: {
    type?: string;
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
      return "/transactions";
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

export const HeaderNotificationLink = () => {
  const { token } = theme.useToken();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState("all");
  const { data: unreadCount = 0 } = useNotificationUnreadCount();
  const { data: eventGroups = [] } = useNotificationEventGroups(open);
  const {
    data: notificationsData,
    isLoading,
  } = useNotifications({
    enabled: open,
    groupCode: activeGroup === "all" ? undefined : activeGroup,
  });
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const count = unreadCount > 99 ? "99+" : unreadCount;
  const notifications =
    notificationsData?.pages.flatMap((page) => page.items) || [];

  dayjs.locale(i18n.language === "vi" ? "vi" : "en");

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
    [eventGroups, t, unreadCount]
  );

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead.mutate(item.id);
    setOpen(false);
    navigate(getNotificationLink(item));
  };

  return (
    <Popover
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
      title={
        <Flex align="center" justify="space-between" gap={token.marginSM}>
          <Typography.Text strong>
            {t("notifications.title")}{unreadCount ? ` (${unreadCount})` : ""}
          </Typography.Text>
          <Button
            type="link"
            size="small"
            disabled={!unreadCount}
            loading={markAllAsRead.isPending}
            onClick={() => markAllAsRead.mutate()}
          >
            {t("notifications.mark_as_read_all")}
          </Button>
        </Flex>
      }
      content={
        <Flex vertical style={{ width: 420 }}>
          <Tabs
            activeKey={activeGroup}
            items={tabs}
            size="small"
            onChange={setActiveGroup}
          />

          <Spin spinning={isLoading}>
            <List
              dataSource={notifications as NotificationItem[]}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={t("common.no_data")}
                  />
                ),
              }}
              style={{ maxHeight: 420, overflowY: "auto" }}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  style={{
                    cursor: "pointer",
                    paddingInline: token.paddingSM,
                    background: item.read
                      ? token.colorBgContainer
                      : token.colorPrimaryBg,
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        src={item.refData?.order?.image}
                        icon={<BellOutlined />}
                      />
                    }
                    title={
                      <Typography.Text strong={!item.read}>
                        {item.messageData || t("notifications.title")}
                      </Typography.Text>
                    }
                    description={
                      <Typography.Text type="secondary">
                        {item.publishDate
                          ? dayjs(item.publishDate).fromNow()
                          : ""}
                      </Typography.Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Spin>

          <Button
            type="link"
            block
            onClick={() => {
              setOpen(false);
              navigate("/notifications");
            }}
          >
            {t("notifications.read_all")}
          </Button>
        </Flex>
      }
    >
      <Badge count={count} size="small">
        <Button
          type="text"
          aria-label={t("notifications.title")}
          icon={<BellOutlined />}
          style={{ color: token.colorTextSecondary }}
        />
      </Badge>
    </Popover>
  );
};

export default HeaderNotificationLink;
