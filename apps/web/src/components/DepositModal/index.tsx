import { useEffect, useState } from "react";
import {
  Button,
  Col,
  Empty,
  Flex,
  Form,
  List,
  Modal,
  notification,
  Radio,
  Row,
  Space,
  Spin,
  Steps,
  Typography,
  theme,
} from "antd";
import { useTheme } from "@repo/theme-provider";
import { useTranslation } from "@repo/i18n";
import {
  useAvailableDeliveryOrdersQuery,
  useCartItemsQuery,
  useCustomerBalance,
  useCustomerProfile,
  useDepositQrQuery,
} from "@repo/hooks";
import { moneyCeil, moneyFormat } from "@repo/util";
import depositSuccessImage from "../../assets/deposit-success.svg";
import { LocaleInputNumber } from "../Common/LocaleInputNumber";

type DepositInfo = {
  type: "package" | "order" | "other";
  money: number;
};

type DepositModalProps = {
  open: boolean;
  onClose: () => void;
  data?: {
    step?: number;
    hideStep?: boolean;
    type?: DepositInfo["type"];
    money?: number;
  };
  maskClosable?: boolean;
};

const sumCartDeposit = (items: any[] = [], emdPercent = 100) =>
  moneyCeil(
    items.reduce(
      (total, item) => total + Number(item?.exchangedTotalValue || 0),
      0,
    ) *
      (emdPercent / 100),
  );

const sumAvailableOrderPayment = (orders: any[] = []) => {
  const packages = orders.flatMap((item) => item?.packages || []);
  const orderPackages = packages.filter((item) => !item.isShipment);
  const shipmentPackages = packages.filter((item) => item.isShipment);

  const orderCodes = Array.from(
    new Set(orderPackages.map((item) => item.orderCode)),
  );
  const shipmentCodes = Array.from(
    new Set(shipmentPackages.map((item) => item.orderCode)),
  );

  const orderTotal = orderCodes.reduce((total, code) => {
    const order = orders.find((item) => item.code === code);
    return total + Number(order?.totalUnpaid || 0);
  }, 0);

  const shipmentTotal = shipmentCodes.reduce((total, code) => {
    const shipment = orders.find((item) => item.code === code);
    const selectedPackages = shipmentPackages.filter(
      (item) => item.orderCode === code,
    );
    const selectedCodes = new Set(selectedPackages.map((item) => item.code));
    const unselectedShippingFee = (shipment?.packages || [])
      .filter((item: any) => !selectedCodes.has(item.code))
      .reduce(
        (sum: number, item: any) => sum + Number(item.shippingFee || 0),
        0,
      );
    return total + Number(shipment?.needToPaid || 0) - unselectedShippingFee;
  }, 0);

  return moneyCeil(orderTotal + shipmentTotal);
};

