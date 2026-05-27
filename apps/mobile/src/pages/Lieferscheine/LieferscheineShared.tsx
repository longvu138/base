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
  Image,
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
import { useLieferscheineMobilePage } from "@repo/hooks";

const { Text, Link, Paragraph, Title } = Typography;
const LIEFERSCHEINE_PREFETCH_ITEM_COUNT = 5;

export type LieferscheinePageState = ReturnType<
  typeof useLieferscheineMobilePage
>;

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
  statuses: LieferscheinePageState["statuses"]
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

const LieferscheineItemSkeleton = () => {
  const { token } = theme.useToken();

  return (
    <Card style={{ width: "100%" }}>
      <Flex vertical gap={token.marginMD}>
        <Flex justify="space-between" align="flex-start" gap={token.marginSM}>
          <Space direction="vertical" size={token.marginXS} style={{ flex: 1 }}>
            <Skeleton.Input active size="small" style={{ width: 96 }} />
            <Skeleton.Input active style={{ width: "70%", maxWidth: 220 }} />
          </Space>
          <Skeleton.Button active size="small" style={{ width: 88 }} />
        </Flex>

        <Row gutter={[16, 12]}>
          {[0, 1, 2, 3].map((item) => (
            <Col xs={12} key={item}>
              <Space
                direction="vertical"
                size={token.marginXS}
                style={{ width: "100%" }}
              >
                <Skeleton.Input active size="small" style={{ width: "65%" }} />
                <Skeleton.Input active size="small" style={{ width: "85%" }} />
              </Space>
            </Col>
          ))}
          {[0, 1].map((item) => (
            <Col xs={24} key={`wide-${item}`}>
              <Space
                direction="vertical"
                size={token.marginXS}
                style={{ width: "100%" }}
              >
                <Skeleton.Input active size="small" style={{ width: 120 }} />
                <Skeleton.Input active size="small" style={{ width: "100%" }} />
              </Space>
            </Col>
          ))}
        </Row>

        <Flex justify="flex-end">
          <Skeleton.Button active size="small" style={{ width: 112 }} />
        </Flex>
      </Flex>
    </Card>
  );
};

const LieferscheineListSkeleton = ({ count = 2 }: { count?: number }) => {
  const { token } = theme.useToken();

  return (
    <Space
      direction="vertical"
      size="middle"
      style={{ width: "100%", paddingTop: token.marginXS }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <LieferscheineItemSkeleton key={index} />
      ))}
    </Space>
  );
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
          <Space
            direction="vertical"
            size={token.marginMD}
            style={{ width: "100%" }}
          >
            <Form.Item
              name="status"
              label="Trạng thái"
              style={{ marginBottom: 0 }}
            >
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

            <Row gutter={[16, 12]} align="bottom">
              <Col xs={24} md={8}>
                <Form.Item
                  name="query"
                  label="Mã phiếu giao"
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    allowClear
                    prefix={<SearchOutlined />}
                    placeholder="Mã phiếu giao"
                    onPressEnter={page.handleSearch}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="orderCode"
                  label="Mã đơn"
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    allowClear
                    placeholder="Mã đơn"
                    onPressEnter={page.handleSearch}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Ngày tạo" style={{ marginBottom: 0 }}>
                  <Row gutter={8}>
                    <Col span={12}>
                      <Form.Item name="issueDateFrom" noStyle>
                        <DatePicker
                          showTime={{ format: "HH:mm" }}
                          style={{ width: "100%" }}
                          format="DD/MM/YYYY HH:mm"
                          placeholder="Từ"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="issueDateTo" noStyle>
                        <DatePicker
                          showTime={{ format: "HH:mm" }}
                          style={{ width: "100%" }}
                          format="DD/MM/YYYY HH:mm"
                          placeholder="Đến"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form.Item>
              </Col>
            </Row>
          </Space>
        }
      />
    </Card>
  );
};

const groupPackages = (items: any[] = []) =>
  Object.values(
    items.reduce((acc: Record<string, any>, item: any) => {
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
    }, {})
  );

