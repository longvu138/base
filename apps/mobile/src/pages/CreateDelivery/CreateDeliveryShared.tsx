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
  List,
  Row,
  Select,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Typography,
  notification,
  theme,
} from "antd";
import { CheckCircleOutlined, TruckOutlined } from "@ant-design/icons";
import { moneyFormat, quantityFormat } from "@repo/util";
import { useCreateDeliveryPage } from "@repo/hooks";

type CreateDeliveryPageState = ReturnType<typeof useCreateDeliveryPage>;

const getStatusName = (statuses: any[] = [], code?: string) =>
  statuses.find((item) => item.code === code)?.name || code || "---";

const getPackageWeight = (item: any) =>
  item.actualWeight ?? item.weight ?? item.dimensionalWeight;

const formatDate = (value?: string) =>
  value ? dayjs(value).format("HH:mm DD/MM/YYYY") : "---";

const AvailableOrderSkeleton = () => (
  <Card>
    <Skeleton active paragraph={{ rows: 4 }} />
  </Card>
);

const PackageCard = ({
  item,
  order,
  page,
}: {
  item: any;
  order: any;
  page: CreateDeliveryPageState;
}) => {
  const { token } = theme.useToken();
  const weight = getPackageWeight(item);
  const statuses = order.isShipment ? page.parcelStatuses : page.packageStatuses;

  return (
    <Card size="small" styles={{ body: { padding: token.paddingSM } }}>
      <Flex vertical gap={token.marginSM}>
        <Flex justify="space-between" align="flex-start" gap={token.marginSM}>
          <Space align="start" style={{ minWidth: 0, flex: 1 }}>
            <Checkbox
              checked={page.selectedCodeSet.has(item.code)}
              onChange={(event) => page.togglePackage(item.code, event.target.checked)}
            />
            <Space direction="vertical" size={0} style={{ minWidth: 0 }}>
              <Typography.Text strong ellipsis>
                {item.code}
              </Typography.Text>
              <Typography.Text type="secondary">
                {formatDate(item.createdAt)}
              </Typography.Text>
            </Space>
          </Space>
          <Tag style={{ marginInlineEnd: 0 }}>
            {getStatusName(statuses, item.status)}
          </Tag>
        </Flex>

        <Row gutter={[12, 8]}>
          <Col span={12}>
            <Typography.Text type="secondary">{page.t("delivery.weight")}</Typography.Text>
            <div>
              {Number.isFinite(Number(weight))
                ? `${quantityFormat(weight)} kg`
                : page.t("delivery.undefined")}
            </div>
          </Col>
          <Col span={12}>
            <Typography.Text type="secondary">{page.t("delivery.unpaid_amount")}</Typography.Text>
            <div>{item.shippingFee || item.shippingFee === 0 ? moneyFormat(item.shippingFee || 0) : "---"}</div>
          </Col>
        </Row>
      </Flex>
    </Card>
  );
};

const OrderCard = ({
  order,
  page,
}: {
  order: any;
  page: CreateDeliveryPageState;
}) => {
  const { token } = theme.useToken();
  const packages = page.getOrderPackages(order);
  const weight = packages.reduce(
    (total: number, item: any) => total + Number(getPackageWeight(item) || 0),
    0,
  );
  const address = order.address
    ? [order.address.fullName, order.address.phone, order.address.location?.display]
        .filter(Boolean)
        .join(", ")
    : "---";

  return (
    <Card styles={{ body: { padding: token.paddingMD } }}>
      <Flex vertical gap={token.marginMD}>
        <Flex justify="space-between" align="flex-start" gap={token.marginSM}>
          <Space align="start" style={{ minWidth: 0, flex: 1 }}>
            <Checkbox
              indeterminate={page.isOrderIndeterminate(order)}
              checked={page.isOrderChecked(order)}
              onChange={(event) => page.toggleOrder(order, event.target.checked)}
            />
            <Space direction="vertical" size={0} style={{ minWidth: 0 }}>
              <Typography.Link
                href={order.isShipment ? `/shipments/${order.code}` : `/orders/${order.code}`}
                ellipsis
                strong
              >
                {order.code}
              </Typography.Link>
              <Typography.Text type="secondary" ellipsis>
                {address}
              </Typography.Text>
            </Space>
          </Space>
          {order.isShipment && (
            <Tag color="blue" style={{ marginInlineEnd: 0 }}>
              {page.t("shipments.title")}
            </Tag>
          )}
        </Flex>

        <Row gutter={[12, 8]}>
          <Col span={12}>
            <Typography.Text type="secondary">{page.t("delivery.total_packages")}</Typography.Text>
            <div>{quantityFormat(order.availablePackageCount || packages.length)}</div>
          </Col>
          <Col span={12}>
            <Typography.Text type="secondary">{page.t("delivery.total_weight_packages")}</Typography.Text>
            <div>{quantityFormat(weight)} kg</div>
          </Col>
          <Col span={12}>
            <Typography.Text type="secondary">{page.t("delivery.order_amount")}</Typography.Text>
            <div>{moneyFormat(order.grandTotal || 0)}</div>
          </Col>
          <Col span={12}>
            <Typography.Text type="secondary">{page.t("delivery.unpaid_amount")}</Typography.Text>
            <div>{moneyFormat(order.isShipment ? order.needToPaid || 0 : order.totalUnpaid || 0)}</div>
          </Col>
        </Row>

        <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
          {packages.map((item: any) => (
            <PackageCard key={item.code} item={item} order={order} page={page} />
          ))}
        </Space>
      </Flex>
    </Card>
  );
};

