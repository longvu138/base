import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Alert,
  Button,
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
  notification,
  theme,
} from "antd";
import dayjs from "dayjs";
import {
  DollarOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useTheme } from "@repo/theme-provider";
import {
  useApplyOrderCouponMutation,
  useCheckVoucherMutation,
  useOrderCouponsQuery,
  useOrderFeesConfigGroupQuery,
  useOrderFeesQuery,
  useOrderShippingFeesQuery,
} from "@repo/hooks";
import { moneyFormat, quantityFormat } from "@repo/util";
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

const dateTime = (value: any) =>
  value ? dayjs(value).format("HH:mm DD/MM/YYYY") : "---";

const errorTitle = (error: any) =>
  error?.response?.data?.title ||
  error?.response?.data?.message ||
  error?.title ||
  error?.message;

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

const numericSort = (left: any, right: any) => Number(left) - Number(right);

const quantity = (value: any) => {
  if (value === null || value === undefined || value === "") return "---";
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return String(value);
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(
    numericValue,
  );
};

const display = (value: any) =>
  value === null || value === undefined || value === "" ? "---" : String(value);

const buildRanges = (data: any, emptyKey: string) =>
  Object.keys(data || {})
    .sort(numericSort)
    .map((key, index, keys) => {
      if (key === emptyKey) {
        return { key, from: null, to: null, value: data[key], empty: true };
      }

      const nextKey = keys[index + 1];
      return {
        key,
        from: Number(key),
        to:
          nextKey && nextKey !== emptyKey
            ? Number(nextKey)
            : index === keys.length - 1
              ? null
              : Number(key),
        value: data[key],
        empty: false,
      };
    });

const rangeText = (
  range: any,
  {
    emptyText,
    moneyUnit,
  }: { emptyText: string; moneyUnit?: string },
) => {
  if (range.empty) return emptyText;
  const formatValue = (value: any) => {
    const formattedValue = moneyUnit ? moneyFormat(value, moneyUnit) : quantity(value);
    return String(formattedValue).replace(/\+/g, "");
  };
  if (range.to === null || range.to === undefined) {
    return tRangeFrom(formatValue(range.from));
  }
  return `${tRangeFrom(formatValue(range.from))} ${tRangeTo(formatValue(range.to))}`;
};

const tRangeFrom = (value: string) => `Từ ${value}`;
const tRangeTo = (value: string) => `đến dưới ${value}`;

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

const renderFeeDataFallback = (data: any, emptyText: ReactNode) => {
  const rows = normalizeTableRows(data);

  if (rows.length > 0) {
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
  }

  if (data && typeof data === "object" && Object.keys(data).length > 0) {
    return (
      <Input.TextArea
        value={JSON.stringify(data, null, 2)}
        disabled
        autoSize={{ minRows: 6, maxRows: 16 }}
      />
    );
  }

  return <Empty description={emptyText} />;
};

const asArray = (value: any): any[] => (Array.isArray(value) ? value : []);

