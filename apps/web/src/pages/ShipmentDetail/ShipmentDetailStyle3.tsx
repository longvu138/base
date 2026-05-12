import { Button, Card, Flex, Skeleton, Space, Tag, Typography } from "antd";
import { ArrowLeftOutlined, RocketOutlined } from "@ant-design/icons";
import { ChatPanel } from "../../components/Common/ChatPanel";
import { ShipmentDetailContent } from "./ShipmentDetailContent";
import { useShipmentDetailPage } from "./hooks/useShipmentDetailPage";

const { Text, Title } = Typography;

/**
 * ShipmentDetailStyle3 — Giao diện cho Gobiz (gd3)
 * Shell rộng, bo lớn, shadow nhẹ giống các page Style3.
 */
export const ShipmentDetailStyle3 = () => {
  const { code, shipment, statusData, isLoading, isError, goToShipments } =
    useShipmentDetailPage();
  const statusInfo = statusData?.find(
    (status: any) => status.code === shipment?.status,
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1600px] p-6">
        <Skeleton active paragraph={{ rows: 12 }} />
      </div>
    );
  }

  if (isError || !shipment) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center p-6 text-gray-400">
        <RocketOutlined className="mb-4 text-5xl" />
        <p className="text-lg">Không tìm thấy yêu cầu ký gửi</p>
        <Button onClick={goToShipments} className="mt-4">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-950">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <Flex align="center" justify="space-between" gap={16} wrap="wrap">
            <Flex align="center" gap={16}>
              <Button
                shape="circle"
                icon={<ArrowLeftOutlined />}
                onClick={goToShipments}
              />
              <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <RocketOutlined className="text-xl" />
              </div>
              <Space direction="vertical" size={2}>
                <Title level={3} className="!mb-0 tracking-tight">
                  #{shipment.code}
                </Title>
                <Text type="secondary">
                  Chi tiết ký gửi, vận đơn, tài chính và trao đổi với CSKH
                </Text>
              </Space>
            </Flex>

            <Space size={12} wrap>
              <Tag
                color={statusInfo?.color || "default"}
                className="m-0 rounded-xl border-0 px-3 py-1 text-[11px] font-bold uppercase shadow-sm"
              >
                {statusInfo?.name || shipment.status}
              </Tag>
              <Button onClick={goToShipments}>Danh sách ký gửi</Button>
            </Space>
          </Flex>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <ShipmentDetailContent
              shipment={shipment}
              statusData={statusData}
            />
          </div>

          <Card
            className="sticky top-6 overflow-hidden rounded-3xl border-0 shadow-lg"
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
