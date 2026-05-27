import {
  Avatar,
  Button,
  Card,
  Col,
  Flex,
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
  ShoppingCartOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { moneyFormat } from "@repo/util";
import DepositModal from "../../components/DepositModal";
import { useDashboardPage } from "@repo/hooks";

export const DashboardStyleThanhla = () => {
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
                  value={moneyFormat(balance)}
                />
                <Button type="primary" block onClick={() => setDepositModalOpen(true)}>
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
        </Row>
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

export default DashboardStyleThanhla;
