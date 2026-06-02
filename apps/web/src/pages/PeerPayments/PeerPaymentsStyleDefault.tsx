import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { Link as RouterLink } from "react-router-dom";
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
  Modal,
  Pagination,
  Popconfirm,
  Radio,
  Row,
  Segmented,
  Select,
  Space,
  Spin,
  Steps,
  Table,
  Tag,
  Tooltip,
  Typography,
  Upload,
  theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UploadFile } from "antd/es/upload/interface";
import {
  CheckOutlined,
  CloseOutlined,
  CreditCardOutlined,
  InfoCircleFilled,
  InfoCircleOutlined,
  PercentageOutlined,
  PayCircleOutlined,
  PlusOutlined,
  QrcodeOutlined,
  ReloadOutlined,
  SearchOutlined,
  SwapOutlined,
  SwapRightOutlined,
  UploadOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { LocalStoreUtil, moneyFormat, quantityFormat } from "@repo/util";
import { PinModal } from "@repo/ui";
import { usePeerPaymentsPage } from "./hooks/usePeerPaymentsPage";

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
  )
    return "---";
  const currencies = LocalStoreUtil.getJson("currencies") || [];
  const currency = currencies.find((item: any) => item.code === "CNY") || {
    prefix: "¥",
    suffix: "",
  };
  return `${numberValue < 0 ? "-" : ""}${currency.prefix || ""}${Math.abs(
    numberValue
  ).toLocaleString("en-US", {
    maximumFractionDigits: 4,
  })}${currency.suffix || ""}`;
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

const defaultFeeLabels: Record<string, string> = {
  phi_dich_vu_co_dinh: "Phí dịch vụ cố định",
  fee_optimization: "Phí tối ưu",
};

