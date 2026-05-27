import dayjs from "dayjs";
import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Empty,
  Flex,
  Form,
  Input,
  Modal,
  Pagination,
  Popconfirm,
  Row,
  Space,
  Table,
  Tag,
  Typography,
  theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DeleteOutlined,
  DownloadOutlined,
  PlusOutlined,
  SearchOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { quantityFormat } from "@repo/util";
import { useWaybillsPage } from "@repo/hooks";

const { Text, Link, Title, Paragraph } = Typography;

type WaybillsPageState = ReturnType<typeof useWaybillsPage>;

const formatDate = (value?: string) =>
  value ? dayjs(value).format("DD/MM/YYYY") : "---";

const getStatusMeta = (statuses: any[] = [], code?: string) =>
  statuses.find((item) => item.code === code) || { name: code || "---" };

const hashCode = (value = "") => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash);
  }
  return hash;
};

const intToRGB = (value: number) => {
  const color = (value & 0x00ffffff).toString(16).toUpperCase();
  return "00000".substring(0, 6 - color.length) + color;
};

const getGobizStatusColor = (status?: string) => `#${intToRGB(hashCode(status || ""))}`;

const useWaybillColumns = (page: WaybillsPageState) => {
  const { token } = theme.useToken();
  const {
    t,
    statusData,
    deletingCode,
    navigateToShipment,
    handleDescriptionChange,
    handleDelete,
  } = page;

  const columns: ColumnsType<any> = [
    {
      title: "Mã vận đơn",
      dataIndex: "code",
      key: "code",
      fixed: "left",
      render: (code: string) => (
        <Paragraph copyable={{ text: code }} style={{ marginBottom: 0 }}>
          <Link href={`https://m.kuaidi100.com/result.jsp?nu=${code}`} target="_blank">
            {code}
          </Link>
        </Paragraph>
      ),
    },
    {
      title: "Mã khách hàng",
      dataIndex: "refCustomerCode",
      key: "refCustomerCode",
      render: (value) => value || "---",
    },
    {
      title: "Mã đơn",
      dataIndex: "shipmentCode",
      key: "shipmentCode",
      render: (code: string) =>
        code ? <Link onClick={() => navigateToShipment(code)}>{code}</Link> : "---",
    },
    {
      title: "Kho nhận",
      dataIndex: "receivingWarehouse",
      key: "receivingWarehouse",
      render: (warehouse) => warehouse?.name || warehouse?.displayName || "---",
    },
    {
      title: "Ghi chú",
      dataIndex: "description",
      key: "description",
      width: 280,
      render: (description, record) => (
        <Paragraph
          editable={{
            onChange: (value) => handleDescriptionChange(record, value),
            tooltip: t("common.edit"),
          }}
          style={{ marginBottom: 0, color: token.colorTextSecondary }}
        >
          {description || ""}
        </Paragraph>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const meta = getStatusMeta(statusData, status);
        return (
          <Tag
            style={{
              backgroundColor: getGobizStatusColor(status),
              borderColor: getGobizStatusColor(status),
              color: token.colorWhite,
            }}
          >
            {meta?.name}
          </Tag>
        );
      },
    },
    {
      title: "Ngày nhận",
      dataIndex: "receivedTime",
      key: "receivedTime",
      render: formatDate,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: formatDate,
    },
    {
      title: "",
      key: "action",
      width: 72,
      align: "right",
      render: (_, record) =>
        record.status === "INITIALIZATION" ? (
          <Popconfirm
            title={t("message.delete_confirm")}
            okText={t("button.yes")}
            cancelText={t("button.no")}
            onConfirm={() => handleDelete(record.code)}
          >
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              loading={deletingCode === record.code}
            />
          </Popconfirm>
        ) : null,
    },
  ];

  return columns;
};