export const DepositModal = ({
  open,
  onClose,
  data,
  maskClosable = false,
}: DepositModalProps) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const { tenantConfig } = useTheme();
  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const [infoPayment, setInfoPayment] = useState<DepositInfo | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const generalConfig = tenantConfig?.tenantConfig?.generalConfig || {};
  const depositWizardMax = Number(generalConfig.depositWizardMax || 0);
  const { data: profile } = useCustomerProfile();
  const { data: balanceData, isLoading: isBalanceLoading } =
    useCustomerBalance();
  const { data: cartItemsResult, isLoading: isCartLoading } =
    useCartItemsQuery({}, open);
  const carts = cartItemsResult?.data || [];
  const { data: availableOrders = [], isLoading: isOrdersLoading } =
    useAvailableDeliveryOrdersQuery();

  const {
    data: depositQr,
    isLoading: isQrLoading,
    isError: isQrError,
  } = useDepositQrQuery(
    infoPayment?.money,
    open && current === 1 && !!infoPayment?.money,
  );

  const balance = Number(balanceData?.balance ?? profile?.balance ?? 0);
  const emdPercent = Number(profile?.customerGroup?.emdPercent || 100);

  const packageAmount = moneyCeil(
    sumAvailableOrderPayment(availableOrders) - balance,
  );
  const orderAmount = moneyCeil(sumCartDeposit(carts, emdPercent) - balance);
  const canContinue = Number(infoPayment?.money || 0) > 0;

  const options = [
    {
      title: t("deposit.purposePackage"),
      type: "package" as const,
      money: packageAmount,
      visible: availableOrders.length > 0 && packageAmount > 0,
      subtitle: moneyFormat(packageAmount),
    },
    {
      title: t("deposit.purposeOrder"),
      info: t("deposit.purposeOrderPercent", { value: emdPercent }),
      type: "order" as const,
      money: orderAmount,
      visible: carts.length > 0 && orderAmount > 0,
      subtitle: moneyFormat(orderAmount),
    },
    {
      title: t("deposit.purposeOther"),
      type: "other" as const,
      money: Number(infoPayment?.type === "other" ? infoPayment.money : 0),
      visible: true,
      subtitle: t("deposit.purposeOtherSubtitle"),
      extend: true,
    },
  ].filter((item) => item.visible);

  useEffect(() => {
    if (!open) return;
    if (data?.type && data.money !== undefined) {
      setInfoPayment({ type: data.type, money: data.money });
      setCurrent(data.step || 0);
      form.setFieldValue("money", data.money);
    }
  }, [data, form, open]);

  useEffect(() => {
    if (!open || current !== 1 || !isQrError) return;
    if (generalConfig.enableCashCollectionRequest) {
      window.location.href = `/cash-request?amount=${infoPayment?.money || ""}`;
      return;
    }
    notification.error({ message: t("deposit.depositUnavailable") });
  }, [
    current,
    generalConfig.enableCashCollectionRequest,
    infoPayment?.money,
    isQrError,
    open,
    t,
  ]);

  const reset = () => {
    onClose();
    setCurrent(0);
    setInfoPayment(null);
    setSuccessOpen(false);
    form.resetFields();
  };

  const handleContinue = () => {
    if (current === 1) {
      setSuccessOpen(true);
      return;
    }

    if (!infoPayment || Number(infoPayment.money || 0) <= 0) return;

    if (depositWizardMax > 0 && Number(infoPayment.money) > depositWizardMax) {
      notification.error({
        message: t("deposit.maxAmountError", {
          amount: moneyFormat(depositWizardMax),
        }),
      });
      return;
    }

    setCurrent(1);
  };

  const selectOption = (option: (typeof options)[number]) => {
    if (option.type === "other") {
      const money = Number(form.getFieldValue("money") || 0);
      setInfoPayment({ type: "other", money });
      return;
    }
    setInfoPayment({ type: option.type, money: option.money });
  };

  return (
    <>
      <Modal
        title={t("deposit.depositToAccount")}
        open={open && !successOpen}
        onCancel={reset}
        destroyOnClose
        maskClosable={maskClosable}
        width={680}
        footer={[
          <Button
            key="back"
            onClick={() =>
              current === 0 || data?.hideStep ? reset() : setCurrent(0)
            }
          >
            {current === 0 || data?.hideStep
              ? t("button.cancel")
              : t("button.back")}
          </Button>,
          <Button
            key="continue"
            type="primary"
            disabled={!canContinue}
            onClick={handleContinue}
          >
            {current === 1
              ? t("deposit.depositDone")
              : t("deposit.depositContinue")}
          </Button>,
        ]}
      >
        {!data?.hideStep && (
          <Row justify="center" style={{ marginBottom: token.marginLG }}>
            <Col xs={24} md={16}>
              <Steps
                current={current}
                items={[
                  { title: t("deposit.chooseReason") },
                  { title: t("deposit.scanDepositCode") },
                ]}
              />
            </Col>
          </Row>
        )}

        {current === 0 ? (
          <Space
            direction="vertical"
            size={token.margin}
            style={{ width: "100%" }}
          >
            <Typography.Paragraph>
              <span
                dangerouslySetInnerHTML={{
                  __html: t("deposit.step1Content", {
                    username: profile?.fullname || profile?.username || "",
                  }),
                }}
              />
            </Typography.Paragraph>
            <Radio.Group
              value={infoPayment?.type}
              style={{ width: "100%" }}
              onChange={(event) => {
                const option = options.find(
                  (item) => item.type === event.target.value,
                );
                if (option) selectOption(option);
              }}
            >
              <List
                loading={
                  isBalanceLoading ||
                  isCartLoading ||
                  isOrdersLoading
                }
                dataSource={options}
                split={false}
                renderItem={(item) => {
                  const selected = infoPayment?.type === item.type;

                  return (
                    <List.Item
                      onClick={() => selectOption(item)}
                      style={{
                        cursor: "pointer",
                        padding: token.paddingMD,
                        marginBottom: token.marginSM,
                        border: `1px solid ${
                          selected ? token.colorPrimaryBorder : token.colorBorder
                        }`,
                        borderRadius: token.borderRadiusLG,
                        background: selected
                          ? token.colorPrimaryBg
                          : token.colorBgContainer,
                      }}
                    >
                      <Flex
                        align="center"
                        gap={token.marginSM}
                        style={{ width: "100%" }}
                      >
                        <Radio value={item.type} />
                        <Flex
                          justify="space-between"
                          align="center"
                          gap={token.margin}
                          wrap="wrap"
                          style={{ flex: 1, minWidth: 0 }}
                        >
                          <Space direction="vertical" size={2}>
                            <Typography.Text strong>
                              {item.title}
                            </Typography.Text>
                            {item.info && (
                              <Typography.Text type="secondary">
                                {item.info}
                              </Typography.Text>
                            )}
                            {!item.extend && (
                              <Typography.Text
                                strong
                                style={{ color: token.colorPrimary }}
                              >
                                {item.subtitle}
                              </Typography.Text>
                            )}
                            {item.extend && (
                              <Typography.Text type="secondary">
                                {item.subtitle}
                              </Typography.Text>
                            )}
                          </Space>
                          {item.extend && (
                            <Form
                              form={form}
                              style={{ width: 200, maxWidth: "100%" }}
                            >
                              <Form.Item name="money" noStyle>
                                <LocaleInputNumber
                                  min={0}
                                  precision={0}
                                  controls={false}
                                  disabled={infoPayment?.type !== "other"}
                                  placeholder={t("deposit.anotherNumber")}
                                  suffix="₫"
                                  style={{ width: "100%" }}
                                  onClick={(event) => event.stopPropagation()}
                                  onFocus={() =>
                                    setInfoPayment({
                                      type: "other",
                                      money: Number(
                                        form.getFieldValue("money") || 0,
                                      ),
                                    })
                                  }
                                  onPressEnter={handleContinue}
                                  onChange={(value) =>
                                    setInfoPayment({
                                      type: "other",
                                      money: Number(value || 0),
                                    })
                                  }
                                />
                              </Form.Item>
                            </Form>
                          )}
                        </Flex>
                      </Flex>
                    </List.Item>
                  );
                }}
              />
            </Radio.Group>
          </Space>
        ) : (
          <Spin spinning={isQrLoading}>
            <Space
              direction="vertical"
              size={token.margin}
              style={{ width: "100%" }}
            >
              <Flex justify="space-between">
                <Typography.Text type="secondary">
                  {t("deposit.money")}
                </Typography.Text>
                <Typography.Text strong style={{ color: token.colorPrimary }}>
                  {moneyFormat(infoPayment?.money || 0)}
                </Typography.Text>
              </Flex>
              <Flex justify="space-between">
                <Typography.Text type="secondary">
                  {t("deposit.content")}
                </Typography.Text>
                <Typography.Text>{depositQr?.content || "---"}</Typography.Text>
              </Flex>
              <div
                style={{
                  borderTop: `1px dashed ${token.colorBorder}`,
                  marginBlock: token.margin,
                }}
              />
              {depositQr?.imageUrl ? (
                <Flex justify="center">
                  <img
                    alt="qrcode"
                    src={depositQr.imageUrl}
                    style={{ width: 260, height: 260 }}
                  />
                </Flex>
              ) : (
                !isQrLoading && <Empty description={t("common.no_data")} />
              )}
            </Space>
          </Spin>
        )}
      </Modal>

      <Modal
        open={successOpen}
        onCancel={reset}
        onOk={reset}
        okText={t("button.close")}
        cancelButtonProps={{ style: { display: "none" } }}
        centered
      >
        <Flex justify="center" style={{ marginBottom: token.marginLG }}>
          <img
            src={depositSuccessImage}
            alt=""
            style={{ width: 124, height: 125 }}
          />
        </Flex>
        <Typography.Paragraph
          style={{ textAlign: "center", marginTop: token.marginLG }}
        >
          {t("deposit.successContent")}
        </Typography.Paragraph>
      </Modal>
    </>
  );
};

export default DepositModal;
