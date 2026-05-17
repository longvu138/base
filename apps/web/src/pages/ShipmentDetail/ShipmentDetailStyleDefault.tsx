import { Button, Skeleton } from "antd";
import { ArrowLeftOutlined, RocketOutlined } from "@ant-design/icons";
import { useTranslation } from "@repo/i18n";
import { ChatPanel } from "../../components/Common/ChatPanel";
import { ShipmentDetailContent } from "./ShipmentDetailContent";
import { useShipmentDetailPage } from "./hooks/useShipmentDetailPage";

export const ShipmentDetailStyleDefault = () => {
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
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={goToShipments}
        >
          {t("shipments.shipment_list")}
        </Button>
      </div>

      <div className="flex gap-4 pt-6 items-start">
        <ShipmentDetailContent shipment={shipment} statusData={statusData} />

        {/* Chat panel — sticky bên phải */}
        <div
          className="w-[320px] flex-shrink-0 sticky top-[73px]"
          style={{ height: "calc(100vh - 93px)" }}
        >
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
