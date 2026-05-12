import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  List,
  Row,
  Space,
  Spin,
  Statistic,
  Tabs,
  Tag,
  Typography,
  theme,
} from "antd";
import { BellOutlined, CheckCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { useNotificationsPage } from "./hooks/useNotificationsPage";
import type { NotificationItem } from "./hooks/useNotificationsPage";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export const NotificationsStyle2 = () => {
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
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <Card>
            <Flex align="center" justify="space-between" gap={token.marginMD}>
              <Space size="middle">
                <Avatar
                  size={48}
                  icon={<BellOutlined />}
                  style={{
                    background: token.colorPrimaryBg,
                    color: token.colorPrimary,
                  }}
                />
                <div>
                  <Typography.Title level={3} style={{ margin: 0 }}>
                    {t("notifications.title")}
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    {t("notifications.all")}
                    {unreadCount ? ` (${unreadCount})` : ""}
                  </Typography.Text>
                </div>
              </Space>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                disabled={!unreadCount}
                loading={markAllAsRead.isPending}
                onClick={() => markAllAsRead.mutate()}
              >
                {t("notifications.mark_as_read_all")}
              </Button>
            </Flex>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title={t("notifications.title")}
              value={unreadCount}
              prefix={<BellOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs
          activeKey={activeGroup}
          items={tabs}
          onChange={setActiveGroup}
          tabBarGutter={token.marginLG}
        />

        <Spin spinning={isLoading}>
          <List
            grid={{ gutter: 16, xs: 1, md: 2 }}
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
              <List.Item>
                <Badge.Ribbon
                  text={item.read ? t("common.success") : t("header.new")}
                  color={item.read ? token.colorSuccess : token.colorPrimary}
                >
                  <Card
                    hoverable
                    onClick={() => handleNotificationClick(item)}
                    styles={{
                      body: {
                        minHeight: 132,
                        background: item.read
                          ? token.colorBgContainer
                          : token.colorPrimaryBg,
                      },
                    }}
                  >
                    <Space align="start">
                      <Avatar
                        src={item.refData?.order?.image}
                        icon={<BellOutlined />}
                      />
                      <Space direction="vertical" size={4}>
                        <Typography.Text strong={!item.read}>
                          {item.messageData || t("notifications.title")}
                        </Typography.Text>
                        <Typography.Text type="secondary">
                          {item.publishDate
                            ? dayjs(item.publishDate).fromNow()
                            : ""}
                        </Typography.Text>
                        {item.eventCode && <Tag>{item.eventCode}</Tag>}
                      </Space>
                    </Space>
                  </Card>
                </Badge.Ribbon>
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
    </Space>
  );
};

export default NotificationsStyle2;
