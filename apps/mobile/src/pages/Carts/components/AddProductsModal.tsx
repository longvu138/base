import { useMemo, useState } from "react";
import {
  App,
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Row,
  Segmented,
  Space,
  Typography,
  Upload,
} from "antd";
import {
  InboxOutlined,
  MinusOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useTranslation } from "@repo/i18n";
import {
  useAddCartSkusMutation,
  useCreateCartProductMutation,
  useFetchAlibabaProductMutation,
  useFetchTaobaoProductMutation,
  useImportCartProductsMutation,
  useResolveMarketplaceShortLinkMutation,
  useTrackAddToCartMutation,
} from "@repo/hooks";
import { formatCurrency } from "@repo/util";
import * as XLSX from "xlsx";

type AddMode = "manual" | "excel" | "link";

type Props = {
  open: boolean;
  onClose: () => void;
};

const getMarketplaceInfo = (input: string) => {
  const extracted = input.match(/https?:\/\/[^\s]+/)?.[0] || input;
  try {
    const url = new URL(extracted);
    if (url.hostname === "qr.1688.com") {
      return { marketplace: "1688-mobile", originalUrl: extracted };
    }
    if (url.hostname.endsWith("m.tb.cn") || url.hostname.endsWith("e.tb.cn")) {
      return { marketplace: "taobao-mobile", originalUrl: extracted };
    }
    if (url.hostname.includes("1688.com")) {
      return {
        marketplace: "1688",
        id: url.pathname.match(/\/offer\/(\d+)\.html/)?.[1],
      };
    }
    if (
      url.hostname.includes("taobao.com") ||
      url.hostname.includes("tmall.com")
    ) {
      return {
        marketplace: "taobao",
        id: url.searchParams.get("id") || undefined,
      };
    }
  } catch {
    return null;
  }
  return null;
};

const getSkuRows = (product: any) => {
  if (!product) return [];
  if (product.marketplaceType === "1688" && product.productSkuInfos === null) {
    return [
      {
        skuId: product.id,
        specId: product.id,
        skuAttributes: [],
      },
    ];
  }
  if (Array.isArray(product.productSkuInfos)) return product.productSkuInfos;
  if (Array.isArray(product.skus)) return product.skus;
  return [
    {
      skuId: product.offerId || product.id,
      specId: product.offerId || product.id,
      skuAttributes: [],
    },
  ];
};

const normalizeAlibabaProduct = (product: any, id: string) => {
  if (
    product?.productSaleInfo?.priceRangeList?.length > 0 &&
    product.batchNumber === null &&
    product.productSkuInfos !== null
  ) {
    const consignPrice = product.productSaleInfo.priceRangeList[0]?.price;
    const productSkuInfos =
      product.productSkuInfos?.length > 0
        ? product.productSkuInfos.map((item: any) => ({
            ...item,
            consignPrice,
          }))
        : [
            {
              amountOnSale: product.productSaleInfo?.amountOnSale,
              cargoNumber: "",
              consignPrice: Number(consignPrice || 0),
              jxhyPrice: Number(consignPrice || 0),
              pfJxhyPrice: Number(consignPrice || 0),
              price: Number(consignPrice || 0),
              promotionPrice: Number(consignPrice || 0),
              skuAttributes: [
                {
                  attributeId: product?.productAttribute?.[0]?.attributeId,
                  attributeName: "Default",
                  attributeNameTrans: "",
                  skuImageUrl: null,
                  value: "",
                  valueTrans: "",
                },
              ],
              skuId: product.offerId,
              specId: product.offerId,
            },
          ];
    return { ...product, productSkuInfos, marketplaceType: "1688", id };
  }
  return { ...product, marketplaceType: "1688", id };
};

