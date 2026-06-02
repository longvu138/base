import { useCallback, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  ConfigProvider,
  DatePicker,
  Empty,
  Flex,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Popconfirm,
  Radio,
  Segmented,
  Select,
  Skeleton,
  Space,
  Tag,
  Typography,
  theme,
} from "antd";
import {
  CreditCardOutlined,
  FileExcelOutlined,
  InfoCircleOutlined,
  PayCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { useMobilePeerPaymentsPage } from "@repo/hooks";
import { moneyFormat } from "@repo/util";
import { PinModal } from "@repo/ui";

const { Text, Title, Paragraph } = Typography;

const formatDateTime = (value?: string) =>
  value ? dayjs(value).format("HH:mm DD/MM/YYYY") : "---";

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
  const page = useMobilePeerPaymentsPage();
  const [createOpen, setCreateOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [createForm] = Form.useForm();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelIndex = Math.max(page.rows.length - 5, 0);
  const isPaymentType = page.peerPaymentType === "payment";
  const createMutationLoading =
    page.createRequestForPayMutation.isPending ||
    page.askForPayMutation.isPending ||
    page.createPayAnInvoiceMutation.isPending ||
    page.askToPayAnInvoiceMutation.isPending ||
    page.createTransferMutation.isPending;

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

  const openCreateModal = () => {
    createForm.resetFields();
    createForm.setFieldsValue({
      requestForPayType: "alipay",
      paymentMethodCode: isPaymentType ? "alipay" : "bank_transfer",
    });
    setCreateOpen(true);
  };

  const submitCreateModal = async () => {
    const values = await createForm.validateFields();
    if (isPaymentType) {
      await page.handleCreatePaymentRequest(values, {
        needPayOnRequest:
          page.tenantConfigPayment?.peerPaymentConfig?.needPayOnRequest,
      });
    } else {
      await page.handleCreateTransferRequest(values);
    }
    setCreateOpen(false);
  };

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
                      Chuyển tiền
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
              onClick={openCreateModal}
              block
              style={{ height: "auto", minHeight: 40, whiteSpace: "normal" }}
            >
              {isPaymentType ? "Tạo yêu cầu" : "Tạo chuyển tiền"}
            </Button>
            <Button
              icon={<FileExcelOutlined />}
              loading={page.exportMutation.isPending}
              onClick={() => setExportOpen(true)}
              block
              style={{ height: "auto", minHeight: 40, whiteSpace: "normal" }}
            >
              Xuất Excel
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
        open={createOpen}
        title={
          isPaymentType
            ? page.t("peer_payment.create_request_for_pay")
            : page.t("peer_payment.create_transfer")
        }
        onCancel={() => setCreateOpen(false)}
        onOk={submitCreateModal}
        okText={page.t("common.confirm")}
        cancelText={page.t("common.cancel")}
        confirmLoading={createMutationLoading}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="amount"
            label={page.t("peer_payment.amount")}
            rules={[{ required: true, message: page.t("order.quantity_required") }]}
          >
            <InputNumber<number>
              min={1}
              precision={2}
              style={{ width: "100%" }}
              placeholder={page.t("peer_payment.amount_placeholder")}
            />
          </Form.Item>

          {isPaymentType ? (
            <>
              <Form.Item name="requestForPayType">
                <Radio.Group>
                  <Space direction="vertical">
                    {page.tenantConfigPayment?.config?.paymentAlipay !== false ? (
                      <Radio value="alipay">
                        {page.t("peer_payment.request_for_pay_ali")}
                      </Radio>
                    ) : null}
                    {page.tenantConfigPayment?.config?.payment1688Business === true ? (
                      <Radio value="company">
                        {page.t("peer_payment.request_for_pay_company")}
                      </Radio>
                    ) : null}
                  </Space>
                </Radio.Group>
              </Form.Item>
              <Form.Item
                name="originalReceipts"
                label={page.t("peer_payment.originalReceipts")}
              >
                <Input placeholder={page.t("peer_payment.originalReceipt_enter")} />
              </Form.Item>
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
                rules={[{ required: true, message: page.t("order.quantity_required") }]}
              >
                <Input placeholder={page.t("peer_payment.payment_link_enter")} />
              </Form.Item>
              <Form.Item name="billTo" label={page.t("peer_payment.billTo")}>
                <Input placeholder={page.t("peer_payment.billTo_enter")} />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                name="paymentMethodCode"
                rules={[{ required: true, message: page.t("order.quantity_required") }]}
              >
                <Radio.Group>
                  <Space direction="vertical">
                    {page.tenantConfigPayment?.config?.transferAlipay === true ? (
                      <Radio value="alipay">{page.t("peer_payment.alipay")}</Radio>
                    ) : null}
                    {page.tenantConfigPayment?.config?.transferBank !== false ? (
                      <Radio value="bank_transfer">
                        {page.t("peer_payment.bank_transfer")}
                      </Radio>
                    ) : null}
                  </Space>
                </Radio.Group>
              </Form.Item>
              <Form.Item name="beneficiaryBank" label={page.t("peer_payment.bank_name")}>
                <Input placeholder={page.t("peer_payment.bank_name_placeholder")} />
              </Form.Item>
              <Form.Item
                name="beneficiaryAccount"
                label={page.t("peer_payment.beneficiaryAccount")}
                rules={[{ required: true, message: page.t("order.quantity_required") }]}
              >
                <Input placeholder={page.t("peer_payment.beneficiaryAccount_placeholder")} />
              </Form.Item>
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
                rules={[{ required: true, message: page.t("order.quantity_required") }]}
              >
                <Input.TextArea placeholder={page.t("peer_payment.memo_placeholder")} />
              </Form.Item>
            </>
          )}

          <Form.Item name="note" label={page.t("peer_payment.note")}>
            <Input.TextArea placeholder={page.t("peer_payment.note_placeholder")} />
          </Form.Item>
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
