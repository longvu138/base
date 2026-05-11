import { Button, Card, Flex, Skeleton, Tag, Typography } from "antd";
import { ArrowLeftOutlined, RocketOutlined } from "@ant-design/icons";
import { ChatPanel } from "../../components/Common/ChatPanel";
import { ShipmentDetailContent } from "./ShipmentDetailContent";
import { useShipmentDetailPage } from "./hooks/useShipmentDetailPage";

const { Text, Title } = Typography;

/**
 * ShipmentDetailStyle2 — Giao diện cho Thanhla (gd2)
 * Phong cách Modern Card.
 */
export const ShipmentDetailStyle2 = () => {
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
        <p className="text-lg">Không tìm thấy yêu cầu ký gửi</p>
        <Button onClick={goToShipments} className="mt-4">
          Quay lại danh sách
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
              <Button icon={<ArrowLeftOutlined />} onClick={goToShipments}>
                Danh sách ký gửi
              </Button>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <RocketOutlined className="text-xl" />
              </div>
              <div>
                <Title level={4} className="!mb-0">
                  Chi tiết ký gửi #{shipment.code}
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
              rounded="square"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};
