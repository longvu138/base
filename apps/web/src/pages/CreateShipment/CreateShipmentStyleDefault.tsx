import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  Divider,
  Empty,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Radio,
  Row,
  Select,
  Skeleton,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  GlobalOutlined,
  HomeOutlined,
  MessageOutlined,
  PhoneOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { ProfileAddressModal } from "../Profile/ProfileAddressModal";
import {
  addressLocation,
  type CreateShipmentPageLogic,
  money,
  sortByPosition,
  useCreateShipmentPage,
} from "./hooks/useCreateShipmentPage";

const { Text, Title } = Typography;

export type CreateShipmentUiStyle = "style-default" | "style-thanhla" | "style-gobiz";

interface CreateShipmentViewProps {
  uiStyle?: CreateShipmentUiStyle;
  logic: CreateShipmentPageLogic;
}

export const CreateShipmentView = ({ uiStyle = "style-default", logic }: CreateShipmentViewProps) => {
  const pageLogic = logic;
  const {
    t,
    form,
    profile,
    addressData,
    addressModalOpen,
    addressFormOpen,
    addressDraftSelection,
    editingAddress,
    selectedAddress,
    selectedAddressItem,
    selectedServices,
    selectedServiceObjects,
    selectedWarehouse,
    serviceOptions,
    visibleGroups,
    serviceGroupErrors,
    draftShipment,
    fees,
    trackingError,
    isAddressLoading,
    isLoading,
    createDraftMutation,
    createShipmentMutation,
    deleteAddressMutation,
    updateProfileMutation,
    expectedPackagesValue,
    refTrackingNumbersValue,
    refShipmentCodeValue,
    refCustomerCodeValue,
    noteValue,
    notification,
    editingFinancialFields,
    finishFinancialFieldEditing,
    isEmptyField,
    setFinancialFieldEditing,
    setAddressModalOpen,
    setAddressDraftSelection,
    setSelectedWarehouse,
    setTrackingError,
    openAddressList,
    openAddressForm,
    closeAddressForm,
    handleAddressFormSuccess,
    confirmAddressSelection,
    deleteAddress,
    validateTrackingNumbers,
    isServiceDisabled,
    onServiceToggle,
    onSaveDraftServicesChange,
    submit,
  } = pageLogic;
  const isStyleThanhla = uiStyle === "style-thanhla";
  const isStyleGobiz = uiStyle === "style-gobiz";
  const cardStyle = isStyleThanhla
    ? { borderRadius: 4, borderColor: "#d9d9d9" }
    : isStyleGobiz
      ? { borderRadius: 0, boxShadow: "none" }
      : undefined;
  const pageSpaceSize = isStyleGobiz ? 12 : 16;

  const renderAddressBox = (address: any) => (
    <Card size="small" style={cardStyle}>
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Flex justify="space-between" gap={12} align="flex-start">
          <Text strong>
            {address.fullname || address.fullName || address.contactName || "---"}{" "}
            {address.addressName || address.label ? (
              <Text type="secondary">({address.addressName || address.label})</Text>
            ) : null}
          </Text>
          <Button type="link" size="small" onClick={openAddressList}>
            {t("customerAddress.btn_edit")}
          </Button>
        </Flex>
        <Space align="start">
          <HomeOutlined />
          <Text>{address.detail || address.address || "---"}</Text>
        </Space>
        <Space align="start">
          <PhoneOutlined />
          <Text>{address.phone || address.contactPhone || "---"}</Text>
        </Space>
        <Space align="start">
          <GlobalOutlined />
          <Text>{addressLocation(address) || "---"}</Text>
        </Space>
        {address.note && (
          <Space align="start">
            <MessageOutlined />
            <Text>{address.note}</Text>
          </Space>
        )}
      </Space>
    </Card>
  );

  const renderFieldValue = (label: ReactNode, value: any, name: string) => (
    <div style={{ marginBottom: 15 }}>
      <Text type="secondary" strong>{label}:</Text>{" "}
      <Text type="secondary" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {name === "expectedPackages" ? money(value) : value}
      </Text>{" "}
      <EditOutlined
        style={{ color: "#1677ff", cursor: "pointer" }}
        onClick={() => setFinancialFieldEditing(name, true)}
      />
    </div>
  );

  const renderEditableInput = (
    name: string,
    label: ReactNode,
    value: any,
    input: ReactNode,
  ) => {
    const isEditing = editingFinancialFields[name] || isEmptyField(value);
    if (!isEditing) return renderFieldValue(label, value, name);
    return <div style={{ marginBottom: 15 }}>{input}</div>;
  };

  const personalNoteLabel = (
    <Space size={4}>
      <span>{t("shipments.personal_note")}</span>
      <Tooltip title={t("shipments.personal_note_content")}>
        <QuestionCircleOutlined style={{ color: "#1677ff" }} />
      </Tooltip>
    </Space>
  );

  const renderServiceDescription = (service: any) => {
    const requiresMissing = Array.isArray(service.requires)
      ? service.requires.filter((code: string) => !selectedServices.includes(code))
      : [];
    const requireGroupsMissing = Array.isArray(service.requireGroups)
      ? service.requireGroups.filter((groupCode: string) => !selectedServiceObjects.some((item: any) => item.serviceGroup?.code === groupCode))
      : [];

    if (!selectedServices.includes(service.code)) return null;

    return (
      <Space direction="vertical" size={4} style={{ display: "flex", margin: "0 0 8px 24px" }}>
        {requiresMissing.length > 0 && (
          <Text type="danger">
            <ExclamationCircleOutlined /> {t("shipments.service_requires")} {requiresMissing.join(", ")}
          </Text>
        )}
        {requireGroupsMissing.length > 0 && (
          <Text type="danger">
            <ExclamationCircleOutlined /> {t("shipments.service_group_requires")} {requireGroupsMissing.join(", ")}
          </Text>
        )}
        {service.description && (
          <Text type="secondary">{service.name}: {service.description}</Text>
        )}
        {service.needApprove && (
          <Text type="warning">{t("shipments.service_need_approve", { service: service.name })}</Text>
        )}
      </Space>
    );
  };

  const renderServiceCheckbox = (service: any) => (
    <Space key={service.code} direction="vertical" size={4}>
      <Checkbox
        checked={selectedServices.includes(service.code)}
        disabled={isServiceDisabled(service)}
        onChange={(event) => onServiceToggle(service, event.target.checked)}
      >
        {service.name}
      </Checkbox>
      {renderServiceDescription(service)}
    </Space>
  );

  const renderServiceGroup = (group: any) => {
    const groupServices = sortByPosition(serviceOptions.filter((service: any) => service.serviceGroup?.code === group.code));
    if (!groupServices.length) return null;
    const current = groupServices.find((service: any) => selectedServices.includes(service.code));

    return (
      <Row key={group.code} gutter={[16, 8]}>
        <Col xs={24} md={6}>
          <Text strong>{group.name}:</Text>
        </Col>
        <Col xs={24} md={18}>
          {group.single && group.required ? (
            <>
              <Radio.Group
                value={current?.code || null}
                onChange={(event) => {
                  const service = groupServices.find((item: any) => item.code === event.target.value);
                  if (service) onServiceToggle(service, true);
                }}
              >
                <Space wrap align="start">
                  {groupServices.map((service: any) => (
                    <Radio key={service.code} value={service.code} disabled={isServiceDisabled(service)}>
                      {service.name}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
              {groupServices.map(renderServiceDescription)}
            </>
          ) : (
            <Space wrap align="start">
              {groupServices.map(renderServiceCheckbox)}
            </Space>
          )}
          {serviceGroupErrors[group.code] && (
            <Text type="danger">
              <ExclamationCircleOutlined /> {t("shipments.choose_group_error")} {group.name}
            </Text>
          )}
        </Col>
      </Row>
    );
  };

  const addressColumns = [
    {
      title: "",
      key: "radio",
      width: 48,
      render: (_: any, record: any) => <Radio value={record.id} />,
    },
    {
      title: t("customerAddress.fullname"),
      dataIndex: "fullname",
      key: "fullname",
      render: (_: any, record: any) => record.fullname || record.fullName || record.contactName || "---",
    },
    {
      title: t("customerAddress.phone"),
      dataIndex: "phone",
      key: "phone",
      render: (_: any, record: any) => record.phone || record.contactPhone || "---",
    },
    {
      title: t("customerAddress.zipCode"),
      dataIndex: "zipCode",
      key: "zipCode",
      render: (value: string) => value || "---",
    },
    {
      title: t("customerAddress.addressName"),
      dataIndex: "addressName",
      key: "addressName",
      render: (_: any, record: any) => record.addressName || record.label || "---",
    },
    {
      title: t("customerAddress.address"),
      dataIndex: "detail",
      key: "detail",
      render: (_: any, record: any) => (
        <Space direction="vertical" size={2}>
          <Text>{record.detail || record.address || "---"}</Text>
          <Text type="secondary">{addressLocation(record) || "---"}</Text>
        </Space>
      ),
    },
    {
      title: "",
      key: "defaultAddress",
      width: 100,
      render: (_: any, record: any) =>
        record.defaultAddress ? <Tag color="green">{t("customerAddress.default")}</Tag> : null,
    },
    {
      title: "",
      key: "action",
      width: 120,
      render: (_: any, record: any) => (
        <Space split={<Divider type="vertical" />}>
          <Button
            type="link"
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              openAddressForm(record);
            }}
          >
            {t("button.edit")}
          </Button>
          {!record.defaultAddress && (
            <Popconfirm
              title={t("message.delete_confirm")}
              okText={t("button.yes")}
              cancelText={t("button.no")}
              okButtonProps={{ loading: deleteAddressMutation.isPending }}
              onConfirm={() => deleteAddress(record)}
            >
              <Button
                type="link"
                danger
                size="small"
                onClick={(event) => event.stopPropagation()}
              >
                {t("button.delete")}
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Spin spinning={createDraftMutation.isPending || createShipmentMutation.isPending}>
      <Space direction="vertical" size={pageSpaceSize} style={{ width: "100%" }}>
        <Link to="/shipments">
          <Space>
            <ArrowLeftOutlined />
            <span>{t("shipments.list_title")}</span>
          </Space>
        </Link>

        <Flex justify="space-between" align="center" wrap gap={16}>
          <Title level={3} style={{ margin: 0 }}>{t("shipments.create_shipment")}</Title>
        </Flex>

        {isLoading ? (
          <Card style={cardStyle}><Skeleton active /></Card>
        ) : (
          <Row gutter={[20, 20]}>
            <Col xs={24} lg={16}>
              <Space direction="vertical" size={pageSpaceSize} style={{ width: "100%" }}>
                <Card
                  style={cardStyle}
                  title={
                    <Flex justify="space-between" align="center" gap={16} wrap>
                      <Text strong>{t("shipments.choose_service")}</Text>
                      <Checkbox
                        checked={!!profile?.customerAuthorities?.draftServicesEnable}
                        disabled={updateProfileMutation.isPending}
                        onChange={(event) => onSaveDraftServicesChange(event.target.checked)}
                      >
                        <Text>{t("shipments.save_draft_shipment")}</Text>
                      </Checkbox>
                    </Flex>
                  }
                >
                  <Space direction="vertical" size={pageSpaceSize} style={{ width: "100%" }}>
                    {serviceOptions.some((service: any) => !service.serviceGroup) && (
                      <Row gutter={[16, 8]}>
                        <Col xs={24} md={6}>
                          <Text strong>{t("shipments.other_service")}:</Text>
                        </Col>
                        <Col xs={24} md={18}>
                          <Space wrap align="start">
                            {sortByPosition(serviceOptions.filter((service: any) => !service.serviceGroup)).map(renderServiceCheckbox)}
                          </Space>
                        </Col>
                      </Row>
                    )}
                    {visibleGroups.map(renderServiceGroup)}
                  </Space>
                  {!selectedServices.length && (
                    <Text type="danger" style={{ display: "block", marginTop: 12 }}>
                      <ExclamationCircleOutlined /> {t("shipments.choose_service_first")}
                    </Text>
                  )}
                  {serviceGroupErrors.__requires && (
                    <Text type="danger" style={{ display: "block", marginTop: 12 }}>
                      <ExclamationCircleOutlined /> {t("shipments.service_dependency_error")}
                    </Text>
                  )}
                </Card>

                <Collapse defaultActiveKey={["address"]}>
                  <Collapse.Panel
                    key="address"
                    header={<Text strong>{t("customerAddress.delivery_address")}</Text>}
                  >
                    {selectedAddressItem ? (
                      renderAddressBox(selectedAddressItem)
                    ) : (
                      <Empty description={t("customerAddress.no_address")}>
                        <Button type="primary" onClick={() => openAddressForm()}>
                          {t("customerAddress.create_address")}
                        </Button>
                      </Empty>
                    )}
                  </Collapse.Panel>
                </Collapse>

                {Array.isArray(draftShipment?.sourceWarehouses) && draftShipment.sourceWarehouses.length > 0 && (
                  <Collapse defaultActiveKey={["warehouse"]}>
                    <Collapse.Panel
                      key="warehouse"
                      header={<Text strong>{t("shipments.receivingWarehouse")}</Text>}
                    >
                      <Card size="small" style={cardStyle}>
                        <Row align="middle" gutter={[16, 12]}>
                          <Col xs={24} md={4}>
                            <Text strong>{t("shipments.receivingWarehouseDisplayName")}</Text>
                          </Col>
                          <Col xs={24} md={20}>
                            {draftShipment.sourceWarehouses.length <= 3 ? (
                              <Radio.Group
                                value={selectedWarehouse}
                                onChange={(event) => setSelectedWarehouse(event.target.value)}
                              >
                                <Space wrap>
                                  {draftShipment.sourceWarehouses.map((item: any) => (
                                    <Radio key={item.code} value={item.code}>{item.displayName}</Radio>
                                  ))}
                                </Space>
                              </Radio.Group>
                            ) : (
                              <Select
                                value={selectedWarehouse}
                                onChange={setSelectedWarehouse}
                                style={{ width: 150 }}
                                options={draftShipment.sourceWarehouses.map((item: any) => ({
                                  value: item.code,
                                  label: item.displayName,
                                }))}
                              />
                            )}
                          </Col>
                        </Row>
                      </Card>
                    </Collapse.Panel>
                  </Collapse>
                )}
              </Space>
            </Col>

            <Col xs={24} lg={8}>
              <Card style={cardStyle}>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  {fees.map((item: any) => (
                    <Flex key={item.feeType} justify="space-between" gap={12}>
                      <Text type="secondary">- {item.name}</Text>
                      <Text>{money(item.provisionalAmount)}</Text>
                    </Flex>
                  ))}
                  <Divider style={{ margin: "8px 0" }} />
                  <Flex justify="space-between" gap={12}>
                    <Text strong>{t("shipments.provisional_fee")}</Text>
                    <Text strong>{money(draftShipment?.totalFee)}</Text>
                  </Flex>

                  <Form form={form} layout="vertical">
                    {renderEditableInput(
                      "expectedPackages",
                      t("shipments.expectedPackages"),
                      expectedPackagesValue,
                      <Form.Item name="expectedPackages" noStyle>
                        <InputNumber
                          min={0}
                          precision={0}
                          placeholder={t("shipments.expectedPackages")}
                          style={{ width: "100%" }}
                          onBlur={() => finishFinancialFieldEditing("expectedPackages", form.getFieldValue("expectedPackages"))}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              finishFinancialFieldEditing("expectedPackages", form.getFieldValue("expectedPackages"));
                            }
                          }}
                        />
                      </Form.Item>,
                    )}

                    {renderEditableInput(
                      "refTrackingNumbers",
                      t("shipments.tracking_numbers"),
                      refTrackingNumbersValue,
                      <>
                        <Form.Item
                          name="refTrackingNumbers"
                          noStyle
                          validateStatus={trackingError ? "error" : undefined}
                          help={trackingError ? t("shipments.invalid_tracking_numbers") : undefined}
                        >
                          <Input.TextArea
                            rows={3}
                            placeholder={t("shipments.tracking_numbers")}
                            onChange={(event) => {
                              const valid = /^[a-zA-Z0-9.,:_\-\s]*$/.test(event.target.value || "");
                              setTrackingError(!valid);
                              if (!valid) {
                                notification.error({
                                  message: t("shipments.invalid_tracking_numbers"),
                                  key: "errorTrackingnumber",
                                });
                              }
                            }}
                            onBlur={(event) => {
                              const value = event.target.value.trim();
                              form.setFieldValue("refTrackingNumbers", value);
                              validateTrackingNumbers(value);
                              finishFinancialFieldEditing("refTrackingNumbers", value);
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                const value = form.getFieldValue("refTrackingNumbers");
                                validateTrackingNumbers(value);
                                finishFinancialFieldEditing("refTrackingNumbers", value);
                              }
                            }}
                          />
                        </Form.Item>
                        <Text type="secondary" italic style={{ fontSize: 12 }}>
                          {t("shipments.tracking_numbers_hint")}
                        </Text>
                      </>,
                    )}

                    {renderEditableInput(
                      "refShipmentCode",
                      t("shipments.filters.your_order_code"),
                      refShipmentCodeValue,
                      <Form.Item name="refShipmentCode" noStyle>
                        <Input
                          maxLength={1000}
                          placeholder={t("shipments.filters.your_order_code")}
                          onBlur={(event) => {
                            const value = event.target.value.trim();
                            form.setFieldValue("refShipmentCode", value);
                            finishFinancialFieldEditing("refShipmentCode", value);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              finishFinancialFieldEditing("refShipmentCode", form.getFieldValue("refShipmentCode"));
                            }
                          }}
                        />
                      </Form.Item>,
                    )}

                    {renderEditableInput(
                      "refCustomerCode",
                      t("shipments.filters.your_customer_code"),
                      refCustomerCodeValue,
                      <Form.Item name="refCustomerCode" noStyle>
                        <Input
                          maxLength={1000}
                          placeholder={t("shipments.filters.your_customer_code")}
                          onBlur={(event) => {
                            const value = event.target.value.trim();
                            form.setFieldValue("refCustomerCode", value);
                            finishFinancialFieldEditing("refCustomerCode", value);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              finishFinancialFieldEditing("refCustomerCode", form.getFieldValue("refCustomerCode"));
                            }
                          }}
                        />
                      </Form.Item>,
                    )}

                    {editingFinancialFields.note ? (
                      <div style={{ marginTop: 10 }}>
                        <Form.Item name="note" noStyle>
                          <Input.TextArea
                            autoSize={{ minRows: 1, maxRows: 3 }}
                            maxLength={1000}
                            placeholder={t("shipments.personal_note")}
                            onBlur={(event) => {
                              const value = event.target.value.trim();
                              form.setFieldValue("note", value);
                              finishFinancialFieldEditing("note", value);
                            }}
                            onKeyDown={(event) => {
                              if ((event.metaKey || event.shiftKey || event.altKey || event.ctrlKey) && event.key === "Enter") {
                                finishFinancialFieldEditing("note", form.getFieldValue("note"));
                              }
                            }}
                          />
                        </Form.Item>
                        <Text type="secondary" style={{ display: "block", marginTop: 5, fontSize: 12 }}>
                          {t("shipments.manipulation_note")}
                        </Text>
                      </div>
                    ) : noteValue ? (
                      renderFieldValue(personalNoteLabel, noteValue, "note")
                    ) : (
                      <Button type="link" style={{ padding: 0 }} onClick={() => setFinancialFieldEditing("note", true)}>
                        {personalNoteLabel}
                      </Button>
                    )}
                  </Form>

                  <Button
                    type="primary"
                    block
                    size="large"
                    disabled={!draftShipment?.id || !selectedAddress || trackingError}
                    loading={createShipmentMutation.isPending}
                    onClick={submit}
                  >
                    {t("shipments.create_shipment")}
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        )}

        <Modal
          title={
            <Space>
              <span>{t("customerAddress.address_list")}</span>
              <Button type="link" onClick={() => openAddressForm()}>
                {t("customerAddress.new_address")}
              </Button>
            </Space>
          }
          open={addressModalOpen}
          onCancel={() => setAddressModalOpen(false)}
          onOk={confirmAddressSelection}
          okText={t("button.yes").toUpperCase()}
          cancelText={t("button.cancel").toUpperCase()}
          confirmLoading={createDraftMutation.isPending}
          width={1100}
        >
          <Radio.Group
            value={addressDraftSelection}
            onChange={(event) => setAddressDraftSelection(event.target.value)}
            style={{ width: "100%" }}
          >
            <Table
              rowKey="id"
              columns={addressColumns}
              dataSource={addressData?.data || []}
              loading={isAddressLoading}
              locale={{ emptyText: <Empty description={t("customerAddress.no_address")} /> }}
              pagination={{ hideOnSinglePage: true, pageSize: 5, simple: true }}
              onRow={(record) => ({
                onClick: () => setAddressDraftSelection(record.id),
              })}
            />
          </Radio.Group>
        </Modal>

        <ProfileAddressModal
          open={addressFormOpen}
          onClose={closeAddressForm}
          onSuccess={handleAddressFormSuccess}
          initialValues={editingAddress}
          isEdit={!!editingAddress}
          isReceivingAddress={false}
          gobizMode
        />
      </Space>
    </Spin>
  );
};

export const CreateShipmentStyleDefault = () => {
  const logic = useCreateShipmentPage();

  return <CreateShipmentView uiStyle="style-default" logic={logic} />;
};

export const CreateShipment = CreateShipmentStyleDefault;

export default CreateShipmentStyleDefault;
