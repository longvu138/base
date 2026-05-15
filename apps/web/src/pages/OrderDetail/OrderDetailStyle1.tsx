import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftOutlined,
  ArrowsAltOutlined,
  BankOutlined,
  ShrinkOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Image,
  Layout,
  Row,
  Skeleton,
  Space,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  theme,
} from "antd";
import { useTranslation } from "react-i18next";
import { ChatPanel } from "../../components/Common/ChatPanel";
import { ClaimTab } from "./tabs/ClaimTab";
import { FeeTab } from "./tabs/FeeTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { LogTab } from "./tabs/LogTab";
import { PackageTab } from "./tabs/PackageTab";
import { ProductTab } from "./tabs/ProductTab";
import { TransactionTab } from "./tabs/TransactionTab";
import {
  displayMoney,
  displayPercent,
  displayValue,
  displayYuan,
  useOrderDetailPage,
} from "./hooks/useOrderDetailPage";

const { Text, Paragraph } = Typography;

const editableTextStyle = {
  marginBottom: 0,
  minHeight: 24,
};

const formatWeight = (value: any) => {
  if (value === null || value === undefined || value === "") return "---";
  return `${Number(value).toLocaleString("vi-VN")}kg`;
};

const formatVolume = (value: any) => {
  if (value === null || value === undefined || value === "") return "---";
  return `${Number(value).toLocaleString("vi-VN")}cm3`;
};

const formatAddress = (address: any) => {
  if (!address) return "---";

  if (typeof address === "string") return address;

  const parts = [
    address.fullname,
    address.phone,
    address.detail || address.address,
    address.location?.display,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" / ") : "---";
};

const renderServiceList = (services: any, fallback: string) => {
  if (!Array.isArray(services) || services.length === 0) return fallback;

  return services.map((service: any, index: number) => (
    <Text
      key={`${service.code || service.name || index}`}
      type={service.approved === null ? "warning" : undefined}
      delete={service.approved === false}
    >
      {service.name || service}
      {index < services.length - 1 ? ", " : ""}
    </Text>
  ));
};

