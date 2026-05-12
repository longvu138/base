import { useMemo, useState } from "react";
import type { Key } from "react";
import {
  Empty,
  Popover,
  Skeleton,
  Space,
  Spin,
  Steps,
  Table,
  Tag,
  Timeline,
  Tooltip,
  Typography,
  theme,
} from "antd";
import {
  DownOutlined,
  Loading3QuartersOutlined,
  RightOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useTheme } from "@repo/theme-provider";
import {
  useOrderPackagesQuery,
  usePackageIOHistoriesQuery,
  usePackageMilestonesQuery,
  usePackageStatusesQuery,
} from "@repo/hooks";
import { useTranslation } from "react-i18next";

interface PackageTabProps {
  orderCode: string;
}

const { Text, Link } = Typography;

const isFiniteValue = (value: any) =>
  value !== null &&
  value !== undefined &&
  value !== "" &&
  Number.isFinite(Number(value));

const withUnit = (value: any, unit: string) =>
  isFiniteValue(value) ? `${value} ${unit}` : "---";

const statusColor = (status: any) => status?.color || "#898989";

const PackageIOHistory = ({
  packageCode,
  active,
}: {
  packageCode: string;
  active: boolean;
}) => {
  const { t } = useTranslation();
  const { data = [], isLoading } = usePackageIOHistoriesQuery(
    packageCode,
    active,
  );

  if (isLoading) {
    return (
      <div style={{ padding: "16px 24px", textAlign: "center" }}>
        <Spin indicator={<Loading3QuartersOutlined spin />} />
      </div>
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  return (
    <Timeline
      items={data.map((item: any, index: number) => ({
        color: index === 0 ? "green" : "gray",
        children: (
          <Text>
            {dayjs(item.createdAt).format("HH:mm DD/MM")} -{" "}
            {t(
              `package.${
                item.statusWarehouse === "IN" ? "inWarehouse" : "outWarehouse"
              }`,
              { value: item?.warehouse?.mask || "---" },
            )}
          </Text>
        ),
      }))}
    />
  );
};

const StatusTag = ({
  record,
  status,
  showPackageIoHistory,
}: {
  record: any;
  status: any;
  showPackageIoHistory: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const tag = (
    <Tag
      style={{
        backgroundColor: statusColor(status),
        borderColor: statusColor(status),
        color: "white",
        cursor: showPackageIoHistory ? "pointer" : "default",
      }}
    >
      {status?.name || record.status || "---"}
    </Tag>
  );

  if (!showPackageIoHistory) return tag;

  return (
    <Popover
      trigger="click"
      placement="left"
      open={open}
      onOpenChange={setOpen}
      content={<PackageIOHistory packageCode={record.code} active={open} />}
    >
      {tag}
    </Popover>
  );
};

const MilestoneDescription = ({ milestones }: { milestones: any[] }) => {
  const { t } = useTranslation();

  if (!milestones.length) return <Text type="secondary">{t("orderDetail.undefined")}</Text>;

  return (
    <Space direction="vertical" size={0} align="center">
      {milestones.map((item: any, index: number) => {
        const handlingTime = item.handlingTime;
        const dayLabel = Number(handlingTime) === 0 ? t("label.day") : t("label.days");

        return (
          <div key={`${item.status}-${item.timestamp}-${index}`} style={{ textAlign: "center" }}>
            <Text strong={index === 0}>{dayjs(item.timestamp).format("HH:mm DD/MM")}</Text>
            <br />
            <Text strong={index === 0} type="secondary">
              {handlingTime === null || handlingTime === undefined
                ? `( ${t("orderDetail.undefined")} )`
                : `( ${handlingTime} ${dayLabel} )`}
            </Text>
          </div>
        );
      })}
    </Space>
  );
};

const PackageTimeline = ({
  record,
  statuses,
}: {
  record: any;
  statuses: any[];
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { data: milestones = [], isLoading } = usePackageMilestonesQuery(
    record.code,
  );

  const currentStatus = statuses.find((item: any) => item.code === record.status) || {};
  const currentIndex = statuses.findIndex((item: any) => item.code === record.status);
  const normalStatuses = statuses.filter((item: any) => !item.negativeEnd);

  const timelineStatuses = useMemo(() => {
    if (!currentStatus.negativeEnd) return normalStatuses;

    const previousMilestones = [...milestones]
      .filter((item: any) => item.status !== currentStatus.code)
      .sort(
        (a: any, b: any) =>
          dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf(),
      );
    const lastMilestone = previousMilestones[0];
    const lastIndex = lastMilestone
      ? statuses.findIndex((item: any) => item.code === lastMilestone.status)
      : 0;

    return [
      ...statuses.slice(0, Math.max(lastIndex + 1, 1)).filter((item: any) => !item.negativeEnd),
      currentStatus,
    ];
  }, [currentStatus, milestones, normalStatuses, statuses]);

  if (isLoading) {
    return (
      <div style={{ padding: token.padding }}>
        <Skeleton active paragraph={{ rows: 1 }} />
      </div>
    );
  }

  if (!Array.isArray(statuses) || statuses.length === 0) {
    return <Empty description={t("package_tab.empty_milestone")} />;
  }

  const activeIndex = currentStatus.negativeEnd
    ? timelineStatuses.length - 1
    : Math.max(currentIndex, 0);

  return (
    <div style={{ padding: `${token.paddingLG}px ${token.padding}px` }}>
      <Steps
        size="small"
        progressDot
        direction="horizontal"
        current={activeIndex}
        status={currentStatus.negativeEnd ? "error" : "process"}
        items={timelineStatuses.map((status: any) => {
          const statusMilestones = [...milestones]
            .filter((item: any) => item.status === status.code)
            .sort(
              (a: any, b: any) =>
                dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf(),
            );

          return {
            key: status.id || status.code,
            title: status.name,
            description: <MilestoneDescription milestones={statusMilestones} />,
          };
        })}
      />
    </div>
  );
};

export const PackageTab = ({ orderCode }: PackageTabProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { tenantConfig } = useTheme();
  const { data: packages = [], isLoading } = useOrderPackagesQuery(orderCode);
  const { data: statuses = [] } = usePackageStatusesQuery();
  const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>([]);

  const generalConfig = tenantConfig?.tenantConfig?.generalConfig || {};
  const showPackageIoHistory = Boolean(generalConfig.showPackageIoHistory);
  const showPackageNote = Boolean(generalConfig.showPackageNote);

  const columns = [
    {
      title: "#",
      key: "index",
      width: 64,
      render: (_: any, record: any, index: number) => (
        <Space direction="vertical" size={2}>
          <Text>{index + 1}</Text>
          {showPackageNote && record?.note ? (
            <Tooltip title={record.note} color={token.colorPrimary}>
              <Link>{t("delivery.note")}</Link>
            </Tooltip>
          ) : null}
        </Space>
      ),
    },
    {
      title: t("package_tab.package_code"),
      dataIndex: "code",
      key: "code",
      render: (value: string) => <Text strong>{value || "---"}</Text>,
    },
    {
      title: t("package_tab.waybills"),
      dataIndex: "trackingNumber",
      key: "trackingNumber",
      render: (value: string) => <Text strong>{value || "---"}</Text>,
    },
    {
      title: t("package_tab.weight"),
      dataIndex: "actualWeight",
      key: "actualWeight",
      render: (value: any) => <Text>{withUnit(value, "kg")}</Text>,
    },
    {
      title: t("package.information"),
      key: "information",
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <Text>
            {t("package.length")}: {withUnit(record.length, "cm")}
          </Text>
          <Text>
            {t("package.width")}: {withUnit(record.width, "cm")}
          </Text>
          <Text>
            {t("package.height")}: {withUnit(record.height, "cm")}
          </Text>
        </Space>
      ),
    },
    {
      title: t("package_tab.status"),
      dataIndex: "status",
      key: "status",
      render: (value: string, record: any) => {
        const status = statuses.find((item: any) => item.code === value);
        return (
          <StatusTag
            record={record}
            status={status}
            showPackageIoHistory={showPackageIoHistory}
          />
        );
      },
    },
    {
      title: t("package_tab.update"),
      dataIndex: "lastStatusTime",
      key: "lastStatusTime",
      render: (value: string) => (
        <Text>{value ? dayjs(value).format("HH:mm DD/MM") : "---"}</Text>
      ),
    },
  ];

  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;

  return (
    <div style={{ padding: token.paddingXS }}>
      <Table
        rowKey="code"
        columns={columns}
        dataSource={packages}
        pagination={{ hideOnSinglePage: true, pageSize: 100 }}
        scroll={{ x: 760 }}
        expandable={{
          expandedRowKeys,
          expandedRowRender: (record) => (
            <PackageTimeline record={record} statuses={statuses} />
          ),
          expandIcon: ({ expanded, onExpand, record }) =>
            expanded ? (
              <DownOutlined onClick={(event) => onExpand(record, event)} />
            ) : (
              <RightOutlined onClick={(event) => onExpand(record, event)} />
            ),
          onExpand: (expanded, record) => {
            setExpandedRowKeys(expanded ? [record.code] : []);
          },
        }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("message.empty")}
            />
          ),
        }}
      />
    </div>
  );
};
