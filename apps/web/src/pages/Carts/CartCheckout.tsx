import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Image,
  List,
  Radio,
  Row,
  Space,
  Spin,
  Typography,
  theme,
} from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import {
  useAddressesQuery,
  useCreateCustomerOrderMutation,
  useDraftOrderQuery,
  useUpdateDraftOrderMutation,
} from "@repo/hooks";
import { formatCurrency } from "@repo/util";
import { useNavigate, useParams } from "react-router-dom";

const getSkus = (merchant: any) =>
  Array.isArray(merchant?.products)
    ? merchant.products.flatMap((product: any) =>
        Array.isArray(product?.skus)
          ? product.skus.map((sku: any) => ({ ...sku, product }))
          : [],
      )
    : Array.isArray(merchant?.skus)
      ? merchant.skus
      : [];

const getAddressText = (address: any) =>
  [
    address?.fullname || address?.fullName || address?.contactName,
    address?.phone || address?.contactPhone,
    address?.detail || address?.address,
    address?.location?.display,
  ]
    .filter(Boolean)
    .join(", ");

export const CartCheckout = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { draftOrderId } = useParams();
  const { data: draftOrder, isLoading } = useDraftOrderQuery(draftOrderId);
  const { data: addresses } = useAddressesQuery({ page: 0, size: 1000 });
  const updateDraftOrder = useUpdateDraftOrderMutation(draftOrderId);
  const createOrder = useCreateCustomerOrderMutation();
  const merchants = Array.isArray(draftOrder?.merchants)
    ? draftOrder.merchants
    : [];
  const selectedAddressId = draftOrder?.address?.id || draftOrder?.address;

  if (isLoading) return <Spin />;
  if (!draftOrder) return <Empty description="Không tìm thấy đơn nháp" />;

  return (
    <div style={{ paddingBottom: token.paddingLG }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: token.marginLG }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Xác nhận đơn hàng
        </Typography.Title>
        <Button onClick={() => navigate("/carts")}>Quay lại giỏ hàng</Button>
      </Flex>

      <Row gutter={token.marginLG} align="top">
        <Col xs={24} xl={17}>
          <Space direction="vertical" size={token.marginMD} style={{ width: "100%" }}>
            {merchants.map((merchant: any) => {
              const skus = getSkus(merchant);
              const totalQuantity = skus.reduce(
                (sum: number, sku: any) => sum + Number(sku.quantity || 0),
                0,
              );
              return (
                <Card
                  key={merchant.id}
                  title={
                    <Flex justify="space-between" gap={token.marginSM} wrap>
                      <Space>
                        {merchant?.marketplace?.image ? (
                          <Avatar shape="square" src={merchant.marketplace.image} />
                        ) : null}
                        <Typography.Text strong>
                          {merchant.name || merchant.code || "Shop"}
                        </Typography.Text>
                      </Space>
                      <Typography.Text type="secondary">
                        Tổng: {formatCurrency(merchant.exchangedTotalValue || 0)}
                      </Typography.Text>
                    </Flex>
                  }
                >
                  <Typography.Text type="secondary">
                    Số lượng: {totalQuantity} sản phẩm / {skus.length} link
                  </Typography.Text>
                  <List
                    dataSource={skus}
                    renderItem={(sku: any) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            sku.image ? (
                              <Image width={56} height={56} src={sku.image} preview />
                            ) : (
                              <Avatar shape="square" size={56} icon={<ShoppingCartOutlined />} />
                            )
                          }
                          title={sku?.product?.name || sku?.name || "Sản phẩm"}
                          description={
                            <Space direction="vertical" size={0}>
                              <Typography.Text type="secondary">
                                {Array.isArray(sku.variantProperties)
                                  ? sku.variantProperties
                                      .map((item: any) => item.value || item.originalValue)
                                      .join(" / ")
                                  : "---"}
                              </Typography.Text>
                              <Typography.Text>
                                {formatCurrency(sku.exchangedTotalAmount || 0)} / SL:{" "}
                                {sku.quantity}
                              </Typography.Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              );
            })}
          </Space>
        </Col>

        <Col xs={24} xl={7}>
          <Space direction="vertical" size={token.marginMD} style={{ width: "100%" }}>
            <Card title="Địa chỉ giao hàng">
              <Radio.Group
                value={selectedAddressId}
                onChange={(event) =>
                  updateDraftOrder.mutate({ address: event.target.value })
                }
              >
                <Space direction="vertical" size={token.marginSM}>
                  {(addresses?.data || []).map((address: any) => (
                    <Radio key={address.id} value={address.id}>
                      <Typography.Text>{getAddressText(address)}</Typography.Text>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </Card>

            <Card
              title="Thanh toán"
              style={{
                borderColor: token.colorPrimaryBorder,
                background: token.colorPrimaryBg,
              }}
            >
              <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
                <Flex justify="space-between">
                  <Typography.Text type="secondary">Tiền hàng</Typography.Text>
                  <Typography.Text strong>
                    {formatCurrency(draftOrder.exchangedTotalValue || 0)}
                  </Typography.Text>
                </Flex>
                <Flex justify="space-between">
                  <Typography.Text type="secondary">Phí tạm tính</Typography.Text>
                  <Typography.Text strong>
                    {formatCurrency(draftOrder.totalFee || 0)}
                  </Typography.Text>
                </Flex>
                <Flex justify="space-between">
                  <Typography.Text strong>Tổng thanh toán</Typography.Text>
                  <Typography.Text strong style={{ color: token.colorPrimary }}>
                    {formatCurrency(draftOrder.grandTotal || 0)}
                  </Typography.Text>
                </Flex>
                <Flex justify="space-between">
                  <Typography.Text type="secondary">Đặt cọc</Typography.Text>
                  <Typography.Text strong>
                    {draftOrder.emdPercent || 0}% /{" "}
                    {formatCurrency(draftOrder.emdAmount || 0)}
                  </Typography.Text>
                </Flex>
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={createOrder.isPending}
                  disabled={!selectedAddressId}
                  onClick={() =>
                    createOrder.mutateAsync({ draftOrder: draftOrder.id })
                  }
                >
                  Tạo đơn hàng
                </Button>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default CartCheckout;
