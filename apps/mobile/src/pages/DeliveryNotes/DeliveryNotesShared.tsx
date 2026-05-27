import { useEffect } from "react";
import dayjs from "dayjs";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Empty,
  Flex,
  Form,
  Input,
  List,
  Row,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  Typography,
  theme,
} from "antd";
import { DownOutlined, SearchOutlined, UpOutlined } from "@ant-design/icons";
import { moneyFormat, quantityFormat } from "@repo/util";
import { FilterPanel } from "@repo/ui";
import { useDeliveryNotesMobilePage } from "@repo/hooks";

const { Text, Link, Paragraph, Title } = Typography;

type DeliveryNotesPageState = ReturnType<typeof useDeliveryNotesMobilePage>;

const formatDate = (value?: string) =>
  value ? dayjs(value).format("HH:mm DD/MM/YYYY") : "---";

const getNote = (record: any) => record?.delivery_note || {};

const moneyCeil = (value: unknown) => Math.ceil(Number(value || 0));

const DeliveryNoteItemSkeleton = () => {
  const { token } = theme.useToken();

  return (
    <Card style={{ width: "100%" }}>
      <Flex vertical gap={token.marginMD}>
        <Flex justify="space-between" align="flex-start" gap={token.marginSM}>
          <Space direction="vertical" size={token.marginXS} style={{ flex: 1 }}>
            <Skeleton.Input active size="small" style={{ width: 100 }} />
            <Skeleton.Input active style={{ width: "72%", maxWidth: 220 }} />
          </Space>
          <Skeleton.Button active size="small" style={{ width: 76 }} />
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
            <Space
              direction="vertical"
              size={token.marginXS}
              style={{ width: "100%" }}
            >
              <Skeleton.Input active size="small" style={{ width: 140 }} />
              <Skeleton.Input active size="small" style={{ width: "100%" }} />
            </Space>
          </Col>
        </Row>

        <Flex justify="flex-end">
          <Skeleton.Button active size="small" style={{ width: 112 }} />
        </Flex>
      </Flex>
    </Card>
  );
};

const DeliveryNotesListSkeleton = ({ count = 2 }: { count?: number }) => {
  const { token } = theme.useToken();

  return (
    <Space
      direction="vertical"
      size="middle"
      style={{ width: "100%", paddingTop: token.marginXS }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <DeliveryNoteItemSkeleton key={index} />
      ))}
    </Space>
  );
};

