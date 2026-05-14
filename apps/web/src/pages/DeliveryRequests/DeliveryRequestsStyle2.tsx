import dayjs from "dayjs";
import { useState } from "react";
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
  PlusOutlined,
  RedoOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { quantityFormat } from "@repo/util";
import { useDeliveryRequestsPage } from "./hooks/useDeliveryRequestsPage";

const { Text, Title, Link } = Typography;

const formatDate = (value?: string) =>
  value ? dayjs(value).format("HH:mm DD/MM/YYYY") : "---";

const formatWeight = (value?: number) =>
  Number.isFinite(value) ? `${quantityFormat(value)} kg` : "---";

export const DeliveryRequestsStyle2 = () => {
  const { token } = theme.useToken();
  const [filterOpen, setFilterOpen] = useState(false);
  const {
    t,
    form,
    page,
    pageSize,
    setPage,
    setPageSize,
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

  const renderStatus = (status: string) => {
    const found = statusData?.find((item: any) => item.code === status);
    return <Tag color={found?.color || "default"}>{found?.name || status}</Tag>;
  };

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
        <Space direction="vertical" size={0}>
          <Text strong>{code}</Text>
          <Text type="secondary">{formatDate(record.createdAt)}</Text>
        </Space>
      ),
    },
    {
      title: t("delivery.status"),
      dataIndex: "status",
      key: "status",
      render: renderStatus,
    },
    {
      title: t("delivery.shipping_method"),
      dataIndex: "shippingMethod",
      key: "shippingMethod",
      render: (method) => method?.name || method?.code || "---",
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
      title: t("delivery.weight"),
      dataIndex: "totalWeight",
      key: "totalWeight",
      align: "right",
      render: formatWeight,
    },
  ];

  const total = listData?.total || 0;

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card>
        <Flex justify="space-between" align="center" wrap gap={token.marginMD}>
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
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
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
              type="primary"
              icon={<PlusOutlined />}
              onClick={navigateToCreateDelivery}
            >
              {t("delivery.create_title")}
            </Button>
          </Space>
        </Flex>
      </Card>

      <Card>
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
                locale={{ emptyText: <Empty description={t("message.empty")} /> }}
              />
            ),
          }}
          locale={{ emptyText: <Empty description={t("message.empty")} /> }}
          scroll={{ x: 960 }}
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
        extra={
          <Space>
            <Button icon={<RedoOutlined />} onClick={handleReset}>
              {t("order.filter_refresh")}
            </Button>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => {
                handleSearch();
                setFilterOpen(false);
              }}
            >
              {t("order.search")}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div>
              <Text strong>{t("delivery.status")}</Text>
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
                <Form.Item name="query" label={t("delivery.search_code")}>
                  <Input allowClear prefix={<SearchOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item name="createdFrom" label={t("delivery.start_date")}>
                  <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item name="createdTo" label={t("delivery.end_date")}>
                  <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
            </Row>
          </Space>
        </Form>
      </Drawer>
    </Space>
  );
};

export default DeliveryRequestsStyle2;