export const LieferscheineExpanded = ({
  page,
}: {
  page: LieferscheinePageState;
}) => {
  const { token } = theme.useToken();
  const loading = page.isPackagesLoading || page.isDeliveriesLoading;
  const firstDelivery = page.deliveries?.[0] || {};
  const courier = page.couriers?.find(
    (item: any) => item.code === firstDelivery.courier
  );
  const grouped = groupPackages(page.packages);

  if (loading) return <Skeleton active paragraph={{ rows: 3 }} />;
  if (!grouped.length) return <Empty description={page.t("message.empty")} />;

  return (
    <Space direction="vertical" size="small" style={{ width: "100%" }}>
      {grouped.map((record: any) => (
        <Flex
          key={record.orderCode}
          vertical
          gap={token.marginSM}
          style={{
            padding: token.paddingSM,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: token.borderRadius,
            background: token.colorFillQuaternary,
          }}
        >
          <Flex align="center" gap={token.marginSM} style={{ minWidth: 0 }}>
            <Image
              width={48}
              height={48}
              src={record.orderImage}
              fallback=""
              preview={false}
            />
            <Space
              direction="vertical"
              size={0}
              style={{ minWidth: 0, flex: 1 }}
            >
              <Text type="secondary">Mã đơn</Text>
              <Paragraph
                copyable={{ text: record.orderCode }}
                style={{ marginBottom: 0 }}
              >
                <Link
                  href={`/${record.isShipment ? "shipments" : "orders"}/${record.orderCode}`}
                >
                  #{record.orderCode}
                </Link>
              </Paragraph>
            </Space>
          </Flex>

          <Flex wrap gap={token.marginXS}>
            {record.packageCodes.map((code: string) => (
              <Tag key={code} style={{ marginInlineEnd: 0 }}>
                {code}
              </Tag>
            ))}
          </Flex>

          <Row gutter={[12, 8]}>
            <Col span={12}>
              <Text type="secondary">Mã vận đơn</Text>
              <div>{firstDelivery.trackingNumber || "---"}</div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Đơn vị vận chuyển</Text>
              <div>{courier?.name || firstDelivery.courier || "---"}</div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Cân nặng</Text>
              <div>
                {record.weights
                  .map((weight: number) => `${quantityFormat(weight)} kg`)
                  .join(", ")}
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Cần thanh toán</Text>
              <div>
                <Text strong>{moneyFormat(record.totalUnpaid || 0)}</Text>
              </div>
            </Col>
          </Row>

          {record.allocatedFees?.length ? (
            <Space direction="vertical" size={0}>
              <Text type="secondary">Danh sách phí</Text>
              {record.allocatedFees.map((item: any, index: number) => (
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
          ) : null}
        </Flex>
      ))}
    </Space>
  );
};

export const LieferscheineList = ({
  page,
}: {
  page: LieferscheinePageState;
}) => {
  const { token } = theme.useToken();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const total = page.listData?.total || 0;
  const rows = page.listData?.data || [];
  const prefetchIndex = Math.max(rows.length - LIEFERSCHEINE_PREFETCH_ITEM_COUNT, 0);
  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLieferscheineLoading,
  } = page;

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage && !isLieferscheineLoading) {
      fetchNextPage();
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
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLieferscheineLoading,
    rows.length,
  ]);

  useEffect(() => {
    if (rows.length <= LIEFERSCHEINE_PREFETCH_ITEM_COUNT) {
      handleLoadMore();
    }
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLieferscheineLoading,
    rows.length,
  ]);

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
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

      {isLieferscheineLoading ? (
        <LieferscheineListSkeleton count={5} />
      ) : rows.length ? (
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <List
            split={false}
            dataSource={rows}
            rowKey={(record: any) => record.code}
            renderItem={(record: any, index) => {
              const expanded = page.expandedCode === record.code;
              const status = getStatusMeta(record, page.statuses);
              const address = getAddressText(record);

              return (
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
                          <Text type="secondary">Mã phiếu giao</Text>
                          <Paragraph
                            copyable={{ text: record.code }}
                            ellipsis={{ rows: 1, tooltip: record.code }}
                            style={{ marginBottom: 0 }}
                          >
                            <Text strong style={{ color: token.colorPrimary }}>
                              {record.code || "---"}
                            </Text>
                          </Paragraph>
                        </Space>
                        <Tag
                          style={{
                            marginInlineEnd: 0,
                            borderColor: status?.color,
                            background: status?.color,
                            color: token.colorWhite,
                          }}
                        >
                          {status?.label}
                        </Tag>
                      </Flex>

                      <Row gutter={[16, 12]}>
                        <Col xs={12}>
                          <Text type="secondary">Số lượng kiện</Text>
                          <div>
                            {record.totalPackage
                              ? `${quantityFormat(record.totalPackage)} kiện hàng`
                              : "---"}
                          </div>
                        </Col>
                        <Col xs={12}>
                          <Text type="secondary">Cân nặng</Text>
                          <div>
                            {Number.isFinite(record.totalWeight)
                              ? `${quantityFormat(record.totalWeight)} kg`
                              : "---"}
                          </div>
                        </Col>
                        <Col xs={12}>
                          <Text type="secondary">Cần thu</Text>
                          <div>{moneyFormat(record.totalUnpaid || 0)}</div>
                        </Col>
                        <Col xs={12}>
                          <Text type="secondary">COD</Text>
                          <div>
                            <Text strong>
                              {moneyFormat(record.totalAmount || 0)}
                            </Text>
                          </div>
                        </Col>
                        <Col xs={24}>
                          <Text type="secondary">Thời gian tạo</Text>
                          <div>{formatDate(record.issueDate)}</div>
                        </Col>
                        <Col xs={24}>
                          <Text type="secondary">Địa chỉ giao hàng</Text>
                          <Tooltip title={address}>
                            <Text ellipsis={{ tooltip: address }}>
                              {address}
                            </Text>
                          </Tooltip>
                        </Col>
                      </Row>

                      {expanded && <LieferscheineExpanded page={page} />}

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
                  </div>
                </List.Item>
              );
            }}
          />
          {isFetchingNextPage && <LieferscheineItemSkeleton />}
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

export const LieferscheinePage = () => {
  const page = useLieferscheineMobilePage();
  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <LieferscheineFilter page={page} />
      <LieferscheineList page={page} />
    </Space>
  );
};
