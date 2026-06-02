import { Button, Skeleton, theme } from "antd";
import { ArrowLeftOutlined, RocketOutlined } from "@ant-design/icons";
import { useTranslation } from "@repo/i18n";
import { useShipmentDetailPage } from "@repo/hooks";
import { ShipmentDetailContent } from "./ShipmentDetailContent";
import { ChatPanel } from "./ChatPanel";

export const ShipmentDetailStyleDefault = () => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const { code, shipment, statusData, isLoading, isError, goToShipments } =
    useShipmentDetailPage();

  if (isLoading) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={goToShipments}
          style={{ color: token.colorPrimary, paddingInline: 0 }}
        >
          {t("shipments.shipment_list")}
        </Button>
      </div>

      <div className="pt-6">
        <div style={{ width: "100%", maxWidth: 880 }}>
          <ShipmentDetailContent shipment={shipment} statusData={statusData} />
        </div>

        <div className="mt-4" style={{ height: 560, width: "100%", maxWidth: 880 }}>
          <ChatPanel
            entityType="shipments"
            entityCode={code}
            entityCreatedAt={shipment.createdAt}
            rounded="square"
          />
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetailStyleDefault;
