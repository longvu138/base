import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Image,
  Row,
  Space,
  Spin,
  Statistic,
  Tooltip,
  Typography,
  theme,
} from "antd";
import {
  ArrowRightOutlined,
  PlusOutlined,
  WalletOutlined,
  BankOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { formatCurrency } from "@repo/util";
import DepositModal from "../../components/DepositModal";
import { useDashboardPage } from "./hooks/useDashboardPage";
import type {
  DashboardProduct,
  DashboardStatusAmountConfig,
} from "./hooks/useDashboardPage";


const formatAmount = (
  statistic: any,
  amountConfig?: DashboardStatusAmountConfig,
) => {
  if (!statistic || !amountConfig) return null;
  const rawValue = statistic[amountConfig.field];
  if (rawValue === null || rawValue === undefined || rawValue === "") return null;

  const amount = Math.abs(Math.ceil(rawValue || 0));
  const prefix = amountConfig.negative && amount > 0 ? "-" : "";

  return {
    text: `${prefix}${formatCurrency(amount)}`,
    color: amountConfig.color,
    tooltip: amountConfig.tooltip,
  };
};

export const DashboardStyleDefault = () => {
  const { token } = theme.useToken();
  const {
    t,
    balance,
    deliveryReadyCount,
    visibleOrderStatuses,
    statusAmountConfig,
    isLoading,
    isDepositModalOpen,
    setDepositModalOpen,
    getOrderStatusStatistic,
  } = useDashboardPage();

  return (
    <Spin spinning={isLoading}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} xl={15} style={{ display: "flex" }}>
            <Card
              title={t("dashboard.title")}
              style={{ width: "100%", height: "100%" }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12} style={{ display: "flex" }}>
                  <Card style={{ width: "100%", height: "100%" }}>
                    <Flex align="center" gap={token.marginMD}>
                      <Avatar
                        size={48}
                        icon={<WalletOutlined />}
                        style={{
                          color: token.colorPrimary,
                          background: token.colorPrimaryBg,
                        }}
                      />
                      <div>
                        <Typography.Text type="secondary">
                          {t("dashboard.balanceAfter")}
                        </Typography.Text>
                        <Statistic
                          value={formatCurrency(balance)}
                          valueStyle={{
                            color:
                              balance >= 0
                                ? token.colorText
                                : token.colorError,
                            fontSize: token.fontSizeHeading3,
                            fontWeight: token.fontWeightStrong,
                          }}
                        />
                      </div>
                    </Flex>
                    <Button
                      type="link"
                      icon={<PlusOutlined />}
                      onClick={() => setDepositModalOpen(true)}
                      style={{ marginTop: token.marginSM, paddingInline: 0 }}
                    >
                      {t("header.deposit")}
                    </Button>
                  </Card>
                </Col>

                <Col xs={24} md={12} style={{ display: "flex" }}>
                  <Card style={{ width: "100%", height: "100%" }}>
                    <Flex align="center" gap={token.marginMD}>
                      <Avatar
                        size={48}
                        icon={<BankOutlined />}
                        style={{
                          color: token.colorPrimary,
                          background: token.colorPrimaryBg,
                        }}
                      />
                      <div>
                        <Typography.Text type="secondary">
                          {t("dashboard.orderInStock")}
                        </Typography.Text>
                        <Statistic
                          value={deliveryReadyCount}
                          suffix={
                            <Typography.Text type="secondary">
                              {t("dashboard.orderNeedDelivery")}
                            </Typography.Text>
                          }
                          valueStyle={{
                            fontSize: token.fontSizeHeading3,
                            fontWeight: token.fontWeightStrong,
                          }}
                        />
                      </div>
                    </Flex>
                    <Link to="/delivery/create">
                      <Button
                        type="link"
                        icon={<ArrowRightOutlined />}
                        style={{ marginTop: token.marginSM, paddingInline: 0 }}
                      >
                        {t("dashboard.createDelivery")}
                      </Button>
                    </Link>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} xl={9} style={{ display: "flex" }}>
            <Card
              title={t("dashboard.order")}
              extra={
                <Link to="/orders">
                  <Button type="link" icon={<ArrowRightOutlined />}>
                    {t("dashboard.viewDetails")}
                  </Button>
                </Link>
              }
              style={{ width: "100%", height: "100%" }}
            >
              <Row gutter={[16, 24]}>
                {visibleOrderStatuses.map((item: any) => {
                  const statistic = getOrderStatusStatistic(item.code);
                  const amount = formatAmount(
                    statistic,
                    statusAmountConfig[item.code],
                  );

                  return (
                    <Col xs={12} md={8} key={item.code}>
                      <Space direction="vertical" size={4}>
                        <Typography.Text type="secondary">
                          {item.name}
                        </Typography.Text>
                        <Space align="baseline" wrap>
                          <Typography.Title level={3} style={{ margin: 0 }}>
                            {statistic?.total || 0}
                          </Typography.Title>
                          {amount && (
                            <Tooltip title={amount.tooltip}>
                              <Typography.Text
                                type={amount.color === "error" ? "danger" : "success"}
                                strong
                              >
                                {amount.text}
                              </Typography.Text>
                            </Tooltip>
                          )}
                        </Space>
                      </Space>
                    </Col>
                  );
                })}
              </Row>
            </Card>
          </Col>
        </Row>

        {/* <Card
          title={t("dashboard.suggest")}
          extra={
            <a href={PRODUCT_SITE_URL} target="_blank" rel="noreferrer">
              <Button type="link" icon={<ExportOutlined />}>
                {t("dashboard.loadMore")}
              </Button>
            </a>
          }
        >
          <Spin spinning={isSuggestLoading}>
            {suggestProducts.length > 0 ? (
              <>
                <Row gutter={[16, 24]}>
                  {suggestProducts.map((item: DashboardProduct) => (
                    <Col xs={12} sm={8} md={6} lg={4} xxl={3} key={item.itemId}>
                      <a
                        href={`https://detail.1688.com/offer/${item.itemId}.html`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Card
                          hoverable
                          cover={
                            <Image
                              preview={false}
                              src={item.image}
                              alt={String(item.itemId || "")}
                              height={174}
                              style={{ objectFit: "cover" }}
                            />
                          }
                        >
                          <Space direction="vertical" size={4}>
                            <Typography.Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0 }}>
                              {item.translateName}
                            </Typography.Paragraph>
                            <Typography.Text type="danger" strong>
                              {formatCurrency(item.price || 0, "CNY")}
                            </Typography.Text>
                            <Typography.Text type="secondary">
                              {t("dashboard.totalSold", {
                                value: item.monthSold || 0,
                              })}
                            </Typography.Text>
                          </Space>
                        </Card>
                      </a>
                    </Col>
                  ))}
                </Row>
                <Flex justify="center" style={{ marginTop: token.marginLG }}>
                  <a href={PRODUCT_SITE_URL} target="_blank" rel="noreferrer">
                    <Button type="link" icon={<ExportOutlined />}>
                      {t("dashboard.loadMore")}
                    </Button>
                  </a>
                </Flex>
              </>
            ) : (
              <Empty description={t("common.no_data")} />
            )}
          </Spin>
        </Card> */}
      </Space>

      {isDepositModalOpen && (
        <DepositModal
          open={isDepositModalOpen}
          onClose={() => setDepositModalOpen(false)}
        />
      )}
    </Spin>
  );
};

export default DashboardStyleDefault;