const InfoLine = ({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) => (
  <Row>
    <Col span={24}>
      <Space align="start" size={4} wrap>
        <Text type="secondary">{label}:</Text>
        <span>{children}</span>
      </Space>
    </Col>
  </Row>
);

export const OrderDetailStyle1 = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [isExpand, setIsExpand] = useState(true);
  const {
    activeTab,
    code,
    detailQuery,
    handleTabChange,
    handleUpdate,
    isUpdating,
    navigate,
    order,
    services,
    statusInfo,
  } = useOrderDetailPage();

  if (detailQuery.isLoading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 14 }} />
      </Card>
    );
  }

  if (detailQuery.isError || !order) {
    return (
      <Card>
        <Empty
          image={
            <ShoppingCartOutlined
              style={{ color: token.colorTextTertiary, fontSize: 48 }}
            />
          }
          description={t("orderDetail.not_found")}
        >
          <Button type="primary" onClick={() => navigate("/orders")}>
            {t("orderDetail.back_to_orders")}
          </Button>
        </Empty>
      </Card>
    );
  }

  const merchantName =
    order.merchantName ||
    order.merchantCode ||
    order.shopName ||
    order.shop?.name;
  const marketplaceImage = order.marketplace?.image;
  const customerCode = order.refCustomerCode || order.customerCode || "";
  const customerOrderCode = order.refOrderCode || order.customerOrderCode || "";
  const needPay = order.totalUnpaid ?? order.grandTotal;
  const baseAddress =
    order.address || order.shippingAddress || order.deliveryAddress;
  const receiptAddress = order.receiptAddress;
  const exchangeRate = order.exchangeRate
    ? `¥1 = ${Number(order.exchangeRate).toLocaleString("vi-VN")} ₫`
    : "---";
  const canCancelOrder = Boolean(statusInfo?.cancellable);

  const metricRow1 = [
    {
      label: t("orderDetail.member"),
      value:
        order.customerGroup?.name ||
        order.customerLevel?.name ||
        order.customer?.username ||
        "---",
      span: 5,
    },
    {
      label: t("orderDetail.deposit_rate"),
      value:
        order.emdPercent != null
          ? `${order.emdPercent}%`
          : displayPercent(order.depositRate),
      span: 5,
    },
    {
      label: t("orderDetail.costing_weight"),
      value: formatWeight(order.actualWeight || order.chargeableWeight),
      span: 5,
    },
    {
      label: t("orderDetail.net_weight"),
      value: formatWeight(order.netWeight || order.actualWeight),
      span: 5,
    },
    {
      label: t("orderDetail.packaging_weight"),
      value: formatWeight(order.packagingWeight || order.packageWeight),
      span: 4,
    },
  ];

  const metricRow2 = [
    {
      label: t("orderDetail.dimensional_weight"),
      value: formatWeight(order.dimensionalWeight || order.convertedWeight),
      span: 5,
    },
    {
      label: t("orderDetail.volume"),
      value: formatVolume(order.volumetric || order.totalVolume),
      span: 5,
    },
    {
      label: t("orderDetail.exchange_rate"),
      value: exchangeRate,
      span: 5,
    },
    ...(order.exchangedDiscountAmount ||
      order.discountAmount ||
      order.supplierDiscount
      ? [
        {
          label: t("orderDetail.supplier_discount"),
          value: `${displayMoney(order.exchangedDiscountAmount || order.supplierDiscount)}${order.discountAmount
            ? ` (${displayYuan(order.discountAmount)})`
            : ""
            }`,
          span: 5,
        },
      ]
      : []),
    ...(order.contractWithShopkeeper
      ? [
        {
          label: t("orderDetail.contract_with_shopkeeper"),
          value: displayValue(order.loanCreditStatus || order.contractStatus),
          span: 4,
        },
      ]
      : []),
  ];

  const tabItems = [
    {
      key: "products",
      label: t("orderDetail.products"),
      children: <ProductTab orderCode={code} order={order} />,
    },
    {
      key: "fees",
      label: t("orderDetail.financial"),
      children: (
        <FeeTab orderCode={code} order={order} statusInfo={statusInfo} />
      ),
    },
    ...(order.contractWithShopkeeper
      ? [
        {
          key: "credit",
          label: t("orderDetail.credit"),
          children: (
            <Empty
              image={
                <BankOutlined
                  style={{ color: token.colorTextTertiary, fontSize: 36 }}
                />
              }
              description={t("orderDetail.empty_credit")}
            />
          ),
        },
      ]
      : []),
    {
      key: "packages",
      label: t("orderDetail.packages"),
      children: <PackageTab orderCode={code} />,
    },
    {
      key: "financial",
      label: t("orderDetail.transactions"),
      children: <TransactionTab orderCode={code} />,
    },
    {
      key: "tickets",
      label: t("orderDetail.claims"),
      children: <ClaimTab orderCode={code} />,
    },
    {
      key: "history",
      label: t("orderDetail.history"),
      children: <HistoryTab orderCode={code} />,
    },
    {
      key: "log",
      label: t("orderDetail.log"),
      children: <LogTab orderCode={code} order={order} />,
    },
  ];

  return (
    <Layout style={{ background: "transparent" }}>
      <Row gutter={[token.marginLG, token.marginLG]} align="top">
        <Col xs={24} xl={17}>
          <Space
            direction="vertical"
            size={token.marginMD}
            style={{ width: "100%" }}
          >
            <Flex
              justify="space-between"
              align="center"
              wrap="wrap"
              gap={token.marginSM}
            >
              <Link to="/orders">
                <Space>
                  <ArrowLeftOutlined />
                  <Text>{t("orderDetail.order_list")}</Text>
                </Space>
              </Link>
              <Button type="primary" ghost>
                {t("orderDetail.re_order")}
              </Button>
            </Flex>

            {order.deliveryNotice && (
              <Alert
                type="success"
                showIcon
                message={<Text strong>{t("orders.notice.title")}</Text>}
                description={
                  <Text>
                    {t("orderDetail.delivery_notice_1")}{" "}
                    <Link to="/delivery/create">
                      {t("orderDetail.delivery_notice_2")}
                    </Link>{" "}
                    {t("orderDetail.delivery_notice_3")}
                  </Text>
                }
              />
            )}

            <Card style={{ borderTop: `3px solid ${token.colorSuccess}` }}>
              <Row gutter={[token.marginMD, token.marginMD]} align="middle">
                <Col xs={24} lg={18}>
                  <Flex gap={token.marginLG} align="center" wrap="wrap">
                    <Space size={token.marginSM}>
                      <Image
                        src={order?.image}
                        width={44}
                        height={44}
                        preview={false}
                        fallback="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                        style={{
                          background: token.colorFillTertiary,
                          borderRadius: token.borderRadius,
                          objectFit: "cover",
                        }}
                        referrerPolicy="no-referrer"
                      />
                      <Space direction="vertical" size={4}>
                        <Text strong>#{displayValue(order.code)}</Text>
                        <Tag color={statusInfo?.color || "default"}>
                          {statusInfo?.name || displayValue(order.status)}
                        </Tag>
                      </Space>
                    </Space>

                    <Space
                      direction="vertical"
                      size={4}
                      style={{ minWidth: 0 }}
                    >
                      <Space size={token.marginXS} wrap={false}>
                        <Text type="secondary">
                          {t("orderDetail.total_cost")}:
                        </Text>
                        <Text
                          strong
                          style={{
                            fontSize: token.fontSizeLG,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {displayMoney(order.grandTotal)}
                        </Text>
                      </Space>
                      <Space size={token.marginXS}>
                        {marketplaceImage && (
                          <img
                            width={14}
                            height={14}
                            src={marketplaceImage}
                            alt="img"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <Text type="secondary">{t("orderDetail.seller")}:</Text>
                        <Tooltip
                          title={merchantName}
                          color={token.colorPrimary}
                        >
                          <Text strong ellipsis style={{ maxWidth: 280 }}>
                            {displayValue(merchantName)}
                          </Text>
                        </Tooltip>
                      </Space>
                    </Space>
                  </Flex>
                </Col>
                <Col xs={24} lg={6}>
                  <Flex justify="flex-end" gap={token.marginSM} wrap="wrap">
                    <Link to={`/tickets/create?orderCode=${order.code}`}>
                      <Button>{t("orderDetail.complaint_order")}</Button>
                    </Link>
                    {canCancelOrder && (
                      <Button danger ghost>
                        {t("orderDetail.cancel_order")}
                      </Button>
                    )}
                  </Flex>
                </Col>
              </Row>

              {isExpand && (
                <>
                  <Divider />
                  <Row gutter={[token.marginSM, token.marginMD]}>
                    {metricRow1.map((item) => (
                      <Col key={item.label} xs={12} md={8} xl={item.span}>
                        <Text type="secondary">{item.label}</Text>
                        <Paragraph strong style={{ marginBottom: 0 }}>
                          {item.value}
                        </Paragraph>
                      </Col>
                    ))}
                  </Row>
                  <Row
                    gutter={[token.marginSM, token.marginMD]}
                    style={{ marginTop: token.marginMD }}
                  >
                    {metricRow2.map((item) => (
                      <Col key={item.label} xs={12} md={8} xl={item.span}>
                        <Text type="secondary">{item.label}</Text>
                        <Paragraph strong style={{ marginBottom: 0 }}>
                          {item.value}
                        </Paragraph>
                      </Col>
                    ))}
                  </Row>

                  {needPay > 0 && (
                    <>
                      {order.contractWithShopkeeper && (
                        <>
                          <Divider />
                          <InfoLine label={t("orderDetail.bifin")}>
                            <Text strong style={{ color: token.colorPrimary }}>
                              {displayMoney(
                                order.bifin ?? order.bifInAmount ?? 0,
                              )}
                            </Text>
                          </InfoLine>
                        </>
                      )}
                      <Divider />
                      <InfoLine label={t("orderDetail.total_need_payment")}>
                        <Text strong style={{ color: token.colorPrimary }}>
                          {displayMoney(needPay)}
                        </Text>
                      </InfoLine>
                    </>
                  )}

                  <Divider />
                  <InfoLine label={t("orderDetail.service")}>
                    {renderServiceList(order.services, services)}
                  </InfoLine>

                  <Divider />
                  <InfoLine
                    label={
                      receiptAddress
                        ? t("orderDetail.delivery_receiptAddress")
                        : t("orderDetail.delivery_address")
                    }
                  >
                    {formatAddress(baseAddress)}
                  </InfoLine>

                  {receiptAddress && (
                    <>
                      <Divider />
                      <InfoLine label={t("orderDetail.delivery_address")}>
                        {formatAddress(receiptAddress)}
                      </InfoLine>
                    </>
                  )}

                  <Divider />
                  <Space
                    direction="vertical"
                    size={token.marginSM}
                    style={{ width: "100%" }}
                  >
                    {order.remark && (
                      <InfoLine label={t("orderDetail.note_order")}>
                        <Text>{order.remark}</Text>
                      </InfoLine>
                    )}
                    <InfoLine label={t("orderDetail.personal_note")}>
                      <Text
                        editable={{
                          text: order.note || "",
                          tooltip: t("orderDetail.edit_note"),
                          onChange: (value) =>
                            handleUpdate("note", value, order.note || ""),
                        }}
                        disabled={isUpdating}
                        style={editableTextStyle}
                      >
                        {displayValue(order.note)}
                      </Text>
                    </InfoLine>
                    <InfoLine label={t("orderDetail.ref_customer_code")}>
                      <Text
                        editable={{
                          text: customerCode,
                          tooltip: t("orderDetail.edit_ref_customer_code"),
                          onChange: (value) =>
                            handleUpdate(
                              "refCustomerCode",
                              value,
                              customerCode,
                            ),
                        }}
                        disabled={isUpdating}
                        style={editableTextStyle}
                      >
                        {displayValue(customerCode)}
                      </Text>
                    </InfoLine>
                    <InfoLine label={t("orderDetail.ref_order_code")}>
                      <Text
                        editable={{
                          text: customerOrderCode,
                          tooltip: t("orderDetail.edit_ref_order_code"),
                          onChange: (value) =>
                            handleUpdate(
                              "refOrderCode",
                              value,
                              customerOrderCode,
                            ),
                        }}
                        disabled={isUpdating}
                        style={editableTextStyle}
                      >
                        {displayValue(customerOrderCode)}
                      </Text>
                    </InfoLine>
                  </Space>
                </>
              )}

              <Divider />
              <Flex justify="center">
                <Button
                  type="link"
                  icon={isExpand ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                  onClick={() => setIsExpand((current) => !current)}
                >
                  {isExpand
                    ? t("orderDetail.collapse")
                    : t("orderDetail.show_more")}
                </Button>
              </Flex>
            </Card>

            <Card styles={{ body: { paddingTop: 0 } }}>
              <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                items={tabItems}
              />
            </Card>
          </Space>
        </Col>

        <Col xs={24} xl={7}>
          <Card styles={{ body: { padding: 0 } }}>
            <ChatPanel
              entityType="orders"
              entityCode={code}
              entityCreatedAt={order.createdAt}
              rounded="square"
            />
          </Card>
        </Col>
      </Row>
    </Layout>
  );
};
