import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  List,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
  theme,
} from "antd";
import {
  ArrowRightOutlined,
  BankOutlined,
  ShoppingCartOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { formatCurrency } from "@repo/util";
import { useDashboardPage } from "./hooks/useDashboardPage";
import type { DashboardProduct } from "./hooks/useDashboardPage";

export const DashboardStyle3 = () => {
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

  return (
    <Spin spinning={isLoading}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card>
          <Flex align="center" justify="space-between" gap={token.marginMD} wrap>
            <Space size="large">
              <Avatar
                size={56}
                icon={<ShoppingCartOutlined />}
                style={{
                  background: token.colorPrimaryBg,
                  color: token.colorPrimary,
                }}
              />
              <div>
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {t("dashboard.titleHeader")}
                </Typography.Title>
                <Typography.Text type="secondary">
                  {t("dashboard.title")}
                </Typography.Text>
              </div>
            </Space>
            <Space wrap>
              <Link to="/orders">
                <Button icon={<ArrowRightOutlined />}>
                  {t("dashboard.viewDetails")}
                </Button>
              </Link>
              <Button type="primary">{t("header.deposit")}</Button>
            </Space>
          </Flex>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title={t("dashboard.balanceAfter")}
                value={formatCurrency(balance)}
                prefix={<WalletOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title={t("dashboard.orderInStock")}
                value={deliveryReadyCount}
                prefix={<BankOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title={t("dashboard.order")}
                value={visibleOrderStatuses.length}
                prefix={<ShoppingCartOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <Card title={t("dashboard.order")}>
              <List
                dataSource={visibleOrderStatuses}
                renderItem={(item: any) => {
                  const statistic = getOrderStatusStatistic(item.code);
                  return (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<ShoppingCartOutlined />} />}
                        title={<Typography.Text strong>{item.name}</Typography.Text>}
                        description={item.code}
                      />
                      <Space>
                        <Typography.Title level={4} style={{ margin: 0 }}>
                          {statistic?.total || 0}
                        </Typography.Title>
                        {statistic?.totalUnpaid ? (
                          <Tag color="red">
                            -{formatCurrency(Math.abs(statistic.totalUnpaid))}
                          </Tag>
                        ) : null}
                      </Space>
                    </List.Item>
                  );
                }}
              />
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card title={t("dashboard.suggest")}>
              <Spin spinning={isSuggestLoading}>
                {suggestProducts.length > 0 ? (
                  <List
                    dataSource={suggestProducts.slice(0, 8) as DashboardProduct[]}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar shape="square" size={56} src={item.image} />}
                          title={
                            <a
                              href={`https://detail.1688.com/offer/${item.itemId}.html`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {item.translateName}
                            </a>
                          }
                          description={formatCurrency(item.price || 0, "CNY")}
                        />
                      </List.Item>
                    )}
                  />
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

export default DashboardStyle3;
