import {
  Badge,
  Button,
  Card,
  Divider,
  Empty,
  Flex,
  Popconfirm,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  theme,
} from "antd";
import { EditOutlined, EnvironmentOutlined, PlusOutlined } from "@ant-design/icons";
import { ProfileAddressModal } from "../ProfileAddressModal";
import { useProfileAddressPage } from "@repo/hooks";

const emptyText = "---";

const getAddressName = (item: any) =>
  item.fullname || item.fullName || item.contactName || item.name || emptyText;

const getAddressPhone = (item: any) =>
  item.phone || item.contactPhone || emptyText;

const getAddressZipCode = (item: any) =>
  item.zipCode || item.postalCode || emptyText;

const getAddressLabel = (item: any) =>
  item.addressName || item.label || emptyText;

const getAddressDetail = (item: any) =>
  item.detail || item.address || emptyText;

const getAddressLocation = (item: any) =>
  item.location?.display ||
  [
    item.wardName || item.ward,
    item.districtName || item.district,
    item.provinceName || item.province,
  ]
    .filter(Boolean)
    .join(", ");

type ProfileAddressContentProps = {
  t: (key: string) => string;
  variant?: "classic" | "compact" | "summary";
};

export const ProfileAddressContent = ({
  t,
  variant = "classic",
}: ProfileAddressContentProps) => {
  const { token } = theme.useToken();
  const logic = useProfileAddressPage(t);

  const columns = [
    {
      title: t("customerAddress.fullname"),
      dataIndex: "fullname",
      width: "12%",
      render: (_: any, record: any) => getAddressName(record),
    },
    {
      title: t("customerAddress.phone"),
      dataIndex: "phone",
      width: "12%",
      render: (_: any, record: any) => getAddressPhone(record),
    },
    {
      title: t("customerAddress.zipCode"),
      dataIndex: "zipCode",
      width: "10%",
      render: (_: any, record: any) => getAddressZipCode(record),
    },
    {
      title: t("customerAddress.addressName"),
      dataIndex: "addressName",
      width: "16%",
      render: (_: any, record: any) => getAddressLabel(record),
    },
    {
      title: t("customerAddress.address"),
      dataIndex: "detail",
      width: "32%",
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>{getAddressDetail(record)}</Typography.Text>
          <Typography.Text type="secondary">
            {getAddressLocation(record) || emptyText}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "",
      dataIndex: "defaultAddress",
      width: "8%",
      render: (_: any, record: any) =>
        record.defaultAddress || record.isDefault ? (
          <Tag color={record.receivingAddress ? "blue" : "green"}>
            {t("customerAddress.default")}
          </Tag>
        ) : null,
    },
    {
      title: "",
      key: "action",
      width: "10%",
      render: (_: any, record: any) => (
        <Space
          split={
            !record.defaultAddress && !record.isDefault ? (
              <Divider type="vertical" />
            ) : null
          }
        >
          <Typography.Link onClick={() => logic.openEditAddress(record)}>
            {t("button.edit")}
          </Typography.Link>
          {!record.defaultAddress && !record.isDefault && (
            <Popconfirm
              title={t("message.delete_confirm")}
              placement="topRight"
              okText={t("button.agree")}
              okButtonProps={{ loading: logic.deleteAddressLoading }}
              cancelText={t("button.disagree")}
              onConfirm={() => logic.deleteAddress(record.id)}
            >
              <Typography.Link type="danger">
                {t("button.delete")}
              </Typography.Link>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const renderTable = () => (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={logic.addresses}
      loading={logic.isLoading}
      locale={{ emptyText: <Empty description={t("message.empty")} /> }}
      pagination={{
        current: logic.page,
        onChange: (nextPage) => logic.setPage(nextPage),
        pageSize: logic.pageSize,
        total: logic.total,
      }}
      scroll={{ x: 920 }}
      size="middle"
    />
  );

  const renderCards = () => (
    <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
      {logic.addresses.length ? (
        logic.addresses.map((item: any) => (
          <Card
            key={item.id}
            size="small"
            styles={{ body: { padding: token.paddingMD } }}
          >
            <Flex justify="space-between" gap={token.marginMD} wrap>
              <Space align="start">
                <EnvironmentOutlined style={{ color: token.colorPrimary }} />
                <Space direction="vertical" size={0}>
                  <Space wrap>
                    <Typography.Text strong>{getAddressName(item)}</Typography.Text>
                    <Typography.Text type="secondary">{getAddressPhone(item)}</Typography.Text>
                    {(item.defaultAddress || item.isDefault) && (
                      <Tag color={item.receivingAddress ? "blue" : "green"}>
                        {t("customerAddress.default")}
                      </Tag>
                    )}
                  </Space>
                  <Typography.Text>{getAddressDetail(item)}</Typography.Text>
                  <Typography.Text type="secondary">
                    {getAddressLocation(item) || emptyText}
                  </Typography.Text>
                </Space>
              </Space>
              <Space>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => logic.openEditAddress(item)}
                >
                  {t("button.edit")}
                </Button>
                {!item.defaultAddress && !item.isDefault && (
                  <Popconfirm
                    title={t("message.delete_confirm")}
                    placement="topRight"
                    okText={t("button.agree")}
                    okButtonProps={{ loading: logic.deleteAddressLoading }}
                    cancelText={t("button.disagree")}
                    onConfirm={() => logic.deleteAddress(item.id)}
                  >
                    <Button danger>{t("button.delete")}</Button>
                  </Popconfirm>
                )}
              </Space>
            </Flex>
          </Card>
        ))
      ) : (
        <Empty description={t("message.empty")} />
      )}
    </Space>
  );

  return (
    <>
      <Card styles={{ body: { padding: token.paddingLG } }}>
        <Tabs
          activeKey={logic.activeTab}
          onChange={(key) => logic.changeTab(key as any)}
          tabBarExtraContent={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={logic.openCreateAddress}
            >
              {t("customerAddress.new_address")}
            </Button>
          }
          items={[
            {
              key: "address",
              label: (
                <Space>
                  {t("customerAddress.received_address_list")}
                  {logic.activeTab === "address" && <Badge count={logic.total} />}
                </Space>
              ),
              children: variant === "classic" ? renderTable() : renderCards(),
            },
            {
              key: "receivingAddress",
              label: (
                <Space>
                  {t("customerAddress.receivingAddress")}
                  {logic.activeTab === "receivingAddress" && (
                    <Badge count={logic.total} />
                  )}
                </Space>
              ),
              children: variant === "classic" ? renderTable() : renderCards(),
            },
          ]}
        />
      </Card>
      <ProfileAddressModal
        open={logic.modalOpen}
        onClose={logic.closeModal}
        onSuccess={() => logic.refetchAddresses()}
        initialValues={logic.editingAddress}
        isReceivingAddress={logic.isReceivingAddress}
        isEdit={!!logic.editingAddress}
      />
    </>
  );
};
