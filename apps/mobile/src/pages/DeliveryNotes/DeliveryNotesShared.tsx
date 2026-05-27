import { useEffect, useState } from "react";
import VirtualList from "@rc-component/virtual-list";
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
const VIRTUAL_LIST_MIN_HEIGHT = 360;
const VIRTUAL_LIST_OFFSET = 240;
const DELIVERY_NOTE_ITEM_HEIGHT = 236;

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
                label="MÃ£ phiáº¿u xuáº¥t"
                style={{ marginBottom: 0 }}
              >
                <Input
                  allowClear
                  prefix={<SearchOutlined />}
                  placeholder="MÃ£ phiáº¿u xuáº¥t"
                  onPressEnter={page.handleSearch}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Thá»i gian táº¡o" style={{ marginBottom: 0 }}>
                <Row gutter={20}>
                  <Col span={12}>
                    <Form.Item name="exportedAtFrom" noStyle>
                      <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        placeholder="NgÃ y báº¯t Ä‘áº§u"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="exportedAtTo" noStyle>
                      <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        placeholder="NgÃ y káº¿t thÃºc"
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
    return <Empty description="KhÃ´ng cÃ³ dá»¯ liá»‡u" />;
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
                <Text type="secondary">MÃ£ Ä‘Æ¡n</Text>
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
                <Text type="secondary">CÃ¢n náº·ng</Text>
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
  const [listHeight, setListHeight] = useState(VIRTUAL_LIST_MIN_HEIGHT);
  const total = page.listData?.total || 0;
  const rows = page.listData?.data || [];
  const {
    fetchNextPage,
    hasNextPage,
    isDeliveryNotesLoading,
    isFetchingNextPage,
  } = page;

  useEffect(() => {
    const updateHeight = () => {
      setListHeight(
        Math.max(
          VIRTUAL_LIST_MIN_HEIGHT,
          window.innerHeight - VIRTUAL_LIST_OFFSET
        )
      );
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage && !isDeliveryNotesLoading) {
      fetchNextPage();
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    const target = event.currentTarget;
    if (target.scrollHeight - target.scrollTop - target.clientHeight <= 24) {
      handleLoadMore();
    }
  };

  const virtualRows = [
    ...rows,
    ...(isFetchingNextPage ? [{ __type: "loading" }] : []),
    ...(!hasNextPage && rows.length ? [{ __type: "end" }] : []),
  ];

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
              Danh sÃ¡ch phiáº¿u xuáº¥t
            </Title>
            <Tag color="blue">{quantityFormat(total)}</Tag>
          </Space>
        </Flex>
      )}

      {page.isDeliveryNotesLoading ? (
        <DeliveryNotesListSkeleton count={5} />
      ) : rows.length ? (
        <List split={false}>
          <VirtualList
            data={virtualRows}
            height={listHeight}
            itemHeight={DELIVERY_NOTE_ITEM_HEIGHT}
            itemKey={(record: any) => {
              if (record.__type) return record.__type;
              const note = getNote(record);
              return note.id || note.code;
            }}
            onScroll={handleScroll}
          >
            {(record: any, index, virtualProps) => {
              if (record.__type === "loading") {
                return (
                  <List.Item style={{ ...virtualProps.style, padding: 0 }}>
                    <DeliveryNoteItemSkeleton />
                  </List.Item>
                );
              }
              if (record.__type === "end") {
                return (
                  <List.Item style={{ ...virtualProps.style, padding: 0 }}>
                    <Divider plain>Da tai het du lieu</Divider>
                  </List.Item>
                );
              }

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
                      ...virtualProps.style,
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
                            <Text type="secondary">MÃ£ phiáº¿u xuáº¥t</Text>
                            <Paragraph
                              copyable={{ text: note.code }}
                              ellipsis={{ rows: 1, tooltip: note.code }}
                              style={{ marginBottom: 0 }}
                            >
                              <Text
                                strong
                                style={{ color: token.colorPrimary }}
                              >
                                {note.code || "---"}
                              </Text>
                            </Paragraph>
                          </Space>
                          <Tag color="blue" style={{ marginInlineEnd: 0 }}>
                            {quantityFormat(note.package_number)} kiá»‡n
                          </Tag>
                        </Flex>

                        <Row gutter={[16, 12]}>
                          <Col xs={12} md={6}>
                            <Space direction="vertical" size={0}>
                              <Text type="secondary">Thá»i gian táº¡o</Text>
                              <Text>{formatDate(note.exported_at)}</Text>
                            </Space>
                          </Col>
                          <Col xs={12} md={6}>
                            <Space direction="vertical" size={0}>
                              <Text type="secondary">Tá»•ng cÃ¢n náº·ng</Text>
                              <Text strong>
                                {quantityFormat(note.total_weight)} kg
                              </Text>
                            </Space>
                          </Col>
                          <Col xs={12} md={6}>
                            <Space direction="vertical" size={0}>
                              <Text type="secondary">Tiá»n cáº§n thu</Text>
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
                              <Text type="secondary">MÃ£ váº­n Ä‘Æ¡n</Text>
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
                              <Text type="secondary">Äá»‹a chá»‰ khÃ¡ch hÃ ng</Text>
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
                            {expanded ? "Thu gá»n" : "Xem chi tiáº¿t"}
                          </Button>
                        </Flex>
                      </Flex>
                    </Card>
                  </List.Item>
                );
              }}
          </VirtualList>
        </List>
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

