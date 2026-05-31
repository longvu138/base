import { useState } from "react";
import dayjs from "dayjs";
import {
  Empty,
  Flex,
  Popover,
  Space,
  Spin,
  Tag,
  Timeline,
  Typography,
} from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useOrderMilestonesModel } from "../../model/useOrderMilestonesModel";

export type OrderStatusPopoverProps = {
  code: string;
  status?: string;
  statusData?: any[];
  t: (key: string) => string;
};

export const OrderStatusPopover = ({
  code,
  status,
  statusData = [],
  t,
}: OrderStatusPopoverProps) => {
  const [open, setOpen] = useState(false);
  const {
    state: { milestones, isLoading },
  } = useOrderMilestonesModel(code, open);
  const currentStatus =
    statusData.find((item: any) => item.code === status) || {};

  return (
    <Popover
      trigger="click"
      placement="left"
      open={open}
      onOpenChange={setOpen}
      content={
        <Space direction="vertical" size={0} style={{ width: 200 }}>
          {isLoading ? (
            <Flex justify="center" align="center" style={{ minHeight: 140 }}>
              <Spin />
            </Flex>
          ) : Array.isArray(milestones) && milestones.length > 0 ? (
            <div
              style={{
                overflowY: "auto",
                paddingInlineEnd: 8,
                paddingTop: 4,
              }}
            >
              <Timeline
                items={milestones.map((item: any, index: number) => {
                  const milestoneStatus = statusData.find(
                    (statusItem: any) => statusItem.code === item.status,
                  );
                  const handlingTime =
                    item.handlingTime === null ||
                    item.handlingTime === undefined
                      ? t("shipments.undefined_handling_time") ||
                        "Chưa xác định"
                      : `${item.handlingTime} ${Number(item.handlingTime) > 1 ? t("shipments.days") || "ngày" : t("shipments.day") || "ngày"}`;
                  return {
                    color: index === 0 ? "green" : "gray",
                    style:
                      index === milestones.length - 1
                        ? { paddingBottom: 0 }
                        : undefined,
                    children: (
                      <Space direction="vertical" size={2}>
                        <Typography.Text strong>
                          {milestoneStatus?.name || item.status || "---"}
                        </Typography.Text>
                        <Typography.Text type="secondary">
                          {item.timestamp
                            ? dayjs(item.timestamp).format("HH:mm DD/MM/YYYY")
                            : "---"}
                        </Typography.Text>
                        <Typography.Text type="secondary">
                          ({handlingTime})
                        </Typography.Text>
                      </Space>
                    ),
                  };
                })}
              />
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("common.no_data")}
              style={{ margin: 0 }}
            />
          )}
        </Space>
      }
    >
      <Tag
        color={currentStatus?.color || "default"}
        style={{ cursor: "pointer" }}
        icon={<InfoCircleOutlined />}
      >
        {currentStatus?.name || status}
      </Tag>
    </Popover>
  );
};
