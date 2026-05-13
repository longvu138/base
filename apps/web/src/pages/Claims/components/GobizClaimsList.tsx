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
  Row,
  Space,
  Table,
  Tag,
  Typography,
  theme,
} from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { useTranslation } from "@repo/i18n";
import { moneyFormat, quantityFormat } from "@repo/util";
import { useClaimsPage } from "../hooks/useClaimsPage";

const { Text, Title } = Typography;

const asArray = (value: any) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value).split(",").filter(Boolean);
};

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
    applyFilters,
  } = useClaimsPage();

  const activePublicStates = asArray(filters.publicStates);
  const activeSolutions = asArray(filters.solutionCode);
  const activeTicketType = filters.ticketType || "";

  const updateFilter = (key: string, value: any) => {
    form.setFieldsValue({ [key]: value });
    applyFilters({ ...form.getFieldsValue(), [key]: value });
  };

  const toggleMultiFilter = (key: string, code: string) => {
    const current = asArray(form.getFieldValue(key) ?? filters[key]);
    const next = current.includes(code)
      ? current.filter((item: string) => item !== code)
      : [...current, code];
    updateFilter(key, next);
  };

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
      <Card>
        <Form form={form} layout="vertical" onFinish={handleSearch}>
          <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
            <Row gutter={[token.marginSM, token.marginSM]} align="top">
              <Col flex="110px">
                <Text>{t("tickets.status")}:</Text>
              </Col>
              <Col flex="auto">
                <Space size={token.marginXS} wrap>
                  {statusData.map((item: any) => {
                    const checked = activePublicStates.includes(item.code);
                    return (
                      <Tag.CheckableTag
                        key={item.code}
                        checked={checked}
                        onChange={() => toggleMultiFilter("publicStates", item.code)}
                        style={{
                          border: `1px solid ${checked ? token.colorPrimary : token.colorBorder}`,
                          borderRadius: token.borderRadiusSM,
                          paddingInline: token.paddingSM,
                        }}
                      >
                        {item.name}
                      </Tag.CheckableTag>
                    );
                  })}
                </Space>
              </Col>
            </Row>

            <Row gutter={[token.marginSM, token.marginSM]} align="top">
              <Col flex="110px">
                <Text>{t("tickets.solution")}:</Text>
              </Col>
              <Col flex="auto">
                <Space size={token.marginXS} wrap>
                  {solutionsByTicketType.map((item: any) => {
                    const checked = activeSolutions.includes(item.code);
                    return (
                      <Tag.CheckableTag
                        key={`${item.subject || "all"}-${item.code}`}
                        checked={checked}
                        onChange={() => toggleMultiFilter("solutionCode", item.code)}
                        style={{
                          border: `1px solid ${checked ? token.colorPrimary : token.colorBorder}`,
                          borderRadius: token.borderRadiusSM,
                          paddingInline: token.paddingSM,
                        }}
                      >
                        {item.name}
                      </Tag.CheckableTag>
                    );
                  })}
                </Space>
              </Col>
            </Row>

            <Row gutter={[token.marginSM, token.marginSM]}>
              <Col span={24}>
                <Space wrap>
                  <Checkbox
                    checked={activeTicketType === "order"}
                    onChange={(event) => updateFilter("ticketType", event.target.checked ? "order" : "")}
                  >
                    {t("menu.orders")}
                  </Checkbox>
                  <Checkbox
                    checked={activeTicketType === "shipment"}
                    onChange={(event) =>
                      updateFilter("ticketType", event.target.checked ? "shipment" : "")
                    }
                  >
                    {t("menu.shipments")}
                  </Checkbox>
                </Space>
              </Col>
            </Row>

            <Row gutter={[token.margin, token.marginSM]}>
              <Col xs={24} md={8}>
                <Form.Item name="code" label={`${t("tickets.enter_code")}:`}>
                  <Input
                    placeholder={t("tickets.code")}
                    onPressEnter={handleSearch}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="relatedOrder" label={`${t("tickets.enter_order_code")}:`}>
                  <Input
                    placeholder={t("tickets.order_code")}
                    onPressEnter={handleSearch}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="relatedProduct" label={`${t("tickets.enter_product_code")}:`}>
                  <Input
                    placeholder={t("tickets.product_code")}
                    onPressEnter={handleSearch}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Flex justify="flex-end" align="center" gap={token.margin}>
              <Button type="text" icon={<SyncOutlined />} onClick={handleReset}>
                {t("order.filter_refresh")}
              </Button>
              <Button type="primary" htmlType="submit" style={{ minWidth: 200 }}>
                {t("order.search")}
              </Button>
            </Flex>
          </Space>
        </Form>
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

        <Flex justify="center" style={{ marginTop: token.margin }}>
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
