import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Input,
  Modal,
  Row,
  Skeleton,
  Space,
  Table,
  Tooltip,
  Typography,
  theme,
} from "antd";
import {
  DollarOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useTheme } from "@repo/theme-provider";
import {
  useOrderCouponsQuery,
  useOrderFeesConfigGroupQuery,
  useOrderFeesQuery,
} from "@repo/hooks";
import { moneyFormat } from "@repo/util";
import { useTranslation } from "react-i18next";

interface FeeTabProps {
  orderCode: string;
  order: any;
  statusInfo?: any;
}

const { Text, Title, Link } = Typography;

const money = (value: any, showSign = false) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    Number.isNaN(Number(value))
  ) {
    return "---";
  }

  const numberValue = Number(value);
  const prefix = showSign && numberValue > 0 ? "+" : "";
  return `${prefix}${moneyFormat(value)}`;
};

const yuanMoney = (value: any) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    Number.isNaN(Number(value))
  ) {
    return "";
  }

  return `(${moneyFormat(value, "CNY")})`;
};

const moneyValue = (value: any, showSign = false) =>
  value === null ||
  value === undefined ||
  value === "" ||
  Number.isNaN(Number(value))
    ? "---"
    : money(value, showSign);

const absoluteMoneyValue = (value: any) =>
  value === null ||
  value === undefined ||
  value === "" ||
  Number.isNaN(Number(value))
    ? "---"
    : moneyFormat(value, undefined, true);

const sortFees = (fees: any[]) =>
  [...fees].sort(
    (a: any, b: any) => Number(a.position || 0) - Number(b.position || 0),
  );

const formatDiscountValue = (discount: any) => {
  if (!discount) return "";
  return discount.discountType === "PERCENT"
    ? `${discount.discountValue}%`
    : money(discount.discountValue);
};

const normalizeFeeText = (value: any) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const feeTypeKeyByAlias: Record<string, string> = {
  order_management: "fee_type.order_management_fee",
  order_management_fee: "fee_type.order_management_fee",
  management_fee: "fee_type.order_management_fee",
  phi_quan_ly_don: "fee_type.order_management_fee",
  phi_quan_ly_don_hang: "fee_type.order_management_fee",
  purchasing: "fee_type.purchasing_fee",
  purchasing_fee: "fee_type.purchasing_fee",
  buying_fee: "fee_type.purchasing_fee",
  purchase_fee: "fee_type.purchasing_fee",
  phi_mua: "fee_type.purchasing_fee",
  phi_mua_hang: "fee_type.purchasing_fee",
  inspection: "fee_type.inspection_fee",
  inspection_fee: "fee_type.inspection_fee",
  checking_fee: "fee_type.inspection_fee",
  phi_kiem_hang: "fee_type.inspection_fee",
  cong_kiem: "fee_type.inspection_fee",
  normal_shipping: "fee_type.normal_shipping_fee",
  normal_shipping_fee: "fee_type.normal_shipping_fee",
  standard_shipping: "fee_type.normal_shipping_fee",
  transport_normal: "fee_type.normal_shipping_fee",
  phi_van_chuyen_thuong: "fee_type.normal_shipping_fee",
};

const getFeeTypeName = (fee: any, t: any) => {
  const fallback = fee.type?.name || fee.service || "---";
  const aliases = [
    fee.type?.code,
    fee.type?.service,
    fee.service,
    fee.type?.feeMetadata?.template,
    fee.type?.name,
  ].map(normalizeFeeText);
  const translationKey = aliases
    .map((alias) => feeTypeKeyByAlias[alias])
    .find(Boolean);

  return translationKey ? t(translationKey, { defaultValue: fallback }) : fallback;
};

