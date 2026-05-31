import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import dayjs from 'dayjs';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
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
  Typography,
  theme,
} from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { FilterPanel, PinModal } from '@repo/ui';
import { moneyFormat, quantityFormat } from '@repo/util';
import { OrderNoteEditor, useOrdersMobileModel } from '@repo/features/orders';

const { Text, Paragraph, Link } = Typography;

type OrdersMobilePageState = ReturnType<typeof useOrdersMobileModel>;

const emptyImage =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

const getStatusMeta = (status: string, statusData: any[] = []) =>
  statusData.find((item) => item.code === status) || { code: status, name: status };

const OrderCardSkeleton = () => {
  const { token } = theme.useToken();

  return (
    <Card>
      <Flex vertical gap={token.marginMD}>
        <Flex gap={token.marginSM} align="flex-start">
          <Skeleton.Image active style={{ width: 72, height: 72 }} />
          <Space direction="vertical" size={token.marginXS} style={{ flex: 1 }}>
            <Skeleton.Input active size="small" style={{ width: 128 }} />
            <Skeleton.Input active size="small" style={{ width: '80%' }} />
            <Skeleton.Button active size="small" style={{ width: 96 }} />
          </Space>
        </Flex>
        <Row gutter={[12, 12]}>
          {[0, 1, 2, 3].map((item) => (
            <Col xs={12} key={item}>
              <Skeleton.Input active size="small" style={{ width: '100%' }} />
            </Col>
          ))}
        </Row>
      </Flex>
    </Card>
  );
};

const OrdersFilter = ({ page }: { page: OrdersMobilePageState }) => {
  const { token } = theme.useToken();

  return (
    <Card className="shadow-sm">
      <FilterPanel
        form={page.form}
        onSearch={page.handleSearch}
        onReset={page.handleReset}
        loading={page.isOrderLoading}
        searchText={page.t('orders.buttons.search')}
        resetText={page.t('orders.buttons.reset')}
        showCollapseAll
        primaryContent={
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Form.Item name="statuses" label={page.t('orders.filters.status')} style={{ marginBottom: 0 }}>
              <Checkbox.Group style={{ width: '100%' }}>
                <Flex wrap gap={token.marginXS}>
                  {page.statusOptions.map((item: any) => (
                    <Checkbox key={item.value} value={item.value}>
                      {item.label} {Number(item.count) > 0 ? `(${item.count})` : ''}
                    </Checkbox>
                  ))}
                </Flex>
              </Checkbox.Group>
            </Form.Item>

            <Form.Item name="query" label={page.t('orders.search_placeholder')} style={{ marginBottom: 0 }}>
              <Input
                allowClear
                prefix={<SearchOutlined />}
                placeholder={page.t('orders.search_placeholder')}
                onPressEnter={page.handleSearch}
              />
            </Form.Item>
            <Form.Item name="note" label={page.t('orders.filters.note')} style={{ marginBottom: 0 }}>
              <Input allowClear placeholder={page.t('orders.filters.note')} />
            </Form.Item>
            <Row gutter={[12, 12]}>
              <Col xs={12}>
                <Form.Item name="timestampFrom" label={page.t('orders.filters.created_at')} style={{ marginBottom: 0 }}>
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder={page.t('orders.filters.start_date')} />
                </Form.Item>
              </Col>
              <Col xs={12}>
                <Form.Item name="timestampTo" label=" " style={{ marginBottom: 0 }}>
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder={page.t('orders.filters.end_date')} />
                </Form.Item>
              </Col>
            </Row>
          </Space>
        }
        secondaryContent={
          <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: token.marginMD }}>
            <Row gutter={[12, 12]}>
              <Col xs={12}>
                <Form.Item name="refOrderCode" label={page.t('orders.filters.ref_order_code')} style={{ marginBottom: 0 }}>
                  <Input allowClear placeholder={page.t('orders.filters.ref_order_code')} />
                </Form.Item>
              </Col>
              <Col xs={12}>
                <Form.Item name="refCustomerCode" label={page.t('orders.filters.ref_customer_code')} style={{ marginBottom: 0 }}>
                  <Input allowClear placeholder={page.t('orders.filters.ref_customer_code')} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="needPaid" valuePropName="checked" style={{ marginBottom: 0 }}>
              <Checkbox>{page.t('orders.filters.financial_payment')}</Checkbox>
            </Form.Item>
            <Form.Item name="marketplaces" label={page.t('orders.filters.source')} style={{ marginBottom: 0 }}>
              <Checkbox.Group style={{ width: '100%' }}>
                <Flex wrap gap={token.marginXS}>
                  {page.marketplacesData?.map((item: any) => (
                    <Checkbox key={item.code} value={item.code}>
                      {item.name}
                    </Checkbox>
                  ))}
                </Flex>
              </Checkbox.Group>
            </Form.Item>
            <Form.Item name="services" label={page.t('orders.filters.services')} style={{ marginBottom: 0 }}>
              <Checkbox.Group style={{ width: '100%' }}>
                <Flex wrap gap={token.marginXS}>
                  {page.servicesData?.map((item: any) => (
                    <Checkbox key={item.code} value={item.code}>
                      {item.name}
                    </Checkbox>
                  ))}
                </Flex>
              </Checkbox.Group>
            </Form.Item>
          </Space>
        }
      />
    </Card>
  );
};

