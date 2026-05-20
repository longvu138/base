import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Empty,
  Flex,
  Form,
  Input,
  List,
  Modal,
  Pagination,
  Popover,
  Row,
  Select,
  Skeleton,
  Space,
  Spin,
  Tag,
  Timeline,
  Tooltip,
  Typography,
  Upload,
  theme,
} from "antd";
import {
  DownloadOutlined,
  FileSearchOutlined,
  InfoCircleOutlined,
  InboxOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  ShopOutlined,
  UploadOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useShipmentMilestonesQuery } from "@repo/hooks";
import { FilterPanel } from "@repo/ui";
import { moneyFormat, quantityFormat } from "@repo/util";
import {
  getCustomerVisibleShipmentServices,
  getShipmentServicesInGroup,
  getShipmentServicesWithoutGroup,
  getVisibleShipmentServiceGroups,
} from "../../components/Common/shipmentServices";
import { useShipmentsPage } from "./hooks/useShipmentsPage";

const { Paragraph, Text } = Typography;

const formatDate = (value?: string) =>
  value ? dayjs(value).format("HH:mm DD/MM/YYYY") : "---";

const formatNumber = (value?: number | string) => {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue)
    ? new Intl.NumberFormat("vi-VN").format(numericValue)
    : "0";
};

// Keep shipment list amounts aligned with the legacy shipment screen,
// where Math.round coerces null, empty strings, and numeric strings.
const roundShipmentMoney = (value: unknown) => Math.round(value as number);

const getFirstValue = (record: Record<string, any>, keys: string[]) => {
  for (const key of keys) {
    if (record[key]) return record[key];
  }
  return undefined;
};

