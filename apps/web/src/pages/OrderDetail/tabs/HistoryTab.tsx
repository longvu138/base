import { ClockCircleOutlined, Loading3QuartersOutlined } from "@ant-design/icons";
import { Empty, Space, Spin, Timeline, Typography } from "antd";
import dayjs from "dayjs";
import { useOrderMilestonesQuery, useOrderStatusesQuery } from "@repo/hooks";
import { useTranslation } from "react-i18next";

interface HistoryTabProps {
  orderCode: string;
}

const { Text } = Typography;

export const HistoryTab = ({ orderCode }: HistoryTabProps) => {
  const { t } = useTranslation();
  const { data: milestones = [], isLoading } = useOrderMilestonesQuery(orderCode);
  const { data: statuses = [] } = useOrderStatusesQuery();

  if (isLoading) {
    return (
      <div style={{ padding: "24px 0", textAlign: "center" }}>
        <Spin indicator={<Loading3QuartersOutlined spin style={{ fontSize: 24 }} />} />
      </div>
    );
  }

  if (!Array.isArray(milestones) || milestones.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={t("history_tab.empty_history")}
      />
    );
  }

  const getStatusName = (code: string) => {
    const status = statuses.find((item: any) => item.code === code);
    return status?.name || code || "---";
  };

  const items = milestones.map((item: any, index: number) => {
    const dayLabel = Number(item.handlingTime) > 1 ? t("label.days") : t("label.day");

    return {
      key: item.id || `${item.status}-${item.timestamp}-${index}`,
      color: index === 0 ? "red" : "green",
      dot:
        index === 0 ? (
          <ClockCircleOutlined style={{ fontSize: 24 }} />
        ) : undefined,
      children: (
        <Space size={4} wrap>
          <Text type="secondary">{getStatusName(item.status)}:</Text>
          <Text strong>{dayjs(item.timestamp).format("HH:mm DD/MM")}</Text>
          <Text strong>
            {item.handlingTime === null || item.handlingTime === undefined
              ? `(${t("orderDetail.undefined")})`
              : `(${item.handlingTime} ${dayLabel})`}
          </Text>
        </Space>
      ),
    };
  });

  return <Timeline mode="alternate" items={items} />;
};
