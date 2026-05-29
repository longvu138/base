import {
  Alert,
  App,
  Avatar,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Empty,
  Flex,
  Image,
  Input,
  Modal,
  Radio,
  Row,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
  theme,
} from "antd";
import {
  CloseOutlined,
  DownOutlined,
  QuestionCircleOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  UpOutlined,
} from "@ant-design/icons";
import {
  useAddressesQuery,
  useApplyDraftOrderCouponMutation,
  useCheckVoucherMutation,
  useCreateCustomerOrderMutation,
  useCustomerBalance,
  useCustomerProfile,
  useDraftOrderQuery,
  useUpdateDraftOrderMutation,
} from "@repo/hooks";
import { useTranslation } from "@repo/i18n";
import { useTheme as useTenantTheme } from "@repo/theme-provider";
import { LocalStoreUtil, formatCurrency, moneyCeil } from "@repo/util";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import DepositModal from "../../components/DepositModal";
import {
  getForeignCurrency,
  getImage,
  getName,
  getProductUrl,
  getProperties,
} from "../Carts/cartViewModel";
import { DeliveryAddressPanel } from "./components/DeliveryAddressPanel";

const MONEY_TEXT_STYLE = { whiteSpace: "nowrap" };
const DEFAULT_METHOD_SELECTED = "default";

const getErrorTitle = (error: any) =>
  error?.response?.data?.title ||
  error?.response?.data?.message ||
  error?.title ||
  error?.message;

const getSkus = (merchant: any) =>
  Array.isArray(merchant?.products)
    ? merchant.products.flatMap((product: any) =>
        Array.isArray(product?.skus)
          ? product.skus.map((sku: any) => ({ ...sku, product }))
          : []
      )
    : Array.isArray(merchant?.skus)
      ? merchant.skus
      : [];

const percentToMoney = (percent: number | string, amount: number) =>
  moneyCeil((Number(percent || 0) * Number(amount || 0)) / 100);

const sumDraftOrderCouponDiscount = (data: any) =>
  (Array.isArray(data?.merchantCoupons) ? data.merchantCoupons : []).reduce(
    (total: number, merchantCoupon: any) =>
      total +
      (Array.isArray(merchantCoupon?.coupons)
        ? merchantCoupon.coupons.reduce(
            (sum: number, coupon: any) =>
              sum + Number(coupon?.totalDiscountFee || 0),
            0
          )
        : 0),
    0
  );

const readJsonStorage = (key: string) => {
  try {
    return LocalStoreUtil.getJson(key) || {};
  } catch {
    return {};
  }
};

