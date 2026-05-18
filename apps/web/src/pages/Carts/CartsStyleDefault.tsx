import {
  Alert,
  Avatar,
  Button,
  Card,
  Checkbox,
  Divider,
  Empty,
  Flex,
  Image,
  InputNumber,
  Modal,
  Pagination,
  Popconfirm,
  Select,
  Skeleton,
  Space,
  Switch,
  Table,
  Tooltip,
  Typography,
  theme,
} from "antd";
import {
  DownOutlined,
  DeleteOutlined,
  EditOutlined,
  HeartFilled,
  HeartOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { formatCurrency } from "@repo/util";
import { useCartsPage } from "./hooks/useCartsPage";
import { AddProductsModal } from "./components/AddProductsModal";
import { SellerServicesPanel } from "./components/SellerServicesPanel";
import { useEffect, useRef, useState } from "react";
import {
  getCartTableRows,
  getEffectiveUnitPrice,
  getExchangeRate,
  getForeignBargainPrice,
  getForeignCurrency,
  getForeignSalePrice,
  getImage,
  getName,
  getProductUrl,
  getProperties,
  getQuantityWarnings,
  getUnitPrice,
  QUANTITY_WARNING_MESSAGE,
} from "./cartViewModel";

const MONEY_TEXT_STYLE = { whiteSpace: "nowrap" };
const CART_COLUMNS_COUNT = 6;

const CartPageSkeleton = () => (
  <Space direction="vertical" size="large" style={{ width: "100%" }}>
    <Flex justify="space-between" align="center">
      <Skeleton.Input active size="large" style={{ width: 180 }} />
      <Space>
        <Skeleton.Button active />
        <Skeleton.Button active />
        <Skeleton.Button active />
      </Space>
    </Flex>

    <Flex justify="space-between" align="center">
      <Space>
        <Skeleton.Input active style={{ width: 120 }} />
        <Skeleton.Button active />
        <Skeleton.Input active style={{ width: 180 }} />
        <Skeleton.Button active />
      </Space>
      <Skeleton.Input active style={{ width: 220 }} />
    </Flex>

    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      {[0, 1].map((item) => (
        <Card
          key={item}
          title={
            <Flex align="center" gap={12}>
              <Skeleton.Avatar active shape="square" size="small" />
              <Skeleton.Input active style={{ width: 260 }} />
            </Flex>
          }
          extra={<Skeleton.Button active size="small" />}
          styles={{ body: { padding: 0 } }}
        >
          <Flex align="stretch">
            <div style={{ flex: "1 1 0", padding: 16 }}>
              <Skeleton active title={false} paragraph={{ rows: 6 }} />
            </div>
            <div style={{ width: 360, flex: "0 0 360px", padding: 16 }}>
              <Skeleton active paragraph={{ rows: 8 }} />
            </div>
          </Flex>
        </Card>
      ))}
    </Space>
  </Space>
);

export const CartsStyleDefault = () => {
  const { token } = theme.useToken();
  const logic = useCartsPage();
  const pageRef = useRef<HTMLDivElement>(null);
  const [bottomBarStyle, setBottomBarStyle] = useState<React.CSSProperties>();

  useEffect(() => {
    const content = pageRef.current?.closest(
      ".ant-layout-content",
    ) as HTMLElement | null;
    if (!content) return;

    const updateBounds = () => {
      const rect = content.getBoundingClientRect();
      setBottomBarStyle({
        left: rect.left + 16,
        width: rect.width - 32,
      });
    };

    updateBounds();
    const observer = new ResizeObserver(updateBounds);
    observer.observe(content);
    window.addEventListener("resize", updateBounds);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateBounds);
    };
  }, []);

  if (logic.isLoading) {
    return (
      <div
        ref={pageRef}
        className="relative flex min-h-full flex-col"
        style={{ gap: token.marginLG, paddingBottom: 96 }}
      >
        <CartPageSkeleton />
      </div>
    );
  }

  const columns = [
    {
      title: "",
      key: "selected",
      width: 48,
      onCell: (sku: any) =>
        sku.__rowType === "quantityWarning"
          ? { colSpan: CART_COLUMNS_COUNT }
          : {},
      render: (_: unknown, sku: any) =>
        sku.__rowType === "quantityWarning" ? (
          <Alert type="warning" showIcon message={QUANTITY_WARNING_MESSAGE} />
        ) : (
          <Checkbox
            checked={logic.selectedSkuIds.includes(String(sku.id))}
            onChange={(event) =>
              logic.toggleSku(String(sku.id), event.target.checked)
            }
          />
        ),
    },
    {
      title: "Sản phẩm",
      key: "product",
      width: 420,
      onCell: (sku: any) =>
        sku.__rowType === "quantityWarning" ? { colSpan: 0 } : {},
      render: (_: unknown, sku: any) => {
        const skuId = String(sku.id);
        const image = getImage(sku);
        const productUrl = getProductUrl(sku);
        const renderSkuNoteField = (
          field: "remark" | "note",
          label: string,
        ) => {
          const draft = logic.skuNoteDrafts[skuId] || {};
          const value = draft[field] ?? sku[field] ?? "";

          return (
            <div
              style={{
                width: "100%",
                maxWidth: 320,
                marginTop: token.marginXXS,
              }}
            >
              <Typography.Text type="secondary">{label}: </Typography.Text>
              <Typography.Paragraph
                editable={{
                  onChange: (nextValue) =>
                    logic.changeSkuNoteDraft(sku, field, nextValue),
                  onEnd: () => logic.saveSkuNoteField(sku, field),
                }}
                ellipsis={!value ? false : { tooltip: value }}
                style={{
                  display: "inline",
                  marginBottom: 0,
                  whiteSpace: "pre-wrap",
                }}
              >
                {value || "---"}
              </Typography.Paragraph>
            </div>
          );
        };

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

        const linkedImageNode =
          productUrl && !image ? (
            <a href={productUrl} target="_blank" rel="noreferrer">
              {imageNode}
            </a>
          ) : (
            imageNode
          );

        return (
          <Space align="start" style={{ minWidth: 0 }}>
            {linkedImageNode}
            <Space
              direction="vertical"
              size={0}
              style={{ minWidth: 0, width: "100%" }}
            >
              <Typography.Text
                strong
                ellipsis={{ tooltip: getName(sku, logic.showTranslatedNames) }}
                style={{ maxWidth: 320 }}
              >
                {productUrl ? (
                  <a href={productUrl} target="_blank" rel="noreferrer">
                    {getName(sku, logic.showTranslatedNames)}
                  </a>
                ) : (
                  getName(sku, logic.showTranslatedNames)
                )}
              </Typography.Text>
              <Typography.Text
                type="secondary"
                ellipsis={{
                  tooltip:
                    getProperties(sku, logic.showTranslatedNames) || "---",
                }}
                style={{ maxWidth: 320 }}
              >
                {getProperties(sku, logic.showTranslatedNames) || "---"}
              </Typography.Text>
              {renderSkuNoteField("remark", "Ghi chú sản phẩm")}
              {renderSkuNoteField("note", "Ghi chú cá nhân cho sản phẩm")}
            </Space>
          </Space>
        );
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 140,
      onCell: (sku: any) =>
        sku.__rowType === "quantityWarning" ? { colSpan: 0 } : {},
      render: (_quantity: number, sku: any) => {
        const displayQuantity = logic.getDisplayQuantity(sku);
        const warnings = getQuantityWarnings(sku, (item) =>
          String(item.id) === String(sku.id)
            ? Number(displayQuantity || 0)
            : Number(item.quantity || 0),
        );

        return (
          <Space direction="vertical" size={4}>
            <InputNumber
              min={1}
              value={displayQuantity}
              status={
                warnings.isBelowMin ||
                warnings.isAboveStock ||
                warnings.isWrongMultiple
                  ? "warning"
                  : undefined
              }
              onChange={(value) => logic.updateQuantity(sku, value)}
              disabled={logic.isUpdating}
            />
            {warnings.isBelowMin && warnings.productMinQuantity !== null && (
              <Typography.Text
                type="warning"
                style={{ fontSize: 12 }}
                className="whitespace-nowrap"
              >
                Số lượng sản phẩm tối thiểu là {warnings.productMinQuantity}
              </Typography.Text>
            )}
            {warnings.isAboveStock && (
              <Typography.Text
                type="warning"
                style={{ fontSize: 12 }}
                className="whitespace-nowrap"
              >
                Số lượng tối đa là {sku.stock ?? sku?.product?.stock}
              </Typography.Text>
            )}
            {warnings.isWrongMultiple && warnings.batchSize !== null && (
              <Typography.Text
                type="warning"
                style={{ fontSize: 12 }}
                className="whitespace-nowrap"
              >
                Số lượng phải là bội số của {warnings.batchSize}
              </Typography.Text>
            )}
          </Space>
        );
      },
    },
    {
      title: "Đơn giá",
      key: "unitPrice",
      width: 160,
      align: "right" as const,
      onCell: (sku: any) =>
        sku.__rowType === "quantityWarning" ? { colSpan: 0 } : {},
      render: (_: unknown, sku: any) => {
        const hasBargain =
          sku.bargainPrice !== null && sku.bargainPrice !== undefined;
        const currency = getForeignCurrency(sku);
        return (
          <Space direction="vertical" size={0} align="end">
            <Typography.Text style={MONEY_TEXT_STYLE}>
              {hasBargain ? (
                <>
                  <Typography.Text
                    delete
                    type="secondary"
                    style={MONEY_TEXT_STYLE}
                  >
                    {formatCurrency(getUnitPrice(sku))}
                  </Typography.Text>{" "}
                  /{" "}
                  <Typography.Text strong style={MONEY_TEXT_STYLE}>
                    {formatCurrency(getEffectiveUnitPrice(sku))}
                  </Typography.Text>
                </>
              ) : (
                <Typography.Text strong style={MONEY_TEXT_STYLE}>
                  {formatCurrency(getUnitPrice(sku))}
                </Typography.Text>
              )}
            </Typography.Text>
            <Space size={4} align="center" style={MONEY_TEXT_STYLE}>
              <Typography.Text type="secondary" style={MONEY_TEXT_STYLE}>
                {hasBargain && (
                  <Tooltip title="Giá gốc / giá thương lượng">
                    <InfoCircleOutlined style={{ marginRight: 4 }} />
                  </Tooltip>
                )}
                {hasBargain ? (
                  <>
                    <Typography.Text
                      delete
                      type="secondary"
                      style={MONEY_TEXT_STYLE}
                    >
                      {formatCurrency(getForeignSalePrice(sku), currency)}
                    </Typography.Text>{" "}
                    /{" "}
                    <Typography.Text strong style={MONEY_TEXT_STYLE}>
                      {formatCurrency(getForeignBargainPrice(sku), currency)}
                    </Typography.Text>
                  </>
                ) : (
                  <Typography.Text strong style={MONEY_TEXT_STYLE}>
                    {formatCurrency(getForeignSalePrice(sku), currency)}
                  </Typography.Text>
                )}
              </Typography.Text>
              {logic.canEditCart && (
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  style={{ paddingInline: 2 }}
                  onClick={() => logic.setEditingPriceSku(sku)}
                />
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
      onCell: (sku: any) =>
        sku.__rowType === "quantityWarning" ? { colSpan: 0 } : {},
      render: (_: unknown, sku: any) => (
        <Space direction="vertical" size={0} align="end">
          <Typography.Text strong style={MONEY_TEXT_STYLE}>
            {formatCurrency(
              getEffectiveUnitPrice(sku) * Number(sku.quantity || 0),
            )}
          </Typography.Text>
          <Typography.Text type="secondary" style={MONEY_TEXT_STYLE}>
            {sku.bargainPrice !== null && sku.bargainPrice !== undefined ? (
              <>
                <Typography.Text
                  delete
                  type="secondary"
                  style={MONEY_TEXT_STYLE}
                >
                  {formatCurrency(
                    getForeignSalePrice(sku) * Number(sku.quantity || 0),
                    getForeignCurrency(sku),
                  )}
                </Typography.Text>{" "}
                /{" "}
                <Typography.Text strong style={MONEY_TEXT_STYLE}>
                  {formatCurrency(
                    getForeignBargainPrice(sku) * Number(sku.quantity || 0),
                    getForeignCurrency(sku),
                  )}
                </Typography.Text>
              </>
            ) : (
              <Typography.Text strong style={MONEY_TEXT_STYLE}>
                {formatCurrency(
                  getForeignSalePrice(sku) * Number(sku.quantity || 0),
                  getForeignCurrency(sku),
                )}
              </Typography.Text>
            )}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 150,
      align: "right" as const,
      onCell: (sku: any) =>
        sku.__rowType === "quantityWarning" ? { colSpan: 0 } : {},
      render: (_: unknown, sku: any) => {
        const skuId = String(sku.id);
        const saved = logic.savedSkuIds.includes(skuId);

        return (
          <Space size={4}>
            <Button
              type="text"
              icon={saved ? <HeartFilled /> : <HeartOutlined />}
              loading={logic.savingSkuId === skuId}
              disabled={saved}
              onClick={() => logic.saveSkuToWishlist(skuId)}
              style={{
                paddingInline: 4,
                color: saved ? token.colorPrimary : undefined,
              }}
            />
            <Popconfirm
              title="Xóa sản phẩm này?"
              okText="Xóa"
              cancelText="Hủy"
              onConfirm={() => logic.deleteSku(skuId)}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                loading={String(logic.deletingSkuId || "") === skuId}
              />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div
      ref={pageRef}
      className="relative flex min-h-full flex-col"
      style={{ gap: token.marginLG, paddingBottom: 96 }}
    >
      <Flex justify="space-between" align="center" gap={token.marginMD} wrap>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Giỏ hàng
        </Typography.Title>
        <Space>
          <Popconfirm
            title="Xóa toàn bộ người bán khỏi giỏ hàng?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={logic.deleteAll}
          >
            <Button type="link" danger loading={logic.isDeletingAll}>
              Xóa tất cả người bán
            </Button>
          </Popconfirm>
          <Switch
            checked={logic.showTranslatedNames}
            onChange={logic.setShowTranslatedNames}
            unCheckedChildren={"Tên gốc"}
            checkedChildren={"Tên dịch"}
          />
          <Button type="primary" onClick={() => logic.setAddProductsOpen(true)}>
            Thêm sản phẩm
          </Button>
        </Space>
      </Flex>

      {logic.groups.length > 0 && (
        <Flex justify="space-between" align="center" gap={token.marginMD} wrap>
          <Space wrap>
            <Typography.Text>Số Shop/Trang</Typography.Text>
            <Select
              value={logic.shopsPerPage}
              onChange={logic.changeShopsPerPage}
              options={[5, 10, 15, 20].map((value) => ({
                value,
                label: value,
              }))}
              style={{ width: 88 }}
            />
            <Typography.Text>Số lượng sản phẩm/Người bán</Typography.Text>
            <Select
              value={logic.productsPerSeller}
              onChange={logic.setProductsPerSeller}
              options={[5, 10, 20, 30, 40, 50].map((value) => ({
                value,
                label: value,
              }))}
              style={{ width: 88 }}
            />
          </Space>
          <Pagination
            current={logic.shopPage}
            pageSize={logic.shopsPerPage}
            total={logic.cartTotalGroups}
            onChange={logic.setShopPage}
            showQuickJumper
            showSizeChanger={false}
          />
        </Flex>
      )}

      {logic.groups.length === 0 && !logic.isLoading ? (
        <Card>
          <Empty description="Chưa có sản phẩm trong giỏ hàng" />
        </Card>
      ) : (
        <>
          <Space
            direction="vertical"
            size={token.marginMD}
            style={{ width: "100%" }}
          >
            {logic.visibleGroups.map((group: any) => {
              const groupId = String(group.id);
              const isExpanded = logic.expandedGroupIds.includes(groupId);
              const visibleSkus = isExpanded
                ? group.cartSkus
                : group.cartSkus.slice(0, logic.productsPerSeller);
              const selectedCount = group.cartSkus.filter((sku: any) =>
                logic.selectedSkuIds.includes(String(sku.id)),
              ).length;
              const allSelected =
                group.cartSkus.length > 0 &&
                selectedCount === group.cartSkus.length;
              const totalQuantity = group.cartSkus.reduce(
                (sum: number, sku: any) => sum + Number(sku.quantity || 0),
                0,
              );
              const exchangeRate = getExchangeRate(group, logic.exchangeRates);

              return (
                <Card
                  className="overflow-hidden"
                  key={group.id}
                  classNames={{
                    header: "px-4",
                  }}
                  title={
                    <Flex
                      align="center"
                      gap={token.marginSM}
                      style={{ minWidth: 0 }}
                    >
                      <Checkbox
                        checked={allSelected}
                        indeterminate={selectedCount > 0 && !allSelected}
                        onChange={(event) =>
                          logic.toggleGroup(group, event.target.checked)
                        }
                      />
                      {group?.marketplace?.image ? (
                        <Avatar shape="square" src={group.marketplace.image} />
                      ) : (
                        <Avatar shape="square" icon={<ShopOutlined />} />
                      )}
                      <Flex
                        align="center"
                        gap={token.marginSM}
                        style={{ minWidth: 0, whiteSpace: "nowrap" }}
                      >
                        <Typography.Text
                          strong
                          ellipsis={{
                            tooltip: group.name || group.code || "Shop",
                          }}
                          style={{ maxWidth: 320 }}
                        >
                          {group.name || group.code || "Shop"}
                        </Typography.Text>
                        <Typography.Text type="secondary">
                          Số lượng: {totalQuantity} sản phẩm /{" "}
                          {group.cartSkus.length} link
                        </Typography.Text>
                        <Tooltip title="Tổng số lượng sản phẩm / số link trong shop">
                          <QuestionCircleOutlined
                            style={{ color: token.colorTextSecondary }}
                          />
                        </Tooltip>
                        {exchangeRate && (
                          <Typography.Text
                            type="secondary"
                            style={MONEY_TEXT_STYLE}
                          >
                            Tỷ giá: {formatCurrency(1, exchangeRate.base)} ={" "}
                            {formatCurrency(
                              exchangeRate.rate,
                              exchangeRate.exchange,
                            )}
                          </Typography.Text>
                        )}
                      </Flex>
                    </Flex>
                  }
                  extra={
                    <Popconfirm
                      title="Xóa toàn bộ shop này khỏi giỏ hàng?"
                      okText="Xóa"
                      cancelText="Hủy"
                      onConfirm={() => logic.deleteGroup(group)}
                    >
                      <Button
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        loading={logic.deletingGroupId === String(group.id)}
                      >
                        Xóa shop
                      </Button>
                    </Popconfirm>
                  }
                  styles={{
                    header: { borderBottom: 0 },
                    body: { padding: 0 },
                  }}
                >
                  <Flex align="stretch">
                    <div style={{ flex: "1 1 0", minWidth: 0 }}>
                      <Table
                        className="[&_.ant-table-tbody>tr:last-child>td]:!border-b-0 [&_.ant-table-cell]:rounded-none"
                        rowKey={(sku) => String(sku.id)}
                        tableLayout="fixed"
                        scroll={{ x: 1078 }}
                        dataSource={getCartTableRows(visibleSkus)}
                        columns={columns}
                        pagination={false}
                        loading={logic.isLoading}
                      />
                      <Flex
                        justify="center"
                        align="center"
                        gap={token.marginSM}
                        style={{
                          padding: token.paddingSM,
                          borderTop: `1px solid ${token.colorBorderSecondary}`,
                        }}
                      >
                        {group.cartSkus.length > logic.productsPerSeller && (
                          <Button
                            type="link"
                            onClick={() => logic.toggleGroupExpanded(groupId)}
                            icon={
                              isExpanded ? <UpOutlined /> : <DownOutlined />
                            }
                          >
                            {isExpanded ? "Thu gọn" : "Xem thêm"}
                          </Button>
                        )}
                      </Flex>
                    </div>
                    <div
                      style={{
                        width: 360,
                        flex: "0 0 360px",
                      }}
                    >
                      <SellerServicesPanel group={group} logic={logic} />
                    </div>
                  </Flex>
                </Card>
              );
            })}
          </Space>
        </>
      )}

      <div
        className="fixed bottom-0 z-20 border-t border-gray-200 bg-white/95 px-6 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur dark:border-gray-800 dark:bg-[#141414]/95"
        style={bottomBarStyle}
      >
        <Flex justify="space-between" align="center" gap={token.marginLG} wrap>
          <Space align="center" split={<Divider type="vertical" />}>
            <Checkbox
              checked={logic.allSelected}
              onChange={(event) => logic.selectAll(event.target.checked)}
            >
              Chọn tất cả
            </Checkbox>
            <Popconfirm
              title="Xóa các sản phẩm đã chọn khỏi giỏ hàng?"
              okText="Xóa"
              cancelText="Hủy"
              onConfirm={logic.deleteSelected}
            >
              <Button
                type="text"
                danger
                loading={logic.isDeletingSelected}
                disabled={logic.totals.selectedSkus === 0}
              >
                Xóa tất cả
              </Button>
            </Popconfirm>
          </Space>

          <Flex align="center" gap={token.marginLG} wrap>
            <Typography.Text style={MONEY_TEXT_STYLE}>
              Ngoại tệ:{" "}
              <Typography.Text strong style={MONEY_TEXT_STYLE}>
                {formatCurrency(
                  logic.totals.selectedForeignAmount,
                  logic.selectedForeignCurrency,
                )}
              </Typography.Text>
            </Typography.Text>
            <Typography.Text style={MONEY_TEXT_STYLE}>
              Tổng:{" "}
              <Typography.Text
                strong
                className="text-lg !text-primary"
                style={MONEY_TEXT_STYLE}
              >
                {formatCurrency(logic.totals.selectedAmount)}
              </Typography.Text>{" "}
              ({logic.totals.selectedGroups} Shop / {logic.totals.selectedSkus}{" "}
              Sản phẩm)
            </Typography.Text>
            <Button
              type="primary"
              size="large"
              className="h-12 min-w-40 px-8 text-base font-semibold"
              disabled={logic.totals.selectedSkus === 0}
              loading={logic.isPlacingOrder}
              onClick={logic.placeOrder}
            >
              Đặt hàng
            </Button>
          </Flex>
        </Flex>
      </div>
      <AddProductsModal
        open={logic.addProductsOpen}
        onClose={() => logic.setAddProductsOpen(false)}
      />
      <Modal
        title="Sửa giá tệ"
        open={!!logic.editingPriceSku}
        onCancel={() => logic.setEditingPriceSku(null)}
        okText="Cập nhật"
        cancelText="Hủy"
        destroyOnHidden
        confirmLoading={logic.isUpdating}
        okButtonProps={{
          disabled:
            logic.editingPriceSku?.draftBargainPrice === null ||
            logic.editingPriceSku?.draftBargainPrice === undefined,
        }}
        onOk={() =>
          logic.updateBargainPrice(
            logic.editingPriceSku,
            Number(
              logic.editingPriceSku?.draftBargainPrice ??
                logic.editingPriceSku?.bargainPrice,
            ),
          )
        }
      >
        {logic.editingPriceSku && (
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Space align="start">
              <Avatar
                shape="square"
                size={72}
                src={getImage(logic.editingPriceSku)}
              />
              <Space direction="vertical" size={0}>
                <Typography.Text strong>
                  {getName(logic.editingPriceSku, logic.showTranslatedNames)}
                </Typography.Text>
                <Typography.Text type="secondary">
                  Giá gốc:{" "}
                  {formatCurrency(
                    getForeignSalePrice(logic.editingPriceSku),
                    getForeignCurrency(logic.editingPriceSku),
                  )}
                </Typography.Text>
              </Space>
            </Space>
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              placeholder="Giá thương lượng"
              defaultValue={logic.editingPriceSku.bargainPrice ?? undefined}
              onChange={(value) =>
                logic.setEditingPriceSku({
                  ...logic.editingPriceSku,
                  draftBargainPrice: value,
                })
              }
            />
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default CartsStyleDefault;