const FeeValue = ({ fee, order }: { fee: any; order: any }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const value = money(fee.actualAmount);
  const customerDiscountLevel = order?.customerDiscountLevels?.find(
    (item: any) => item?.feeCode === fee?.type?.code,
  );
  const hasDiscountTooltip = Boolean(
    fee.reason || (customerDiscountLevel && fee.actualAmount),
  );
  const tooltip = (
    <Space direction="vertical" size={2}>
      {fee.reason && (
        <Text style={{ color: token.colorWhite }}>{fee.reason}</Text>
      )}
      {customerDiscountLevel && fee.actualAmount ? (
        <Text style={{ color: token.colorWhite }}>
          {t("fee_tab.discountCustomer", {
            value: formatDiscountValue(customerDiscountLevel),
          })}
        </Text>
      ) : null}
    </Space>
  );

  if (fee.free) {
    return (
      <Space size={4}>
        <Text delete type="secondary">
          {value}
        </Text>
        <Text>{t("fee_tab.free")}</Text>
        {hasDiscountTooltip && (
          <Tooltip title={tooltip} color={token.colorPrimary}>
            <QuestionCircleOutlined />
          </Tooltip>
        )}
      </Space>
    );
  }

  if (
    fee.manual &&
    fee.provisionalAmount !== null &&
    fee.provisionalAmount !== undefined
  ) {
    return (
      <Space size={4}>
        <Text delete type="secondary">
          {money(fee.provisionalAmount)}
        </Text>
        <Text>{value}</Text>
        {hasDiscountTooltip && (
          <Tooltip title={tooltip} color={token.colorPrimary}>
            <QuestionCircleOutlined />
          </Tooltip>
        )}
      </Space>
    );
  }

  return (
    <Space size={4}>
      <Text>{value}</Text>
      {hasDiscountTooltip && (
        <Tooltip title={tooltip} color={token.colorPrimary}>
          <QuestionCircleOutlined />
        </Tooltip>
      )}
    </Space>
  );
};

const getFeeConfig = (fee: any, feeConfigs: any[]) =>
  fee?.type
    ? feeConfigs.find(
        (item: any) =>
          item.code === fee.type.code &&
          item.feeMetadata?.template &&
          item.feeMetadata.template !== "custom",
      )
    : null;

const FeeGroup = ({
  title,
  fees,
  feeConfigs,
  order,
  onOpenFeeTable,
}: {
  title: string;
  fees: any[];
  feeConfigs: any[];
  order: any;
  onOpenFeeTable: (feeConfig: any) => void;
}) => {
  const { token } = theme.useToken();
  if (fees.length === 0) return null;

  return (
    <Space direction="vertical" size={token.marginXS} style={{ width: "100%" }}>
      <Title
        level={5}
        style={{
          margin: 0,
          textTransform: "uppercase",
          fontSize: token.fontSize,
        }}
      >
        {title}
      </Title>
      <Card
        size="small"
        styles={{ body: { background: token.colorFillAlter } }}
      >
        <Space
          direction="vertical"
          size={token.marginXS}
          style={{ width: "100%" }}
        >
          {fees.map((fee: any, index: number) => (
            <FeeGroupRow
              key={fee.id || `${fee.type?.code || fee.service}-${index}`}
              fee={fee}
              feeConfig={getFeeConfig(fee, feeConfigs)}
              order={order}
              onOpenFeeTable={onOpenFeeTable}
            />
          ))}
        </Space>
      </Card>
    </Space>
  );
};

const FeeGroupRow = ({
  fee,
  feeConfig,
  order,
  onOpenFeeTable,
}: {
  fee: any;
  feeConfig: any;
  order: any;
  onOpenFeeTable: (feeConfig: any) => void;
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const hasMinMax = fee.type?.minFee != null || fee.type?.maxFee != null;

  return (
    <Flex justify="space-between" gap={token.marginSM}>
      <Space size={4}>
        <Text>{getFeeTypeName(fee, t)}</Text>
        {hasMinMax && (
          <Tooltip
            color={token.colorPrimary}
            title={
              <Space direction="vertical" size={2}>
                <Text style={{ color: token.colorWhite }}>
                  {t("fee_tab.min_fee")}: {money(fee.type?.minFee)}
                </Text>
                <Text style={{ color: token.colorWhite }}>
                  {t("fee_tab.max_fee")}: {money(fee.type?.maxFee)}
                </Text>
              </Space>
            }
          >
            <InfoCircleOutlined />
          </Tooltip>
        )}
        {feeConfig && (
          <Tooltip title={t("config_group.feeTable")} color={token.colorPrimary}>
            <DollarOutlined
              onClick={() => onOpenFeeTable(feeConfig)}
              style={{ cursor: "pointer" }}
            />
          </Tooltip>
        )}
      </Space>
      <FeeValue fee={fee} order={order} />
    </Flex>
  );
};

const makeRangeColumns = (sample: any) =>
  Object.keys(sample || {}).map((key) => ({
    title: key,
    dataIndex: key,
    key,
    render: (value: any) =>
      typeof value === "number" ? money(value) : String(value ?? "---"),
  }));

const normalizeTableRows = (data: any) => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];

  if (Array.isArray(data.ranges)) return data.ranges;
  if (Array.isArray(data.rows)) return data.rows;
  if (Array.isArray(data.table)) return data.table;

  const rangeKeys = Object.keys(data).filter(
    (key) => typeof data[key] === "object",
  );
  return rangeKeys.map((key) => ({ range: key, ...data[key] }));
};

