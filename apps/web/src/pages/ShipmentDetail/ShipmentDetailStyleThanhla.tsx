import { Button, Card, Flex, Skeleton, Tag, Typography, theme } from "antd";
import { ArrowLeftOutlined, RocketOutlined } from "@ant-design/icons";
import { useTranslation } from "@repo/i18n";
import { useShipmentDetailPage } from "@repo/hooks";
import { ChatPanel } from "../../components/Common/ChatPanel";
import { ShipmentDetailContent } from "./ShipmentDetailContent";

const { Text, Title } = Typography;

/**
 * ShipmentDetailStyleThanhla — Giao diện cho Thanhla (thanhla)
 * Phong cách Modern Card.
 */
export const ShipmentDetailStyleThanhla = () => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const { code, shipment, statusData, isLoading, isError, goToShipments } =
    useShipmentDetailPage();
  const statusInfo = statusData?.find(
    (status: any) => status.code === shipment?.status,
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] p-6">
        <Skeleton active paragraph={{ rows: 12 }} />
      </div>
    );
  }

  if (isError || !shipment) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px] text-gray-400">
        <RocketOutlined className="text-5xl mb-4" />
        <p className="text-lg">{t("shipments.not_found")}</p>
        <Button onClick={goToShipments} className="mt-4">
          {t("shipments.back_to_list")}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-[#141414]">
      <div className="mx-auto max-w-[1600px] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#141414]">
        <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50/50 p-4 transition-colors duration-200 dark:border-gray-700 dark:bg-filter-dark">
          <Flex align="center" justify="space-between" gap={16} wrap="wrap">
            <Flex align="center" gap={14}>
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={goToShipments}
                style={{ color: token.colorPrimary, paddingInline: 0 }}
              >
                {t("shipments.shipment_list")}
              </Button>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <RocketOutlined className="text-xl" />
              </div>
              <div>
                <Title level={4} className="!mb-0">
                  {t("shipments.detail_title", { code: shipment.code })}
                </Title>
                <Text type="secondary">
                  Theo dõi thông tin, vận đơn, tài chính và lịch sử xử lý
                </Text>
              </div>
            </Flex>
            <Tag
              color={statusInfo?.color || "default"}
              className="m-0 px-3 py-1"
            >
              {statusInfo?.name || shipment.status}
            </Tag>
          </Flex>
        </div>

        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <ShipmentDetailContent shipment={shipment} statusData={statusData} />

          <Card
            className="sticky top-6 overflow-hidden rounded-2xl"
            styles={{ body: { padding: 0, height: "calc(100vh - 150px)" } }}
          >
            <ChatPanel
              entityType="shipments"
              entityCode={code}
              entityCreatedAt={shipment.createdAt}
              rounded="square"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};
