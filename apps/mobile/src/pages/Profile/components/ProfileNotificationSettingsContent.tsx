import {
  Card,
  Checkbox,
  Collapse,
  Empty,
  Flex,
  Row,
  Col,
  Skeleton,
  Space,
  Switch,
  Table,
  Typography,
  theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { SettingOutlined } from "@ant-design/icons";
import {
  parseAdditionalCondition,
  useProfileNotificationSettingsPage,
} from "@repo/hooks";

type ProfileNotificationSettingsContentProps = {
  t: (key: string) => string;
};

export const ProfileNotificationSettingsContent = ({
  t,
}: ProfileNotificationSettingsContentProps) => {
  const { token } = theme.useToken();
  const logic = useProfileNotificationSettingsPage(t);

  if (logic.isLoading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  const renderStatusSettings = (record: any) => {
    const statuses =
      record.eventCode === "ORDER_STATUS_UPDATE"
        ? logic.orderStatuses
        : logic.shipmentStatuses;
    const selectedStatuses = parseAdditionalCondition(
      logic.getEventSetting(record.eventCode)?.additionalCondition,
    );

    if (
      !["ORDER_STATUS_UPDATE", "SHIPMENT_STATUS_UPDATE"].includes(
        record.eventCode,
      ) ||
      !statuses.length
    ) {
      return null;
    }

    return (
      <Collapse
        ghost
        size="small"
        items={[
          {
            key: record.eventCode,
            label: `(${t("notificationSettings.listStatusNoti")})`,
            children: (
              <Row gutter={[token.marginLG, token.marginSM]}>
                {statuses.map((status: any) => (
                  <Col xs={24} md={12} xl={8} key={status.code}>
                    <Space>
                      <Switch
                        size="small"
                        checked={selectedStatuses.includes(status.code)}
                        loading={logic.isSubmitting}
                        onChange={(checked) =>
                          logic.changeStatusCondition(
                            record,
                            status.code,
                            checked,
                          )
                        }
                      />
                      <Typography.Text>{status.name}</Typography.Text>
                    </Space>
                  </Col>
                ))}
              </Row>
            ),
          },
        ]}
      />
    );
  };

  const renderGroup = (group: any) => {
    const groupEvents = logic.getEventsByGroup(group.code);
    if (!groupEvents.length) return null;

    const columns: ColumnsType<any> = [
      {
        title: "",
        dataIndex: "name",
        render: (value: string) => (
          <Typography.Text style={{ wordBreak: "break-word" }}>
            {value}
          </Typography.Text>
        ),
      },
      ...logic.channels.map((channel: any) => {
        const enabledEvents = groupEvents.filter((event: any) =>
          event.channelsSetting.includes(channel.channel),
        );
        const checkedCount = enabledEvents.filter((event: any) =>
          logic.isEventChecked(event.eventCode, channel.channel),
        ).length;
        const checkAll =
          enabledEvents.length > 0 && checkedCount === enabledEvents.length;
        const indeterminate =
          checkedCount > 0 && checkedCount < enabledEvents.length;

        return {
          title: (
            <Space>
              <Checkbox
                disabled={!enabledEvents.length || logic.isSubmitting}
                checked={checkAll}
                indeterminate={indeterminate}
                onChange={(event) =>
                  logic.changeGroupChannel(
                    enabledEvents,
                    channel.channel,
                    event.target.checked,
                  )
                }
              />
              <Typography.Text>{channel.name}</Typography.Text>
            </Space>
          ),
          dataIndex: channel.channel,
          key: channel.channel,
          align: "center" as const,
          width: 140,
          render: (_: any, record: any) => {
            const enabled = record.channelsSetting.includes(channel.channel);
            return (
              <Checkbox
                disabled={!enabled || logic.isSubmitting}
                checked={
                  enabled &&
                  logic.isEventChecked(record.eventCode, channel.channel)
                }
                onChange={(event) =>
                  logic.changeEventChannel(
                    record,
                    channel.channel,
                    event.target.checked,
                  )
                }
              />
            );
          },
        };
      }),
    ];

    return (
      <Card key={group.code} styles={{ body: { padding: token.paddingMD } }}>
        <Collapse
          ghost
          defaultActiveKey={[group.code]}
          items={[
            {
              key: group.code,
              label: (
                <Typography.Text strong style={{ textTransform: "uppercase" }}>
                  {group.name}
                </Typography.Text>
              ),
              children: (
                <Table
                  rowKey={(record) => record.id || record.eventCode}
                  columns={columns}
                  dataSource={groupEvents}
                  pagination={false}
                  expandable={{
                    expandedRowRender: renderStatusSettings,
                    rowExpandable: (record) =>
                      ["ORDER_STATUS_UPDATE", "SHIPMENT_STATUS_UPDATE"].includes(
                        record.eventCode,
                      ),
                    defaultExpandAllRows: true,
                  }}
                  scroll={{ x: 720 }}
                />
              ),
            },
          ]}
        />
      </Card>
    );
  };

  const groups = logic.eventGroups
    .map((group: any) => renderGroup(group))
    .filter(Boolean);

  return (
    <Space direction="vertical" size={token.marginMD} style={{ width: "100%" }}>
      <Card styles={{ body: { padding: token.paddingLG } }}>
        <Flex align="center" gap={token.marginSM}>
          <SettingOutlined
            style={{
              color: token.colorPrimary,
              fontSize: token.fontSizeHeading4,
            }}
          />
          <Space direction="vertical" size={0}>
            <Typography.Title level={5} style={{ margin: 0 }}>
              {t("userProfile.notification_config")}
            </Typography.Title>
            <Typography.Text type="secondary">
              {t("userProfile.notification_config_des")}
            </Typography.Text>
          </Space>
        </Flex>
      </Card>

      {groups.length ? (
        groups
      ) : (
        <Card>
          <Empty description={t("message.empty")} />
        </Card>
      )}
    </Space>
  );
};
