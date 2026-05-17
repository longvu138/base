import { useState } from "react";
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
  Typography,
  Upload,
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
} from "@ant-design/icons";
import { useShipmentMilestonesQuery } from "@repo/hooks";
import { FilterPanel } from "@repo/ui";
import { useShipmentsPage } from "./hooks/useShipmentsPage";

const { Text } = Typography;

const formatDate = (value?: string) =>
  value ? dayjs(value).format("HH:mm DD/MM/YYYY") : "---";

const formatNumber = (value?: number | string) => {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue)
    ? new Intl.NumberFormat("vi-VN").format(numericValue)
    : "0";
};

const formatMoney = (value?: number | string, currency?: string) => {
  const suffix = currency ? ` ${currency}` : "";
  return `${formatNumber(value)}${suffix}`;
};

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
  const { data: milestones = [], isLoading } = useShipmentMilestonesQuery(open ? code : "");
  const currentStatus = statusData.find((item: any) => item.code === status) || {};

  return (
    <Popover
      trigger="click"
      placement="left"
      open={open}
      onOpenChange={setOpen}
      content={
        <Space direction="vertical" size={0} style={{ width: 360, maxWidth: "calc(100vw - 48px)" }}>
          {isLoading ? (
            <Flex justify="center" align="center" style={{ minHeight: 140 }}>
              <Spin />
            </Flex>
          ) : Array.isArray(milestones) && milestones.length > 0 ? (
            <div style={{ maxHeight: 320, overflowY: "auto", paddingInlineEnd: 8, paddingTop: 4 }}>
              <Timeline
                items={milestones.map((item: any, index: number) => {
                  const milestoneStatus = statusData.find((statusItem: any) => statusItem.code === item.status);
                  const handlingTime =
                    item.handlingTime === null || item.handlingTime === undefined
                      ? t("shipments.undefined_handling_time")
                      : `${item.handlingTime} ${Number(item.handlingTime) > 1 ? t("shipments.days") : t("shipments.day")}`;
                  return {
                    color: index === 0 ? "green" : "gray",
                    style: index === milestones.length - 1 ? { paddingBottom: 0 } : undefined,
                    children: (
                      <Space direction="vertical" size={2}>
                        <Text strong>{milestoneStatus?.name || item.status || "---"}</Text>
                        <Text type="secondary">{formatDate(item.timestamp)}</Text>
                        <Text type="secondary">({handlingTime})</Text>
                      </Space>
                    ),
                  };
                })}
              />
            </div>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("common.no_data")} style={{ margin: 0 }} />
          )}
        </Space>
      }
    >
      <Tag color={currentStatus?.color || "processing"} style={{ cursor: "pointer" }}>
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
  const {
    t,
    form,
    page,
    pageSize,
    setPage,
    setPageSize,
    shipmentData,
    isShipmentLoading,
    statusData,
    servicesData,
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

  const renderMetric = (label: string, value?: React.ReactNode, tooltip?: string) => (
    <Space direction="vertical" size={2}>
      <Text type="secondary">
        {label}
        {tooltip && <QuestionCircleOutlined style={{ marginLeft: 6 }} title={tooltip} />}
      </Text>
      <Text strong>{value || "---"}</Text>
    </Space>
  );

  const renderLine = (label: string, value?: React.ReactNode) => (
    <Flex gap={8} wrap>
      <Text type="secondary">{label}:</Text>
      <Text>{value || "---"}</Text>
    </Flex>
  );

  const renderShipmentItem = (item: any) => {
    const waybill = getFirstValue(item, ["wayBill", "waybillCode"]);
    const merchant = getFirstValue(item, ["merchantName", "shopName"]);
    const refShipmentCode = getFirstValue(item, ["refShipmentCode", "orderCode"]);
    const warehouseName =
      item.receivingWarehouse?.displayName ||
      item.receivingWarehouseDisplayName ||
      item.warehouseName;
    const waybillCodes =
      Array.isArray(item.waybillCodes) && item.waybillCodes.length > 0
        ? item.waybillCodes
        : waybill
          ? [waybill]
          : [];
    const serviceNames =
      Array.isArray(item.services) && item.services.length > 0
        ? [...item.services]
          .sort((a: any, b: any) => Number(a.position || 0) - Number(b.position || 0))
          .map((service: any) => service.name || service.code)
        : [];

    return (
      <List.Item style={{ paddingInline: 0 }}>
        <Card
          size="small"
          style={{ width: "100%" }}
          title={
            <Flex justify="space-between" align="center" gap={12} wrap>
              <Space wrap split={<Divider type="vertical" />}>
                <Typography.Paragraph copyable={{ text: item.code }} style={{ marginBottom: 0 }}>
                  <Link to={`/shipments/${item.code}`}>
                    <Text strong type="success">#{item.code}</Text>
                  </Link>
                </Typography.Paragraph>
                <Space size={6}>
                  <ShopOutlined />
                  <Text>{merchant || item.merchantCode || "---"}</Text>
                </Space>
                {warehouseName && (
                  <Text>
                    {t("shipments.columns.warehouse")}: <Text strong>{warehouseName}</Text>
                  </Text>
                )}
              </Space>
              <ShipmentStatusPopover code={item.code} status={item.status} statusData={statusData} t={t} />
            </Flex>
          }
        >
          <Space direction="vertical" size={0} style={{ width: "100%" }} split={<Divider style={{ margin: "12px 0" }} />}>
            {renderLine(
              t("shipments.columns.waybill"),
              waybillCodes.length > 0 ? (
                <Space wrap split={<Text type="secondary">|</Text>}>
                  {waybillCodes.map((code: string) => <Text key={code}>{code}</Text>)}
                </Space>
              ) : undefined,
            )}
            {renderLine(t("shipments.filters.your_order_code"), refShipmentCode)}
            {renderLine(
              t("shipments.filters.services"),
              serviceNames.length > 0 ? (
                <Space wrap split={<Text type="secondary">|</Text>}>
                  {serviceNames.map((name: string) => <Text key={name}>{name}</Text>)}
                </Space>
              ) : undefined,
            )}
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={5}>
                <Space>
                  <Link to={`/shipments/${item.code}`}>
                    <Avatar shape="square" src={item.image} icon={!item.image ? <InboxOutlined /> : undefined} size={36} />
                  </Link>
                  {renderMetric(
                    t("shipments.columns.quantity"),
                    `${formatNumber(item.totalProducts)} / ${formatNumber(item.receivedQuantity)}`,
                    t("shipments.columns.received_quantity_hint"),
                  )}
                </Space>
              </Col>
              <Col xs={12} md={4}>{renderMetric(t("shipments.columns.total_value"), formatMoney(item.totalValue, item.currency))}</Col>
              <Col xs={12} md={4}>{renderMetric(t("shipments.columns.total_fee"), formatMoney(item.totalFee))}</Col>
              <Col xs={12} md={4}>{renderMetric(t("shipments.columns.total_unpaid"), formatMoney(item.totalUnpaid))}</Col>
              <Col xs={12} md={4}>{renderMetric(t("shipments.columns.timestamp"), formatDate(item.timestamp || item.createdAt))}</Col>
              <Col xs={12} md={5}>{renderMetric(t("shipments.columns.packages"), formatNumber(item.totalPackages))}</Col>
              <Col xs={12} md={5}>{renderMetric(t("shipments.columns.weight"), item.actualWeight ? `${item.actualWeight}kg` : undefined)}</Col>
              {item.originalReceiptCode && (
                <Col xs={24} md={8}>{renderMetric(t("shipments.filters.original_invoice"), item.originalReceiptCode)}</Col>
              )}
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
            <Space direction="vertical" size={pageGap} style={{ width: "100%" }}>
              <Form.Item name="statuses" label={t("shipments.filters.status")} style={{ marginBottom: 0 }}>
                <Checkbox.Group>
                  <Space wrap>
                    {statusOptions.map((option: any) => (
                      <Checkbox key={option.value} value={option.value}>
                        {option.label} ({option.count})
                      </Checkbox>
                    ))}
                  </Space>
                </Checkbox.Group>
              </Form.Item>

              <Row gutter={[16, 8]}>
                <Col xs={24} md={8}>
                  <Form.Item name="query" label={t("shipments.filters.code")} style={{ marginBottom: 0 }}>
                    <Input allowClear placeholder={t("shipments.search_placeholder")} onPressEnter={handleSearch} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={16}>
                  <Form.Item label={t("shipments.filters.created_at")} style={{ marginBottom: 0 }}>
                    <Row gutter={[12, 8]}>
                      <Col xs={24} md={12}>
                        <Form.Item name="timestampFrom" noStyle>
                          <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder={t("orders.filters.start_date")} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="timestampTo" noStyle>
                          <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder={t("orders.filters.end_date")} />
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
              <Space direction="vertical" size={pageGap} style={{ width: "100%" }}>
                <Row gutter={[16, 8]}>
                  <Col xs={24} md={8}><Form.Item name="originalReceiptCode" label={t("shipments.filters.original_invoice")} style={{ marginBottom: 0 }}><Input allowClear /></Form.Item></Col>
                  <Col xs={24} md={8}><Form.Item name="wayBill" label={t("shipments.filters.waybill")} style={{ marginBottom: 0 }}><Input allowClear /></Form.Item></Col>
                  <Col xs={24} md={8}><Form.Item name="merchantName" label={t("shipments.filters.shop_name")} style={{ marginBottom: 0 }}><Input allowClear /></Form.Item></Col>
                  <Col xs={24} md={12}><Form.Item name="refShipmentCode" label={t("shipments.filters.your_order_code")} style={{ marginBottom: 0 }}><Input allowClear /></Form.Item></Col>
                  <Col xs={24} md={12}><Form.Item name="refCustomerCode" label={t("shipments.filters.your_customer_code")} style={{ marginBottom: 0 }}><Input allowClear /></Form.Item></Col>
                </Row>

                {isServicesLoading ? (
                  <Skeleton active paragraph={{ rows: 1 }} title={false} />
                ) : (
                  <Form.Item name="services" label={t("shipments.filters.services")} style={{ marginBottom: 0 }}>
                    <Checkbox.Group>
                      <Space wrap>
                        {(servicesData || []).map((service: any) => (
                          <Checkbox key={service.code} value={service.code}>{service.name}</Checkbox>
                        ))}
                      </Space>
                    </Checkbox.Group>
                  </Form.Item>
                )}

                <Row gutter={[16, 8]}>
                  <Col xs={24} md={6}>
                    <Form.Item name="cutOffStatus" label={t("shipments.filters.stuck_at")} style={{ marginBottom: 0 }}>
                      <Select allowClear showSearch optionFilterProp="label" options={(statusData || []).map((status: any) => ({ label: status.name, value: status.code }))} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item name="typeSearch" label={t("shipments.filters.period")} style={{ marginBottom: 0 }}>
                      <Select
                        allowClear
                        options={[
                          { label: t("orders.filters.time_range"), value: "range" },
                          { label: t("orders.filters.cut_off_equal"), value: "equal" },
                          { label: t("orders.filters.cut_off_from"), value: "from" },
                          { label: t("orders.filters.cut_off_to"), value: "to" },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}><Form.Item name="handlingTimeFrom" label={t("shipments.filters.from")} style={{ marginBottom: 0 }}><Input allowClear type="number" /></Form.Item></Col>
                  <Col xs={24} md={6}><Form.Item name="handlingTimeTo" label={t("shipments.filters.to")} style={{ marginBottom: 0 }}><Input allowClear type="number" /></Form.Item></Col>
                  <Col span={24}>
                    <Form.Item name="existsProduct" valuePropName="checked" style={{ marginBottom: 0 }}>
                      <Checkbox>{t("shipments.filters.lack_product_info")}</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
              </Space>
            </div>
          }
        />
      </Card>

      <Card
        title={<Space><FileSearchOutlined /><span>{t("shipments.list_title")}</span><Tag>{formatNumber(total)}</Tag></Space>}
        extra={
          <Space wrap>
            <Button type="primary" icon={<UploadOutlined />} onClick={() => setImportOpen(true)}>{t("shipments.import_excel")}</Button>
            <Button icon={<DownloadOutlined />} onClick={() => setExportOpen(true)}>{t("shipments.export_excel")}</Button>
            <Link to="/shipments/create"><Button type="primary" icon={<PlusOutlined />}>{t("shipments.create_shipment")}</Button></Link>
          </Space>
        }
      >
        <List
          dataSource={shipmentData?.data || []}
          loading={isShipmentLoading}
          rowKey={(record: any) => record.id || record.code}
          renderItem={renderShipmentItem}
          locale={{ emptyText: <Empty description={t("shipments.empty_list")} /> }}
        />

        <Flex justify="flex-end" style={{ marginTop: 16 }}>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            showSizeChanger
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
            <a href="//cdn.gobiz.vn/Import_shipment_template.xlsx" download>{t("shipments.download_template")}</a>
            <Space>
              <Button onClick={closeImportModal}>{t("button.cancel")}</Button>
              <Button type="primary" onClick={handleImport} disabled={!importFile || importFileErrors.length > 0 || importValidating} loading={importMutation.isPending || importValidating}>
                {t("cartCheckout.confirm")}
              </Button>
            </Space>
          </Flex>
        }
      >
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Upload.Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon"><UploadOutlined /></p>
            <p className="ant-upload-text">{t("shipments.import_upload_text")}</p>
          </Upload.Dragger>
          {importFileErrors.length > 0 && (
            <Space direction="vertical" size={8} style={{ width: "100%", maxHeight: 240, overflowY: "auto", paddingRight: 8 }}>
              {importFileErrors.map((error) => <Text key={error} type="danger">{error}</Text>)}
            </Space>
          )}
          {importBackendErrors.length > 0 && (
            <Alert type="error" showIcon message={t("shipments.error_cell")} description={importBackendErrors.join(", ")} />
          )}
          <Form layout="vertical">
            <Form.Item label={t("shipments.filters.services")} style={{ marginBottom: 0 }}>
              <Checkbox.Group value={importServices} onChange={(value) => setImportServices(value as string[])}>
                <Space wrap>
                  {(servicesData || []).map((service: any) => (
                    <Checkbox key={service.code} value={service.code}>{service.name}</Checkbox>
                  ))}
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
