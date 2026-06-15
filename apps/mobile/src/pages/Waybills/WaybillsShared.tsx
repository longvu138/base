import { useEffect, useRef } from "react";
import dayjs from "dayjs";
import {
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
  Popconfirm,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
  theme,
} from "antd";
import {
  DeleteOutlined,
  DownloadOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { quantityFormat } from "@repo/util";
import { useWaybillsMobilePage } from "@repo/hooks";
import MobileFilterPanel from "../../components/MobileFilterPanel";

const { Text, Link, Paragraph, Title } = Typography;
const WAYBILL_PREFETCH_ITEM_COUNT = 5;

type WaybillsPageState = ReturnType<typeof useWaybillsMobilePage>;

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

const getStatusColor = (status?: string) => `#${intToRGB(hashCode(status || ""))}`;

const WaybillItemSkeleton = () => {
  const { token } = theme.useToken();

  return (
    <Card style={{ width: "100%" }}>
      <Flex vertical gap={token.marginMD}>
        <Flex justify="space-between" align="flex-start" gap={token.marginSM}>
          <Space direction="vertical" size={token.marginXS} style={{ flex: 1 }}>
            <Skeleton.Input active size="small" style={{ width: 110 }} />
            <Skeleton.Input active style={{ width: "76%", maxWidth: 260 }} />
          </Space>
          <Skeleton.Button active size="small" style={{ width: 92 }} />
        </Flex>

        <Row gutter={[16, 12]}>
          {[0, 1, 2, 3].map((item) => (
            <Col xs={12} md={6} key={item}>
              <Space
                direction="vertical"
                size={token.marginXS}
                style={{ width: "100%" }}
              >
                <Skeleton.Input active size="small" style={{ width: "70%" }} />
                <Skeleton.Input active size="small" style={{ width: "90%" }} />
              </Space>
            </Col>
          ))}
          <Col xs={24}>
            <Skeleton.Input active size="small" style={{ width: "100%" }} />
          </Col>
        </Row>

        <Flex justify="flex-end">
          <Skeleton.Button active size="small" style={{ width: 72 }} />
        </Flex>
      </Flex>
    </Card>
  );
};

const WaybillListSkeleton = ({ count = 2 }: { count?: number }) => {
  const { token } = theme.useToken();

  return (
    <Space
      direction="vertical"
      size="middle"
      style={{ width: "100%", paddingTop: token.marginXS }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <WaybillItemSkeleton key={index} />
      ))}
    </Space>
  );
};

