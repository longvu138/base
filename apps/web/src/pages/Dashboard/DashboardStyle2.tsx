import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Image,
  Progress,
  Row,
  Space,
  Spin,
  Statistic,
  Typography,
  theme,
} from "antd";
import {
  ArrowRightOutlined,
  BankOutlined,
  ExportOutlined,
  ShoppingCartOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { formatCurrency } from "@repo/util";
import { useDashboardPage } from "./hooks/useDashboardPage";
import type { DashboardProduct } from "./hooks/useDashboardPage";

export const DashboardStyle2 = () => {
  const { token } = theme.useToken();
  const {
    t,
    balance,
    deliveryReadyCount,
    visibleOrderStatuses,
    suggestProducts,
    isLoading,
    isSuggestLoading,
    getOrderStatusStatistic,
  } = useDashboardPage();

  const maxTotal = Math.max(
    ...visibleOrderStatuses.map((item: any) => getOrderStatusStatistic(item.code)?.total || 0),
    1,
  );

  return (
    <Spin spinning={isLoading}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={8}>
            <Card>
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <Avatar
                  size={56}
                  icon={<WalletOutlined />}
                  style={{
                    background: token.colorPrimary,
                    color: token.colorWhite,
                  }}
                />
                <Statistic
                  title={t("dashboard.balanceAfter")}
                  value={formatCurrency(balance)}
                />
                <Button type="primary" block>
                  {t("header.deposit")}
                </Button>
              </Space>
            </Card>
          </Col>
          <Col xs={24} lg={16}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card>
                  <Statistic
                    title={t("dashboard.orderInStock")}
                    value={deliveryReadyCount}
                    prefix={<BankOutlined />}
                    suffix={t("dashboard.orderNeedDelivery")}
                  />
                  <Link to="/delivery/create">
                    <Button type="link" icon={<ArrowRightOutlined />}>
                      {t("dashboard.createDelivery")}
                    </Button>
                  </Link>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card>
                  <Statistic
                    title={t("dashboard.order")}
                    value={visibleOrderStatuses.reduce(
                      (sum: number, item: any) =>
                        sum + (getOrderStatusStatistic(item.code)?.total || 0),
                      0,
                    )}
                    prefix={<ShoppingCartOutlined />}
                  />
                  <Link to="/orders">
                    <Button type="link" icon={<ArrowRightOutlined />}>
                      {t("dashboard.viewDetails")}
                    </Button>
                  </Link>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={10}>
            <Card title={t("dashboard.order")}>
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                {visibleOrderStatuses.map((item: any) => {
                  const count = getOrderStatusStatistic(item.code)?.total || 0;
                  return (
                    <div key={item.code}>
                      <Flex justify="space-between" align="center">
                        <Typography.Text>{item.name}</Typography.Text>
                        <Typography.Text strong>{count}</Typography.Text>
                      </Flex>
                      <Progress
                        percent={Math.round((count / maxTotal) * 100)}
                        showInfo={false}
                      />
                    </div>
                  );
                })}
              </Space>
            </Card>
          </Col>
          <Col xs={24} lg={14}>
            <Card
              title={t("dashboard.suggest")}
              extra={
                <a href="https://www.1688.com/" target="_blank" rel="noreferrer">
                  <Button type="link" icon={<ExportOutlined />}>
                    {t("dashboard.loadMore")}
                  </Button>
                </a>
              }
            >
              <Spin spinning={isSuggestLoading}>
                {suggestProducts.length > 0 ? (
                  <Row gutter={[12, 12]}>
                    {suggestProducts.slice(0, 12).map((item: DashboardProduct) => (
                      <Col xs={12} sm={8} md={6} key={item.itemId}>
                        <a
                          href={`https://detail.1688.com/offer/${item.itemId}.html`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Image
                            preview={false}
                            src={item.image}
                            height={120}
                            width="100%"
                            style={{
                              objectFit: "cover",
                              borderRadius: token.borderRadiusLG,
                            }}
                          />
                        </a>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Empty description={t("common.no_data")} />
                )}
              </Spin>
            </Card>
          </Col>
        </Row>
      </Space>
    </Spin>
  );
};

export default DashboardStyle2;
