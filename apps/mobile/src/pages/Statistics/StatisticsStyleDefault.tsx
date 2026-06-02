import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CreditCardOutlined,
  ShoppingCartOutlined,
  TruckOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import {
  type StatisticSummary,
  type StatisticType,
  useStatisticDetailPage,
  useStatisticsPage,
  type StatisticsTabType,
} from "@repo/hooks";
import { moneyFormat, quantityFormat } from "@repo/util";
import {
  Alert,
  Card,
  Col,
  Empty,
  Flex,
  Row,
  Space,
  Spin,
  Statistic,
  Tabs,
  Tooltip,
  Typography,
  theme,
} from "antd";
import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";

const { Text, Title } = Typography;

const tabIconByType: Record<StatisticsTabType, ReactNode> = {
  order: <ShoppingCartOutlined />,
  shipment: <TruckOutlined />,
  request_payment: <CreditCardOutlined />,
};

const StatisticCompare = ({
  now,
  before,
  unit,
  previousDate,
}: {
  now?: number;
  before?: number;
  unit: "orders" | "currency";
  previousDate: string;
}) => {
  const { t } = useTranslation();
  const currentValue = Number(now || 0);
  const previousValue = Number(before || 0);

  if (!previousValue) return null;

  const increased = currentValue - previousValue >= 0;
  const percent = Math.round(
    (Math.abs(currentValue - previousValue) / previousValue) * 100,
  );
  const displayBefore =
    unit === "currency"
      ? moneyFormat(previousValue)
      : `${quantityFormat(previousValue)} ${t("statistic.orders")}`;

  return (
    <Tooltip title={`${previousDate}: ${displayBefore}`} placement="right">
      <Space size={6}>
        {increased ? (
          <ArrowUpOutlined style={{ color: "#389e0d" }} />
        ) : (
          <ArrowDownOutlined style={{ color: "#cf1322" }} />
        )}
        <Text type={increased ? "success" : "danger"}>
          {t(
            increased
              ? "statistic.increaseCompare"
              : "statistic.decreaseCompare",
            {
              value: percent,
              date: previousDate,
            },
          )}
        </Text>
      </Space>
    </Tooltip>
  );
};

const SummaryCard = ({
  title,
  value,
  suffix,
  icon,
  compare,
}: {
  title: ReactNode;
  value: ReactNode;
  suffix?: ReactNode;
  icon: ReactNode;
  compare?: ReactNode;
}) => {
  const { token } = theme.useToken();

  return (
    <Card style={{ height: "100%" }}>
      <Flex justify="space-between" align="start" gap={token.margin}>
        <Statistic
          title={title}
          value={String(value)}
          suffix={suffix}
          valueStyle={{
            fontSize: token.fontSizeHeading3,
            fontWeight: token.fontWeightStrong,
          }}
        />
        <Text style={{ fontSize: token.fontSizeXL }}>{icon}</Text>
      </Flex>
      <div style={{ marginTop: token.margin }}>{compare}</div>
    </Card>
  );
};

const StatisticsSection = ({
  title,
  data,
  previousData,
  loading,
  previousDate,
}: {
  title: ReactNode;
  data?: StatisticSummary;
  previousData?: StatisticSummary;
  loading?: boolean;
  previousDate: string;
}) => {
  const { t } = useTranslation();

  return (
    <Flex vertical gap="middle">
      <Title level={5}>{title}</Title>
      <Spin spinning={!!loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={8}>
            <SummaryCard
              title={t("statistic.totalOrder")}
              value={quantityFormat(data?.orderCount || 0)}
              suffix={t("statistic.orders")}
              icon={<ShoppingCartOutlined />}
              compare={
                <StatisticCompare
                  now={data?.orderCount}
                  before={previousData?.orderCount}
                  unit="orders"
                  previousDate={previousDate}
                />
              }
            />
          </Col>
          <Col xs={24} md={12} lg={8}>
            <SummaryCard
              title={t("statistic.totalMoney")}
              value={moneyFormat(data?.expenditure || 0)}
              icon={<WalletOutlined />}
              compare={
                <StatisticCompare
                  now={data?.expenditure}
                  before={previousData?.expenditure}
                  unit="currency"
                  previousDate={previousDate}
                />
              }
            />
          </Col>
        </Row>
      </Spin>
    </Flex>
  );
};

const StatisticDetail = ({
  type,
  tenantCode,
}: {
  type: StatisticType;
  tenantCode?: string;
}) => {
  const detail = useStatisticDetailPage(type, tenantCode);

  return (
    <Flex vertical gap={24}>
      <StatisticsSection {...detail.month} />
      <StatisticsSection {...detail.year} />
    </Flex>
  );
};

export const StatisticsStyleDefault = () => {
  const { t, tabs, tenantCode } = useStatisticsPage();
  const { token } = theme.useToken();

  const items = tabs.map((tab) => ({
    key: tab.key,
    label: (
      <Space>
        {tabIconByType[tab.key]}
        {t(tab.labelKey)}
      </Space>
    ),
    children: <StatisticDetail type={tab.key} tenantCode={tenantCode} />,
  }));

  return (
    <Flex vertical gap={token.marginLG}>
      <Title level={3}>{t("header.statistics")}</Title>
      <Card>
        {items.length ? (
          <Tabs items={items} />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Alert
                type="info"
                message={t("statistic.no_enabled_tabs")}
                showIcon
              />
            }
          />
        )}
      </Card>
    </Flex>
  );
};

export default StatisticsStyleDefault;
