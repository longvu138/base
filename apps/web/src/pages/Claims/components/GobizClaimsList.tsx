import { useMemo } from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import {
  SearchOutlined,
} from "@ant-design/icons";
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
  Pagination,
  Row,
  Space,
  Table,
  Tag,
  Typography,
  theme,
} from "antd";
import { useTranslation } from "@repo/i18n";
import { moneyCeil, moneyFormat, quantityFormat } from "@repo/util";
import { FilterPanel } from "@repo/ui";
import { useClaimsPage } from "@repo/hooks";

const { Text, Title } = Typography;

type ClaimsPageState = Pick<
  ReturnType<typeof useClaimsPage>,
  | "t"
  | "form"
  | "filters"
  | "statusData"
  | "solutionData"
  | "handleSearch"
  | "handleReset"
>;

const getStatusView = (record: any, statuses: any[] = []) => {
  if (record.publicStateNewView) return record.publicStateNewView;
  if (typeof record.publicState === "object") return record.publicState;
  return statuses.find((item: any) => item.code === record.publicState) || {};
};

const getSolutionName = (record: any, solutions: any[] = []) => {
  if (record.solutionView?.name) return record.solutionView.name;
  return solutions.find((item: any) => item.code === record.solutionCode)?.name || record.solutionCode || "";
};

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
          solutions.map((item: any) => [item.name || item.code, item]),
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

const ClaimsFilter = ({ page }: { page: ClaimsPageState }) => {
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
    <Card className="mb-4 shadow-sm">
      <FilterPanel
        form={page.form}
        onSearch={page.handleSearch}
        onReset={page.handleReset}
        searchText={page.t("order.search")}
        resetText={page.t("order.filter_refresh")}
        primaryContent={
          <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
            <Form.Item name="publicStates" label={page.t("tickets.status")} style={{ marginBottom: 0 }}>
              <CheckableFilterTags options={page.statusData || []} />
            </Form.Item>

            <Form.Item name="solutionCode" label={page.t("tickets.solution")} style={{ marginBottom: 0 }}>
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

            <Row gutter={[token.margin, token.marginSM]}>
              <Col xs={24} md={8}>
                <Form.Item name="code" label={`${page.t("tickets.enter_code")}:`} style={{ marginBottom: 0 }}>
                  <Input
                    allowClear
                    prefix={<SearchOutlined />}
                    placeholder={page.t("tickets.code")}
                    onPressEnter={page.handleSearch}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="relatedOrder" label={`${page.t("tickets.enter_order_code")}:`} style={{ marginBottom: 0 }}>
                  <Input
                    allowClear
                    placeholder={page.t("tickets.order_code")}
                    onPressEnter={page.handleSearch}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="relatedProduct" label={`${page.t("tickets.enter_product_code")}:`} style={{ marginBottom: 0 }}>
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
    </Card>
  );
};

export const GobizClaimsList = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const {
    form,
    page,
    pageSize,
    setPage,
    setPageSize,
    filters,
    listData,
    isClaimsLoading,
    statusData = [],
    solutionData = [],
    handleSearch,
    handleReset,
  } = useClaimsPage();

  const columns = [
    {
      title: t("tickets.code"),
      dataIndex: "code",
      key: "code",
      render: (text: string, record: any) => (
        <Link to={`/tickets/${record.code}`}>
          <Text strong style={{ color: token.colorPrimary, textTransform: "uppercase" }}>
            #{text}
          </Text>
        </Link>
      ),
    },
    {
      title: t("tickets.name"),
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <Link to={`/tickets/${record.code}`}>
          <Text style={{ color: token.colorPrimary, textTransform: "uppercase" }}>
            {text || "---"}
          </Text>
        </Link>
      ),
    },
    {
      title: t("tickets.product_image"),
      dataIndex: "thumbnail",
      key: "thumbnail",
      width: 150,
      render: (thumbnail: string) =>
        thumbnail ? (
          <Image
            preview={false}
            src={thumbnail}
            alt={t("tickets.product_image")}
            width={80}
            height={80}
            style={{ objectFit: "cover" }}
            referrerPolicy="no-referrer"
          />
        ) : (
          ""
        ),
    },
    {
      title: t("tickets.created_at"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) =>
        value ? (
          <Text style={{ textTransform: "uppercase" }}>
            {dayjs(value).format("HH:mm DD/MM/YYYY")}
          </Text>
        ) : (
          "---"
        ),
    },
    {
      title: t("tickets.status"),
      dataIndex: "publicStateNewView",
      key: "publicStateNewView",
      render: (_: any, record: any) => {
        const status = getStatusView(record, statusData);
        if (!status?.name && !status?.code) return <span />;

        return (
          <Tag
            style={{
              backgroundColor: status.color || token.colorTextTertiary,
              color: token.colorWhite,
              borderColor: "transparent",
            }}
          >
            {status.name || status.code}
            {record.archived ? ` (${t("tickets.closed")})` : ""}
          </Tag>
        );
      },
    },
    {
      title: t("tickets.total_refund"),
      dataIndex: "totalRefund",
      key: "totalRefund",
      render: (value: number) => (
        <Text strong style={{ color: token.colorSuccess }}>
          {moneyFormat(moneyCeil(value || 0))}
        </Text>
      ),
    },
    {
      title: t("tickets.solution"),
      dataIndex: "solutionView",
      key: "solutionView",
      render: (_: any, record: any) => getSolutionName(record, solutionData) || "",
    },
    {
      title: "",
      key: "action",
      align: "right" as const,
      render: (_: any, record: any) => (
        <Link to={`/tickets/${record.code}`}>
          <Button type="link">{t("tickets.detail")}</Button>
        </Link>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
      <ClaimsFilter
        page={{
          t,
          form,
          filters,
          statusData,
          solutionData,
          handleSearch,
          handleReset,
        }}
      />

      <Card
        title={
          <Title level={5} style={{ margin: 0 }}>
            {t("tickets.title")}{" "}
            <Text type="secondary">
              ({quantityFormat(Number(listData?.total || 0))})
            </Text>
          </Title>
        }
        extra={
          <Link to="/tickets/create">
            <Button type="primary" ghost>
              {t("tickets.create")}
            </Button>
          </Link>
        }
      >
        <Table
          rowKey="code"
          columns={columns}
          dataSource={listData?.data || []}
          loading={isClaimsLoading}
          pagination={false}
          locale={{
            emptyText: (
              <Empty description={t("message.empty")} />
            ),
          }}
        />

        <Flex justify="flex-end" style={{ marginTop: token.margin }}>
          <Pagination
            hideOnSinglePage
            current={page}
            pageSize={pageSize}
            total={listData?.total || 0}
            onChange={(nextPage, nextPageSize) => {
              setPage(nextPage);
              if (nextPageSize !== pageSize) setPageSize(nextPageSize);
            }}
          />
        </Flex>
      </Card>
    </Space>
  );
};

export default GobizClaimsList;
