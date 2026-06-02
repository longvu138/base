import { useCallback, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import {
  Alert,
  App,
  Button,
  Card,
  Checkbox,
  Col,
  ConfigProvider,
  DatePicker,
  Divider,
  Empty,
  Flex,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Popconfirm,
  Radio,
  Row,
  Segmented,
  Select,
  Skeleton,
  Space,
  Steps,
  Tag,
  Typography,
  Upload,
  theme,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import {
  CheckOutlined,
  CloseOutlined,
  CreditCardOutlined,
  FileExcelOutlined,
  InfoCircleFilled,
  InfoCircleOutlined,
  PayCircleOutlined,
  PercentageOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SwapOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useMobilePeerPaymentsPage } from "@repo/hooks";
import { LocalStoreUtil, moneyFormat } from "@repo/util";
import { PinModal } from "@repo/ui";

const { Text, Title, Paragraph } = Typography;

const formatDateTime = (value?: string) =>
  value ? dayjs(value).format("HH:mm DD/MM/YYYY") : "---";

const formatCnyAmount = (value: unknown) => {
  const numberValue = Number(String(value ?? "").replace(/,/g, ""));
  if (
    value === null ||
    value === "" ||
    value === undefined ||
    Number.isNaN(numberValue)
  ) {
    return "---";
  }
  const currencies = LocalStoreUtil.getJson("currencies") || [];
  const currency = currencies.find((item: any) => item.code === "CNY") || {
    prefix: "¥",
    suffix: "",
  };
  return `${numberValue < 0 ? "-" : ""}${currency.prefix || ""}${Math.abs(
    numberValue,
  ).toLocaleString("en-US", { maximumFractionDigits: 4 })}${
    currency.suffix || ""
  }`;
};

const hashCode = (value = "") => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash);
  }
  return hash;
};

const intToRGB = (value: number) => {
  const color = (value & 0x00ffffff).toString(16).toUpperCase();
  return "00000".substring(0, 6 - color.length) + color;
};

const statusColor = (status?: string) => `#${intToRGB(hashCode(status || ""))}`;

const getStatusMeta = (statuses: any[] = [], code?: string) =>
  statuses.find((item) => item.code === code) || { name: code || "---" };

const renderBillRefText = (record: any) => {
  const billRef = Array.isArray(record?.billRef) ? record.billRef : [];
  if (!billRef.length) return "---";
  return billRef
    .map((item: any) => [item.code, item.billTo].filter(Boolean).join(" - "))
    .filter(Boolean)
    .join(", ");
};

const getAccountText = (record: any, peerPaymentType?: string) => {
  if (peerPaymentType === "transfer") {
    return [
      record?.beneficiaryAccount,
      record?.beneficiaryBank,
      record?.beneficiaryName,
      record?.beneficiaryBankBranch,
    ]
      .filter(Boolean)
      .join(" - ");
  }
  if (record?.qrcode) return "QR Code";
  return record?.paymentAccount || "---";
};

const defaultFeeLabels: Record<string, string> = {
  phi_dich_vu_co_dinh: "Phi dich vu co dinh",
  fee_optimization: "Phi toi uu",
};

const isValidUrl = (value?: string) => {
  try {
    const url = new URL(value || "");
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

const StepTitle = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      display: "inline-block",
      lineHeight: 1.3,
      maxWidth: 120,
      whiteSpace: "normal",
      wordBreak: "break-word",
    }}
  >
    {children}
  </span>
);

const PeerPaymentSkeleton = () => (
  <Card>
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Flex justify="space-between" gap={12}>
        <Space direction="vertical" size={6} style={{ flex: 1 }}>
          <Skeleton.Input active size="small" style={{ width: 148 }} />
          <Skeleton.Input active size="small" style={{ width: "82%" }} />
        </Space>
        <Skeleton.Button active size="small" style={{ width: 88 }} />
      </Flex>
      <Skeleton active title={false} paragraph={{ rows: 4 }} />
    </Space>
  </Card>
);