const OrderMetric = ({ label, value, danger }: { label: string; value: ReactNode; danger?: boolean }) => (
  <Col xs={12}>
    <Space direction="vertical" size={0} style={{ width: '100%', minWidth: 0 }}>
      <Text type="secondary" ellipsis={{ tooltip: label }}>
        {label}
      </Text>
      <Text strong type={danger ? 'danger' : undefined} ellipsis={{ tooltip: String(value ?? '') }}>
        {value}
      </Text>
    </Space>
  </Col>
);

const OrderCard = ({ page, record, sentinelRef }: { page: OrdersMobilePageState; record: any; sentinelRef?: (node: HTMLDivElement | null) => void }) => {
  const { token } = theme.useToken();
  const status = getStatusMeta(record?.status, page.statusData || []);
  const hasInspection = record?.services?.some((item: any) => item.code === 'inspection');
  const quantityText = `${quantityFormat(record?.orderedQuantity)}/${quantityFormat(record?.purchasedQuantity)}${
    hasInspection ? `/${quantityFormat(record?.receivedQuantity)}` : ''
  }`;
  const merchantName = record?.merchantName || record?.merchantCode || '---';

  return (
    <div ref={sentinelRef}>
      <Card hoverable onClick={() => page.navigateToDetail(record?.code)}>
        <Flex vertical gap={token.marginMD}>
          <Flex justify="space-between" align="flex-start" gap={token.marginSM} wrap>
            <Space size="small" style={{ minWidth: 0, flex: 1 }}>
              <Image
                src={record?.marketplace?.image}
                height={28}
                width={28}
                preview={false}
                referrerPolicy="no-referrer"
                fallback={emptyImage}
                style={{
                  borderRadius: token.borderRadius,
                  objectFit: 'cover',
                  background: token.colorFillQuaternary,
                  border: `1px solid ${token.colorBorderSecondary}`,
                }}
                onClick={(event) => event.stopPropagation()}
              />
              <Space direction="vertical" size={0} style={{ minWidth: 0 }}>
                <Paragraph
                  copyable={record?.code ? { text: record.code } : false}
                  ellipsis={{ rows: 1, tooltip: record?.code }}
                  style={{ margin: 0 }}
                  onClick={(event) => event.stopPropagation()}
                >
                  <Link strong onClick={() => page.navigateToDetail(record?.code)}>
                    #{record?.code || '---'}
                  </Link>
                </Paragraph>
                <Text type="secondary" ellipsis={{ tooltip: merchantName }} style={{ maxWidth: 190 }}>
                  {merchantName}
                </Text>
              </Space>
            </Space>
            <Tag color={status.color || 'default'} style={{ marginInlineEnd: 0, maxWidth: '100%' }}>
              {status.name || record?.status || '---'}
            </Tag>
          </Flex>

          <Flex gap={token.marginMD} align="flex-start">
            <Image
              src={record?.image}
              height={88}
              width={88}
              preview={false}
              fallback={emptyImage}
              referrerPolicy="no-referrer"
              style={{ borderRadius: token.borderRadius, objectFit: 'cover' }}
            />
            <Space direction="vertical" size="small" style={{ flex: 1, minWidth: 0 }} onClick={(event) => event.stopPropagation()}>
              <Text type="secondary">{page.t('orders.columns.note')}:</Text>
              <OrderNoteEditor record={record} updateOrderNote={page.updateOrderNote} />
            </Space>
          </Flex>

          {Array.isArray(record?.services) && record.services.length > 0 ? (
            <Flex wrap gap={token.marginXS}>
              {record.services.map((service: any) => (
                <Tag key={service.code || service.name} style={{ marginInlineEnd: 0 }}>
                  {service.name || service.code}
                </Tag>
              ))}
            </Flex>
          ) : null}

          <Row gutter={[12, 12]}>
            <OrderMetric label={page.t('orders.metrics.quantity')} value={quantityText} />
            <OrderMetric label={page.t('orders.metrics.fee_total')} value={moneyFormat(record?.grandTotal || 0, record?.currency)} />
            <OrderMetric label={page.t('orders.metrics.goods_money')} value={moneyFormat(record?.exchangedTotalValue || 0, record?.currency)} />
            <OrderMetric
              label={record?.totalUnpaid < 0 ? page.t('orders.metrics.excess_cash') : page.t('orders.metrics.need_payment')}
              value={moneyFormat(Math.abs(record?.totalUnpaid || 0), record?.currency)}
              danger={record?.totalUnpaid >= 0}
            />
            <OrderMetric label={page.t('order.discountAmount')} value={record?.discountAmount !== undefined ? moneyFormat(record.discountAmount, record?.currency) : '---'} />
            <OrderMetric label={page.t('orders.metrics.weight')} value={record?.actualWeight || record?.chargeableWeight ? `${record.actualWeight || record.chargeableWeight}kg` : '---'} />
            <OrderMetric label={page.t('orders.metrics.packages')} value={record?.totalPackages || record?.totalPackage || '---'} />
            <OrderMetric label={page.t('orders.columns.created_at')} value={record?.createdAt ? dayjs(record.createdAt).format('HH:mm DD/MM/YYYY') : '---'} />
          </Row>
        </Flex>
      </Card>
    </div>
  );
};