export const CreateDeliveryMobileView = () => {
  const { token } = theme.useToken();
  const page = useCreateDeliveryPage();

  const onSubmit = async () => {
    try {
      await page.handleSubmit();
    } catch (error: any) {
      notification.error({
        message: error?.message || page.t("createDelivery.errorCantCreateDelivery"),
      });
    }
  };

  return (
    <Space direction="vertical" size={token.marginMD} style={{ width: "100%" }}>
      <Flex align="center" justify="space-between" wrap gap={token.marginSM}>
        <Space direction="vertical" size={0}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {page.t("delivery.create_title")}
          </Typography.Title>
          <Typography.Text type="secondary">
            {page.t("delivery.available_order")} ({page.availableOrders.length})
          </Typography.Text>
        </Space>
        <Tag icon={<TruckOutlined />} color="processing">
          {page.t("delivery.btn_create")}
        </Tag>
      </Flex>

      <Card>
        <Flex justify="space-between" align="center" wrap gap={token.marginSM}>
          <Checkbox
            indeterminate={page.isAllIndeterminate}
            checked={page.isAllChecked}
            onChange={(event) => page.toggleAll(event.target.checked)}
          >
            {page.t("delivery.select_all")}
          </Checkbox>
          <Typography.Text type="secondary">
            {page.allPackages.length} {page.t("delivery.total_packages").toLowerCase()}
          </Typography.Text>
        </Flex>
      </Card>

      {page.isAvailableOrdersLoading ? (
        <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <AvailableOrderSkeleton key={index} />
          ))}
        </Space>
      ) : (
        <List
          dataSource={page.availableOrders}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={page.t("delivery.empty_available_order")}
              />
            ),
          }}
          renderItem={(order) => (
            <List.Item style={{ padding: 0, borderBlockEnd: 0 }}>
              <OrderCard order={order} page={page} />
            </List.Item>
          )}
          style={{ display: "flex", flexDirection: "column", gap: token.marginSM }}
        />
      )}

      {page.availableOrders.length > 0 && (
        <Card>
          <Form form={page.form} layout="vertical">
            <Form.Item name="note" label={page.t("delivery.note")}>
              <Input.TextArea rows={4} placeholder={page.t("delivery.notePlaceholder")} />
            </Form.Item>
            <Form.Item name="shippingMethodCode" label={page.t("delivery.shipping_method")}>
              <Select
                allowClear
                placeholder={page.t("delivery.shipping_method")}
                options={page.shippingMethods.map((item: any) => ({
                  label: item.name,
                  value: item.code,
                }))}
              />
            </Form.Item>
            <Alert
              type="info"
              showIcon
              message={page.t("delivery.warning_create")}
              description={page.t("delivery.btn_create")}
            />
          </Form>

          <Space direction="vertical" size={token.marginMD} style={{ width: "100%", marginTop: token.marginLG }}>
            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Statistic
                  title={page.t("delivery.total_weight_packages")}
                  value={page.totalWeight}
                  suffix="kg"
                  precision={2}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={
                    page.totalAmount > 0
                      ? page.t("delivery.total_unpaid_amount")
                      : page.t("delivery.total_refund_amount")
                  }
                  value={Math.abs(page.totalAmount)}
                  formatter={(value) => moneyFormat(Number(value || 0))}
                />
              </Col>
            </Row>
            <Button
              type="primary"
              size="large"
              block
              icon={<CheckCircleOutlined />}
              loading={page.createDelivery.isPending}
              onClick={onSubmit}
            >
              {page.t("delivery.btn_create")}
            </Button>
          </Space>
        </Card>
      )}
    </Space>
  );
};
