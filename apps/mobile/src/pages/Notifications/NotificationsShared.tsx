import { useEffect, useRef } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Empty,
  Flex,
  List,
  Select,
  Skeleton,
  Space,
  Tag,
  Typography,
  theme,
} from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import {
  getNotificationEventLabel,
  useNotificationsPage,
  type NotificationItem,
} from "@repo/hooks";

dayjs.extend(relativeTime);

const NOTIFICATION_PREFETCH_ITEM_COUNT = 5;

type NotificationsPageState = ReturnType<typeof useNotificationsPage>;

const NotificationCardSkeleton = () => {
  const { token } = theme.useToken();

  return (
    <Card>
      <Flex gap={token.marginMD} align="flex-start">
        <Skeleton.Avatar active size="large" />
        <Space direction="vertical" size={token.marginXS} style={{ flex: 1 }}>
          <Skeleton.Input active style={{ width: "90%" }} />
          <Skeleton.Input active size="small" style={{ width: "45%" }} />
          <Skeleton.Input active size="small" style={{ width: 88 }} />
        </Space>
      </Flex>
    </Card>
  );
};

const NotificationsSkeleton = ({ count = 5 }: { count?: number }) => (
  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
    {Array.from({ length: count }).map((_, index) => (
      <NotificationCardSkeleton key={index} />
    ))}
  </Space>
);

const formatRelativeTime = (value?: string) =>
  value ? dayjs(value).fromNow() : "";

const NotificationsHeader = ({
  page,
  mode,
}: {
  page: NotificationsPageState;
  mode: "default" | "gobiz" | "thanhla";
}) => {
  const { token } = theme.useToken();

  return (
    <Card>
      <Flex align="center" justify="space-between" gap={token.marginMD} wrap>
        <Space size="middle" style={{ minWidth: 0, flex: 1 }}>
          <Badge count={page.unreadCount} overflowCount={99}>
            <Avatar
              size={mode === "thanhla" ? 48 : 44}
              icon={<BellOutlined />}
              style={{
                background:
                  mode === "default"
                    ? token.colorPrimary
                    : token.colorPrimaryBg,
                color:
                  mode === "default"
                    ? token.colorWhite
                    : token.colorPrimary,
              }}
            />
          </Badge>
          <Space direction="vertical" size={0} style={{ minWidth: 0 }}>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {page.t("notifications.title")}
            </Typography.Title>
            <Typography.Text type="secondary">
              {page.unreadCount
                ? `${page.unreadCount} ${page.t("header.new")}`
                : page.t("common.no_data")}
            </Typography.Text>
          </Space>
        </Space>

        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          disabled={!page.unreadCount}
          loading={page.markAllAsRead.isPending}
          onClick={() => page.markAllAsRead.mutate()}
        >
          {page.t("notifications.mark_as_read_all")}
        </Button>
      </Flex>
    </Card>
  );
};

const NotificationsFilters = ({ page }: { page: NotificationsPageState }) => {
  const { token } = theme.useToken();

  return (
    <Card>
      <Flex vertical gap={token.marginXS}>
        <Typography.Text strong>{page.t("notifications.all")}</Typography.Text>
        <Select
          value={page.activeGroup}
          onChange={page.setActiveGroup}
          options={page.tabs.map((tab) => ({
            label: tab.label,
            value: tab.key,
          }))}
          style={{ width: "100%" }}
        />
      </Flex>
    </Card>
  );
};

const NotificationCard = ({
  item,
  page,
  mode,
}: {
  item: NotificationItem;
  page: NotificationsPageState;
  mode: "default" | "gobiz" | "thanhla";
}) => {
  const { token } = theme.useToken();
  const background = item.read ? token.colorBgContainer : token.colorPrimaryBg;

  return (
    <Card
      hoverable
      onClick={() => page.handleNotificationClick(item)}
      styles={{ body: { padding: token.paddingMD } }}
      style={{ background, width: "100%" }}
    >
      <Flex align="flex-start" gap={token.marginMD}>
        <Avatar
          size={mode === "default" ? "default" : "large"}
          src={item.refData?.order?.image}
          icon={<BellOutlined />}
          style={{ flex: "0 0 auto" }}
        />
        <Space direction="vertical" size={token.marginXS} style={{ minWidth: 0, flex: 1, width: 0 }}>
          <Flex align="flex-start" justify="space-between" gap={token.marginSM}>
            <Typography.Text
              strong={!item.read}
              ellipsis={{ tooltip: item.messageData }}
              style={{ minWidth: 0, flex: 1 }}
            >
              {item.messageData || page.t("notifications.title")}
            </Typography.Text>
            <RightOutlined style={{ color: token.colorTextTertiary, flex: "0 0 auto" }} />
          </Flex>
          <Flex wrap gap={token.marginXS} align="center">
            <Typography.Text type="secondary">
              {formatRelativeTime(item.publishDate)}
            </Typography.Text>
            {!item.read && (
              <Tag color="processing" style={{ marginInlineEnd: 0 }}>
                {page.t("header.new")}
              </Tag>
            )}
            {item.eventCode && (
              <Tag style={{ marginInlineEnd: 0 }}>
                {getNotificationEventLabel(item.eventCode, page.t)}
              </Tag>
            )}
          </Flex>
        </Space>
      </Flex>
    </Card>
  );
};

const NotificationsList = ({
  page,
  mode,
}: {
  page: NotificationsPageState;
  mode: "default" | "gobiz" | "thanhla";
}) => {
  const { token } = theme.useToken();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const rows = page.notifications as NotificationItem[];
  const prefetchIndex = Math.max(
    rows.length - NOTIFICATION_PREFETCH_ITEM_COUNT,
    0,
  );

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !page.hasNextPage || page.isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && page.hasNextPage && !page.isFetchingNextPage) {
          page.fetchNextPage();
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [page, page.hasNextPage, page.isFetchingNextPage, rows.length]);

  if (page.isLoading) {
    return <NotificationsSkeleton />;
  }

  return (
    <Space direction="vertical" size={token.marginMD} style={{ width: "100%" }}>
      <List
        dataSource={rows}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={page.t("common.no_data")}
            />
          ),
        }}
        renderItem={(item, index) => (
          <List.Item
            style={{ padding: 0, borderBlockEnd: 0, width: "100%", display: "block" }}
            ref={index === prefetchIndex ? loadMoreRef : undefined}
          >
            <NotificationCard item={item} page={page} mode={mode} />
          </List.Item>
        )}
        style={{ width: "100%", display: "flex", flexDirection: "column", gap: token.marginSM }}
      />

      {page.isFetchingNextPage && <NotificationCardSkeleton />}

      {!page.hasNextPage && rows.length > 0 && (
        <Typography.Text type="secondary" style={{ textAlign: "center" }}>
          {page.t("common.no_more_data")}
        </Typography.Text>
      )}
    </Space>
  );
};

export const NotificationsMobileView = ({
  mode = "default",
}: {
  mode?: "default" | "gobiz" | "thanhla";
}) => {
  const { token } = theme.useToken();
  const page = useNotificationsPage();

  dayjs.locale(page.i18n.language === "vi" ? "vi" : "en");

  return (
    <Space direction="vertical" size={token.marginMD} style={{ width: "100%" }}>
      <NotificationsHeader page={page} mode={mode} />
      <NotificationsFilters page={page} />
      <NotificationsList page={page} mode={mode} />
    </Space>
  );
};
