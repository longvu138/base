import dayjs from "dayjs";
import {
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
  Space,
  Table,
  Tag,
  Typography,
  theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, SearchOutlined, SyncOutlined } from "@ant-design/icons";
import { quantityFormat } from "@repo/util";
import { useDeliveryRequestsPage } from "./hooks/useDeliveryRequestsPage";

const { Text, Title, Link } = Typography;

const formatDate = (value?: string) =>
  value ? dayjs(value).format("HH:mm DD/MM/YYYY") : "---";

const formatWeight = (value?: number) =>
  Number.isFinite(value) ? `${quantityFormat(value)} kg` : "---";

export const DeliveryRequestsStyle1 = () => {
  const { token } = theme.useToken();
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
    handleExpand,
    navigateToCreateDelivery,
    navigateToOrderDetail,
  } = useDeliveryRequestsPage();

  const statusTag = (status: string) => {
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
      title: t("delivery.volumetric"),
      key: "volumetric",
      align: "right",
      render: (_, record) => record.volumetric ? `${record.volumetric} cm³` : "---",
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
      render: (code) => <Text strong>{code}</Text>,
    },
    {
      title: t("delivery.created_time"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: formatDate,
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
      render: statusTag,
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
      width: "40%",
      align: "left",
      render: (address) => {
        const fullAddress = `${address?.fullName}, ${address?.address}, ${address?.location?.display}`;
        return <div>
          {fullAddress}
        </div>
      }
    },
    {
      title: t("delivery.note"),
      dataIndex: "note",
      key: "note",
      ellipsis: true,
      render: (note) => note || "---",
    },
  ];

  const total = listData?.total || 0;

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card>
        <Form form={form} layout="vertical">
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Flex gap={token.marginMD} align="flex-start" wrap>
              <Text strong style={{ minWidth: 96 }}>
                {t("delivery.status")}:
              </Text>
              <Form.Item name="statuses" noStyle>
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
            </Flex>

            <Row gutter={[24, 16]} align="bottom">
              <Col xs={24} md={8}>
                <Form.Item name="query" label={t("delivery.search_code")}>
                  <Input
                    allowClear
                    prefix={<SearchOutlined />}
                    placeholder={t("delivery.search_code")}
                    onPressEnter={handleSearch}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="createdFrom"
                  label={t("delivery.created_time")}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder={t("delivery.start_date")}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="createdTo" label=" ">
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder={t("delivery.end_date")}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Flex
              justify="flex-end"
              align="center"
              gap={token.marginLG}
              style={{
                width: "100%",
                paddingTop: token.paddingSM,
              }}
            >
              <Button
                type="link"
                icon={<SyncOutlined />}
                onClick={handleReset}
                style={{ paddingInline: 0, color: token.colorTextSecondary }}
              >
                Làm mới bộ lọc
              </Button>
              <Button
                type="primary"
                style={{ minWidth: 240 }}
                onClick={handleSearch}
              >
                {t("order.search")}
              </Button>
            </Flex>
          </Space>
        </Form>
      </Card>

      <Card>
        <Flex
          justify="space-between"
          align="center"
          wrap
          gap={token.marginMD}
          style={{ marginBottom: token.marginMD }}
        >
          <Space size="small" align="center">
            <Title level={4} style={{ margin: 0 }}>
              {t("delivery.list_title")}
            </Title>
            <Tag color="blue">{quantityFormat(total)}</Tag>
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={navigateToCreateDelivery}
          >
            {t("delivery.create_title")}
          </Button>
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
          locale={{ emptyText: <Empty description={t("message.empty")} /> }}
          scroll={{ x: 960 }}
        />

        <Flex justify="center" style={{ marginTop: token.marginLG }}>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
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

export default DeliveryRequestsStyle1;
