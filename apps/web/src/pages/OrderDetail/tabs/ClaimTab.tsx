import { Link } from "react-router-dom";
import { PlusOutlined, WarningOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Empty,
  Flex,
  Skeleton,
  Space,
  Table,
  Typography,
  theme,
} from "antd";
import dayjs from "dayjs";
import { useClaimStatusesQuery, useOrderClaimsQuery } from "@repo/hooks";
import { moneyFormat, quantityFormat } from "@repo/util";
import { useTranslation } from "react-i18next";

interface ClaimTabProps {
  orderCode: string;
}

const { Text, Title } = Typography;

const getClaimStatus = (claim: any, statuses: any[] = []) => {
  if (claim.publicStateNewView) return claim.publicStateNewView;
  if (typeof claim.status === "object") return claim.status;
  if (typeof claim.state === "object") return claim.state;
  return (
    statuses.find((item: any) => item.code === claim.status || item.code === claim.state) || {}
  );
};

const claimName = (claim: any) =>
  claim.name || claim.subject || claim.title || claim.content || "---";

export const ClaimTab = ({ orderCode }: ClaimTabProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { data: claims = [], isLoading, isError } = useOrderClaimsQuery(orderCode);
  const { data: statuses = [] } = useClaimStatusesQuery();
  const data = !isError && Array.isArray(claims)
    ? [...claims].sort(
        (a: any, b: any) =>
          dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf(),
      )
    : [];
  const createHref = `/tickets/create?orderCode=${orderCode}`;

  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;

  const columns = [
    {
      title: t("complaint_tab.complaint_code"),
      dataIndex: "code",
      key: "code",
      render: (code: string) => (
        <Link to={`/tickets/${code}`}>
          <Text style={{ color: token.colorPrimary }}>#{code}</Text>
        </Link>
      ),
    },
    {
      title: t("complaint_tab.complaint_name"),
      key: "name",
      render: (_: any, record: any) => (
        <Link to={`/tickets/${record.code}`}>
          <Text style={{ color: token.colorPrimary }}>{claimName(record)}</Text>
        </Link>
      ),
    },
    {
      title: t("complaint_tab.time"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) => (
        <Text>{value ? dayjs(value).format("HH:mm DD/MM") : "---"}</Text>
      ),
    },
    {
      title: t("complaint_tab.status"),
      key: "state",
      render: (_: any, record: any) => {
        const status = getClaimStatus(record, statuses);
        const statusText = `${status.name || "---"}${
          record.archived ? ` (${t("complaint_tab.closed")})` : ""
        }`;

        return (
          <Space size={token.marginXXS}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: status.color || token.colorWarning,
                display: "inline-block",
              }}
            />
            <Text>{statusText}</Text>
          </Space>
        );
      },
    },
    {
      title: t("complaint_tab.refund"),
      dataIndex: "totalRefund",
      key: "totalRefund",
      render: (value: any) => (
        <Text strong style={{ color: token.colorSuccess }}>
          {moneyFormat(value || 0)}
        </Text>
      ),
    },
    {
      title: "",
      key: "action",
      align: "right" as const,
      render: (_: any, record: any) => (
        <Link to={`/tickets/${record.code}`}>
          <Button type="link">{t("complaint_tab.detail")}</Button>
        </Link>
      ),
    },
  ];

  if (data.length === 0) {
    return (
      <Card>
        <Empty
          image={<WarningOutlined style={{ color: token.colorTextTertiary, fontSize: 48 }} />}
          description={
            <Space direction="vertical" size={token.marginXS}>
              <Title level={5} style={{ margin: 0 }}>
                {t("complaint_tab.empty_claim_title")}
              </Title>
              <Text type="secondary">{t("complaint_tab.empty_claim_description")}</Text>
            </Space>
          }
        >
          <Link to={createHref}>
            <Button type="primary" icon={<PlusOutlined />}>
              {t("tickets.create")}
            </Button>
          </Link>
        </Empty>
      </Card>
    );
  }

  return (
    <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
      <Flex justify="space-between" align="center" gap={token.marginSM}>
        <Title level={5} style={{ margin: 0 }}>
          {t("ticket_add.list_claims")}{" "}
          <Text type="secondary">({quantityFormat(data.length)})</Text>
        </Title>
        <Link to={createHref}>
          <Button type="primary" ghost icon={<PlusOutlined />}>
            {t("complaint_tab.create_complaint")}
          </Button>
        </Link>
      </Flex>
      <Table
        rowKey="code"
        columns={columns}
        dataSource={data}
        pagination={{
          hideOnSinglePage: true,
          pageSize: 10,
        }}
      />
    </Space>
  );
};