const isValidUrl = (value?: string) => {
  try {
    const url = new URL(value || "");
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

const parseViewTemplate = (value?: string) => {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const getMarkupRateValue = (
  item: any,
  tier: any,
  exchangeRate: any
) => {
  const sourceRate = Number(exchangeRate?.rate || 0);
  const price = Number(tier?.price || 0);

  if (String(item?.scope || "").toLowerCase() === "value")
    return sourceRate + price;
  if (String(item?.scope || "").toLowerCase() === "rate")
    return sourceRate + sourceRate * (price / 100);
  return 0;
};

const isInSuspensionTime = (startTime?: string, endTime?: string) => {
  if (!startTime || !endTime) return false;
  const current = Date.now();
  return (
    current > new Date(startTime).getTime() &&
    current < new Date(endTime).getTime()
  );
};

const renderAccount = (record: any, peerPaymentType?: string) => {
  if (peerPaymentType === "transfer") {
    const lines = [
      record.beneficiaryAccount,
      record.beneficiaryBank,
      record.beneficiaryName,
      record.beneficiaryBankBranch,
    ].filter(Boolean);
    return lines.length ? (
      <Space direction="vertical" size={0}>
        {record.beneficiaryAccount && (
          <Paragraph copyable={{ text: record.beneficiaryAccount }} style={{ marginBottom: 0 }}>
            {record.beneficiaryAccount}
          </Paragraph>
        )}
        {[record.beneficiaryBank, record.beneficiaryName, record.beneficiaryBankBranch]
          .filter(Boolean)
          .map((line) => (
            <Text key={line}>{line}</Text>
          ))}
      </Space>
    ) : (
      "---"
    );
  }

  return record.qrcode ? (
    <Tooltip placement="top" title={<span>YCTT này tạo với QR Code</span>}>
      <QrcodeOutlined />
    </Tooltip>
  ) : record.paymentAccount ? (
    <Paragraph
      copyable={{ text: record.paymentAccount }}
      style={{ marginBottom: 0 }}
    >
      {record.paymentAccount}
    </Paragraph>
  ) : (
    "---"
  );
};

const renderBillRef = (record: any) => {
  const billRef = Array.isArray(record.billRef) ? record.billRef : [];
  if (!billRef.length) return "---";

  const originalReceipts = record.billDocument?.originalReceipts || [];

  return (
    <Space direction="vertical" size={8}>
      {billRef.map((item: any, index: number) => (
        <div key={`${item.code || item.billTo || "bill"}-${index}`}>
          <Text strong>{item.code || "---"}</Text>
          <br />
          <Text>{moneyFormat(item.amount, record.currency)}</Text>
          <br />
          <Text type="secondary">{item.billTo || "---"}</Text>
        </div>
      ))}
      {originalReceipts.length > 0 && (
        <Text type="secondary">{originalReceipts.join(", ")}</Text>
      )}
    </Space>
  );
};

export const PeerPaymentsStyleDefault = () => {
  const { token } = theme.useToken();
  const [exchangeRatesByCode, setExchangeRatesByCode] = useState<
    Record<string, any>
  >({});
  const [loadingExchangeCode, setLoadingExchangeCode] = useState<string>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bulkExchangeRates, setBulkExchangeRates] = useState<any[]>([]);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkResultOpen, setBulkResultOpen] = useState(false);
  const [bulkChargeLoading, setBulkChargeLoading] = useState(false);
  const [bulkChargeResult, setBulkChargeResult] = useState<
    Record<
      string,
      { loading?: boolean; success?: string | null; error?: string | null }
    >
  >({});
  const [createModalType, setCreateModalType] = useState<
    "payment" | "transfer"
  >();
  const [createStep, setCreateStep] = useState(1);
  const [createPaymentType, setCreatePaymentType] = useState<
    "alipay" | "company"
  >("alipay");
  const [createPayInputType, setCreatePayInputType] = useState<
    "paymentAccount" | "qrCode"
  >("paymentAccount");
  const [createExchangeRate, setCreateExchangeRate] = useState<any>({});
  const [createDraftFees, setCreateDraftFees] = useState<any>({});
  const [createBetterOffer, setCreateBetterOffer] = useState(0);
  const [createBetterOfferFees, setCreateBetterOfferFees] = useState<any>({});
  const [createPaymentDraftValues, setCreatePaymentDraftValues] = useState<
    Record<string, any>
  >({});
  const [qrCodeFiles, setQrCodeFiles] = useState<UploadFile[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [createForm] = Form.useForm();
  const createExchangeRateRequestRef = useRef(0);
  const createExchangeRateKeyRef = useRef("");
  const createExchangeRateResultRef = useRef<any>({});
  const watchedCreateAmount = Form.useWatch("amount", createForm);
  const watchedCreatePaymentMethodCode = Form.useWatch(
    "paymentMethodCode",
    createForm
  );
  const { notification } = App.useApp();
  const page = usePeerPaymentsPage();
  const {
    t,
    form,
    page: currentPage,
    pageSize,
    setPage,
    setPageSize,
    filters,
    userBalance,
    refetchUserBalance,
    payments,
    hasMore,
    isLoading,
    isFetching,
    statuses,
    paymentMethods,
    paymentAccounts,
    tenantConfigPayment,
    dailySummary,
    peerPaymentFees,
    markupRateGroups,
    exchangeRatesBatch,
    m24Enabled,
    handleSearch,
    handleReset,
    handleTypeChange,
    handleCharge,
    handleCreatePaymentRequest,
    handleCreateTransferRequest,
    handleExport,
    chargeMutation,
    chargingCode,
    exchangeRateMutation,
    exchangeRatesBatchMutation,
    paymentQuotationMutation,
    betterOfferMutation,
    placeOrderBetterOfferMutation,
    uploadQrCodeMutation,
    exportMutation,
    createRequestForPayMutation,
    askForPayMutation,
    createPayAnInvoiceMutation,
    askToPayAnInvoiceMutation,
    createTransferMutation,
  } = page;

  const peerPaymentType = filters.peerPaymentType || "payment";
  const isShowColumnShipmentCode =
    tenantConfigPayment?.config?.shipmentRequired === true;
  const suspensionSchedule = tenantConfigPayment?.suspensionSchedule;
  const isInSuspensionSchedule = isInSuspensionTime(
    suspensionSchedule?.startTime,
    suspensionSchedule?.endTime
  );
  const isShowBtnPayment =
    (tenantConfigPayment?.config?.paymentAlipay === true ||
      tenantConfigPayment?.config?.payment1688Business === true) &&
    !isInSuspensionSchedule;
  const isShowBtnTransfer =
    (tenantConfigPayment?.config?.transferAlipay === true ||
      tenantConfigPayment?.config?.transferBank === true) &&
    !isInSuspensionSchedule;
  const currentProjectInfo = LocalStoreUtil.getJson("currentProjectInfo") || {};
  const currentLoggedUser = LocalStoreUtil.getJson("currentLoggedUser") || {};
  const isEnabledBiffin =
    Boolean(currentLoggedUser?.customerAuthorities?.shopkeeper) &&
    Boolean(
      currentProjectInfo?.tenantConfig?.externalIntegrationConfig?.shopkeeper
        ?.enabled
    ) &&
    Boolean(
      currentProjectInfo?.tenantConfig?.externalIntegrationConfig?.shopkeeper
        ?.enabledPeerpayment
    );
  const selectedRows = payments.filter((item: any) =>
    selectedRowKeys.includes(item.code)
  );
  const loadExchangeRateMutation = exchangeRateMutation.mutateAsync;
  const currentCreatePaymentMethodCode =
    watchedCreatePaymentMethodCode ||
    createForm.getFieldValue("paymentMethodCode");
  const qualifyLoanOptions = [
    { value: "pass", label: t("peer_payment.loan_qualify_pass") },
    { value: "fail", label: t("peer_payment.loan_qualify_fail") },
  ];
  const bifinOptions = [
    { value: "CONTRACTED", label: t("peer_payment.loan_status_contracted") },
    { value: "NOSHOW", label: t("peer_payment.loan_status_noshow") },
    { value: "NONE", label: t("peer_payment.loan_status_none") },
  ];
  const getBulkExchangeRate = (row: any) =>
    bulkExchangeRates.find(
      (item: any) => item.refId === `${row.amount}|${row.paymentMethodCode}`
    );
  const getBulkNewRate = (row: any) =>
    getBulkExchangeRate(row)?.exchangeRate?.rate;
  const getBulkNewAmount = (row: any) => {
    const newRate = getBulkNewRate(row);
    return newRate !== undefined && newRate !== row.exchangeRate
      ? Number(row.amount || 0) * Number(newRate || 0)
      : Number(row.exchangedAmount || 0);
  };
  const hasBulkNewExchangeRate = selectedRows.some((row: any) => {
    const newRate = getBulkNewRate(row);
    return newRate !== undefined && newRate !== row.exchangeRate;
  });
  const maxCombine1688Bills = tenantConfigPayment?.config?.maxCombine1688Bills;
  const showWarningLimitCombinePeerPayment =
    Boolean(maxCombine1688Bills) &&
    selectedRows.length > Number(maxCombine1688Bills);
  const bulkTotalAmount = selectedRows.reduce(
    (sum: number, item: any) => sum + Number(item.amount || 0),
    0
  );
  const bulkExchangeAmount = selectedRows.reduce(
    (sum: number, row: any) => sum + getBulkNewAmount(row),
    0
  );
  const getTopUpMoney = (balanceData = userBalance) =>
    bulkExchangeAmount -
    (Number(balanceData?.balance || 0) + Number(balanceData?.creditLimit || 0));
  const dailyPayment =
    Array.isArray(dailySummary) &&
    dailySummary.find((item: any) => item.paymentMethodCode === "alipay");
  const dailyTransfer =
    Array.isArray(dailySummary) &&
    dailySummary.find(
      (item: any) => item.paymentMethodCode === "bank_transfer"
    );
  const dailyMessage = t("peer_payment.daily_message", {
    date: dayjs().format("DD/MM/YYYY"),
    paymentNum: quantityFormat(dailyPayment?.totalPeerPayment || 0),
    paymentAmount: moneyFormat(dailyPayment?.totalAmount || 0, "CNY"),
    transferNum: quantityFormat(dailyTransfer?.totalPeerPayment || 0),
    transferAmount: moneyFormat(dailyTransfer?.totalAmount || 0, "CNY"),
    tenantName: currentProjectInfo.name || currentProjectInfo.id || "",
  });
  const exchangeRate = useMemo(
    () =>
      exchangeRatesBatch.find((item: any) => item.refId === "payment")
        ?.exchangeRate || {},
    [exchangeRatesBatch]
  );
  const filteredMarkupRateGroups = useMemo(() => {
    const listMarkupRates = Array.isArray(markupRateGroups?.listMarkupRates)
      ? markupRateGroups.listMarkupRates
      : [];
    return {
      ...markupRateGroups,
      listMarkupRates: m24Enabled
        ? listMarkupRates
        : listMarkupRates.filter(
            (item: any) => item?.exchangeRateSource !== "market"
          ),
    };
  }, [m24Enabled, markupRateGroups]);
  const listExchangeRate = useMemo(() => {
    const list: any[] = [];
    (filteredMarkupRateGroups.listMarkupRates || []).forEach((item: any) => {
      const template = parseViewTemplate(item.viewTemplate);
      const currency = item.exchangeRate
        ? String(item.exchangeRate).split("/")
        : [];
      template.forEach((tier: any) => {
        const value = getMarkupRateValue(item, tier, exchangeRate);
        list.push({ base: currency[0], value, currency: currency[1] });
      });
    });
    return list.sort((a, b) => Number(a.value || 0) - Number(b.value || 0));
  }, [exchangeRate, filteredMarkupRateGroups]);
  const firstExchangeRate = listExchangeRate[0];
  const lastExchangeRate = [...listExchangeRate]
    .reverse()
    .find((item) => Number(item.value || 0) > 0);
  const exchangeRangeText =
    firstExchangeRate && lastExchangeRate
      ? `${t("peer_payment.exchange_range")} : ${moneyFormat(1, firstExchangeRate.base)} = ${moneyFormat(
          firstExchangeRate.value,
          firstExchangeRate.currency
        )}${
          firstExchangeRate.value !== lastExchangeRate.value &&
          listExchangeRate.length > 1
            ? ` - ${moneyFormat(
                lastExchangeRate.value,
                lastExchangeRate.currency
              )}`
            : ""
        }`
      : t("peer_payment.exchange_range");

  const loadExchangeRate = async (record: any) => {
    setLoadingExchangeCode(record.code);
    try {
      const params: Record<string, any> = {
        amount: record.amount,
        paymentMethodCode: record.paymentMethodCode,
      };
      const data = await exchangeRateMutation.mutateAsync(params);
      setExchangeRatesByCode((prev) => ({ ...prev, [record.code]: data }));
    } finally {
      setLoadingExchangeCode(undefined);
    }
  };

  const renderPaymentConfirmTitle = (record: any) => {
    const exchangeRate = exchangeRatesByCode[record.code] || {};
    const isLoadingExchange = loadingExchangeCode === record.code;
    const hasRateChanged =
      exchangeRate.rate !== undefined &&
      exchangeRate.rate !== record.exchangeRate &&
      !record.fixedExchangeRate;
    const newExchangedAmount =
      Number(record.amount || 0) * Number(exchangeRate.rate || 0);

    return (
      <Space direction="vertical" size={10} style={{ minWidth: 360 }}>
        <Text>{t("peer_payment.payment_action_confirm")}</Text>
        {isLoadingExchange && <Spin size="small" />}
        {!isLoadingExchange && hasRateChanged && (
          <>
            <Text>
              {t("peer_payment.amount")}:{" "}
              <Text strong style={{ color: token.colorSuccess }}>
                {moneyFormat(record.amount, record.currency)}
              </Text>
            </Text>
            <Table
              size="small"
              pagination={false}
              showHeader={false}
              rowKey="id"
              columns={[
                { dataIndex: "oldLabel", key: "oldLabel" },
                {
                  dataIndex: "old",
                  key: "old",
                  render: (value) => <Text type="danger">{value}</Text>,
                },
                { key: "arrow", render: () => "-->" },
                { dataIndex: "newLabel", key: "newLabel" },
                {
                  dataIndex: "new",
                  key: "new",
                  render: (value) => (
                    <Text style={{ color: token.colorSuccess }}>{value}</Text>
                  ),
                },
              ]}
              dataSource={[
                {
                  id: 1,
                  oldLabel: `${t("peer_payment.old_exchangeRate")}:`,
                  old: moneyFormat(record.exchangeRate),
                  newLabel: `${t("peer_payment.new_exchangeRate")}:`,
                  new: moneyFormat(exchangeRate.rate),
                },
                {
                  id: 2,
                  oldLabel: `${t("peer_payment.old_amount")}:`,
                  old: moneyFormat(record.exchangedAmount),
                  newLabel: `${t("peer_payment.new_amount")}:`,
                  new: moneyFormat(newExchangedAmount),
                },
              ]}
            />
          </>
        )}
      </Space>
    );
  };

  const handleTabChange = (nextType: string) => {
    setSelectedRowKeys([]);
    setBulkExchangeRates([]);
    setBulkChargeResult({});
    handleTypeChange(nextType);
  };

  const columns: ColumnsType<any> = [
    {
      title: t("peer_payment.code"),
      dataIndex: "code",
      key: "code",
      fixed: "left",
      render: (code: string) =>
        code ? (
          <Text copyable={{ text: code }} strong>
            <RouterLink
              to={`/peer-payments/${code}`}
              onClick={(event) => event.stopPropagation()}
            >
              <Text strong style={{ color: token.colorPrimary }}>
                {code}
              </Text>
            </RouterLink>
          </Text>
        ) : (
          "---"
        ),
    },
    {
      title: t("peer_payment.trxTime"),
      dataIndex: "trxTime",
      key: "trxTime",
      render: formatDateTime,
    },
    {
      title: t("peer_payment.amount"),
      dataIndex: "amount",
      key: "amount",
      render: (amount, record) => moneyFormat(amount, record.currency),
    },
    {
      title: t("peer_payment.exchangedAmount"),
      dataIndex: "exchangedAmount",
      key: "exchangedAmount",
      render: (amount) => moneyFormat(amount),
    },
    {
      title: t("fee_tab.service_fee"),
      dataIndex: "totalFee",
      key: "totalFee",
      render: (amount) => moneyFormat(amount),
    },
    {
      title: t("orderDetail.total_money"),
      key: "total",
      render: (_, record) =>
        moneyFormat(
          Number(record.totalFee || 0) + Number(record.exchangedAmount || 0)
        ),
    },
    {
      title:
        peerPaymentType === "transfer"
          ? t("peer_payment.beneficiaryAccount")
          : t("peer_payment.paymentAccount"),
      key: "account",
      render: (_, record) => renderAccount(record, peerPaymentType),
    },
    peerPaymentType === "transfer"
      ? {
          title: t("peer_payment.memo"),
          dataIndex: "memo",
          key: "memo",
          render: (value) => value || "---",
        }
      : {
          title: t("peer_payment.originalReceiptCode"),
          key: "billRef",
          width: 260,
          render: (_, record) => renderBillRef(record),
        },
    ...(isShowColumnShipmentCode
      ? [
          {
            title: t("peer_payment.shipmentCode"),
            dataIndex: "shipmentCode",
            key: "shipmentCode",
            render: (code: string) =>
              code ? (
                <RouterLink to={`/shipments/${code}`} target="_blank">
                  {code}
                </RouterLink>
              ) : (
                "---"
              ),
          },
        ]
      : []),
    {
      title: t("peer_payment.note"),
      dataIndex: "note",
      key: "note",
      render: (value) => value || "---",
    },
    {
      title: t("tickets.status"),
      dataIndex: "status",
      key: "status",
      width: 220,
      render: (status: string) => {
        const statusMeta = getStatusMeta(statuses, status);
        return (
          <Tag
            style={{
              backgroundColor: statusColor(status),
              color: token.colorWhite,
              whiteSpace: "normal",
              lineHeight: 1.4,
              maxWidth: "100%",
              marginInlineEnd: 0,
            }}
          >
            {statusMeta.name || status || "---"}
          </Tag>
        );
      },
    },
    {
      title: "",
      key: "action",
      width: 140,
      fixed: "right",
      align: "center",
      render: (_, record) =>
        ["WAIT_FOR_PAYMENT", "REQUEST_FOR_PAY"].includes(record.status) ? (
          <Popconfirm
            title={renderPaymentConfirmTitle(record)}
            okText={t("button.yes")}
            cancelText={t("button.no")}
            disabled={isInSuspensionSchedule}
            placement="topRight"
            okButtonProps={{ disabled: loadingExchangeCode === record.code }}
            onOpenChange={(open) => {
              if (open) loadExchangeRate(record);
            }}
            onConfirm={() => handleCharge(record.code, record)}
          >
            <Button
              type="primary"
              icon={<CreditCardOutlined />}
              disabled={isInSuspensionSchedule}
              loading={
                chargingCode === record.code ||
                loadingExchangeCode === record.code
              }
              className="_btn-payment btn-add-peer-payment"
              style={{ whiteSpace: "nowrap", textAlign: "center" }}
            >
              {t("peer_payment.rowPayment")}
            </Button>
          </Popconfirm>
        ) : null,
    },
  ];

  const openCreateModal = (type: "payment" | "transfer") => {
    createExchangeRateRequestRef.current += 1;
    createExchangeRateKeyRef.current = "";
    createExchangeRateResultRef.current = {};
    createForm.resetFields();
    const defaultType =
      tenantConfigPayment?.config?.paymentAlipay === true
        ? "alipay"
        : "company";
    const defaultTransferMethod =
      tenantConfigPayment?.config?.transferAlipay === true &&
      tenantConfigPayment?.config?.transferBank !== true
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

  const loadCreateExchangeRate = useCallback(async (values?: { amount?: number; paymentMethodCode?: string }) => {
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
      const response = await loadExchangeRateMutation({
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
  }, [createForm, createModalType, loadExchangeRateMutation]);

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

  const buildCreatePaymentPayload = (
    values: Record<string, any>,
    exchangeRate?: any
  ) => {
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
    const draftFees = await paymentQuotationMutation.mutateAsync(payload);
    setCreateBetterOffer(0);
    setCreateBetterOfferFees({});
    setCreatePaymentDraftValues({
      ...values,
      paymentMethodCode: values.paymentMethodCode || "alipay",
    });
    setCreateDraftFees(draftFees);
    setCreateStep(2);

    if (createPaymentType === "company") {
      betterOfferMutation
        .mutateAsync({
          thirdParty: "1688",
          credentialAccount: values.billTo,
          originalReceipt: values.originalReceipts,
        })
        .then(async (betterOfferResponse) => {
          const yoursTotalAmount = Number(
            betterOfferResponse?.yours?.totalAmount || 0
          );
          const oursTotalAmount = Number(
            betterOfferResponse?.ours?.totalAmount || 0
          );
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
          const feesBetterOffer =
            await paymentQuotationMutation.mutateAsync(betterPayload);
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
    const draftFees = await paymentQuotationMutation.mutateAsync(payload);
    setCreatePaymentDraftValues(values);
    setCreateDraftFees(draftFees);
    setCreateStep(2);
  };

  const getCreateRequestErrorMessage = (error: any) => {
    const title = error?.response?.data?.title || error?.title;
    if (title === "customer_not_found")
      return t("peer_payment.customer_not_found");
    if (title === "payment_method_not_found")
      return t("peer_payment.payment_method_not_found");
    if (title === "payment_account_not_found")
      return t("peer_payment.payment_account_not_found");
    if (title === "shipment_required_when_create_pp")
      return t("peer_payment.shipment_required_when_create_pp");
    if (title === "invalid_original_receipt_code")
      return t("peer_payment.invalid_original_receipt_code");
    return (
      error?.response?.data?.message ||
      error?.message ||
      t("message.system_error_contact_technical")
    );
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
      await placeOrderBetterOfferMutation.mutateAsync(payload);
      notification.success({
        message: t("message.place_order_with_better_offer_success"),
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
        await handleCreatePaymentRequest({
          ...createPaymentDraftValues,
          ...values,
        });
      } else {
        if (createStep === 1) {
          await submitCreateTransferStepOne();
          return;
        }
        await handleCreateTransferRequest(createPaymentDraftValues);
      }
      resetCreateModal();
    } catch (error: any) {
      if (error?.errorFields) return;
      if (
        (error?.response?.data?.title || error?.title) ===
        "insufficient_balance"
      ) {
        notification.success({ message: t("message.success") });
        resetCreateModal();
        return;
      }
      notification.error({ message: getCreateRequestErrorMessage(error) });
    }
  };

  const getBulkChargeErrorMessage = (
    error: any,
    row: any,
    balanceData: any
  ) => {
    const title = error?.response?.data?.title || error?.title;
    const isTimeoutError =
      error?.code === "ECONNABORTED" ||
      error?.code === "ERR_CANCELED" ||
      error?.name === "CanceledError" ||
      String(error?.message || "")
        .toLowerCase()
        .includes("timeout");
    if (isTimeoutError) {
      return t("peer_payment.charge_timeout");
    }
    if (title === "invalid_amount") {
      return t("peer_payment.invalid_amount");
    }
    if (title === "insufficient_balance") {
      const totalMoney =
        Number(row.totalFee || 0) + Number(row.exchangedAmount || 0);
      const enoughMoney =
        totalMoney -
        (Number(balanceData?.balance || 0) +
          Number(balanceData?.creditLimit || 0));
      return t("cartCheckout.notEnoughMoney").replace(
        "${money}",
        moneyFormat(enoughMoney)
      );
    }
    const status = error?.response?.status;
    const messageKey =
      status === 500 || !error?.response
        ? "error.oops"
        : error?.response?.data?.message || error?.message;
    return messageKey ? t(messageKey) : "";
  };

  const submitBulkCharge = async () => {
    setBulkModalOpen(false);
    setBulkResultOpen(true);
    setBulkChargeLoading(true);

    const nextResult: Record<
      string,
      { loading?: boolean; success?: string | null; error?: string | null }
    > = {};
    selectedRows.forEach((row: any) => {
      nextResult[row.code] = { error: null, success: null, loading: false };
    });
    setBulkChargeResult({ ...nextResult });

    for (const row of selectedRows) {
      nextResult[row.code] = { ...nextResult[row.code], loading: true };
      setBulkChargeResult({ ...nextResult });

      const balanceResponse = await refetchUserBalance();
      const latestBalance = balanceResponse.data || userBalance;
      try {
        await chargeMutation.mutateAsync(row.code);
        nextResult[row.code] = {
          error: null,
          success: t("message.success"),
          loading: false,
        };
      } catch (error: any) {
        nextResult[row.code] = {
          error: getBulkChargeErrorMessage(error, row, latestBalance),
          success: null,
          loading: false,
        };
      }
      setBulkChargeResult({ ...nextResult });
    }

    setBulkChargeLoading(false);
  };

  const openBulkModal = async () => {
    if (selectedRows.length > 10) {
      notification.error({
        message: t("peer_payment.maxPeerPaymentCharge10Item"),
      });
      return;
    }
    setBulkModalOpen(true);
    const payload = selectedRows.map((item: any) => ({
      amount: item.amount,
      paymentMethodCode: item.paymentMethodCode,
      refId: `${item.amount}|${item.paymentMethodCode}`,
    }));
    const response = await exchangeRatesBatchMutation.mutateAsync(payload);
    setBulkExchangeRates(response);
  };

  const closeBulkResultModal = () => {
    if (bulkChargeLoading) return;
    setBulkResultOpen(false);
    setSelectedRowKeys([]);
    setBulkChargeResult({});
    setBulkExchangeRates([]);
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
      if (createModalType === "payment") {
        resetCreateBetterOffer();
      }
      return;
    }
    resetCreateModal();
  };

  const closeCreateModal = () => {
    if (createStep > 1) {
      setCreateStep(createStep - 1);
      if (createModalType === "payment") {
        resetCreateBetterOffer();
      }
      return;
    }
    resetCreateModal();
  };

  const createAmount = Number(
    (createStep > 1 ? createPaymentDraftValues.amount : watchedCreateAmount) ||
      0
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
    createExchangedAmount
  );
  const createBetterOfferFeeItems = Array.isArray(
    createBetterOfferFees?.listFees
  )
    ? createBetterOfferFees.listFees
    : [];
  const createBetterOfferExchangedAmount =
    createBetterOffer * Number(createExchangeRate?.rate || 0);
  const createBetterOfferTotalMoney = createBetterOfferFeeItems.reduce(
    (sum: number, item: any) => sum + Number(item.provisionalAmount || 0),
    createBetterOfferExchangedAmount
  );
  const hasCreateFeeWarning = createFeeItems.some(
    (item: any) =>
      item.provisionalAmount === null || item.provisionalAmount === undefined
  );

  const canOpenExportModal = () => {
    const timestampFrom = filters.timestampFrom;
    const timestampTo = filters.timestampTo;
    const isInvalidRange =
      !timestampFrom ||
      !timestampTo ||
      dayjs(timestampFrom)
        .add(3, "month")
        .isBefore(dayjs(timestampTo).startOf("day"));

    if (isInvalidRange) {
      notification.error({ message: t("transaction.export_csv_btn_error") });
      return false;
    }

    return true;
  };

  const openExportModal = () => {
    if (!canOpenExportModal()) return;
    setExportOpen(true);
  };

  const submitExport = async (pin: string) => {
    const isSuccess = await handleExport(pin);
    if (isSuccess) setExportOpen(false);
  };

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Flex justify="space-between" align="center" gap={12} wrap>
        <Title level={3} style={{ margin: 0 }}>
          {t("peer_payment.title_page")}
        </Title>
      </Flex>

      {dailyMessage && (
        <Alert
          message={<Text strong>{t("order.notification")}</Text>}
          description={
            <span dangerouslySetInnerHTML={{ __html: dailyMessage }} />
          }
          type="success"
          showIcon
          closable
        />
      )}

      {isInSuspensionSchedule && suspensionSchedule?.description && (
        <Alert
          message={<Text strong>{t("peer_payment.suspension_notify")}</Text>}
          description={suspensionSchedule.description}
          type="warning"
          showIcon
          closable
        />
      )}

      <Card>
        <Form form={form} layout="vertical" onFinish={handleSearch}>
          <Row gutter={[16, 8]}>
            <Col xs={24} md={8}>
              <Form.Item name="query" label={t("peer_payment.code")}>
                <Input placeholder={t("peer_payment.code")} allowClear />
              </Form.Item>
            </Col>
            {peerPaymentType !== "transfer" ? (
              <Col xs={24} md={8}>
                <Form.Item
                  name="paymentAccount"
                  label={t("peer_payment.paymentAccount")}
                >
                  <Select
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    placeholder={t("peer_payment.select_paymentAccount")}
                    options={paymentAccounts.map((item: any) => ({
                      value: item.account || item.code || item.id,
                      label:
                        item.displayName ||
                        item.account ||
                        item.name ||
                        item.code,
                    }))}
                  />
                </Form.Item>
              </Col>
            ) : (
              <Col xs={24} md={8}>
                <Form.Item
                  name="beneficiaryAccount"
                  label={t("peer_payment.beneficiaryAccount")}
                >
                  <Input
                    placeholder={t("peer_payment.beneficiaryAccount")}
                    allowClear
                  />
                </Form.Item>
              </Col>
            )}
            <Col xs={24} md={8}>
              <Form.Item label={t("peer_payment.trxTime")}>
                <Space.Compact style={{ width: "100%" }}>
                  <Form.Item name="timestampFrom" noStyle>
                    <DatePicker
                      style={{ width: "50%" }}
                      format="DD/MM/YYYY"
                      placeholder={t("peer_payment.filterMilestoneFrom")}
                    />
                  </Form.Item>
                  <Form.Item name="timestampTo" noStyle>
                    <DatePicker
                      style={{ width: "50%" }}
                      format="DD/MM/YYYY"
                      placeholder={t("peer_payment.filterMilestoneTo")}
                    />
                  </Form.Item>
                </Space.Compact>
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item
                name="originalReceiptCode"
                label={t("peer_payment.originalReceiptCode")}
              >
                <Input
                  placeholder={t("peer_payment.originalReceiptCode")}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item name="billTo" label={t("peer_payment.billTo")}>
                <Input
                  placeholder={t("peer_payment.billTo_enter")}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={16}>
              <Form.Item label={t("peer_payment.filterByMilestoneStatusTime")}>
                <Flex gap={8} align="center" wrap="wrap">
                  <Form.Item name="milestoneStatus" noStyle>
                    <Select
                      allowClear
                      placeholder={t(
                        "peer_payment.filterByMilestoneStatusTime"
                      )}
                      style={{ flex: "1 1 220px", minWidth: 220 }}
                      options={statuses.map((status: any) => ({
                        value: status.code,
                        label: status.name,
                      }))}
                    />
                  </Form.Item>
                  <Form.Item name="milestoneFrom" noStyle>
                    <DatePicker
                      showTime={{ format: "HH:mm" }}
                      format="HH:mm DD-MM-YYYY"
                      placeholder={t("peer_payment.filterMilestoneFrom")}
                      style={{ flex: "1 1 220px", minWidth: 220 }}
                    />
                  </Form.Item>
                  <SwapRightOutlined
                    style={{ color: token.colorTextSecondary }}
                  />
                  <Form.Item name="milestoneTo" noStyle>
                    <DatePicker
                      showTime={{ format: "HH:mm" }}
                      format="HH:mm DD-MM-YYYY"
                      placeholder={t("peer_payment.filterMilestoneTo")}
                      style={{ flex: "1 1 220px", minWidth: 220 }}
                    />
                  </Form.Item>
                </Flex>
              </Form.Item>
            </Col>
            {peerPaymentType === "payment" && isEnabledBiffin && (
              <>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="hasCollateral"
                    label={t("peer_payment.qualifyLoan")}
                  >
                    <Select allowClear options={qualifyLoanOptions} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="contractWithShopkeeper"
                    label={t("peer_payment.loanStatus")}
                  >
                    <Select allowClear options={bifinOptions} />
                  </Form.Item>
                </Col>
              </>
            )}
            <Col xs={24}>
              <Form.Item name="statuses" label={t("tickets.status")}>
                <Checkbox.Group
                  onChange={() => {
                    form.setFieldValue("paymentAccount", undefined);
                  }}
                >
                  <Space wrap>
                    {statuses.map((status: any) => (
                      <Checkbox key={status.code} value={status.code}>
                        {status.name}
                      </Checkbox>
                    ))}
                  </Space>
                </Checkbox.Group>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="paymentMethod"
                label={t("peer_payment.payment_method")}
              >
                <Checkbox.Group>
                  <Space wrap>
                    {paymentMethods.map((method: any) => (
                      <Checkbox key={method.code} value={method.code}>
                        {method.name}
                      </Checkbox>
                    ))}
                  </Space>
                </Checkbox.Group>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Flex justify="end">
                <Space wrap>
                  <Button onClick={handleReset} icon={<ReloadOutlined />}>
                    {t("orders.buttons.reset")}
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SearchOutlined />}
                  >
                    {t("orders.buttons.search")}
                  </Button>
                </Space>
              </Flex>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card>
        <Flex
          justify="space-between"
          align="center"
          gap={12}
          wrap
          style={{ marginBottom: 12 }}
        >
          <div />
          <Space wrap>
            <Button
              type="link"
              icon={<InfoCircleOutlined />}
              onClick={() => setRateModalOpen(true)}
              disabled={!firstExchangeRate}
            >
              {exchangeRangeText}
            </Button>
            <Button
              icon={<WalletOutlined />}
              disabled={isInSuspensionSchedule || selectedRowKeys.length === 0}
              onClick={openBulkModal}
              className="_btn-payment btn btn--peer-payment-pay"
            >
              {t("peer_payment.btnPayment")}
            </Button>
            {isShowBtnPayment && peerPaymentType === "payment" && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openCreateModal("payment")}
              >
                {t("peer_payment.create_request_for_pay")}
              </Button>
            )}
            {isShowBtnTransfer && peerPaymentType === "transfer" && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openCreateModal("transfer")}
              >
                {t("peer_payment.create_transfer")}
              </Button>
            )}
            <Button
              type="default"
              className="_btn-export-csv rounded"
              loading={exportMutation.isPending}
              onClick={openExportModal}
            >
              {t("shipment.btn_export_csv")}
            </Button>
          </Space>
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
            value={peerPaymentType}
            onChange={(value) => handleTabChange(String(value))}
            size="large"
            style={{ marginBottom: token.marginMD }}
            options={[
              {
                value: "payment",
                label: (
                  <Flex align="center" justify="center" gap={token.marginXS} style={{ paddingBlock: token.paddingXS }}>
                    <PayCircleOutlined />
                    {t("peer_payment.request_payment")}
                  </Flex>
                ),
              },
              {
                value: "transfer",
                label: (
                  <Flex align="center" justify="center" gap={token.marginXS} style={{ paddingBlock: token.paddingXS }}>
                    <SwapOutlined />
                    {t("peer_payment.request_transfer")}
                  </Flex>
                ),
              },
            ]}
          />
        </ConfigProvider>
        <Table
          rowKey="code"
          columns={columns}
          dataSource={payments}
          loading={isLoading || isFetching}
          scroll={{ x: "max-content" }}
          pagination={false}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            getCheckboxProps: (record: any) => ({
              disabled: !["WAIT_FOR_PAYMENT", "REQUEST_FOR_PAY"].includes(
                record.status
              ),
            }),
          }}
          locale={{
            emptyText: <Empty description={t("common.no_data")} />,
          }}
        />
        <Flex justify="end" style={{ marginTop: 16 }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={
              hasMore ? currentPage * pageSize + 1 : currentPage * pageSize
            }
            onChange={(nextPage, nextPageSize) => {
              setPage(nextPage);
              if (nextPageSize !== pageSize) setPageSize(nextPageSize);
            }}
            showSizeChanger
          />
        </Flex>
      </Card>

      <Modal
        title={
          <span style={{ textTransform: "capitalize" }}>
            {exchangeRangeText}
          </span>
        }
        open={rateModalOpen}
        onCancel={() => setRateModalOpen(false)}
        footer={null}
        width={420}
      >
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {currentLoggedUser?.customerGroup?.displayName && (
            <Text strong>
              {t("peer_payment.customerGroup")}:{" "}
              {currentLoggedUser.customerGroup.displayName}
            </Text>
          )}
          {filteredMarkupRateGroups.listMarkupRates?.map(
            (item: any, index: number) => {
              const template = parseViewTemplate(item.viewTemplate);
              if (!template.length) return null;
              const currency = item.exchangeRate
                ? String(item.exchangeRate).split("/")
                : [];
              const paymentMethod =
                paymentMethods.find(
                  (method: any) => method.code === item.paymentMethodCode
                ) || {};
              return (
                <Card key={`${item.paymentMethodCode}-${index}`} size="small">
                  <Space
                    direction="vertical"
                    size={10}
                    style={{ width: "100%" }}
                  >
                    <Text strong style={{ color: token.colorPrimary }}>
                      {paymentMethod.name || "---"}{" "}
                      {item.paymentMethodCode === "alipay" &&
                      "(YCTTH 1688)"}
                    </Text>
                    {template.map((tier: any, tierIndex: number) => {
                      const value = getMarkupRateValue(item, tier, exchangeRate);
                      return (
                        <div
                          key={`${tier.fromAmount}-${tier.toAmount}-${tierIndex}`}
                        >
                          <Flex justify="space-between">
                            <Text type="secondary">
                              {t("peer_payment.range")}
                            </Text>
                            {tier.toAmount ? (
                              <span />
                            ) : (
                              <Text>
                                {t("peer_payment.above")}{" "}
                                <Text
                                  strong
                                  style={{ color: token.colorPrimary }}
                                >
                                  {moneyFormat(tier.fromAmount, currency[0])}
                                </Text>
                              </Text>
                            )}
                          </Flex>
                          <Flex justify="space-between">
                            <Text type="secondary">
                              {t("peer_payment.exchage_rate")}
                            </Text>
                            <Text>{moneyFormat(value, currency[1])}</Text>
                          </Flex>
                        </div>
                      );
                    })}
                  </Space>
                </Card>
              );
            }
          )}
        </Space>
      </Modal>

      <Modal
        title={t("peer_payment.modalConfirmYctt")}
        open={bulkModalOpen}
        onCancel={() => setBulkModalOpen(false)}
        onOk={submitBulkCharge}
        okText={t("peer_payment.modalConfirmYcttBtnConfirm")}
        cancelText={t("peer_payment.modalConfirmYcttBtnCancel")}
        confirmLoading={exchangeRatesBatchMutation.isPending}
        okButtonProps={{
          disabled:
            showWarningLimitCombinePeerPayment ||
            exchangeRatesBatchMutation.isPending,
        }}
        maskClosable={false}
        width={950}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {showWarningLimitCombinePeerPayment && (
            <Alert
              message={t("peer_payment.maxCombine1688Bills", {
                max: maxCombine1688Bills,
              })}
              type="warning"
              showIcon
            />
          )}
          {hasBulkNewExchangeRate && (
            <Alert
              message={t("peer_payment.warningNewExchangeRate")}
              type="warning"
              showIcon
            />
          )}
          <Flex gap={16} wrap>
            <Text>
              {t("peer_payment.amount")}:{" "}
              <Text type="danger" strong>
                {moneyFormat(bulkTotalAmount, selectedRows[0]?.currency)}
              </Text>
            </Text>
            <Text>
              {t("peer_payment.exchangedAmount")}:{" "}
              <Text type="danger" strong>
                {moneyFormat(bulkExchangeAmount)}
              </Text>
            </Text>
            {getTopUpMoney() > 0 && (
              <Text>
                {t("peer_payment.topUpMoney")}:{" "}
                <Text type="danger" strong>
                  {moneyFormat(getTopUpMoney())}
                </Text>
              </Text>
            )}
          </Flex>
          <Table
            rowKey="code"
            pagination={false}
            loading={exchangeRatesBatchMutation.isPending}
            dataSource={selectedRows}
            scroll={{ y: 400 }}
            columns={[
              { key: "code", title: t("peer_payment.code"), dataIndex: "code" },
              {
                key: "foreignAmount",
                title: t("peer_payment.amount"),
                dataIndex: "amount",
                align: "right",
                render: (amount, row: any) => moneyFormat(amount, row.currency),
              },
              {
                key: "exchangeRate",
                title: t("peer_payment.exchangeRate"),
                align: "right",
                render: (_, row: any) =>
                  `${moneyFormat(1, row.currency)} = ${moneyFormat(row.exchangeRate)}`,
              },
              {
                key: "exchangeAmount",
                title: t("peer_payment.exchangedAmount"),
                dataIndex: "exchangedAmount",
                align: "right",
                render: (amount) => moneyFormat(amount),
              },
              {
                key: "newExchangeRate",
                title: t("peer_payment.newExchangeRate"),
                align: "right",
                render: (_, row: any) => {
                  const newRate = getBulkNewRate(row) ?? row.exchangeRate;
                  return (
                    <Text
                      style={{
                        color: hasBulkNewExchangeRate
                          ? token.colorSuccess
                          : undefined,
                      }}
                    >
                      {moneyFormat(1, row.currency)} = {moneyFormat(newRate)}
                    </Text>
                  );
                },
              },
              {
                key: "newExchangeAmount",
                title: t("peer_payment.newExchangeAmount"),
                align: "right",
                render: (_, row: any) => (
                  <Text
                    style={{
                      color: hasBulkNewExchangeRate
                        ? token.colorSuccess
                        : undefined,
                    }}
                  >
                    {moneyFormat(getBulkNewAmount(row))}
                  </Text>
                ),
              },
            ]}
          />
        </Space>
      </Modal>

      <Modal
        title={t("peer_payment.popupChargeResultTitle")}
        open={bulkResultOpen}
        onCancel={closeBulkResultModal}
        cancelText={
          <>
            <CheckOutlined /> {t("peer_payment.closeCharge")}
          </>
        }
        closable={false}
        maskClosable={false}
        footer={(_, { CancelBtn }) => <CancelBtn />}
        cancelButtonProps={{
          loading: bulkChargeLoading,
          disabled: bulkChargeLoading,
        }}
        width={950}
      >
        <Table
          rowKey="code"
          pagination={false}
          dataSource={selectedRows}
          columns={[
            { key: "code", title: t("peer_payment.code"), dataIndex: "code" },
            {
              key: "foreignAmount",
              title: t("peer_payment.amount"),
              dataIndex: "amount",
              align: "right",
              render: (amount, row: any) => moneyFormat(amount, row.currency),
            },
            {
              key: "exchangeAmount",
              title: t("peer_payment.exchangedAmount"),
              dataIndex: "exchangedAmount",
              align: "right",
              render: (amount) => moneyFormat(amount),
            },
            {
              key: "newExchangeAmount",
              title: t("peer_payment.newExchangeAmount"),
              align: "right",
              render: (_, row: any) => (
                <Text
                  style={{
                    color: hasBulkNewExchangeRate
                      ? token.colorSuccess
                      : undefined,
                  }}
                >
                  {moneyFormat(getBulkNewAmount(row))}
                </Text>
              ),
            },
            {
              key: "status",
              title: t("peer_payment.ycttStatus"),
              render: (_, row: any) => {
                const result = bulkChargeResult[row.code] || {};
                if (result.error)
                  return <Text type="danger">{result.error}</Text>;
                if (result.success)
                  return <Text type="success">{result.success}</Text>;
                return (
                  <Space>
                    <Spin size="small" />
                    <Text>{t("peer_payment.chargeLoading")}</Text>
                  </Space>
                );
              },
            },
          ]}
        />
      </Modal>

      <Modal
        title={
          createModalType === "payment"
            ? t("peer_payment.create_request_for_pay")
            : t("peer_payment.create_transfer")
        }
        open={Boolean(createModalType)}
        onCancel={closeCreateModal}
        onOk={submitCreateModal}
        confirmLoading={
          createRequestForPayMutation.isPending ||
          askForPayMutation.isPending ||
          createPayAnInvoiceMutation.isPending ||
          askToPayAnInvoiceMutation.isPending ||
          createTransferMutation.isPending ||
          paymentQuotationMutation.isPending ||
          betterOfferMutation.isPending ||
          placeOrderBetterOfferMutation.isPending
        }
        okText={t("common.confirm")}
        cancelText={createStep > 1 ? t("button.back") : t("common.cancel")}
        cancelButtonProps={{ onClick: backCreateStep }}
        okButtonProps={{
          disabled: createStep === 1 && createExchangeRate?.rate === null,
        }}
        width={600}
      >
        <Form form={createForm} layout="vertical">
          {createModalType === "payment" ? (
            <>
              <Steps
                current={createStep - 1}
                style={{ maxWidth: 420, margin: "0 auto 24px" }}
                items={[
                  { title: t("peer_payment.request_for_pay_info") },
                  { title: t("common.confirm") },
                ]}
              />
              {createStep === 1 ? (
                <>
                  <Row gutter={20}>
                    <Col span={12}>
                      <Form.Item
                        name="amount"
                        label={t("peer_payment.amount")}
                        rules={[
                          {
                            required: true,
                            message: t("order.quantity_required"),
                          },
                        ]}
                      >
                        <InputNumber<number>
                          min={Number(1)}
                          precision={2}
                          style={{ width: "100%" }}
                          placeholder={t("peer_payment.amount_placeholder")}
                          formatter={(value) =>
                            `${value ?? ""}`.replace(
                              /\B(?=(\d{3})+(?!\d))/g,
                              ","
                            )
                          }
                          parser={(value) =>
                            Number(
                              String(value || "").replace(/\$\s?|(,*)/g, "")
                            )
                          }
                        />
                      </Form.Item>
                      {createExchangeRate?.rate === null && (
                        <Text type="danger">
                          {t("peerPayment.minPayment", {
                            value: createExchangeRate.minPayment,
                          })}
                        </Text>
                      )}
                      {createExchangeRate?.base && (
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary">{t("header.exchange")}</Text>{" "}
                          <Text>
                            {moneyFormat(1, createExchangeRate.base)} ={" "}
                            {moneyFormat(
                              createExchangeRate.rate,
                              createExchangeRate.exchange
                            )}
                          </Text>
                        </div>
                      )}
                    </Col>
                    <Col span={12}>
                      <div
                        style={{
                          border: `1px solid ${token.colorBorder}`,
                          borderRadius: 6,
                          padding: 12,
                          minHeight: 74,
                        }}
                      >
                        <Text type="secondary">
                          {t("peer_payment.exchangedAmount")}
                        </Text>
                        <Title level={5} style={{ margin: "8px 0 0" }}>
                          {moneyFormat(createExchangedAmount)}
                        </Title>
                      </div>
                    </Col>
                  </Row>
                  <Form.Item
                    name="requestForPayType"
                    style={{ marginBottom: 20 }}
                  >
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
                        {tenantConfigPayment?.config?.paymentAlipay ===
                          true && (
                          <Radio value="alipay">
                            {t("peer_payment.request_for_pay_ali")}
                          </Radio>
                        )}
                        {tenantConfigPayment?.config?.payment1688Business ===
                          true && (
                          <Radio value="company">
                            {t("peer_payment.request_for_pay_company")}
                          </Radio>
                        )}
                      </Space>
                    </Radio.Group>
                  </Form.Item>

                  {createPaymentType === "alipay" ? (
                    <>
                      <Form.Item
                        name="originalReceipts"
                        label={t("peer_payment.originalReceipts")}
                      >
                        <Input
                          placeholder={t("peer_payment.originalReceipt_enter")}
                        />
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
                            <Radio value="paymentAccount">
                              {t("peer_payment.select_paymentAccount")}
                            </Radio>
                          </Col>
                          <Col span={12}>
                            <Radio value="qrCode">
                              {t("peer_payment.upload_qr_code")}
                            </Radio>
                          </Col>
                        </Row>
                      </Radio.Group>
                      {createPayInputType === "qrCode" ? (
                        <Form.Item
                          name="qrCode"
                          label={t("peer_payment.upload_qr_code")}
                          rules={[
                            {
                              required: true,
                              message: t("shipment.qrcode_required"),
                            },
                          ]}
                        >
                          <Upload
                            accept="image/*"
                            listType="picture-card"
                            maxCount={1}
                            fileList={qrCodeFiles}
                            beforeUpload={async (file) => {
                              if (!file.type.startsWith("image/")) {
                                notification.error({
                                  message: t("message.picture"),
                                });
                                return Upload.LIST_IGNORE;
                              }
                              if (qrCodeFiles.length >= 1) {
                                notification.error({
                                  message: t("peer_payment.upload_qr_limit"),
                                });
                                return Upload.LIST_IGNORE;
                              }
                              const preview = URL.createObjectURL(file);
                              setQrCodeFiles([
                                {
                                  uid: file.uid,
                                  name: file.name,
                                  status: "uploading",
                                  url: preview,
                                },
                              ]);
                              try {
                                const response =
                                  await uploadQrCodeMutation.mutateAsync(file);
                                if (response.url) {
                                  createForm.setFieldsValue({
                                    qrCode: response.url,
                                  });
                                  setQrCodeFiles([
                                    {
                                      uid: file.uid,
                                      name: file.name,
                                      status: "done",
                                      url: preview,
                                    },
                                  ]);
                                }
                              } catch (error: any) {
                                notification.error({
                                  message:
                                    error?.response?.data?.message ||
                                    error?.message ||
                                    t("common.error"),
                                });
                                createForm.setFieldsValue({
                                  qrCode: undefined,
                                });
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
                                <span>{t("peer_payment.upload_qr_code")}</span>
                              </Space>
                            )}
                          </Upload>
                        </Form.Item>
                      ) : (
                        <>
                          <Form.Item
                            name="paymentAccount"
                            label={t("peer_payment.paymentAccount")}
                            rules={[
                              {
                                required: true,
                                message: t("order.quantity_required"),
                              },
                            ]}
                          >
                            <Select
                              showSearch
                              optionFilterProp="label"
                              placeholder={t(
                                "peer_payment.select_paymentAccount"
                              )}
                              options={paymentAccounts.map((item: any) => ({
                                value: item.account || item.code || item.id,
                                label: `${item.displayName || item.name || item.account || item.code}${
                                  item.account ? ` (${item.account})` : ""
                                }`,
                              }))}
                            />
                          </Form.Item>
                          <Form.Item
                            name="paymentLink"
                            label={t("peer_payment.payment_link")}
                            rules={[
                              {
                                required: true,
                                message: t("order.quantity_required"),
                              },
                              {
                                validator: (_, value) =>
                                  !value || isValidUrl(value)
                                    ? Promise.resolve()
                                    : Promise.reject(
                                        new Error(t("shipment.link_error"))
                                      ),
                              },
                            ]}
                          >
                            <Input
                              placeholder={t("peer_payment.payment_link_enter")}
                            />
                          </Form.Item>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Form.Item
                        name="originalReceipts"
                        label={t("peer_payment.originalReceipts")}
                        rules={[
                          {
                            required: true,
                            message: t("order.quantity_required"),
                          },
                        ]}
                      >
                        <Input
                          placeholder={t("peer_payment.originalReceipt_enter")}
                        />
                      </Form.Item>
                      <Form.Item
                        name="billTo"
                        label={t("peer_payment.billTo")}
                        rules={[
                          {
                            required: true,
                            message: t("order.quantity_required"),
                          },
                        ]}
                      >
                        <Input placeholder={t("peer_payment.billTo_enter")} />
                      </Form.Item>
                    </>
                  )}
                  <Form.Item
                    name="note"
                    label={t("peer_payment.note")}
                    rules={[{ max: 50, message: t("peer_payment.memo_error") }]}
                  >
                    <Input.TextArea
                      placeholder={t("peer_payment.note_placeholder")}
                    />
                  </Form.Item>
                </>
              ) : (
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Row gutter={createBetterOffer ? 24 : 0}>
                    <Col span={createBetterOffer ? 12 : 24}>
                      <Card
                        size="small"
                        title={t("peer_payment.create_payment_with_normal")}
                      >
                        <Flex justify="space-between">
                          <Text>{t("peer_payment.amount")}:</Text>
                          <Text>{formatCnyAmount(createAmount)}</Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text>{t("peer_payment.exchangedAmount")}:</Text>
                          <Text>{moneyFormat(createExchangedAmount)}</Text>
                        </Flex>
                        {createFeeItems.map((item: any, index: number) => {
                          const fee = peerPaymentFees.find(
                            (feeItem: any) => feeItem.code === item.feeCode
                          );
                          const feeLabel =
                            fee?.name ||
                            defaultFeeLabels[item.feeCode] ||
                            item.feeCode;
                          return (
                            <Flex
                              key={`${item.feeCode}-${index}`}
                              justify="space-between"
                            >
                              <Text>{feeLabel}:</Text>
                              <Text>{moneyFormat(item.provisionalAmount)}</Text>
                            </Flex>
                          );
                        })}
                        <Divider dashed style={{ margin: "12px 0" }} />
                        <Flex justify="space-between">
                          <Text strong>{t("orderDetail.total_money")}:</Text>
                          <Text strong style={{ color: token.colorPrimary }}>
                            {moneyFormat(createTotalMoney)}
                          </Text>
                        </Flex>
                      </Card>
                    </Col>
                    {Boolean(createBetterOffer) && (
                      <Col span={12}>
                        <Card
                          size="small"
                          title={t("peer_payment.payment_with_better_offer")}
                        >
                          <Flex justify="space-between">
                            <Text>{t("peer_payment.better_offer_value")}:</Text>
                            <Text>{formatCnyAmount(createBetterOffer)}</Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text>{t("peer_payment.exchangedAmount")}:</Text>
                            <Text>
                              {moneyFormat(createBetterOfferExchangedAmount)}
                            </Text>
                          </Flex>
                          {createBetterOfferFeeItems.map(
                            (item: any, index: number) => {
                              const fee = peerPaymentFees.find(
                                (feeItem: any) => feeItem.code === item.feeCode
                              );
                              const feeLabel =
                                fee?.name ||
                                defaultFeeLabels[item.feeCode] ||
                                item.feeCode;
                              return (
                                <Flex
                                  key={`${item.feeCode}-${index}`}
                                  justify="space-between"
                                >
                                  <Text>{feeLabel}:</Text>
                                  <Text>
                                    {moneyFormat(item.provisionalAmount)}
                                  </Text>
                                </Flex>
                              );
                            }
                          )}
                          <Divider dashed style={{ margin: "12px 0" }} />
                          <Flex justify="space-between">
                            <Text strong>{t("orderDetail.total_money")}:</Text>
                            <Text strong style={{ color: token.colorPrimary }}>
                              {moneyFormat(createBetterOfferTotalMoney)}
                            </Text>
                          </Flex>
                        </Card>
                      </Col>
                    )}
                  </Row>
                  <Alert
                    message={t("peer_payment.create_warning_message")}
                    type="warning"
                    showIcon
                  />
                  {Boolean(createBetterOffer) && (
                    <Popconfirm
                      placement="topRight"
                      icon={
                        <InfoCircleFilled
                          style={{ color: token.colorPrimary }}
                        />
                      }
                      title={t("peer_payment.buy_with_better_offer_confirm")}
                      okText={t("common.confirm")}
                      cancelText={t("common.cancel")}
                      okButtonProps={{
                        icon: <CheckOutlined />,
                        loading: placeOrderBetterOfferMutation.isPending,
                      }}
                      cancelButtonProps={{ icon: <CloseOutlined /> }}
                      onConfirm={submitCreateBetterOffer}
                    >
                      <Button
                        type="primary"
                        icon={<PercentageOutlined />}
                        loading={placeOrderBetterOfferMutation.isPending}
                      >
                        {t("button.buy_with_better_offer")}
                      </Button>
                    </Popconfirm>
                  )}
                  {hasCreateFeeWarning && (
                    <Alert
                      message={t("peer_payment.fee_warning")}
                      type="warning"
                      showIcon
                    />
                  )}
                </Space>
              )}
            </>
          ) : (
            <>
              <Steps
                current={createStep - 1}
                style={{ maxWidth: 420, margin: "0 auto 24px" }}
                items={[
                  { title: t("peer_payment.transfer_info") },
                  { title: t("common.confirm") },
                ]}
              />
              {createStep === 1 ? (
                <>
                  <Row gutter={20}>
                    <Col span={12}>
                      <Form.Item
                        name="amount"
                        label={t("peer_payment.amount")}
                        rules={[
                          {
                            required: true,
                            message: t("order.quantity_required"),
                          },
                        ]}
                      >
                        <InputNumber<number>
                          min={Number(1)}
                          precision={2}
                          style={{ width: "100%" }}
                          placeholder={t("peer_payment.amount_placeholder")}
                          formatter={(value) =>
                            `${value ?? ""}`.replace(
                              /\B(?=(\d{3})+(?!\d))/g,
                              ","
                            )
                          }
                          parser={(value) =>
                            Number(
                              String(value || "").replace(/\$\s?|(,*)/g, "")
                            )
                          }
                        />
                      </Form.Item>
                      {createExchangeRate?.rate === null && (
                        <Text type="danger">
                          {t("peerPayment.minTransfer", {
                            value: createExchangeRate.minPayment,
                          })}
                        </Text>
                      )}
                      {createExchangeRate?.base && (
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary">{t("header.exchange")}</Text>{" "}
                          <Text>
                            {moneyFormat(1, createExchangeRate.base)} ={" "}
                            {moneyFormat(
                              createExchangeRate.rate,
                              createExchangeRate.exchange
                            )}
                          </Text>
                        </div>
                      )}
                    </Col>
                    <Col span={12}>
                      <div
                        style={{
                          border: `1px solid ${token.colorBorder}`,
                          borderRadius: 6,
                          padding: 12,
                          minHeight: 74,
                        }}
                      >
                        <Text type="secondary">
                          {t("peer_payment.exchangedAmount")}
                        </Text>
                        <Title level={5} style={{ margin: "8px 0 0" }}>
                          {moneyFormat(createExchangedAmount)}
                        </Title>
                      </div>
                    </Col>
                  </Row>
                  <Form.Item
                    name="paymentMethodCode"
                    rules={[
                      { required: true, message: t("order.quantity_required") },
                    ]}
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
                        {tenantConfigPayment?.config?.transferAlipay ===
                          true && (
                          <Radio value="alipay">
                            {t("peer_payment.alipay")}
                          </Radio>
                        )}
                        {tenantConfigPayment?.config?.transferBank === true && (
                          <Radio value="bank_transfer">
                            {t("peer_payment.bank_transfer")}
                          </Radio>
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
                            label={t("peer_payment.bank_name")}
                            rules={[
                              {
                                required: true,
                                message: t("order.quantity_required"),
                              },
                            ]}
                          >
                            <Input
                              placeholder={t(
                                "peer_payment.bank_name_placeholder"
                              )}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="beneficiaryAccount"
                            label={t("peer_payment.beneficiaryAccount")}
                            rules={[
                              {
                                required: true,
                                message: t("order.quantity_required"),
                              },
                            ]}
                          >
                            <Input
                              placeholder={t(
                                "peer_payment.beneficiaryAccount_placeholder"
                              )}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item
                        name="beneficiaryBankBranch"
                        label={t("peer_payment.bank_branch")}
                      >
                        <Input
                          placeholder={t("peer_payment.bank_branch_enter")}
                        />
                      </Form.Item>
                    </>
                  )}

                  {currentCreatePaymentMethodCode === "alipay" && (
                    <Form.Item
                      name="beneficiaryAccount"
                      label={t("peer_payment.beneficiaryAccount")}
                      rules={[
                        {
                          required: true,
                          message: t("order.quantity_required"),
                        },
                      ]}
                    >
                      <Input
                        placeholder={t(
                          "peer_payment.beneficiaryAccount_placeholder"
                        )}
                      />
                    </Form.Item>
                  )}
                  <Form.Item
                    name="beneficiaryName"
                    label={t("peer_payment.beneficiaryName")}
                    rules={[
                      { required: true, message: t("order.quantity_required") },
                    ]}
                  >
                    <Input
                      placeholder={t(
                        "peer_payment.beneficiaryName_placeholder"
                      )}
                    />
                  </Form.Item>
                  <Form.Item
                    name="memo"
                    label={t("peer_payment.memo")}
                    rules={[
                      { required: true, message: t("order.quantity_required") },
                      { max: 50, message: t("peer_payment.memo_error") },
                    ]}
                  >
                    <Input.TextArea
                      placeholder={t("peer_payment.memo_placeholder")}
                    />
                  </Form.Item>
                  <Form.Item
                    name="note"
                    label={t("peer_payment.note")}
                    rules={[{ max: 50, message: t("peer_payment.memo_error") }]}
                  >
                    <Input.TextArea
                      placeholder={t("peer_payment.note_placeholder")}
                    />
                  </Form.Item>
                </>
              ) : (
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Card size="small">
                    <Row gutter={24}>
                      <Col span={12}>
                        <Flex justify="space-between">
                          <Text>{t("peer_payment.amount")}:</Text>
                          <Text>{formatCnyAmount(createAmount)}</Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text>{t("peer_payment.exchangedAmount")}:</Text>
                          <Text>{moneyFormat(createExchangedAmount)}</Text>
                        </Flex>
                      </Col>
                      <Col span={12}>
                        <Text strong>{t("fee_tab.service_fee")}:</Text>
                        {createFeeItems.map((item: any, index: number) => {
                          const fee = peerPaymentFees.find(
                            (feeItem: any) => feeItem.code === item.feeCode
                          );
                          const feeLabel =
                            fee?.name ||
                            defaultFeeLabels[item.feeCode] ||
                            item.feeCode;
                          return (
                            <Flex
                              key={`${item.feeCode}-${index}`}
                              justify="space-between"
                            >
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
                        {t("orderDetail.total_money")}:{" "}
                        <Text strong style={{ color: token.colorPrimary }}>
                          {moneyFormat(createTotalMoney)}
                        </Text>
                      </Text>
                    </Flex>
                  </Card>
                  <Alert
                    message={t("peer_payment.create_warning_message")}
                    type="warning"
                    showIcon
                  />
                  {hasCreateFeeWarning && (
                    <Alert
                      message={t("peer_payment.fee_warning")}
                      type="warning"
                      showIcon
                    />
                  )}
                </Space>
              )}
            </>
          )}
        </Form>
      </Modal>

      <PinModal
        open={exportOpen}
        confirmLoading={exportMutation.isPending}
        onConfirm={submitExport}
        onCancel={() => setExportOpen(false)}
        t={t}
      />
    </Space>
  );
};

export default PeerPaymentsStyleDefault;
