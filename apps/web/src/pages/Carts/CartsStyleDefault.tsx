import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Divider,
  Empty,
  Flex,
  Image,
  InputNumber,
  Pagination,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tooltip,
  Typography,
  theme,
} from "antd";
import {
  DeleteOutlined,
  QuestionCircleOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { formatCurrency } from "@repo/util";
import { useCartsPage } from "./hooks/useCartsPage";
import { AddProductsModal } from "./components/AddProductsModal";
import { useEffect, useRef, useState } from "react";

const getName = (sku: any, showTranslatedNames: boolean) =>
  (showTranslatedNames
    ? sku?.product?.name || sku?.productName || sku?.name || sku?.title
    : sku?.product?.originalName ||
      sku?.originalName ||
      sku?.product?.name ||
      sku?.productName ||
      sku?.name ||
      sku?.title) || "Sản phẩm";

const getImage = (sku: any) =>
  sku?.variantImage ||
  sku?.product?.image ||
  sku?.productImage ||
  sku?.image ||
  sku?.imageUrl;

const getProperties = (sku: any, showTranslatedNames: boolean) =>
  Array.isArray(sku?.variantProperties)
    ? sku.variantProperties
        .map((property: any) =>
          showTranslatedNames
            ? property?.value || property?.originalValue
            : property?.originalValue || property?.value,
        )
        .filter(Boolean)
        .join(" / ")
    : "";

const getUnitPrice = (sku: any) =>
  Number(
    sku?.exchangedSalePrice ??
      sku?.salePrice ??
      sku?.price ??
      sku?.product?.exchangedSalePrice ??
      sku?.product?.salePrice ??
      0,
  );

const getExchangeRate = (group: any, exchangeRates: any[]) => {
  const currency = group?.marketplace?.currency;
  if (!currency || !Array.isArray(exchangeRates)) return null;
  return exchangeRates.find((item: any) => item.code === `${currency}/VND`);
};

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

  const columns = [
    {
      title: "",
      key: "selected",
      width: 48,
      render: (_: unknown, sku: any) => (
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
      render: (_: unknown, sku: any) => (
        <Space align="start">
          {getImage(sku) ? (
            <Image
              width={56}
              height={56}
              preview={true}
              src={getImage(sku)}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <Avatar shape="square" size={56} icon={<ShoppingCartOutlined />} />
          )}
          <Space direction="vertical" size={0}>
            <Typography.Text strong>
              {getName(sku, logic.showTranslatedNames)}
            </Typography.Text>
            <Typography.Text type="secondary">
              {getProperties(sku, logic.showTranslatedNames) || "---"}
            </Typography.Text>
            {sku?.note && (
              <Typography.Text type="secondary">{sku.note}</Typography.Text>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 140,
      render: (quantity: number, sku: any) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) => logic.updateQuantity(sku, value)}
          disabled={logic.isUpdating}
        />
      ),
    },
    {
      title: "Đơn giá",
      key: "unitPrice",
      width: 160,
      align: "right" as const,
      render: (_: unknown, sku: any) => formatCurrency(getUnitPrice(sku)),
    },
    {
      title: "Tiền hàng",
      key: "amount",
      width: 160,
      align: "right" as const,
      render: (_: unknown, sku: any) => (
        <Typography.Text strong>
          {formatCurrency(getUnitPrice(sku) * Number(sku.quantity || 0))}
        </Typography.Text>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 72,
      align: "right" as const,
      render: (_: unknown, sku: any) => (
        <Popconfirm
          title="Xóa sản phẩm này?"
          okText="Xóa"
          cancelText="Hủy"
          onConfirm={() => logic.deleteSku(String(sku.id))}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            loading={logic.deletingSkuId === String(sku.id)}
          />
        </Popconfirm>
      ),
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
                          <Typography.Text type="secondary">
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
                  <Table
                    className="[&_.ant-table-tbody>tr:last-child>td]:!border-b-0 "
                    rowKey={(sku) => String(sku.id)}
                    dataSource={group.cartSkus.slice(
                      0,
                      logic.productsPerSeller,
                    )}
                    columns={columns}
                    pagination={false}
                    loading={logic.isLoading}
                  />
                </Card>
              );
            })}
          </Space>

          <Flex
            justify="space-between"
            align="center"
            gap={token.marginMD}
            wrap
          >
            <Space wrap>
              <Typography.Text>Số Shop/Trang</Typography.Text>
              <Select
                value={logic.shopsPerPage}
                onChange={logic.changeShopsPerPage}
                options={[5, 10, 20, 50].map((value) => ({
                  value,
                  label: value,
                }))}
                style={{ width: 88 }}
              />
              <Typography.Text>Số lượng sản phẩm/Người bán</Typography.Text>
              <Select
                value={logic.productsPerSeller}
                onChange={logic.setProductsPerSeller}
                options={[5, 10, 20, 50].map((value) => ({
                  value,
                  label: value,
                }))}
                style={{ width: 88 }}
              />
            </Space>
            <Pagination
              current={logic.shopPage}
              pageSize={logic.shopsPerPage}
              total={logic.groups.length}
              onChange={logic.setShopPage}
              showSizeChanger={false}
            />
          </Flex>
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
            <Typography.Text>
              Ngoại tệ:{" "}
              <Typography.Text strong>
                {formatCurrency(
                  logic.totals.selectedForeignAmount,
                  logic.selectedForeignCurrency,
                )}
              </Typography.Text>
            </Typography.Text>
            <Typography.Text>
              Tổng:{" "}
              <Typography.Text strong className="text-lg !text-primary">
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
    </div>
  );
};

export default CartsStyleDefault;
