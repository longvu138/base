import { DatabaseOutlined } from "@ant-design/icons";
import { Empty, Flex, Skeleton, Space, Table, Typography, theme } from "antd";
import dayjs from "dayjs";
import { useOrderFinancialsQuery } from "@repo/hooks";
import { moneyFormat } from "@repo/util";
import { useTranslation } from "react-i18next";

interface TransactionTabProps {
  orderCode: string;
}

const { Text } = Typography;

const normalizeFinancials = (financials: any) =>
  Array.isArray(financials) ? financials : financials ? [financials] : [];

export const TransactionTab = ({ orderCode }: TransactionTabProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { data: financials, isLoading } = useOrderFinancialsQuery(orderCode);

  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;

  const data = normalizeFinancials(financials).sort(
    (a: any, b: any) =>
      dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf(),
  );

  const columns = [
    {
      title: t("financial_tab.time"),
      key: "timestamp",
      render: (_: any, record: any) => (
        <Text>{record.timestamp ? dayjs(record.timestamp).format("HH:mm DD/MM/YYYY") : "---"}</Text>
      ),
    },
    {
      title: t("financial_tab.amount"),
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => (
        <Text style={{ color: Number(amount) >= 0 ? token.colorSuccess : token.colorError }}>
          {Number(amount) >= 0 ? `+${moneyFormat(amount)}` : moneyFormat(amount)}
        </Text>
      ),
    },
    {
      title: t("financial_tab.transaction_type"),
      dataIndex: "type",
      key: "type",
      render: (type: any) => <Text>{type?.name || t("financial_tab.transaction")}</Text>,
    },
    {
      title: t("financial_tab.content"),
      key: "content",
      render: (_: any, record: any) => (
        <Space direction="vertical" size={2}>
          <Flex align="center" gap={token.marginXXS}>
            <DatabaseOutlined style={{ color: token.colorTextTertiary }} />
            <Text type="secondary">
              {t("financial_tab.code")}: {record.txid || "---"}
            </Text>
          </Flex>
          <Text>{record.memo || "---"}</Text>
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      pagination={{
        hideOnSinglePage: true,
        simple: true,
        pageSize: 5,
      }}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("financial_tab.empty_transaction")}
          />
        ),
      }}
    />
  );
};