const FeeTableContent = ({
  feeConfig,
  order,
}: {
  feeConfig: any;
  order: any;
}) => {
  const { t } = useTranslation();
  const metadata = feeConfig?.feeMetadata || {};
  const template = metadata.template;
  const marketplaceData = metadata.dataWithMarketPlace?.find(
    (item: any) => item.marketplace === order?.marketplace?.code,
  )?.data;
  const data = marketplaceData || metadata.data || {};

  if (template === "fixed_order" || template === "fixed_package") {
    return (
      <Row gutter={12} align="middle">
        <Col span={8}>
          <Text>{t("config_group.applied")}</Text>
        </Col>
        <Col span={10}>
          <Input value={data.value ?? "---"} disabled />
        </Col>
        <Col span={6}>
          <Text>
            {template === "fixed_order"
              ? `₫/${t("config_group.order")}`
              : `₫/${t("config_group.package")}`}
          </Text>
        </Col>
      </Row>
    );
  }

  const rows = normalizeTableRows(data);
  if (rows.length === 0)
    return <Empty description={t("config_group.empty_fee_table")} />;

  return (
    <Table
      size="small"
      bordered
      pagination={false}
      rowKey={(_, index) => String(index)}
      columns={makeRangeColumns(rows[0])}
      dataSource={rows}
    />
  );
};

const SummaryLine = ({
  label,
  value,
  strong,
  small,
  onDetail,
}: {
  label: ReactNode;
  value: string;
  strong?: boolean;
  small?: string;
  onDetail?: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <Flex
      justify="space-between"
      align="center"
      gap={12}
      style={{ padding: "5px 0" }}
    >
      <Text strong={strong} style={{ color: "white", flex: "0 0 auto" }}>
        {label}
      </Text>
      <Space direction="vertical" size={0} align="end" style={{ minWidth: 0 }}>
        <span
          style={{
            color: "white",
            textAlign: "right",
            wordBreak: "break-word",
          }}
        >
          <Text strong={strong} style={{ color: "white" }}>
            {value}
          </Text>
          {small && (
            <Text
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 12,
                marginLeft: 4,
              }}
            >
              {small}
            </Text>
          )}
        </span>
        {onDetail && (
          <Link onClick={onDetail} style={{ color: "white", fontSize: 12 }}>
            {t("fee_tab.detail")}
          </Link>
        )}
      </Space>
    </Flex>
  );
};

const CouponSummary = ({ coupons }: { coupons: any[] }) => {
  const { token } = theme.useToken();
  if (!Array.isArray(coupons) || coupons.length === 0) return null;

  return (
    <Tooltip
      color={token.colorPrimary}
      title={
        <Space direction="vertical" size={2}>
          {coupons.map((coupon: any, index: number) => (
            <Text
              key={`${coupon.code || index}`}
              style={{ color: token.colorWhite }}
            >
              {coupon.code} - {coupon.description}
            </Text>
          ))}
        </Space>
      }
    >
      <InfoCircleOutlined style={{ color: token.colorWhite, marginLeft: 4 }} />
    </Tooltip>
  );
};

