import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Col,
  Empty,
  Flex,
  Form,
  InputNumber,
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
  useThirdPartyLoansQuery,
} from "@repo/hooks";
import { moneyCeil, moneyFormat } from "@repo/util";

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
    items.reduce((total, item) => total + Number(item?.exchangedTotalValue || 0), 0) *
      (emdPercent / 100),
  );

const sumAvailableOrderPayment = (orders: any[] = []) => {
  const packages = orders.flatMap((item) => item?.packages || []);
  const orderPackages = packages.filter((item) => !item.isShipment);
  const shipmentPackages = packages.filter((item) => item.isShipment);

  const orderCodes = Array.from(new Set(orderPackages.map((item) => item.orderCode)));
  const shipmentCodes = Array.from(new Set(shipmentPackages.map((item) => item.orderCode)));

  const orderTotal = orderCodes.reduce((total, code) => {
    const order = orders.find((item) => item.code === code);
    return total + Number(order?.totalUnpaid || 0);
  }, 0);

  const shipmentTotal = shipmentCodes.reduce((total, code) => {
    const shipment = orders.find((item) => item.code === code);
    const selectedPackages = shipmentPackages.filter((item) => item.orderCode === code);
    const selectedCodes = new Set(selectedPackages.map((item) => item.code));
    const unselectedShippingFee = (shipment?.packages || [])
      .filter((item: any) => !selectedCodes.has(item.code))
      .reduce((sum: number, item: any) => sum + Number(item.shippingFee || 0), 0);
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
  const { data: balanceData, isLoading: isBalanceLoading } = useCustomerBalance();
  const { data: carts = [], isLoading: isCartLoading } = useCartItemsQuery(open);
  const { data: availableOrders = [], isLoading: isOrdersLoading } =
    useAvailableDeliveryOrdersQuery();

  const orderCodes = useMemo(
    () => availableOrders.map((item: any) => item?.code).filter(Boolean).join(","),
    [availableOrders],
  );
  const { data: thirdPartyLoans, isLoading: isLoansLoading } = useThirdPartyLoansQuery(
    orderCodes,
    open && !!orderCodes,
  );
  const { data: depositQr, isLoading: isQrLoading, isError: isQrError } =
    useDepositQrQuery(infoPayment?.money, open && current === 1 && !!infoPayment?.money);

  const balance = Number(balanceData?.balance ?? profile?.balance ?? 0);
  const emdPercent = Number(profile?.customerGroup?.emdPercent || 100);
  const loanCredits = moneyCeil(
    (thirdPartyLoans?.loanCredits || []).reduce(
      (total: number, item: any) => total + Number(item?.totalAmountPay || 0),
      0,
    ),
  );

  const packageAmount = moneyCeil(sumAvailableOrderPayment(availableOrders) - balance + loanCredits);
  const orderAmount = moneyCeil(sumCartDeposit(carts, emdPercent) - balance);

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
  }, [current, generalConfig.enableCashCollectionRequest, infoPayment?.money, isQrError, open, t]);

  const reset = () => {
    onClose();
    setCurrent(0);
    setInfoPayment(null);
    form.resetFields();
  };

  const handleContinue = () => {
    if (current === 1) {
      reset();
      setTimeout(() => setSuccessOpen(true), 300);
      return;
    }

    if (!infoPayment) return;

    if (depositWizardMax > 0 && Number(infoPayment.money) > depositWizardMax) {
      notification.error({
        message: t("deposit.maxAmountError", { amount: moneyFormat(depositWizardMax) }),
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
        open={open}
        onCancel={reset}
        destroyOnClose
        maskClosable={maskClosable}
        width={680}
        footer={[
          <Button key="back" onClick={() => (current === 0 || data?.hideStep ? reset() : setCurrent(0))}>
            {current === 0 || data?.hideStep ? t("button.cancel") : t("button.back")}
          </Button>,
          <Button key="continue" type="primary" disabled={!infoPayment?.money} onClick={handleContinue}>
            {current === 1 ? t("deposit.depositDone") : t("deposit.depositContinue")}
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
          <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
            <Typography.Paragraph>
              <span
                dangerouslySetInnerHTML={{
                  __html: t("deposit.step1Content", {
                    username: profile?.fullname || profile?.username || "",
                  }),
                }}
              />
            </Typography.Paragraph>
            <Radio.Group value={infoPayment?.type} style={{ width: "100%" }}>
              <List
                loading={isBalanceLoading || isCartLoading || isOrdersLoading || isLoansLoading}
                dataSource={options}
                renderItem={(item) => (
                  <List.Item onClick={() => selectOption(item)} style={{ cursor: "pointer" }}>
                    <List.Item.Meta
                      title={
                        <Row align="middle" gutter={token.marginSM}>
                          <Col>
                            <Radio value={item.type} />
                          </Col>
                          <Col flex="auto">
                            <Flex justify="space-between" align="center" gap={token.margin}>
                              <Space direction="vertical" size={0}>
                                <Typography.Text>{item.title}</Typography.Text>
                                <Typography.Text type="secondary">{item.info}</Typography.Text>
                                <Typography.Text strong>{item.subtitle}</Typography.Text>
                              </Space>
                              {item.extend && (
                                <Form form={form}>
                                  <Form.Item name="money" noStyle>
                                    <InputNumber
                                      min={0}
                                      controls={false}
                                      placeholder={t("deposit.anotherNumber")}
                                      onClick={(event) => event.stopPropagation()}
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
                          </Col>
                        </Row>
                      }
                    />
                  </List.Item>
                )}
              />
            </Radio.Group>
          </Space>
        ) : (
          <Spin spinning={isQrLoading}>
            <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
              <Flex justify="space-between">
                <Typography.Text type="secondary">{t("deposit.money")}</Typography.Text>
                <Typography.Text strong style={{ color: token.colorPrimary }}>
                  {moneyFormat(infoPayment?.money || 0)}
                </Typography.Text>
              </Flex>
              <Flex justify="space-between">
                <Typography.Text type="secondary">{t("deposit.content")}</Typography.Text>
                <Typography.Text>{depositQr?.content || "---"}</Typography.Text>
              </Flex>
              <div style={{ borderTop: `1px dashed ${token.colorBorder}`, marginBlock: token.margin }} />
              {depositQr?.imageUrl ? (
                <Flex justify="center">
                  <img alt="qrcode" src={depositQr.imageUrl} style={{ width: 260, height: 260 }} />
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
        onCancel={() => setSuccessOpen(false)}
        onOk={() => setSuccessOpen(false)}
        okText={t("button.close")}
        cancelButtonProps={{ style: { display: "none" } }}
        centered
      >
        <Typography.Paragraph style={{ textAlign: "center", marginTop: token.marginLG }}>
          {t("deposit.successContent")}
        </Typography.Paragraph>
      </Modal>
    </>
  );
};

export default DepositModal;