const DraftOrderVoucherModal = ({
  open,
  draftOrderId,
  appliedVouchers,
  onApply,
  onClose,
}: {
  open: boolean;
  draftOrderId?: string;
  appliedVouchers: any[];
  onApply: (vouchers: any[]) => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const { notification } = App.useApp();
  const { token } = theme.useToken();
  const [code, setCode] = useState("");
  const [voucher, setVoucher] = useState<any>(null);
  const [message, setMessage] = useState("");
  const checkVoucher = useCheckVoucherMutation();
  const applyCoupon = useApplyDraftOrderCouponMutation(draftOrderId);

  const reset = () => {
    setCode("");
    setVoucher(null);
    setMessage("");
  };

  const close = () => {
    reset();
    onClose();
  };

  const checkCouponCode = async () => {
    const nextCode = code.trim();
    if (!nextCode) return;

    setVoucher(null);
    setMessage("");
    try {
      const result = await checkVoucher.mutateAsync({ code: nextCode });
      if (result?.code) {
        setVoucher(result);
      } else {
        setMessage(t("message.coupon_invalid_for_you"));
      }
    } catch (error: any) {
      setMessage(
        t(`message.${getErrorTitle(error) || "coupon_invalid_for_you"}`)
      );
    }
  };

  const submitCouponCode = async () => {
    if (!voucher?.code || !draftOrderId) return;

    try {
      const result = await applyCoupon.mutateAsync({
        couponCode: voucher.code,
      });
      const couponApply = {
        ...voucher,
        totalDiscountFee: sumDraftOrderCouponDiscount(result),
      };
      onApply(
        [...appliedVouchers, couponApply].filter(
          (item, index, list) =>
            list.findIndex((candidate) => candidate.code === item.code) ===
            index
        )
      );
      notification.success({ message: t("message.coupon_apply_success") });
      close();
    } catch (error: any) {
      notification.error({
        message: t(
          `message.${getErrorTitle(error) || "coupon_invalid_for_you"}`
        ),
      });
    }
  };

  return (
    <Modal
      title={t("coupon.modalTitle")}
      open={open}
      width={660}
      centered
      okText={t("coupon.apply")}
      cancelText={t("button.cancel")}
      okButtonProps={{ disabled: !voucher }}
      confirmLoading={applyCoupon.isPending}
      onOk={submitCouponCode}
      onCancel={close}
    >
      <Space
        direction="vertical"
        size={token.marginMD}
        style={{ width: "100%" }}
      >
        <Card styles={{ body: { padding: token.paddingMD } }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Typography.Text>{t("coupon.inputVoucher")}</Typography.Text>
            <Flex gap={token.marginSM}>
              <Input
                value={code}
                allowClear
                placeholder={t("coupon.voucherCode")}
                onChange={(event) => {
                  setCode(event.target.value);
                  setVoucher(null);
                  setMessage("");
                }}
                onPressEnter={checkCouponCode}
              />
              <Button
                loading={checkVoucher.isPending}
                onClick={checkCouponCode}
              >
                {t("modal.confirm")}
              </Button>
            </Flex>
          </Space>
        </Card>

        {message && <Alert type="error" showIcon message={message} />}

        {voucher && (
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Flex justify="space-between" gap={token.marginSM}>
                <Space>
                  {voucher.image && <Avatar src={voucher.image} />}
                  <Space direction="vertical" size={0}>
                    <Typography.Text strong>{voucher.title}</Typography.Text>
                    <Typography.Text type="secondary">
                      {voucher.code}
                    </Typography.Text>
                  </Space>
                </Space>
                <Tag color="red">
                  {t("coupon.voucherRemaining", {
                    value: voucher.remaining,
                  })}
                </Tag>
              </Flex>
              {voucher.description && (
                <Typography.Paragraph style={{ marginBottom: 0 }}>
                  {voucher.description}
                </Typography.Paragraph>
              )}
              {voucher.customerLimit !== undefined && (
                <Typography.Text type="secondary">
                  {t("coupon.voucherCustomerLimit", {
                    value: voucher.customerLimit,
                  })}
                </Typography.Text>
              )}
              {voucher.validTo && (
                <Typography.Text type="secondary">
                  {t("coupon.voucherValidTo", {
                    value: dayjs(voucher.validTo).format("DD/MM/YYYY"),
                  })}
                </Typography.Text>
              )}
              {voucher.termsAndConditions && (
                <Typography.Paragraph
                  type="secondary"
                  style={{ maxHeight: 240, overflow: "auto", marginBottom: 0 }}
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: voucher.termsAndConditions,
                    }}
                  />
                </Typography.Paragraph>
              )}
            </Space>
          </Card>
        )}
      </Space>
    </Modal>
  );
};

