import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Image,
  Row,
  Space,
  Spin,
  Table,
  Tooltip,
  Typography,
  theme,
} from "antd";
import {
  QuestionCircleOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import {
  useAddressesQuery,
  useCreateCustomerOrderMutation,
  useCustomerBalance,
  useDraftOrderQuery,
  useUpdateDraftOrderMutation,
} from "@repo/hooks";
import { formatCurrency } from "@repo/util";
import { useParams } from "react-router-dom";
import { useCallback } from "react";
import { DeliveryAddressPanel } from "./components/DeliveryAddressPanel";
import {
  getForeignCurrency,
  getImage,
  getName,
  getProductUrl,
  getProperties,
} from "../Carts/cartViewModel";

const MONEY_TEXT_STYLE = { whiteSpace: "nowrap" };

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

export const CartCheckoutStyleDefault = () => {
  const { token } = theme.useToken();
  const { draftOrderId } = useParams();
  const { data: draftOrder, isLoading } = useDraftOrderQuery(draftOrderId);
  const { data: addresses, refetch: refetchAddresses } = useAddressesQuery({
    page: 0,
    receivingAddress: false,
    size: 1000,
    sort: "defaultAddress:desc,createdAt:desc",
  });
  const { data: balanceData } = useCustomerBalance();
  const {
    mutateAsync: updateDraftOrderAsync,
    isPending: isUpdatingDraftOrder,
  } = useUpdateDraftOrderMutation(draftOrderId);
  const createOrder = useCreateCustomerOrderMutation();
  const merchants = Array.isArray(draftOrder?.merchants)
    ? draftOrder.merchants
    : [];
  const selectedAddressId = draftOrder?.address?.id || draftOrder?.address;
  const totalLink = merchants.reduce(
    (sum: number, merchant: any) => sum + getSkus(merchant).length,
    0,
  );
  const totalQuantity = merchants.reduce(
    (sum: number, merchant: any) =>
      sum +
      getSkus(merchant).reduce(
        (merchantSum: number, sku: any) =>
          merchantSum + Number(sku.quantity || 0),
        0,
      ),
    0,
  );
  const balance = Number(balanceData?.balance || 0);
  const lackOfMoney = Number(draftOrder?.emdAmount || 0) > balance;
  const selectAddress = useCallback(
    (address: string | number) => updateDraftOrderAsync({ address }),
    [updateDraftOrderAsync],
  );

  if (isLoading) return <Spin />;
  if (!draftOrder) return <Empty description="Không tìm thấy đơn nháp" />;

  const columns = [
    {
      title: "Sản phẩm",
      key: "product",
      width: 420,
      render: (_: unknown, sku: any) => {
        const image = getImage(sku);
        const productUrl = getProductUrl(sku);
        const imageNode = image ? (
          <Image
            width={56}
            height={56}
            preview
            src={image}
            referrerPolicy="no-referrer"
            style={{
              border: `1px solid ${token.colorBorderSecondary}`,
              objectFit: "cover",
            }}
          />
        ) : (
          <Avatar shape="square" size={56} icon={<ShoppingCartOutlined />} />
        );

        return (
          <Space align="start" style={{ minWidth: 0 }}>
            {imageNode}
            <Space
              direction="vertical"
              size={0}
              style={{ minWidth: 0, width: "100%" }}
            >
              <Typography.Text
                strong
                ellipsis={{ tooltip: getName(sku, true) }}
                style={{ maxWidth: 320 }}
              >
                {productUrl ? (
                  <a href={productUrl} target="_blank" rel="noreferrer">
                    {getName(sku, true)}
                  </a>
                ) : (
                  getName(sku, true)
                )}
              </Typography.Text>
              <Typography.Text
                type="secondary"
                ellipsis={{ tooltip: getProperties(sku, true) || "---" }}
                style={{ maxWidth: 320 }}
              >
                {getProperties(sku, true) || "---"}
              </Typography.Text>
              {sku.remark && (
                <Typography.Text style={{ maxWidth: 320 }}>
                  <Typography.Text type="secondary">
                    Ghi chú sản phẩm:{" "}
                  </Typography.Text>
                  {sku.remark}
                </Typography.Text>
              )}
              {sku.note && (
                <Typography.Text style={{ maxWidth: 320 }}>
                  <Typography.Text type="secondary">
                    Ghi chú cá nhân cho sản phẩm:{" "}
                  </Typography.Text>
                  {sku.note}
                </Typography.Text>
              )}
            </Space>
          </Space>
        );
      },
    },
    {
      title: "Tiền hàng",
      key: "amount",
      width: 160,
      align: "right" as const,
      render: (_: unknown, sku: any) => (
        <Space direction="vertical" size={0} align="end">
          {sku.bargainPrice !== null && sku.bargainPrice !== undefined ? (
            <Typography.Text style={MONEY_TEXT_STYLE}>
              <Typography.Text delete type="secondary" style={MONEY_TEXT_STYLE}>
                {formatCurrency(
                  Number(sku.exchangedSalePrice || 0) *
                    Number(sku.quantity || 0),
                )}
              </Typography.Text>{" "}
              /{" "}
              <Typography.Text strong style={MONEY_TEXT_STYLE}>
                {formatCurrency(
                  Number(sku.exchangedBargainPrice || 0) *
                    Number(sku.quantity || 0),
                )}
              </Typography.Text>
            </Typography.Text>
          ) : (
            <Typography.Text strong style={MONEY_TEXT_STYLE}>
              {formatCurrency(sku.exchangedTotalAmount || 0)}
            </Typography.Text>
          )}
          <Typography.Text type="secondary" style={MONEY_TEXT_STYLE}>
            {sku.bargainPrice !== null && sku.bargainPrice !== undefined ? (
              <>
                <Typography.Text
                  delete
                  type="secondary"
                  style={MONEY_TEXT_STYLE}
                >
                  {formatCurrency(
                    Number(sku.salePrice || 0) * Number(sku.quantity || 0),
                    getForeignCurrency(sku),
                  )}
                </Typography.Text>{" "}
                /{" "}
                <Typography.Text strong style={MONEY_TEXT_STYLE}>
                  {formatCurrency(
                    Number(sku.bargainPrice || 0) * Number(sku.quantity || 0),
                    getForeignCurrency(sku),
                  )}
                </Typography.Text>
              </>
            ) : (
              <Typography.Text strong style={MONEY_TEXT_STYLE}>
                {formatCurrency(sku.totalAmount || 0, getForeignCurrency(sku))}
              </Typography.Text>
            )}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      render: (quantity: number) => (
        <Typography.Text>{quantity || 0} sản phẩm</Typography.Text>
      ),
    },
  ];

  return (
    <div style={{ paddingBottom: token.paddingLG }}>
      <Flex
        justify="space-between"
        align="center"
        style={{ marginBottom: token.marginLG }}
      >
        <Typography.Title level={3} style={{ margin: 0 }}>
          Xác nhận đơn hàng
        </Typography.Title>
      </Flex>

      <Row gutter={token.marginLG} align="top">
        <Col xs={24} xl={17}>
          <Space
            direction="vertical"
            size={token.marginMD}
            style={{ width: "100%" }}
          >
            {merchants.map((merchant: any) => {
              const skus = getSkus(merchant);
              const totalQuantity = skus.reduce(
                (sum: number, sku: any) => sum + Number(sku.quantity || 0),
                0,
              );
              return (
                <Card
                  key={merchant.id}
                  className="overflow-hidden"
                  title={
                    <Flex
                      align="center"
                      gap={token.marginSM}
                      style={{ minWidth: 0 }}
                    >
                      <Flex
                        align="center"
                        gap={token.marginSM}
                        style={{ minWidth: 0 }}
                      >
                        {merchant?.marketplace?.image ? (
                          <Avatar
                            shape="square"
                            src={merchant.marketplace.image}
                          />
                        ) : (
                          <Avatar shape="square" icon={<ShopOutlined />} />
                        )}
                        <Typography.Text
                          strong
                          ellipsis={{
                            tooltip: merchant.name || merchant.code || "Shop",
                          }}
                          style={{ maxWidth: 320 }}
                        >
                          {merchant.name || merchant.code || "Shop"}
                        </Typography.Text>
                        <Typography.Text type="secondary">
                          Số lượng: {totalQuantity} sản phẩm / {skus.length}{" "}
                          link
                        </Typography.Text>
                        <Tooltip title="Số sản phẩm/link">
                          <QuestionCircleOutlined
                            style={{ color: token.colorTextSecondary }}
                          />
                        </Tooltip>
                      </Flex>
                      <Typography.Text
                        type="secondary"
                        style={{ marginLeft: "auto", ...MONEY_TEXT_STYLE }}
                      >
                        Tổng tiền:{" "}
                        {formatCurrency(merchant.exchangedTotalValue || 0)}
                      </Typography.Text>
                    </Flex>
                  }
                  styles={{ body: { padding: 0 } }}
                >
                  <Table
                    className="[&_.ant-table-tbody>tr:last-child>td]:!border-b-0 [&_.ant-table-cell]:rounded-none"
                    rowKey={(sku) => String(sku.id)}
                    tableLayout="fixed"
                    scroll={{ x: 700 }}
                    dataSource={skus}
                    columns={columns}
                    pagination={false}
                  />
                  <Space
                    direction="vertical"
                    size={token.marginSM}
                    style={{
                      width: "100%",
                      padding: token.paddingMD,
                      borderTop: `1px solid ${token.colorBorderSecondary}`,
                    }}
                  >
                    <Flex gap={token.marginSM} wrap>
                      <Typography.Text type="secondary">
                        Dịch vụ:
                      </Typography.Text>
                      {Array.isArray(merchant.services) &&
                      merchant.services.length > 0 ? (
                        merchant.services
                          .slice()
                          .sort(
                            (left: any, right: any) =>
                              Number(left.position || 0) -
                              Number(right.position || 0),
                          )
                          .map((service: any) => (
                            <Typography.Text key={service.id || service.code}>
                              {service.name}
                            </Typography.Text>
                          ))
                      ) : (
                        <Typography.Text>---</Typography.Text>
                      )}
                    </Flex>

                    {(merchant.remark ||
                      merchant.note ||
                      merchant.refCustomerCode ||
                      merchant.refOrderCode) && (
                      <Space
                        direction="vertical"
                        size={token.marginXS}
                        style={{ width: "100%" }}
                      >
                        {merchant.remark && (
                          <Typography.Text>
                            <Typography.Text type="secondary">
                              Ghi chú cho đơn:{" "}
                            </Typography.Text>
                            {merchant.remark}
                          </Typography.Text>
                        )}
                        {merchant.note && (
                          <Typography.Text>
                            <Typography.Text type="secondary">
                              Ghi chú cá nhân cho đơn:{" "}
                            </Typography.Text>
                            {merchant.note}
                          </Typography.Text>
                        )}
                        {merchant.refCustomerCode && (
                          <Typography.Text>
                            <Typography.Text type="secondary">
                              Mã khách hàng:{" "}
                            </Typography.Text>
                            {merchant.refCustomerCode}
                          </Typography.Text>
                        )}
                        {merchant.refOrderCode && (
                          <Typography.Text>
                            <Typography.Text type="secondary">
                              Mã đơn hàng khách hàng:{" "}
                            </Typography.Text>
                            {merchant.refOrderCode}
                          </Typography.Text>
                        )}
                      </Space>
                    )}
                  </Space>
                </Card>
              );
            })}
          </Space>
        </Col>

        <Col xs={24} xl={7}>
          <Card styles={{ body: { padding: token.paddingMD } }}>
            <Space
              direction="vertical"
              size={token.marginMD}
              style={{ width: "100%" }}
            >
              <DeliveryAddressPanel
                addresses={addresses?.data || []}
                selectedAddressData={
                  draftOrder?.address && typeof draftOrder.address === "object"
                    ? draftOrder.address
                    : undefined
                }
                selectedAddressId={selectedAddressId}
                isUpdating={isUpdatingDraftOrder}
                onSelectAddress={selectAddress}
                onRefetchAddresses={() => refetchAddresses()}
              />

              <Card
                title="Thông tin thanh toán"
                style={{
                  borderColor: token.colorPrimaryBorder,
                  background: token.colorPrimaryBg,
                }}
              >
              <Space
                direction="vertical"
                size={token.marginSM}
                style={{ width: "100%" }}
              >
                <Typography.Text strong>Thông tin sản phẩm</Typography.Text>
                <Flex justify="space-between">
                  <Typography.Text type="secondary">Người bán</Typography.Text>
                  <Typography.Text>{merchants.length}</Typography.Text>
                </Flex>
                <Flex justify="space-between">
                  <Typography.Text type="secondary">Tổng link</Typography.Text>
                  <Typography.Text>{totalLink}</Typography.Text>
                </Flex>
                <Divider style={{ marginBlock: token.marginXS }} />

                <Typography.Text strong>Thông tin đơn</Typography.Text>
                <Flex justify="space-between">
                  <Typography.Text type="secondary">
                    Phí tạm tính
                  </Typography.Text>
                  <Typography.Text strong>
                    {formatCurrency(draftOrder.totalFee || 0)}
                  </Typography.Text>
                </Flex>
                <Flex justify="space-between">
                  <Typography.Text type="secondary">
                    Tiền hàng tạm tính ({totalQuantity} sản phẩm)
                  </Typography.Text>
                  <Typography.Text strong>
                    {formatCurrency(draftOrder.exchangedTotalValue || 0)}
                  </Typography.Text>
                </Flex>
                <Flex justify="space-between">
                  <Typography.Text type="secondary">Đặt cọc</Typography.Text>
                  <Typography.Text
                    strong
                    style={{
                      color: token.colorPrimary,
                      fontSize: token.fontSizeLG,
                    }}
                  >
                    {draftOrder.emdPercent || 0}% /{" "}
                    {formatCurrency(draftOrder.emdAmount || 0)}
                  </Typography.Text>
                </Flex>
                {lackOfMoney && (
                  <>
                    <Flex justify="space-between">
                      <Typography.Text type="secondary">
                        Số dư tài khoản
                      </Typography.Text>
                      <Typography.Text>
                        {balance >= 0 ? "+" : ""}
                        {formatCurrency(balance)}
                      </Typography.Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Typography.Text type="secondary">
                        Số tiền còn thiếu
                      </Typography.Text>
                      <Typography.Text type="danger" strong>
                        {formatCurrency(
                          Number(draftOrder.emdAmount || 0) - balance,
                        )}
                      </Typography.Text>
                    </Flex>
                  </>
                )}
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
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CartCheckoutStyleDefault;
