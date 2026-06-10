import {
  Avatar,
  Button,
  Col,
  Flex,
  List,
  Row,
  Space,
  Tooltip,
  Typography,
  theme,
} from "antd";
import { QuestionCircleOutlined, ShopOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useTranslation } from "@repo/i18n";
import { moneyCeil, moneyFormat } from "@repo/util";
import successImage from "../../../assets/dhtc.png";

const { Text, Title } = Typography;

export const FinishOrder = ({
  finishOrder,
}: {
  finishOrder: {
    hasOrders: boolean;
    orders: any[];
    projectName: string;
  };
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { hasOrders, orders, projectName } = finishOrder;

  if (!hasOrders) return null;

  const renderHeader = () => (
    <div
      style={{
        padding: `${token.paddingSM}px ${token.padding}px`,
        background: token.colorFillAlter,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <Row align="middle">
        <Col span={10}>
          <Text>{t("order.seller")}</Text>
        </Col>
        <Col span={14}>
          <Row>
            <Col span={10} style={{ textAlign: "right" }}>
              <Space size={4}>
                <Text>{t("order.products_link")}</Text>
                <Tooltip title={t("cartFinishOrder.product_quantity")}>
                  <QuestionCircleOutlined
                    style={{ color: token.colorTextTertiary }}
                  />
                </Tooltip>
              </Space>
            </Col>
            <Col span={8} style={{ textAlign: "right" }}>
              <Text>{t("cartFinishOrder.amount_total")}</Text>
            </Col>
            <Col span={6} />
          </Row>
        </Col>
      </Row>
    </div>
  );

  const renderItem = (item: any) => {
    return (
      <List.Item style={{ padding: `${token.padding}px` }}>
        <Row align="middle" style={{ width: "100%" }}>
          <Col span={10}>
            <Flex align="center" gap={token.marginSM} style={{ minWidth: 0 }}>
              <Avatar
                shape="square"
                size={22}
                src={item.marketplaceImage}
                icon={<ShopOutlined />}
              />
              {item.merchantUrl ? (
                <a href={item.merchantUrl} target="_blank" rel="noreferrer">
                  <Avatar shape="square" size={35} src={item.merchantImage} />
                </a>
              ) : (
                <Avatar shape="square" size={35} src={item.merchantImage} />
              )}
              <Space direction="vertical" size={0} style={{ minWidth: 0 }}>
                <Text>
                  {t("order.order_code")}:{" "}
                  <Link to={item.orderPath} target="_blank">
                    #{item.code || "---"}
                  </Link>
                </Text>
                {item.merchantUrl ? (
                  <a href={item.merchantUrl} target="_blank" rel="noreferrer">
                    <Text ellipsis style={{ maxWidth: 260 }}>
                      {item.merchantName}
                    </Text>
                  </a>
                ) : (
                  <Text ellipsis style={{ maxWidth: 260 }}>
                    {item.merchantName}
                  </Text>
                )}
              </Space>
            </Flex>
          </Col>
          <Col span={14}>
            <Row align="middle">
              <Col span={10} style={{ textAlign: "right" }}>
                <Text>
                  {item.quantity}/{item.productCount}
                </Text>
              </Col>
              <Col span={8} style={{ textAlign: "right" }}>
                <Text>{moneyFormat(moneyCeil(item.amount))}</Text>
              </Col>
              <Col span={6} style={{ textAlign: "right" }}>
                <Link to={item.orderPath} target="_blank">
                  {t("order.view_details")}
                </Link>
              </Col>
            </Row>
          </Col>
        </Row>
      </List.Item>
    );
  };

  return (
    <div className="cartscontainer mgbt30">
      <Row gutter={token.marginLG}>
        <Col xs={24} lg={7}>
          <div
            style={{
              padding: token.paddingLG,
              border: `1px solid ${token.colorBorderSecondary}`,
              textAlign: "center",
              background: token.colorBgContainer,
            }}
          >
            <div style={{ marginBottom: token.margin }}>
              <img
                src={successImage}
                alt=""
                style={{ maxWidth: 120, maxHeight: 70, objectFit: "contain" }}
              />
            </div>
            <Title
              level={3}
              style={{
                color: token.colorPrimary,
                fontWeight: 400,
                marginBottom: token.margin,
              }}
            >
              {t("order.order_success")}
            </Title>
            <Text type="secondary" style={{ display: "block" }}>
              {projectName} {t("cartFinishOrder.text_content")}{" "}
              {t("cartFinishOrder.updated_all_info")}
            </Text>
            <Link to="/orders">
              <Button type="primary" style={{ marginTop: token.marginLG }}>
                {t("order.order_management")}
              </Button>
            </Link>
          </div>
        </Col>
        <Col xs={24} lg={17}>
          <Title level={3} style={{ fontWeight: 400 }}>
            {t("order.order_deposit")}
          </Title>
          <List
            className="list-carts _order-finish-list"
            bordered
            header={renderHeader()}
            dataSource={orders}
            renderItem={renderItem}
            style={{ background: token.colorBgContainer }}
          />
        </Col>
      </Row>
    </div>
  );
};
