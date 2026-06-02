import { Link as RouterLink } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Input,
  List,
  Modal,
  Popconfirm,
  Row,
  Skeleton,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Timeline,
  Tooltip,
  Typography,
  theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CloseOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  EditOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  usePeerPaymentDetailFeesQuery,
  usePeerPaymentFinancialTypesQuery,
  usePeerPaymentFinancialsQuery,
  usePeerPaymentLogsInfiniteQuery,
  usePeerPaymentMilestonesQuery,
  usePeerPaymentDetailPage,
} from "@repo/hooks";
import { useTranslation } from "@repo/i18n";
import { moneyCeil, moneyFormat } from "@repo/util";
import { ChatPanel } from "../../components/Common/ChatPanel";

const { Text, Title } = Typography;
const listTypePeerPayment = ["payment", "taobao_global"];

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

const formatTime = (value?: string) => (value ? dayjs(value).format("HH:mm DD/MM/YYYY") : "---");

const toBoolean = (value: any) => {
  if (value === true || value === "true" || value === 1 || value === "1") return true;
  if (value === false || value === "false" || value === 0 || value === "0") return false;
  return undefined;
};

const wrapBoldText = (text: any) => `<strong>${text ?? ""}</strong>`;
const wrapDiv = (value: any) => `<div>${value ?? ""}</div>`;
const renderTemplate = (template: string, bindings: Record<string, any>) =>
  Object.keys(bindings).reduce(
    (result, key) => result.replaceAll(`\${${key}}`, String(bindings[key] ?? "")),
    template,
  );

