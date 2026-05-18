import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  Col,
  Collapse,
  Empty,
  Flex,
  Modal,
  Radio,
  Row,
  Space,
  Table,
  Tag,
  Typography,
  theme,
} from "antd";
import {
  EditOutlined,
  GlobalOutlined,
  HomeOutlined,
  MessageOutlined,
  PhoneOutlined,
  PlusOutlined,
} from "@ant-design/icons";
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

type DeliveryAddressPanelProps = {
  addresses: any[];
  isUpdating: boolean;
  selectedAddressData?: any;
  selectedAddressId?: string | number;
  onSelectAddress: (addressId: string | number) => Promise<unknown> | void;
  onRefetchAddresses: () => Promise<unknown>;
};

export const DeliveryAddressPanel = ({
  addresses,
  isUpdating,
  selectedAddressData,
  selectedAddressId,
  onSelectAddress,
  onRefetchAddresses,
}: DeliveryAddressPanelProps) => {
  const { token } = theme.useToken();
  const [selectOpen, setSelectOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingAddressId, setPendingAddressId] = useState<
    string | number | undefined
  >(selectedAddressId);
  const autoSelectedAddressRef = useRef<string | number | null>(null);

  const selectedAddress = useMemo(
    () =>
      addresses.find(
        (address) => String(address.id) === String(selectedAddressId),
      ) || selectedAddressData,
    [addresses, selectedAddressData, selectedAddressId],
  );

  useEffect(() => {
    if (selectedAddressId || addresses.length === 0) return;
    const defaultAddress =
      addresses.find(
        (address) => address.defaultAddress || address.isDefault,
      ) || addresses[0];
    if (
      defaultAddress &&
      autoSelectedAddressRef.current !== defaultAddress.id
    ) {
      autoSelectedAddressRef.current = defaultAddress.id;
      onSelectAddress(defaultAddress.id);
    }
  }, [addresses, selectedAddressId, onSelectAddress]);

  useEffect(() => {
    if (selectOpen) setPendingAddressId(selectedAddressId);
  }, [selectOpen, selectedAddressId]);

  const columns = [
    {
      title: "",
      key: "selected",
      width: 48,
      render: (_: unknown, record: any) => <Radio value={record.id} />,
    },
    {
      title: "Người nhận",
      key: "fullname",
      render: (_: unknown, record: any) => getAddressName(record),
    },
    {
      title: "Số điện thoại",
      key: "phone",
      render: (_: unknown, record: any) => getAddressPhone(record),
    },
    {
      title: "Địa chỉ",
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
          <Tag color="green">Mặc định</Tag>
        ) : null,
    },
  ];

  return (
    <>
      <Collapse
        defaultActiveKey={["delivery-address"]}
        items={[
          {
            key: "delivery-address",
            label: <Typography.Text strong>Địa chỉ giao hàng</Typography.Text>,
            children: selectedAddress ? (
              <Card
                size="small"
                styles={{ body: { padding: token.paddingMD } }}
              >
                <Flex justify="space-between" gap={token.marginMD}>
                  <Space
                    direction="vertical"
                    size={token.marginSM}
                    style={{ width: "100%" }}
                  >
                    <Typography.Text strong>
                      {getAddressName(selectedAddress)}{" "}
                      {selectedAddress.addressName && (
                        <Typography.Text type="secondary">
                          ({selectedAddress.addressName})
                        </Typography.Text>
                      )}
                    </Typography.Text>
                    <Row gutter={[token.marginSM, token.marginXS]}>
                      <Col span={3}>
                        <HomeOutlined
                          style={{ color: token.colorTextSecondary }}
                        />
                      </Col>
                      <Col span={21}>{getAddressDetail(selectedAddress)}</Col>
                      <Col span={3}>
                        <PhoneOutlined
                          style={{ color: token.colorTextSecondary }}
                        />
                      </Col>
                      <Col span={21}>{getAddressPhone(selectedAddress)}</Col>
                      <Col span={3}>
                        <GlobalOutlined
                          style={{ color: token.colorTextSecondary }}
                        />
                      </Col>
                      <Col span={21}>{getAddressLocation(selectedAddress)}</Col>
                      {selectedAddress.note && (
                        <>
                          <Col span={3}>
                            <MessageOutlined
                              style={{ color: token.colorTextSecondary }}
                            />
                          </Col>
                          <Col span={21}>{selectedAddress.note}</Col>
                        </>
                      )}
                    </Row>
                  </Space>
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => setSelectOpen(true)}
                  >
                    Thay đổi
                  </Button>
                </Flex>
              </Card>
            ) : (
              <Empty description="Chưa có địa chỉ giao hàng">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateOpen(true)}
                >
                  Tạo địa chỉ
                </Button>
              </Empty>
            ),
          },
        ]}
      />

      <Modal
        title="Chọn địa chỉ giao hàng"
        open={selectOpen}
        width={920}
        onCancel={() => setSelectOpen(false)}
        okText="Chọn địa chỉ"
        cancelText="Hủy"
        confirmLoading={isUpdating}
        onOk={async () => {
          if (!pendingAddressId) return;
          await onSelectAddress(pendingAddressId);
          setSelectOpen(false);
        }}
        footer={(_, { OkBtn, CancelBtn }) => (
          <Flex justify="space-between" align="center">
            <Button icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
              Tạo địa chỉ mới
            </Button>
            <Space>
              <CancelBtn />
              <OkBtn />
            </Space>
          </Flex>
        )}
      >
        <Radio.Group
          value={pendingAddressId}
          onChange={(event) => setPendingAddressId(event.target.value)}
          style={{ width: "100%" }}
        >
          <Table
            rowKey="id"
            dataSource={addresses}
            columns={columns}
            pagination={false}
            size="middle"
            scroll={{ x: 760 }}
          />
        </Radio.Group>
      </Modal>

      <ProfileAddressModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={async () => {
          await onRefetchAddresses();
          return {} as any;
        }}
      />
    </>
  );
};
