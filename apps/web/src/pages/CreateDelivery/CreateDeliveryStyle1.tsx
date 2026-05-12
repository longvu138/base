import dayjs from "dayjs";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Empty,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  notification,
  theme,
} from "antd";
import { CheckCircleOutlined, TruckOutlined } from "@ant-design/icons";
import { moneyFormat, quantityFormat } from "@repo/util";
import { useCreateDeliveryPage } from "./hooks/useCreateDeliveryPage";

const getStatusName = (statuses: any[] = [], code?: string) =>
  statuses.find((item) => item.code === code)?.name || code || "---";

export const CreateDeliveryStyle1 = () => {
  const { token } = theme.useToken();
  const {
    t,
    form,
    availableOrders,
    packageStatuses,
    parcelStatuses,
    shippingMethods,
    isAvailableOrdersLoading,
    createDelivery,
    selectedCodeSet,
    expandedRowKeys,
    setExpandedRowKeys,
    isAllChecked,
    isAllIndeterminate,
    totalAmount,
    totalWeight,
    allPackages,
    getOrderPackages,
    isOrderChecked,
    isOrderIndeterminate,
    togglePackage,
    toggleOrder,
    toggleAll,
    handleSubmit,
  } = useCreateDeliveryPage();

  const packageColumns = (order: any) => [
    {
      title: t("delivery.package_code"),
      dataIndex: "code",
      key: "code",
      render: (code: string, record: any) => (
        <Space>
          <Checkbox
            checked={selectedCodeSet.has(code)}
            onChange={(event) => togglePackage(code, event.target.checked)}
          />
          <Typography.Text strong>{code}</Typography.Text>
          {record.isShipment && <Tag>{t("shipments.title")}</Tag>}
        </Space>
      ),
    },
    {
      title: t("delivery.created_at"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) =>
        value ? dayjs(value).format("HH:mm DD/MM/YYYY") : "---",
    },
    {
      title: t("delivery.volumetric"),
      dataIndex: "volumetric",
      key: "volumetric",
      render: (value: number) =>
        value ? `${quantityFormat(value)} cm3` : t("delivery.undefined"),
    },
    {
      title: t("delivery.weight"),
      dataIndex: "actualWeight",
      key: "actualWeight",
      render: (_: number, record: any) => {
        const weight = record.actualWeight ?? record.weight ?? record.dimensionalWeight;
        return Number.isFinite(Number(weight))
          ? `${quantityFormat(weight)} kg`
          : t("delivery.undefined");
      },
    },
    {
      title: t("delivery.unpaid_amount"),
      dataIndex: "shippingFee",
      key: "shippingFee",
      render: (value: number) =>
        value || value === 0 ? moneyFormat(value || 0) : "---",
    },
    {
      title: t("delivery.status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag>
          {getStatusName(order.isShipment ? parcelStatuses : packageStatuses, status)}
        </Tag>
      ),
    },
  ];

  const columns = [
    {
      title: t("delivery.order"),
      dataIndex: "code",
      key: "code",
      render: (code: string, record: any) => (
        <Space>
          <Checkbox
            indeterminate={isOrderIndeterminate(record)}
            checked={isOrderChecked(record)}
            onChange={(event) => toggleOrder(record, event.target.checked)}
          />
          <Typography.Link href={record.isShipment ? `/shipments/${code}` : `/orders/${code}`}>
            {code}
          </Typography.Link>
          {record.isShipment && <Tag color="blue">{t("shipments.title")}</Tag>}
        </Space>
      ),
    },
    {
      title: t("delivery.total_packages"),
      dataIndex: "availablePackageCount",
      key: "availablePackageCount",
      render: (_: number, record: any) =>
        quantityFormat(record.availablePackageCount || getOrderPackages(record).length),
    },
    {
      title: t("delivery.total_weight_packages"),
      key: "weight",
      render: (_: unknown, record: any) => {
        const weight = getOrderPackages(record).reduce(
          (total: number, item: any) =>
            total + Number(item.actualWeight ?? item.weight ?? item.dimensionalWeight ?? 0),
          0,
        );
        return `${quantityFormat(weight)} kg`;
      },
    },
    {
      title: t("delivery.order_amount"),
      dataIndex: "grandTotal",
      key: "grandTotal",
      render: (value: number) => moneyFormat(value || 0),
    },
    {
      title: t("delivery.paid_amount"),
      dataIndex: "totalPaid",
      key: "totalPaid",
      render: (value: number) => moneyFormat(value || 0),
    },
    {
      title: t("delivery.total_refund"),
      dataIndex: "totalRefund",
      key: "totalRefund",
      render: (value: number) => moneyFormat(value || 0),
    },
    {
      title: t("delivery.unpaid_amount"),
      dataIndex: "totalUnpaid",
      key: "totalUnpaid",
      render: (value: number, record: any) =>
        moneyFormat(record.isShipment ? record.needToPaid || 0 : value || 0),
    },
    {
      title: t("delivery.address"),
      dataIndex: "address",
      key: "address",
      render: (address: any) =>
        address
          ? [address.fullName, address.phone, address.location?.display]
              .filter(Boolean)
              .join(", ")
          : "---",
    },
  ];

  const onSubmit = async () => {
    try {
      await handleSubmit();
    } catch (error: any) {
      notification.error({ message: error?.message || t("createDelivery.errorCantCreateDelivery") });
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Flex align="center" justify="space-between" wrap gap={token.marginSM}>
        <Space direction="vertical" size={0}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {t("delivery.create_title")}
          </Typography.Title>
          <Typography.Text type="secondary">
            {t("delivery.available_order")} ({availableOrders.length})
          </Typography.Text>
        </Space>
        <Tag icon={<TruckOutlined />} color="processing">
          {t("delivery.btn_create")}
        </Tag>
      </Flex>

      <Card
        title={
          <Space>
            <Checkbox
              indeterminate={isAllIndeterminate}
              checked={isAllChecked}
              onChange={(event) => toggleAll(event.target.checked)}
            >
              {t("delivery.select_all")}
            </Checkbox>
            <Typography.Text type="secondary">
              {allPackages.length} {t("delivery.total_packages").toLowerCase()}
            </Typography.Text>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={availableOrders}
          loading={isAvailableOrdersLoading}
          rowKey="code"
          pagination={false}
          expandable={{
            expandedRowKeys,
            onExpandedRowsChange: (keys) => setExpandedRowKeys([...keys]),
            expandedRowRender: (record) => (
              <Table
                columns={packageColumns(record)}
                dataSource={getOrderPackages(record)}
                rowKey="code"
                pagination={false}
                size="small"
              />
            ),
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("delivery.empty_available_order")}
              />
            ),
          }}
        />
      </Card>

      {availableOrders.length > 0 && (
        <Card>
          <Form form={form} layout="vertical">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={16}>
                <Form.Item name="note" label={t("delivery.note")}>
                  <Input.TextArea
                    rows={4}
                    placeholder={t("delivery.notePlaceholder")}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="shippingMethodCode" label={t("delivery.shipping_method")}>
                  <Select
                    allowClear
                    placeholder={t("delivery.shipping_method")}
                    options={shippingMethods.map((item: any) => ({
                      label: item.name,
                      value: item.code,
                    }))}
                  />
                </Form.Item>
                <Alert
                  type="info"
                  showIcon
                  message={t("delivery.warning_create")}
                  description={t("delivery.btn_create")}
                />
              </Col>
            </Row>
          </Form>

          <Flex
            justify="space-between"
            align="center"
            wrap
            gap={token.marginLG}
            style={{ marginTop: token.marginLG }}
          >
            <Space size="large" wrap>
              <Statistic
                title={t("delivery.total_weight_packages")}
                value={totalWeight}
                suffix="kg"
                precision={2}
              />
              <Statistic
                title={
                  totalAmount > 0
                    ? t("delivery.total_unpaid_amount")
                    : t("delivery.total_refund_amount")
                }
                value={Math.abs(totalAmount)}
                formatter={(value) => moneyFormat(Number(value || 0))}
              />
            </Space>
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              loading={createDelivery.isPending}
              onClick={onSubmit}
            >
              {t("delivery.btn_create")}
            </Button>
          </Flex>
        </Card>
      )}
    </Space>
  );
};

export default CreateDeliveryStyle1;
