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
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  ShrinkOutlined,
  UpOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  getCartServiceWarnings,
  isCartServiceDisabled,
} from "@repo/features/cart-services";
import { useTranslation } from "@repo/i18n";
import { formatCurrency } from "@repo/util";
import { useState } from "react";
import { useCartSellerPanel } from "../hooks/useCartSellerPanel";

const MONEY_TEXT_STYLE = { whiteSpace: "nowrap" };

export const SellerServicesPanel = ({
  group,
  logic,
}: {
  group: any;
  logic: any;
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [editingField, setEditingField] = useState<string | null>(null);
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
  const serviceWarnings = getCartServiceWarnings(
    selectedCodes,
    logic.orderServices,
    logic.orderServiceGroups,
  );
  const blockingServiceWarnings = serviceWarnings.filter(
    (warning) => warning.type !== "needApprove",
  );

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

  const renderServiceWarnings = (
    groupCode: string | null | "__all" = "__all",
  ) =>
    serviceWarnings
      .filter(
        (warning) =>
          groupCode === "__all" ||
          (warning.groupCode || null) === groupCode,
      )
      .map((warning, index) => {
      const isApprovalWarning = warning.type === "needApprove";
      let message = "";

      if (warning.type === "requires") {
        message = t("error.requiresMessage", {
          service: warning.serviceName,
          services: warning.requiredNames.join(", "),
        });
      } else if (warning.type === "requireGroups") {
        message = t("error.requireGroupsMessage", {
          service: warning.serviceName,
          serviceGroup: warning.requiredNames.join(", "),
        });
      } else if (warning.type === "requiredGroup") {
        message = `${t("orderServiceGroup.choose_error")} ${warning.groupName}`;
      } else {
        message = `${t("orderServiceGroup.service")} ${warning.serviceName} ${t("orderServiceGroup.approved_privilege")}`;
      }

      return (
        <Typography.Text
          key={`${warning.type}-${index}`}
          type={isApprovalWarning ? "warning" : "danger"}
          style={{ display: "block", fontSize: 12 }}
        >
          {isApprovalWarning ? (
            <WarningOutlined />
          ) : (
            <ExclamationCircleOutlined />
          )}{" "}
          <span dangerouslySetInnerHTML={{ __html: message }} />
        </Typography.Text>
      );
      });

  const renderOrderTextField = (
    field: "note" | "refCustomerCode" | "refOrderCode",
    label: string,
  ) => {
    const value = draft[field] ?? group[field] ?? "";

    return (
      <div style={{ width: "100%" }}>
        {editingField !== field && (
          <Typography.Text type="secondary">{label}: </Typography.Text>
        )}
        <Typography.Paragraph
          editable={{
            text: value,
            tooltip: t("common.edit"),
            onStart: () => setEditingField(field),
            onChange: (nextValue) => {
              setEditingField(null);
              logic.changeCartGroupDraft(groupId, field, nextValue);
            },
            onEnd: () => {
              setEditingField(null);
              logic.saveCartGroupField(group, field);
            },
            onCancel: () => setEditingField(null),
          }}
          ellipsis={!value ? false : { tooltip: value }}
          style={{
            display: "inline-block",
            marginBottom: 0,
            minWidth: 32,
            paddingInline: 4,
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
      <Space
        direction="vertical"
        size={token.marginMD}
        style={{ width: "100%" }}
      >
        <Card
          size="small"
          title={t("cartCheckout.order_info")}
          styles={{ body: { paddingBlock: token.paddingSM } }}
        >
          <Space
            direction="vertical"
            size={token.marginSM}
            style={{ width: "100%" }}
          >
            {renderOrderTextField(
              "note",
              t("cartCheckout.personal_note_for_order"),
            )}
            <Flex gap={token.marginMD} wrap>
              <div style={{ flex: "1 1 260px" }}>
                {renderOrderTextField(
                  "refCustomerCode",
                  t("cartCheckout.customer_code"),
                )}
              </div>
              <div style={{ flex: "1 1 260px" }}>
                {renderOrderTextField(
                  "refOrderCode",
                  t("cartCheckout.customer_order_code"),
                )}
              </div>
            </Flex>
          </Space>
        </Card>

        <Card
          size="small"
          title={t("orderServiceGroup.accompanied_service")}
          styles={{ body: { paddingBlock: token.paddingSM } }}
        >
          {servicesCollapsed ? (
            <Space
              direction="vertical"
              size={token.marginSM}
              style={{ width: "100%" }}
            >
              {selectedServices.length > 0 ? (
                <Space direction="vertical" size={token.marginXS}>
                  {selectedServices.map((service: any) => (
                    <Typography.Text key={service.code}>
                      <Typography.Text type="secondary">
                        {service?.serviceGroup?.name
                          ? `${service.serviceGroup.name}: `
                          : `${t("orderServiceGroup.other_service")}: `}
                      </Typography.Text>
                      {service.name}
                    </Typography.Text>
                  ))}
                </Space>
              ) : (
                <Typography.Text type="secondary">
                  {t("orderServiceGroup.no_service_selected")}
                </Typography.Text>
              )}
              {renderServiceWarnings()}
              <Button
                type="link"
                size="small"
                icon={<ArrowsAltOutlined />}
                style={{ padding: 0 }}
                onClick={() => setServicesCollapsed(false)}
              >
                {t("orderServiceGroup.choose_service")}
              </Button>
            </Space>
          ) : (
            <Space
              direction="vertical"
              size={token.marginSM}
              style={{ width: "100%" }}
            >
              {ungroupedServices.length > 0 && (
                <Space direction="vertical" size={token.marginXS}>
                  <Typography.Text strong>
                    {t("orderServiceGroup.other_service")}
                  </Typography.Text>
                  <Space wrap>
                    {ungroupedServices.map((service: any) => (
                      <Checkbox
                        key={service.code}
                        checked={selectedCodes.includes(service.code)}
                        disabled={isCartServiceDisabled(
                          service,
                          selectedCodes,
                          logic.orderServices,
                        )}
                        onChange={(event) =>
                          logic.toggleCartService(
                            group,
                            service,
                            event.target.checked,
                          )
                        }
                      >
                        {renderServiceLabel(service)}
                      </Checkbox>
                    ))}
                  </Space>
                  {renderServiceWarnings(null)}
                </Space>
              )}

              {logic.orderServiceGroups
                .slice()
                .sort(
                  (a: any, b: any) =>
                    Number(a.position || 0) - Number(b.position || 0),
                )
                .map((serviceGroup: any) => {
                  const services = logic.orderServices
                    .filter(
                      (service: any) =>
                        service?.serviceGroup?.code === serviceGroup.code,
                    )
                    .sort(
                      (a: any, b: any) =>
                        Number(a.position || 0) - Number(b.position || 0),
                    );
                  if (services.length === 0) return null;

                  return (
                    <Space
                      key={serviceGroup.code}
                      direction="vertical"
                      size={token.marginXS}
                      style={{ width: "100%" }}
                    >
                      <Typography.Text strong>
                        {serviceGroup.name}
                      </Typography.Text>
                      {serviceGroup.single ? (
                        <Radio.Group
                          value={
                            services.find((service: any) =>
                              selectedCodes.includes(service.code),
                            )?.code
                          }
                          onChange={(event) => {
                            const service = services.find(
                              (item: any) => item.code === event.target.value,
                            );
                            if (service)
                              logic.toggleCartService(group, service, true);
                          }}
                        >
                          <Space wrap>
                            {services.map((service: any) => (
                              <Radio
                                key={service.code}
                                value={service.code}
                                disabled={isCartServiceDisabled(
                                  service,
                                  selectedCodes,
                                  logic.orderServices,
                                )}
                              >
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
                              disabled={isCartServiceDisabled(
                                service,
                                selectedCodes,
                                logic.orderServices,
                              )}
                              onChange={(event) =>
                                logic.toggleCartService(
                                  group,
                                  service,
                                  event.target.checked,
                                )
                              }
                            >
                              {renderServiceLabel(service)}
                            </Checkbox>
                          ))}
                        </Space>
                      )}
                      {renderServiceWarnings(serviceGroup.code)}
                    </Space>
                  );
                })}

              <Button
                type="primary"
                icon={<SaveOutlined />}
                disabled={
                  !servicesChanged || blockingServiceWarnings.length > 0
                }
                loading={
                  logic.isSavingServices &&
                  String(logic.savingServicesGroupId) === String(group.id)
                }
                onClick={() => logic.saveCartServices(group)}
              >
                {t("orderServiceGroup.save_service")}
              </Button>
              <Button
                icon={<SaveOutlined />}
                loading={logic.isSavingPreferredServices}
                onClick={() => logic.savePreferredServices(group)}
              >
                {t("orderServiceGroup.save_default_service")}
              </Button>
              <Button
                type="link"
                size="small"
                icon={<ShrinkOutlined />}
                style={{ padding: 0 }}
                onClick={() => setServicesCollapsed(true)}
              >
                {t("orderServiceGroup.collapse")}
              </Button>
            </Space>
          )}
        </Card>

        <Card
          size="small"
          title={
            <Typography.Text strong style={{ color: token.colorPrimary }}>
              {t("cart.cost")}
            </Typography.Text>
          }
          style={{
            borderColor: token.colorPrimaryBorder,
            background: token.colorPrimaryBg,
          }}
          styles={{
            header: {
              borderBottomColor: token.colorPrimaryBorder,
              background: token.colorPrimaryBgHover,
            },
          }}
        >
          <Space
            direction="vertical"
            size={token.marginSM}
            style={{ width: "100%" }}
          >
            <Flex justify="space-between">
              <Typography.Text type="secondary">
                {t("order.total_price")}
              </Typography.Text>
              <Typography.Text strong style={MONEY_TEXT_STYLE}>
                {formatCurrency(group.exchangedTotalValue || 0)}
              </Typography.Text>
            </Flex>
            <Flex justify="space-between" align="center">
              <Button
                type="link"
                size="small"
                style={{ padding: 0 }}
                icon={feesOpen ? <UpOutlined /> : <DownOutlined />}
                onClick={() => setFeesOpen((current) => !current)}
              >
                {t("cart.provisional_fee")}
              </Button>
              <Typography.Text strong style={MONEY_TEXT_STYLE}>
                {formatCurrency(group.totalFee || 0)}
              </Typography.Text>
            </Flex>
            {feesOpen && (
              <Space
                direction="vertical"
                size={token.marginXS}
                style={{ width: "100%" }}
              >
                {isFeesFetching ? (
                  <Typography.Text type="secondary">
                    {t("cart.loading_fee")}
                  </Typography.Text>
                ) : fees.length > 0 ? (
                  fees.map((fee: any) => (
                    <Flex
                      key={fee.id || fee.code || fee.type?.code}
                      justify="space-between"
                      gap={token.marginSM}
                    >
                      <Typography.Text type="secondary">
                        - {fee.type?.name || fee.name || "---"}
                        {(fee.type?.minFee || fee.type?.maxFee) && (
                          <Tooltip
                            title={
                              <Space direction="vertical" size={0}>
                                <span>
                                  {t("cart.min_fee")}:{" "}
                                  {formatCurrency(fee.type?.minFee || 0)}
                                </span>
                                <span>
                                  {t("cart.max_fee")}:{" "}
                                  {formatCurrency(fee.type?.maxFee || 0)}
                                </span>
                              </Space>
                            }
                          >
                            <InfoCircleOutlined style={{ marginLeft: 4 }} />
                          </Tooltip>
                        )}
                      </Typography.Text>
                      <Typography.Text style={MONEY_TEXT_STYLE}>
                        {fee.provisionalAmount !== null &&
                        fee.provisionalAmount !== undefined
                          ? formatCurrency(fee.provisionalAmount)
                          : "---"}
                      </Typography.Text>
                    </Flex>
                  ))
                ) : (
                  <Typography.Text type="secondary">
                    {t("cart.no_fee")}
                  </Typography.Text>
                )}
              </Space>
            )}
            <Divider style={{ marginBlock: token.marginXS }} />
            <Flex justify="space-between">
              <Typography.Text strong>{t("cart.total")}</Typography.Text>
              <Typography.Text
                strong
                style={{ ...MONEY_TEXT_STYLE, color: token.colorPrimary }}
              >
                {formatCurrency(group.grandTotal || 0)}
              </Typography.Text>
            </Flex>
            <Button
              type="primary"
              block
              loading={logic.orderingGroupId === groupId}
              disabled={
                logic.isPlacingOrder && logic.orderingGroupId !== groupId
              }
              onClick={() => logic.placeOrderForGroup(group)}
            >
              {t("cart.order_now")}
            </Button>
          </Space>
        </Card>
      </Space>
    </div>
  );
};
