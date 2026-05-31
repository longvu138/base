import {
  Avatar,
  Button,
  Card,
  Empty,
  Flex,
  List,
  Menu,
  Row,
  Col,
  Space,
  Spin,
  Tag,
  Typography,
  theme,
} from "antd";
import { BellOutlined, CheckOutlined, RightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import {
  useNotificationsModel,
  type NotificationItem,
} from "@repo/features/notifications";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export const NotificationsStyleGobiz = () => {
  const { token } = theme.useToken();
  const {
    t,
    i18n,
    activeGroup,
    unreadCount,
    tabs,
    notifications,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    state,
    actions,
    handleNotificationClick,
  } = useNotificationsModel();

  dayjs.locale(i18n.language === "vi" ? "vi" : "en");

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={7}>
        <Card>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Flex align="center" gap={token.marginSM}>
              <Avatar
                size={44}
                icon={<BellOutlined />}
                style={{
                  background: token.colorPrimary,
                  color: token.colorWhite,
                }}
              />
              <div>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {t("notifications.title")}
                </Typography.Title>
                <Typography.Text type="secondary">
                  {unreadCount ? `${unreadCount} ${t("header.new")}` : t("common.no_data")}
                </Typography.Text>
              </div>
            </Flex>

            <Button
              block
              type="primary"
              icon={<CheckOutlined />}
              disabled={!unreadCount}
              loading={state.isMarkingAllAsRead}
              onClick={actions.markAllAsRead}
            >
              {t("notifications.mark_as_read_all")}
            </Button>

            <Menu
              mode="inline"
              selectedKeys={[activeGroup]}
              items={tabs.map((tab) => ({
                key: tab.key,
                label: tab.label,
                icon: <BellOutlined />,
              }))}
              onClick={({ key }) => actions.setActiveGroup(key)}
              style={{ borderInlineEnd: 0 }}
            />
          </Space>
        </Card>
      </Col>

      <Col xs={24} lg={17}>
        <Card
          title={
            <Flex align="center" justify="space-between">
              <Typography.Title level={4} style={{ margin: 0 }}>
                {t("notifications.title")}
              </Typography.Title>
              <Tag color="blue">{activeGroup}</Tag>
            </Flex>
          }
        >
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
                  actions={[<RightOutlined key="open" />]}
                  onClick={() => handleNotificationClick(item)}
                  style={{
                    cursor: "pointer",
                    padding: token.paddingMD,
                    borderRadius: token.borderRadiusLG,
                    marginBottom: token.marginXS,
                    background: item.read
                      ? token.colorBgContainer
                      : token.colorPrimaryBg,
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size="large"
                        src={item.refData?.order?.image}
                        icon={<BellOutlined />}
                      />
                    }
                    title={
                      <Space wrap>
                        <Typography.Text strong={!item.read}>
                          {item.messageData || t("notifications.title")}
                        </Typography.Text>
                        {!item.read && <Tag color="processing">{t("header.new")}</Tag>}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={2}>
                        <Typography.Text type="secondary">
                          {item.publishDate
                            ? dayjs(item.publishDate).fromNow()
                            : ""}
                        </Typography.Text>
                        {item.eventCode && (
                          <Typography.Text type="secondary">
                            {item.eventCode}
                          </Typography.Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Spin>

          {hasNextPage && (
            <Flex justify="center" style={{ marginTop: token.marginMD }}>
              <Button
                loading={isFetchingNextPage}
                onClick={() => actions.fetchNextPage()}
              >
                {t("orders.buttons.view_more")}
              </Button>
            </Flex>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default NotificationsStyleGobiz;