const isValidUrl = (value: unknown) => {
  if (typeof value !== "string") return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export const AddProductsModal = ({ open, onClose }: Props) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [mode, setMode] = useState<AddMode>("manual");
  const [file, setFile] = useState<File | null>(null);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [fileDisabled, setFileDisabled] = useState(false);
  const [validatingFile, setValidatingFile] = useState(false);
  const [excelImported, setExcelImported] = useState<any>(null);
  const [link, setLink] = useState("");
  const [product, setProduct] = useState<any>(null);
  const [fetching, setFetching] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [images, setImages] = useState<File[]>([]);
  const importMutation = useImportCartProductsMutation();
  const createProductMutation = useCreateCartProductMutation();
  const addSkusMutation = useAddCartSkusMutation();
  const fetchAlibabaProductMutation = useFetchAlibabaProductMutation();
  const fetchTaobaoProductMutation = useFetchTaobaoProductMutation();
  const resolveShortLinkMutation = useResolveMarketplaceShortLinkMutation();
  const trackAddToCartMutation = useTrackAddToCartMutation();
  const skuRows = useMemo(() => getSkuRows(product), [product]);
  const totalSelectedQuantity = Object.values(quantities).reduce(
    (sum, value) => sum + Number(value || 0),
    0,
  );
  const getDisplayPrice = (row: any) => {
    if (product?.marketplaceType === "1688") {
      let tierPrice = 0;
      product?.productSaleInfo?.priceRangeList?.forEach((range: any) => {
        if (range?.startQuantity <= totalSelectedQuantity) {
          tierPrice = range?.promotionPrice || range?.price;
        }
      });
      return tierPrice || row.price || Number(row.consignPrice || 0);
    }
    return Number(row.salePrice || 0) / 100;
  };
  const totalSelectedAmount = skuRows.reduce(
    (sum: number, row: any) =>
      sum + getDisplayPrice(row) * Number(quantities[row.skuId] || 0),
    0,
  );
  const changeQuantity = (skuId: string, value: number) => {
    setQuantities((current) => ({
      ...current,
      [skuId]: Math.max(0, Math.min(9999, value)),
    }));
  };

  const close = () => {
    setMode("manual");
    form.resetFields();
    setFile(null);
    setFileErrors([]);
    setFileDisabled(false);
    setValidatingFile(false);
    setExcelImported(null);
    setLink("");
    setProduct(null);
    setQuantities({});
    setImages([]);
    onClose();
  };

  const fetchProduct = async () => {
    const info = getMarketplaceInfo(link);
    if (!info) {
      message.error(t("cart.invalid_product_link"));
      return;
    }
    setFetching(true);
    try {
      let marketplace = info.marketplace;
      let productId = info.id;

      if (marketplace === "1688-mobile" || marketplace === "taobao-mobile") {
        const resolved = await resolveShortLinkMutation.mutateAsync({
          marketplace: marketplace === "1688-mobile" ? "alibaba" : "taobao",
          shortLink: info.originalUrl!,
        });
        const text = String(resolved.data);
        productId =
          marketplace === "1688-mobile"
            ? text.match(/offerId=([^&]+)/)?.[1] ||
              text.match(/offerId%3D(\d+)/)?.[1]
            : (() => {
                const resolvedUrl = text.match(
                  /var url = ['"]([^'"]+)['"]/,
                )?.[1];
                return (
                  resolvedUrl?.match(/itemIds=([^&]+)/)?.[1] ||
                  resolvedUrl?.match(/id=([^&]+)/)?.[1] ||
                  text.match(/itemIds=([^&]+)/)?.[1] ||
                  text.match(/id=([^&]+)/)?.[1]
                );
              })();
        marketplace = marketplace === "1688-mobile" ? "1688" : "taobao";
      }

      if (!productId) {
        message.error(t("cart.cannot_get_product_id"));
        return;
      }

      const res =
        marketplace === "1688"
          ? await fetchAlibabaProductMutation.mutateAsync(productId)
          : await fetchTaobaoProductMutation.mutateAsync(productId);
      setProduct(
        marketplace === "1688"
          ? { ...normalizeAlibabaProduct(res.data, productId), sourceUrl: link }
          : {
              ...res.data,
              marketplaceType: "taobao",
              sourceUrl: link,
              id: productId,
            },
      );
    } catch {
      message.error(t("cart.cannot_get_product_info"));
    } finally {
      setFetching(false);
    }
  };

  const submitExcel = async () => {
    if (!file) {
      message.error(t("cart.choose_excel_file"));
      return;
    }
    if (fileDisabled || fileErrors.some(Boolean)) return;
    const res = await importMutation.mutateAsync(file);
    setExcelImported(res.data);
    message.success(t("cart.excel_import_success"));
    window.location.reload();
  };

  const validateExcelFile = async (nextFile: File) => {
    setFile(nextFile);
    setFileErrors([]);
    setFileDisabled(false);
    setExcelImported(null);
    setValidatingFile(true);

    try {
      const buffer = await nextFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array", sheets: 0 });
      const firstWorksheet = workbook.Sheets[workbook.SheetNames[0]];

      if (!firstWorksheet) {
        setFileDisabled(true);
        message.error(t("cart.excel_sheet_not_found"));
        return;
      }

      const data = XLSX.utils.sheet_to_json<Record<string, any>>(
        firstWorksheet,
        {
          range: 8,
          header: "A",
        },
      );

      const nextErrors = data.map((item: Record<string, any>) => {
        const errors: string[] = [];

        if (!item.D?.toString().trim()) {
          errors.push(t("cart.excel_column_required", { column: "D" }));
        }

        if (!item.G?.toString().trim()) {
          errors.push(t("cart.excel_column_required", { column: "G" }));
        } else if (Number.isNaN(Number(item.G)) || Number(item.G) < 1) {
          errors.push(t("cart.excel_column_invalid", { column: "G" }));
        }

        if (!item.K?.toString().trim()) {
          errors.push(t("cart.excel_column_required", { column: "K" }));
        } else if (Number.isNaN(Number(item.K)) || Number(item.K) <= 0) {
          errors.push(t("cart.excel_column_invalid", { column: "K" }));
        }

        if (!item.N?.toString().trim()) {
          errors.push(t("cart.excel_column_required", { column: "N" }));
        }

        if (!item.Q?.toString().trim()) {
          errors.push(t("cart.excel_column_required", { column: "Q" }));
        } else if (!isValidUrl(item.Q)) {
          errors.push(t("cart.excel_column_invalid_link", { column: "Q" }));
        }

        return errors.join(", ");
      });

      setFileErrors(nextErrors);
    } catch {
      setFileDisabled(true);
      message.error(t("cart.excel_read_error"));
    } finally {
      setValidatingFile(false);
    }
  };

  const submitManual = async () => {
    const values = await form.validateFields();
    const payload = {
      merchantName: values.merchantName,
      originalName: values.originalName,
      url: values.url,
      variantProperties: [
        {
          id: "1",
          originalValue: values.color,
          originalName: "Màu Sắc",
        },
        {
          id: "2",
          originalValue: values.size,
          originalName: "Kích Thước",
        },
      ],
      quantity: values.quantity,
      salePrice: values.salePrice,
    };
    await createProductMutation.mutateAsync({ payload, images });
    message.success(t("cart.manual_add_success"));
    window.location.reload();
  };

  const submitLink = async () => {
    const selectedRows = skuRows.filter(
      (row: any) => Number(quantities[row.skuId]) > 0,
    );
    if (!product || selectedRows.length === 0) {
      message.error(t("cart.select_sku_quantity"));
      return;
    }
    if (totalSelectedQuantity < Number(product?.minOrderQuantity || 1)) {
      message.error(t("cart.min_order_quantity", { value: product.minOrderQuantity }));
      return;
    }

    const skus = selectedRows.map((row: any) => {
      const is1688 = product.marketplaceType === "1688";
      const attributes = is1688
        ? row.skuAttributes || []
        : row.variantProperties || [];
      const totalQuantity = Object.values(quantities).reduce(
        (sum, value) => sum + Number(value || 0),
        0,
      );
      let tierPrice = 0;
      product?.productSaleInfo?.priceRangeList?.forEach((range: any) => {
        if (range?.startQuantity <= totalQuantity) {
          tierPrice = range?.promotionPrice || range?.price;
        }
      });
      const originalPrice = is1688
        ? product?.productSaleInfo?.priceRangeList?.length > 1
          ? tierPrice || row.price || Number(row.consignPrice || 0)
          : row.price || Number(row.consignPrice || 0)
        : Number(row.salePrice || 0) / 100;
      return {
        name: is1688 ? product.subject : product.title,
        originalName: is1688 ? product.subject : product.title,
        originalPrice,
        salePrice: originalPrice,
        pricePolicy:
          is1688 && product?.productSaleInfo?.priceRangeList?.length > 1
            ? product.productSaleInfo.priceRangeList
            : [],
        currency: "CNY",
        merchant: {
          id: is1688 ? product.sellerOpenId : product?.merchant?.id,
          name: is1688 ? product.sellerOpenId : product?.merchant?.name,
          marketplace: is1688 ? "1688" : "taobao",
        },
        image: is1688
          ? product?.productImage?.images?.[0]
          : product?.productImages?.[0],
        url: product.sourceUrl,
        variantImage: is1688
          ? row?.skuAttributes?.[0]?.skuImageUrl ||
            product?.productImage?.images?.[0]
          : row?.images?.[0],
        variantProperties: attributes.map((item: any) => ({
          id: item.id || item.value,
          originalName: item.originalName || item.attributeName,
          originalValue: item.originalValue || item.value,
        })),
        batchSize: 1,
        quantity: quantities[row.skuId],
        stock: product.stock || 999,
        originalId: is1688 ? product.offerId : product.id,
        minQuantity: product.minOrderQuantity || 1,
        skuId: row.skuId,
        specId: row.specId,
        brand: "",
        totalRate: null,
      };
    });

    await addSkusMutation.mutateAsync({ skus });
    await trackAddToCartMutation.mutateAsync();
    message.success(t("cart.link_add_success"));
    window.location.reload();
  };

  return (
    <Modal
      title={t("button.add_products")}
      open={open}
      onCancel={close}
      width={1000}
      centered
      styles={{
        body: {
          maxHeight: "calc(100vh - 220px)",
          overflowY: "auto",
          overflowX: "hidden",
        },
      }}
      footer={
        <Flex justify="end" gap={8}>
          <Button onClick={close}>{t("button.cancel")}</Button>
          <Button
            type="primary"
            loading={
              createProductMutation.isPending ||
              validatingFile ||
              importMutation.isPending ||
              addSkusMutation.isPending
            }
            onClick={
              mode === "manual"
                ? submitManual
                : mode === "excel"
                  ? submitExcel
                  : product
                    ? submitLink
                    : fetchProduct
            }
            disabled={
              mode === "link" &&
              !!product &&
              (totalSelectedQuantity < Number(product?.minOrderQuantity || 1) ||
                totalSelectedQuantity === 0)
            }
          >
            {t("taobaoGlobalCart.addToCart")}
          </Button>
        </Flex>
      }
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Segmented
          block
          value={mode}
          onChange={(value) => setMode(value as AddMode)}
          options={[
            { label: t("cart.add_product_tab_manual"), value: "manual" },
            { label: t("cart.add_product_tab_excel"), value: "excel" },
            { label: t("cart.add_product_tab_link"), value: "link" },
          ]}
          size="middle"
        />

        {mode === "manual" ? (
          <Form form={form} layout="vertical">
            <Card size="small" title={t("cartCheckout.product_info")}>
              <Row gutter={[16, 0]}>
                <Col span={12}>
                  <Form.Item
                    name="merchantName"
                    label={t("cartCheckout.seller")}
                    rules={[{ required: true, message: t("cart.input_seller") }]}
                  >
                    <Input placeholder={t("cart.input_placeholder")} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="originalName"
                    label={t("cart.original_name")}
                    rules={[{ required: true, message: t("cart.input_product_name") }]}
                  >
                    <Input placeholder={t("cart.input_placeholder")} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="url"
                label={t("cart.product_link")}
                rules={[
                  { required: true, message: t("cart.input_product_link") },
                  { type: "url", message: t("cart.invalid_product_link") },
                ]}
              >
                <Input placeholder={t("cart.input_placeholder")} />
              </Form.Item>
            </Card>

            <Divider />

            <Card size="small" title={t("cart.attribute_price")}>
              <Row gutter={[16, 0]}>
                <Col span={12}>
                  <Form.Item name="color" label={t("cart.color")}>
                    <Input placeholder={t("cart.input_placeholder")} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="size" label={t("cart.size")}>
                    <Input placeholder={t("cart.input_placeholder")} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="quantity"
                    label={t("cartGroup.quantity")}
                    rules={[{ required: true, message: t("cart.input_quantity") }]}
                  >
                    <InputNumber min={1} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="salePrice"
                    label={t("cart.price")}
                    rules={[{ required: true, message: t("cart.input_price") }]}
                  >
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Divider />

            <Card size="small" title={t("cart.product_image")}>
              <Upload.Dragger
                accept="image/*"
                maxCount={5}
                multiple
                beforeUpload={(nextFile) => {
                  setImages((current) => [...current, nextFile]);
                  return false;
                }}
                onRemove={(removedFile) => {
                  const removedOrigin = removedFile.originFileObj;
                  setImages((current) =>
                    current.filter((file) =>
                      removedOrigin
                        ? file !== removedOrigin
                        : file.name !== removedFile.name,
                    ),
                  );
                }}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  {t("cart.drag_image")}
                </p>
              </Upload.Dragger>
            </Card>
          </Form>
        ) : mode === "excel" ? (
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Upload.Dragger
              accept=".xlsx,.xls"
              maxCount={1}
              beforeUpload={(nextFile) => {
                void validateExcelFile(nextFile);
                return false;
              }}
              onRemove={() => {
                setFile(null);
                setFileErrors([]);
                setFileDisabled(false);
                setExcelImported(null);
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                {t("cart.drag_file")}
              </p>
              <Space direction="vertical" size={4}>
                <Typography.Text type="secondary">
                  {t("cart.excel_validation_hint")}
                </Typography.Text>
                <Typography.Text type="secondary">{t("common.or")}</Typography.Text>
                <Button
                  href="//cdn.gobiz.vn/import_product_to_cart.xlsx"
                  type="primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t("cart.download_template")}
                </Button>
              </Space>
            </Upload.Dragger>
            {fileErrors.some(Boolean) && (
              <Alert
                type="error"
                showIcon
                message={t("cart.invalid_excel_file")}
                description={
                  <Space direction="vertical" size={4}>
                    {fileErrors.map((error, index) =>
                      error ? (
                        <Typography.Text key={index} type="danger">
                          {t("cart.row_error", { value: index + 9 })}: {error}
                        </Typography.Text>
                      ) : null,
                    )}
                  </Space>
                }
              />
            )}
            {excelImported?.errorCells?.length > 0 && (
              <Alert
                type="error"
                showIcon
                message={t("cart.error_cells", {
                  value: excelImported.errorCells.join(", "),
                })}
              />
            )}
          </Space>
        ) : (
          <Space direction="vertical" size="middle" className="w-full">
            <Input.Search
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder={t("cart.input_placeholder")}
              enterButton={t("taobaoGlobalCart.findProduct")}
              loading={fetching}
              onSearch={fetchProduct}
            />
            {product && (
              <Row
                gutter={[24, 24]}
                style={{
                  marginLeft: 0,
                  marginRight: 0,
                  overflowX: "hidden",
                  width: "100%",
                }}
              >
                <Col xs={24} md={10} style={{ minWidth: 0, paddingLeft: 0 }}>
                  <Image
                    width="100%"
                    preview={false}
                    src={
                      product?.productImage?.images?.[0] ||
                      product?.productImages?.[0]
                    }
                  />
                </Col>
                <Col xs={24} md={14} style={{ minWidth: 0, paddingRight: 0 }}>
                  <Space
                    direction="vertical"
                    size="middle"
                    style={{ width: "100%", minWidth: 0, overflowX: "hidden" }}
                  >
                    <Typography.Text
                      strong
                      ellipsis
                      style={{
                        display: "block",
                        fontSize: 16,
                        maxWidth: "100%",
                      }}
                    >
                      {product.subject || product.title}
                    </Typography.Text>
                    {product?.productSaleInfo?.priceRangeList?.length > 1 && (
                      <Flex justify="space-between" gap={8} wrap>
                        {product.productSaleInfo.priceRangeList.map(
                          (range: any) => (
                            <Space
                              key={range.startQuantity}
                              direction="vertical"
                              size={0}
                            >
                              <Typography.Text type="secondary">
                                {t("cart.quantity_from")}: {range.startQuantity}
                              </Typography.Text>
                              <Typography.Text>
                                {t("cart.price")}:{" "}
                                {formatCurrency(
                                  range.promotionPrice || range.price,
                                  "CNY",
                                )}
                              </Typography.Text>
                            </Space>
                          ),
                        )}
                      </Flex>
                    )}
                    <div
                      style={{
                        maxHeight: 340,
                        overflowY: "auto",
                        overflowX: "hidden",
                      }}
                    >
                      {skuRows.map((row: any) => {
                        const attributes =
                          row?.skuAttributes || row?.variantProperties || [];
                        const previewImage =
                          row?.skuAttributes?.[0]?.skuImageUrl ||
                          row?.images?.[0];
                        const step = product?.batchNumber || 1;
                        return (
                          <Flex
                            key={row.skuId}
                            align="center"
                            gap={12}
                            wrap
                            style={{
                              padding: "8px 0",
                              borderBottom: "1px solid rgba(5,5,5,0.06)",
                              minWidth: 0,
                              width: "100%",
                            }}
                          >
                            <Flex
                              align="center"
                              gap={8}
                              style={{
                                flex: "1 1 180px",
                                minWidth: 0,
                                overflow: "hidden",
                              }}
                            >
                              {previewImage ? (
                                <Image
                                  width={60}
                                  height={60}
                                  preview={false}
                                  src={previewImage}
                                />
                              ) : (
                                <Avatar
                                  shape="square"
                                  size={60}
                                  icon={<ShoppingCartOutlined />}
                                />
                              )}
                              <Space
                                direction="vertical"
                                size={2}
                                style={{
                                  minWidth: 0,
                                  maxWidth: "100%",
                                  overflow: "hidden",
                                }}
                              >
                                {attributes.length > 0 ? (
                                  attributes.map(
                                    (attribute: any, index: number) => (
                                      <Typography.Text
                                        key={attribute.id || index}
                                        ellipsis
                                        style={{ maxWidth: "100%" }}
                                      >
                                        {attribute.attributeName ||
                                          attribute.originalName}
                                        :{" "}
                                        {attribute.value ||
                                          attribute.originalValue}
                                      </Typography.Text>
                                    ),
                                  )
                                ) : (
                                  <Typography.Text>{t("customerAddress.default")}</Typography.Text>
                                )}
                              </Space>
                            </Flex>
                            <Typography.Text
                              style={{
                                flex: "0 0 84px",
                                textAlign: "center",
                              }}
                            >
                              {formatCurrency(getDisplayPrice(row), "CNY")}
                            </Typography.Text>
                            <Flex
                              align="center"
                              gap={4}
                              style={{ flex: "0 0 auto" }}
                            >
                              <Button
                                icon={<MinusOutlined />}
                                onClick={() =>
                                  changeQuantity(
                                    row.skuId,
                                    Number(quantities[row.skuId] || 0) - step,
                                  )
                                }
                              />
                              <InputNumber
                                min={0}
                                max={9999}
                                controls={false}
                                value={quantities[row.skuId] || 0}
                                disabled={Number(product?.batchNumber || 1) > 1}
                                onChange={(value) =>
                                  changeQuantity(row.skuId, Number(value || 0))
                                }
                                style={{ width: 88 }}
                              />
                              <Button
                                icon={<PlusOutlined />}
                                onClick={() =>
                                  changeQuantity(
                                    row.skuId,
                                    Number(quantities[row.skuId] || 0) + step,
                                  )
                                }
                              />
                            </Flex>
                          </Flex>
                        );
                      })}
                    </div>
                    <Flex justify="space-between" align="start" gap={12} wrap>
                      <Space direction="vertical" size={0}>
                        <Typography.Text>
                          {t("cart.total_quantity")}: {totalSelectedQuantity} {t("cartCheckout.product")}
                        </Typography.Text>
                        {product?.batchNumber > 1 && (
                          <Typography.Text type="warning">
                            {t("cart.batch_required", { value: product.batchNumber })}
                          </Typography.Text>
                        )}
                      </Space>
                      <Space direction="vertical" size={0} align="end">
                        <Typography.Text>
                          {t("taobaoGlobalCart.money")}:{" "}
                          {formatCurrency(totalSelectedAmount, "CNY")}
                        </Typography.Text>
                        {product?.minOrderQuantity > 1 && (
                          <Typography.Text type="danger">
                            {t("cart.min_order_quantity", { value: product.minOrderQuantity })}
                          </Typography.Text>
                        )}
                      </Space>
                    </Flex>
                  </Space>
                </Col>
              </Row>
            )}
          </Space>
        )}
      </Space>
    </Modal>
  );
};