const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => {
  const { token } = theme.useToken();
  return (
    <Flex
      align="center"
      gap={token.padding}
      style={{
        padding: `${token.padding}px 0`,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <Text>{label}:</Text>
      <div style={{ fontSize: token.fontSizeLG, color: token.colorText }}>{children}</div>
    </Flex>
  );
};

const renderFeeTooltip = (item: any, customerDiscountLevel: any, t: any) => (
  <ul style={{ margin: 0, paddingLeft: 16 }}>
    {item.reason && <li>{item.reason}</li>}
    {customerDiscountLevel && (
      <li>
        {t("fee_tab.discountCustomer", {
          value:
            customerDiscountLevel.discountType === "PERCENT"
              ? `${customerDiscountLevel.discountValue}%`
              : moneyFormat(customerDiscountLevel.discountValue),
        })}
      </li>
    )}
  </ul>
);

const FeeValue = ({ item, dataDetail }: { item: any; dataDetail: any }) => {
  const { t } = useTranslation();
  const customerDiscountLevel = dataDetail?.customerDiscountLevels?.find(
    (discount: any) => discount?.feeCode === item?.type?.code,
  );
  const hasTooltip = Boolean(item.reason || customerDiscountLevel);
  const tooltip = hasTooltip ? (
    <Tooltip title={renderFeeTooltip(item, customerDiscountLevel, t)}>
      <QuestionCircleOutlined style={{ marginLeft: 10 }} />
    </Tooltip>
  ) : (
    <span style={{ width: 22, display: "inline-block" }} />
  );

  if (item.free) {
    return (
      <Text>
        <Text delete type="secondary" style={{ paddingRight: 5 }}>
          {moneyFormat(moneyCeil(item.actualAmount))}
        </Text>{" "}
        {t("fee_tab.free")} {tooltip}
      </Text>
    );
  }

  if (item.manual && item.provisionalAmount !== null && item.provisionalAmount !== undefined) {
    return (
      <Text>
        <Text delete type="secondary" style={{ paddingRight: 5 }}>
          {moneyFormat(moneyCeil(item.provisionalAmount))}
        </Text>{" "}
        {moneyFormat(moneyCeil(item.actualAmount))} {tooltip}
      </Text>
    );
  }

  return (
    <Text>
      {moneyFormat(moneyCeil(item.actualAmount))} {tooltip}
    </Text>
  );
};

const FeeTab = ({ code, dataDetail }: { code?: string; dataDetail: any }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { data = [], isLoading } = usePeerPaymentDetailFeesQuery(code);
  const rows = Array.isArray(data) ? data : [];
  const summaryRow = (
    label: string,
    value: any,
    noNegative = false,
    className?: string,
  ) => (
    <li
      className={className}
      style={{
        alignItems: "center",
        color: token.colorWhite,
        display: "flex",
        justifyContent: "space-between",
        padding: "5px 0",
      }}
    >
      <span>{label}</span>
      <span>{moneyFormat(moneyCeil(value), undefined, noNegative)}</span>
    </li>
  );

  return (
    <Spin spinning={isLoading}>
      <div className="box-financial">
        <Row style={{ paddingLeft: 15, paddingRight: 15 }}>
          <Col xl={16} sm={12} style={{ paddingRight: 15 }}>
            {rows.length > 0 ? (
              <>
                <h3
                  style={{
                    color: token.colorText,
                    fontSize: token.fontSize,
                    fontWeight: 500,
                    marginBottom: 5,
                    textTransform: "uppercase",
                  }}
                >
                  {t("fee_tab.service_fee")}
                </h3>
                <ul
                  className="_fees"
                  style={{
                    background: token.colorFillSecondary,
                    borderRadius: 4,
                    listStyle: "none",
                    margin: 0,
                    padding: "10px 15px",
                  }}
                >
                  {rows.map((item: any, index: number) => (
                    <li
                      className="_listItem"
                      key={`${item.feeCode || item.type?.code || index}`}
                      style={{
                        alignItems: "center",
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "5px 0",
                      }}
                    >
                      <span>{item.type?.name || item.feeName || item.feeCode || "---"}</span>
                      <FeeValue item={item} dataDetail={dataDetail} />
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <Empty description={t("fee_tab.empty_fee")} />
            )}
          </Col>
          <Col xl={8} sm={12}>
            <h3
              style={{
                color: token.colorText,
                fontSize: token.fontSize,
                fontWeight: 500,
                marginBottom: 5,
                textTransform: "uppercase",
              }}
            >
              {t("eventGroup.FINANCIAL")}
            </h3>
            <ul
              className="_orderFees"
              style={{
                background: token.colorPrimary,
                borderRadius: 4,
                listStyle: "none",
                margin: 0,
                padding: "10px 15px",
              }}
            >
              {summaryRow(t("peer_payment.exchangedAmount"), dataDetail.exchangedAmount)}
              {summaryRow(t("fee_tab.fee_total"), dataDetail.totalFee)}
              <Divider style={{ borderColor: "rgba(255,255,255,0.35)", margin: "10px 0" }} />
              {summaryRow(t("fee_tab.paid"), dataDetail.totalPaid)}
              {summaryRow(t("fee_tab.refunded_service"), dataDetail.totalRefund)}
              {summaryRow(
                Number(dataDetail.totalUnpaid || 0) >= 0
                  ? t("order.need_payment")
                  : t("order.excess_cash"),
                dataDetail.totalUnpaid,
                true,
              )}
              {dataDetail.totalClaim
                ? summaryRow(t("order.totalClaim"), dataDetail.totalClaim, true)
                : null}
            </ul>
          </Col>
        </Row>
      </div>
    </Spin>
  );
};

const FinanceTab = ({ code }: { code?: string }) => {
  const { t } = useTranslation();
  const { data = [], isLoading } = usePeerPaymentFinancialsQuery(code);
  const { data: types = [] } = usePeerPaymentFinancialTypesQuery();
  const columns: ColumnsType<any> = [
    {
      title: t("peer_payment.teller"),
      dataIndex: "teller",
      key: "teller",
      className: "_finance-teller",
      render: (text) => (
        <div className="_financial-teller-text txt-size-h7 txt-color-black roboregular mgbt5 break-word">
          {text || "---"}
        </div>
      ),
    },
    {
      title: t("financial_tab.time"),
      dataIndex: "timestamp",
      key: "timestamp",
      className: "_finance-time",
      render: (_text, record) => (
        <div className="_financial-time-text txt-size-h7 txt-color-black roboregular mgbt5 break-word">
          {formatTime(record.timestamp)}
        </div>
      ),
    },
    {
      title: t("financial_tab.amount"),
      dataIndex: "amount",
      key: "amount",
      className: "_finance-amount",
      render: (amount) => {
        const isPositive = Number(amount) >= 0;
        return (
          <div
            className={`_financial-amount-text txt-size-h7 roboregular mgbt5 break-word ${
              isPositive ? "txt-color-green" : "txt-color-red"
            }`}
            style={{ color: isPositive ? "#52c41a" : "#ff4d4f" }}
          >
            {isPositive ? `+${moneyFormat(amount)}` : moneyFormat(amount)}
          </div>
        );
      },
    },
    {
      title: t("financial_tab.transaction_type"),
      dataIndex: "financialType",
      key: "financialType",
      className: "_finance-type whitespace",
      render: (type) => (
        <div className="_financial-type-text txt-size-h7 txt-color-black roboregular mgbt5 whitespace break-word">
          {types.find((item: any) => item.code === type)?.name || type || "---"}
        </div>
      ),
    },
    {
      title: t("financial_tab.content"),
      key: "content",
      className: "_finance-content table__name",
      render: (_value, record) => (
        <div className="table__name">
          <div className="_finance-content-trxId txt-size-h8 txt-color-gray roboregular mgbt0">
            {t("financial_tab.code")}: {record.trxId || "---"}
          </div>
          <div className="_finance-content-text break-word mgbt0 txt-size-h7 txt-color-black">
            {record.memo || "---"}
          </div>
        </div>
      ),
    },
  ];

  return (
    <Spin spinning={isLoading}>
      <Table
        className="_finance-table pd15"
        rowKey="id"
        columns={columns}
        dataSource={[...data].sort((a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf())}
        rowClassName={() => "_finance-row"}
        pagination={{
          hideOnSinglePage: true,
          pageSize: 5,
          simple: true,
          total: Array.isArray(data) ? data.length : 0,
        }}
      />
    </Spin>
  );
};

const HistoryTab = ({ code, statuses }: { code?: string; statuses: any[] }) => {
  const { t } = useTranslation();
  const { data = [], isLoading } = usePeerPaymentMilestonesQuery(code);
  if (isLoading) {
    return (
      <div style={{ marginBottom: 25, marginTop: 25, textAlign: "center" }}>
        <Spin spinning />
      </div>
    );
  }

  return (
    <Timeline mode="alternate">
      {Array.isArray(data) && data.length > 0 ? (
        data.map((item: any, index: number) => {
          const status = statuses.find((statusItem: any) => statusItem.code === item.status);
          return (
            <Timeline.Item
              key={`${item.status || "status"}-${item.timestamp || index}`}
              color={index === 0 ? "red" : "green"}
              dot={
                index === 0 ? (
                  <ClockCircleOutlined style={{ fontSize: 24 }} className="ic__clockcircle" />
                ) : undefined
              }
            >
              <span className="txt-color-gray txt-size-h7 robotoregular pdr5">
                {status ? status.name : "---"}:
              </span>
              <span className="txt-color-black txt-size-h7 robotobold pdr5">
                {item.timestamp ? dayjs(item.timestamp).format("HH:mm DD/MM") : "---"}
              </span>
            </Timeline.Item>
          );
        })
      ) : (
        <Empty className="mgbt25 mgt15" description={t("message.empty")} />
      )}
    </Timeline>
  );
};

const PeerPaymentLogItem = ({ item, statuses }: { item: any; statuses: any[] }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const getStatusByCode = (codeValue: any) => {
    const status = statuses.find((statusItem: any) => statusItem.code === codeValue);
    if (status) return status;
    const internalStatus = statuses.find((statusItem: any) => statusItem.code === codeValue);
    return statuses.find((statusItem: any) => statusItem.code === internalStatus?.publicStatus);
  };

  const formatLogsContent = () => {
    switch (item.activity) {
      case "PEER_PAYMENT_FEE_CREATE": {
        if (item.change?.type !== "NEW_OBJECT") break;
        const data = item.change?.newObject?.[0] || {};
        return wrapDiv(renderTemplate(t(`logPeerPayment.${item.activity}`), {
          name: wrapBoldText(data.feeName),
          amount: wrapBoldText(moneyFormat(data.actualAmount, "VND")),
          reason: wrapBoldText(data.reason),
        }));
      }
      case "PEER_PAYMENT_FEE_UPDATE": {
        if (item.change?.type !== "PROPERTY_CHANGE") break;
        const targetMetadata = item.target?.metadata || {};
        const changedValues = [...(item.change?.valueChange?.changedValues || [])]
          .map((it: any, index: number) => ({ ...it, index }))
          .sort((left: any, right: any) => right.index - left.index);

        return changedValues.map((it: any) => {
          let oldValueFormatted = it.left !== null ? it.left : t("logPeerPayment.nullValue");
          let newValueFormatted = it.right !== null ? it.right : t("logPeerPayment.nullValue");

          if (it.key === "amount") {
            oldValueFormatted = it.left !== null ? moneyFormat(it.left, "VND") : t("logPeerPayment.nullValue");
            newValueFormatted = it.right !== null ? moneyFormat(it.right, "VND") : t("logPeerPayment.nullValue");
          }

          if (it.key === "fee" || it.key === "free") {
            oldValueFormatted = toBoolean(it.left) === false
              ? t("logPeerPayment.notFree")
              : toBoolean(it.left) === true
                ? t("logPeerPayment.free")
                : t("logPeerPayment.nullValue");
            newValueFormatted = toBoolean(it.right) === false
              ? t("logPeerPayment.notFree")
              : toBoolean(it.right) === true
                ? t("logPeerPayment.free")
                : t("logPeerPayment.nullValue");
          }

          return wrapDiv(renderTemplate(t(`logPeerPayment.${item.activity}`), {
            field: wrapBoldText(t(`logPeerPayment.${it.key}`)),
            feeName: wrapBoldText(targetMetadata.feeName),
            oldValue: wrapBoldText(oldValueFormatted),
            newValue: wrapBoldText(newValueFormatted),
          }));
        }).join("");
      }
      case "PEER_PAYMENT_STATUS_UPDATE":
      case "PEER_PAYMENT_EXCHANGE_RATE_UPDATE":
      case "PEER_PAYMENT_UPDATE_TELLER": {
        if (item.change?.type !== "PROPERTY_CHANGE") break;
        const changedValues = item.change?.valueChange?.changedValues || [];
        return changedValues.map((it: any) => {
          let oldValueFormatted = it.left;
          let newValueFormatted = it.right;

          if (oldValueFormatted === null) oldValueFormatted = t("logPeerPayment.nullValue");
          if (newValueFormatted === null) newValueFormatted = t("logPeerPayment.nullValue");

          if (it.key === "status") {
            oldValueFormatted = getStatusByCode(it.left)?.name || "---";
            newValueFormatted = getStatusByCode(it.right)?.name || "---";
          }

          if (it.key === "exchangeRate") {
            oldValueFormatted = it.left === null ? t("logPeerPayment.nullValue") : moneyFormat(it.left, "VND");
            newValueFormatted = it.right === null ? t("logPeerPayment.nullValue") : moneyFormat(it.right, "VND");
          }

          if (it.key === "teller") {
            oldValueFormatted = it.left === null ? t("logPeerPayment.nullValue") : it.left;
            newValueFormatted = it.right === null ? t("logPeerPayment.nullValue") : it.right;
          }

          return wrapDiv(renderTemplate(t("logPeerPayment.fieldChange"), {
            field: wrapBoldText(t(`logPeerPayment.${it.key}`)),
            oldValue: wrapBoldText(oldValueFormatted),
            newValue: wrapBoldText(newValueFormatted),
          }));
        }).join("");
      }
      case "PEER_PAYMENT_CREATE": {
        if (item.change?.type !== "NEW_OBJECT") break;
        const data = item.change?.newObject?.[0] || {};
        const peerPaymentType = data.peerPaymentType === "transfer"
          ? t("logPeerPayment.peerPaymentTypeTransfer")
          : t("logPeerPayment.peerPaymentTypePayment");
        return wrapDiv(renderTemplate(t(`logPeerPayment.${item.activity}`), {
          code: wrapBoldText(data.code),
          peerPaymentType: wrapBoldText(peerPaymentType),
        }));
      }
      case "PEER_PAYMENT_ORIGINAL_RECEIPT_DELETE": {
        if (item.change?.type !== "OBJECT_REMOVED") break;
        const data = item.change?.removedObject?.[0] || {};
        return wrapDiv(renderTemplate(t(`logPeerPayment.${item.activity}`), {
          originalReceiptCode: wrapBoldText(data.code),
        }));
      }
      case "PEER_PAYMENT_ORIGINAL_RECEIPT_CREATE": {
        if (item.change?.type !== "NEW_OBJECT") break;
        const data = item.change?.newObject?.[0] || {};
        return wrapDiv(renderTemplate(t(`logPeerPayment.${item.activity}`), {
          originalReceiptCode: wrapBoldText(data.code),
        }));
      }
      default:
        return item.message || item.action || item.memo || "---";
    }
    return item.message || item.action || item.memo || "---";
  };

  return (
    <div>
      <Row className="_row-log-info txt-size-h7 txt-color-gray robotoregular dpl-block mgt12">
        <span>{formatTime(item.timestamp)}</span>,
        <span>
          <span className="pdl5">{t(`logPeerPayment.${item.actor?.role}`)} </span>
          <span className="txt-color-black robotobold pdl5">{item.actor?.username || "---"}</span>
        </span>
      </Row>
      <Row
        className="_row-log-content txt-size-h6 txt-color-black robotoregular dpl-block whitespace-pre-wrap break-word"
        style={{ color: token.colorText, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        dangerouslySetInnerHTML={{ __html: formatLogsContent() }}
      />
    </div>
  );
};

const LogTab = ({ code, statuses }: { code?: string; statuses: any[] }) => {
  const { t } = useTranslation();
  const logQuery = usePeerPaymentLogsInfiniteQuery(code);
  const logs = logQuery.data?.pages.flatMap((page) => page.data) || [];

  if (logQuery.isLoading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  if (logQuery.isError) {
    return <Empty description={t("message.empty")} />;
  }

  return (
    <List
      className="demo-loadmore-list _order-logs order-log-list pdl20"
      itemLayout="horizontal"
      dataSource={logs}
      locale={{ emptyText: <Empty description={t("message.empty")} /> }}
      loadMore={
        logQuery.hasNextPage ? (
          <div className="mgt5 mgbt5" style={{ textAlign: "center", height: 32, lineHeight: "32px" }}>
            <Button type="link" loading={logQuery.isFetchingNextPage} onClick={() => logQuery.fetchNextPage()}>
              {t("log_product.loading_more")}
            </Button>
          </div>
        ) : null
      }
      renderItem={(item) => (
        <List.Item style={{ display: "block", paddingInline: 0 }}>
          <PeerPaymentLogItem item={item} statuses={statuses} />
        </List.Item>
      )}
    />
  );
};

const CreditTab = ({ dataDetail }: { dataDetail: any }) => {
  const { t } = useTranslation();
  return (
    <Space direction="vertical" style={{ width: "100%", padding: 16 }}>
      <DetailRow label={t("peer_payment.credit")}>
        {dataDetail.contractWithShopkeeper === "NOSHOW"
          ? t("peerPayment.loanCanceled")
          : t("peerPayment.loanApproved")}
      </DetailRow>
    </Space>
  );
};

export const PeerPaymentDetailStyleGobiz = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const page = usePeerPaymentDetailPage();
  const {
    activeTab,
    setActiveTab,
    dataDetail,
    isLoading,
    isError,
    statuses,
    itemStatus,
    stringListOriginalReceipts,
    isShowShipmentCode,
    isInSuspensionSchedule,
    contractWithShopkeeper,
    hasCredit,
    modalOpen,
    newOriginalReceipt,
    setNewOriginalReceipt,
    visibleReceipts,
    isReceiptSaving,
    exchangeRateByAmount,
    checkingExchange,
    newExchangedAmount,
    showPayButton,
    showCancelButton,
    chargeMutation,
    cancelMutation,
    openReceiptModal,
    closeReceiptModal,
    handleAddReceipt,
    markReceiptForDelete,
    handleSaveReceipts,
    handleCharge,
    handleCancel,
    handleOpenChargeConfirm,
  } = page;

  if (isError) {
    return <Empty description={t("message.empty")} />;
  }

  return (
    <Spin spinning={isLoading}>
      <Space direction="vertical" size={token.padding} style={{ width: "100%" }}>
        <Title level={3} style={{ margin: 0 }}>
          {dataDetail.peerPaymentType === listTypePeerPayment[1]
            ? t("peer_payment.title_page_TBG")
            : t("peer_payment.title_page")}{" "}
          #{dataDetail.code || ""}
        </Title>
        <Row gutter={token.padding}>
          <Col span={17}>
            <Card styles={{ body: { paddingTop: 0 } }} style={{ borderTop: `3px solid ${token.colorSuccess}` }}>
              <Flex justify="space-between" align="center" style={{ padding: `${token.padding}px 0`, borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
                <Flex align="center" gap={token.marginSM}>
                  <Text strong style={{ fontSize: token.fontSizeLG }}>#{dataDetail.code}</Text>
                  {hasCredit && (
                    <Tooltip
                      title={
                        <span>
                          {t("peer_payment.credit")}:{" "}
                          {contractWithShopkeeper !== "NOSHOW"
                            ? t("peerPayment.loanApproved")
                            : t("peerPayment.loanCanceled")}
                        </span>
                      }
                    >
                      <CreditCardOutlined style={{ color: contractWithShopkeeper === "NOSHOW" ? token.colorError : token.colorTextSecondary }} />
                    </Tooltip>
                  )}
                  <Tag style={{ backgroundColor: statusColor(dataDetail.status), color: token.colorWhite }}>
                    {itemStatus.name || dataDetail.status || "---"}
                  </Tag>
                </Flex>
                <Space>
                  {showPayButton && (
                    <Popconfirm
                      disabled={Boolean(isInSuspensionSchedule)}
                      placement="topRight"
                      overlayClassName="_pay-popconfirm-overlay"
                      className="_pay-popconfirm"
                      title={
                        <div>
                          <div>{t("peer_payment.payment_action_confirm")}</div>
                          {checkingExchange && <Spin />}
                          {!checkingExchange &&
                            exchangeRateByAmount.rate &&
                            exchangeRateByAmount.rate !== dataDetail.exchangeRate &&
                            !dataDetail.fixedExchangeRate && (
                              <div style={{ paddingTop: token.paddingSM }}>
                                <div style={{ width: 300 }}>
                                  {t("peer_payment.amount")}:{" "}
                                  <Text strong type="success">{moneyFormat(dataDetail.amount, dataDetail.currency)}</Text>
                                </div>
                                <Table
                                  size="small"
                                  pagination={false}
                                  showHeader={false}
                                  columns={[
                                    { dataIndex: "oldLabel" },
                                    { dataIndex: "old", render: (text) => <Text type="danger">{text}</Text> },
                                    { render: () => "-->" },
                                    { dataIndex: "newLabel" },
                                    { dataIndex: "new", render: (text) => <Text type="success">{text}</Text> },
                                  ]}
                                  dataSource={[
                                    {
                                      key: 1,
                                      oldLabel: `${t("peer_payment.old_exchangeRate")}:`,
                                      old: moneyFormat(dataDetail.exchangeRate),
                                      newLabel: `${t("peer_payment.new_exchangeRate")}:`,
                                      new: moneyFormat(exchangeRateByAmount.rate),
                                    },
                                    {
                                      key: 2,
                                      oldLabel: `${t("peer_payment.old_amount")}:`,
                                      old: moneyFormat(dataDetail.exchangedAmount),
                                      newLabel: `${t("peer_payment.new_amount")}:`,
                                      new: moneyFormat(newExchangedAmount),
                                    },
                                  ]}
                                />
                              </div>
                            )}
                        </div>
                      }
                      onConfirm={handleCharge}
                      okText={t("button.yes")}
                      cancelText={t("button.no")}
                      onOpenChange={handleOpenChargeConfirm}
                    >
                      <Button
                        type="primary"
                        className={`${isInSuspensionSchedule ? "btn-disabled" : ""} btn-payment-detail _btn-payment`}
                        disabled={Boolean(isInSuspensionSchedule)}
                        loading={chargeMutation.isPending}
                        style={{
                          alignItems: "center",
                          borderRadius: 8,
                          boxSizing: "border-box",
                          display: "inline-flex",
                          height: 34,
                          justifyContent: "center",
                          lineHeight: "22px",
                          padding: "5px 10px",
                          marginRight: token.marginSM,
                        }}
                      >
                        {t("peer_payment.rowPayment")}
                      </Button>
                    </Popconfirm>
                  )}
                  {showCancelButton && (
                    <Popconfirm
                      placement="topRight"
                      overlayClassName="_cancel-popconfirm-overlay"
                      className="_cancel-popconfirm"
                      title={t("peer_payment.payment_action_confirm")}
                      onConfirm={handleCancel}
                      okText={t("button.yes")}
                      cancelText={t("button.no")}
                    >
                      <div
                        className="_btn_cancel"
                        style={{
                          alignItems: "center",
                          borderRadius: 8,
                          border: `1px solid ${token.colorError}`,
                          boxSizing: "border-box",
                          color: token.colorError,
                          cursor: cancelMutation.isPending ? "wait" : "pointer",
                          display: "inline-flex",
                          height: 34,
                          justifyContent: "center",
                          opacity: cancelMutation.isPending ? 0.65 : 1,
                          padding: "5px 10px",
                          lineHeight: "22px",
                        }}
                      >
                        {t("peer_payment.cancel_action")}
                      </div>
                    </Popconfirm>
                  )}
                </Space>
              </Flex>

              <DetailRow label={t("fee_tab.amount")}>
                <Text strong style={{ color: token.colorWarning }}>
                  {moneyFormat(dataDetail.amount, dataDetail.currency)} - {moneyFormat(dataDetail.exchangedAmount)}
                </Text>
                <Text style={{ marginLeft: token.marginXL }}>{t("mainLayout.exchange_rate")}:</Text>
                <Text style={{ marginLeft: token.marginSM, color: token.colorWarning }}>
                  {dataDetail.exchangeRate
                    ? `${moneyFormat(1, dataDetail.currency)} = ${moneyFormat(dataDetail.exchangeRate)}`
                    : "---"}
                </Text>
              </DetailRow>

              {listTypePeerPayment.includes(dataDetail.peerPaymentType) && (
                <DetailRow label={t("shipments.originalReceipts")}>
                  <Text>
                    {stringListOriginalReceipts}
                    <EditOutlined onClick={openReceiptModal} style={{ color: token.colorPrimary, marginLeft: token.marginXS, cursor: "pointer" }} />
                  </Text>
                </DetailRow>
              )}

              {isShowShipmentCode && (
                <DetailRow label={t("peer_payment.shipmentCode")}>
                  {dataDetail.shipmentCode ? (
                    <RouterLink to={`/shipments/${dataDetail.shipmentCode}`} target="_blank">{dataDetail.shipmentCode}</RouterLink>
                  ) : "---"}
                </DetailRow>
              )}

              <DetailRow label={t("peer_payment.trxTime")}>{formatTime(dataDetail.trxTime)}</DetailRow>
              <DetailRow label={dataDetail.peerPaymentType === "transfer" ? t("peer_payment.beneficiaryAccount") : t("peer_payment.paymentAccount")}>
                {dataDetail.peerPaymentType === "transfer"
                  ? [dataDetail.beneficiaryAccount, dataDetail.beneficiaryBank, dataDetail.beneficiaryName, dataDetail.beneficiaryBankBranch].filter(Boolean).join(" - ") || "---"
                  : dataDetail.paymentAccount || "---"}
              </DetailRow>
              <DetailRow label={t("peer_payment.memo")}>{dataDetail.memo || "---"}</DetailRow>
              <DetailRow label={t("peer_payment.note")}>{dataDetail.note || "---"}</DetailRow>
            </Card>

            {dataDetail.code && (
              <Card style={{ marginTop: token.margin }}>
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  items={[
                    { key: "fees", label: t("eventGroup.FINANCIAL"), children: <FeeTab code={dataDetail.code} dataDetail={dataDetail} /> },
                    ...(contractWithShopkeeper && contractWithShopkeeper !== "NONE"
                      ? [{ key: "credit", label: t("peer_payment.credit"), children: <CreditTab dataDetail={dataDetail} /> }]
                      : []),
                    { key: "financial", label: t("financial_tab.transaction"), children: <FinanceTab code={dataDetail.code} /> },
                    { key: "history", label: t("history_tab.history"), children: <HistoryTab code={dataDetail.code} statuses={statuses} /> },
                    { key: "log", label: t("log_tab.log"), children: <LogTab code={dataDetail.code} statuses={statuses} /> },
                  ]}
                />
              </Card>
            )}
          </Col>
          <Col span={7}>
            {dataDetail.code && (
              <div style={{ position: "sticky", top: token.margin, height: "calc(100vh - 120px)" }}>
                <ChatPanel entityType="peer_payments" entityCode={dataDetail.code} rounded="round" entityCreatedAt={dataDetail.createdAt} />
              </div>
            )}
          </Col>
        </Row>
      </Space>

      <Modal
        title={t("shipments.editOriginalReceipt")}
        open={modalOpen}
        onOk={handleSaveReceipts}
        confirmLoading={isReceiptSaving}
        onCancel={closeReceiptModal}
        okText={t("button.save")}
        cancelText={t("button.cancel")}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Flex gap={token.marginXS}>
            <Input
              value={newOriginalReceipt}
              placeholder={t("shipments.originalReceipt_enter")}
              disabled={isReceiptSaving}
              onChange={(event) => setNewOriginalReceipt(event.target.value)}
              onPressEnter={handleAddReceipt}
            />
            <Button type="primary" disabled={isReceiptSaving} onClick={handleAddReceipt}>
              {t("shipments.add_OriginalReceipt")}
            </Button>
          </Flex>
          <Flex wrap="wrap" gap={token.marginXS}>
            {visibleReceipts.length > 0 ? (
              visibleReceipts.map((item: any) => (
                <Tag
                  key={item.id ?? item.code}
                  closable
                  color={item.draft ? "processing" : undefined}
                  closeIcon={<CloseOutlined />}
                  onClose={(event) => {
                    event.preventDefault();
                    markReceiptForDelete(item);
                  }}
                >
                  {item.code || "---"}
                </Tag>
              ))
            ) : (
              <Flex justify="center" style={{ width: "100%" }}>
                <Empty description={t("message.empty")} />
              </Flex>
            )}
          </Flex>
        </Space>
      </Modal>
    </Spin>
  );
};

export default PeerPaymentDetailStyleGobiz;
