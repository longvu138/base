import dayjs from "dayjs";
import {
  Card,
  Checkbox,
  Col,
  DatePicker,
  Empty,
  Flex,
  Form,
  Image,
  Input,
  Pagination,
  Row,
  Space,
  Spin,
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
import { useLieferscheinePage } from "./hooks/useLieferscheinePage";

const { Text, Link, Paragraph, Title } = Typography;

export type LieferscheinePageState = ReturnType<typeof useLieferscheinePage>;

const formatDate = (value?: string) =>
  value ? dayjs(value).format("HH:mm DD/MM/YYYY") : "---";

const getAddressText = (record: any) => {
  const address = record?.address;
  if (!address) return "---";
  return [
    address.recipient,
    address.phone,
    address.address1 || address.address,
    address.location?.display,
  ]
    .filter(Boolean)
    .join(", ");
};

const getStatusMeta = (
  record: any,
  statuses: LieferscheinePageState["statuses"],
) => {
  if (record?.cancelled) return { label: "Đã huỷ", color: "#8c8c8c" };
  if (record?.fail) return { label: "Giao thất bại", color: "#f05b5b" };
  if (record?.receivedBy)
    return statuses.find((item) => item.value === "received");
  if (record?.deliveredBy)
    return statuses.find((item) => item.value === "delivered");
  if (record?.storekeeper)
    return statuses.find((item) => item.value === "storekeeper");
  if (record?.preparedBy)
    return statuses.find((item) => item.value === "prepared");
  return { label: "---", color: "#8c8c8c" };
};

export const LieferscheineFilter = ({
  page,
}: {
  page: LieferscheinePageState;
}) => {
  const { token } = theme.useToken();

  return (
    <Card className="mb-4 shadow-sm">
      <FilterPanel
        form={page.form}
        onSearch={page.handleSearch}
        onReset={page.handleReset}
        searchText={page.t("order.search")}
        resetText={page.t("order.filter_refresh")}
        primaryContent={
          <Space direction="vertical" size={token.marginMD} style={{ width: "100%" }}>
            <Form.Item name="status" label="Trạng thái" style={{ marginBottom: 0 }}>
              <Checkbox.Group>
                <Space wrap>
                  {page.statuses.map((item) => (
                    <Checkbox key={item.value} value={item.value}>
                      {item.label}
                    </Checkbox>
                  ))}
                </Space>
              </Checkbox.Group>
            </Form.Item>

            <Row gutter={[24, 16]} align="bottom">
              <Col xs={24} md={8}>
                <Form.Item name="query" label="Mã phiếu giao" style={{ marginBottom: 0 }}>
                  <Input
                    allowClear
                    prefix={<SearchOutlined />}
                    placeholder="Mã phiếu giao"
                    onPressEnter={page.handleSearch}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="orderCode" label="Mã đơn" style={{ marginBottom: 0 }}>
                  <Input
                    allowClear
                    placeholder="Mã đơn"
                    onPressEnter={page.handleSearch}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Ngày tạo từ" style={{ marginBottom: 0 }}>
                  <Flex
                    align="center"
                    gap={token.marginXS}
                    style={{
                      border: `1px solid ${token.colorBorder}`,
                      borderRadius: token.borderRadius,
                      paddingInline: token.paddingXS,
                      background: token.colorBgContainer,
                    }}
                  >
                    <Form.Item name="issueDateFrom" noStyle>
                      <DatePicker
                        bordered={false}
                        showTime={{ format: "HH:mm" }}
                        style={{ flex: 1, minWidth: 0 }}
                        format="DD/MM/YYYY HH:mm"
                        placeholder="Từ"
                      />
                    </Form.Item>
                    <Text type="secondary">-</Text>
                    <Form.Item name="issueDateTo" noStyle>
                      <DatePicker
                        bordered={false}
                        showTime={{ format: "HH:mm" }}
                        style={{ flex: 1, minWidth: 0 }}
                        format="DD/MM/YYYY HH:mm"
                        placeholder="Đến"
                      />
                    </Form.Item>
                  </Flex>
                </Form.Item>
              </Col>
            </Row>
          </Space>
        }
      />
    </Card>
  );
};

export const LieferscheineExpanded = ({
  page,
}: {
  page: LieferscheinePageState;
}) => {
  const loading = page.isPackagesLoading || page.isDeliveriesLoading;
  const firstDelivery = page.deliveries?.[0] || {};
  const courier = page.couriers?.find(
    (item: any) => item.code === firstDelivery.courier,
  );
  const grouped = Object.values(
    (page.packages || []).reduce((acc: Record<string, any>, item: any) => {
      const key = item.orderCode || "UNKNOWN";
      if (!acc[key]) {
        acc[key] = {
          orderCode: item.orderCode,
          orderImage: item.orderImage,
          isShipment: item.isShipment,
          packageCodes: [],
          weights: [],
          allocatedFees: item.allocatedFees || [],
          totalUnpaid: item.totalUnpaid,
        };
      }
      acc[key].packageCodes.push(item.packageCode);
      acc[key].weights.push(item.netWeight);
      return acc;
    }, {}),
  );

  const columns: ColumnsType<any> = [
    {
      title: "Mã đơn",
      dataIndex: "orderCode",
      key: "orderCode",
      render: (code, record) => (
        <Space>
          <Image
            width={48}
            height={48}
            src={record.orderImage}
            fallback=""
            preview={false}
          />
          <Paragraph copyable={{ text: code }} style={{ marginBottom: 0 }}>
            <Link
              href={`/${record.isShipment ? "shipments" : "orders"}/${code}`}
            >
              #{code}
            </Link>
          </Paragraph>
        </Space>
      ),
    },
    {
      title: "Mã kiện",
      dataIndex: "packageCodes",
      key: "packageCodes",
      render: (codes: string[]) => (
        <Space direction="vertical" size={0}>
          {codes.map((code) => (
            <Text key={code}>{code}</Text>
          ))}
        </Space>
      ),
    },
    {
      title: "Mã vận đơn",
      key: "waybill",
      render: () => firstDelivery.trackingNumber || "---",
    },
    {
      title: "Đơn vị vận chuyển",
      key: "courier",
      render: () => courier?.name || firstDelivery.courier || "---",
    },
    {
      title: "Cân nặng",
      dataIndex: "weights",
      key: "weights",
      render: (weights: number[]) => (
        <Space direction="vertical" size={0}>
          {weights.map((weight, index) => (
            <Text key={index}>{quantityFormat(weight)} kg</Text>
          ))}
        </Space>
      ),
    },
    {
      title: "Danh sách phí",
      dataIndex: "allocatedFees",
      key: "allocatedFees",
      render: (fees: any[] = []) => (
        <Space direction="vertical" size={0}>
          {fees.map((item, index) => (
            <Text key={index}>
              {item?.fee?.name}:{" "}
              {item?.fee?.free ? (
                <Space size={4}>
                  <Text delete type="secondary">
                    {moneyFormat(item?.amount || 0)}
                  </Text>
                  <Text>Miễn phí</Text>
                </Space>
              ) : (
                moneyFormat(item?.amount || 0)
              )}
            </Text>
          ))}
        </Space>
      ),
    },
    {
      title: "Số tiền cần thanh toán trên đơn",
      dataIndex: "totalUnpaid",
      key: "totalUnpaid",
      align: "right",
      render: (value) => <Text strong>{moneyFormat(value || 0)}</Text>,
    },
  ];

  if (loading) return <Spin />;

  return (
    <Table
      size="small"
      columns={columns}
      dataSource={grouped}
      rowKey={(record) => record.orderCode}
      pagination={false}
      locale={{ emptyText: <Empty description={page.t("message.empty")} /> }}
      scroll={{ x: 960 }}
    />
  );
};

export const LieferscheineList = ({
  page,
}: {
  page: LieferscheinePageState;
}) => {
  const { token } = theme.useToken();
  const total = page.listData?.total || 0;
  const columns: ColumnsType<any> = [
    {
      title: "Mã phiếu giao",
      dataIndex: "code",
      key: "code",
      render: (code) => (
        <Paragraph copyable={{ text: code }} style={{ marginBottom: 0 }}>
          <Text strong style={{ color: token.colorPrimary }}>
            {code}
          </Text>
        </Paragraph>
      ),
    },
    {
      title: "Số lượng kiện",
      dataIndex: "totalPackage",
      key: "totalPackage",
      align: "center",
      render: (value) => (value ? `${quantityFormat(value)} kiện hàng` : "---"),
    },
    {
      title: "Tổng số tiền cần thu",
      dataIndex: "totalUnpaid",
      key: "totalUnpaid",
      render: (value) => moneyFormat(value || 0),
    },
    {
      title: "Số tiền COD",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (value) => <Text strong>{moneyFormat(value || 0)}</Text>,
    },
    {
      title: "Cân nặng",
      dataIndex: "totalWeight",
      key: "totalWeight",
      render: (value) =>
        Number.isFinite(value) ? `${quantityFormat(value)} kg` : "---",
    },
    {
      title: "Thời gian tạo",
      dataIndex: "issueDate",
      key: "issueDate",
      render: formatDate,
    },
    {
      title: "Địa chỉ giao hàng",
      dataIndex: "address",
      key: "address",
      width: 360,
      render: (_, record) => {
        const address = getAddressText(record);
        return (
          <Tooltip title={address}>
            <Text style={{ whiteSpace: "normal" }}>{address}</Text>
          </Tooltip>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      align: "right",
      render: (_, record) => {
        const status = getStatusMeta(record, page.statuses);
        return (
          <Tag
            style={{
              minWidth: 96,
              marginInlineEnd: 0,
              padding: "2px 16px",
              borderRadius: 32,
              borderColor: status?.color,
              background: status?.color,
              color: token.colorWhite,
              textAlign: "center",
            }}
          >
            {status?.label}
          </Tag>
        );
      },
    },
  ];

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
            Danh sách phiếu giao
          </Title>
          <Tag color="blue">{quantityFormat(total)}</Tag>
        </Space>
      </Flex>
      <Table
        columns={columns}
        dataSource={page.listData?.data || []}
        rowKey={(record) => record.code}
        loading={page.isLieferscheineLoading}
        pagination={false}
        expandable={{
          expandedRowKeys: page.expandedCode ? [page.expandedCode] : [],
          onExpand: page.handleExpand,
          expandedRowRender: () => <LieferscheineExpanded page={page} />,
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

export const LieferscheinePage = () => {
  const page = useLieferscheinePage();
  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <LieferscheineFilter page={page} />
      <LieferscheineList page={page} />
    </Space>
  );
};
