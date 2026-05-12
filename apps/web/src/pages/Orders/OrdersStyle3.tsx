import dayjs from "dayjs";
import React, { useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Drawer,
  Empty,
  Flex,
  Form,
  Input,
  Pagination,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  theme,
} from "antd";
import {
  ArrowRightOutlined,
  DownOutlined,
  FilterOutlined,
  RedoOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { formatCurrency } from "@repo/util";
import { useOrdersPage } from "./hooks/useOrdersPage";

const getStatusMeta = (statuses: any[] = [], code?: string) =>
  statuses.find((item) => item.code === code) || { name: code || "---" };

export const OrdersStyle3: React.FC<{ isTabView?: boolean }> = ({ isTabView }) => {
  const { token } = theme.useToken();
  const {
    t,
    form,
    page,
    pageSize,
    setPage,
    setPageSize,
    filters,
    orderData,
    isOrdersLoading,
    statusOptions,
    statusData,
    marketplacesData,
    servicesData,
    handleReset,
    applyFilters,
    navigateToDetail,
    navigateToCreateDelivery,
    deliveryReadyCount,
    isAdvancedFilterOpen,
    toggleAdvancedFilter,
  } = useOrdersPage();

  const [searchText, setSearchText] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const handleSearch = () =>
    applyFilters({ ...form.getFieldsValue(), query: searchText });

  const handleResetAll = () => {
    setSearchText("");
    handleReset();
  };

  const columns = [
    {
      title: t("orders.columns.code"),
      dataIndex: "code",
      key: "code",
      render: (code: string, record: any) => (
        <Space>
          <Avatar
            icon={<ShoppingCartOutlined />}
            style={{
              background: token.colorPrimaryBg,
              color: token.colorPrimary,
            }}
          />
          <Space direction="vertical" size={0}>
            <Typography.Text strong>{code}</Typography.Text>
            <Typography.Text type="secondary">
              {record?.createdAt
                ? dayjs(record.createdAt).format("HH:mm DD/MM/YYYY")
                : "-"}
            </Typography.Text>
          </Space>
        </Space>
      ),
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
      title: t("orders.columns.warehouse"),
      dataIndex: "receivingWarehouse",
      key: "receivingWarehouse",
      render: (warehouse: any) => warehouse?.displayName || "---",
    },
    {
      title: t("orders.columns.note"),
      dataIndex: "note",
      key: "note",
      ellipsis: true,
      render: (note: string) => (
        <Typography.Text type="secondary">{note || "---"}</Typography.Text>
      ),
    },
    {
      title: t("orders.columns.total"),
      dataIndex: "grandTotal",
      key: "grandTotal",
      align: "right" as const,
      render: (total: number) => (
        <Typography.Text strong style={{ color: token.colorPrimary }}>
          {formatCurrency(total || 0)}
        </Typography.Text>
      ),
    },
    {
      title: "",
      key: "action",
      width: 72,
      render: () => (
        <Button type="primary" shape="circle" icon={<ArrowRightOutlined />} />
      ),
    },
  ];

  const statusActiveKey = Array.isArray(filters.statuses)
    ? filters.statuses[0]
    : filters.statuses || "ALL";

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
      {!isTabView && (
        <Card>
          <Flex justify="space-between" align="center" gap={token.marginMD} wrap>
            <div>
              <Space size="small" align="center">
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {t("orders.title")}
                </Typography.Title>
                <Tag color="blue">{orderData?.total || 0}</Tag>
              </Space>
              <Typography.Text type="secondary">
                Gobiz Logistics
              </Typography.Text>
            </div>
            <Space wrap>
              <Input
                allowClear
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                onPressEnter={handleSearch}
                placeholder={t("orders.search_placeholder")}
                style={{ width: 320 }}
              />
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                {t("common.search")}
              </Button>
              <Button icon={<FilterOutlined />} onClick={() => setFilterOpen(true)}>
                {t("common.filter")}
              </Button>
              <Button icon={<RedoOutlined />} onClick={handleResetAll}>
                {t("orders.buttons.reset")}
              </Button>
            </Space>
          </Flex>
        </Card>
      )}

      {isTabView && (
        <Flex justify="flex-end">
          <Space wrap>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              onPressEnter={handleSearch}
              placeholder={t("orders.search_placeholder")}
              style={{ width: 280 }}
            />
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              {t("common.search")}
            </Button>
            <Button icon={<FilterOutlined />} onClick={() => setFilterOpen(true)}>
              {t("common.filter")}
            </Button>
          </Space>
        </Flex>
      )}

      <Card>
        <Tabs
          activeKey={statusActiveKey}
          onChange={(key) => {
            applyFilters({
              ...form.getFieldsValue(),
              statuses: key === "ALL" ? undefined : [key],
            });
          }}
          items={[
            { key: "ALL", label: t("notifications.all") },
            ...statusOptions.map((item: any) => ({
              key: item.value,
              label: `${item.label} (${item.count})`,
            })),
          ]}
        />

        <Table
          columns={columns}
          dataSource={orderData?.data || []}
          rowKey={(record: any) => record.id || record.code}
          loading={isOrdersLoading}
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

      <Drawer
        title={t("common.filter")}
        open={filterOpen}
        width={560}
        onClose={() => setFilterOpen(false)}
        extra={
          <Space>
            <Button onClick={handleResetAll}>{t("orders.buttons.reset")}</Button>
            <Button
              type="primary"
              onClick={() => {
                handleSearch();
                setFilterOpen(false);
              }}
            >
              {t("orders.buttons.apply")}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item name="query" label={t("orders.search_placeholder")}>
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="note" label={t("orders.filters.note")}>
                <Input allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="timestampFrom" label={t("orders.filters.created_at")}>
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder={t("orders.filters.start_date")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="timestampTo" label=" ">
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder={t("orders.filters.end_date")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="refOrderCode" label={t("orders.filters.ref_order_code")}>
                <Input allowClear placeholder={t("orders.filters.ref_order_code")} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="refCustomerCode" label={t("orders.filters.ref_customer_code")}>
                <Input allowClear placeholder={t("orders.filters.ref_customer_code")} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Button
                type="link"
                icon={isAdvancedFilterOpen ? <UpOutlined /> : <DownOutlined />}
                onClick={toggleAdvancedFilter}
              >
                {isAdvancedFilterOpen
                  ? t("orders.buttons.search_collapse")
                  : t("orders.buttons.search_expand")}
              </Button>
            </Col>

            {isAdvancedFilterOpen && (
              <>
            <Col span={24}>
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
            <Col span={24}>
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
            <Col xs={24} md={12}>
              <Form.Item name="cutOffStatus" label={t("orders.filters.stuck_status")}>
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={statusData?.map((item: any) => ({
                    label: item.name,
                    value: item.code,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
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
            <Col xs={24} md={12}>
              <Form.Item name="handlingTimeFrom" label={t("orders.filters.from")}>
                <Input allowClear placeholder={t("orders.filters.from")} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="handlingTimeTo" label={t("orders.filters.to")}>
                <Input allowClear placeholder={t("orders.filters.to")} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="needPaid" valuePropName="checked" label=" ">
                <Checkbox>{t("orders.filters.financial_payment")}</Checkbox>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
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
            <Col xs={24} md={12}>
              <Form.Item name="milestoneStatusFrom" label={t("orders.filters.start_date")}>
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder={t("orders.filters.start_date")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="milestoneStatusTo" label={t("orders.filters.end_date")}>
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder={t("orders.filters.end_date")}
                />
              </Form.Item>
            </Col>
              </>
            )}
          </Row>
        </Form>
      </Drawer>
    </Space>
  );
};

export default OrdersStyle3;
