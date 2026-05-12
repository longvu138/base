import dayjs from "dayjs";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Empty,
  Flex,
  Form,
  Image,
  Input,
  List,
  Pagination,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  theme,
} from "antd";
import {
  DownOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { formatCurrency, quantityFormat } from "@repo/util";
import { useOrdersPage } from "./hooks/useOrdersPage";

const getStatusMeta = (statuses: any[] = [], code?: string) =>
  statuses.find((item) => item.code === code) || { name: code || "---" };

const metricTextStyle = { margin: 0 };
const metricColStyle = {
  width: 148,
  maxWidth: 148,
  flex: "0 0 148px",
} as const;
const metricLabelStyle = {
  display: "block",
  whiteSpace: "nowrap",
} as const;
const metricValueStyle = {
  ...metricTextStyle,
  whiteSpace: "nowrap",
} as const;

export const OrdersStyle1 = () => {
  const { token } = theme.useToken();
  const {
    t,
    form,
    page,
    pageSize,
    setPage,
    setPageSize,
    orderData,
    isOrderLoading,
    statusData,
    servicesData,
    marketplacesData,
    statusOptions,
    handleSearch,
    handleReset,
    updateOrderNote,
    navigateToDetail,
    navigateToCreateDelivery,
    deliveryReadyCount,
    isAdvancedFilterOpen,
    toggleAdvancedFilter,
  } = useOrdersPage();

  const orders = orderData?.data || [];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {deliveryReadyCount > 0 && (
        <Alert
          type="success"
          showIcon
          closable
          message={
            <Typography.Text strong>{t("orders.notice.title")}</Typography.Text>
          }
          description={
            <Typography.Text>
              {t("orders.notice.have")}{" "}
              <Typography.Text strong>{deliveryReadyCount}</Typography.Text>{" "}
              {t("orders.notice.order_at_stock")}, {t("orders.notice.please")}{" "}
              <Typography.Link onClick={navigateToCreateDelivery}>
                {t("orders.notice.delivery_request")}
              </Typography.Link>{" "}
              {t("orders.notice.to_delivery")}
            </Typography.Text>
          }
        />
      )}
      <Card>
        <Form form={form} layout="vertical">
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Form.Item name="statuses" label={t("orders.filters.status")}>
              <Checkbox.Group>
                <Space wrap>
                  {statusOptions.map((item: any) => (
                    <Checkbox key={item.value} value={item.value}>
                      {item.label} ({item.count})
                    </Checkbox>
                  ))}
                </Space>
              </Checkbox.Group>
            </Form.Item>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={6}>
                <Form.Item name="query" label={t("orders.search_placeholder")}>
                  <Input
                    allowClear
                    prefix={<SearchOutlined />}
                    placeholder={t("orders.search_placeholder")}
                    onPressEnter={handleSearch}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="note" label={t("orders.filters.note")}>
                  <Input allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  name="timestampFrom"
                  label={t("orders.filters.created_at")}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder={t("orders.filters.start_date")}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="timestampTo" label=" ">
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder={t("orders.filters.end_date")}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={6}>
                <Form.Item
                  name="refOrderCode"
                  label={t("orders.filters.ref_order_code")}
                >
                  <Input
                    allowClear
                    placeholder={t("orders.filters.ref_order_code")}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  name="refCustomerCode"
                  label={t("orders.filters.ref_customer_code")}
                >
                  <Input
                    allowClear
                    placeholder={t("orders.filters.ref_customer_code")}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="needPaid" valuePropName="checked" label=" ">
                  <Checkbox>{t("orders.filters.financial_payment")}</Checkbox>
                </Form.Item>
              </Col>
            </Row>

            {isAdvancedFilterOpen && (
              <>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="marketplaces"
                      label={t("orders.filters.source")}
                    >
                      <Checkbox.Group>
                        <Space wrap>
                          {marketplacesData?.map((item: any) => (
                            <Checkbox key={item.code} value={item.code}>
                              {item.name}
                            </Checkbox>
                          ))}
                        </Space>
                      </Checkbox.Group>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="services"
                      label={t("orders.filters.services")}
                    >
                      <Checkbox.Group>
                        <Space wrap>
                          {servicesData?.map((item: any) => (
                            <Checkbox key={item.code} value={item.code}>
                              {item.name}
                            </Checkbox>
                          ))}
                        </Space>
                      </Checkbox.Group>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={6}>
                    <Form.Item
                      name="cutOffStatus"
                      label={t("orders.filters.stuck_status")}
                    >
                      <Select
                        allowClear
                        showSearch
                        placeholder={t("orders.filters.status")}
                        optionFilterProp="label"
                        options={statusData?.map((item: any) => ({
                          label: item.name,
                          value: item.code,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item
                      name="typeSearch"
                      label={t("orders.filters.period")}
                    >
                      <Select
                        allowClear
                        placeholder={t("orders.filters.period")}
                        options={[
                          {
                            label: t("orders.filters.cut_off_range"),
                            value: "range",
                          },
                          {
                            label: t("orders.filters.cut_off_equal"),
                            value: "equal",
                          },
                          {
                            label: t("orders.filters.cut_off_from"),
                            value: "from",
                          },
                          {
                            label: t("orders.filters.cut_off_to"),
                            value: "to",
                          },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item
                      name="handlingTimeFrom"
                      label={t("orders.filters.from")}
                    >
                      <Input
                        allowClear
                        placeholder={t("orders.filters.from")}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item
                      name="handlingTimeTo"
                      label={t("orders.filters.to")}
                    >
                      <Input allowClear placeholder={t("orders.filters.to")} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={6}>
                    <Form.Item
                      name="milestoneStatus"
                      label={t("orders.filters.time_range")}
                    >
                      <Select
                        allowClear
                        showSearch
                        placeholder={t("orders.filters.time_range")}
                        optionFilterProp="label"
                        options={statusData?.map((item: any) => ({
                          label: item.name,
                          value: item.code,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item
                      name="milestoneStatusFrom"
                      label={t("orders.filters.start_date")}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        placeholder={t("orders.filters.start_date")}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item
                      name="milestoneStatusTo"
                      label={t("orders.filters.end_date")}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        placeholder={t("orders.filters.end_date")}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            <Flex justify="space-between" gap={token.marginSM} wrap>
              <Space>
                <Button
                  type="link"
                  icon={
                    isAdvancedFilterOpen ? <UpOutlined /> : <DownOutlined />
                  }
                  onClick={toggleAdvancedFilter}
                >
                  {isAdvancedFilterOpen
                    ? t("orders.buttons.search_collapse")
                    : t("orders.buttons.search_expand")}
                </Button>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  loading={isOrderLoading}
                  onClick={handleSearch}
                >
                  {t("orders.buttons.search")}
                </Button>
                <Button onClick={handleReset}>
                  {t("orders.buttons.reset")}
                </Button>
              </Space>
              <Space>
                <Button icon={<DownloadOutlined />}>
                  {t("common.export")}
                </Button>
                <Button type="primary" icon={<PlusOutlined />}>
                  {t("common.create", { defaultValue: "Tạo mới" })}
                </Button>
              </Space>
            </Flex>
          </Space>
        </Form>
      </Card>

      <Card
        title={
          <Space size="small">
            <Typography.Text strong>{t("orders.title")}</Typography.Text>
            <Tag color="blue">{orderData?.total || 0}</Tag>
          </Space>
        }
      >
        <Spin spinning={isOrderLoading}>
          <List
            dataSource={orders}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={t("common.no_data")}
                />
              ),
            }}
            renderItem={(record: any) => {
              const status = getStatusMeta(statusData, record?.status);
              const hasInspection = record?.services?.some(
                (item: any) => item.code === "inspection",
              );
              return (
                <List.Item>
                  <Card
                    hoverable
                    styles={{ body: { padding: 0 } }}
                    style={{
                      width: "100%",
                      background: token.colorFillQuaternary,
                    }}
                    className="overflow-hidden"
                  >
                    <Flex
                      align="center"
                      justify="space-between"
                      gap={token.marginMD}
                      wrap
                      style={{
                        padding: token.padding,
                        borderBottom: `1px solid ${token.colorBorderSecondary}`,
                        background: token.colorBgContainer,
                      }}
                    >
                      <Space
                        split={
                          <span style={{ color: token.colorBorder }}>|</span>
                        }
                        wrap
                      >
                        <Typography.Paragraph
                          copyable={{ text: record?.code }}
                          style={{ margin: 0 }}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Typography.Link
                            strong
                            onClick={() => navigateToDetail(record?.code)}
                          >
                            #{record?.code}
                          </Typography.Link>
                        </Typography.Paragraph>
                        <Space size="small">
                          <a
                            href={record?.merchantUrl || undefined}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Avatar
                              shape="square"
                              size={20}
                              src={record?.marketplace?.image}
                            />
                          </a>
                          <Typography.Text ellipsis style={{ maxWidth: 320 }}>
                            {record?.merchantName ||
                              record?.merchantCode ||
                              "---"}
                          </Typography.Text>
                        </Space>
                      </Space>
                      <Tag
                        color={status?.color || "default"}
                        icon={<InfoCircleOutlined />}
                      >
                        {status?.name}
                      </Tag>
                    </Flex>

                    <div
                      style={{
                        padding: token.padding,
                        background: token.colorBgContainer,
                      }}
                    >
                      <Row gutter={[24, 16]} align="top">
                        <Col xs={24} md={4}>
                          <Image
                            src={record?.image}
                            width="100%"
                            height={160}
                            preview={false}
                            fallback="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                            style={{
                              borderRadius: token.borderRadius,
                              objectFit: "cover",
                              background: token.colorFillQuaternary,
                              border: `1px solid ${token.colorBorderSecondary}`,
                            }}
                            onClick={() => navigateToDetail(record?.code)}
                          />
                        </Col>
                        <Col xs={24} md={20}>
                          <Space
                            direction="vertical"
                            size="middle"
                            style={{ width: "100%" }}
                          >
                            <Flex align="start" gap={token.marginXS}>
                              <Typography.Text type="secondary">
                                {t("orders.columns.note")}:
                              </Typography.Text>
                              <Typography.Text
                                editable={{
                                  text: record?.note || "",
                                  onChange: (value) => {
                                    if (value !== record?.note) {
                                      updateOrderNote.mutateAsync({
                                        code: record?.code,
                                        note: value,
                                      });
                                    }
                                  },
                                  triggerType: ["icon", "text"],
                                }}
                                onClick={(event) => event.stopPropagation()}
                              >
                                {record?.note || "---"}
                              </Typography.Text>
                            </Flex>

                            <Space wrap size={[token.marginXS, token.marginXS]}>
                              <Typography.Text type="secondary">
                                {t("orders.filters.services")}:
                              </Typography.Text>
                              {record?.services?.length
                                ? record.services.map((item: any) => (
                                    <Tag
                                      key={item.code}
                                      color={
                                        item.approved === false
                                          ? "default"
                                          : "blue"
                                      }
                                      style={{
                                        textDecoration:
                                          item.approved === false
                                            ? "line-through"
                                            : undefined,
                                      }}
                                    >
                                      {item.name}
                                    </Tag>
                                  ))
                                : "---"}
                            </Space>

                            <Flex wrap gap={token.marginMD}>
                              <div style={metricColStyle}>
                                <Typography.Text
                                  type="secondary"
                                  style={metricLabelStyle}
                                >
                                  {t("orders.metrics.quantity")}{" "}
                                  <Tooltip
                                    title={t("orders.metrics.quantity_tooltip")}
                                  >
                                    <QuestionCircleOutlined />
                                  </Tooltip>
                                </Typography.Text>
                                <Typography.Paragraph
                                  strong
                                  style={metricValueStyle}
                                >
                                  {quantityFormat(record?.orderedQuantity)}/
                                  {quantityFormat(record?.purchasedQuantity)}
                                  {hasInspection
                                    ? `/${quantityFormat(record?.receivedQuantity)}`
                                    : ""}
                                </Typography.Paragraph>
                              </div>
                              <div style={metricColStyle}>
                                <Typography.Text
                                  type="secondary"
                                  style={metricLabelStyle}
                                >
                                  {t("orders.metrics.fee_total")}
                                </Typography.Text>
                                <Typography.Paragraph
                                  strong
                                  style={metricValueStyle}
                                >
                                  {formatCurrency(record?.grandTotal || 0)}
                                </Typography.Paragraph>
                              </div>
                              <div style={metricColStyle}>
                                <Typography.Text
                                  type="secondary"
                                  style={metricLabelStyle}
                                >
                                  {t("orders.metrics.goods_money")}
                                </Typography.Text>
                                <Typography.Paragraph
                                  strong
                                  style={metricValueStyle}
                                >
                                  {formatCurrency(
                                    record?.exchangedTotalValue || 0,
                                  )}
                                </Typography.Paragraph>
                              </div>
                              <div style={metricColStyle}>
                                <Typography.Text
                                  type="secondary"
                                  style={metricLabelStyle}
                                >
                                  {record?.totalUnpaid < 0
                                    ? t("orders.metrics.excess_cash")
                                    : t("orders.metrics.need_payment")}
                                </Typography.Text>
                                <Typography.Paragraph
                                  strong
                                  type={
                                    record?.totalUnpaid < 0
                                      ? "success"
                                      : "danger"
                                  }
                                  style={metricValueStyle}
                                >
                                  {formatCurrency(
                                    Math.abs(record?.totalUnpaid || 0),
                                  )}
                                </Typography.Paragraph>
                              </div>
                              <div style={metricColStyle}>
                                <Typography.Text
                                  type="secondary"
                                  style={metricLabelStyle}
                                >
                                  {t("orders.metrics.weight")}
                                </Typography.Text>
                                <Typography.Paragraph
                                  strong
                                  style={metricValueStyle}
                                >
                                  {record?.actualWeight ||
                                  record?.chargeableWeight
                                    ? `${record.actualWeight || record.chargeableWeight}kg`
                                    : "---"}
                                </Typography.Paragraph>
                              </div>
                              <div style={metricColStyle}>
                                <Typography.Text
                                  type="secondary"
                                  style={metricLabelStyle}
                                >
                                  {t("orders.metrics.packages")}
                                </Typography.Text>
                                <Typography.Paragraph
                                  strong
                                  style={metricValueStyle}
                                >
                                  {record?.totalPackages ||
                                    record?.totalPackage ||
                                    "---"}
                                </Typography.Paragraph>
                              </div>
                              <div style={metricColStyle}>
                                <Typography.Text
                                  type="secondary"
                                  style={metricLabelStyle}
                                >
                                  {t("orders.columns.created_at")}
                                </Typography.Text>
                                <Typography.Paragraph
                                  strong
                                  style={metricValueStyle}
                                >
                                  {record?.createdAt
                                    ? dayjs(record.createdAt).format(
                                        "HH:mm DD/MM/YYYY",
                                      )
                                    : "---"}
                                </Typography.Paragraph>
                              </div>
                            </Flex>
                          </Space>
                        </Col>
                      </Row>
                    </div>
                  </Card>
                </List.Item>
              );
            }}
          />
        </Spin>

        <Flex justify="center" style={{ marginTop: token.marginLG }}>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={orderData?.total || 0}
            showSizeChanger
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

export default OrdersStyle1;
