import {
  Avatar,
  Button,
  Card,
  Empty,
  Flex,
  List,
  Spin,
  Tabs,
  Typography,
  theme,
} from "antd";
import { BellOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { useNotificationsPage } from "./hooks/useNotificationsPage";
import type { NotificationItem } from "./hooks/useNotificationsPage";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export const NotificationsStyleDefault = () => {
  const { token } = theme.useToken();
  const {
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
  } = useNotificationsPage();

  dayjs.locale(i18n.language === "vi" ? "vi" : "en");

  return (
    <Card
      title={
        <Flex align="center" justify="space-between" gap={token.marginMD}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {t("notifications.title")}
            {unreadCount ? ` (${unreadCount})` : ""}
          </Typography.Title>
          <Button
            type="primary"
            disabled={!unreadCount}
            loading={markAllAsRead.isPending}
            onClick={() => markAllAsRead.mutate()}
          >
            {t("notifications.mark_as_read_all")}
          </Button>
        </Flex>
      }
    >
      <Tabs activeKey={activeGroup} items={tabs} onChange={setActiveGroup} />

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
          renderItem={(item) => (
            <List.Item
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              style={{
                cursor: "pointer",
                paddingInline: token.paddingMD,
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
                    {item.publishDate ? dayjs(item.publishDate).fromNow() : ""}
                  </Typography.Text>
                }
              />
            </List.Item>
          )}
        />
      </Spin>

      {hasNextPage && (
        <Flex justify="center" style={{ marginTop: token.marginMD }}>
          <Button loading={isFetchingNextPage} onClick={() => fetchNextPage()}>
            {t("orders.buttons.view_more")}
          </Button>
        </Flex>
      )}
    </Card>
  );
};

export default NotificationsStyleDefault;