const Field = ({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Space direction="vertical" size={0} style={{ minWidth: 0, width: "100%" }}>
    <Text type="secondary">{label}</Text>
    <div style={{ minWidth: 0 }}>{children}</div>
  </Space>
);

const PeerPaymentCard = ({
  page,
  record,
  sentinelRef,
}: {
  page: ReturnType<typeof useMobilePeerPaymentsPage>;
  record: any;
  sentinelRef?: (node: HTMLDivElement | null) => void;
}) => {
  const { token } = theme.useToken();
  const statusMeta = getStatusMeta(page.statuses, record?.status);
  const canCharge = ["WAIT_FOR_PAYMENT", "REQUEST_FOR_PAY"].includes(
    record?.status,
  );
  const total = Number(record?.totalFee || 0) + Number(record?.exchangedAmount || 0);

  return (
    <div ref={sentinelRef}>
      <Card styles={{ body: { padding: token.paddingMD } }}>
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <Flex justify="space-between" align="flex-start" wrap gap={8}>
            <Space direction="vertical" size={0} style={{ minWidth: 0, flex: 1 }}>
              <Text type="secondary">{page.t("peer_payment.code")}</Text>
              {record?.code ? (
                <Paragraph
                  copyable={{ text: record.code }}
                  style={{ marginBottom: 0 }}
                  ellipsis
                >
                  <Link to={`/peer-payments/${record.code}`}>
                    <Text strong style={{ color: token.colorPrimary }}>
                      {record.code}
                    </Text>
                  </Link>
                </Paragraph>
              ) : (
                <Text>---</Text>
              )}
            </Space>
            <Tag
              style={{
                backgroundColor: statusColor(record?.status),
                color: token.colorWhite,
                whiteSpace: "normal",
                lineHeight: 1.4,
                marginInlineEnd: 0,
                maxWidth: 160,
              }}
            >
              {statusMeta.name || record?.status || "---"}
            </Tag>
          </Flex>

          <Flex gap={12} wrap>
            <div style={{ flex: "1 1 130px", minWidth: 0 }}>
              <Field label={page.t("peer_payment.trxTime")}>
                <Text>{formatDateTime(record?.trxTime)}</Text>
              </Field>
            </div>
            <div style={{ flex: "1 1 130px", minWidth: 0 }}>
              <Field label={page.t("peer_payment.amount")}>
                <Text strong>{moneyFormat(record?.amount, record?.currency)}</Text>
              </Field>
            </div>
            <div style={{ flex: "1 1 130px", minWidth: 0 }}>
              <Field label={page.t("peer_payment.exchangedAmount")}>
                <Text>{moneyFormat(record?.exchangedAmount)}</Text>
              </Field>
            </div>
            <div style={{ flex: "1 1 130px", minWidth: 0 }}>
              <Field label={page.t("fee_tab.service_fee")}>
                <Text>{moneyFormat(record?.totalFee)}</Text>
              </Field>
            </div>
            <div style={{ flex: "1 1 130px", minWidth: 0 }}>
              <Field label={page.t("orderDetail.total_money")}>
                <Text strong>{moneyFormat(total)}</Text>
              </Field>
            </div>
          </Flex>

          <Field
            label={
              page.peerPaymentType === "transfer"
                ? page.t("peer_payment.beneficiaryAccount")
                : page.t("peer_payment.paymentAccount")
            }
          >
            <Text>{getAccountText(record, page.peerPaymentType)}</Text>
          </Field>

          <Field
            label={
              page.peerPaymentType === "transfer"
                ? page.t("peer_payment.memo")
                : page.t("peer_payment.originalReceiptCode")
            }
          >
            <Text>
              {page.peerPaymentType === "transfer"
                ? record?.memo || "---"
                : renderBillRefText(record)}
            </Text>
          </Field>

          {record?.shipmentCode ? (
            <Field label={page.t("peer_payment.shipmentCode")}>
              <Link to={`/shipments/${record.shipmentCode}`}>
                {record.shipmentCode}
              </Link>
            </Field>
          ) : null}

          {record?.note ? (
            <Field label={page.t("peer_payment.note")}>
              <Text>{record.note}</Text>
            </Field>
          ) : null}

          {canCharge ? (
            <Flex justify="flex-end">
              <Popconfirm
                title={page.t("peer_payment.payment_action_confirm")}
                okText={page.t("button.yes")}
                cancelText={page.t("button.no")}
                onConfirm={() => page.handleCharge(record.code, record)}
              >
                <Button
                  type="primary"
                  icon={<CreditCardOutlined />}
                  loading={page.chargingCode === record.code}
                >
                  {page.t("peer_payment.rowPayment")}
                </Button>
              </Popconfirm>
            </Flex>
          ) : null}
        </Space>
      </Card>
    </div>
  );
};

export const PeerPaymentsStyleDefault = () => {
  const { token } = theme.useToken();
  const { notification } = App.useApp();
  const page = useMobilePeerPaymentsPage();
  const [createModalType, setCreateModalType] = useState<"payment" | "transfer">();
  const [createStep, setCreateStep] = useState(1);
  const [createPaymentType, setCreatePaymentType] = useState<"alipay" | "company">("alipay");
  const [createPayInputType, setCreatePayInputType] = useState<"paymentAccount" | "qrCode">("paymentAccount");
  const [createExchangeRate, setCreateExchangeRate] = useState<any>({});
  const [createDraftFees, setCreateDraftFees] = useState<any>({});
  const [createBetterOffer, setCreateBetterOffer] = useState(0);
  const [createBetterOfferFees, setCreateBetterOfferFees] = useState<any>({});
  const [createPaymentDraftValues, setCreatePaymentDraftValues] = useState<Record<string, any>>({});
  const [qrCodeFiles, setQrCodeFiles] = useState<UploadFile[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [createForm] = Form.useForm();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const createExchangeRateRequestRef = useRef(0);
  const createExchangeRateKeyRef = useRef("");
  const createExchangeRateResultRef = useRef<any>({});
  const watchedCreateAmount = Form.useWatch("amount", createForm);
  const watchedCreatePaymentMethodCode = Form.useWatch(
    "paymentMethodCode",
    createForm,
  );
  const sentinelIndex = Math.max(page.rows.length - 5, 0);
  const isPaymentType = page.peerPaymentType === "payment";
  const currentCreatePaymentMethodCode =
    watchedCreatePaymentMethodCode || createForm.getFieldValue("paymentMethodCode");
  const createMutationLoading =
    page.createRequestForPayMutation.isPending ||
    page.askForPayMutation.isPending ||
    page.createPayAnInvoiceMutation.isPending ||
    page.askToPayAnInvoiceMutation.isPending ||
    page.createTransferMutation.isPending ||
    page.paymentQuotationMutation.isPending ||
    page.betterOfferMutation.isPending ||
    page.placeOrderBetterOfferMutation.isPending;

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      if (!node || !page.hasNextPage || page.isFetchingNextPage || page.isLoading) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (
            entries[0]?.isIntersecting &&
            page.hasNextPage &&
            !page.isFetchingNextPage
          ) {
            page.fetchNextPage();
          }
        },
        { rootMargin: "200px 0px" },
      );
      observerRef.current.observe(node);
    },
    [page.fetchNextPage, page.hasNextPage, page.isFetchingNextPage, page.isLoading],
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  const openCreateModal = (type: "payment" | "transfer") => {
    createExchangeRateRequestRef.current += 1;
    createExchangeRateKeyRef.current = "";
    createExchangeRateResultRef.current = {};
    createForm.resetFields();
    const defaultType =
      page.tenantConfigPayment?.config?.paymentAlipay === true
        ? "alipay"
        : "company";
    const defaultTransferMethod =
      page.tenantConfigPayment?.config?.transferAlipay === true &&
      page.tenantConfigPayment?.config?.transferBank !== true
        ? "alipay"
        : "bank_transfer";
    setCreateStep(1);
    setCreatePaymentType(defaultType);
    setCreatePayInputType("paymentAccount");
    setCreateExchangeRate({});
    setCreateDraftFees({});
    setCreateBetterOffer(0);
    setCreateBetterOfferFees({});
    setCreatePaymentDraftValues({});
    setQrCodeFiles([]);
    createForm.setFieldsValue({
      paymentMethodCode: type === "transfer" ? defaultTransferMethod : "alipay",
      requestForPayType: defaultType,
    });
    setCreateModalType(type);
  };

  const loadCreateExchangeRate = useCallback(
    async (values?: { amount?: number; paymentMethodCode?: string }) => {
      const amount = values?.amount ?? createForm.getFieldValue("amount");
      if (!amount) {
        createExchangeRateKeyRef.current = "";
        createExchangeRateResultRef.current = {};
        setCreateExchangeRate({});
        return {};
      }

      const paymentMethodCode =
        createModalType === "transfer"
          ? values?.paymentMethodCode ?? createForm.getFieldValue("paymentMethodCode")
          : "alipay";
      const requestKey = `${createModalType || ""}|${amount}|${paymentMethodCode || ""}`;
      if (createExchangeRateKeyRef.current === requestKey) {
        return createExchangeRateResultRef.current;
      }

      const requestId = createExchangeRateRequestRef.current + 1;
      createExchangeRateRequestRef.current = requestId;
      createExchangeRateKeyRef.current = requestKey;
      try {
        const response = await page.exchangeRateMutation.mutateAsync({
          amount,
          paymentMethodCode,
        });
        if (requestId === createExchangeRateRequestRef.current) {
          createExchangeRateResultRef.current = response || {};
          setCreateExchangeRate(response || {});
        }
        return response || {};
      } catch (error) {
        if (requestId === createExchangeRateRequestRef.current) {
          createExchangeRateKeyRef.current = "";
        }
        throw error;
      }
    },
    [createForm, createModalType, page.exchangeRateMutation],
  );

  useEffect(() => {
    if (!createModalType || createStep !== 1) return;

    const amount = Number(watchedCreateAmount || 0);
    if (!amount) {
      setCreateExchangeRate({});
      return;
    }

    const timeoutId = window.setTimeout(() => {
      loadCreateExchangeRate({
        amount,
        paymentMethodCode: currentCreatePaymentMethodCode,
      }).catch(() => undefined);
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [
    createModalType,
    createStep,
    currentCreatePaymentMethodCode,
    loadCreateExchangeRate,
    watchedCreateAmount,
  ]);

  const buildCreatePaymentPayload = (values: Record<string, any>, exchangeRate?: any) => {
    const { requestForPayType: _requestForPayType, ...payloadValues } = values;
    return {
      ...payloadValues,
      amount: Number(values.amount || 0),
      paymentMethodCode: values.paymentMethodCode || "alipay",
      exchangeRate: exchangeRate?.rate,
      originalReceipts: [
        {
          code:
            typeof values.originalReceipts === "string"
              ? values.originalReceipts.trim()
              : values.originalReceipts,
          billTo: values.billTo,
        },
      ],
    };
  };

  const submitCreatePaymentStepOne = async () => {
    const values = await createForm.validateFields();
    const exchangeRate = await loadCreateExchangeRate();
    const payload = buildCreatePaymentPayload(values, exchangeRate);
    const draftFees = await page.paymentQuotationMutation.mutateAsync(payload);
    setCreateBetterOffer(0);
    setCreateBetterOfferFees({});
    setCreatePaymentDraftValues({
      ...values,
      paymentMethodCode: values.paymentMethodCode || "alipay",
      requestForPayType: createPaymentType,
    });
    setCreateDraftFees(draftFees);
    setCreateStep(2);

    if (createPaymentType === "company") {
      page.betterOfferMutation
        .mutateAsync({
          thirdParty: "1688",
          credentialAccount: values.billTo,
          originalReceipt: values.originalReceipts,
        })
        .then(async (betterOfferResponse: any) => {
          const yoursTotalAmount = Number(betterOfferResponse?.yours?.totalAmount || 0);
          const oursTotalAmount = Number(betterOfferResponse?.ours?.totalAmount || 0);
          if (yoursTotalAmount <= oursTotalAmount) {
            setCreateBetterOffer(0);
            return;
          }

          const betterPayload = {
            ...payload,
            gobizOffer: {
              oldOffer: betterOfferResponse?.yours || {},
              newOffer: betterOfferResponse?.ours || {},
            },
          };
          const feesBetterOffer = await page.paymentQuotationMutation.mutateAsync(betterPayload);
          setCreateBetterOffer(oursTotalAmount);
          setCreateBetterOfferFees(feesBetterOffer);
        })
        .catch(() => {
          setCreateBetterOffer(0);
          setCreateBetterOfferFees({});
        });
    }
  };

  const submitCreateTransferStepOne = async () => {
    const values = await createForm.validateFields();
    const exchangeRate = await loadCreateExchangeRate();
    const payload = {
      ...values,
      amount: Number(values.amount || 0),
      exchangeRate: exchangeRate?.rate,
    };
    const draftFees = await page.paymentQuotationMutation.mutateAsync(payload);
    setCreatePaymentDraftValues(values);
    setCreateDraftFees(draftFees);
    setCreateStep(2);
  };

  const getCreateRequestErrorMessage = (error: any) => {
    const title = error?.response?.data?.title || error?.title;
    if (title === "customer_not_found") return page.t("peer_payment.customer_not_found");
    if (title === "payment_method_not_found") return page.t("peer_payment.payment_method_not_found");
    if (title === "payment_account_not_found") return page.t("peer_payment.payment_account_not_found");
    if (title === "shipment_required_when_create_pp") return page.t("peer_payment.shipment_required_when_create_pp");
    if (title === "invalid_original_receipt_code") return page.t("peer_payment.invalid_original_receipt_code");
    return error?.response?.data?.message || error?.message || page.t("message.system_error_contact_technical");
  };

  const resetCreateBetterOffer = () => {
    setCreateBetterOffer(0);
    setCreateBetterOfferFees({});
  };

  const resetCreateModal = () => {
    setCreateModalType(undefined);
    setCreateStep(1);
    setCreateExchangeRate({});
    setCreateDraftFees({});
    resetCreateBetterOffer();
    setCreatePaymentDraftValues({});
    setQrCodeFiles([]);
  };

  const backCreateStep = () => {
    if (createStep > 1) {
      setCreateStep(createStep - 1);
      if (createModalType === "payment") resetCreateBetterOffer();
      return;
    }
    resetCreateModal();
  };

  const closeCreateModal = () => {
    if (createStep > 1) {
      setCreateStep(createStep - 1);
      if (createModalType === "payment") resetCreateBetterOffer();
      return;
    }
    resetCreateModal();
  };

  const submitCreateBetterOffer = async () => {
    const code = createPaymentDraftValues.originalReceipts;
    const { requestForPayType: _requestForPayType, ...draftValues } =
      createPaymentDraftValues;
    const payload = {
      ...draftValues,
      paymentMethodCode: createPaymentDraftValues.paymentMethodCode || "alipay",
      paymentAccount: createPaymentDraftValues.billTo,
      originalReceipts: code
        ? [
            {
              code,
              billTo: createPaymentDraftValues.billTo,
              amount: Number(createPaymentDraftValues.amount || 0),
            },
          ]
        : undefined,
    };
    try {
      await page.placeOrderBetterOfferMutation.mutateAsync(payload);
      notification.success({
        message: page.t("message.place_order_with_better_offer_success"),
      });
      resetCreateModal();
    } catch (error: any) {
      notification.error({ message: getCreateRequestErrorMessage(error) });
    }
  };

  const submitCreateModal = async () => {
    try {
      const values = await createForm.validateFields();
      if (createModalType === "payment") {
        if (createStep === 1) {
          await submitCreatePaymentStepOne();
          return;
        }
        await page.handleCreatePaymentRequest(
          { ...createPaymentDraftValues, ...values },
          {
            needPayOnRequest:
              page.tenantConfigPayment?.peerPaymentConfig?.needPayOnRequest,
          },
        );
      } else {
        if (createStep === 1) {
          await submitCreateTransferStepOne();
          return;
        }
        await page.handleCreateTransferRequest(createPaymentDraftValues);
      }
      resetCreateModal();
    } catch (error: any) {
      if (error?.errorFields) return;
      if ((error?.response?.data?.title || error?.title) === "insufficient_balance") {
        notification.success({ message: page.t("message.success") });
        resetCreateModal();
        return;
      }
      notification.error({ message: getCreateRequestErrorMessage(error) });
    }
  };

  const createAmount = Number(
    (createStep > 1 ? createPaymentDraftValues.amount : watchedCreateAmount) || 0,
  );
  const createExchangedAmount =
    createAmount && createExchangeRate?.rate
      ? createAmount * Number(createExchangeRate.rate || 0)
      : 0;
  const createFeeItems = Array.isArray(createDraftFees?.listFees)
    ? createDraftFees.listFees
    : [];
  const createTotalMoney = createFeeItems.reduce(
    (sum: number, item: any) => sum + Number(item.provisionalAmount || 0),
    createExchangedAmount,
  );
  const createBetterOfferFeeItems = Array.isArray(createBetterOfferFees?.listFees)
    ? createBetterOfferFees.listFees
    : [];
  const createBetterOfferExchangedAmount =
    createBetterOffer * Number(createExchangeRate?.rate || 0);
  const createBetterOfferTotalMoney = createBetterOfferFeeItems.reduce(
    (sum: number, item: any) => sum + Number(item.provisionalAmount || 0),
    createBetterOfferExchangedAmount,
  );
  const hasCreateFeeWarning = createFeeItems.some(
    (item: any) =>
      item.provisionalAmount === null || item.provisionalAmount === undefined,
  );

  const submitExport = async (pin: string) => {
    const isSuccess = await page.handleExport(pin);
    if (isSuccess) setExportOpen(false);
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card styles={{ body: { padding: token.paddingMD } }}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Flex justify="space-between" align="center" wrap gap={token.marginSM}>
            <Title level={4} style={{ margin: 0 }}>
              {page.t("peer_payment.title_page")}
            </Title>
          </Flex>

          <ConfigProvider
            theme={{
              components: {
                Segmented: {
                  itemSelectedBg: token.colorPrimary,
                  itemSelectedColor: token.colorTextLightSolid,
                },
              },
            }}
          >
            <Segmented
              block
              value={page.peerPaymentType}
              onChange={(value) => page.handleTypeChange(String(value))}
              options={[
                {
                  value: "payment",
                  label: (
                    <Flex align="center" justify="center" gap={token.marginXS}>
                      <PayCircleOutlined />
                      {page.t("peer_payment.btnPayment")}
                    </Flex>
                  ),
                },
                {
                  value: "transfer",
                  label: (
                    <Flex align="center" justify="center" gap={token.marginXS}>
                      <SwapOutlined />
                      {page.t("peer_payment.create_transfer")}
                    </Flex>
                  ),
                },
              ]}
            />
          </ConfigProvider>
        </Space>
      </Card>

      {page.dailyMessage ? (
        <Alert
          message={<Text strong>{page.t("order.notification")}</Text>}
          description={
            <span dangerouslySetInnerHTML={{ __html: page.dailyMessage }} />
          }
          type="success"
          showIcon
          closable
        />
      ) : null}

      <Card styles={{ body: { padding: token.paddingMD } }}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: token.marginSM,
              padding: token.paddingSM,
              borderRadius: token.borderRadiusLG,
              background: token.colorFillTertiary,
              color: page.firstExchangeRate
                ? token.colorText
                : token.colorTextDisabled,
            }}
          >
            <InfoCircleOutlined
              style={{
                color: page.firstExchangeRate
                  ? token.colorPrimary
                  : token.colorTextDisabled,
                marginTop: 2,
              }}
            />
            <Text style={{ flex: 1, minWidth: 0 }}>
              {page.exchangeRangeText}
            </Text>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
              gap: token.marginSM,
            }}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openCreateModal(isPaymentType ? "payment" : "transfer")}
              block
              style={{ height: "auto", minHeight: 40, whiteSpace: "normal" }}
            >
              {isPaymentType
                ? page.t("peer_payment.create_request_for_pay")
                : page.t("peer_payment.create_transfer")}
            </Button>
            <Button
              icon={<FileExcelOutlined />}
              loading={page.exportMutation.isPending}
              onClick={() => setExportOpen(true)}
              block
              style={{ height: "auto", minHeight: 40, whiteSpace: "normal" }}
            >
              {page.t("shipment.btn_export_csv")}
            </Button>
          </div>
        </Space>
      </Card>

      <Card styles={{ body: { padding: token.paddingMD } }}>
        <Form form={page.form} layout="vertical" onFinish={page.handleSearch}>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Form.Item name="query" label={page.t("peer_payment.code")}>
              <Input placeholder={page.t("peer_payment.code")} allowClear />
            </Form.Item>

            {page.peerPaymentType !== "transfer" ? (
              <Form.Item
                name="paymentAccount"
                label={page.t("peer_payment.paymentAccount")}
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder={page.t("peer_payment.select_paymentAccount")}
                  options={page.paymentAccounts.map((item: any) => ({
                    value: item.account || item.code || item.id,
                    label:
                      item.displayName ||
                      item.account ||
                      item.name ||
                      item.code,
                  }))}
                />
              </Form.Item>
            ) : (
              <Form.Item
                name="beneficiaryAccount"
                label={page.t("peer_payment.beneficiaryAccount")}
              >
                <Input
                  placeholder={page.t("peer_payment.beneficiaryAccount")}
                  allowClear
                />
              </Form.Item>
            )}

            <Form.Item label={page.t("peer_payment.trxTime")}>
              <Flex gap={8}>
                <Form.Item name="timestampFrom" noStyle>
                  <DatePicker
                    format="DD/MM/YYYY"
                    placeholder={page.t("peer_payment.filterMilestoneFrom")}
                    style={{ width: "50%" }}
                  />
                </Form.Item>
                <Form.Item name="timestampTo" noStyle>
                  <DatePicker
                    format="DD/MM/YYYY"
                    placeholder={page.t("peer_payment.filterMilestoneTo")}
                    style={{ width: "50%" }}
                  />
                </Form.Item>
              </Flex>
            </Form.Item>

            {page.peerPaymentType !== "transfer" ? (
              <>
                <Form.Item
                  name="originalReceiptCode"
                  label={page.t("peer_payment.originalReceiptCode")}
                >
                  <Input
                    placeholder={page.t("peer_payment.originalReceiptCode")}
                    allowClear
                  />
                </Form.Item>
                <Form.Item name="billTo" label={page.t("peer_payment.billTo")}>
                  <Input
                    placeholder={page.t("peer_payment.billTo_enter")}
                    allowClear
                  />
                </Form.Item>
              </>
            ) : null}

            <Form.Item name="statuses" label={page.t("tickets.status")}>
              <Checkbox.Group>
                <Space wrap>
                  {page.statuses.map((status: any) => (
                    <Checkbox key={status.code} value={status.code}>
                      {status.name}
                    </Checkbox>
                  ))}
                </Space>
              </Checkbox.Group>
            </Form.Item>

            <Form.Item
              name="paymentMethod"
              label={page.t("peer_payment.payment_method")}
            >
              <Checkbox.Group>
                <Space wrap>
                  {page.paymentMethods.map((method: any) => (
                    <Checkbox key={method.code} value={method.code}>
                      {method.name}
                    </Checkbox>
                  ))}
                </Space>
              </Checkbox.Group>
            </Form.Item>

            <Flex justify="flex-end">
              <Space wrap>
                <Button onClick={page.handleReset} icon={<ReloadOutlined />}>
                  {page.t("orders.buttons.reset")}
                </Button>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  {page.t("orders.buttons.search")}
                </Button>
              </Space>
            </Flex>
          </Space>
        </Form>
      </Card>

      {page.isLoading ? (
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <PeerPaymentSkeleton key={index} />
          ))}
        </Space>
      ) : page.rows.length ? (
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <List
            split={false}
            dataSource={page.rows}
            rowKey={(record: any) => record.code}
            renderItem={(record: any, index) => (
              <List.Item
                style={{
                  padding: 0,
                  borderBlockEnd: "none",
                  marginBottom:
                    index === page.rows.length - 1 ? 0 : token.marginMD,
                }}
              >
                <PeerPaymentCard
                  page={page}
                  record={record}
                  sentinelRef={index === sentinelIndex ? sentinelRef : undefined}
                />
              </List.Item>
            )}
          />
          {page.isFetchingNextPage ? <PeerPaymentSkeleton /> : null}
          {!page.hasNextPage ? (
            <Text
              type="secondary"
              style={{ display: "block", textAlign: "center" }}
            >
              {page.t("common.no_more_data")}
            </Text>
          ) : null}
        </Space>
      ) : (
        <Card>
          <Empty description={page.t("common.no_data")} />
        </Card>
      )}

      <Modal
        title={
          createModalType === "payment"
            ? page.t("peer_payment.create_request_for_pay")
            : page.t("peer_payment.create_transfer")
        }
        open={Boolean(createModalType)}
        onCancel={closeCreateModal}
        onOk={submitCreateModal}
        confirmLoading={createMutationLoading}
        okText={page.t("common.confirm")}
        cancelText={createStep > 1 ? page.t("button.back") : page.t("common.cancel")}
        cancelButtonProps={{ onClick: backCreateStep }}
        okButtonProps={{ disabled: createStep === 1 && createExchangeRate?.rate === null }}
        width={600}
        centered
        style={{ maxWidth: "calc(100vw - 32px)" }}
        styles={{
          body: {
            maxHeight: "calc(100vh - 220px)",
            overflowX: "hidden",
            overflowY: "auto",
          },
        }}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical">
          {createModalType === "payment" ? (
            <>
              <Steps
                responsive={false}
                labelPlacement="vertical"
                current={createStep - 1}
                style={{ maxWidth: "100%", margin: "0 auto 24px" }}
                items={[
                  { title: <StepTitle>{page.t("peer_payment.request_for_pay_info")}</StepTitle> },
                  { title: <StepTitle>{page.t("common.confirm")}</StepTitle> },
                ]}
              />
              {createStep === 1 ? (
                <>
                  <Form.Item
                    name="amount"
                    label={page.t("peer_payment.amount")}
                    rules={[{ required: true, message: page.t("order.quantity_required") }]}
                  >
                    <InputNumber<number>
                      min={Number(1)}
                      precision={2}
                      style={{ width: "100%" }}
                      placeholder={page.t("peer_payment.amount_placeholder")}
                      formatter={(value) => `${value ?? ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      parser={(value) => Number(String(value || "").replace(/\$\s?|(,*)/g, ""))}
                    />
                  </Form.Item>
                  {createExchangeRate?.rate === null && (
                    <Text type="danger">
                      {page.t("peerPayment.minPayment", { value: createExchangeRate.minPayment })}
                    </Text>
                  )}
                  {createExchangeRate?.base && (
                    <div style={{ marginTop: -12, marginBottom: 16 }}>
                      <Text type="secondary">{page.t("header.exchange")}</Text>{" "}
                      <Text>
                        {moneyFormat(1, createExchangeRate.base)} ={" "}
                        {moneyFormat(createExchangeRate.rate, createExchangeRate.exchange)}
                      </Text>
                    </div>
                  )}
                  <div style={{ marginTop: -8, marginBottom: 20 }}>
                    <Text>
                      {page.t("peer_payment.exchangedAmount")}:{" "}
                      <Text strong>{moneyFormat(createExchangedAmount)}</Text>
                    </Text>
                  </div>

                  <Form.Item name="requestForPayType" style={{ marginBottom: 20 }}>
                    <Radio.Group
                      value={createPaymentType}
                      onChange={(event) => {
                        setCreatePaymentType(event.target.value);
                        createForm.setFieldsValue({
                          requestForPayType: event.target.value,
                          billTo: undefined,
                          paymentAccount: undefined,
                          paymentLink: undefined,
                          qrCode: undefined,
                        });
                      }}
                    >
                      <Space wrap>
                        {page.tenantConfigPayment?.config?.paymentAlipay === true && (
                          <Radio value="alipay">{page.t("peer_payment.request_for_pay_ali")}</Radio>
                        )}
                        {page.tenantConfigPayment?.config?.payment1688Business === true && (
                          <Radio value="company">{page.t("peer_payment.request_for_pay_company")}</Radio>
                        )}
                      </Space>
                    </Radio.Group>
                  </Form.Item>

                  {createPaymentType === "alipay" ? (
                    <>
                      <Form.Item name="originalReceipts" label={page.t("peer_payment.originalReceipts")}>
                        <Input placeholder={page.t("peer_payment.originalReceipt_enter")} />
                      </Form.Item>
                      <Radio.Group
                        value={createPayInputType}
                        onChange={(event) => {
                          setCreatePayInputType(event.target.value);
                          setQrCodeFiles([]);
                          createForm.setFieldsValue({
                            paymentAccount: undefined,
                            paymentLink: undefined,
                            qrCode: undefined,
                          });
                        }}
                        style={{ width: "100%", marginBottom: 20 }}
                      >
                        <Row gutter={20}>
                          <Col span={12}>
                            <Radio value="paymentAccount">{page.t("peer_payment.select_paymentAccount")}</Radio>
                          </Col>
                          <Col span={12}>
                            <Radio value="qrCode">{page.t("peer_payment.upload_qr_code")}</Radio>
                          </Col>
                        </Row>
                      </Radio.Group>
                      {createPayInputType === "qrCode" ? (
                        <Form.Item
                          name="qrCode"
                          label={page.t("peer_payment.upload_qr_code")}
                          rules={[{ required: true, message: page.t("shipment.qrcode_required") }]}
                        >
                          <Upload
                            accept="image/*"
                            listType="picture-card"
                            maxCount={1}
                            fileList={qrCodeFiles}
                            beforeUpload={async (file) => {
                              if (!file.type.startsWith("image/")) {
                                notification.error({ message: page.t("message.picture") });
                                return Upload.LIST_IGNORE;
                              }
                              if (qrCodeFiles.length >= 1) {
                                notification.error({ message: page.t("peer_payment.upload_qr_limit") });
                                return Upload.LIST_IGNORE;
                              }
                              const preview = URL.createObjectURL(file);
                              setQrCodeFiles([{ uid: file.uid, name: file.name, status: "uploading", url: preview }]);
                              try {
                                const response = await page.uploadQrCodeMutation.mutateAsync(file);
                                if (response.url) {
                                  createForm.setFieldsValue({ qrCode: response.url });
                                  setQrCodeFiles([{ uid: file.uid, name: file.name, status: "done", url: preview }]);
                                }
                              } catch (error: any) {
                                notification.error({
                                  message: error?.response?.data?.message || error?.message || page.t("common.error"),
                                });
                                createForm.setFieldsValue({ qrCode: undefined });
                                setQrCodeFiles([]);
                              }
                              return Upload.LIST_IGNORE;
                            }}
                            onRemove={() => {
                              createForm.setFieldsValue({ qrCode: undefined });
                              setQrCodeFiles([]);
                            }}
                          >
                            {qrCodeFiles.length ? null : (
                              <Space direction="vertical" align="center">
                                <UploadOutlined />
                                <span>{page.t("peer_payment.upload_qr_code")}</span>
                              </Space>
                            )}
                          </Upload>
                        </Form.Item>
                      ) : (
                        <>
                          <Form.Item
                            name="paymentAccount"
                            label={page.t("peer_payment.paymentAccount")}
                            rules={[{ required: true, message: page.t("order.quantity_required") }]}
                          >
                            <Select
                              showSearch
                              optionFilterProp="label"
                              placeholder={page.t("peer_payment.select_paymentAccount")}
                              options={page.paymentAccounts.map((item: any) => ({
                                value: item.account || item.code || item.id,
                                label: `${item.displayName || item.name || item.account || item.code}${
                                  item.account ? ` (${item.account})` : ""
                                }`,
                              }))}
                            />
                          </Form.Item>
                          <Form.Item
                            name="paymentLink"
                            label={page.t("peer_payment.payment_link")}
                            rules={[
                              { required: true, message: page.t("order.quantity_required") },
                              {
                                validator: (_, value) =>
                                  !value || isValidUrl(value)
                                    ? Promise.resolve()
                                    : Promise.reject(new Error(page.t("shipment.link_error"))),
                              },
                            ]}
                          >
                            <Input placeholder={page.t("peer_payment.payment_link_enter")} />
                          </Form.Item>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Form.Item
                        name="originalReceipts"
                        label={page.t("peer_payment.originalReceipts")}
                        rules={[{ required: true, message: page.t("order.quantity_required") }]}
                      >
                        <Input placeholder={page.t("peer_payment.originalReceipt_enter")} />
                      </Form.Item>
                      <Form.Item
                        name="billTo"
                        label={page.t("peer_payment.billTo")}
                        rules={[{ required: true, message: page.t("order.quantity_required") }]}
                      >
                        <Input placeholder={page.t("peer_payment.billTo_enter")} />
                      </Form.Item>
                    </>
                  )}
                  <Form.Item
                    name="note"
                    label={page.t("peer_payment.note")}
                    rules={[{ max: 50, message: page.t("peer_payment.memo_error") }]}
                  >
                    <Input.TextArea placeholder={page.t("peer_payment.note_placeholder")} />
                  </Form.Item>
                </>
              ) : (
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Row gutter={createBetterOffer ? 24 : 0}>
                    <Col span={createBetterOffer ? 12 : 24}>
                      <Card size="small" title={page.t("peer_payment.create_payment_with_normal")}>
                        <Flex justify="space-between">
                          <Text>{page.t("peer_payment.amount")}:</Text>
                          <Text>{formatCnyAmount(createAmount)}</Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text>{page.t("peer_payment.exchangedAmount")}:</Text>
                          <Text>{moneyFormat(createExchangedAmount)}</Text>
                        </Flex>
                        {createFeeItems.map((item: any, index: number) => {
                          const fee = page.peerPaymentFees.find((feeItem: any) => feeItem.code === item.feeCode);
                          const feeLabel = fee?.name || defaultFeeLabels[item.feeCode] || item.feeCode;
                          return (
                            <Flex key={`${item.feeCode}-${index}`} justify="space-between">
                              <Text>{feeLabel}:</Text>
                              <Text>{moneyFormat(item.provisionalAmount)}</Text>
                            </Flex>
                          );
                        })}
                        <Divider dashed style={{ margin: "12px 0" }} />
                        <Flex justify="space-between">
                          <Text strong>{page.t("orderDetail.total_money")}:</Text>
                          <Text strong style={{ color: token.colorPrimary }}>
                            {moneyFormat(createTotalMoney)}
                          </Text>
                        </Flex>
                      </Card>
                    </Col>
                    {Boolean(createBetterOffer) && (
                      <Col span={12}>
                        <Card size="small" title={page.t("peer_payment.payment_with_better_offer")}>
                          <Flex justify="space-between">
                            <Text>{page.t("peer_payment.better_offer_value")}:</Text>
                            <Text>{formatCnyAmount(createBetterOffer)}</Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text>{page.t("peer_payment.exchangedAmount")}:</Text>
                            <Text>{moneyFormat(createBetterOfferExchangedAmount)}</Text>
                          </Flex>
                          {createBetterOfferFeeItems.map((item: any, index: number) => {
                            const fee = page.peerPaymentFees.find((feeItem: any) => feeItem.code === item.feeCode);
                            const feeLabel = fee?.name || defaultFeeLabels[item.feeCode] || item.feeCode;
                            return (
                              <Flex key={`${item.feeCode}-${index}`} justify="space-between">
                                <Text>{feeLabel}:</Text>
                                <Text>{moneyFormat(item.provisionalAmount)}</Text>
                              </Flex>
                            );
                          })}
                          <Divider dashed style={{ margin: "12px 0" }} />
                          <Flex justify="space-between">
                            <Text strong>{page.t("orderDetail.total_money")}:</Text>
                            <Text strong style={{ color: token.colorPrimary }}>
                              {moneyFormat(createBetterOfferTotalMoney)}
                            </Text>
                          </Flex>
                        </Card>
                      </Col>
                    )}
                  </Row>
                  <Alert message={page.t("peer_payment.create_warning_message")} type="warning" showIcon />
                  {Boolean(createBetterOffer) && (
                    <Popconfirm
                      placement="topRight"
                      icon={<InfoCircleFilled style={{ color: token.colorPrimary }} />}
                      title={page.t("peer_payment.buy_with_better_offer_confirm")}
                      okText={page.t("common.confirm")}
                      cancelText={page.t("common.cancel")}
                      okButtonProps={{
                        icon: <CheckOutlined />,
                        loading: page.placeOrderBetterOfferMutation.isPending,
                      }}
                      cancelButtonProps={{ icon: <CloseOutlined /> }}
                      onConfirm={submitCreateBetterOffer}
                    >
                      <Button
                        type="primary"
                        icon={<PercentageOutlined />}
                        loading={page.placeOrderBetterOfferMutation.isPending}
                      >
                        {page.t("button.buy_with_better_offer")}
                      </Button>
                    </Popconfirm>
                  )}
                  {hasCreateFeeWarning && (
                    <Alert message={page.t("peer_payment.fee_warning")} type="warning" showIcon />
                  )}
                </Space>
              )}
            </>
          ) : (
            <>
              <Steps
                responsive={false}
                labelPlacement="vertical"
                current={createStep - 1}
                style={{ maxWidth: "100%", margin: "0 auto 24px" }}
                items={[
                  { title: <StepTitle>{page.t("peer_payment.transfer_info")}</StepTitle> },
                  { title: <StepTitle>{page.t("common.confirm")}</StepTitle> },
                ]}
              />
              {createStep === 1 ? (
                <>
                  <Form.Item
                    name="amount"
                    label={page.t("peer_payment.amount")}
                    rules={[{ required: true, message: page.t("order.quantity_required") }]}
                  >
                    <InputNumber<number>
                      min={Number(1)}
                      precision={2}
                      style={{ width: "100%" }}
                      placeholder={page.t("peer_payment.amount_placeholder")}
                      formatter={(value) => `${value ?? ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      parser={(value) => Number(String(value || "").replace(/\$\s?|(,*)/g, ""))}
                    />
                  </Form.Item>
                  {createExchangeRate?.rate === null && (
                    <Text type="danger">
                      {page.t("peerPayment.minTransfer", { value: createExchangeRate.minPayment })}
                    </Text>
                  )}
                  {createExchangeRate?.base && (
                    <div style={{ marginTop: -12, marginBottom: 16 }}>
                      <Text type="secondary">{page.t("header.exchange")}</Text>{" "}
                      <Text>
                        {moneyFormat(1, createExchangeRate.base)} ={" "}
                        {moneyFormat(createExchangeRate.rate, createExchangeRate.exchange)}
                      </Text>
                    </div>
                  )}
                  <div style={{ marginTop: -8, marginBottom: 20 }}>
                    <Text>
                      {page.t("peer_payment.exchangedAmount")}:{" "}
                      <Text strong>{moneyFormat(createExchangedAmount)}</Text>
                    </Text>
                  </div>
                  <Form.Item
                    name="paymentMethodCode"
                    rules={[{ required: true, message: page.t("order.quantity_required") }]}
                    style={{ marginBottom: 20 }}
                  >
                    <Radio.Group
                      onChange={(event) => {
                        createForm.setFieldsValue({
                          paymentMethodCode: event.target.value,
                          beneficiaryBank: undefined,
                        });
                        setCreateExchangeRate({});
                        loadCreateExchangeRate();
                      }}
                    >
                      <Space wrap>
                        {page.tenantConfigPayment?.config?.transferAlipay === true && (
                          <Radio value="alipay">{page.t("peer_payment.alipay")}</Radio>
                        )}
                        {page.tenantConfigPayment?.config?.transferBank === true && (
                          <Radio value="bank_transfer">{page.t("peer_payment.bank_transfer")}</Radio>
                        )}
                      </Space>
                    </Radio.Group>
                  </Form.Item>

                  {currentCreatePaymentMethodCode !== "alipay" && (
                    <>
                      <Row gutter={20}>
                        <Col span={12}>
                          <Form.Item
                            name="beneficiaryBank"
                            label={page.t("peer_payment.bank_name")}
                            rules={[{ required: true, message: page.t("order.quantity_required") }]}
                          >
                            <Input placeholder={page.t("peer_payment.bank_name_placeholder")} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="beneficiaryAccount"
                            label={page.t("peer_payment.beneficiaryAccount")}
                            rules={[{ required: true, message: page.t("order.quantity_required") }]}
                          >
                            <Input placeholder={page.t("peer_payment.beneficiaryAccount_placeholder")} />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item name="beneficiaryBankBranch" label={page.t("peer_payment.bank_branch")}>
                        <Input placeholder={page.t("peer_payment.bank_branch_enter")} />
                      </Form.Item>
                    </>
                  )}

                  {currentCreatePaymentMethodCode === "alipay" && (
                    <Form.Item
                      name="beneficiaryAccount"
                      label={page.t("peer_payment.beneficiaryAccount")}
                      rules={[{ required: true, message: page.t("order.quantity_required") }]}
                    >
                      <Input placeholder={page.t("peer_payment.beneficiaryAccount_placeholder")} />
                    </Form.Item>
                  )}
                  <Form.Item
                    name="beneficiaryName"
                    label={page.t("peer_payment.beneficiaryName")}
                    rules={[{ required: true, message: page.t("order.quantity_required") }]}
                  >
                    <Input placeholder={page.t("peer_payment.beneficiaryName_placeholder")} />
                  </Form.Item>
                  <Form.Item
                    name="memo"
                    label={page.t("peer_payment.memo")}
                    rules={[
                      { required: true, message: page.t("order.quantity_required") },
                      { max: 50, message: page.t("peer_payment.memo_error") },
                    ]}
                  >
                    <Input.TextArea placeholder={page.t("peer_payment.memo_placeholder")} />
                  </Form.Item>
                  <Form.Item
                    name="note"
                    label={page.t("peer_payment.note")}
                    rules={[{ max: 50, message: page.t("peer_payment.memo_error") }]}
                  >
                    <Input.TextArea placeholder={page.t("peer_payment.note_placeholder")} />
                  </Form.Item>
                </>
              ) : (
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Card size="small">
                    <Row gutter={24}>
                      <Col span={12}>
                        <Flex justify="space-between">
                          <Text>{page.t("peer_payment.amount")}:</Text>
                          <Text>{formatCnyAmount(createAmount)}</Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text>{page.t("peer_payment.exchangedAmount")}:</Text>
                          <Text>{moneyFormat(createExchangedAmount)}</Text>
                        </Flex>
                      </Col>
                      <Col span={12}>
                        <Text strong>{page.t("fee_tab.service_fee")}:</Text>
                        {createFeeItems.map((item: any, index: number) => {
                          const fee = page.peerPaymentFees.find((feeItem: any) => feeItem.code === item.feeCode);
                          const feeLabel = fee?.name || defaultFeeLabels[item.feeCode] || item.feeCode;
                          return (
                            <Flex key={`${item.feeCode}-${index}`} justify="space-between">
                              <Text>{feeLabel}:</Text>
                              <Text>{moneyFormat(item.provisionalAmount)}</Text>
                            </Flex>
                          );
                        })}
                      </Col>
                    </Row>
                    <Divider dashed style={{ margin: "12px 0" }} />
                    <Flex justify="flex-end">
                      <Text strong>
                        {page.t("orderDetail.total_money")}:{" "}
                        <Text strong style={{ color: token.colorPrimary }}>
                          {moneyFormat(createTotalMoney)}
                        </Text>
                      </Text>
                    </Flex>
                  </Card>
                  <Alert message={page.t("peer_payment.create_warning_message")} type="warning" showIcon />
                  {hasCreateFeeWarning && (
                    <Alert message={page.t("peer_payment.fee_warning")} type="warning" showIcon />
                  )}
                </Space>
              )}
            </>
          )}
        </Form>
      </Modal>

      <PinModal
        open={exportOpen}
        onCancel={() => setExportOpen(false)}
        onConfirm={submitExport}
        confirmLoading={page.exportMutation.isPending}
        t={page.t}
      />
    </Space>
  );
};

export default PeerPaymentsStyleDefault;
