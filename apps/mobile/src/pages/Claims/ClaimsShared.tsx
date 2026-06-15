import { useEffect, useMemo, useRef } from "react";
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
import { moneyCeil, moneyFormat } from "@repo/util";
import { useClaimsMobilePage } from "@repo/hooks";
import MobileFilterPanel from "../../components/MobileFilterPanel";

const { Text, Paragraph } = Typography;
const CLAIMS_PREFETCH_ITEM_COUNT = 5;

type ClaimsPageState = ReturnType<typeof useClaimsMobilePage>;

const getStatusView = (record: any, statuses: any[] = []) => {
  if (record.publicStateNewView) return record.publicStateNewView;
  if (typeof record.publicState === "object") return record.publicState;
  return statuses.find((item: any) => item.code === record.publicState) || {};
};

const getSolutionName = (record: any, solutions: any[] = []) => {
  if (record.solutionView?.name) return record.solutionView.name;
  return (
    solutions.find((item: any) => item.code === record.solutionCode)?.name ||
    record.solutionCode ||
    ""
  );
};

const formatDate = (value?: string) =>
  value ? dayjs(value).format("HH:mm DD/MM/YYYY") : "---";

const getClaimTicketType = (value: any) =>
  Array.isArray(value) ? value[0] || "" : value || "";

const getArrayFieldValue = (value: any) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value) return value.split(",").filter(Boolean);
  return [];
};

const getSolutionsByTicketType = (solutions: any[] = [], ticketType = "") => {
  const rows = ticketType
    ? solutions.filter((item: any) => item.subject === ticketType)
    : Array.from(
        new Map(
          solutions.map((item: any) => [
            item.name || item.code,
            item,
          ]),
        ).values(),
      );

  return [...rows].sort((a: any, b: any) =>
    String(a.code || "").localeCompare(String(b.code || "")),
  );
};

const CheckableFilterTags = ({
  value,
  options,
  onChange,
}: {
  value?: any;
  options: any[];
  onChange?: (value: string[]) => void;
}) => {
  const selectedValues = getArrayFieldValue(value);

  return (
    <Space wrap>
      {options.map((item: any, index: number) => {
        const itemValue = item.code;
        const checked = selectedValues.includes(itemValue);

        return (
          <Tag.CheckableTag
            key={`${item.subject || "all"}-${itemValue}-${index}`}
            checked={checked}
            onChange={() => {
              const next = checked
                ? selectedValues.filter((selected) => selected !== itemValue)
                : [...selectedValues, itemValue];
              onChange?.(next);
            }}
          >
            <Typography.Link style={checked ? { color: "#ffffff" } : undefined}>
              {item.name}
            </Typography.Link>
          </Tag.CheckableTag>
        );
      })}
    </Space>
  );
};

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
  const selectedTicketType = getClaimTicketType(
    Form.useWatch("ticketType", page.form) ?? page.filters.ticketType,
  );

  const changeTicketType = (type: "order" | "shipment", checked: boolean) => {
    const nextTicketType = checked ? type : "";
    page.form.setFieldsValue({ ticketType: nextTicketType });
  };

  const solutionsByTicketType = useMemo(
    () => getSolutionsByTicketType(page.solutionData, selectedTicketType),
    [page.solutionData, selectedTicketType],
  );

  return (
    <>
      <style>
        {`
          .claims-filter-actions {
            flex-wrap: nowrap !important;
            gap: 6px !important;
          }

          .claims-filter-actions .ant-btn {
            padding-inline: 8px;
          }
        `}
      </style>
      <MobileFilterPanel
        className="mb-4 shadow-sm"
        form={page.form}
        onSearch={page.handleSearch}
        onReset={page.handleReset}
        searchText={page.t("order.search")}
        resetText={page.t("order.filter_refresh")}
        actionClassName="claims-filter-actions"
        actionExtra={
          <Link to="/tickets/create">
            <Button type="primary" icon={<PlusOutlined />}>
              {page.t("tickets.create")}
            </Button>
          </Link>
        }
        primaryContent={
          <Form.Item
            name="code"
            label={`${page.t("tickets.enter_code")}:`}
            style={{ marginBottom: 0 }}
          >
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder={page.t("tickets.code")}
              onPressEnter={page.handleSearch}
            />
          </Form.Item>
        }
        secondaryContent={
          <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
            <Form.Item
              name="publicStates"
              label={page.t("tickets.status")}
              style={{ marginBottom: 0 }}
            >
              <CheckableFilterTags options={page.statusData} />
            </Form.Item>

            <Form.Item
              name="solutionCode"
              label={page.t("tickets.solution")}
              style={{ marginBottom: 0 }}
            >
              <CheckableFilterTags options={solutionsByTicketType} />
            </Form.Item>

            <Form.Item name="ticketType" hidden>
              <Input />
            </Form.Item>

            <Form.Item label="Loại khiếu nại" style={{ marginBottom: 0 }}>
              <Space wrap>
                <Checkbox
                  checked={selectedTicketType === "order"}
                  onChange={(event) =>
                    changeTicketType("order", event.target.checked)
                  }
                >
                  {page.t("menu.orders")}
                </Checkbox>
                <Checkbox
                  checked={selectedTicketType === "shipment"}
                  onChange={(event) =>
                    changeTicketType("shipment", event.target.checked)
                  }
                >
                  {page.t("menu.shipments")}
                </Checkbox>
              </Space>
            </Form.Item>

            <Row gutter={[token.marginSM, token.marginSM]} style={{ marginInline: 0 }}>
              <Col xs={24} style={{ paddingInline: 0 }}>
                <Form.Item
                  name="relatedOrder"
                  label={`${page.t("tickets.enter_order_code")}:`}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    allowClear
                    placeholder={page.t("tickets.order_code")}
                    onPressEnter={page.handleSearch}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} style={{ paddingInline: 0 }}>
                <Form.Item
                  name="relatedProduct"
                  label={`${page.t("tickets.enter_product_code")}:`}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    allowClear
                    placeholder={page.t("tickets.product_code")}
                    onPressEnter={page.handleSearch}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Space>
        }
      />
    </>
  );
};

