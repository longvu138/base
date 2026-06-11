import dayjs from "dayjs";
import {
  Card,
  Col,
  DatePicker,
  Empty,
  Flex,
  Form,
  Input,
  Pagination,
  Row,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";
import { moneyFormat, quantityFormat } from "@repo/util";
import { FilterPanel } from "@repo/ui";
import { useDeliveryNotesPage } from "@repo/hooks";

const { Text, Link, Paragraph, Title } = Typography;

type DeliveryNotesPageState = ReturnType<typeof useDeliveryNotesPage>;

const formatDate = (value?: string) =>
  value ? dayjs(value).format("HH:mm DD/MM/YYYY") : "---";

const getNote = (record: any) => record?.delivery_note || {};

const moneyCeil = (value: unknown) => Math.ceil(Number(value || 0));

export const DeliveryNotesFilter = ({ page }: { page: DeliveryNotesPageState }) => {
  return (
    <Card className="mb-4 shadow-sm">
      <FilterPanel
        form={page.form}
        onSearch={page.handleSearch}
        onReset={page.handleReset}
        searchText={page.t("order.search")}
        resetText={page.t("order.filter_refresh")}
        primaryContent={
          <Row gutter={[20, 16]} align="bottom">
            <Col xs={24} md={12}>
              <Form.Item name="code" label="Mã phiếu xuất" style={{ marginBottom: 0 }}>
                <Input
                  allowClear
                  prefix={<SearchOutlined />}
                  placeholder="Mã phiếu xuất"
                  onPressEnter={page.handleSearch}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Thời gian xuất" style={{ marginBottom: 0 }}>
                <Row gutter={20}>
                  <Col span={12}>
                    <Form.Item name="exportedAtFrom" noStyle>
                      <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        placeholder="Ngày bắt đầu"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="exportedAtTo" noStyle>
                      <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        placeholder="Ngày kết thúc"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            </Col>
          </Row>
        }
      />
    </Card>
  );
};

const groupPackagesByOrder = (items: any[] = []) => {
  const groups: Record<string, any> = {};
  items.forEach((item) => {
    const order = item.order || {};
    const key = order.code || item?.package?.orderCode || "UNKNOWN";
    if (!groups[key]) {
      groups[key] = { ...order, code: key, packages: [] };
    }
    if (item.package) groups[key].packages.push(item.package);
  });
  return Object.values(groups);
};

export const DeliveryNotesExpanded = ({ record }: { record: any }) => {
  const columns: ColumnsType<any> = [
    {
      title: "Mã đơn",
      dataIndex: "code",
      key: "code",
      render: (code, row) => (
        <Link href={row.is_shipment ? `/shipments/${code}` : `/orders/${code}`} target="_blank">
          #{code}
        </Link>
      ),
    },
    {
      title: "Mã kiện",
      dataIndex: "packages",
      key: "packages",
      render: (packages: any[] = []) => (
        <Space direction="vertical" size={0}>
          {packages.map((item) => <Text key={item.code}>{item.code || "---"}</Text>)}
        </Space>
      ),
    },
    {
      title: "Mã barcode",
      dataIndex: "packages",
      key: "barcode",
      render: (packages: any[] = []) => (
        <Space direction="vertical" size={0}>
          {packages.map((item, index) => <Text key={index}>{item.barcode || "---"}</Text>)}
        </Space>
      ),
    },
    {
      title: "Cân nặng",
      key: "total_weight",
      align: "right",
      render: (_, row) => {
        const weight = (row.packages || []).reduce(
          (sum: number, item: any) => sum + Number(item.weight_net || 0),
          0,
        );
        return `${quantityFormat(weight)} kg`;
      },
    },
  ];

  return (
    <Table
      size="small"
      columns={columns}
      dataSource={groupPackagesByOrder(record.delivery_note_packages)}
      rowKey={(row) => row.code}
      pagination={false}
      locale={{ emptyText: <Empty description="Không có dữ liệu" /> }}
    />
  );
};

export const DeliveryNotesList = ({
  page,
  compactHeader,
}: {
  page: DeliveryNotesPageState;
  compactHeader?: boolean;
}) => {
  const { token } = theme.useToken();
  const total = page.listData?.total || 0;
  const columns: ColumnsType<any> = [
    {
      title: "Mã phiếu xuất",
      dataIndex: "code",
      key: "code",
      width: 200,
      render: (_, record) => {
        const note = getNote(record);
        return (
          <Paragraph copyable={{ text: note.code }} style={{ marginBottom: 0 }}>
            <Text strong style={{ color: token.colorPrimary }}>{note.code || "---"}</Text>
          </Paragraph>
        );
      },
    },
    {
      title: "Thời gian xuất",
      dataIndex: "exported_at",
      key: "exported_at",
      width: 180,
      align: "right",
      render: (_, record) => formatDate(getNote(record).exported_at),
    },
    {
      title: "Số lượng kiện",
      key: "package_number",
      width: 140,
      align: "right",
      render: (_, record) => quantityFormat(getNote(record).package_number),
    },
    {
      title: "Tổng cân nặng",
      key: "total_weight",
      width: 140,
      align: "right",
      render: (_, record) => `${quantityFormat(getNote(record).total_weight)} kg`,
    },
    {
      title: "Tiền cần thu",
      key: "amount_collect",
      width: 140,
      align: "right",
      render: (_, record) => moneyFormat(moneyCeil(getNote(record).amount_collect)),
    },
    {
      title: "Mã vận đơn",
      dataIndex: "tracking_bills",
      key: "tracking_bills",
      width: 220,
      render: (value: string[] = []) => value.join(", ") || "---",
    },
    {
      title: "Địa chỉ khách hàng",
      key: "customer_address",
      width: 360,
      render: (_, record) => {
        const note = getNote(record);
        const address = note.customer_receiver || note.customer_address
          ? `${note.customer_receiver || "---"} - ${note.customer_address || "---"}`
          : "---";
        return (
          <Tooltip title={address}>
            <Text style={{ whiteSpace: "normal" }}>{address}</Text>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <Card>
      {!compactHeader && (
        <Flex
          justify="space-between"
          align="center"
          wrap
          gap={token.marginMD}
          style={{ marginBottom: token.marginMD }}
        >
          <Space size="small" align="center">
            <Title level={4} style={{ margin: 0 }}>Danh sách phiếu xuất</Title>
            <Tag color="blue">{quantityFormat(total)}</Tag>
          </Space>
        </Flex>
      )}
      <Table
        columns={columns}
        dataSource={page.listData?.data || []}
        rowKey={(record) => getNote(record).id || getNote(record).code}
        loading={page.isDeliveryNotesLoading}
        pagination={false}
        expandable={{
          expandedRowKeys: page.expandedId ? [page.expandedId] : [],
          expandedRowRender: (record) => <DeliveryNotesExpanded record={record} />,
          onExpand: page.handleExpand,
        }}
        locale={{ emptyText: <Empty description={page.t("message.empty")} /> }}
        scroll={{ x: 1280 }}
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

export const DeliveryNotesPage = () => {
  const page = useDeliveryNotesPage();
  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <DeliveryNotesFilter page={page} />
      <DeliveryNotesList page={page} />
    </Space>
  );
};