const ShipmentStatusPopover = ({
  code,
  status,
  statusData = [],
  t,
}: {
  code: string;
  status?: string;
  statusData?: any[];
  t: (key: string) => string;
}) => {
  const [open, setOpen] = useState(false);
  const { data: milestones = [], isLoading } = useShipmentMilestonesQuery(
    open ? code : "",
  );
  const currentStatus =
    statusData.find((item: any) => item.code === status) || {};

  return (
    <Popover
      trigger="click"
      placement="left"
      open={open}
      onOpenChange={setOpen}
      content={
        <Space
          direction="vertical"
          size={0}
          style={{ width: 360, maxWidth: "calc(100vw - 48px)" }}
        >
          {isLoading ? (
            <Flex justify="center" align="center" style={{ minHeight: 140 }}>
              <Spin />
            </Flex>
          ) : Array.isArray(milestones) && milestones.length > 0 ? (
            <div
              style={{
                maxHeight: 320,
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
                      ? t("shipments.undefined_handling_time")
                      : `${item.handlingTime} ${Number(item.handlingTime) > 1 ? t("shipments.days") : t("shipments.day")}`;
                  return {
                    color: index === 0 ? "green" : "gray",
                    style:
                      index === milestones.length - 1
                        ? { paddingBottom: 0 }
                        : undefined,
                    children: (
                      <Space direction="vertical" size={2}>
                        <Text strong>
                          {milestoneStatus?.name || item.status || "---"}
                        </Text>
                        <Text type="secondary">
                          {formatDate(item.timestamp)}
                        </Text>
                        <Text type="secondary">({handlingTime})</Text>
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
        color={currentStatus?.color || "processing"}
        style={{ cursor: "pointer" }}
      >
        {currentStatus?.name || status || "---"} <InfoCircleOutlined />
      </Tag>
    </Popover>
  );
};

export type ShipmentsPageLogic = ReturnType<typeof useShipmentsPage>;

export const ShipmentsView = ({
  logic,
  dense = false,
}: {
  logic: ShipmentsPageLogic;
  dense?: boolean;
}) => {
  const { token } = theme.useToken();
  const {
    t,
    form,
    page,
    pageSize,
    setPage,
    setPageSize,
    shipmentData,
    isShipmentLoading,
    isShipmentFetching,
    statusData,
    servicesData,
    serviceGroupsData,
    isServicesLoading,
    statusOptions,
    handleSearch,
    clearFilters,
    importOpen,
    setImportOpen,
    importFile,
    importServices,
    setImportServices,
    importFileErrors,
    importBackendErrors,
    importValidating,
    uploadProps,
    closeImportModal,
    handleImport,
    importMutation,
    exportOpen,
    setExportOpen,
    exportSecret,
    setExportSecret,
    exportError,
    setExportError,
    handleExport,
    closeExportModal,
    exportMutation,
  } = logic;
  const total = shipmentData?.total || 0;
  const pageGap = dense ? 12 : 16;
  const cutOffTypeSearch = Form.useWatch("typeSearch", form);
  const handlingTimeFrom = Form.useWatch("handlingTimeFrom", form);
  const handlingTimeTo = Form.useWatch("handlingTimeTo", form);
  const importServiceOptions = useMemo(
    () => getCustomerVisibleShipmentServices(servicesData || []),
    [servicesData],
  );
  const importNoGroupServices = useMemo(
    () => getShipmentServicesWithoutGroup(importServiceOptions),
    [importServiceOptions],
  );
  const importVisibleGroups = useMemo(
    () =>
      getVisibleShipmentServiceGroups(
        serviceGroupsData || [],
        importServiceOptions,
      ),
    [importServiceOptions, serviceGroupsData],
  );
  const importSelectedServiceObjects = useMemo(
    () =>
      importServices
        .map((code) =>
          importServiceOptions.find((service: any) => service.code === code),
        )
        .filter(Boolean),
    [importServiceOptions, importServices],
  );

  const renderImportServiceDescription = (service: any) => {
    if (!importServices.includes(service.code)) return [];

    const requiresMissingNames = Array.isArray(service.requires)
      ? service.requires
          .filter((code: string) => !importServices.includes(code))
          .map(
            (code: string) =>
              importServiceOptions.find((item: any) => item.code === code)
                ?.name,
          )
          .filter(Boolean)
          .join(", ")
      : "";
    const requireGroupsMissingNames = Array.isArray(service.requireGroups)
      ? service.requireGroups
          .filter(
            (groupCode: string) =>
              !importSelectedServiceObjects.some(
                (item: any) => item.serviceGroup?.code === groupCode,
              ),
          )
          .map(
            (code: string) =>
              importVisibleGroups.find((item: any) => item.code === code)?.name,
          )
          .filter(Boolean)
          .join(", ")
      : "";
    const messages: React.ReactNode[] = [];

    if (requiresMissingNames) {
      messages.push(
        <Paragraph
          key={`${service.code}-requires`}
          type="danger"
          className="mb-2.5 text-xs last:mb-0"
        >
          <InfoCircleOutlined className="me-1" />
          <span
            dangerouslySetInnerHTML={{
              __html: t("error.requiresMessage", {
                service: service.name,
                services: requiresMissingNames,
              }),
            }}
          />
        </Paragraph>,
      );
    }

    if (requireGroupsMissingNames) {
      messages.push(
        <Paragraph
          key={`${service.code}-requireGroups`}
          type="danger"
          className="mb-2.5 text-xs last:mb-0"
        >
          <InfoCircleOutlined className="me-1" />
          <span
            dangerouslySetInnerHTML={{
              __html: t("error.requireGroupsMessage", {
                service: service.name,
                serviceGroup: requireGroupsMissingNames,
              }),
            }}
          />
        </Paragraph>,
      );
    }

    if (service.description) {
      messages.push(
        <Paragraph
          key={`${service.code}-description`}
          type="secondary"
          className="mb-2.5 text-xs last:mb-0"
        >
          <Text>{service.name}</Text>:{" "}
          <Text type="secondary">{service.description}</Text>
        </Paragraph>,
      );
    }

    if (service.needApprove) {
      messages.push(
        <Paragraph
          key={`${service.code}-needApprove`}
          type="warning"
          className="mb-2.5 text-xs last:mb-0"
        >
          <WarningOutlined className="me-1" />
          {t("orderServiceGroup.service")} {service.name}{" "}
          {t("orderServiceGroup.approved_privilege")}
        </Paragraph>,
      );
    }

    return messages;
  };

  const renderImportServiceDescriptions = (services: any[]) => {
    const messages = services.flatMap(renderImportServiceDescription);
    if (!messages.length) return null;

    return <div style={{ marginTop: 8 }}>{messages}</div>;
  };

  const renderMetric = (
    label: string,
    value?: React.ReactNode,
    tooltip?: string,
  ) => (
    <Space direction="vertical" size={2}>
      <Text type="secondary">
        {label}
        {tooltip && (
          <Tooltip title={tooltip}>
            <QuestionCircleOutlined style={{ marginLeft: 6 }} />
          </Tooltip>
        )}
      </Text>
      <Text strong>{value || "---"}</Text>
    </Space>
  );

  const renderLine = (
    label: React.ReactNode,
    value?: React.ReactNode,
  ) => (
    <Flex gap={8} wrap>
      <Text type="secondary">{label}:</Text>
      <Text>{value || "---"}</Text>
    </Flex>
  );

  const renderServiceNames = (services: any[]) => (
    <Space wrap split={<Text type="secondary">|</Text>}>
      {services.map((service: any, index: number) => {
        const needApprove = service.needApprove === true || service.approved === null;

        return (
          <Text
            key={`${service.code || service.name || index}`}
            type={needApprove ? "warning" : undefined}
          >
            {service.name}
          </Text>
        );
      })}
    </Space>
  );

  const renderCutOffHandlingInput = () => {
    const commonInputProps = {
      allowClear: true,
      onPressEnter: handleSearch,
    };

    if (cutOffTypeSearch === "equal") {
      return (
        <Input
          {...commonInputProps}
          placeholder={t("order.cut_off_days")}
          value={handlingTimeFrom}
          onChange={(event) =>
            form.setFieldsValue({
              handlingTimeFrom: event.target.value,
              handlingTimeTo: event.target.value,
            })
          }
        />
      );
    }

    if (cutOffTypeSearch === "from") {
      return (
        <Input
          {...commonInputProps}
          placeholder={t("order.cut_off_days")}
          value={handlingTimeFrom}
          onChange={(event) =>
            form.setFieldsValue({ handlingTimeFrom: event.target.value })
          }
        />
      );
    }

    if (cutOffTypeSearch === "to") {
      return (
        <Input
          {...commonInputProps}
          placeholder={t("order.cut_off_days")}
          value={handlingTimeTo}
          onChange={(event) =>
            form.setFieldsValue({ handlingTimeTo: event.target.value })
          }
        />
      );
    }

    return (
      <Input.Group compact>
        <Input
          {...commonInputProps}
          style={{ width: "50%" }}
          placeholder={t("order.cut_off_days_from")}
          value={handlingTimeFrom}
          onChange={(event) =>
            form.setFieldsValue({ handlingTimeFrom: event.target.value })
          }
        />
        <Input
          {...commonInputProps}
          style={{ width: "50%" }}
          placeholder={t("order.cut_off_days_to")}
          value={handlingTimeTo}
          onChange={(event) =>
            form.setFieldsValue({ handlingTimeTo: event.target.value })
          }
        />
      </Input.Group>
    );
  };

  const renderShipmentItem = (item: any) => {
    const merchant = getFirstValue(item, ["merchantName", "shopName"]);
    const refShipmentCode = item.refShipmentCode;
    const warehouseName = item.receivingWarehouse?.displayName;
    const waybillCodes =
      Array.isArray(item.waybillCodes) && item.waybillCodes.length > 0
        ? item.waybillCodes
        : [];
    const shipmentServices = Array.isArray(item.services)
      ? [...item.services].sort(
          (a: any, b: any) => Number(a.position || 0) - Number(b.position || 0),
        )
      : null;
    const totalNeedPay = Number(item?.totalUnpaid || 0);

    return (
      <List.Item style={{ paddingInline: 0 }}>
        <Card
          size="small"
          style={{ width: "100%" }}
          title={
            <Flex justify="space-between" align="center" gap={12} wrap>
              <Space wrap split={<Divider type="vertical" />}>
                <Typography.Paragraph
                  copyable={{ text: item.code }}
                  style={{ marginBottom: 0 }}
                >
                  <Link to={`/shipments/${item.code}`}>
                    <Text strong style={{ color: token.colorPrimary }}>
                      #{item.code}
                    </Text>
                  </Link>
                </Typography.Paragraph>
                <Space size={6}>
                  <ShopOutlined />
                  <Text>{merchant || item.merchantCode || "---"}</Text>
                </Space>
                {warehouseName && (
                  <Text>
                    {t("shipments.columns.warehouse")}:{" "}
                    <Text strong>{warehouseName}</Text>
                  </Text>
                )}
              </Space>
              <ShipmentStatusPopover
                code={item.code}
                status={item.status}
                statusData={statusData}
                t={t}
              />
            </Flex>
          }
        >
          <Space
            direction="vertical"
            size={0}
            style={{ width: "100%" }}
            split={<Divider style={{ margin: "12px 0" }} />}
          >
            {renderLine(
              t("shipments.columns.waybill"),
              waybillCodes.length > 0 ? (
                <Space wrap split={<Text type="secondary">|</Text>}>
                  {waybillCodes.map((code: string) => (
                    <Text key={code}>{code}</Text>
                  ))}
                </Space>
              ) : undefined,
            )}
            {renderLine(
              t("shipments.filters.your_order_code"),
              refShipmentCode,
            )}
            {renderLine(
              t("shipments.filters.services"),
              shipmentServices?.length
                ? renderServiceNames(shipmentServices)
                : "---",
            )}
            {totalNeedPay > 0 && (
              <Flex vertical gap={token.marginXS}>
                <Flex gap={token.marginXS} wrap>
                  <Text type="secondary">{t("orderDetail.total_need_payment")}:</Text>
                  <Text strong style={{ color: token.colorPrimary }}>
                    {moneyFormat(roundShipmentMoney(totalNeedPay), undefined, true)}
                  </Text>
                </Flex>
              </Flex>
            )}
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={5}>
                <Space>
                  <Link to={`/shipments/${item.code}`}>
                    <Avatar
                      shape="square"
                      src={item.image}
                      icon={!item.image ? <InboxOutlined /> : undefined}
                      size={36}
                    />
                  </Link>
                  {renderMetric(
                    t("shipments.columns.quantity"),
                    `${quantityFormat(item.totalProducts)}/${quantityFormat(item.receivedQuantity)}`,
                    t("shipments.columns.received_quantity_hint"),
                  )}
                </Space>
              </Col>
              <Col xs={12} md={4}>
                {renderMetric(
                  t("shipments.columns.total_value"),
                  moneyFormat(
                    roundShipmentMoney(item.totalValue),
                    item.currency,
                  ),
                )}
              </Col>
              <Col xs={12} md={4}>
                {renderMetric(
                  t("shipments.columns.total_fee"),
                  moneyFormat(roundShipmentMoney(item.totalFee)),
                )}
              </Col>
              <Col xs={12} md={4}>
                {renderMetric(
                  t("shipments.columns.total_unpaid"),
                  moneyFormat(roundShipmentMoney(item.totalUnpaid)),
                )}
              </Col>
              <Col xs={12} md={4}>
                {renderMetric(
                  t("shipments.columns.timestamp"),
                  formatDate(item.timestamp),
                )}
              </Col>
              <Col xs={12} md={5}>
                {renderMetric(
                  t("shipments.columns.packages"),
                  item.totalPackages || undefined,
                )}
              </Col>
              <Col xs={12} md={5}>
                {renderMetric(
                  t("shipments.columns.weight"),
                  item.actualWeight ? `${item.actualWeight}kg` : undefined,
                )}
              </Col>
            </Row>
          </Space>
        </Card>
      </List.Item>
    );
  };

  return (
    <Space direction="vertical" size={pageGap} style={{ width: "100%" }}>
      <Card className="mb-4 shadow-sm">
        <FilterPanel
          form={form}
          onSearch={handleSearch}
          onReset={clearFilters}
          searchText={t("orders.buttons.search")}
          resetText={t("orders.buttons.reset")}
          showCollapseAll={true}
          primaryContent={
            <Space
              direction="vertical"
              size={pageGap}
              style={{ width: "100%" }}
            >
              <Form.Item
                name="statuses"
                label={t("shipments.filters.status")}
                style={{ marginBottom: 0 }}
              >
                <Checkbox.Group>
                  <Space wrap>
                    {statusOptions.map((option: any) => (
                      <Checkbox key={option.value} value={option.value}>
                        {option.label}
                        {option.hasStatistic
                          ? ` (${quantityFormat(option.count)})`
                          : ""}
                      </Checkbox>
                    ))}
                  </Space>
                </Checkbox.Group>
              </Form.Item>

              <Row gutter={[16, 8]}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="query"
                    label={t("shipments.filters.code")}
                    style={{ marginBottom: 0 }}
                  >
                    <Input
                      allowClear
                      placeholder={t("shipments.search_placeholder")}
                      onPressEnter={handleSearch}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={16}>
                  <Form.Item
                    label={t("shipments.filters.created_at")}
                    style={{ marginBottom: 0 }}
                  >
                    <Row gutter={[12, 8]}>
                      <Col xs={24} md={12}>
                        <Form.Item name="timestampFrom" noStyle>
                          <DatePicker
                            style={{ width: "100%" }}
                            format="DD/MM/YYYY"
                            placeholder={t("orders.filters.start_date")}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="timestampTo" noStyle>
                          <DatePicker
                            style={{ width: "100%" }}
                            format="DD/MM/YYYY"
                            placeholder={t("orders.filters.end_date")}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>
              </Row>
            </Space>
          }
          secondaryContent={
            <div style={{ marginTop: 16 }}>
              <Space
                direction="vertical"
                size={pageGap}
                style={{ width: "100%" }}
              >
                <Row gutter={[16, 8]}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="originalReceiptCode"
                      label={t("shipments.filters.original_invoice")}
                      style={{ marginBottom: 0 }}
                    >
                      <Input allowClear onPressEnter={handleSearch} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="wayBill"
                      label={t("shipments.filters.waybill")}
                      style={{ marginBottom: 0 }}
                    >
                      <Input allowClear onPressEnter={handleSearch} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="merchantName"
                      label={t("shipments.filters.shop_name")}
                      style={{ marginBottom: 0 }}
                    >
                      <Input allowClear onPressEnter={handleSearch} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="refShipmentCode"
                      label={t("shipments.filters.your_order_code")}
                      style={{ marginBottom: 0 }}
                    >
                      <Input allowClear onPressEnter={handleSearch} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="refCustomerCode"
                      label={t("shipments.filters.your_customer_code")}
                      style={{ marginBottom: 0 }}
                    >
                      <Input allowClear onPressEnter={handleSearch} />
                    </Form.Item>
                  </Col>
                </Row>

                {isServicesLoading ? (
                  <Skeleton active paragraph={{ rows: 1 }} title={false} />
                ) : (
                  <Form.Item
                    name="services"
                    label={t("shipments.filters.services")}
                    style={{ marginBottom: 0 }}
                  >
                    <Checkbox.Group>
                      <Space wrap>
                        {(servicesData || []).map((service: any) => (
                          <Checkbox key={service.code} value={service.code}>
                            {service.name}
                          </Checkbox>
                        ))}
                      </Space>
                    </Checkbox.Group>
                  </Form.Item>
                )}

                <Form.Item
                  label={t("order.order_cut_off_time")}
                  style={{ marginBottom: 0 }}
                >
                  <Row gutter={[10, 8]}>
                    <Col xs={24} md={6}>
                      <Form.Item name="cutOffStatus" noStyle>
                        <Select
                          showSearch
                          placeholder={t("order.order_status")}
                          optionFilterProp="label"
                          options={(statusData || []).map((status: any) => ({
                            label: status.name,
                            value: status.code,
                          }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                      <Form.Item name="typeSearch" noStyle>
                        <Select
                          showSearch
                          placeholder={t("order.cut_off_range")}
                          optionFilterProp="label"
                          onChange={(value) => {
                            form.setFieldsValue({
                              typeSearch: value,
                              handlingTimeFrom: "",
                              handlingTimeTo: "",
                            });
                          }}
                          options={[
                            {
                              label: t("order.cut_off_range"),
                              value: "range",
                            },
                            {
                              label: t("order.cut_off_equal"),
                              value: "equal",
                            },
                            {
                              label: t("order.cut_off_from"),
                              value: "from",
                            },
                            {
                              label: t("order.cut_off_to"),
                              value: "to",
                            },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      {renderCutOffHandlingInput()}
                    </Col>
                  </Row>
                </Form.Item>
                <Row gutter={[16, 8]}>
                  <Col span={24}>
                    <Form.Item
                      name="existsProduct"
                      valuePropName="checked"
                      style={{ marginBottom: 0 }}
                    >
                      <Checkbox>
                        {t("shipments.filters.lack_product_info")}
                      </Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
              </Space>
            </div>
          }
        />
      </Card>

      <Card
        title={
          <Space>
            <FileSearchOutlined />
            <span>{t("shipments.list_title")}</span>
            <Tag>{formatNumber(total)}</Tag>
          </Space>
        }
        extra={
          <Space wrap>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => setImportOpen(true)}
            >
              {t("shipments.import_excel")}
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => setExportOpen(true)}
            >
              {t("shipments.export_excel")}
            </Button>
            <Link to="/shipments/create">
              <Button type="primary" icon={<PlusOutlined />}>
                {t("shipments.create_shipment")}
              </Button>
            </Link>
          </Space>
        }
      >
        <List
          dataSource={shipmentData?.data || []}
          loading={{
            spinning: isShipmentLoading || isShipmentFetching,
            tip: t("common.loading"),
          }}
          rowKey={(record: any) => record.id || record.code}
          renderItem={renderShipmentItem}
          locale={{
            emptyText: <Empty description={t("shipments.empty_list")} />,
          }}
        />

        <Flex justify="flex-end" style={{ marginTop: 16 }}>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            showSizeChanger
            disabled={isShipmentLoading || isShipmentFetching}
            onChange={(nextPage, nextPageSize) => {
              setPage(nextPage);
              if (nextPageSize !== pageSize) setPageSize(nextPageSize);
            }}
          />
        </Flex>
      </Card>

      <Modal
        title={t("shipments.import_excel")}
        open={importOpen}
        onCancel={closeImportModal}
        footer={
          <Flex justify="space-between" align="center" gap={12} wrap>
            <a href="//cdn.gobiz.vn/Import_shipment_template.xlsx" download>
              {t("shipments.download_template")}
            </a>
            <Space>
              <Button onClick={closeImportModal}>{t("button.cancel")}</Button>
              <Button
                type="primary"
                onClick={handleImport}
                disabled={
                  !importFile || importFileErrors.length > 0 || importValidating
                }
                loading={importMutation.isPending || importValidating}
              >
                {t("cartCheckout.confirm")}
              </Button>
            </Space>
          </Flex>
        }
      >
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Upload.Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">
              {t("shipments.import_upload_text")}
            </p>
          </Upload.Dragger>
          {importFileErrors.length > 0 && (
            <Space
              direction="vertical"
              size={8}
              style={{
                width: "100%",
                maxHeight: 240,
                overflowY: "auto",
                paddingRight: 8,
              }}
            >
              {importFileErrors.map((error) => (
                <Text key={error} type="danger">
                  {error}
                </Text>
              ))}
            </Space>
          )}
          {importBackendErrors.length > 0 && (
            <Alert
              type="error"
              showIcon
              message={t("shipments.error_cell")}
              description={importBackendErrors.join(", ")}
            />
          )}
          <Form layout="vertical">
            <Form.Item
              label={t("shipments.filters.services")}
              style={{ marginBottom: 0 }}
            >
              <Checkbox.Group
                value={importServices}
                onChange={(value) => setImportServices(value as string[])}
              >
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  {importNoGroupServices.length > 0 && (
                    <Row gutter={[16, 8]}>
                      <Col xs={24} md={6}>
                        <Text strong>{t("shipments.other_service")}:</Text>
                      </Col>
                      <Col xs={24} md={18}>
                        <Space wrap align="start">
                          {importNoGroupServices.map((service: any) => (
                            <Checkbox key={service.code} value={service.code}>
                              {service.name}
                            </Checkbox>
                          ))}
                        </Space>
                        {renderImportServiceDescriptions(importNoGroupServices)}
                      </Col>
                    </Row>
                  )}
                  {importVisibleGroups.map((group: any) => {
                    const groupServices = getShipmentServicesInGroup(
                      importServiceOptions,
                      group.code,
                    );

                    return (
                      <Row key={group.code} gutter={[16, 8]}>
                        <Col xs={24} md={6}>
                          <Text strong>{group.name}:</Text>
                        </Col>
                        <Col xs={24} md={18}>
                          <Space wrap align="start">
                            {groupServices.map((service: any) => (
                              <Checkbox key={service.code} value={service.code}>
                                {service.name}
                              </Checkbox>
                            ))}
                          </Space>
                          {renderImportServiceDescriptions(groupServices)}
                        </Col>
                      </Row>
                    );
                  })}
                </Space>
              </Checkbox.Group>
            </Form.Item>
          </Form>
        </Space>
      </Modal>

      <Modal
        title={t("modal.confirm_pin")}
        open={exportOpen}
        okText={t("cartCheckout.confirm")}
        cancelText={t("cartCheckout.cancel")}
        confirmLoading={exportMutation.isPending}
        onOk={handleExport}
        onCancel={closeExportModal}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text>{t("cartCheckout.please_input_pin")}</Text>
          <Input.Password
            autoFocus
            value={exportSecret}
            placeholder={t("shipments.input_pin")}
            status={exportError ? "error" : undefined}
            onChange={(event) => {
              setExportSecret(event.target.value);
              setExportError("");
            }}
            onPressEnter={handleExport}
          />
          {exportError && <Text type="danger">{exportError}</Text>}
          <Text type="secondary">{t("cartCheckout.default_pin")}</Text>
        </Space>
      </Modal>
    </Space>
  );
};

export const ShipmentsStyleDefault = () => {
  const logic = useShipmentsPage();
  return <ShipmentsView logic={logic} />;
};

export const Shipments = ShipmentsStyleDefault;

export default ShipmentsStyleDefault;