const ClaimCard = ({ record, page }: { record: any; page: ClaimsPageState }) => {
  const { token } = theme.useToken();
  const status = getStatusView(record, page.statusData);
  const solutionName = getSolutionName(record, page.solutionData);

  return (
    <Card style={{ width: "100%", overflow: "hidden" }} styles={{ body: { padding: token.paddingMD } }}>
      <Flex vertical gap={token.marginMD}>
        <Flex justify="space-between" align="flex-start" gap={token.marginSM}>
          <Space align="start" style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
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
            <Space direction="vertical" size={token.marginXXS} style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
              <Link to={`/tickets/${record.code}`} style={{ minWidth: 0, maxWidth: "100%" }}>
                <Text strong style={{ color: token.colorPrimary, textTransform: "uppercase", maxWidth: "100%" }} ellipsis>
                  #{record.code || "---"}
                </Text>
              </Link>
              <Link to={`/tickets/${record.code}`} style={{ minWidth: 0, maxWidth: "100%" }}>
                <Text style={{ color: token.colorPrimary, textTransform: "uppercase", maxWidth: "100%" }} ellipsis>
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
                maxWidth: 112,
                whiteSpace: "normal",
                textAlign: "center",
                flex: "0 0 auto",
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

        <Row gutter={[token.marginSM, token.marginXS]} style={{ marginInline: 0 }}>
          <Col xs={12} style={{ paddingInline: 0, paddingInlineEnd: token.paddingXS }}>
            <Space direction="vertical" size={0}>
              <Text type="secondary">{page.t("tickets.total_refund")}</Text>
              <Text strong style={{ color: token.colorSuccess }}>
                {moneyFormat(moneyCeil(record.totalRefund || 0))}
              </Text>
            </Space>
          </Col>
          <Col xs={12} style={{ paddingInline: 0, paddingInlineStart: token.paddingXS }}>
            <Space direction="vertical" size={0} style={{ minWidth: 0, width: "100%" }}>
              <Text type="secondary">{page.t("tickets.solution")}</Text>
              <Text ellipsis style={{ maxWidth: "100%" }}>{solutionName || "---"}</Text>
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
  const prefetchIndex = Math.max(rows.length - CLAIMS_PREFETCH_ITEM_COUNT, 0);

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

  if (page.isClaimsLoading) {
    return <ClaimsListSkeleton />;
  }

  return (
    <Space direction="vertical" size={token.marginMD} style={{ width: "100%" }}>
      <List
        dataSource={rows}
        locale={{
          emptyText: <Empty description={page.t("message.empty")} />,
        }}
        renderItem={(record, index) => (
          <List.Item
            style={{
              padding: 0,
              borderBlockEnd: 0,
              marginBottom: token.marginMD,
              width: "100%",
              minWidth: 0,
            }}
            ref={index === prefetchIndex ? loadMoreRef : undefined}
          >
            <ClaimCard record={record} page={page} />
          </List.Item>
        )}
        style={{ width: "100%", minWidth: 0, overflowX: "hidden" }}
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
  const page = useClaimsMobilePage();

  return (
    <Space direction="vertical" size={token.marginMD} style={{ width: "100%", minWidth: 0, overflowX: "hidden" }}>
      <ClaimsFilter page={page} />
      <ClaimsList page={page} />
    </Space>
  );
};
