import {
  Button,
  Card,
  Checkbox,
  Divider,
  Flex,
  Radio,
  Space,
  Tooltip,
  Typography,
  theme,
} from "antd";
import {
  ArrowsAltOutlined,
  DownOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  ShrinkOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { formatCurrency } from "@repo/util";
import { useCartSellerPanel } from "../hooks/useCartSellerPanel";

const MONEY_TEXT_STYLE = { whiteSpace: "nowrap" };

export const SellerServicesPanel = ({
  group,
  logic,
}: {
  group: any;
  logic: any;
}) => {
  const { token } = theme.useToken();
  const {
    groupId,
    draft,
    fees,
    feesOpen,
    isFeesFetching,
    selectedCodes,
    selectedServices,
    servicesChanged,
    servicesCollapsed,
    ungroupedServices,
    setFeesOpen,
    setServicesCollapsed,
  } = useCartSellerPanel(group, logic);

  const renderServiceLabel = (service: any) => (
    <Space size={4}>
      <span>{service.name}</span>
      {service.serviceInfo && (
        <Tooltip title={service.serviceInfo}>
          <InfoCircleOutlined style={{ color: token.colorTextSecondary }} />
        </Tooltip>
      )}
    </Space>
  );

  const renderOrderTextField = (
    field: "note" | "refCustomerCode" | "refOrderCode",
    label: string,
  ) => {
    const value = draft[field] ?? group[field] ?? "";

    return (
      <div style={{ width: "100%" }}>
        <Typography.Text type="secondary">{label}: </Typography.Text>
        <Typography.Paragraph
          editable={{
            onChange: (nextValue) =>
              logic.changeCartGroupDraft(groupId, field, nextValue),
            onEnd: () => logic.saveCartGroupField(group, field),
          }}
          ellipsis={!value ? false : { tooltip: value }}
          style={{
            display: "inline",
            marginBottom: 0,
            whiteSpace: "pre-wrap",
          }}
        >
          {value || "---"}
        </Typography.Paragraph>
      </div>
    );
  };

  return (
    <div
      style={{
        padding: token.paddingMD,
        height: "100%",
        borderLeft: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <Space direction="vertical" size={token.marginMD} style={{ width: "100%" }}>
        <Card size="small" title="Thông tin đơn" styles={{ body: { paddingBlock: token.paddingSM } }}>
          <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
            {renderOrderTextField("note", "Ghi chú cá nhân cho đơn")}
            <Flex gap={token.marginMD} wrap>
              <div style={{ flex: "1 1 260px" }}>
                {renderOrderTextField("refCustomerCode", "Mã khách hàng")}
              </div>
              <div style={{ flex: "1 1 260px" }}>
                {renderOrderTextField("refOrderCode", "Mã đơn hàng khách hàng")}
              </div>
            </Flex>
          </Space>
        </Card>

        <Card size="small" title="Dịch vụ đi kèm" styles={{ body: { paddingBlock: token.paddingSM } }}>
          {servicesCollapsed ? (
            <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
              {selectedServices.length > 0 ? (
                <Space direction="vertical" size={token.marginXS}>
                  {selectedServices.map((service: any) => (
                    <Typography.Text key={service.code}>
                      <Typography.Text type="secondary">
                        {service?.serviceGroup?.name
                          ? `${service.serviceGroup.name}: `
                          : "Dịch vụ khác: "}
                      </Typography.Text>
                      {service.name}
                    </Typography.Text>
                  ))}
                </Space>
              ) : (
                <Typography.Text type="secondary">Chưa chọn dịch vụ</Typography.Text>
              )}
              <Button type="link" size="small" icon={<ArrowsAltOutlined />} style={{ padding: 0 }} onClick={() => setServicesCollapsed(false)}>
                Chọn dịch vụ
              </Button>
            </Space>
          ) : (
            <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
              {ungroupedServices.length > 0 && (
                <Space direction="vertical" size={token.marginXS}>
                  <Typography.Text strong>Dịch vụ khác</Typography.Text>
                  <Space wrap>
                    {ungroupedServices.map((service: any) => (
                      <Checkbox
                        key={service.code}
                        checked={selectedCodes.includes(service.code)}
                        onChange={(event) =>
                          logic.toggleCartService(group, service, event.target.checked)
                        }
                      >
                        {renderServiceLabel(service)}
                      </Checkbox>
                    ))}
                  </Space>
                </Space>
              )}

              {logic.orderServiceGroups
                .slice()
                .sort((a: any, b: any) => Number(a.position || 0) - Number(b.position || 0))
                .map((serviceGroup: any) => {
                  const services = logic.orderServices
                    .filter((service: any) => service?.serviceGroup?.code === serviceGroup.code)
                    .sort((a: any, b: any) => Number(a.position || 0) - Number(b.position || 0));
                  if (services.length === 0) return null;

                  return (
                    <Space key={serviceGroup.code} direction="vertical" size={token.marginXS} style={{ width: "100%" }}>
                      <Typography.Text strong>{serviceGroup.name}</Typography.Text>
                      {serviceGroup.single ? (
                        <Radio.Group
                          value={services.find((service: any) => selectedCodes.includes(service.code))?.code}
                          onChange={(event) => {
                            const service = services.find((item: any) => item.code === event.target.value);
                            if (service) logic.toggleCartService(group, service, true);
                          }}
                        >
                          <Space wrap>
                            {services.map((service: any) => (
                              <Radio key={service.code} value={service.code}>
                                {renderServiceLabel(service)}
                              </Radio>
                            ))}
                          </Space>
                        </Radio.Group>
                      ) : (
                        <Space wrap>
                          {services.map((service: any) => (
                            <Checkbox
                              key={service.code}
                              checked={selectedCodes.includes(service.code)}
                              onChange={(event) =>
                                logic.toggleCartService(group, service, event.target.checked)
                              }
                            >
                              {renderServiceLabel(service)}
                            </Checkbox>
                          ))}
                        </Space>
                      )}
                    </Space>
                  );
                })}

              <Button
                type="primary"
                icon={<SaveOutlined />}
                disabled={!servicesChanged}
                loading={logic.isSavingServices && String(logic.savingServicesGroupId) === String(group.id)}
                onClick={() => logic.saveCartServices(group)}
              >
                Lưu dịch vụ
              </Button>
              <Button icon={<SaveOutlined />} loading={logic.isSavingPreferredServices} onClick={() => logic.savePreferredServices(group)}>
                Lưu làm dịch vụ mặc định
              </Button>
              <Button type="link" size="small" icon={<ShrinkOutlined />} style={{ padding: 0 }} onClick={() => setServicesCollapsed(true)}>
                Thu gọn
              </Button>
            </Space>
          )}
        </Card>

        <Card
          size="small"
          title={<Typography.Text strong style={{ color: token.colorPrimary }}>Chi phí</Typography.Text>}
          style={{ borderColor: token.colorPrimaryBorder, background: token.colorPrimaryBg }}
          styles={{
            header: {
              borderBottomColor: token.colorPrimaryBorder,
              background: token.colorPrimaryBgHover,
            },
          }}
        >
          <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
            <Flex justify="space-between">
              <Typography.Text type="secondary">Tiền hàng</Typography.Text>
              <Typography.Text strong style={MONEY_TEXT_STYLE}>
                {formatCurrency(group.exchangedTotalValue || 0)}
              </Typography.Text>
            </Flex>
            <Flex justify="space-between" align="center">
              <Button type="link" size="small" style={{ padding: 0 }} icon={feesOpen ? <UpOutlined /> : <DownOutlined />} onClick={() => setFeesOpen((current) => !current)}>
                Phí tạm tính
              </Button>
              <Typography.Text strong style={MONEY_TEXT_STYLE}>
                {formatCurrency(group.totalFee || 0)}
              </Typography.Text>
            </Flex>
            {feesOpen && (
              <Space direction="vertical" size={token.marginXS} style={{ width: "100%" }}>
                {isFeesFetching ? (
                  <Typography.Text type="secondary">Đang tải phí...</Typography.Text>
                ) : fees.length > 0 ? (
                  fees.map((fee: any) => (
                    <Flex key={fee.id || fee.code || fee.type?.code} justify="space-between" gap={token.marginSM}>
                      <Typography.Text type="secondary">
                        - {fee.type?.name || fee.name || "---"}
                        {(fee.type?.minFee || fee.type?.maxFee) && (
                          <Tooltip
                            title={
                              <Space direction="vertical" size={0}>
                                <span>Phí tối thiểu: {formatCurrency(fee.type?.minFee || 0)}</span>
                                <span>Phí tối đa: {formatCurrency(fee.type?.maxFee || 0)}</span>
                              </Space>
                            }
                          >
                            <InfoCircleOutlined style={{ marginLeft: 4 }} />
                          </Tooltip>
                        )}
                      </Typography.Text>
                      <Typography.Text style={MONEY_TEXT_STYLE}>
                        {fee.provisionalAmount !== null && fee.provisionalAmount !== undefined
                          ? formatCurrency(fee.provisionalAmount)
                          : "---"}
                      </Typography.Text>
                    </Flex>
                  ))
                ) : (
                  <Typography.Text type="secondary">Chưa có phí</Typography.Text>
                )}
              </Space>
            )}
            <Divider style={{ marginBlock: token.marginXS }} />
            <Flex justify="space-between">
              <Typography.Text strong>Tổng</Typography.Text>
              <Typography.Text strong style={{ ...MONEY_TEXT_STYLE, color: token.colorPrimary }}>
                {formatCurrency(group.grandTotal || 0)}
              </Typography.Text>
            </Flex>
          </Space>
        </Card>
      </Space>
    </div>
  );
};
