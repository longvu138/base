import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Collapse,
  Divider,
  Empty,
  Flex,
  Modal,
  Popconfirm,
  Radio,
  Row,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  theme,
} from "antd";
import {
  GlobalOutlined,
  HomeOutlined,
  MessageOutlined,
  PhoneOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import {
  useCheckAddressWarehouseMutation,
  useDeleteAddressMutation,
} from "@repo/hooks";
import { useTranslation } from "@repo/i18n";
import { ProfileAddressModal } from "../../Profile/ProfileAddressModal";

const getAddressName = (address: any) =>
  address?.fullname || address?.fullName || address?.contactName || "---";

const getAddressPhone = (address: any) =>
  address?.phone || address?.contactPhone || "---";

const getAddressDetail = (address: any) =>
  address?.detail || address?.address || "---";

const getAddressLocation = (address: any) =>
  address?.location?.display ||
  [
    address?.wardName || address?.ward,
    address?.districtName || address?.district,
    address?.provinceName || address?.province,
  ]
    .filter(Boolean)
    .join(", ") ||
  "---";

const getAddressZipCode = (address: any) =>
  address?.zipCode || address?.postalCode || "---";

const getAddressLabel = (address: any) =>
  address?.addressName || address?.label || "---";

const getDefaultAddress = (items: any[], receivingMode = false) =>
  (receivingMode
    ? items.find(
        (address) =>
          address.receivingAddress &&
          (address.defaultAddress || address.isDefault),
      )
    : null) ||
  items.find((address) => address.defaultAddress || address.isDefault) ||
  items[0];

type DeliveryAddressPanelProps = {
  addresses: any[];
  receivingAddresses?: any[];
  isAddressesFetching?: boolean;
  isReceivingAddressesFetching?: boolean;
  isUpdating: boolean;
  selectedAddressData?: any;
  selectedAddressId?: string | number;
  selectedReceiveAddressData?: any;
  selectedReceiveAddressId?: string | number;
  isUsingReceiveAddress?: boolean;
  onSelectAddress: (addressId: string | number) => Promise<unknown> | void;
  onSelectReceiveAddress?: (addressId: string | number) => Promise<unknown> | void;
  onRemoveReceiveAddress?: () => Promise<unknown> | void;
};

export const DeliveryAddressPanel = ({
  addresses,
  receivingAddresses = [],
  isAddressesFetching = false,
  isReceivingAddressesFetching = false,
  isUpdating,
  selectedAddressData,
  selectedAddressId,
  selectedReceiveAddressData,
  selectedReceiveAddressId,
  isUsingReceiveAddress = false,
  onSelectAddress,
  onSelectReceiveAddress,
  onRemoveReceiveAddress,
}: DeliveryAddressPanelProps) => {
  const { t } = useTranslation();
  const { notification } = App.useApp();
  const { token } = theme.useToken();
  const deleteAddressMutation = useDeleteAddressMutation();
  const { mutateAsync: checkAddressWarehouseAsync } =
    useCheckAddressWarehouseMutation();
  const [selectOpen, setSelectOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [checkWarehouse, setCheckWarehouse] = useState<any>({});
  const [modalMode, setModalMode] = useState<"delivery" | "receiving">(
    "delivery",
  );
  const [returnToListAfterForm, setReturnToListAfterForm] = useState(false);
  const [pendingAddressId, setPendingAddressId] = useState<
    string | number | undefined
  >(selectedAddressId);
  const autoSelectedAddressRef = useRef<string | number | null>(null);
  const checkedWarehouseAddressRef = useRef<string | number | null>(null);

  const selectedAddress = useMemo(
    () =>
      addresses.find(
        (address) => String(address.id) === String(selectedAddressId),
      ) || selectedAddressData,
    [addresses, selectedAddressData, selectedAddressId],
  );
  const selectedReceiveAddress = useMemo(
    () =>
      receivingAddresses.find(
        (address) => String(address.id) === String(selectedReceiveAddressId),
      ) || selectedReceiveAddressData,
    [receivingAddresses, selectedReceiveAddressData, selectedReceiveAddressId],
  );
  const isReceivingMode = modalMode === "receiving";
  const modalAddresses = isReceivingMode ? receivingAddresses : addresses;
  const selectedModalAddressId = isReceivingMode
    ? selectedReceiveAddressId ||
      getDefaultAddress(receivingAddresses, true)?.id
    : selectedAddressId || getDefaultAddress(addresses)?.id;
  const modalLoading =
    deleteAddressMutation.isPending ||
    (isReceivingMode ? isReceivingAddressesFetching : isAddressesFetching);
  const receiveAddressEnabled =
    isUsingReceiveAddress || !!selectedReceiveAddressId || !!selectedReceiveAddress;
  const activeMode: "delivery" | "receiving" = receiveAddressEnabled
    ? "receiving"
    : "delivery";
  const activeAddresses =
    activeMode === "receiving" ? receivingAddresses : addresses;
  const activeSelectedAddress =
    activeMode === "receiving" ? selectedReceiveAddress : selectedAddress;
  const activeSelectedAddressId =
    activeMode === "receiving" ? selectedReceiveAddressId : selectedAddressId;

  const checkWarehouseByAddress = useCallback(
    async (addressId?: string | number) => {
      if (!addressId) {
        setCheckWarehouse({});
        return;
      }

      try {
        const result = await checkAddressWarehouseAsync(addressId);
        setCheckWarehouse(result || {});
      } catch {
        setCheckWarehouse({});
      }
    },
    [checkAddressWarehouseAsync],
  );

  useEffect(() => {
    if (activeSelectedAddressId || activeAddresses.length === 0) return;
    const defaultAddress = getDefaultAddress(
      activeAddresses,
      activeMode === "receiving",
    );
    if (
      defaultAddress &&
      autoSelectedAddressRef.current !== `${activeMode}:${defaultAddress.id}`
    ) {
      autoSelectedAddressRef.current = `${activeMode}:${defaultAddress.id}`;
      checkWarehouseByAddress(defaultAddress.id);
      if (activeMode === "receiving" && onSelectReceiveAddress) {
        onSelectReceiveAddress(defaultAddress.id);
      } else {
        onSelectAddress(defaultAddress.id);
      }
    }
  }, [
    activeAddresses,
    activeMode,
    activeSelectedAddressId,
    checkWarehouseByAddress,
    onSelectAddress,
    onSelectReceiveAddress,
  ]);

  useEffect(() => {
    const currentAddressId = activeSelectedAddress?.id;
    if (
      !currentAddressId ||
      checkedWarehouseAddressRef.current === currentAddressId
    ) {
      return;
    }
    checkedWarehouseAddressRef.current = currentAddressId;
    checkWarehouseByAddress(currentAddressId);
  }, [activeSelectedAddress?.id, checkWarehouseByAddress]);

  useEffect(() => {
    if (selectOpen) setPendingAddressId(selectedModalAddressId);
  }, [selectOpen, selectedModalAddressId]);

  const openSelectModal = (mode: "delivery" | "receiving") => {
    setModalMode(mode);
    setPendingAddressId(
      mode === "receiving"
        ? selectedReceiveAddressId ||
            getDefaultAddress(receivingAddresses, true)?.id
        : selectedAddressId || getDefaultAddress(addresses)?.id,
    );
    setSelectOpen(true);
  };

  const openAddressForm = (address?: any) => {
    setEditingAddress(address || null);
    setReturnToListAfterForm(selectOpen);
    setSelectOpen(false);
    setCreateOpen(true);
  };

  const closeAddressForm = () => {
    const shouldReturnToList = returnToListAfterForm;
    setCreateOpen(false);
    setEditingAddress(null);
    setReturnToListAfterForm(false);
    if (shouldReturnToList) setSelectOpen(true);
  };

  const handleAddressFormSuccess = async () => {
    const shouldReturnToList = returnToListAfterForm;
    setCreateOpen(false);
    setEditingAddress(null);
    setReturnToListAfterForm(false);
    if (shouldReturnToList) setSelectOpen(true);
    return {} as any;
  };

  const handleAddressSaveSuccess = ({
    isReceivingAddress,
  }: {
    isEdit: boolean;
    isReceivingAddress: boolean;
  }) => {
    if (!isReceivingAddress) return;
    window.setTimeout(() => {
      notification.success({ message: t("message.success") });
    }, 0);
  };

  const handleDeleteAddress = async (address: any) => {
    try {
      await deleteAddressMutation.mutateAsync(Number(address.id));
      notification.success({ message: t("message.delete_success") });

      if (String(selectedAddressId) === String(address.id)) {
        const nextAddress =
          addresses.find(
            (item) =>
              String(item.id) !== String(address.id) &&
              (item.defaultAddress || item.isDefault),
          ) ||
          addresses.find((item) => String(item.id) !== String(address.id));

        if (nextAddress?.id) {
          setPendingAddressId(nextAddress.id);
          await checkWarehouseByAddress(nextAddress.id);
          await onSelectAddress(nextAddress.id);
        }
      } else if (String(selectedReceiveAddressId) === String(address.id)) {
        const nextAddress =
          receivingAddresses.find(
            (item) =>
              String(item.id) !== String(address.id) &&
              (item.defaultAddress || item.isDefault),
          ) ||
          receivingAddresses.find(
            (item) => String(item.id) !== String(address.id),
          );

        if (nextAddress?.id && onSelectReceiveAddress) {
          setPendingAddressId(nextAddress.id);
          await checkWarehouseByAddress(nextAddress.id);
          await onSelectReceiveAddress(nextAddress.id);
        } else {
          await checkWarehouseByAddress(selectedAddressId);
          await onRemoveReceiveAddress?.();
        }
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.response?.data?.title || error?.message;
      if (errorMessage !== "Network fail") {
        notification.error({
          message: errorMessage ? t(errorMessage) : t("message.unconnected_error"),
        });
      }
    }
  };

  const columns = [
    {
      title: "",
      key: "selected",
      className: "_address-list-checkbox",
      width: 48,
      render: (_: unknown, record: any) => (
        <Radio value={record.id} className="_address-radio-btn" />
      ),
    },
    {
      title: t("customerAddress.fullname"),
      key: "fullname",
      render: (_: unknown, record: any) => getAddressName(record),
    },
    {
      title: t("customerAddress.phone"),
      key: "phone",
      render: (_: unknown, record: any) => getAddressPhone(record),
    },
    {
      title: t("customerAddress.zipCode"),
      key: "zipCode",
      render: (_: unknown, record: any) => getAddressZipCode(record),
    },
    {
      title: t("customerAddress.addressName"),
      key: "addressName",
      render: (_: unknown, record: any) => getAddressLabel(record),
    },
    {
      title: t("customerAddress.address"),
      key: "address",
      render: (_: unknown, record: any) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>{getAddressDetail(record)}</Typography.Text>
          <Typography.Text type="secondary">
            {getAddressLocation(record)}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "",
      key: "default",
      width: 110,
      render: (_: unknown, record: any) =>
        record.defaultAddress || record.isDefault ? (
          <Tag color={record.receivingAddress ? "blue" : "green"}>
            {t("customerAddress.default")}
          </Tag>
        ) : null,
    },
    {
      title: "",
      key: "action",
      width: 130,
      render: (_: unknown, record: any) => {
        const isDefaultAddress = record.defaultAddress || record.isDefault;

        return (
          <Space size={0}>
            <Typography.Link
              className="_address-edit-btn"
              onClick={() => openAddressForm(record)}
            >
              {t("button.edit")}
            </Typography.Link>
            {!isDefaultAddress && (
              <>
                <Divider type="vertical" />
                <Popconfirm
                  title={t("message.delete_confirm")}
                  okText={t("button.yes")}
                  cancelText={t("button.no")}
                  okButtonProps={{ loading: deleteAddressMutation.isPending }}
                  onConfirm={() => handleDeleteAddress(record)}
                >
                  <Typography.Link type="danger" className="_address-delete-btn">
                    {t("button.delete")}
                  </Typography.Link>
                </Popconfirm>
              </>
            )}
          </Space>
        );
      },
    },
  ];

  const renderAddressCard = (
    address: any,
    onEdit?: () => void,
    showEdit = true,
  ) => (
    <Card size="small" styles={{ body: { padding: token.paddingMD } }}>
      <Flex justify="space-between" gap={token.marginMD}>
        <Space
          direction="vertical"
          size={token.marginSM}
          style={{ width: "100%" }}
        >
          <Typography.Text strong>
            {getAddressName(address)}{" "}
            {address.addressName && (
              <Typography.Text type="secondary">
                ({address.addressName})
              </Typography.Text>
            )}
          </Typography.Text>
          <Row gutter={[token.marginSM, token.marginXS]}>
            <Col span={3}>
              <HomeOutlined style={{ color: token.colorTextSecondary }} />
            </Col>
            <Col span={21}>{getAddressDetail(address)}</Col>
            <Col span={3}>
              <PhoneOutlined style={{ color: token.colorTextSecondary }} />
            </Col>
            <Col span={21}>{getAddressPhone(address)}</Col>
            <Col span={3}>
              <GlobalOutlined style={{ color: token.colorTextSecondary }} />
            </Col>
            <Col span={21}>{getAddressLocation(address)}</Col>
            {address.note && (
              <>
                <Col span={3}>
                  <MessageOutlined
                    style={{ color: token.colorTextSecondary }}
                  />
                </Col>
                <Col span={21}>{address.note}</Col>
              </>
            )}
          </Row>
        </Space>
        {showEdit && onEdit ? (
          <Typography.Link
            className="_btn-select-address"
            style={{ whiteSpace: "nowrap" }}
            onClick={onEdit}
          >
            {t("customerAddress.btn_edit")}
          </Typography.Link>
        ) : null}
      </Flex>
    </Card>
  );

  return (
    <>
      <Collapse
        defaultActiveKey={["delivery-address"]}
        items={[
          {
            key: "delivery-address",
            label: (
              <Typography.Text strong>
                {t("customerAddress.delivery_address")}
              </Typography.Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: "100%" }}>
                <Flex justify="space-between" align="center">
                  <Space>
                    <Typography.Text strong>
                      {t("customerAddress.receivingAddress")}
                    </Typography.Text>
                    <Tooltip title={t("customerAddress.tooltip")}>
                      <QuestionCircleOutlined
                        style={{ color: token.colorTextSecondary }}
                      />
                    </Tooltip>
                    <Switch
                      checked={receiveAddressEnabled}
                      loading={isUpdating}
                      onChange={(checked) => {
                        if (checked) {
                          openSelectModal("receiving");
                        } else {
                          openSelectModal("delivery");
                        }
                      }}
                    />
                  </Space>
                </Flex>
                {activeSelectedAddress ? (
                  renderAddressCard(activeSelectedAddress, () =>
                    openSelectModal(activeMode),
                  )
                ) : (
                  <Empty description={t("customerAddress.no_address")}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setModalMode(activeMode);
                        openAddressForm();
                      }}
                    >
                      {t("customerAddress.create_address")}
                    </Button>
                  </Empty>
                )}
              </Space>
            ),
          },
        ]}
      />

      <Modal
        className="modalform"
        title={
          <Space>
            <span>{t("customerAddress.address_list")}</span>
            <Typography.Link onClick={() => openAddressForm()}>
              {t("customerAddress.new_address")}
            </Typography.Link>
          </Space>
        }
        open={selectOpen}
        width={1100}
        onCancel={() => setSelectOpen(false)}
        okText={t("button.yes").toUpperCase()}
        cancelText={t("button.cancel").toUpperCase()}
        confirmLoading={isUpdating}
        okButtonProps={{ className: "_btn-list-address-yes" }}
        cancelButtonProps={{ className: "_btn-list-address-cancel" }}
        onOk={async () => {
          const selectedId =
            pendingAddressId || getDefaultAddress(modalAddresses, isReceivingMode)?.id;
          if (!selectedId) return;
          if (isReceivingMode && onSelectReceiveAddress) {
            await checkWarehouseByAddress(selectedId);
            await onSelectReceiveAddress(selectedId);
            notification.success({ message: t("message.success") });
          } else {
            await checkWarehouseByAddress(selectedId);
            await onSelectAddress(selectedId);
          }
          setSelectOpen(false);
        }}
      >
        <Radio.Group
          value={pendingAddressId}
          onChange={(event) => setPendingAddressId(event.target.value)}
          style={{ width: "100%" }}
        >
          <Table
            className="_address-table"
            rowKey="id"
            dataSource={modalAddresses}
            columns={columns}
            loading={modalLoading}
            pagination={{
              hideOnSinglePage: true,
              simple: true,
              size: "default",
              total: modalAddresses.length,
              pageSize: 5,
            }}
            size="middle"
            rowClassName={() => "_address-row"}
            scroll={{ x: 980 }}
          />
        </Radio.Group>
      </Modal>

      <ProfileAddressModal
        open={createOpen}
        onClose={closeAddressForm}
        onSuccess={handleAddressFormSuccess}
        onSaveSuccess={handleAddressSaveSuccess}
        initialValues={editingAddress}
        isEdit={!!editingAddress}
        isReceivingAddress={isReceivingMode}
        gobizMode
      />

      {activeSelectedAddress && checkWarehouse.inWarehouseArea === false ? (
        <Alert
          style={{ marginTop: token.marginSM }}
          message={<Typography.Text strong>{t("order.notification")}</Typography.Text>}
          description={
            <span
              dangerouslySetInnerHTML={{
                __html: t("message.warning_warehouse", {
                  warehouse: checkWarehouse.warehouse,
                }),
              }}
            />
          }
          type="warning"
          showIcon
          closable
        />
      ) : null}
    </>
  );
};
