import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Flex,
  Form,
  Image,
  Input,
  List,
  Pagination,
  Popconfirm,
  Row,
  Skeleton,
  Space,
  Typography,
  theme,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { moneyCeil, moneyFormat } from "@repo/util";
import { useProfileSavedProductsPage } from "../hooks/useProfileSavedProductsPage";

type ProfileSavedProductsContentProps = {
  t: (key: string) => string;
};

const emptyText = "---";

const getProductName = (item: any) =>
  item.name || item.productName || item.title || item.originalName || emptyText;

const getProductImage = (item: any) =>
  item.variantImage || item.productImage || item.image || item.imageUrl || item.thumbnail;

const getMerchantName = (item: any) =>
  item.merchant?.name || item.merchant?.code || item.shopName || item.merchantName || emptyText;

const getProperties = (item: any) =>
  Array.isArray(item.variantProperties)
    ? item.variantProperties.map((property: any) => property.value || property.originalValue).filter(Boolean)
    : [];

export const ProfileSavedProductsContent = ({ t }: ProfileSavedProductsContentProps) => {
  const { token } = theme.useToken();
  const logic = useProfileSavedProductsPage(t);

  const renderProduct = (item: any) => {
    const image = getProductImage(item);
    const editing = !!logic.editingIds[item.id] || !item.note;
    const draft = logic.editingNotes[item.id] ?? item.note ?? "";
    const price = item.exchangedSalePrice ?? item.price ?? item.salePrice;
    const originalPrice = item.salePrice;
    const originalCurrency = item.currency?.code || item.currencyCode || "CNY";

    return (
      <List.Item style={{ padding: `${token.paddingMD}px ${token.paddingLG}px` }}>
        <Row gutter={[token.marginMD, token.marginMD]} style={{ width: "100%" }}>
          <Col xs={24} lg={8}>
            <Space align="start">
              {item.productUrl ? (
                <a href={item.productUrl} target="_blank" rel="noreferrer">
                  <Image
                    width={48}
                    height={48}
                    preview={false}
                    src={image}
                    fallback=""
                    style={{ objectFit: "cover" }}
                  />
                </a>
              ) : image ? (
                <Image
                  width={48}
                  height={48}
                  preview={false}
                  src={image}
                  fallback=""
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <Avatar shape="square" size={48} icon={<ShoppingCartOutlined />} />
              )}
              <Space direction="vertical" size={token.marginXXS}>
                {item.productUrl ? (
                  <Typography.Link href={item.productUrl} target="_blank">
                    {getProductName(item)}
                  </Typography.Link>
                ) : (
                  <Typography.Text strong>{getProductName(item)}</Typography.Text>
                )}
                <Space size={token.marginXS}>
                  {item.merchant?.marketplace?.image && (
                    <Avatar shape="square" size={16} src={item.merchant.marketplace.image} />
                  )}
                  {item.merchant?.url ? (
                    <Typography.Link href={item.merchant.url} target="_blank">
                      {getMerchantName(item)}
                    </Typography.Link>
                  ) : (
                    <Typography.Text type="secondary">{getMerchantName(item)}</Typography.Text>
                  )}
                </Space>
                <Typography.Text type="secondary">
                  {getProperties(item).join("  ") || emptyText}
                </Typography.Text>
              </Space>
            </Space>
          </Col>
          <Col xs={24} lg={4}>
            <Typography.Text>
              {item.createdAt ? dayjs(item.createdAt).format("HH:mm DD/MM/YYYY") : emptyText}
            </Typography.Text>
          </Col>
          <Col xs={24} lg={7}>
            {editing ? (
              <Space direction="vertical" size={token.marginXXS} style={{ width: "100%" }}>
                <Input.TextArea
                  value={draft}
                  maxLength={1000}
                  autoSize={{ minRows: 1, maxRows: 3 }}
                  placeholder={t("order.remark")}
                  onChange={(event) => logic.updateNoteDraft(item.id, event.target.value)}
                  onBlur={() => logic.saveNote(item)}
                  onKeyDown={(event) => {
                    if (
                      (event.metaKey || event.shiftKey || event.altKey || event.ctrlKey) &&
                      event.key === "Enter"
                    ) {
                      logic.saveNote(item);
                    }
                  }}
                />
                <Typography.Text type="secondary">
                  {t("order.note_keydown")}
                </Typography.Text>
              </Space>
            ) : (
              <Space align="start">
                <Typography.Paragraph style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>
                  {item.note}
                </Typography.Paragraph>
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => logic.startEdit(item)}
                />
              </Space>
            )}
          </Col>
          <Col xs={18} lg={3} style={{ textAlign: "right" }}>
            <Space direction="vertical" size={0}>
              <Typography.Text strong>
                {price != null ? moneyFormat(moneyCeil(price), "VND") : emptyText}
              </Typography.Text>
              {originalPrice != null && (
                <Typography.Text type="secondary">
                  {moneyFormat(originalPrice, originalCurrency)}
                </Typography.Text>
              )}
            </Space>
          </Col>
          <Col xs={6} lg={2} style={{ textAlign: "right" }}>
            <Popconfirm
              placement="topRight"
              title={t("message.delete_confirm")}
              okText={t("button.agree")}
              cancelText={t("button.disagree")}
              onConfirm={() => logic.deleteItem(item.id)}
            >
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                loading={logic.deletingId === item.id}
              >
                {t("button.delete")}
              </Button>
            </Popconfirm>
          </Col>
        </Row>
      </List.Item>
    );
  };

  return (
    <Space direction="vertical" size={token.marginMD} style={{ width: "100%" }}>
      <Card styles={{ body: { padding: token.paddingLG } }}>
        <Form form={logic.form} layout="vertical" onFinish={logic.handleSearch}>
          <Row gutter={[token.marginMD, token.marginSM]}>
            <Col xs={24} md={12}>
              <Form.Item name="query" label={t("customer_info.input_product")}>
                <Input allowClear onPressEnter={logic.handleSearch} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={t("customer_info.time")}>
                <Space.Compact style={{ width: "100%" }}>
                  <Form.Item name="createdFrom" noStyle>
                    <DatePicker
                      format="DD/MM/YYYY"
                      placeholder={t("customer_info.start_date")}
                      style={{ width: "50%" }}
                    />
                  </Form.Item>
                  <Form.Item name="createdTo" noStyle>
                    <DatePicker
                      format="DD/MM/YYYY"
                      placeholder={t("customer_info.end_date")}
                      style={{ width: "50%" }}
                    />
                  </Form.Item>
                </Space.Compact>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Flex justify="end" gap={token.marginSM}>
                <Button icon={<ReloadOutlined />} onClick={logic.handleReset}>
                  {t("order.filter_refresh")}
                </Button>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  {t("customer_info.search")}
                </Button>
              </Flex>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card styles={{ body: { padding: 0 } }}>
        <div
          style={{
            padding: `${token.paddingMD}px ${token.paddingLG}px`,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Typography.Text strong>
            {t("customer_info.saved_product_list")} ({logic.total.toLocaleString()})
          </Typography.Text>
        </div>
        <Row
          style={{
            padding: `${token.paddingSM}px ${token.paddingLG}px`,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Col xs={24} lg={8}>{t("order.products")}</Col>
          <Col xs={24} lg={4}>{t("customer_info.saved_day")}</Col>
          <Col xs={24} lg={7}>{t("customer_info.note")}</Col>
          <Col xs={24} lg={3} style={{ textAlign: "right" }}>{t("customer_info.price")}</Col>
          <Col xs={0} lg={2} />
        </Row>

        {logic.isLoading ? (
          <div style={{ padding: token.paddingLG }}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
        ) : logic.products.length ? (
          <List dataSource={logic.products} renderItem={renderProduct} />
        ) : (
          <div style={{ padding: token.paddingXL }}>
            <Empty description={t("message.empty")} />
          </div>
        )}
      </Card>

      <Pagination
        hideOnSinglePage
        showQuickJumper
        current={logic.page}
        pageSize={logic.pageSize}
        total={logic.total}
        onChange={logic.setPage}
        style={{ textAlign: "center" }}
      />
    </Space>
  );
};