export const FeeTab = ({ orderCode, order, statusInfo }: FeeTabProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { tenantConfig } = useTheme();
  const { data: fees = [], isLoading } = useOrderFeesQuery(orderCode);
  const { data: coupons = [] } = useOrderCouponsQuery(orderCode);
  const { data: feeConfigs = [] } = useOrderFeesConfigGroupQuery(
    order?.configGroupId,
  );
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [feeTableConfig, setFeeTableConfig] = useState<any>(null);

  const groupedFees = useMemo(() => {
    const sorted = sortFees(Array.isArray(fees) ? fees : []);
    return {
      serviceFees: sorted.filter(
        (fee: any) => fee.type && !fee.type.shipping && !fee.type.additional,
      ),
      shippingFees: sorted.filter(
        (fee: any) => fee.type && fee.type.shipping && !fee.type.additional,
      ),
      additionalFees: sorted.filter(
        (fee: any) => fee.type && !fee.type.shipping && fee.type.additional,
      ),
    };
  }, [fees]);

  if (isLoading) return <Skeleton active paragraph={{ rows: 10 }} />;

  const totalFee =
    order.totalFee ??
    fees.reduce(
      (sum: number, fee: any) => sum + Number(fee.actualAmount || 0),
      0,
    );
  const totalUnpaid = Number(order.totalUnpaid || 0);
  const needPaymentLabel =
    totalUnpaid >= 0 ? t("order.need_payment") : t("order.excess_cash");
  const generalConfig = tenantConfig?.tenantConfig?.generalConfig || {};
  const showSupplierDiscount = Boolean(generalConfig.showSupplierDiscount);
  const isBifinOrder = Boolean(order.contractWithShopkeeper);
  const couponVisible = Array.isArray(coupons) && coupons.length > 0;
  const couponLabel = (
    <Space size={4}>
      <Text style={{ color: token.colorWhite }}>{t("button.coupon")}</Text>
      <CouponSummary coupons={coupons} />
    </Space>
  );

  return (
    <>
      <Row gutter={[token.marginLG, token.marginLG]}>
        <Col xs={24} lg={16}>
          <Space
            direction="vertical"
            size={token.marginLG}
            style={{ width: "100%" }}
          >
            <FeeGroup
              title={t("fee_tab.service_fee")}
              fees={groupedFees.serviceFees}
              feeConfigs={feeConfigs}
              order={order}
              onOpenFeeTable={setFeeTableConfig}
            />
            <FeeGroup
              title={t("fee_tab.transport_fee")}
              fees={groupedFees.shippingFees}
              feeConfigs={feeConfigs}
              order={order}
              onOpenFeeTable={setFeeTableConfig}
            />
            <FeeGroup
              title={t("fee_tab.surcharge")}
              fees={groupedFees.additionalFees}
              feeConfigs={feeConfigs}
              order={order}
              onOpenFeeTable={setFeeTableConfig}
            />
            {groupedFees.serviceFees.length === 0 &&
              groupedFees.shippingFees.length === 0 &&
              groupedFees.additionalFees.length === 0 && (
                <Empty description={t("fee_tab.empty_fee")} />
              )}
          </Space>
        </Col>

        <Col xs={24} lg={8}>
          <Space
            direction="vertical"
            size={token.marginSM}
            style={{ width: "100%" }}
          >
            <Title
              level={5}
              style={{
                margin: 0,
                textTransform: "uppercase",
                fontSize: token.fontSize,
              }}
            >
              {t("fee_tab.finance")}
            </Title>
            <Card
              bordered={false}
              styles={{
                body: {
                  background: token.colorPrimary,
                  borderRadius: token.borderRadius,
                  padding: `${token.paddingSM}px ${token.padding}px`,
                },
              }}
            >
              <Space direction="vertical" size={0} style={{ width: "100%" }}>
                <SummaryLine
                  label={t("fee_tab.sale_price")}
                  value={moneyValue(order.exchangedTotalValue)}
                  small={
                    order.totalValue ? yuanMoney(order.totalValue) : undefined
                  }
                />
                {showSupplierDiscount && (
                  <SummaryLine
                    label={t("order.discountAmount")}
                    value={
                      order.discountAmount
                        ? moneyValue(order.exchangedDiscountAmount)
                        : "---"
                    }
                    small={
                      order.discountAmount
                        ? yuanMoney(order.discountAmount)
                        : undefined
                    }
                  />
                )}
                <SummaryLine
                  label={t("fee_tab.internal_transport_fee")}
                  value={moneyValue(order.exchangedMerchantShippingCost)}
                  small={
                    order.merchantShippingCost
                      ? yuanMoney(order.merchantShippingCost)
                      : undefined
                  }
                />
                <SummaryLine
                  label={t("fee_tab.fee_total")}
                  value={moneyValue(totalFee)}
                />
                {couponVisible && (
                  <SummaryLine
                    label={couponLabel}
                    value={`-${moneyValue(order.totalCoupon)}`}
                  />
                )}

                {isBifinOrder ? (
                  <>
                    <SummaryLine
                      label={t("cartCheckout.provisional_cal")}
                      value={moneyValue(order.grandTotal)}
                      strong
                    />
                    <Divider
                      style={{
                        borderColor: "rgba(255,255,255,0.35)",
                        margin: `${token.marginXS}px 0`,
                      }}
                    />
                    <SummaryLine
                      label={t("fee_tab.paid")}
                      value={moneyValue(order.totalPaid)}
                    />
                    <SummaryLine
                      label={t("fee_tab.refunded_service")}
                      value={moneyValue(order.totalRefund)}
                    />
                    <Divider
                      style={{
                        borderColor: "rgba(255,255,255,0.35)",
                        margin: `${token.marginXS}px 0`,
                      }}
                    />
                    <SummaryLine
                      label={t("fee_tab.biffin_borrow")}
                      value={moneyValue(order.totalPaid)}
                    />
                    <SummaryLine
                      label={t("cartCheckout.lending_fee")}
                      value={moneyValue(order.totalRefund)}
                    />
                    {!statusInfo?.negativeEnd && (
                      <>
                        <Divider
                          style={{
                            borderColor: "rgba(255,255,255,0.35)",
                            margin: `${token.marginXS}px 0`,
                          }}
                        />
                        <SummaryLine
                          label={needPaymentLabel}
                          value={absoluteMoneyValue(order.totalUnpaid)}
                        />
                      </>
                    )}
                    {order.totalCollect ? (
                      <>
                        <Divider
                          style={{
                            borderColor: "rgba(255,255,255,0.35)",
                            margin: `${token.marginXS}px 0`,
                          }}
                        />
                        <SummaryLine
                          label={t("fee_tab.collect_refund")}
                          value={moneyValue(order.totalCollect, true)}
                          onDetail={() => setCollectModalOpen(true)}
                        />
                      </>
                    ) : null}
                  </>
                ) : (
                  <>
                    <Divider
                      style={{
                        borderColor: "rgba(255,255,255,0.35)",
                        margin: `${token.marginXS}px 0`,
                      }}
                    />
                    <SummaryLine
                      label={t("fee_tab.cost_total")}
                      value={moneyValue(order.grandTotal)}
                      strong
                    />
                    <SummaryLine
                      label={t("fee_tab.paid")}
                      value={moneyValue(order.totalPaid)}
                    />
                    <SummaryLine
                      label={t("fee_tab.refunded_service")}
                      value={moneyValue(order.totalRefund)}
                    />
                    {!statusInfo?.negativeEnd && (
                      <SummaryLine
                        label={needPaymentLabel}
                        value={absoluteMoneyValue(order.totalUnpaid)}
                      />
                    )}
                    {order.totalClaim ? (
                      <>
                        <Divider
                          style={{
                            borderColor: "rgba(255,255,255,0.35)",
                            margin: `${token.marginXS}px 0`,
                          }}
                        />
                        <SummaryLine
                          label={t("fee_tab.claimed_refund")}
                          value={moneyValue(order.totalClaim)}
                          onDetail={() => setClaimModalOpen(true)}
                        />
                      </>
                    ) : null}
                    {order.totalCollect ? (
                      <>
                        <Divider
                          style={{
                            borderColor: "rgba(255,255,255,0.35)",
                            margin: `${token.marginXS}px 0`,
                          }}
                        />
                        <SummaryLine
                          label={t("fee_tab.collect_refund")}
                          value={moneyValue(order.totalCollect, true)}
                          onDetail={() => setCollectModalOpen(true)}
                        />
                      </>
                    ) : null}
                  </>
                )}
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      <Modal
        title={t("fee_tab.refunded_list")}
        open={claimModalOpen}
        footer={null}
        onCancel={() => setClaimModalOpen(false)}
      >
        <Empty description={t("fee_tab.empty_detail")} />
      </Modal>
      <Modal
        title={t("fee_tab.retrospectiveList")}
        open={collectModalOpen}
        footer={null}
        onCancel={() => setCollectModalOpen(false)}
      >
        <Empty description={t("fee_tab.empty_detail")} />
      </Modal>
      <Modal
        title={t("config_group.feeTable")}
        open={!!feeTableConfig}
        width={1100}
        okText={t("button.close")}
        cancelButtonProps={{ style: { display: "none" } }}
        onOk={() => setFeeTableConfig(null)}
        onCancel={() => setFeeTableConfig(null)}
      >
        {feeTableConfig && (
          <FeeTableContent feeConfig={feeTableConfig} order={order} />
        )}
      </Modal>
    </>
  );
};
