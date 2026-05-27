import dayjs from "dayjs";
import {
  Button,
  DatePicker,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import { Pagination, TableComponent } from "@repo/ui";
import { moneyFormat } from "@repo/util";
import { LocaleInputNumber } from "../../components/Common/LocaleInputNumber";
import { useCashRequestPage } from "./hooks/useCashRequestPage";

const { Text } = Typography;

const statusLabels: Record<string, { label: string; color: string }> = {
  TODO: { label: "Mới", color: "blue" },
  CANCELLED: { label: "Đã hủy", color: "default" },
  DONE: { label: "Hoàn thành", color: "green" },
};

const disabledPickupTime = () => ({
  disabledHours: () => [
    ...Array.from({ length: 8 }, (_, index) => index),
    ...Array.from({ length: 5 }, (_, index) => index + 19),
  ],
});

export const CashRequestStyleDefault = () => {
  const {
    form,
    page,
    pageSize,
    setPage,
    setPageSize,
    listData,
    addresses,
    isCashRequestsLoading,
    isAddressesLoading,
    isOpenCreate,
    setIsOpenCreate,
    closeCreateModal,
    createCashRequest,
    confirmCancelCashRequest,
    getAddressDisplay,
    minAmount,
    amountRules,
    createCashRequestMutation,
  } = useCashRequestPage();

  const cashRequests = Array.isArray(listData?.data) ? listData.data : [];
  const addressList = Array.isArray(addresses) ? addresses : [];
  const selectedAddressId = Form.useWatch("addressId", form);
  const selectedAddress = addressList.find((item: any) => item.id === selectedAddressId);

  const addressOptions = addressList.map((item: any) => ({
    label: getAddressDisplay(item),
    value: item.id,
  }));

  const columns: ColumnsType<any> = [
    {
      title: "Số tiền",
      dataIndex: "customField01",
      key: "customField01",
      width: 150,
      render: (value) => <Text strong>{moneyFormat(value || 0)}</Text>,
    },
    {
      title: "Địa chỉ",
      dataIndex: "customField03",
      key: "customField03",
      render: (value) => value || "-",
    },
    {
      title: "Thời gian lấy",
      dataIndex: "start",
      key: "start",
      render: (value) => (value ? dayjs(value).format("DD/MM/YYYY HH:mm:ss") : "-"),
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      width: 280,
      render: (notes) => <div className="max-w-[280px] whitespace-normal">{notes?.[0] || "-"}</div>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "right",
      render: (status) => {
        const statusInfo = statusLabels[status] || { label: status, color: "default" };
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      },
    },
    {
      title: "",
      key: "action",
      align: "right",
      render: (_, record) =>
        record?.status === "TODO" ? (
          <Button type="link" onClick={() => confirmCancelCashRequest(record)}>
            Hủy yêu cầu
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="min-h-screen bg-layout p-4 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Yêu cầu thu tiền mặt
          </h1>
          <Text type="secondary">Quản lý các yêu cầu nhân viên đến thu tiền mặt.</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsOpenCreate(true)}
        >
          Thêm yêu cầu
        </Button>
      </div>

      <TableComponent
        title="Danh sách yêu cầu"
        totalCount={listData?.total || 0}
        loading={isCashRequestsLoading}
      >
        <Table
          columns={columns}
          dataSource={cashRequests}
          pagination={false}
          rowKey="id"
          locale={{ emptyText: <Empty description="Không có dữ liệu" /> }}
          scroll={{ x: 920 }}
        />
      </TableComponent>

      <Pagination
        current={page}
        pageSize={pageSize}
        total={listData?.total || 0}
        onChange={(p, s) => {
          setPage(p);
          if (s !== pageSize) setPageSize(s);
        }}
      />

      <Modal
        footer={null}
        title="Thêm yêu cầu thu tiền mặt"
        width={720}
        centered
        open={isOpenCreate}
        destroyOnClose
        onCancel={closeCreateModal}
      >
        <Spin spinning={isAddressesLoading}>
          <Form form={form} onFinish={createCashRequest} layout="vertical">
            <Form.Item label="Số tiền" name="amount" rules={amountRules}>
              <LocaleInputNumber
                className="w-full"
                placeholder="Vui lòng nhập số tiền"
                min={minAmount}
                precision={0}
              />
            </Form.Item>
            <div className="mb-4 text-sm text-gray-500">
              Số tiền yêu cầu thu tiền tối thiểu {moneyFormat(minAmount)} cho một lần thu
            </div>

            <Form.Item
              label="Địa chỉ"
              name="addressId"
              rules={[{ required: true, message: "Địa chỉ không được để trống" }]}
            >
              <Select
                showSearch
                options={addressOptions}
                filterOption={(input, option) =>
                  String(option?.label || "").toLowerCase().includes(input.toLowerCase())
                }
                placeholder="Vui lòng chọn địa chỉ"
              />
            </Form.Item>

            {selectedAddress && (
              <div className="mb-4 text-sm text-gray-600">
                Người liên hệ: {selectedAddress?.fullname || selectedAddress?.fullName || "-"} - SDT{" "}
                {selectedAddress?.phone || "-"}
              </div>
            )}

            <div className="mb-4 flex justify-end">
              <Button onClick={() => window.location.assign("/profile?tab=address")}>
                Thêm địa chỉ
              </Button>
            </div>

            <Form.Item
              label="Thời gian lấy"
              name="date"
              rules={[{ required: true, message: "Thời gian lấy không được để trống" }]}
            >
              <DatePicker
                showTime
                disabledTime={disabledPickupTime}
                format="DD/MM/YYYY HH"
                className="w-full"
                disabledDate={(current) => current && current < dayjs().startOf("day")}
                placeholder="Vui lòng chọn thời gian lấy"
              />
            </Form.Item>

            <Form.Item label="Ghi chú" name="notes">
              <Input.TextArea rows={3} />
            </Form.Item>

            <Space className="w-full justify-end">
              <Button onClick={closeCreateModal}>Hủy</Button>
              <Button
                loading={createCashRequestMutation.isPending}
                htmlType="submit"
                type="primary"
              >
                Thêm
              </Button>
            </Space>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};