const OrdersList = ({ page }: { page: OrdersMobilePageState }) => {
  const { token } = theme.useToken();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const rows = page.orderData?.data || [];
  const total = page.orderData?.total || 0;
  const sentinelIndex = Math.max(rows.length - 5, 0);

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      if (!node || !page.hasNextPage || page.isFetchingNextPage || page.isOrderLoading) return;

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && page.hasNextPage && !page.isFetchingNextPage) {
          page.fetchNextPage();
        }
      }, { rootMargin: '200px 0px' });
      observerRef.current.observe(node);
    },
    [page],
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      {page.deliveryReadyCount > 0 ? (
        <Alert
          type="info"
          showIcon
          message={page.t('orders.notice.title')}
          description={
            <Text>
              {page.t('orders.notice.have')} <Text strong>{quantityFormat(page.deliveryReadyCount)}</Text>{' '}
              {page.t('orders.notice.order_at_stock')}, {page.t('orders.notice.please')}{' '}
              <Link onClick={page.navigateToCreateDelivery}>{page.t('orders.notice.delivery_request')}</Link>{' '}
              {page.t('orders.notice.to_delivery')}
            </Text>
          }
        />
      ) : null}

      <Flex justify="space-between" align="center" wrap gap={token.marginSM}>
        <Space size="small">
          <Text strong>{page.t('orders.title')}</Text>
          <Tag color="blue">{quantityFormat(total)}</Tag>
        </Space>
        <Button icon={<DownloadOutlined />} onClick={() => setExportOpen(true)}>
          {page.t('button.csv')}
        </Button>
      </Flex>

      {page.isOrderLoading ? (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <OrderCardSkeleton key={index} />
          ))}
        </Space>
      ) : rows.length ? (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <List
            split={false}
            dataSource={rows}
            rowKey={(record: any) => record.id || record.code}
            renderItem={(record: any, index) => (
              <List.Item style={{ padding: 0, borderBlockEnd: 'none', marginBottom: index === rows.length - 1 ? 0 : token.marginMD }}>
                <OrderCard page={page} record={record} sentinelRef={index === sentinelIndex ? sentinelRef : undefined} />
              </List.Item>
            )}
          />
          {page.isFetchingNextPage ? <OrderCardSkeleton /> : null}
          {!page.hasNextPage ? <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>Đã tải hết dữ liệu</Text> : null}
        </Space>
      ) : (
        <Card>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={page.t('common.no_data')} />
        </Card>
      )}

      <PinModal
        open={exportOpen}
        confirmLoading={page.exportMutation.isPending}
        onConfirm={async (secret) => {
          await page.handleExport(secret);
          setExportOpen(false);
        }}
        onCancel={() => setExportOpen(false)}
        t={page.t}
      />
    </Space>
  );
};

export const OrdersMobileView = ({ page }: { page: OrdersMobilePageState }) => (
  <Space direction="vertical" size="large" style={{ width: '100%' }}>
    <OrdersFilter page={page} />
    <OrdersList page={page} />
  </Space>
);
