import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
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
  FilterOutlined,
  RedoOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { formatCurrency } from "@repo/util";
import { FilterPanel } from "@repo/ui";
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
    syncFiltersToForm,
    applyFilters,
    navigateToDetail,
    navigateToCreateDelivery,
    deliveryReadyCount,
  } = useOrdersPage();

  const [searchText, setSearchText] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    setSearchText(typeof filters.query === "string" ? filters.query : "");
  }, [filters.query]);

  const handleHeaderSearch = () => {
    form.setFieldValue("query", searchText);
    applyFilters({ ...form.getFieldsValue(true), query: searchText });
  };

  const handleFilterSearch = () => {
    const values = form.getFieldsValue(true);
    setSearchText(typeof values.query === "string" ? values.query : "");
    applyFilters(values);
  };

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
                onPressEnter={handleHeaderSearch}
                placeholder={t("orders.search_placeholder")}
                style={{ width: 320 }}
              />
              <Button type="primary" icon={<SearchOutlined />} onClick={handleHeaderSearch}>
                {t("common.search")}
              </Button>
              <Button
                icon={<FilterOutlined />}
                onClick={() => {
                  syncFiltersToForm();
                  setFilterOpen(true);
                }}
              >
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
              onPressEnter={handleHeaderSearch}
              placeholder={t("orders.search_placeholder")}
              style={{ width: 280 }}
            />
            <Button type="primary" icon={<SearchOutlined />} onClick={handleHeaderSearch}>
              {t("common.search")}
            </Button>
            <Button
              icon={<FilterOutlined />}
              onClick={() => {
                syncFiltersToForm();
                setFilterOpen(true);
              }}
            >
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
              ...form.getFieldsValue(true),
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
      >
        <FilterPanel
          form={form}
          onSearch={() => {
            handleFilterSearch();
            setFilterOpen(false);
          }}
          onReset={handleResetAll}
          searchText={t("orders.buttons.apply")}
          resetText={t("orders.buttons.reset")}
          showCollapseAll={true}
          primaryContent={
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item name="query" label={t("orders.search_placeholder")} style={{ marginBottom: 0 }}>
                  <Input allowClear onPressEnter={() => {
                    handleFilterSearch();
                    setFilterOpen(false);
                  }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="note" label={t("orders.filters.note")} style={{ marginBottom: 0 }}>
                  <Input allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="timestampFrom" label={t("orders.filters.created_at")} style={{ marginBottom: 0 }}>
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder={t("orders.filters.start_date")}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="timestampTo" label=" " style={{ marginBottom: 0 }}>
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder={t("orders.filters.end_date")}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="refOrderCode" label={t("orders.filters.ref_order_code")} style={{ marginBottom: 0 }}>
                  <Input allowClear placeholder={t("orders.filters.ref_order_code")} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="refCustomerCode" label={t("orders.filters.ref_customer_code")} style={{ marginBottom: 0 }}>
                  <Input allowClear placeholder={t("orders.filters.ref_customer_code")} />
                </Form.Item>
              </Col>
            </Row>
          }
          secondaryContent={
            <div style={{ marginTop: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Form.Item name="marketplaces" label={t("orders.filters.source")} style={{ marginBottom: 0 }}>
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
                  <Form.Item name="services" label={t("orders.filters.services")} style={{ marginBottom: 0 }}>
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
                  <Form.Item name="cutOffStatus" label={t("orders.filters.stuck_status")} style={{ marginBottom: 0 }}>
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
                  <Form.Item name="typeSearch" label={t("orders.filters.period")} style={{ marginBottom: 0 }}>
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
                  <Form.Item name="handlingTimeFrom" label={t("orders.filters.from")} style={{ marginBottom: 0 }}>
                    <Input allowClear placeholder={t("orders.filters.from")} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="handlingTimeTo" label={t("orders.filters.to")} style={{ marginBottom: 0 }}>
                    <Input allowClear placeholder={t("orders.filters.to")} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="needPaid" valuePropName="checked" label=" " style={{ marginBottom: 0 }}>
                    <Checkbox>{t("orders.filters.financial_payment")}</Checkbox>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="milestoneStatus" label={t("orders.filters.time_range")} style={{ marginBottom: 0 }}>
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
                  <Form.Item name="milestoneStatusFrom" label={t("orders.filters.start_date")} style={{ marginBottom: 0 }}>
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      placeholder={t("orders.filters.start_date")}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="milestoneStatusTo" label={t("orders.filters.end_date")} style={{ marginBottom: 0 }}>
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
      </Drawer>
    </Space>
  );
};

export default OrdersStyle3;