export const CartCheckoutStyleDefault = () => {
  const { t } = useTranslation();
  const { notification } = App.useApp();
  const { token } = theme.useToken();
  const { tenantConfig } = useTenantTheme();
  const { draftOrderId } = useParams();
  const { data: draftOrder, isLoading } = useDraftOrderQuery(draftOrderId);
  const { data: profile } = useCustomerProfile();
  const { data: balanceData } = useCustomerBalance();
  const { data: addresses, isFetching: isFetchingAddresses } =
    useAddressesQuery({
      page: 0,
      receivingAddress: false,
      size: 9999,
      sort: "defaultAddress:desc,createdAt:desc",
    });
  const { data: receivingAddresses, isFetching: isFetchingReceivingAddresses } =
    useAddressesQuery({
      page: 0,
      receivingAddress: true,
      size: 9999,
      sort: "defaultAddress:desc,createdAt:desc",
    });
  const {
    mutateAsync: updateDraftOrderAsync,
    isPending: isUpdatingDraftOrder,
  } = useUpdateDraftOrderMutation(draftOrderId);
  const createOrder = useCreateCustomerOrderMutation();
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [appliedVouchers, setAppliedVouchers] = useState<any[]>([]);
  const [pinOpen, setPinOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [savePassword, setSavePassword] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const currentProjectInfo = useMemo(
    () => tenantConfig || readJsonStorage("currentProjectInfo"),
    [tenantConfig]
  );
  const projectConfig = useMemo(
    () => currentProjectInfo?.tenantConfig || {},
    [currentProjectInfo]
  );
  const orderConfig = projectConfig?.orderConfig || {};
  const generalConfig = projectConfig?.generalConfig || {};
  const currentLoggedUser = useMemo(
    () => profile || readJsonStorage("currentLoggedUser"),
    [profile]
  );
  const tenantPercent = useMemo(() => {
    const customerLevel = currentLoggedUser?.customerEmdLevel;
    const customerGroup = currentLoggedUser?.customerGroup;
    let percent = Number(projectConfig?.emdPercent || 0);

    if (customerGroup?.emdPercent) percent = Number(customerGroup.emdPercent);
    if (customerGroup?.code === "default" && customerLevel?.emdPercent) {
      percent = Number(customerLevel.emdPercent);
    }

    return percent;
  }, [currentLoggedUser, projectConfig]);
  const [depositOnDemand, setDepositOnDemand] = useState<
    number | string | undefined
  >();
  const [depositExpanded, setDepositExpanded] = useState(true);
  const merchants = useMemo(
    () => (Array.isArray(draftOrder?.merchants) ? draftOrder.merchants : []),
    [draftOrder]
  );
  const sortedMerchants = useMemo(
    () =>
      merchants
        .slice()
        .sort(
          (left: any, right: any) =>
            Number(Boolean(right?.crossedThreshold)) -
            Number(Boolean(left?.crossedThreshold))
        ),
    [merchants]
  );
  const crossedThresholdMerchants = merchants.filter(
    (merchant: any) => merchant?.crossedThreshold === false
  );
  const draftAddressIsReceiving = !!draftOrder?.address?.receivingAddress;
  const isUsingReceiveAddress =
    draftAddressIsReceiving || !!draftOrder?.receiptAddress;
  const selectedAddressData = isUsingReceiveAddress
    ? draftOrder?.receiptAddress &&
      typeof draftOrder.receiptAddress === "object"
      ? draftOrder.receiptAddress
      : undefined
    : draftOrder?.address && typeof draftOrder.address === "object"
      ? draftOrder.address
      : undefined;
  const selectedAddressId =
    selectedAddressData?.id ||
    (isUsingReceiveAddress
      ? draftOrder?.receiptAddress?.id || draftOrder?.receiptAddress
      : draftOrder?.address?.id || draftOrder?.address);
  const selectedReceiveAddressData =
    isUsingReceiveAddress &&
    draftOrder?.address &&
    typeof draftOrder.address === "object"
      ? draftOrder.address
      : undefined;
  const selectedReceiveAddressId = isUsingReceiveAddress
    ? draftOrder?.address?.id || draftOrder?.address
    : undefined;
  const totalLink = crossedThresholdMerchants.reduce(
    (sum: number, merchant: any) => sum + getSkus(merchant).length,
    0
  );
  const totalQuantity = crossedThresholdMerchants.reduce(
    (sum: number, merchant: any) =>
      sum +
      getSkus(merchant).reduce(
        (merchantSum: number, sku: any) =>
          merchantSum + Number(sku.quantity || 0),
        0
      ),
    0
  );
  const balance = Number(balanceData?.balance || profile?.balance || 0);
  const creditLimit = Number(balanceData?.creditLimit || 0);
  const lackOfMoney =
    Number(draftOrder?.emdAmount || 0) > balance + creditLimit;
  const totalLackOfMoney = moneyCeil(
    Number(draftOrder?.emdAmount || 0) - balance
  );
  const totalCoupon = appliedVouchers.reduce(
    (sum, item) => sum + Number(item?.totalDiscountFee || 0),
    0
  );
  const suspensionSchedule = currentProjectInfo?.suspensionSchedule;
  const isOrderSuspended =
    suspensionSchedule &&
    Array.isArray(suspensionSchedule.appliedFor) &&
    suspensionSchedule.appliedFor.some(
      (item: string) => item === "ALL" || item === "ORDER"
    );
  const isOrderButtonDisabled = Boolean(isOrderSuspended || createOrder.isPending);
  const depositPercentages = Array.isArray(orderConfig.depositPercentage)
    ? orderConfig.depositPercentage
    : [];
  const pierced = projectConfig?.externalIntegrationConfig?.shopkeeper?.pierced;
  const trueStrike = currentLoggedUser?.customerGroup?.trueStrike;
  const checkForceTrueStrike = trueStrike === null ? pierced : trueStrike;
  const [depositMethodValue, setDepositMethodValue] = useState<{
    method: string;
    percent: number | string;
  }>({
    method: DEFAULT_METHOD_SELECTED,
    percent: tenantPercent,
  });
  const showDefaultDepositOption = !checkForceTrueStrike && tenantPercent === 0;
  const demandDepositPercentages =
    !checkForceTrueStrike && orderConfig.depositOnDemand
      ? depositPercentages.filter(
          (percent: number | string) => percent !== tenantPercent
        )
      : [];
  const hasDepositOptions =
    showDefaultDepositOption || demandDepositPercentages.length > 0;
  const notifyDraftOrderError = useCallback(
    (error: any) => {
      const title = getErrorTitle(error);
      if (title === "Network fail") return;

      const messageByTitle: Record<string, string> = {
        order_service_domestic_invalid:
          "message.address_order_service_domestic_invalid",
        order_service_international_invalid:
          "message.address_order_service_international_invalid",
      };

      notification.error({
        message: t(
          messageByTitle[title] || title || "message.unconnected_error"
        ),
      });
    },
    [notification, t]
  );
  const handleChangeDepositPercent = useCallback(
    async (percent: number | string) => {
      setDepositMethodValue({
        method: DEFAULT_METHOD_SELECTED,
        percent,
      });
      setDepositOnDemand(percent);

      try {
        await updateDraftOrderAsync({
          tags: [],
          depositOnDemand: percent,
        });
      } catch (error) {
        notifyDraftOrderError(error);
      }
    },
    [notifyDraftOrderError, updateDraftOrderAsync]
  );
  const selectAddress = useCallback(
    async (address: string | number) => {
      try {
        const depositOnDemand =
          draftOrder?.tags?.length > 0 ? undefined : draftOrder?.emdPercent;

        return await updateDraftOrderAsync({
          receiptAddress: null,
          address,
          depositOnDemand,
        });
      } catch (error) {
        notifyDraftOrderError(error);
        throw error;
      }
    },
    [draftOrder, notifyDraftOrderError, updateDraftOrderAsync]
  );
  const selectReceiveAddress = useCallback(
    async (address: string | number) => {
      try {
        return await updateDraftOrderAsync({
          receiptAddress: selectedAddressId,
          address,
          depositOnDemand:
            draftOrder?.tags?.length > 0 ? undefined : draftOrder?.emdPercent,
        });
      } catch (error) {
        notifyDraftOrderError(error);
        throw error;
      }
    },
    [
      draftOrder,
      notifyDraftOrderError,
      selectedAddressId,
      updateDraftOrderAsync,
    ]
  );
  const removeReceiveAddress = useCallback(async () => {
    try {
      return await updateDraftOrderAsync({
        receiptAddress: null,
        address: selectedAddressId,
        depositOnDemand:
          draftOrder?.tags?.length > 0 ? undefined : draftOrder?.emdPercent,
      });
    } catch (error) {
      notifyDraftOrderError(error);
      throw error;
    }
  }, [
    draftOrder,
    notifyDraftOrderError,
    selectedAddressId,
    updateDraftOrderAsync,
  ]);

  useEffect(() => {
    if (depositOnDemand === undefined && tenantPercent !== undefined) {
      setDepositOnDemand(tenantPercent);
      setDepositMethodValue({
        method: DEFAULT_METHOD_SELECTED,
        percent: tenantPercent,
      });
    }
  }, [depositOnDemand, tenantPercent]);

  const submitOrder = async (secret?: string) => {
    if (!draftOrder) return;
    if (!selectedAddressId) {
      notification.error({ message: t("cartCheckout.choose_address_error") });
      return;
    }
    if (pinOpen && !secret) {
      setPinError(t("cartCheckout.input_pin_error"));
      return;
    }

    const payload: Record<string, any> = {
      draftOrder: draftOrder.id,
      loanAmount: 0,
      couponCodes:
        appliedVouchers.length > 0
          ? appliedVouchers.map((item) => item.code)
          : undefined,
      depositOnDemand,
    };
    if (secret) {
      payload.password = secret;
      if (savePassword) payload.savePassword = true;
    }

    try {
      await createOrder.mutateAsync(payload);
      setPin("");
      setPinError("");
      setPinOpen(false);
      notification.success({ message: t("message.success") });
    } catch (error: any) {
      const title = getErrorTitle(error);
      if (title === "empty_password") {
        setPin("");
        setPinError("");
        setPinOpen(true);
        return;
      }
      if (
        title === "password_not_match" ||
        title === "invalid_password" ||
        title === "invalid_pin"
      ) {
        if (pinOpen) {
          setPinError(t("cartCheckout.incorrect_pin"));
        } else {
          setPin("");
          setPinError("");
          setPinOpen(true);
        }
        return;
      }
      const messageByTitle: Record<string, string> = {
        insufficient_balance: "cartCheckout.not_enough_money",
        config_group_changed: "cartCheckout.considering_before_deposit",
        system_currently_suspended: "cartCheckout.order_sespension",
        warehouse_location_not_mapped: "message.warehouse_location_not_mapped",
        other_marketplace_disabled: "message.other_marketplace_disabled",
        order_service_requires: "error.service_change",
        order_service_require_groups: "error.service_change",
        order_service_excludes: "error.service_change",
        order_service_exclude_groups: "error.service_change",
      };
      notification.error({
        message: t(messageByTitle[title] || `message.${title || "error"}`),
      });
    }
  };

  if (isLoading) return <Spin />;
  if (!draftOrder) return <Empty description={t("message.empty")} />;

  const columns = [
    {
      title: t("cartCheckout.product_info"),
      key: "product",
      width: 520,
      render: (_: unknown, sku: any) => {
        const image = getImage(sku);
        const productUrl = getProductUrl(sku);
        return (
          <Flex
            align="start"
            gap={token.marginSM}
            style={{ minWidth: 0, width: "100%" }}
          >
            {image ? (
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
              <Avatar
                shape="square"
                size={56}
                icon={<ShoppingCartOutlined />}
              />
            )}
            <Space
              direction="vertical"
              size={0}
              style={{ flex: "1 1 0", minWidth: 0, width: "100%" }}
            >
              <Typography.Text
                strong
                ellipsis={{ tooltip: getName(sku, true) }}
                style={{ display: "block", width: "100%" }}
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
                style={{ display: "block", width: "100%" }}
              >
                {getProperties(sku, true) || "---"}
              </Typography.Text>
              {sku.remark && (
                <Typography.Text
                  ellipsis={{ tooltip: sku.remark }}
                  style={{ display: "block", width: "100%" }}
                >
                  <Typography.Text type="secondary">
                    {t("cartCheckout.product_note")}:{" "}
                  </Typography.Text>
                  {sku.remark}
                </Typography.Text>
              )}
              {sku.note && (
                <Typography.Text
                  ellipsis={{ tooltip: sku.note }}
                  style={{ display: "block", width: "100%" }}
                >
                  <Typography.Text type="secondary">
                    {t("cartCheckout.personal_product_note")}:{" "}
                  </Typography.Text>
                  {sku.note}
                </Typography.Text>
              )}
            </Space>
          </Flex>
        );
      },
    },
    {
      title: t("cartCheckout.provisional_cal"),
      key: "amount",
      width: 160,
      align: "right" as const,
      render: (_: unknown, sku: any) => (
        <Space direction="vertical" size={0} align="end">
          <Typography.Text strong style={MONEY_TEXT_STYLE}>
            {formatCurrency(sku.exchangedTotalAmount || 0)}
          </Typography.Text>
          <Typography.Text type="secondary" style={MONEY_TEXT_STYLE}>
            {formatCurrency(sku.totalAmount || 0, getForeignCurrency(sku))}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: t("cartCheckout.quantity"),
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      render: (quantity: number) => (
        <Typography.Text>
          {quantity || 0} {t("cartCheckout.product")}
        </Typography.Text>
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
          {t("cartCheckout.order_info")}
        </Typography.Title>
      </Flex>

      <Row gutter={token.marginLG} align="top">
        <Col xs={24} xl={17}>
          <Space
            direction="vertical"
            size={token.marginMD}
            style={{ width: "100%" }}
          >
            {sortedMerchants.map((merchant: any) => {
              const skus = getSkus(merchant);
              const merchantQuantity = skus.reduce(
                (sum: number, sku: any) => sum + Number(sku.quantity || 0),
                0
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
                        {t("cartCheckout.quantity")}: {merchantQuantity}{" "}
                        {t("cartCheckout.product")} / {skus.length}{" "}
                        {t("cartCheckout.link_total")}
                      </Typography.Text>
                      <Tooltip title={t("cartCheckout.link_total")}>
                        <QuestionCircleOutlined
                          style={{ color: token.colorTextSecondary }}
                        />
                      </Tooltip>
                      <Typography.Text
                        type="secondary"
                        style={{ marginLeft: "auto", ...MONEY_TEXT_STYLE }}
                      >
                        {t("cartCheckout.amount_sum")}:{" "}
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
                    scroll={{ x: 800 }}
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
                        {t("cartCheckout.service")}:
                      </Typography.Text>
                      {Array.isArray(merchant.services) &&
                      merchant.services.length > 0 ? (
                        merchant.services
                          .slice()
                          .sort(
                            (left: any, right: any) =>
                              Number(left.position || 0) -
                              Number(right.position || 0)
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
                              {t("cartCheckout.note_order")}:{" "}
                            </Typography.Text>
                            {merchant.remark}
                          </Typography.Text>
                        )}
                        {merchant.note && (
                          <Typography.Text>
                            <Typography.Text type="secondary">
                              {t("cartCheckout.personal_note_for_order")}:{" "}
                            </Typography.Text>
                            {merchant.note}
                          </Typography.Text>
                        )}
                        {merchant.refCustomerCode && (
                          <Typography.Text>
                            <Typography.Text type="secondary">
                              {t("cartCheckout.customer_code")}:{" "}
                            </Typography.Text>
                            {merchant.refCustomerCode}
                          </Typography.Text>
                        )}
                        {merchant.refOrderCode && (
                          <Typography.Text>
                            <Typography.Text type="secondary">
                              {t("cartCheckout.customer_order_code")}:{" "}
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
                receivingAddresses={receivingAddresses?.data || []}
                selectedAddressData={selectedAddressData}
                selectedAddressId={selectedAddressId}
                selectedReceiveAddressData={selectedReceiveAddressData}
                selectedReceiveAddressId={selectedReceiveAddressId}
                isUsingReceiveAddress={isUsingReceiveAddress}
                isUpdating={isUpdatingDraftOrder}
                isAddressesFetching={isFetchingAddresses}
                isReceivingAddressesFetching={isFetchingReceivingAddresses}
                onSelectAddress={selectAddress}
                onSelectReceiveAddress={selectReceiveAddress}
                onRemoveReceiveAddress={removeReceiveAddress}
              />

              <Card
                style={{
                  borderColor: lackOfMoney
                    ? token.colorWarningBorder
                    : token.colorBorderSecondary,
                }}
              >
                <Space
                  direction="vertical"
                  size={token.marginSM}
                  style={{ width: "100%" }}
                >
                  <Flex justify="space-between" align="center">
                    <Typography.Text
                      strong
                      style={{ fontSize: token.fontSizeLG }}
                    >
                      {t("cart.deposit_information")}
                    </Typography.Text>
                    <Button
                      type="text"
                      size="small"
                      icon={depositExpanded ? <UpOutlined /> : <DownOutlined />}
                      onClick={() => setDepositExpanded((value) => !value)}
                    />
                  </Flex>
                  {hasDepositOptions && (
                    <>
                      <div
                        style={{
                          maxHeight: 360,
                          overflow: "auto",
                          width: "100%",
                        }}
                      >
                        <Space
                          direction="vertical"
                          size={0}
                          style={{ width: "100%" }}
                        >
                          {showDefaultDepositOption &&
                            (depositExpanded ||
                              (depositMethodValue.method ===
                                DEFAULT_METHOD_SELECTED &&
                                tenantPercent ===
                                  depositMethodValue.percent)) && (
                              <Radio
                                checked={
                                  depositMethodValue.method ===
                                    DEFAULT_METHOD_SELECTED &&
                                  tenantPercent === depositMethodValue.percent
                                }
                                onChange={() =>
                                  handleChangeDepositPercent(tenantPercent)
                                }
                              >
                                <Space direction="vertical" size={0}>
                                  <Typography.Text>
                                    {t("cart.deposit_with_tenant", {
                                      tenant_name:
                                        currentProjectInfo?.name || "",
                                      percent: tenantPercent,
                                    })}
                                  </Typography.Text>
                                  <Typography.Text
                                    strong
                                    style={{ color: token.colorPrimary }}
                                  >
                                    {formatCurrency(
                                      moneyCeil(
                                        percentToMoney(
                                          tenantPercent,
                                          draftOrder.exchangedTotalValue
                                        )
                                      )
                                    )}
                                  </Typography.Text>
                                </Space>
                              </Radio>
                            )}

                          {demandDepositPercentages.map(
                            (percent: number | string, index: number) => {
                              const hidden =
                                !depositExpanded &&
                                depositMethodValue.percent !== percent;

                              return (
                                <div key={index} hidden={hidden}>
                                  <Divider
                                    style={{
                                      display:
                                        !depositExpanded || !tenantPercent
                                          ? "none"
                                          : undefined,
                                      marginBlock: token.marginXS,
                                    }}
                                  />
                                  <Radio
                                    checked={
                                      depositMethodValue.method ===
                                        DEFAULT_METHOD_SELECTED &&
                                      percent === depositMethodValue.percent
                                    }
                                    onChange={() =>
                                      handleChangeDepositPercent(percent)
                                    }
                                  >
                                    <Space direction="vertical" size={0}>
                                      <Typography.Text>
                                        {t("cart.deposit_with_tenant", {
                                          tenant_name:
                                            currentProjectInfo?.name || "",
                                          percent,
                                        })}
                                      </Typography.Text>
                                      <Typography.Text
                                        strong
                                        style={{ color: token.colorPrimary }}
                                      >
                                        {formatCurrency(
                                          moneyCeil(
                                            percentToMoney(
                                              percent,
                                              draftOrder.exchangedTotalValue
                                            )
                                          )
                                        )}
                                      </Typography.Text>
                                    </Space>
                                  </Radio>
                                </div>
                              );
                            }
                          )}
                        </Space>
                      </div>
                      <Divider style={{ marginBlock: token.marginXS }} />
                    </>
                  )}

                  <Typography.Text strong>
                    {t("cartCheckout.product_info")}
                  </Typography.Text>
                  <Flex justify="space-between">
                    <Typography.Text type="secondary">
                      {t("cartCheckout.seller")}:
                    </Typography.Text>
                    <Typography.Text>{merchants.length}</Typography.Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Typography.Text type="secondary">
                      {t("cartCheckout.link_total")}:
                    </Typography.Text>
                    <Typography.Text>{totalLink}</Typography.Text>
                  </Flex>
                  <Divider style={{ marginBlock: token.marginXS }} />

                  <Flex justify="space-between" align="center">
                    <Typography.Text strong>
                      {t("cartCheckout.voucher")}
                    </Typography.Text>
                    <Button type="link" onClick={() => setVoucherOpen(true)}>
                      {t("coupon.voucher")}
                    </Button>
                  </Flex>
                  {appliedVouchers.map((voucher) => (
                    <Flex
                      key={voucher.code}
                      justify="space-between"
                      gap={token.marginSM}
                    >
                      <Space>
                        <Button
                          danger
                          type="text"
                          size="small"
                          icon={<CloseOutlined />}
                          onClick={() =>
                            setAppliedVouchers((items) =>
                              items.filter((item) => item.code !== voucher.code)
                            )
                          }
                        />
                        <Typography.Text>{voucher.code}</Typography.Text>
                      </Space>
                      <Typography.Text type="danger">
                        {formatCurrency(
                          moneyCeil(-Number(voucher.totalDiscountFee || 0))
                        )}
                      </Typography.Text>
                    </Flex>
                  ))}
                  <Divider style={{ marginBlock: token.marginXS }} />

                  <Typography.Text strong>
                    {t("cartCheckout.order_info")}
                  </Typography.Text>
                  <Flex justify="space-between">
                    <Typography.Text type="secondary">
                      {t("cartCheckout.provisional_fee")}:
                    </Typography.Text>
                    <Typography.Text strong>
                      {formatCurrency(moneyCeil(draftOrder.totalFee || 0))}
                    </Typography.Text>
                  </Flex>
                  {appliedVouchers.length > 0 && (
                    <Flex justify="space-between">
                      <Typography.Text type="secondary">
                        {t("cartCheckout.totalCoupon")}:
                      </Typography.Text>
                      <Typography.Text type="danger" strong>
                        {formatCurrency(moneyCeil(-totalCoupon))}
                      </Typography.Text>
                    </Flex>
                  )}
                  <Flex justify="space-between">
                    <Typography.Text type="secondary">
                      {t("cartCheckout.provisional_cal")} ({totalQuantity}{" "}
                      {t("cartCheckout.product")}):
                    </Typography.Text>
                    <Typography.Text strong>
                      {formatCurrency(
                        moneyCeil(draftOrder.exchangedTotalValue || 0)
                      )}
                    </Typography.Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Typography.Text type="secondary">
                      {t("cartCheckout.deposit")} {draftOrder.emdPercent || 0}%:
                    </Typography.Text>
                    <Typography.Text
                      strong
                      style={{
                        color: token.colorPrimary,
                        fontSize: token.fontSizeLG,
                      }}
                    >
                      {formatCurrency(moneyCeil(draftOrder.emdAmount || 0))}
                    </Typography.Text>
                  </Flex>
                  {lackOfMoney && (
                    <>
                      <Flex justify="space-between">
                        <Typography.Text type="secondary">
                          {t("cartCheckout.balance_account")}:
                        </Typography.Text>
                        <Typography.Text>
                          {balance >= 0 ? "+" : ""}
                          {formatCurrency(moneyCeil(balance))}
                        </Typography.Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Typography.Text type="secondary">
                          {t("cartCheckout.lack_of_money")}:
                        </Typography.Text>
                        <Typography.Text type="danger" strong>
                          {formatCurrency(totalLackOfMoney)}
                        </Typography.Text>
                      </Flex>
                    </>
                  )}
                  {crossedThresholdMerchants.length > 0 &&
                    (lackOfMoney ? (
                      <>
                        {generalConfig.depositWizard ? (
                          <>
                            <Button
                              size="large"
                              block
                              onClick={() => setDepositModalOpen(true)}
                            >
                              {t("cartCheckout.recharge")}
                            </Button>
                            <DepositModal
                              open={depositModalOpen}
                              onClose={() => setDepositModalOpen(false)}
                              maskClosable
                              data={{
                                step: 1,
                                hideStep: true,
                                type: "order",
                                money: totalLackOfMoney,
                              }}
                            />
                          </>
                        ) : (
                          <Button
                            size="large"
                            block
                            href="/profile/faqs?recharge"
                            target="_blank"
                          >
                            {t("cartCheckout.recharge")}
                          </Button>
                        )}
                        <Typography.Link
                          href="/profile/faqs?recharge"
                          target="_blank"
                        >
                          {t("cartCheckout.recharge_guide")}
                        </Typography.Link>
                        <Tooltip
                          title={t("cartCheckout.guide_recharge_into_account")}
                        >
                          <QuestionCircleOutlined
                            style={{
                              color: token.colorPrimary,
                              marginLeft: token.marginXS,
                            }}
                          />
                        </Tooltip>
                      </>
                    ) : (
                      <Button
                        type="primary"
                        size="large"
                        block
                        loading={createOrder.isPending}
                        disabled={isOrderButtonDisabled}
                        onClick={() => submitOrder()}
                      >
                        {t("cartCheckout.deposit_now")}
                      </Button>
                    ))}
                </Space>
              </Card>
            </Space>
          </Card>
        </Col>
      </Row>

      <DraftOrderVoucherModal
        open={voucherOpen}
        draftOrderId={draftOrderId}
        appliedVouchers={appliedVouchers}
        onApply={setAppliedVouchers}
        onClose={() => setVoucherOpen(false)}
      />

      <Modal
        title={t("modal.confirm_pin")}
        open={pinOpen}
        okText={t("cartCheckout.confirm")}
        cancelText={t("cartCheckout.cancel")}
        confirmLoading={createOrder.isPending}
        onCancel={() => {
          setPinOpen(false);
          setPin("");
          setPinError("");
        }}
        onOk={() => submitOrder(pin)}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Typography.Text>
            {t("cartCheckout.please_input_pin")}
          </Typography.Text>
          <Input.Password
            autoFocus
            value={pin}
            placeholder={t("cartCheckout.input_pin")}
            onChange={(event) => {
              setPin(event.target.value);
              setPinError("");
            }}
            onPressEnter={() => submitOrder(pin)}
          />
          {pinError && (
            <Typography.Text type="danger">{pinError}</Typography.Text>
          )}
          <Typography.Text type="secondary">
            {t("cartCheckout.default_pin")}
          </Typography.Text>
          <Checkbox
            checked={savePassword}
            onChange={(event) => setSavePassword(event.target.checked)}
          >
            {t("modal.save_password_60m")}
          </Checkbox>
        </Space>
      </Modal>
    </div>
  );
};

export default CartCheckoutStyleDefault;