const getShippingFees = (feeConfig: any, data: any) => {
  if (asArray(feeConfig.shippingFees).length > 0) {
    return asArray(feeConfig.shippingFees);
  }
  if (asArray(data.shippingFees).length > 0) {
    return asArray(data.shippingFees);
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [];
};

const getLocationCode = (item: any) =>
  display(item.location?.code ?? item.locationCode ?? item.code);

const getLocationName = (location: any) =>
  display(location.display ?? location.name ?? location.code);

const getLocationFromShippingFee = (item: any) => {
  if (item.location && typeof item.location === "object") return item.location;
  return {
    code: item.locationCode ?? item.location ?? item.code,
    display: item.locationName ?? item.name,
  };
};

const getWeightKey = (item: any) =>
  `${display(item.minWeight)}-${display(item.maxWeight)}`;

const FeeTableContent = ({
  feeConfig,
  order,
}: {
  feeConfig: any;
  order: any;
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const metadata = feeConfig?.feeMetadata || {};
  const template = metadata.template;
  const marketplaceData = metadata.dataWithMarketPlace?.find(
    (item: any) => item.marketplace === order?.marketplace?.code,
  )?.data;
  const data = marketplaceData || metadata.data || {};
  const emptyText = t("config_group.empty_fee_table");
  const localShippingFees = getShippingFees(feeConfig, data);
  const shouldFetchShippingFees =
    template === "shipping" && localShippingFees.length === 0;
  const { data: fetchedShippingFees = [], isLoading: isShippingFeesLoading } =
    useOrderShippingFeesQuery(
      order?.configGroupId,
      feeConfig?.shippingClass ?? metadata.shippingClass,
      shouldFetchShippingFees,
    );

  if (template === "percentage_of_total_value") {
    const rows = buildRanges(data, "empty_order").map((range) => ({
      key: range.key,
      orderValue: rangeText(range, {
        emptyText: t("config_group.emptyOrderValue"),
        moneyUnit: "VND",
      }),
      fee: range.value,
    }));

    if (rows.length === 0) {
      return renderFeeDataFallback(data, emptyText);
    }

    return (
      <Table
        size="small"
        bordered
        pagination={false}
        rowKey="key"
        columns={[
          {
            title: t("config_group.orderValue"),
            dataIndex: "orderValue",
            width: 360,
          },
          {
            title: t("config_group.serviceCharge"),
            dataIndex: "fee",
            render: (value: any) => <Input value={display(value)} disabled />,
          },
        ]}
        dataSource={rows}
      />
    );
  }

  if (template === "inspection") {
    const priceRanges = buildRanges(data, "empty_price");
    const quantityRanges = priceRanges.reduce<any[]>((result, range) => {
      Object.keys(range.value || {}).forEach((key) => {
        if (!result.some((item) => item.key === key)) {
          result.push(buildRanges({ [key]: null }, "empty_quantity")[0]);
        }
      });
      return result;
    }, []);
    const rows = quantityRanges.map((quantityRange) => ({
      key: quantityRange.key,
      quantity: rangeText(quantityRange, {
        emptyText: t("config_group.emptyQuantity"),
      }),
      ...priceRanges.reduce((result: any, priceRange) => {
        result[priceRange.key] = priceRange.value?.[quantityRange.key];
        return result;
      }, {}),
    }));

    if (rows.length === 0 || priceRanges.length === 0) {
      return renderFeeDataFallback(data, emptyText);
    }

    return (
      <Table
        size="small"
        bordered
        pagination={false}
        rowKey="key"
        columns={[
          {
            title: t("config_group.numberProducts"),
            dataIndex: "quantity",
            fixed: "left",
            width: 260,
          },
          ...priceRanges.map((range) => ({
            title: rangeText(range, {
              emptyText: "Đơn giá",
              moneyUnit: "CNY",
            }),
            dataIndex: range.key,
            width: 260,
            render: (value: any) => (
              <Flex align="center" gap={token.marginXS}>
                <Input
                  value={
                    value === null || value === undefined
                      ? "---"
                      : quantityFormat(value, true)
                  }
                  disabled
                  style={{ flex: 1 }}
                />
                <Text strong>đ/sp</Text>
              </Flex>
            ),
          })),
        ]}
        dataSource={rows}
        scroll={{ x: "max-content" }}
      />
    );
  }

  if (template === "shipping") {
    const shippingFees =
      localShippingFees.length > 0
        ? localShippingFees
        : asArray(fetchedShippingFees);

    if (isShippingFeesLoading) {
      return <Skeleton active paragraph={{ rows: 4 }} />;
    }

    if (shippingFees.length === 0) {
      return renderFeeDataFallback(data, emptyText);
    }

    const locations = shippingFees.reduce<any[]>((result, item) => {
      const location = getLocationFromShippingFee(item);
      const code = display(location.code);
      if (!result.some((locationItem) => display(locationItem.code) === code)) {
        result.push(location);
      }
      return result;
    }, []);
    const firstLocationCode = display(locations[0]?.code);
    const weights = shippingFees
      .filter((item) => getLocationCode(item) === firstLocationCode)
      .sort(
        (left, right) =>
          Number(left.minWeight ?? 0) - Number(right.minWeight ?? 0),
      );
    const tableLocations =
      locations.length > 0 ? locations : [{ code: "newLocation" }];
    const tableWeights =
      weights.length > 0
        ? weights
        : [
            {
              minWeight: undefined,
              maxWeight: undefined,
              price: null,
              priceFormula: null,
            },
          ];

    return (
      <Table
        size="small"
        bordered
        pagination={false}
        rowKey={(record) => display(record.code)}
        columns={[
          {
            title: t("config_group.location"),
            dataIndex: "display",
            fixed: "left",
            width: 220,
            render: (_text, record) => getLocationName(record),
          },
          ...tableWeights.map((weight) => ({
            title: `${t("config_group.from")} ${quantity(
              weight.minWeight,
            )}(kg) ${t("config_group.to")} ${quantity(weight.maxWeight)} (kg)`,
            dataIndex: getWeightKey(weight),
            width: 220,
            render: (_value: any, record: any) => {
              const currentFee = shippingFees.find(
                (item) =>
                  getLocationCode(item) === display(record.code) &&
                  item.minWeight === weight.minWeight &&
                  item.maxWeight === weight.maxWeight,
              );
              const price = currentFee?.price;
              return (
                <Flex align="center" gap={token.marginXS}>
                  <Input
                    value={
                      price === null || price === undefined || price === ""
                        ? "---"
                        : quantityFormat(price, true)
                    }
                    disabled
                    style={{ flex: 1 }}
                  />
                  <Text strong>đ/kg</Text>
                </Flex>
              );
            },
          })),
        ]}
        dataSource={tableLocations}
        scroll={{ x: 220 * tableWeights.length + 220 }}
      />
    );
  }

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
  if (rows.length === 0) return renderFeeDataFallback(data, emptyText);

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
  const checkVoucher = useCheckVoucherMutation();
  const applyOrderCoupon = useApplyOrderCouponMutation(orderCode);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponValidMessage, setCouponValidMessage] = useState("");
  const [couponValidTo, setCouponValidTo] = useState<any>(null);
  const [couponValid, setCouponValid] = useState(false);
  const [feeTableConfig, setFeeTableConfig] = useState<any>(null);

  const resetCouponModal = () => {
    setCouponCode("");
    setCouponValidMessage("");
    setCouponValidTo(null);
    setCouponValid(false);
  };

  const openCouponModal = () => {
    resetCouponModal();
    setCouponModalOpen(true);
  };

  const closeCouponModal = () => {
    setCouponModalOpen(false);
    resetCouponModal();
  };

  const changeCouponCode = (nextCode: string) => {
    setCouponCode(nextCode);
    setCouponValid(false);
    setCouponValidMessage("");
    setCouponValidTo(null);
  };

  const checkCouponCode = async () => {
    const nextCode = couponCode.trim();
    if (!nextCode) return;

    try {
      const voucher = await checkVoucher.mutateAsync({
        code: nextCode,
        orderCode,
        isShipment: false,
      });
      if (voucher?.code) {
        setCouponValid(true);
        setCouponValidMessage(voucher.description || "");
        setCouponValidTo(voucher.validTo);
      } else {
        setCouponValid(false);
        setCouponValidTo(null);
        setCouponValidMessage(t("message.coupon_invalid_for_you"));
      }
    } catch (error: any) {
      const title = errorTitle(error) || "coupon_invalid_for_you";
      setCouponValid(false);
      setCouponValidTo(null);
      setCouponValidMessage(t(`message.${title}`));
    }
  };

  const submitCouponCode = async () => {
    if (!couponValid) return;

    try {
      await applyOrderCoupon.mutateAsync({ couponCode: couponCode.trim() });
      notification.success({ message: t("message.coupon_apply_success") });
      closeCouponModal();
    } catch (error: any) {
      const title = errorTitle(error) || "coupon_invalid_for_you";
      notification.error({ message: t(`message.${title}`) });
    }
  };

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
              </Space>
            </Card>
            {statusInfo?.couponEnabled && (
              <Flex justify="end">
                <Button type="link" onClick={openCouponModal}>
                  {t("button.coupon")}
                </Button>
              </Flex>
            )}
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
        title={t("coupon.modalTitle")}
        open={couponModalOpen}
        footer={null}
        width={600}
        onCancel={closeCouponModal}
      >
        <Space
          direction="vertical"
          size={token.marginMD}
          style={{ width: "100%" }}
        >
          <Typography.Text>{t("coupon.inputVoucher")}</Typography.Text>
          <Input.Search
            value={couponCode}
            placeholder={t("message.enter_coupon")}
            enterButton={t("button.check")}
            loading={checkVoucher.isPending}
            onChange={(event) => changeCouponCode(event.target.value)}
            onSearch={checkCouponCode}
          />
          {couponValidTo && (
            <Alert
              type="success"
              showIcon
              message={t("coupon.voucherValidTo", {
                value: dateTime(couponValidTo),
              })}
            />
          )}
          {couponValidMessage && (
            <Alert
              type={couponValid ? "success" : "error"}
              showIcon
              message={couponValidMessage}
            />
          )}
          <Flex justify="end" gap={token.marginSM}>
            <Button onClick={closeCouponModal}>{t("button.cancel")}</Button>
            <Button
              type="primary"
              disabled={!couponValid}
              loading={applyOrderCoupon.isPending}
              onClick={submitCouponCode}
            >
              {t("button.use")}
            </Button>
          </Flex>
        </Space>
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