export const WaybillFilterFields = ({ page }: { page: WaybillsPageState }) => {
  const { token } = theme.useToken();
  const { statusData, handleSearch } = page;

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Flex gap={token.marginMD} align="flex-start" wrap>
        <Text strong style={{ minWidth: 96 }}>
          Trạng thái:
        </Text>
        <Form.Item name="statuses" noStyle>
          <Checkbox.Group>
            <Space size={[token.marginLG, token.marginXS]} wrap>
              {(statusData || []).map((item) => (
                <Checkbox key={item.code} value={item.code}>
                  {item.name}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </Form.Item>
      </Flex>
      <Row gutter={[24, 16]} align="bottom">
        <Col xs={24} md={8}>
          <Form.Item name="query" label="Mã vận đơn">
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Nhập mã vận đơn"
              onPressEnter={handleSearch}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="receivedTimeFrom" label="Thời gian nhận">
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Ngày bắt đầu"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="receivedTimeTo" label=" ">
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Ngày kết thúc"
            />
          </Form.Item>
        </Col>
      </Row>
    </Space>
  );
};

export const WaybillFilterActions = ({ page }: { page: WaybillsPageState }) => {
  const { token } = theme.useToken();

  return (
    <Flex justify="flex-end" align="center" gap={token.marginLG}>
      <Button
        type="link"
        icon={<SyncOutlined />}
        onClick={page.handleReset}
        style={{ paddingInline: 0, color: token.colorTextSecondary }}
      >
        {page.t("order.filter_refresh")}
      </Button>
      <Button type="primary" style={{ minWidth: 240 }} onClick={page.handleSearch}>
        {page.t("order.search")}
      </Button>
    </Flex>
  );
};

export const WaybillListCard = ({ page }: { page: WaybillsPageState }) => {
  const { token } = theme.useToken();
  const columns = useWaybillColumns(page);
  const total = page.listData?.total || 0;

  return (
    <Card>
      <Flex
        justify="space-between"
        align="center"
        wrap
        gap={token.marginMD}
        style={{ marginBottom: token.marginMD }}
      >
        <Space size="small" align="center">
          <Title level={4} style={{ margin: 0 }}>
            Danh sách vận đơn
          </Title>
          <Tag color="blue">{quantityFormat(total)}</Tag>
        </Space>
        <Space wrap>
          <Button
            icon={<DownloadOutlined />}
            onClick={page.handleExportOpen}
          >
            {page.t("common.export")}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={page.handleCreateOpen}>
            Tạo vận đơn
          </Button>
        </Space>
      </Flex>

      <Table
        columns={columns}
        dataSource={page.listData?.data || []}
        rowKey={(record) => record.id || record.code || record.createdAt}
        loading={page.isWaybillsLoading}
        pagination={false}
        locale={{
          emptyText: <Empty description={page.t("message.empty")} />,
        }}
        scroll={{ x: 1120 }}
      />

      <Flex justify="flex-end" style={{ marginTop: token.marginLG }}>
        <Pagination
          current={page.page}
          pageSize={page.pageSize}
          total={total}
          showSizeChanger
          onChange={(nextPage, nextPageSize) => {
            page.setPage(nextPage);
            if (nextPageSize !== page.pageSize) page.setPageSize(nextPageSize);
          }}
        />
      </Flex>
    </Card>
  );
};

export const WaybillCreateModal = ({ page }: { page: WaybillsPageState }) => (
  <Modal
    title="Tạo vận đơn"
    open={page.createOpen}
    onCancel={() => page.setCreateOpen(false)}
    onOk={page.handleCreate}
    okText={page.t("common.confirm")}
    cancelText={page.t("common.cancel")}
    confirmLoading={page.isCreating}
  >
    <Form form={page.createForm} layout="vertical">
      <Form.Item
        name="waybillNumbers"
        label="Mã vận đơn"
        rules={[{ required: true, message: "Vui lòng nhập mã vận đơn" }]}
      >
        <Input.TextArea
          rows={6}
          placeholder="Nhập nhiều mã vận đơn, cách nhau bằng dấu phẩy, dấu cách hoặc xuống dòng"
        />
      </Form.Item>
      <Text type="secondary">Tối đa 30 mã vận đơn mỗi lần tạo.</Text>
      <Form.Item name="description" label="Ghi chú" style={{ marginTop: 16 }}>
        <Input.TextArea rows={3} maxLength={255} showCount />
      </Form.Item>
    </Form>
  </Modal>
);

export const WaybillExportModal = ({ page }: { page: WaybillsPageState }) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title={page.t("orders.export_pin")}
      open={page.exportOpen}
      onCancel={() => page.setExportOpen(false)}
      okText={page.t("common.export")}
      cancelText={page.t("common.cancel")}
      confirmLoading={page.isExporting}
      onOk={async () => {
        const values = await form.validateFields();
        await page.handleExport(values.secret);
        form.resetFields();
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="secret"
          label={page.t("orders.input_pin")}
          rules={[{ required: true, message: page.t("message.required") }]}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  );
};