export const WaybillFilterFields = ({ page }: { page: WaybillsPageState }) => {
  const { token } = theme.useToken();

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Flex gap={token.marginMD} align="flex-start" wrap>
        <Text strong style={{ minWidth: 96 }}>
          Trạng thái:
        </Text>
        <Form.Item name="statuses" noStyle>
          <Checkbox.Group>
            <Space size={[token.marginLG, token.marginXS]} wrap>
              {(page.statusData || []).map((item: any) => (
                <Checkbox key={item.code} value={item.code}>
                  {item.name}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </Form.Item>
      </Flex>
      <Row gutter={[20, 16]} align="bottom">
        <Col xs={12} md={8}>
          <Form.Item
            name="receivedTimeFrom"
            label="Thời gian nhận"
            style={{ marginBottom: 0 }}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Ngày bắt đầu"
            />
          </Form.Item>
        </Col>
        <Col xs={12} md={8}>
          <Form.Item
            name="receivedTimeTo"
            label=" "
            style={{ marginBottom: 0 }}
          >
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

export const WaybillFilter = ({ page }: { page: WaybillsPageState }) => (
  <MobileFilterPanel
    className="mb-4 shadow-sm"
    form={page.form}
    onSearch={page.handleSearch}
    onReset={page.handleReset}
    searchText={page.t("order.search")}
    resetText={page.t("order.filter_refresh")}
    primaryContent={
      <Form.Item
        name="query"
        label="Mã vận đơn"
        style={{ marginBottom: 0 }}
      >
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Nhập mã vận đơn"
          onPressEnter={page.handleSearch}
        />
      </Form.Item>
    }
    secondaryContent={<WaybillFilterFields page={page} />}
  />
);

const WaybillCard = ({
  record,
  page,
}: {
  record: any;
  page: WaybillsPageState;
}) => {
  const { token } = theme.useToken();
  const statusMeta = getStatusMeta(page.statusData, record.status);
  const statusColor = statusMeta?.color || getStatusColor(record.status);
  const warehouse =
    record.receivingWarehouse?.name ||
    record.receivingWarehouse?.displayName ||
    "---";

  return (
    <Card style={{ width: "100%" }}>
      <Flex vertical gap={token.marginMD}>
        <Flex
          justify="space-between"
          align="flex-start"
          wrap
          gap={token.marginSM}
        >
          <Space direction="vertical" size={0} style={{ minWidth: 0, flex: 1 }}>
            <Text type="secondary">Mã vận đơn</Text>
            <Paragraph
              copyable={{ text: record.code }}
              ellipsis={{ rows: 1, tooltip: record.code }}
              style={{ marginBottom: 0 }}
            >
              <Link
                href={`https://m.kuaidi100.com/result.jsp?nu=${record.code}`}
                target="_blank"
                style={{ color: token.colorPrimary }}
              >
                {record.code || "---"}
              </Link>
            </Paragraph>
          </Space>
          <Tag
            style={{
              marginInlineEnd: 0,
              borderColor: statusColor,
              background: statusColor,
              color: token.colorWhite,
            }}
          >
            {statusMeta?.name}
          </Tag>
        </Flex>

        <Row gutter={[16, 12]}>
          <Col xs={12} md={6}>
            <Space direction="vertical" size={0} style={{ maxWidth: "100%" }}>
              <Text type="secondary">Mã đơn</Text>
              {record.shipmentCode ? (
                <Link
                  ellipsis
                  onClick={() => page.navigateToShipment(record.shipmentCode)}
                >
                  {record.shipmentCode}
                </Link>
              ) : (
                <Text>---</Text>
              )}
            </Space>
          </Col>
          <Col xs={12} md={6}>
            <Space direction="vertical" size={0} style={{ maxWidth: "100%" }}>
              <Text type="secondary">Kho nhận</Text>
              <Text ellipsis={{ tooltip: warehouse }}>{warehouse}</Text>
            </Space>
          </Col>
          <Col xs={12} md={6}>
            <Space direction="vertical" size={0}>
              <Text type="secondary">Ngày nhận</Text>
              <Text>{formatDate(record.receivedTime)}</Text>
            </Space>
          </Col>
          <Col xs={12} md={6}>
            <Space direction="vertical" size={0}>
              <Text type="secondary">Ngày tạo</Text>
              <Text>{formatDate(record.createdAt)}</Text>
            </Space>
          </Col>
          <Col xs={24}>
            <Space direction="vertical" size={0} style={{ width: "100%" }}>
              <Text type="secondary">Ghi chú</Text>
              <Paragraph
                editable={{
                  onChange: (value) => page.handleDescriptionChange(record, value),
                  tooltip: page.t("common.edit"),
                }}
                ellipsis={{ rows: 2, expandable: true, symbol: page.t("common.more") }}
                style={{ marginBottom: 0, color: token.colorTextSecondary }}
              >
                {record.description || ""}
              </Paragraph>
            </Space>
          </Col>
        </Row>

        {record.status === "INITIALIZATION" && (
          <Flex justify="flex-end">
            <Popconfirm
              title={page.t("message.delete_confirm")}
              okText={page.t("button.yes")}
              cancelText={page.t("button.no")}
              onConfirm={() => page.handleDelete(record.code)}
            >
              <Button
                danger
                type="text"
                icon={<DeleteOutlined />}
                loading={page.deletingCode === record.code}
              />
            </Popconfirm>
          </Flex>
        )}
      </Flex>
    </Card>
  );
};

export const WaybillList = ({ page }: { page: WaybillsPageState }) => {
  const { token } = theme.useToken();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const total = page.listData?.total || 0;
  const rows = page.listData?.data || [];
  const prefetchIndex = Math.max(rows.length - WAYBILL_PREFETCH_ITEM_COUNT, 0);

  const handleLoadMore = () => {
    if (page.hasNextPage && !page.isFetchingNextPage && !page.isWaybillsLoading) {
      page.fetchNextPage();
    }
  };

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          handleLoadMore();
        }
      },
      { root: null, threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [
    page.hasNextPage,
    page.isFetchingNextPage,
    page.isWaybillsLoading,
    page.fetchNextPage,
    rows.length,
  ]);

  useEffect(() => {
    if (rows.length <= WAYBILL_PREFETCH_ITEM_COUNT) {
      handleLoadMore();
    }
  }, [
    page.hasNextPage,
    page.isFetchingNextPage,
    page.isWaybillsLoading,
    page.fetchNextPage,
    rows.length,
  ]);

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
            type="primary"
            icon={<PlusOutlined />}
            onClick={page.handleCreateOpen}
          >
            Tạo vận đơn
          </Button>
          <Button icon={<DownloadOutlined />} onClick={page.handleExportOpen}>
            {page.t("common.export")}
          </Button>
        </Space>
      </Flex>

      {page.isWaybillsLoading ? (
        <WaybillListSkeleton count={5} />
      ) : rows.length ? (
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <List
            split={false}
            dataSource={rows}
            rowKey={(record: any) => record.id || record.code || record.createdAt}
            renderItem={(record: any, index) => (
              <List.Item
                  style={{
                    padding: 0,
                    borderBlockEnd: "none",
                    marginBottom:
                      index === rows.length - 1 ? 0 : token.marginMD,
                  }}
                >
                  <div
                    ref={index === prefetchIndex ? loadMoreRef : undefined}
                    style={{ width: "100%" }}
                  >
                    <WaybillCard record={record} page={page} />
                  </div>
                </List.Item>
            )}
          />
          {page.isFetchingNextPage && <WaybillItemSkeleton />}
          {!page.hasNextPage && rows.length ? (
            <Divider plain>Đã tải hết dữ liệu</Divider>
          ) : null}
        </Space>
      ) : (
        <Card>
          <Empty description={page.t("message.empty")} />
        </Card>
      )}
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

export const WaybillsPage = () => {
  const page = useWaybillsMobilePage();

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <WaybillFilter page={page} />
      <WaybillList page={page} />
      <WaybillCreateModal page={page} />
      <WaybillExportModal page={page} />
    </Space>
  );
};
