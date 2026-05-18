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
  Pagination,
  Radio,
  Row,
  Space,
  Table,
  Tag,
  Typography,
  theme,
} from "antd";
import { useTranslation } from "@repo/i18n";
import { moneyFormat, quantityFormat } from "@repo/util";
import { FilterPanel } from "@repo/ui";
import { useClaimsPage } from "../hooks/useClaimsPage";

const { Text, Title } = Typography;

const getStatusView = (record: any, statuses: any[] = []) => {
  if (record.publicStateNewView) return record.publicStateNewView;
  if (typeof record.publicState === "object") return record.publicState;
  return statuses.find((item: any) => item.code === record.publicState) || {};
};

const getSolutionName = (record: any, solutions: any[] = []) => {
  if (record.solutionView?.name) return record.solutionView.name;
  return solutions.find((item: any) => item.code === record.solutionCode)?.name || record.solutionCode || "";
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

  const activeTicketType = Form.useWatch("ticketType", form) || filters.ticketType || "";

  const solutionsByTicketType = activeTicketType
    ? solutionData.filter((item: any) => item.subject === activeTicketType)
    : Array.from(
        new Map(solutionData.map((item: any) => [item.name || item.code, item])).values(),
      );

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
          {moneyFormat(value || 0)}
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
      <Card className="mb-4 shadow-sm">
        <FilterPanel
          form={form}
          onSearch={handleSearch}
          onReset={handleReset}
          searchText={t("order.search")}
          resetText={t("order.filter_refresh")}
          primaryContent={
            <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
              <Form.Item name="publicStates" label={t("tickets.status")} style={{ marginBottom: 0 }}>
                <Checkbox.Group>
                  <Space wrap>
                    {statusData.map((item: any) => (
                      <Checkbox key={item.code} value={item.code}>
                        {item.name}
                      </Checkbox>
                    ))}
                  </Space>
                </Checkbox.Group>
              </Form.Item>

              <Form.Item name="solutionCode" label={t("tickets.solution")} style={{ marginBottom: 0 }}>
                <Checkbox.Group>
                  <Space wrap>
                    {solutionsByTicketType.map((item: any) => (
                      <Checkbox key={`${item.subject || "all"}-${item.code}`} value={item.code}>
                        {item.name}
                      </Checkbox>
                    ))}
                  </Space>
                </Checkbox.Group>
              </Form.Item>

              <Form.Item name="ticketType" label="Loại khiếu nại" style={{ marginBottom: 0 }}>
                <Radio.Group onChange={() => handleSearch()}>
                  <Space wrap>
                    <Radio value="">Tất cả</Radio>
                    <Radio value="order">{t("menu.orders")}</Radio>
                    <Radio value="shipment">{t("menu.shipments")}</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>

              <Row gutter={[token.margin, token.marginSM]}>
                <Col xs={24} md={8}>
                  <Form.Item name="code" label={`${t("tickets.enter_code")}:`} style={{ marginBottom: 0 }}>
                    <Input
                      placeholder={t("tickets.code")}
                      onPressEnter={handleSearch}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="relatedOrder" label={`${t("tickets.enter_order_code")}:`} style={{ marginBottom: 0 }}>
                    <Input
                      placeholder={t("tickets.order_code")}
                      onPressEnter={handleSearch}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="relatedProduct" label={`${t("tickets.enter_product_code")}:`} style={{ marginBottom: 0 }}>
                    <Input
                      placeholder={t("tickets.product_code")}
                      onPressEnter={handleSearch}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Space>
          }
        />
      </Card>

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
