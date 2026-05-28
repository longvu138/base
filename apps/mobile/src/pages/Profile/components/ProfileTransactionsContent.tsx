import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Flex,
  Form,
  Input,
  Modal,
  Pagination,
  Row,
  Space,
  Table,
  Tag,
  Typography,
  theme,
} from "antd";
import {
  DownloadOutlined,
  FileDoneOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { moneyFormat } from "@repo/util";
import { useProfileTransactionsPage } from "@repo/hooks";

const emptyText = "---";

type ProfileTransactionsContentProps = {
  t: (key: string) => string;
  variant?: "classic" | "compact" | "summary";
};

const getTransactionTimestamp = (record: any) =>
  record.actualTimestamp ||
  record.nominalTimestamp ||
  record.timestamp ||
  record.createdAt;

const formatDateTime = (value?: string) => {
  if (!value) return emptyText;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return emptyText;
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")} ${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}/${date.getFullYear()}`;
};

const getTransactionTypeColor = (type?: string) => {
  const colorMap: Record<string, string> = {
    ADJUSTMENT: "purple",
    CHARGE: "orange",
    CREDIT: "green",
    DEBIT: "red",
    DEPOSIT: "green",
    GIFT: "magenta",
    PAYMENT: "red",
    REFUND: "cyan",
    TRANSFER: "blue",
    WITHDRAW: "blue",
  };
  return colorMap[type?.toUpperCase() || ""] || "default";
};

const formatMoney = (value?: number) => {
  if (value === null || value === undefined) return moneyFormat(0);
  return moneyFormat(value);
};

export const ProfileTransactionsContent = ({
  t,
  variant = "classic",
}: ProfileTransactionsContentProps) => {
  const { token } = theme.useToken();
  const logic = useProfileTransactionsPage(t);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportSecret, setExportSecret] = useState("");
  const [exportError, setExportError] = useState("");
  const transactions = logic.transactionData?.data || [];
  const total = logic.transactionData?.total || 0;
  const selectedTypes = Form.useWatch("externalTypes", logic.form) || [];

  const columns = [
    {
      title: t("customer_info.time"),
      dataIndex: "actualTimestamp",
      width: 190,
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>
            {formatDateTime(getTransactionTimestamp(record))}
          </Typography.Text>
          <Typography.Text type="secondary">
            STK: {record.account || logic.accountId || emptyText}
          </Typography.Text>
          {record.txid && (
            <Typography.Text type="secondary">
              Mã: {record.txid}
            </Typography.Text>
          )}
        </Space>
      ),
    },
    {
      title: t("customer_info.transaction_type"),
      dataIndex: "externalType",
      width: 180,
      render: (value: string, record: any) => {
        const typeCode = value || record.type;
        const type = logic.transactionTypes.find(
          (item: any) =>
            item.code?.toLowerCase() === String(typeCode || "").toLowerCase(),
        );
        return (
          <Tag color={getTransactionTypeColor(record.type || typeCode)}>
            {type?.name || typeCode || emptyText}
          </Tag>
        );
      },
    },
    {
      title: t("financial_tab.content"),
      dataIndex: "memo",
      render: (value: string, record: any) => (
        <Typography.Paragraph
          style={{ marginBottom: 0 }}
          ellipsis={{
            rows: 2,
            expandable: true,
            symbol: t("customer_info.detail"),
          }}
        >
          {value || record.description || emptyText}
        </Typography.Paragraph>
      ),
    },
    {
      title: t("financial_tab.amount"),
      dataIndex: "amount",
      width: 150,
      align: "right" as const,
      render: (value: number) => {
        const positive = Number(value || 0) >= 0;
        return (
          <Typography.Text strong type={positive ? "success" : "danger"}>
            {positive ? "+" : ""}
            {formatMoney(value)}
          </Typography.Text>
        );
      },
    },
    {
      title: "Số dư",
      dataIndex: "balanceAfter",
      width: 150,
      align: "right" as const,
      render: (value: number) => (
        <Typography.Text strong>{formatMoney(value)}</Typography.Text>
      ),
    },
  ];

  const renderTypeFilters = () => (
    <Flex gap={token.marginXS} wrap>
      {logic.transactionTypes.map((item: any) => {
        const checked = selectedTypes.includes(item.code);
        return (
          <Tag.CheckableTag
            key={item.code}
            checked={checked}
            onChange={() => logic.toggleTransactionType(item.code)}
            style={{
              border: `1px solid ${
                checked ? token.colorPrimary : token.colorBorder
              }`,
              borderRadius: token.borderRadius,
              marginInlineEnd: 0,
              padding: `${token.paddingXXS}px ${token.paddingSM}px`,
            }}
          >
            {item.name}
          </Tag.CheckableTag>
        );
      })}
    </Flex>
  );

  const renderFilters = () => (
    <Form form={logic.form} layout="horizontal" onFinish={logic.handleSearch}>
      <Row
        gutter={[token.marginMD, token.marginSM]}
        style={{
          borderBottom: `1px dashed ${token.colorBorderSecondary}`,
          paddingBottom: token.paddingMD,
        }}
      >
        <Col xs={24}>
          <Form.Item
            name="externalTypes"
            label={t("customer_info.transaction_type")}
            wrapperCol={{ flex: "auto" }}
            style={{ marginBottom: 0 }}
          >
            {renderTypeFilters()}
          </Form.Item>
        </Col>
      </Row>

      <Row
        gutter={[token.marginMD, token.marginSM]}
        style={{
          borderBottom: `1px dashed ${token.colorBorderSecondary}`,
          paddingBlock: token.paddingMD,
        }}
      >
        <Col xs={24} md={12}>
          <Form.Item
            name="query"
            label={t("customer_info.input_code")}
            labelCol={{ span: 24 }}
            style={{ marginBottom: 0 }}
          >
            <Input
              allowClear
              placeholder="Mã đơn, mã giao dịch"
              onPressEnter={logic.handleSearch}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label={t("customer_info.time")}
            labelCol={{ span: 24 }}
            style={{ marginBottom: 0 }}
          >
            <Space.Compact style={{ width: "100%" }}>
              <Form.Item name="nominalTimestampFrom" noStyle>
                <DatePicker
                  format="DD/MM/YYYY"
                  placeholder="Từ ngày"
                  style={{ width: "50%" }}
                />
              </Form.Item>
              <Form.Item name="nominalTimestampTo" noStyle>
                <DatePicker
                  format="DD/MM/YYYY"
                  placeholder="Đến ngày"
                  style={{ width: "50%" }}
                />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
        </Col>
      </Row>

      <Flex
        justify="end"
        gap={token.marginSM}
        style={{ marginTop: token.marginMD }}
      >
        <Button icon={<ReloadOutlined />} onClick={logic.handleReset}>
          {t("order.filter_refresh")}
        </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => {
              setExportSecret("");
              setExportError("");
              setExportOpen(true);
            }}
            loading={logic.isExporting}
          >
            Xuất Excel
          </Button>
        <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
          {t("customer_info.search")}
        </Button>
      </Flex>
    </Form>
  );

  const renderCards = () => (
    <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
      {transactions.length ? (
        transactions.map((item: any) => {
          const typeCode = item.externalType || item.type;
          const type = logic.transactionTypes.find(
            (transactionType: any) =>
              transactionType.code?.toLowerCase() ===
              String(typeCode || "").toLowerCase(),
          );
          const positive = Number(item.amount || 0) >= 0;

          return (
            <Card key={item.id || item.txid} size="small">
              <Flex justify="space-between" gap={token.marginSM} wrap>
                <Space align="start">
                  <FileDoneOutlined style={{ color: token.colorPrimary }} />
                  <Space direction="vertical" size={0}>
                    <Typography.Text strong>
                      {formatDateTime(getTransactionTimestamp(item))}
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      {item.memo || item.description || emptyText}
                    </Typography.Text>
                    <Tag color={getTransactionTypeColor(item.type || typeCode)}>
                      {type?.name || typeCode || emptyText}
                    </Tag>
                  </Space>
                </Space>
                <Space direction="vertical" size={0} align="end">
                  <Typography.Text
                    strong
                    type={positive ? "success" : "danger"}
                  >
                    {positive ? "+" : ""}
                    {formatMoney(item.amount)}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    Số dư: {formatMoney(item.balanceAfter)}
                  </Typography.Text>
                </Space>
              </Flex>
            </Card>
          );
        })
      ) : (
        <Empty description={t("message.empty")} />
      )}
    </Space>
  );

  return (
    <Space direction="vertical" size={token.marginMD} style={{ width: "100%" }}>
      <Card styles={{ body: { padding: 0 } }}>
        <div style={{ padding: token.paddingLG }}>{renderFilters()}</div>
      </Card>

      <Card styles={{ body: { padding: 0 } }}>
        <Flex
          justify="space-between"
          align="center"
          gap={token.marginSM}
          wrap
          style={{
            padding: token.paddingMD,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Space size={token.marginXXS}>
            <Typography.Text strong>
              {t("customer_info.transaction_history_list")}
            </Typography.Text>
            <Badge count={total} overflowCount={999999} />
          </Space>
        </Flex>
        {variant === "classic" ? (
          <Table
            rowKey={(record) => record.id || record.txid}
            columns={columns}
            dataSource={transactions}
            loading={logic.isLoading}
            pagination={false}
            locale={{ emptyText: <Empty description={t("message.empty")} /> }}
            scroll={{ x: 940 }}
          />
        ) : (
          <div style={{ padding: token.paddingMD }}>
            {logic.isLoading ? (
              <Table
                rowKey="id"
                columns={columns}
                dataSource={[]}
                loading
                pagination={false}
              />
            ) : (
              renderCards()
            )}
          </div>
        )}
      </Card>

      <Flex justify="end">
        <Pagination
          current={logic.page}
          pageSize={logic.pageSize}
          total={total}
          showSizeChanger
          onChange={logic.changePage}
        />
      </Flex>
      <Modal
        title={t("modal.confirm_pin")}
        open={exportOpen}
        confirmLoading={logic.isExporting}
        okText={t("cartCheckout.confirm")}
        cancelText={t("cartCheckout.cancel")}
        onCancel={() => {
          setExportOpen(false);
          setExportSecret("");
          setExportError("");
        }}
        onOk={() =>
          logic.handleExport(
            exportSecret,
            () => {
              setExportOpen(false);
              setExportSecret("");
              setExportError("");
            },
            setExportError,
          )
        }
      >
        <Space direction="vertical" size={token.marginXS} style={{ width: "100%" }}>
          <Typography.Text>{t("cartCheckout.please_input_pin")}</Typography.Text>
          <Input.Password
            autoFocus
            value={exportSecret}
            status={exportError ? "error" : undefined}
            placeholder="PIN"
            onChange={(event) => {
              setExportSecret(event.target.value);
              setExportError("");
            }}
            onPressEnter={() =>
              logic.handleExport(
                exportSecret,
                () => {
                  setExportOpen(false);
                  setExportSecret("");
                  setExportError("");
                },
                setExportError,
              )
            }
          />
          {exportError && (
            <Typography.Text type="danger">{exportError}</Typography.Text>
          )}
          <Typography.Text type="secondary">
            {t("cartCheckout.default_pin")}
          </Typography.Text>
        </Space>
      </Modal>
    </Space>
  );
};
