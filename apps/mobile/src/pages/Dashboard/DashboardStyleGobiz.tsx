import {
  Avatar,
  Button,
  Card,
  Col,
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
import { moneyFormat } from "@repo/util";
import DepositModal from "../../components/DepositModal";
import { useDashboardPage } from "@repo/hooks";

export const DashboardStyleGobiz = () => {
  const { token } = theme.useToken();
  const {
    t,
    balance,
    deliveryReadyCount,
    visibleOrderStatuses,
    isLoading,
    isDepositModalOpen,
    setDepositModalOpen,
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
            <Flex gap={token.marginSM} wrap="wrap">
              <Button type="primary" onClick={() => setDepositModalOpen(true)}>
                {t("header.deposit")}
              </Button>
              <Link to="/orders">
                <Button icon={<ArrowRightOutlined />}>
                  {t("dashboard.viewDetails")}
                </Button>
              </Link>
            </Flex>
          </Flex>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title={t("dashboard.balanceAfter")}
                value={moneyFormat(balance)}
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

        <Card>
          <Flex align="center" justify="space-between" gap={token.marginSM} wrap>
            <Typography.Text strong>{t("dashboard.order")}</Typography.Text>
          </Flex>
          <List
            dataSource={visibleOrderStatuses}
            renderItem={(item: any) => {
              const statistic = getOrderStatusStatistic(item.code);
              return (
                <List.Item>
                  <Flex
                    align="center"
                    justify="space-between"
                    gap={token.marginSM}
                    wrap
                    style={{ width: "100%" }}
                  >
                    <Flex align="center" gap={token.marginSM} style={{ minWidth: 0, flex: 1 }}>
                      <Avatar icon={<ShoppingCartOutlined />} />
                      <div style={{ minWidth: 0 }}>
                        <Typography.Text strong ellipsis style={{ display: "block" }}>
                          {item.name}
                        </Typography.Text>
                        <Typography.Text type="secondary" ellipsis style={{ display: "block" }}>
                          {item.code}
                        </Typography.Text>
                      </div>
                    </Flex>
                    <Space wrap>
                    <Typography.Title level={4} style={{ margin: 0 }}>
                      {statistic?.total || 0}
                    </Typography.Title>
                    {statistic?.totalUnpaid ? (
                      <Tag color="red">
                        {moneyFormat(-Math.abs(statistic.totalUnpaid))}
                      </Tag>
                    ) : null}
                    </Space>
                  </Flex>
                </List.Item>
              );
            }}
          />
        </Card>
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

export default DashboardStyleGobiz;
