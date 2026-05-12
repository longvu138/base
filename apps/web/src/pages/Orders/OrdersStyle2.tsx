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
  Input,
  Pagination,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  theme,
} from "antd";
import {
  DownOutlined,
  DownloadOutlined,
  PlusOutlined,
  SearchOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { formatCurrency } from "@repo/util";
import { useOrdersPage } from "./hooks/useOrdersPage";

const getStatusMeta = (statuses: any[] = [], code?: string) =>
  statuses.find((item) => item.code === code) || { name: code || "---" };

export const OrdersStyle2 = () => {
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
    navigateToDetail,
    navigateToCreateDelivery,
    deliveryReadyCount,
    isAdvancedFilterOpen,
    toggleAdvancedFilter,
  } = useOrdersPage();

  const columns = [
    {
      title: t("orders.columns.code"),
      dataIndex: "code",
      key: "code",
      render: (code: string, record: any) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong style={{ color: token.colorPrimary }}>
            #{code}
          </Typography.Text>
          <Typography.Text type="secondary">
            {record?.merchantName || "---"}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: t("orders.columns.note"),
      dataIndex: "note",
      key: "note",
      ellipsis: true,
      render: (note: string) => note || "---",
    },
    {
      title: t("orders.columns.warehouse"),
      dataIndex: "receivingWarehouse",
      key: "receivingWarehouse",
      render: (warehouse: any) => warehouse?.displayName || warehouse?.name || "---",
    },
    {
      title: t("orders.columns.status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const meta = getStatusMeta(statusData, status);
        return <Tag color={meta?.color || "default"}>{meta?.name}</Tag>;
      },
    },
    {
      title: t("orders.columns.total"),
      dataIndex: "grandTotal",
      key: "grandTotal",
      align: "right" as const,
      render: (amount: number) => (
        <Typography.Text strong>{formatCurrency(amount || 0)}</Typography.Text>
      ),
    },
    {
      title: t("orders.columns.created_at"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) =>
        value ? dayjs(value).format("HH:mm DD/MM/YYYY") : "-",
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {deliveryReadyCount > 0 && (
        <Alert
          type="success"
          showIcon
          closable
          message={<Typography.Text strong>{t("orders.notice.title")}</Typography.Text>}
          description={
            <Typography.Text>
              {t("orders.notice.have")} <Typography.Text strong>{deliveryReadyCount}</Typography.Text>{" "}
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
                <Form.Item name="timestampFrom" label={t("orders.filters.created_at")}>
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
              <Col xs={24} md={6}>
                <Form.Item name="refOrderCode" label={t("orders.filters.ref_order_code")}>
                  <Input allowClear placeholder={t("orders.filters.ref_order_code")} />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="refCustomerCode" label={t("orders.filters.ref_customer_code")}>
                  <Input allowClear placeholder={t("orders.filters.ref_customer_code")} />
                </Form.Item>
              </Col>
              {isAdvancedFilterOpen && (
                <>
              <Col xs={24} md={6}>
                <Form.Item name="cutOffStatus" label={t("orders.filters.stuck_status")}>
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
                <Form.Item name="typeSearch" label={t("orders.filters.period")}>
                  <Select
                    allowClear
                    placeholder={t("orders.filters.period")}
                    options={[
                      { label: t("orders.filters.cut_off_range"), value: "range" },
                      { label: t("orders.filters.cut_off_equal"), value: "equal" },
                      { label: t("orders.filters.cut_off_from"), value: "from" },
                      { label: t("orders.filters.cut_off_to"), value: "to" },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="handlingTimeFrom" label={t("orders.filters.from")}>
                  <Input allowClear placeholder={t("orders.filters.from")} />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="handlingTimeTo" label={t("orders.filters.to")}>
                  <Input allowClear placeholder={t("orders.filters.to")} />
                </Form.Item>
              </Col>
                </>
              )}
              <Col xs={24} md={6}>
                <Form.Item name="needPaid" valuePropName="checked" label=" ">
                  <Checkbox>{t("orders.filters.financial_payment")}</Checkbox>
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item label=" ">
                  <Button type="primary" block onClick={handleSearch}>
                    {t("orders.buttons.search")}
                  </Button>
                </Form.Item>
              </Col>
            </Row>

            {isAdvancedFilterOpen && (
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Form.Item name="marketplaces" label={t("orders.filters.source")}>
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
              <Col xs={24} md={8}>
                <Form.Item name="services" label={t("orders.filters.services")}>
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
              <Col xs={24} md={6}>
                <Form.Item name="milestoneStatus" label={t("orders.filters.time_range")}>
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
                <Form.Item name="milestoneStatusFrom" label={t("orders.filters.start_date")}>
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder={t("orders.filters.start_date")}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="milestoneStatusTo" label={t("orders.filters.end_date")}>
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder={t("orders.filters.end_date")}
                  />
                </Form.Item>
              </Col>
            </Row>
            )}

            <Flex justify="space-between" wrap gap={token.marginSM}>
              <Space>
                <Button
                  type="link"
                  icon={isAdvancedFilterOpen ? <UpOutlined /> : <DownOutlined />}
                  onClick={toggleAdvancedFilter}
                >
                  {isAdvancedFilterOpen
                    ? t("orders.buttons.search_collapse")
                    : t("orders.buttons.search_expand")}
                </Button>
                <Button onClick={handleReset}>{t("orders.buttons.reset")}</Button>
              </Space>
              <Space>
                <Button icon={<DownloadOutlined />}>{t("common.export")}</Button>
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
        <Table
          columns={columns}
          dataSource={orderData?.data || []}
          rowKey={(record: any) => record.id || record.code}
          loading={isOrderLoading}
          pagination={false}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("common.no_data")}
              />
            ),
          }}
          onRow={(record: any) => ({
            onClick: () => navigateToDetail(record.code),
            style: { cursor: "pointer" },
          })}
        />

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

export default OrdersStyle2;
