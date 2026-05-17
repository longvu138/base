import dayjs from "dayjs";
import React, { useState } from "react";
import {
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
  Space,
  Table,
  Tag,
  Typography,
  theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  FilterOutlined,
  InboxOutlined,
  PlusOutlined,
  SearchOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { quantityFormat } from "@repo/util";
import { FilterPanel } from "@repo/ui";
import { useDeliveryRequestsPage } from "./hooks/useDeliveryRequestsPage";

const { Text, Title, Link } = Typography;

const resolveStatus = (statuses: any[] = [], code?: string) =>
  statuses.find((item) => item.code === code) || { name: code || "---" };

const formatDate = (value?: string) =>
  value ? dayjs(value).format("HH:mm DD/MM/YYYY") : "---";

const formatWeight = (value?: number) =>
  Number.isFinite(value) ? `${quantityFormat(value)} kg` : "---";

export const DeliveryRequestsStyleGobiz: React.FC<{ isTabView?: boolean }> = ({
  isTabView,
}) => {
  const { token } = theme.useToken();
  const [filterOpen, setFilterOpen] = useState(false);
  const {
    t,
    form,
    page,
    pageSize,
    setPage,
    setPageSize,
    filters,
    expandedCode,
    listData,
    statusData,
    deliveryPackages,
    isDeliveryRequestsLoading,
    isDeliveryPackagesLoading,
    handleSearch,
    handleReset,
    syncFiltersToForm,
    handleExpand,
    navigateToCreateDelivery,
    navigateToOrderDetail,
  } = useDeliveryRequestsPage();

  const watchedStatuses = Form.useWatch("statuses", form);
  const filterStatuses = filters.statuses;
  const statusValue = watchedStatuses ?? filterStatuses;
  const selectedStatuses = Array.isArray(statusValue)
    ? statusValue
    : statusValue
      ? [statusValue]
      : [];

  const packageColumns: ColumnsType<any> = [
    {
      title: t("delivery.package_code"),
      dataIndex: "code",
      key: "code",
      render: (code) => <Text strong>{code}</Text>,
    },
    {
      title: t("delivery.order"),
      dataIndex: "orderCode",
      key: "orderCode",
      render: (code, record) =>
        code ? (
          <Link onClick={() => navigateToOrderDetail(code, record.isShipment)}>
            {code}
          </Link>
        ) : (
          "---"
        ),
    },
    {
      title: t("delivery.created_at"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: formatDate,
    },
    {
      title: t("delivery.volumetric"),
      dataIndex: "volumetric",
      key: "volumetric",
      render: (value) => (value ? `${quantityFormat(value)} cm3` : "---"),
    },
    {
      title: t("delivery.weight"),
      key: "weight",
      align: "right",
      render: (_, record) => formatWeight(record.actualWeight),
    },
  ];

  const columns: ColumnsType<any> = [
    {
      title: t("delivery.delivery_code"),
      dataIndex: "code",
      key: "code",
      render: (code, record) => (
        <Space>
          <Flex
            align="center"
            justify="center"
            style={{
              width: 36,
              height: 36,
              borderRadius: token.borderRadiusLG,
              background: token.colorPrimaryBg,
              color: token.colorPrimary,
            }}
          >
            <InboxOutlined />
          </Flex>
          <Space direction="vertical" size={0}>
            <Text strong>{code}</Text>
            <Text type="secondary">{formatDate(record.createdAt)}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: t("delivery.shipping_method"),
      dataIndex: "shippingMethod",
      key: "shippingMethod",
      render: (method) => method?.name || method?.code || "---",
    },
    {
      title: t("delivery.status"),
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const meta = resolveStatus(statusData, status);
        return <Tag color={meta.color || "default"}>{meta.name}</Tag>;
      },
    },
    {
      title: t("delivery.weight"),
      dataIndex: "totalWeight",
      key: "totalWeight",
      align: "right",
      render: formatWeight,
    },
    {
      title: t("delivery.address"),
      dataIndex: "address",
      key: "address",
      ellipsis: true,
      render: (address) =>
        address
          ? [address.fullName, address.address, address.location?.display]
              .filter(Boolean)
              .join(", ")
          : "---",
    },
    {
      title: t("delivery.note"),
      dataIndex: "note",
      key: "note",
      ellipsis: true,
      render: (note) => <Text type="secondary">{note || "---"}</Text>,
    },
  ];

  const total = listData?.total || 0;

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {!isTabView && (
        <Card>
          <Flex justify="space-between" align="center" gap={token.marginMD} wrap>
            <Space size="small" align="center">
              <Title level={3} style={{ margin: 0 }}>
                {t("delivery.list_title")}
              </Title>
              <Tag color="blue">{quantityFormat(total)}</Tag>
            </Space>
            <Space wrap>
              <Form form={form} component={false}>
                <Form.Item name="query" noStyle>
                  <Input
                    allowClear
                    prefix={<SearchOutlined />}
                    placeholder={t("delivery.search_code")}
                    style={{ width: 320 }}
                    onPressEnter={handleSearch}
                  />
                </Form.Item>
              </Form>
              <Button
                type="primary"
                onClick={handleSearch}
                style={{ minWidth: 200 }}
              >
                {t("order.search")}
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
              <Button
                type="link"
                icon={<SyncOutlined />}
                onClick={handleReset}
                style={{ paddingInline: 0, color: token.colorTextSecondary }}
              >
                {t("order.filter_refresh")}
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={navigateToCreateDelivery}
              >
                {t("delivery.create_title")}
              </Button>
            </Space>
          </Flex>
        </Card>
      )}

      {isTabView && (
        <Flex justify="flex-end">
          <Space wrap>
            <Form form={form} component={false}>
              <Form.Item name="query" noStyle>
                <Input
                  allowClear
                  prefix={<SearchOutlined />}
                  placeholder={t("delivery.search_code")}
                  style={{ width: 280 }}
                  onPressEnter={handleSearch}
                />
              </Form.Item>
            </Form>
            <Button
              type="primary"
              onClick={handleSearch}
              style={{ minWidth: 160 }}
            >
              {t("order.search")}
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
        <Flex
          justify="space-between"
          align="center"
          gap={token.marginMD}
          wrap
          style={{ marginBottom: token.marginMD }}
        >
          <Space size="small" align="center">
            <Title level={4} style={{ margin: 0 }}>
              {t("delivery.list_title")}
            </Title>
            <Tag color="blue">{quantityFormat(total)}</Tag>
          </Space>
          {isTabView && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={navigateToCreateDelivery}
            >
              {t("delivery.create_title")}
            </Button>
          )}
        </Flex>

        <Table
          columns={columns}
          dataSource={listData?.data || []}
          rowKey={(record) => record.code}
          loading={isDeliveryRequestsLoading}
          pagination={false}
          expandable={{
            expandedRowKeys: expandedCode ? [expandedCode] : [],
            onExpand: handleExpand,
            expandedRowRender: () => (
              <Table
                columns={packageColumns}
                dataSource={deliveryPackages}
                rowKey={(record) => record.id || record.code}
                loading={isDeliveryPackagesLoading}
                pagination={false}
                size="small"
                locale={{
                  emptyText: <Empty description={t("message.empty")} />,
                }}
              />
            ),
          }}
          locale={{
            emptyText: <Empty description={t("message.empty")} />,
          }}
          scroll={{ x: 1100 }}
        />

        <Flex justify="center" style={{ marginTop: token.marginLG }}>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
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
        width={960}
        onClose={() => setFilterOpen(false)}
      >
        <FilterPanel
          form={form}
          onSearch={() => {
            handleSearch();
            setFilterOpen(false);
          }}
          onReset={handleReset}
          searchText={t("order.search")}
          resetText="Làm mới bộ lọc"
          primaryContent={
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Space direction="vertical" size={0}>
                  <Text strong>{t("delivery.status")}</Text>
                  <Text type="secondary">Đã chọn {selectedStatuses.length}</Text>
                </Space>
                <Form.Item
                  name="statuses"
                  style={{
                    marginTop: token.marginSM,
                    marginBottom: 0,
                    padding: token.paddingSM,
                    borderRadius: token.borderRadiusLG,
                    background: token.colorFillQuaternary,
                  }}
                >
                  <Checkbox.Group>
                    <Space size={[token.marginLG, token.marginXS]} wrap>
                      {statusData?.map((item: any) => (
                        <Checkbox key={item.code} value={item.code}>
                          {item.name}
                        </Checkbox>
                      ))}
                    </Space>
                  </Checkbox.Group>
                </Form.Item>
              </div>

              <Row gutter={[16, 0]}>
                <Col xs={24} lg={8}>
                  <Form.Item name="query" label={t("delivery.search_code")} style={{ marginBottom: 0 }}>
                    <Input
                      allowClear
                      prefix={<SearchOutlined />}
                      placeholder={t("delivery.search_code")}
                      onPressEnter={handleSearch}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={8}>
                  <Form.Item name="createdFrom" label={t("delivery.start_date")} style={{ marginBottom: 0 }}>
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={8}>
                  <Form.Item name="createdTo" label={t("delivery.end_date")} style={{ marginBottom: 0 }}>
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Space>
          }
        />
      </Drawer>
    </Space>
  );
};

export default DeliveryRequestsStyleGobiz;
