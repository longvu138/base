import { Link } from "react-router-dom";
import {
  Button,
  Card,
  Divider,
  Empty,
  Flex,
  Input,
  List,
  Modal,
  Popconfirm,
  Skeleton,
  Space,
  Spin,
  Tabs,
  Tag,
  Timeline,
  Typography,
  theme,
} from "antd";
import {
  ArrowLeftOutlined,
  CloseOutlined,
  CreditCardOutlined,
  EditOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  usePeerPaymentDetailFeesQuery,
  usePeerPaymentDetailPage,
  usePeerPaymentFinancialTypesQuery,
  usePeerPaymentFinancialsQuery,
  usePeerPaymentLogsInfiniteQuery,
  usePeerPaymentMilestonesQuery,
} from "@repo/hooks";
import { useTranslation } from "@repo/i18n";
import { moneyCeil, moneyFormat } from "@repo/util";
import { ChatPanel } from "../ShipmentDetail/ChatPanel";

const { Text, Title, Paragraph } = Typography;
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

const Field = ({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Space direction="vertical" size={2} style={{ minWidth: 0, width: "100%" }}>
    <Text type="secondary">{label}</Text>
    <div style={{ minWidth: 0, wordBreak: "break-word" }}>{children}</div>
  </Space>
);

const SummaryLine = ({ label, value }: { label: React.ReactNode; value: React.ReactNode }) => (
  <Flex justify="space-between" gap={12}>
    <Text>{label}</Text>
    <Text strong>{value}</Text>
  </Flex>
);

const FeesTab = ({ code, dataDetail }: { code?: string; dataDetail: any }) => {
  const { t } = useTranslation();
  const { data = [], isLoading } = usePeerPaymentDetailFeesQuery(code);
  const rows = Array.isArray(data) ? data : [];

  return (
    <Spin spinning={isLoading}>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Card size="small" title={t("fee_tab.service_fee")}>
          {rows.length ? (
            <Space direction="vertical" style={{ width: "100%" }}>
              {rows.map((item: any, index: number) => (
                <SummaryLine
                  key={`${item.feeCode || item.type?.code || index}`}
                  label={item.type?.name || item.feeName || item.feeCode || "---"}
                  value={
                    item.free
                      ? t("fee_tab.free")
                      : moneyFormat(moneyCeil(item.actualAmount))
                  }
                />
              ))}
            </Space>
          ) : (
            <Empty description={t("fee_tab.empty_fee")} />
          )}
        </Card>
        <Card size="small" title={t("eventGroup.FINANCIAL")}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <SummaryLine
              label={t("peer_payment.exchangedAmount")}
              value={moneyFormat(moneyCeil(dataDetail.exchangedAmount))}
            />
            <SummaryLine label={t("fee_tab.fee_total")} value={moneyFormat(moneyCeil(dataDetail.totalFee))} />
            <Divider style={{ margin: "8px 0" }} />
            <SummaryLine label={t("fee_tab.paid")} value={moneyFormat(moneyCeil(dataDetail.totalPaid))} />
            <SummaryLine
              label={t("fee_tab.refunded_service")}
              value={moneyFormat(moneyCeil(dataDetail.totalRefund))}
            />
            <SummaryLine
              label={Number(dataDetail.totalUnpaid || 0) >= 0 ? t("order.need_payment") : t("order.excess_cash")}
              value={moneyFormat(moneyCeil(dataDetail.totalUnpaid), undefined, true)}
            />
          </Space>
        </Card>
      </Space>
    </Spin>
  );
};

const FinancialTab = ({ code }: { code?: string }) => {
  const { t } = useTranslation();
  const { data = [], isLoading } = usePeerPaymentFinancialsQuery(code);
  const { data: types = [] } = usePeerPaymentFinancialTypesQuery();
  const rows = Array.isArray(data)
    ? [...data].sort((a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf())
    : [];

  return (
    <Spin spinning={isLoading}>
      <List
        split={false}
        dataSource={rows}
        locale={{ emptyText: <Empty description={t("message.empty")} /> }}
        renderItem={(item: any) => {
          const isPositive = Number(item.amount || 0) >= 0;
          return (
            <List.Item style={{ paddingInline: 0 }}>
              <Card size="small" style={{ width: "100%" }}>
                <Space direction="vertical" size={6} style={{ width: "100%" }}>
                  <Flex justify="space-between" gap={12}>
                    <Text strong>{item.teller || "---"}</Text>
                    <Text type={isPositive ? "success" : "danger"}>
                      {isPositive ? `+${moneyFormat(item.amount)}` : moneyFormat(item.amount)}
                    </Text>
                  </Flex>
                  <Text type="secondary">{formatTime(item.timestamp)}</Text>
                  <Text>
                    {types.find((type: any) => type.code === item.financialType)?.name ||
                      item.financialType ||
                      "---"}
                  </Text>
                  <Text type="secondary">
                    {t("financial_tab.code")}: {item.trxId || "---"}
                  </Text>
                  <Paragraph style={{ marginBottom: 0 }}>{item.memo || "---"}</Paragraph>
                </Space>
              </Card>
            </List.Item>
          );
        }}
      />
    </Spin>
  );
};

const HistoryTab = ({ code, statuses }: { code?: string; statuses: any[] }) => {
  const { t } = useTranslation();
  const { data = [], isLoading } = usePeerPaymentMilestonesQuery(code);

  if (isLoading) return <Skeleton active paragraph={{ rows: 4 }} />;

  return Array.isArray(data) && data.length ? (
    <Timeline
      items={data.map((item: any, index: number) => {
        const status = statuses.find((statusItem: any) => statusItem.code === item.status);
        return {
          color: index === 0 ? "red" : "green",
          children: (
            <Space direction="vertical" size={0}>
              <Text>{status?.name || item.status || "---"}</Text>
              <Text type="secondary">{formatTime(item.timestamp)}</Text>
            </Space>
          ),
        };
      })}
    />
  ) : (
    <Empty description={t("message.empty")} />
  );
};

const LogTab = ({ code }: { code?: string }) => {
  const { t } = useTranslation();
  const logQuery = usePeerPaymentLogsInfiniteQuery(code);
  const logs = logQuery.data?.pages.flatMap((page) => page.data) || [];

  if (logQuery.isLoading) return <Skeleton active paragraph={{ rows: 8 }} />;

  return (
    <List
      split={false}
      dataSource={logs}
      locale={{ emptyText: <Empty description={t("message.empty")} /> }}
      loadMore={
        logQuery.hasNextPage ? (
          <Button block loading={logQuery.isFetchingNextPage} onClick={() => logQuery.fetchNextPage()}>
            {t("log_product.loading_more")}
          </Button>
        ) : null
      }
      renderItem={(item: any) => (
        <List.Item style={{ paddingInline: 0 }}>
          <Card size="small" style={{ width: "100%" }}>
            <Space direction="vertical" size={6} style={{ width: "100%" }}>
              <Text type="secondary">{formatTime(item.timestamp)}</Text>
              <Text strong>{item.actor?.username || item.actor?.name || "---"}</Text>
              <Paragraph style={{ marginBottom: 0 }}>
                {item.message || item.action || item.memo || item.activity || "---"}
              </Paragraph>
            </Space>
          </Card>
        </List.Item>
      )}
    />
  );
};

const CreditTab = ({ dataDetail }: { dataDetail: any }) => {
  const { t } = useTranslation();
  return (
    <Card size="small">
      <Field label={t("peer_payment.credit")}>
        {dataDetail.contractWithShopkeeper === "NOSHOW"
          ? t("peerPayment.loanCanceled")
          : t("peerPayment.loanApproved")}
      </Field>
    </Card>
  );
};

export const PeerPaymentDetailStyleDefault = () => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
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

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 12 }} />;
  }

  if (isError || !dataDetail?.code) {
    return (
      <Flex vertical align="center" justify="center" style={{ minHeight: 300 }}>
        <RocketOutlined style={{ fontSize: 48, color: token.colorTextTertiary }} />
        <Text type="secondary">{t("message.empty")}</Text>
      </Flex>
    );
  }

  const accountText =
    dataDetail.peerPaymentType === "transfer"
      ? [
          dataDetail.beneficiaryAccount,
          dataDetail.beneficiaryBank,
          dataDetail.beneficiaryName,
          dataDetail.beneficiaryBankBranch,
        ].filter(Boolean).join(" - ") || "---"
      : dataDetail.paymentAccount || "---";

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Button type="link" icon={<ArrowLeftOutlined />} href="/peer-payments" style={{ paddingInline: 0 }}>
        {t("peer_payment.title_page")}
      </Button>

      <Card>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Flex justify="space-between" align="flex-start" gap={12}>
            <Space direction="vertical" size={4} style={{ minWidth: 0 }}>
              <Title level={4} style={{ margin: 0 }}>
                {dataDetail.peerPaymentType === listTypePeerPayment[1]
                  ? t("peer_payment.title_page_TBG")
                  : t("peer_payment.title_page")}
              </Title>
              <Paragraph copyable={{ text: dataDetail.code }} style={{ marginBottom: 0 }} ellipsis>
                #{dataDetail.code}
              </Paragraph>
            </Space>
            <Tag
              style={{
                backgroundColor: statusColor(dataDetail.status),
                color: token.colorWhite,
                marginInlineEnd: 0,
                whiteSpace: "normal",
              }}
            >
              {itemStatus.name || dataDetail.status || "---"}
            </Tag>
          </Flex>

          {hasCredit ? (
            <Tag icon={<CreditCardOutlined />} color={contractWithShopkeeper === "NOSHOW" ? "red" : "blue"}>
              {contractWithShopkeeper === "NOSHOW"
                ? t("peerPayment.loanCanceled")
                : t("peerPayment.loanApproved")}
            </Tag>
          ) : null}

          <Flex gap={8} wrap>
            {showPayButton ? (
              <Popconfirm
                disabled={Boolean(isInSuspensionSchedule)}
                title={t("peer_payment.payment_action_confirm")}
                okText={t("button.yes")}
                cancelText={t("button.no")}
                onConfirm={handleCharge}
                onOpenChange={handleOpenChargeConfirm}
              >
                <Button
                  type="primary"
                  disabled={Boolean(isInSuspensionSchedule)}
                  loading={chargeMutation.isPending}
                >
                  {t("peer_payment.rowPayment")}
                </Button>
              </Popconfirm>
            ) : null}
            {showCancelButton ? (
              <Popconfirm
                title={t("peer_payment.payment_action_confirm")}
                okText={t("button.yes")}
                cancelText={t("button.no")}
                onConfirm={handleCancel}
              >
                <Button danger loading={cancelMutation.isPending}>
                  {t("peer_payment.cancel_action")}
                </Button>
              </Popconfirm>
            ) : null}
          </Flex>

          <Flex gap={12} wrap>
            <div style={{ flex: "1 1 150px" }}>
              <Field label={t("peer_payment.amount")}>
                <Text strong>{moneyFormat(dataDetail.amount, dataDetail.currency)}</Text>
              </Field>
            </div>
            <div style={{ flex: "1 1 150px" }}>
              <Field label={t("peer_payment.exchangedAmount")}>
                <Text strong>{moneyFormat(dataDetail.exchangedAmount)}</Text>
              </Field>
            </div>
            <div style={{ flex: "1 1 150px" }}>
              <Field label={t("mainLayout.exchange_rate")}>
                {dataDetail.exchangeRate
                  ? `${moneyFormat(1, dataDetail.currency)} = ${moneyFormat(dataDetail.exchangeRate)}`
                  : "---"}
              </Field>
            </div>
          </Flex>

          {listTypePeerPayment.includes(dataDetail.peerPaymentType) ? (
            <Field label={t("shipments.originalReceipts")}>
              <Text>
                {stringListOriginalReceipts}
                <EditOutlined
                  onClick={openReceiptModal}
                  style={{ color: token.colorPrimary, marginLeft: token.marginXS }}
                />
              </Text>
            </Field>
          ) : null}

          {isShowShipmentCode ? (
            <Field label={t("peer_payment.shipmentCode")}>
              {dataDetail.shipmentCode ? (
                <Link to={`/shipments/${dataDetail.shipmentCode}`}>{dataDetail.shipmentCode}</Link>
              ) : (
                "---"
              )}
            </Field>
          ) : null}

          <Field label={t("peer_payment.trxTime")}>{formatTime(dataDetail.trxTime)}</Field>
          <Field
            label={
              dataDetail.peerPaymentType === "transfer"
                ? t("peer_payment.beneficiaryAccount")
                : t("peer_payment.paymentAccount")
            }
          >
            {accountText}
          </Field>
          <Field label={t("peer_payment.memo")}>{dataDetail.memo || "---"}</Field>
          <Field label={t("peer_payment.note")}>{dataDetail.note || "---"}</Field>
        </Space>
      </Card>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "fees",
              label: t("eventGroup.FINANCIAL"),
              children: <FeesTab code={dataDetail.code} dataDetail={dataDetail} />,
            },
            ...(contractWithShopkeeper && contractWithShopkeeper !== "NONE"
              ? [
                  {
                    key: "credit",
                    label: t("peer_payment.credit"),
                    children: <CreditTab dataDetail={dataDetail} />,
                  },
                ]
              : []),
            {
              key: "financial",
              label: t("financial_tab.transaction"),
              children: <FinancialTab code={dataDetail.code} />,
            },
            {
              key: "history",
              label: t("history_tab.history"),
              children: <HistoryTab code={dataDetail.code} statuses={statuses} />,
            },
            {
              key: "log",
              label: t("log_tab.log"),
              children: <LogTab code={dataDetail.code} />,
            },
          ]}
        />
      </Card>

      <div style={{ height: 560 }}>
        <ChatPanel
          entityType="peer_payments"
          entityCode={dataDetail.code}
          entityCreatedAt={dataDetail.createdAt}
          rounded="square"
        />
      </div>

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
          <Flex gap={8}>
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
          <Flex wrap="wrap" gap={8}>
            {visibleReceipts.length ? (
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
              <Empty description={t("message.empty")} />
            )}
          </Flex>
        </Space>
      </Modal>
    </Space>
  );
};

export default PeerPaymentDetailStyleDefault;
