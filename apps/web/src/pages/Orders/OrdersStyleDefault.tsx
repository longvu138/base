import { type ReactNode } from "react";
import dayjs from "dayjs";
import {
  Alert,
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
  DownloadOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { formatCurrency, quantityFormat } from "@repo/util";
import { FilterPanel } from "@repo/ui";
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

export const OrdersStyleDefault = () => {
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
  } = useOrdersPage();

  const orders = orderData?.data || [];

  const isApprovalService = (service: any) =>
    service.needApprove === true || service.approved === null;

  const renderServiceNames = (services: any[]) => (
    <Space wrap split={<Typography.Text type="secondary">|</Typography.Text>}>
      {services.map((service: any, index: number) => (
        <Typography.Text
          key={`${service.code || service.name || index}`}
          delete={service.approved === false}
        >
          {service.name}
        </Typography.Text>
      ))}
    </Space>
  );

  const renderServiceLine = (
    label: ReactNode,
    value: ReactNode,
    warningLabel = false,
  ) => (
    <Flex align="start" gap={token.marginXS} wrap>
      <Typography.Text type={warningLabel ? "warning" : "secondary"}>
        {label}:
      </Typography.Text>
      {value}
    </Flex>
  );

  const renderOrderServices = (services?: any[]) => {
    if (!services?.length) {
      return renderServiceLine(t("orders.filters.services"), "---");
    }

    const approvalServices = services.filter(isApprovalService);
    const normalServices = services.filter(
      (service: any) => !isApprovalService(service),
    );

    return (
      <Space direction="vertical" size={2}>
        {normalServices.length > 0 &&
          renderServiceLine(
            t("orders.filters.services"),
            renderServiceNames(normalServices),
          )}
        {approvalServices.length > 0 &&
          renderServiceLine(
            t("orders.service_waiting_approval"),
            <Typography.Text type="warning">
              {renderServiceNames(approvalServices)}
            </Typography.Text>,
            true,
          )}
      </Space>
    );
  };

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
      <Card className="mb-4 shadow-sm">
        <FilterPanel
          form={form}
          onSearch={handleSearch}
          onReset={handleReset}
          loading={isOrderLoading}
          searchText={t("orders.buttons.search")}
          resetText={t("orders.buttons.reset")}
          showCollapseAll={true}
          primaryContent={
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Form.Item
                name="statuses"
                label={t("orders.filters.status")}
                style={{ marginBottom: 0 }}
              >
                <Checkbox.Group>
                  <Space wrap>
                    {statusOptions.map((item: any) => (
                      <Checkbox key={item.value} value={item.value}>
                        {item.label}  {item.count > 0 ? ` (${item.count})` : ""}
                      </Checkbox>
                    ))}
                  </Space>
                </Checkbox.Group>
              </Form.Item>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={6}>
                  <Form.Item
                    name="query"
                    label={t("orders.search_placeholder")}
                    style={{ marginBottom: 0 }}
                  >
                    <Input
                      allowClear
                      prefix={<SearchOutlined />}
                      placeholder={t("orders.search_placeholder")}
                      onPressEnter={handleSearch}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    name="note"
                    label={t("orders.filters.note")}
                    style={{ marginBottom: 0 }}
                  >
                    <Input allowClear />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    name="timestampFrom"
                    label={t("orders.filters.created_at")}
                    style={{ marginBottom: 0 }}
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
                    name="timestampTo"
                    label=" "
                    style={{ marginBottom: 0 }}
                  >
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
                    style={{ marginBottom: 0 }}
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
                    style={{ marginBottom: 0 }}
                  >
                    <Input
                      allowClear
                      placeholder={t("orders.filters.ref_customer_code")}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    name="needPaid"
                    valuePropName="checked"
                    label=" "
                    style={{ marginBottom: 0 }}
                  >
                    <Checkbox>{t("orders.filters.financial_payment")}</Checkbox>
                  </Form.Item>
                </Col>
              </Row>
            </Space>
          }
          secondaryContent={
            <div style={{ marginTop: 16 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={24}>
                  <Form.Item
                    name="marketplaces"
                    label={t("orders.filters.source")}
                    style={{ marginBottom: 0 }}
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
                <Col xs={24} md={24}>
                  <Form.Item
                    name="services"
                    label={t("orders.filters.services")}
                    style={{ marginBottom: 0 }}
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

              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} md={6}>
                  <Form.Item
                    name="cutOffStatus"
                    label={t("orders.filters.stuck_status")}
                    style={{ marginBottom: 0 }}
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
                    style={{ marginBottom: 0 }}
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
                    style={{ marginBottom: 0 }}
                  >
                    <Input allowClear placeholder={t("orders.filters.from")} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    name="handlingTimeTo"
                    label={t("orders.filters.to")}
                    style={{ marginBottom: 0 }}
                  >
                    <Input allowClear placeholder={t("orders.filters.to")} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} md={6}>
                  <Form.Item
                    name="milestoneStatus"
                    label={t("orders.filters.time_range")}
                    style={{ marginBottom: 0 }}
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
                    style={{ marginBottom: 0 }}
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
                    style={{ marginBottom: 0 }}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      placeholder={t("orders.filters.end_date")}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          }
        />
      </Card>

      <Card
        title={
          <Space size="small">
            <Typography.Text strong>{t("orders.title")}</Typography.Text>
            <Tag color="blue">{orderData?.total || 0}</Tag>
          </Space>
        }
        extra={
          <Button icon={<DownloadOutlined />}>{t("common.export")}</Button>
        }
        styles={{ body: { padding: "0 12px" } }}
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
                            <Image
                              src={record?.marketplace?.image}
                              height={20}
                              width={20}
                              preview={false}
                              referrerPolicy="no-referrer"
                              fallback="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                              style={{
                                borderRadius: token.borderRadius,
                                objectFit: "cover",
                                background: token.colorFillQuaternary,
                                border: `1px solid ${token.colorBorderSecondary}`,
                              }}
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
                            height={160}
                            width={160}
                            preview={false}
                            fallback="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                            style={{
                              borderRadius: token.borderRadius,
                              objectFit: "cover",
                              // background: token.colorFillQuaternary,
                              // border: `1px solid ${token.colorBorderSecondary}`,
                            }}
                            referrerPolicy="no-referrer"
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

                            {renderOrderServices(record?.services)}

                            <Row gutter={[24, 16]}>
                              <Col xs={24} sm={12} md={6}>
                                <div style={metricColStyle}>
                                  <Typography.Text
                                    type="secondary"
                                    style={metricLabelStyle}
                                  >
                                    {t("orders.metrics.quantity")}{" "}
                                    <Tooltip
                                      title={t(
                                        "orders.metrics.quantity_tooltip",
                                      )}
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
                              </Col>
                              <Col xs={24} sm={12} md={6}>
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
                              </Col>
                              <Col xs={24} sm={12} md={6}>
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
                              </Col>
                              <Col xs={24} sm={12} md={6}>
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
                              </Col>
                              <Col xs={24} sm={12} md={6}>
                                <div style={metricColStyle}>
                                  <Typography.Text
                                    type="secondary"
                                    style={metricLabelStyle}
                                  >
                                    {t("order.discountAmount")}
                                  </Typography.Text>
                                  <Typography.Paragraph
                                    strong
                                    style={metricValueStyle}
                                  >
                                    {record?.discountAmount !== undefined
                                      ? formatCurrency(record.discountAmount)
                                      : "---"}
                                  </Typography.Paragraph>
                                </div>
                              </Col>
                              <Col xs={24} sm={12} md={6}>
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
                              </Col>
                              <Col xs={24} sm={12} md={6}>
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
                              </Col>
                              <Col xs={24} sm={12} md={6}>
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
                              </Col>
                            </Row>
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

        <Flex justify="flex-end" style={{ marginTop: token.marginLG }}>
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

export default OrdersStyleDefault;
