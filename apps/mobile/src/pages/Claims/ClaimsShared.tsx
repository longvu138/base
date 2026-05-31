import { useEffect, useRef } from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Empty,
  Flex,
  Form,
  Image,
  Input,
  List,
  Radio,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
  theme,
} from "antd";
import {
  FileSearchOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { FilterPanel } from "@repo/ui";
import { moneyFormat, quantityFormat } from "@repo/util";
import {
  getClaimSolutionName,
  getClaimSolutionsByTicketType,
  getClaimStatusView,
  useClaimsMobileModel,
} from "@repo/features/claims";

const { Text, Title, Paragraph } = Typography;
const CLAIMS_PREFETCH_ITEM_COUNT = 5;

type ClaimsPageState = ReturnType<typeof useClaimsMobileModel>;

const formatDate = (value?: string) =>
  value ? dayjs(value).format("HH:mm DD/MM/YYYY") : "---";

const ClaimItemSkeleton = () => {
  const { token } = theme.useToken();

  return (
    <Card>
      <Flex vertical gap={token.marginMD}>
        <Flex justify="space-between" gap={token.marginSM}>
          <Space>
            <Skeleton.Avatar active shape="square" size="large" />
            <Space direction="vertical" size={token.marginXS}>
              <Skeleton.Input active style={{ width: 120 }} />
              <Skeleton.Input active size="small" style={{ width: 160 }} />
            </Space>
          </Space>
          <Skeleton.Button active size="small" style={{ width: 84 }} />
        </Flex>
        <Skeleton active paragraph={{ rows: 2 }} title={false} />
        <Flex justify="space-between">
          <Skeleton.Input active size="small" style={{ width: 110 }} />
          <Skeleton.Button active size="small" style={{ width: 92 }} />
        </Flex>
      </Flex>
    </Card>
  );
};

const ClaimsListSkeleton = ({ count = 5 }: { count?: number }) => (
  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
    {Array.from({ length: count }).map((_, index) => (
      <ClaimItemSkeleton key={index} />
    ))}
  </Space>
);

export const ClaimsFilter = ({ page }: { page: ClaimsPageState }) => {
  const { token } = theme.useToken();
  const activeTicketType =
    Form.useWatch("ticketType", page.form) || page.filters.ticketType || "";

  const solutionsByTicketType = getClaimSolutionsByTicketType(
    page.solutionData,
    activeTicketType,
  );

  return (
    <Card className="mb-4 shadow-sm">
      <FilterPanel
        form={page.form}
        onSearch={page.actions.search}
        onReset={page.actions.reset}
        searchText={page.t("order.search")}
        resetText={page.t("order.filter_refresh")}
        primaryContent={
          <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
            <Form.Item
              name="publicStates"
              label={page.t("tickets.status")}
              style={{ marginBottom: 0 }}
            >
              <Checkbox.Group>
                <Space wrap>
                  {page.statusData.map((item: any) => (
                    <Checkbox key={item.code} value={item.code}>
                      {item.name}
                    </Checkbox>
                  ))}
                </Space>
              </Checkbox.Group>
            </Form.Item>

            <Form.Item
              name="solutionCode"
              label={page.t("tickets.solution")}
              style={{ marginBottom: 0 }}
            >
              <Checkbox.Group>
                <Space wrap>
                  {solutionsByTicketType.map((item: any) => (
                    <Checkbox
                      key={`${item.subject || "all"}-${item.code}`}
                      value={item.code}
                    >
                      {item.name}
                    </Checkbox>
                  ))}
                </Space>
              </Checkbox.Group>
            </Form.Item>

            <Form.Item
              name="ticketType"
              label="Loại khiếu nại"
              style={{ marginBottom: 0 }}
            >
              <Radio.Group onChange={page.actions.search}>
                <Space wrap>
                  <Radio value="">Tất cả</Radio>
                  <Radio value="order">{page.t("menu.orders")}</Radio>
                  <Radio value="shipment">{page.t("menu.shipments")}</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>

            <Row gutter={[token.margin, token.marginSM]}>
              <Col xs={24}>
                <Form.Item
                  name="code"
                  label={`${page.t("tickets.enter_code")}:`}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    allowClear
                    prefix={<SearchOutlined />}
                    placeholder={page.t("tickets.code")}
                    onPressEnter={page.actions.search}
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="relatedOrder"
                  label={`${page.t("tickets.enter_order_code")}:`}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    allowClear
                    placeholder={page.t("tickets.order_code")}
                    onPressEnter={page.actions.search}
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="relatedProduct"
                  label={`${page.t("tickets.enter_product_code")}:`}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    allowClear
                    placeholder={page.t("tickets.product_code")}
                    onPressEnter={page.actions.search}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Space>
        }
      />
    </Card>
  );
};

const ClaimCard = ({ record, page }: { record: any; page: ClaimsPageState }) => {
  const { token } = theme.useToken();
  const status = getClaimStatusView(record, page.statusData);
  const solutionName = getClaimSolutionName(record, page.solutionData);

  return (
    <Card styles={{ body: { padding: token.paddingMD } }}>
      <Flex vertical gap={token.marginMD}>
        <Flex justify="space-between" align="flex-start" gap={token.marginSM}>
          <Space align="start" style={{ minWidth: 0, flex: 1 }}>
            {record.thumbnail ? (
              <Image
                preview={false}
                src={record.thumbnail}
                alt={page.t("tickets.product_image")}
                width={56}
                height={56}
                style={{ objectFit: "cover", borderRadius: token.borderRadius }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <AvatarPlaceholder />
            )}
            <Space direction="vertical" size={token.marginXXS} style={{ minWidth: 0 }}>
              <Link to={`/tickets/${record.code}`}>
                <Text strong style={{ color: token.colorPrimary, textTransform: "uppercase" }} ellipsis>
                  #{record.code || "---"}
                </Text>
              </Link>
              <Link to={`/tickets/${record.code}`}>
                <Text style={{ color: token.colorPrimary, textTransform: "uppercase" }} ellipsis>
                  {record.name || "---"}
                </Text>
              </Link>
              <Text type="secondary">{formatDate(record.createdAt)}</Text>
            </Space>
          </Space>

          {status?.name || status?.code ? (
            <Tag
              style={{
                backgroundColor: status.color || token.colorTextTertiary,
                borderColor: "transparent",
                color: token.colorWhite,
                marginInlineEnd: 0,
                maxWidth: 128,
                whiteSpace: "normal",
                textAlign: "center",
              }}
            >
              {status.name || status.code}
              {record.archived ? ` (${page.t("tickets.closed")})` : ""}
            </Tag>
          ) : null}
        </Flex>

        <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
          {record.content || record.description || record.name || "---"}
        </Paragraph>

        <Row gutter={[token.marginSM, token.marginXS]}>
          <Col xs={12}>
            <Space direction="vertical" size={0}>
              <Text type="secondary">{page.t("tickets.total_refund")}</Text>
              <Text strong style={{ color: token.colorSuccess }}>
                {moneyFormat(record.totalRefund || 0)}
              </Text>
            </Space>
          </Col>
          <Col xs={12}>
            <Space direction="vertical" size={0}>
              <Text type="secondary">{page.t("tickets.solution")}</Text>
              <Text ellipsis>{solutionName || "---"}</Text>
            </Space>
          </Col>
        </Row>

        <Flex justify="flex-end">
          <Link to={`/tickets/${record.code}`}>
            <Button type="link">{page.t("tickets.detail")}</Button>
          </Link>
        </Flex>
      </Flex>
    </Card>
  );
};

const AvatarPlaceholder = () => {
  const { token } = theme.useToken();
  return (
    <Flex
      align="center"
      justify="center"
      style={{
        width: 56,
        height: 56,
        borderRadius: token.borderRadius,
        background: token.colorFillSecondary,
        color: token.colorPrimary,
        flex: "0 0 auto",
      }}
    >
      <FileSearchOutlined />
    </Flex>
  );
};

export const ClaimsList = ({ page }: { page: ClaimsPageState }) => {
  const { token } = theme.useToken();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const rows = page.listData?.data || [];
  const total = page.listData?.total || 0;
  const prefetchIndex = Math.max(rows.length - CLAIMS_PREFETCH_ITEM_COUNT, 0);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !page.hasNextPage || page.isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && page.hasNextPage && !page.isFetchingNextPage) {
          page.actions.fetchNextPage();
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [page, page.hasNextPage, page.isFetchingNextPage, rows.length]);

  if (page.isClaimsLoading) {
    return <ClaimsListSkeleton />;
  }

  return (
    <Space direction="vertical" size={token.marginMD} style={{ width: "100%" }}>
      <Card
        styles={{ body: { padding: token.paddingMD } }}
      >
        <Flex justify="space-between" align="center" gap={token.marginSM} wrap>
          <Title level={5} style={{ margin: 0 }}>
            {page.t("tickets.title")}{" "}
            <Text type="secondary">({quantityFormat(Number(total || 0))})</Text>
          </Title>
          <Link to="/tickets/create">
            <Button type="primary" ghost icon={<PlusOutlined />}>
              {page.t("tickets.create")}
            </Button>
          </Link>
        </Flex>
      </Card>

      <List
        dataSource={rows}
        locale={{
          emptyText: <Empty description={page.t("message.empty")} />,
        }}
        renderItem={(record, index) => (
          <List.Item
            style={{ padding: 0, borderBlockEnd: 0 }}
            ref={index === prefetchIndex ? loadMoreRef : undefined}
          >
            <ClaimCard record={record} page={page} />
          </List.Item>
        )}
        style={{ display: "flex", flexDirection: "column", gap: token.marginSM }}
      />

      {page.isFetchingNextPage && <ClaimItemSkeleton />}

      {!page.hasNextPage && rows.length > 0 && (
        <Text type="secondary" style={{ textAlign: "center" }}>
          {page.t("common.no_more_data")}
        </Text>
      )}
    </Space>
  );
};

export const ClaimsMobileView = () => {
  const { token } = theme.useToken();
  const page = useClaimsMobileModel();

  return (
    <Space direction="vertical" size={token.marginMD} style={{ width: "100%" }}>
      <ClaimsFilter page={page} />
      <ClaimsList page={page} />
    </Space>
  );
};
