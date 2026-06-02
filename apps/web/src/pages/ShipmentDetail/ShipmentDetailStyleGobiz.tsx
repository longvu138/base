import {
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  Row,
  Skeleton,
  Space,
  Typography,
  theme,
} from "antd";
import { ArrowLeftOutlined, RocketOutlined } from "@ant-design/icons";
import { useTranslation } from "@repo/i18n";
import { useShipmentDetailPage } from "@repo/hooks";
import { ChatPanel } from "../../components/Common/ChatPanel";
import { ShipmentDetailContent } from "./ShipmentDetailContent";

const { Text, Title } = Typography;

/**
 * ShipmentDetailStyleGobiz — Giao diện cho Gobiz (gobiz)
 * Shell rộng, bo lớn, shadow nhẹ giống các page StyleGobiz.
 */
export const ShipmentDetailStyleGobiz = () => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const { code, shipment, statusData, isLoading, isError, goToShipments } =
    useShipmentDetailPage();

  if (isLoading) {
    return (
      <div
        style={{
          maxWidth: 1600,
          margin: "0 auto",
          padding: token.paddingLG,
        }}
      >
        <Skeleton active paragraph={{ rows: 12 }} />
      </div>
    );
  }

  if (isError || !shipment) {
    return (
      <Flex
        vertical
        align="center"
        justify="center"
        gap={token.marginMD}
        style={{ minHeight: 420, padding: token.paddingLG }}
      >
        <RocketOutlined
          style={{ color: token.colorTextQuaternary, fontSize: 48 }}
        />
        <Typography.Text style={{ fontSize: token.fontSizeLG }}>
          {t("shipments.not_found")}
        </Typography.Text>
        <Button onClick={goToShipments}>{t("shipments.back_to_list")}</Button>
      </Flex>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: token.colorBgLayout,
        padding: token.paddingLG,
      }}
    >
      <Space
        direction="vertical"
        size="large"
        style={{ width: "100%", maxWidth: 1600, margin: "0 auto" }}
      >
        <Card>
          <Flex align="center" justify="space-between" gap={16} wrap="wrap">
            <Flex align="center" gap={16}>
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={goToShipments}
                style={{ color: token.colorPrimary, paddingInline: 0 }}
              >
                {t("shipments.shipment_list")}
              </Button>
              <Avatar
                size={48}
                icon={<RocketOutlined />}
                style={{
                  background: token.colorPrimaryBg,
                  color: token.colorPrimary,
                }}
              />
              <Space direction="vertical" size={2}>
                <Title level={3} style={{ margin: 0 }}>
                  #{shipment.code}
                </Title>
                <Text type="secondary">{t("shipments.detail_subtitle")}</Text>
              </Space>
            </Flex>
          </Flex>
        </Card>

        <Row gutter={[token.marginLG, token.marginLG]} align="top">
          <Col xs={24} xl={18}>
            <ShipmentDetailContent
              shipment={shipment}
              statusData={statusData}
            />
          </Col>

          <Col xs={24} xl={6}>
            <Card
              styles={{
                body: {
                  padding: 0,
                  height: "calc(100vh - 150px)",
                  minHeight: 520,
                  overflow: "hidden",
                },
              }}
            >
              <ChatPanel
                entityType="shipments"
                entityCode={code}
                entityCreatedAt={shipment.createdAt}
                rounded="square"
              />
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};
