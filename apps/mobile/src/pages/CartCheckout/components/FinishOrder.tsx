import {
  Avatar,
  Button,
  Card,
  Divider,
  Flex,
  List,
  Space,
  Typography,
  theme,
} from "antd";
import { ShopOutlined } from "@ant-design/icons";
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

  return (
    <Space direction="vertical" size={token.marginMD} style={{ width: "100%" }}>
      <Card styles={{ body: { padding: token.paddingLG, textAlign: "center" } }}>
        <img
          src={successImage}
          alt=""
          style={{ maxWidth: 120, maxHeight: 70, objectFit: "contain" }}
        />
        <Title
          level={4}
          style={{
            color: token.colorPrimary,
            fontWeight: 400,
            marginTop: token.margin,
            marginBottom: token.marginSM,
          }}
        >
          {t("order.order_success")}
        </Title>
        <Text type="secondary" style={{ display: "block" }}>
          {projectName} {t("cartFinishOrder.text_content")}{" "}
          {t("cartFinishOrder.updated_all_info")}
        </Text>
        <Link to="/orders">
          <Button type="primary" block style={{ marginTop: token.marginLG }}>
            {t("order.order_management")}
          </Button>
        </Link>
      </Card>

      <Title level={4} style={{ margin: 0, fontWeight: 400 }}>
        {t("order.order_deposit")}
      </Title>

      <List
        split={false}
        dataSource={orders}
        renderItem={(item: any) => {
          return (
            <List.Item style={{ padding: 0, marginBottom: token.marginSM }}>
              <Card size="small" style={{ width: "100%" }}>
                <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
                  <Flex align="center" gap={token.marginSM}>
                    <Avatar
                      shape="square"
                      size={40}
                      src={item.merchantImage}
                      icon={<ShopOutlined />}
                    />
                    <Space direction="vertical" size={0} style={{ flex: 1, minWidth: 0 }}>
                      <Text>
                        {t("order.order_code")}:{" "}
                        <Link to={item.orderPath}>#{item.code || "---"}</Link>
                      </Text>
                      {item.merchantUrl ? (
                        <a href={item.merchantUrl} target="_blank" rel="noreferrer">
                          <Text ellipsis>{item.merchantName}</Text>
                        </a>
                      ) : (
                        <Text ellipsis>{item.merchantName}</Text>
                      )}
                    </Space>
                  </Flex>

                  <Divider style={{ marginBlock: 0 }} />

                  <Flex justify="space-between" gap={token.marginSM}>
                    <Space direction="vertical" size={0}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {t("order.products_link")}
                      </Text>
                      <Text>
                        {item.quantity}/{item.productCount}
                      </Text>
                    </Space>
                    <Space direction="vertical" size={0} style={{ textAlign: "right" }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {t("cartFinishOrder.amount_total")}
                      </Text>
                      <Text strong>{moneyFormat(moneyCeil(item.amount))}</Text>
                    </Space>
                  </Flex>

                  <Link to={item.orderPath}>
                    <Button block>{t("order.view_details")}</Button>
                  </Link>
                </Space>
              </Card>
            </List.Item>
          );
        }}
      />
    </Space>
  );
};