export const DeliveryNotesFilter = ({
  page,
}: {
  page: DeliveryNotesPageState;
}) => {
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
              <Form.Item
                name="code"
                label="Mã phiếu xuất"
                style={{ marginBottom: 0 }}
              >
                <Input
                  allowClear
                  prefix={<SearchOutlined />}
                  placeholder="Mã phiếu xuất"
                  onPressEnter={page.handleSearch}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Thời gian tạo" style={{ marginBottom: 0 }}>
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
  const { token } = theme.useToken();
  const groups = groupPackagesByOrder(record.delivery_note_packages);

  if (!groups.length) {
    return <Empty description="Không có dữ liệu" />;
  }

  return (
    <Space direction="vertical" size="small" style={{ width: "100%" }}>
      {groups.map((row: any) => {
        const packages = row.packages || [];
        const weight = packages.reduce(
          (sum: number, item: any) => sum + Number(item.weight_net || 0),
          0
        );

        return (
          <Flex
            key={row.code}
            vertical
            gap={token.marginXS}
            style={{
              padding: token.paddingSM,
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadius,
              background: token.colorFillQuaternary,
            }}
          >
            <Flex
              justify="space-between"
              align="flex-start"
              wrap
              gap={token.marginSM}
            >
              <Space
                direction="vertical"
                size={0}
                style={{ minWidth: 0, flex: 1 }}
              >
                <Text type="secondary">Mã đơn</Text>
                <Link
                  href={
                    row.is_shipment
                      ? `/shipments/${row.code}`
                      : `/orders/${row.code}`
                  }
                  target="_blank"
                  ellipsis
                  style={{ maxWidth: "100%" }}
                >
                  #{row.code}
                </Link>
              </Space>
              <Space direction="vertical" size={0} align="end">
                <Text type="secondary">Cân nặng</Text>
                <Text strong>{quantityFormat(weight)} kg</Text>
              </Space>
            </Flex>

            <Flex wrap gap={token.marginSM}>
              {packages.map((item: any, index: number) => (
                <Tag key={item.code || index} style={{ marginInlineEnd: 0 }}>
                  {item.code || "---"} / {item.barcode || "---"}
                </Tag>
              ))}
            </Flex>
          </Flex>
        );
      })}
    </Space>
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
  const rows = page.listData?.data || [];
  const {
    fetchNextPage,
    hasNextPage,
    isDeliveryNotesLoading,
    isFetchingNextPage,
  } = page;

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage && !isDeliveryNotesLoading) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    const handleWindowScroll = () => {
      const documentHeight = document.documentElement.scrollHeight;
      const currentBottom = window.innerHeight + window.scrollY;

      if (documentHeight - currentBottom <= 64) {
        handleLoadMore();
      }
    };

    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, [
    fetchNextPage,
    hasNextPage,
    isDeliveryNotesLoading,
    isFetchingNextPage,
    rows.length,
  ]);

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      {!compactHeader && (
        <Flex
          justify="space-between"
          align="center"
          wrap
          gap={token.marginMD}
          style={{ marginBottom: token.marginMD }}
        >
          <Space size="small" align="center">
            <Title level={4} style={{ margin: 0 }}>
              Danh sách phiếu xuất
            </Title>
            <Tag color="blue">{quantityFormat(total)}</Tag>
          </Space>
        </Flex>
      )}

      {page.isDeliveryNotesLoading ? (
        <DeliveryNotesListSkeleton count={5} />
      ) : rows.length ? (
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <List
            split={false}
            dataSource={rows}
            rowKey={(record: any) => {
              const note = getNote(record);
              return note.id || note.code;
            }}
            renderItem={(record: any, index) => {
              const note = getNote(record);
              const key = note.id || note.code;
              const expanded = page.expandedId === key;
              const trackingBills =
                record.tracking_bills || note.tracking_bills || [];
              const trackingText = trackingBills.join(", ") || "---";
              const address =
                note.customer_receiver || note.customer_address
                  ? `${note.customer_receiver || "---"} - ${note.customer_address || "---"}`
                  : "---";

              return (
                <List.Item
                  style={{
                    padding: 0,
                    borderBlockEnd: "none",
                    marginBottom:
                      index === rows.length - 1 ? 0 : token.marginMD,
                  }}
                >
                  <Card style={{ width: "100%" }}>
                    <Flex vertical gap={token.marginMD}>
                      <Flex
                        justify="space-between"
                        align="flex-start"
                        wrap
                        gap={token.marginSM}
                      >
                        <Space
                          direction="vertical"
                          size={0}
                          style={{ minWidth: 0, flex: 1 }}
                        >
                          <Text type="secondary">Mã phiếu xuất</Text>
                          <Paragraph
                            copyable={{ text: note.code }}
                            ellipsis={{ rows: 1, tooltip: note.code }}
                            style={{ marginBottom: 0 }}
                          >
                            <Text strong style={{ color: token.colorPrimary }}>
                              {note.code || "---"}
                            </Text>
                          </Paragraph>
                        </Space>
                        <Tag color="blue" style={{ marginInlineEnd: 0 }}>
                          {quantityFormat(note.package_number)} kiện
                        </Tag>
                      </Flex>

                      <Row gutter={[16, 12]}>
                        <Col xs={12} md={6}>
                          <Space direction="vertical" size={0}>
                            <Text type="secondary">Thời gian tạo</Text>
                            <Text>{formatDate(note.exported_at)}</Text>
                          </Space>
                        </Col>
                        <Col xs={12} md={6}>
                          <Space direction="vertical" size={0}>
                            <Text type="secondary">Tổng cân nặng</Text>
                            <Text strong>
                              {quantityFormat(note.total_weight)} kg
                            </Text>
                          </Space>
                        </Col>
                        <Col xs={12} md={6}>
                          <Space direction="vertical" size={0}>
                            <Text type="secondary">Tiền cần thu</Text>
                            <Text strong>
                              {moneyFormat(moneyCeil(note.amount_collect))}
                            </Text>
                          </Space>
                        </Col>
                        <Col xs={12} md={6}>
                          <Space
                            direction="vertical"
                            size={0}
                            style={{ maxWidth: "100%" }}
                          >
                            <Text type="secondary">Mã vận đơn</Text>
                            <Tooltip title={trackingText}>
                              <Text ellipsis style={{ maxWidth: "100%" }}>
                                {trackingText}
                              </Text>
                            </Tooltip>
                          </Space>
                        </Col>
                        <Col xs={24}>
                          <Space
                            direction="vertical"
                            size={0}
                            style={{ width: "100%" }}
                          >
                            <Text type="secondary">Địa chỉ khách hàng</Text>
                            <Text ellipsis={{ tooltip: address }}>
                              {address}
                            </Text>
                          </Space>
                        </Col>
                      </Row>

                      {expanded && <DeliveryNotesExpanded record={record} />}

                      <Flex justify="flex-end">
                        <Button
                          type="link"
                          icon={expanded ? <UpOutlined /> : <DownOutlined />}
                          onClick={() => page.handleExpand(!expanded, record)}
                        >
                          {expanded ? "Thu gọn" : "Xem chi tiết"}
                        </Button>
                      </Flex>
                    </Flex>
                  </Card>
                </List.Item>
              );
            }}
          />
          {isFetchingNextPage && <DeliveryNoteItemSkeleton />}
          {!hasNextPage && rows.length ? (
            <Divider plain>Đã tải hết dữ liệu</Divider>
          ) : null}
        </Space>
      ) : (
        <Card>
          <Empty description={page.t("message.empty")} />
        </Card>
      )}
    </Space>
  );
};

export const DeliveryNotesPage = () => {
  const page = useDeliveryNotesMobilePage();
  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <DeliveryNotesFilter page={page} />
      <DeliveryNotesList page={page} />
    </Space>
  );
};
