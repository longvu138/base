import { useState } from "react";
import {
  Button,
  Col,
  Empty,
  Flex,
  Image,
  Input,
  List,
  Modal,
  Row,
  Skeleton,
  Space,
  Tooltip,
  Typography,
  message,
  theme,
} from "antd";
import {
  CopyOutlined,
  DownloadOutlined,
  HeartOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { OrderApi } from "@repo/api";
import { useAddWishlistItemMutation, useOrderProductsQuery } from "@repo/hooks";

interface ProductTabProps {
  orderCode: string;
  order?: any;
}

const { Link, Text } = Typography;

const display = (value: any) => {
  if (value === null || value === undefined || value === "") return "---";
  return String(value);
};

const quantity = (value: any) => {
  if (value === null || value === undefined || value === "") return "---";
  return Number(value).toLocaleString("vi-VN");
};

const money = (value: any, currency = "đ") => {
  if (value === null || value === undefined || value === "" || Number.isNaN(Number(value))) {
    return "---";
  }

  const suffix = currency === "đ" || currency === "VND" ? "đ" : ` ${currency}`;
  return `${Math.ceil(Number(value)).toLocaleString("vi-VN")}${suffix}`;
};

const productImage = (product: any) =>
  product.variantImage || product.image || product.thumb || product.thumbnail;

const productCode = (product: any) => product.code || product.sku || product.id;

const propertyValues = (product: any) => {
  const properties = product.variantProperties || product.properties || [];
  if (!Array.isArray(properties)) return [];

  return properties
    .map((property: any) => property.value || property.originalValue || property.name)
    .filter(Boolean);
};

export const ProductTab = ({ orderCode, order }: ProductTabProps) => {
  const { token } = theme.useToken();
  const { data: products, isLoading } = useOrderProductsQuery(orderCode);
  const addWishlistMutation = useAddWishlistItemMutation();
  const [savingProductId, setSavingProductId] = useState<string | number | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportSecret, setExportSecret] = useState("");
  const [exporting, setExporting] = useState(false);

  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (!products || products.length === 0) return <Empty description="Không có sản phẩm" />;

  const hasInspection = Array.isArray(order?.services)
    ? order.services.some((service: any) => service.code === "inspection")
    : products.some((product: any) => product.receivedQuantity !== undefined);

  const totalQuantity =
    order?.orderedQuantity ?? products.reduce((sum: number, product: any) => sum + Number(product.quantity || 0), 0);
  const purchasedQuantity =
    order?.purchasedQuantity ??
    products.reduce((sum: number, product: any) => sum + Number(product.purchasedQuantity || product.actualQuantity || 0), 0);
  const receivedQuantity =
    order?.receivedQuantity ??
    products.reduce((sum: number, product: any) => sum + Number(product.receivedQuantity || 0), 0);

  const handleSave = (id: string | number) => {
    if (savingProductId) return;

    setSavingProductId(id);
    addWishlistMutation.mutate(
      {
        source: "order",
        data: id,
      },
      {
        onSuccess: () => {
          message.success("Đã lưu sản phẩm");
        },
        onError: () => {
          message.error("Lưu sản phẩm thất bại");
        },
        onSettled: () => {
          setSavingProductId(null);
        },
      },
    );
  };

  const handleCopy = async (value: any) => {
    await navigator.clipboard.writeText(display(value));
    message.success("Đã sao chép");
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await OrderApi.exportOrderProducts(orderCode, { secret: exportSecret });
      const disposition = response.headers?.["content-disposition"] || "";
      const fileName =
        disposition.split("filename=")[1]?.replaceAll('"', "") ||
        `order_products_${orderCode}_${Date.now()}.xlsx`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", decodeURIComponent(fileName));
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setExportOpen(false);
      setExportSecret("");
      message.success("Đang tải file export");
    } catch (error) {
      console.error("Export order products failed:", error);
      message.error("Không xuất được Excel");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <List
        header={
        <Row
          align="middle"
          style={{
            background: token.colorFillAlter,
            border: `1px solid ${token.colorBorderSecondary}`,
            padding: `${token.paddingXS}px ${token.padding}px`,
          }}
        >
          <Col span={10}>
            <Text>{`Sản phẩm`}</Text>
          </Col>
          <Col span={14}>
            <Row align="middle">
              <Col span={6}>
                <Space size={4}>
                  <Text>
                    {quantity(totalQuantity)}/{quantity(purchasedQuantity)}
                    {hasInspection ? `/${quantity(receivedQuantity)}` : ""}
                  </Text>
                  <Tooltip title="Số lượng đặt / mua / nhận">
                    <QuestionCircleOutlined style={{ color: token.colorTextTertiary }} />
                  </Tooltip>
                </Space>
              </Col>
              <Col span={6}>
                <Text>Đơn giá</Text>
              </Col>
              <Col span={6}>
                <Text>Tiền hàng</Text>
              </Col>
              <Col span={6} style={{ textAlign: "right" }}>
                <Button icon={<DownloadOutlined />} size="small" onClick={() => setExportOpen(true)}>
                  Xuất Excel
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
        }
        dataSource={products}
        renderItem={(product: any) => {
        const id = product.id || product.code;
        const code = productCode(product);
        const currency = product.currency?.code || product.currency || "CNY";
        const image = productImage(product);
        const name = product.name || product.originalName;
        const actualPrice = product.actualPrice ?? product.price;
        const exchangedActualPrice = product.exchangedActualPrice ?? product.unitPrice;
        const totalAmount = product.totalAmount ?? product.amount;
        const exchangedTotalAmount =
          product.exchangedTotalAmount ??
          product.totalPrice ??
          (exchangedActualPrice && product.quantity ? exchangedActualPrice * product.quantity : undefined);

        return (
          <List.Item
            style={{
              background: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
              marginTop: token.marginMD,
              padding: token.padding,
              position: "relative",
            }}
          >
            <Row gutter={token.marginSM} style={{ width: "100%" }}>
              <Col span={10}>
                <Flex align="flex-start" gap={token.marginSM}>
                  <Space direction="vertical" size={token.marginXS} style={{ flex: "0 0 88px" }}>
                    {product.productUrl ? (
                      <a href={product.productUrl} target="_blank" rel="noreferrer">
                        <Image
                          src={image}
                          width={80}
                          height={80}
                          preview={false}
                          referrerPolicy="no-referrer"
                          style={{ objectFit: "cover" }}
                        />
                      </a>
                    ) : (
                      <Image
                        src={image}
                        width={80}
                        height={80}
                        preview={false}
                        referrerPolicy="no-referrer"
                        style={{ objectFit: "cover" }}
                      />
                    )}
                    <Flex align="center" gap={token.marginXXS} wrap="nowrap">
                      <Text style={{ whiteSpace: "nowrap" }}>#{display(code)}</Text>
                      <Button
                        type="text"
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => handleCopy(code)}
                        style={{ flex: "0 0 auto" }}
                      />
                    </Flex>
                  </Space>

                  <Space direction="vertical" size={token.marginXS} style={{ minWidth: 0 }}>
                    {product.productUrl ? (
                      <a href={product.productUrl} target="_blank" rel="noreferrer">
                        <Text strong>{display(name)}</Text>
                      </a>
                    ) : (
                      <Text strong>{display(name)}</Text>
                    )}
                    <Space wrap size={token.marginSM}>
                      {propertyValues(product).map((value: string, index: number) => (
                        <Text key={`${value}-${index}`} type="secondary">
                          {value}
                        </Text>
                      ))}
                    </Space>
                  </Space>
                </Flex>
              </Col>

              <Col span={14}>
                <Row>
                  <Col span={6}>
                    <Text strong>
                      {quantity(product.quantity)}/{quantity(product.purchasedQuantity ?? product.actualQuantity)}
                      {hasInspection ? `/${quantity(product.receivedQuantity)}` : ""}
                    </Text>
                  </Col>
                  <Col span={6}>
                    <Space direction="vertical" size={0}>
                      <Text strong>{money(exchangedActualPrice)}</Text>
                      {product.noBargainPrice ? (
                        <Text type="secondary">
                          <Text delete type="secondary">
                            {money(product.noBargainPrice, currency)}
                          </Text>{" "}
                          / <Text strong>{money(actualPrice, currency)}</Text>
                        </Text>
                      ) : (
                        <Text type="secondary">{money(actualPrice, currency)}</Text>
                      )}
                    </Space>
                  </Col>
                  <Col span={6}>
                    <Space direction="vertical" size={0}>
                      <Text strong>{money(exchangedTotalAmount)}</Text>
                      <Text type="secondary">{money(totalAmount, currency)}</Text>
                    </Space>
                  </Col>
                  <Col span={6} style={{ textAlign: "right" }}>
                    <Button
                      type="link"
                      icon={<HeartOutlined />}
                      loading={savingProductId === id}
                      onClick={() => handleSave(id)}
                    >
                      Lưu
                    </Button>
                  </Col>
                </Row>

                <Row style={{ marginTop: token.marginMD }}>
                  <Col span={24}>
                    <Space size={4} align="start">
                      <Link>Ghi chú cho sản phẩm:</Link>
                      <Text type="secondary">{display(product.remark)}</Text>
                    </Space>
                  </Col>
                  <Col span={24}>
                    <Space size={4}>
                      <Text type="secondary">{product.note || "Ghi chú cá nhân cho sản phẩm này?"}</Text>
                      <Tooltip title="Ghi chú riêng tư">
                        <QuestionCircleOutlined style={{ color: token.colorTextTertiary }} />
                      </Tooltip>
                    </Space>
                  </Col>
                </Row>
              </Col>
            </Row>
          </List.Item>
        );
        }}
      />
      <Modal
        title="Xuất Excel sản phẩm"
        open={exportOpen}
        okText="Xuất Excel"
        cancelText="Hủy"
        confirmLoading={exporting}
        onOk={handleExport}
        onCancel={() => setExportOpen(false)}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text type="secondary">Nhập mã PIN/secret để xuất danh sách sản phẩm.</Text>
          <Input.Password
            value={exportSecret}
            onChange={(event) => setExportSecret(event.target.value)}
            onPressEnter={handleExport}
            placeholder="PIN/secret"
          />
        </Space>
      </Modal>
    </>
  );
};
