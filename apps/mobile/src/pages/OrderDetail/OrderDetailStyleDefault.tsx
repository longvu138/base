import { useState } from 'react';
import type { ReactNode } from 'react';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Form,
  Image,
  Input,
  List,
  Modal,
  Popconfirm,
  Row,
  Skeleton,
  Space,
  Tabs,
  Tag,
  Timeline,
  Typography,
  theme,
} from 'antd';
import {
  ArrowLeftOutlined,
  CopyOutlined,
  DatabaseOutlined,
  DownloadOutlined,
  HeartOutlined,
  PlusOutlined,
  SendOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@repo/i18n';
import {
  useAddWishlistItemMutation,
  useClaimStatusesQuery,
  useCreateOrderCommentMutation,
  useOrderClaimsQuery,
  useOrderCommentsQuery,
  useOrderDetailPage,
  useOrderFeesQuery,
  useOrderFinancialsQuery,
  useExportOrderProductsMutation,
  useOrderMilestonesQuery,
  useOrderPackagesQuery,
  useOrderProductsQuery,
  usePackageStatusesQuery,
} from '@repo/hooks';
import { formatOrderLogContent, orderLogRoleLabelKey, useOrderLogsModel } from '@repo/features/order-detail';
import {
  displayOrderDetailMoney,
  displayOrderDetailPercent,
  displayOrderDetailValue,
  displayOrderDetailYuan,
} from '@repo/hooks';
import { moneyFormat, quantityFormat } from '@repo/util';

const { Text, Paragraph, Title } = Typography;

const emptyImage = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

const formatWeight = (value: any) => {
  if (value === null || value === undefined || value === '') return '---';
  return `${Number(value).toLocaleString('vi-VN')}kg`;
};

const formatVolume = (value: any) => {
  if (value === null || value === undefined || value === '') return '---';
  return `${Number(value).toLocaleString('vi-VN')}cm3`;
};

const formatAddress = (address: any) => {
  if (!address) return '---';
  if (typeof address === 'string') return address;

  const parts = [
    address.fullname,
    address.phone,
    address.detail || address.address,
    address.location?.display,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(' / ') : '---';
};

const display = (value: any) => {
  if (value === null || value === undefined || value === '') return '---';
  return String(value);
};

const quantity = (value: any) => {
  if (value === null || value === undefined || value === '') return '---';
  return quantityFormat(value);
};

const productImage = (product: any) =>
  product.variantImage || product.image || product.thumb || product.thumbnail;

const productCode = (product: any) => product.code || product.sku || product.id;

const propertyValues = (product: any) => {
  const properties = product.variantProperties || product.properties || [];
  if (!Array.isArray(properties)) return [];

  return properties
    .map((property: any) => property.value || property.originalValue || property.name)
    .filter(Boolean);
};

const InfoLine = ({ label, children }: { label: string; children: ReactNode }) => (
  <Flex align="flex-start" gap={8} style={{ width: '100%', minWidth: 0 }}>
    <Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
      {label}:
    </Text>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </Flex>
);

const Metric = ({ label, value }: { label: string; value: ReactNode }) => (
  <Col xs={12}>
    <Space direction="vertical" size={0} style={{ width: '100%', minWidth: 0 }}>
      <Text type="secondary" ellipsis={{ tooltip: label }}>
        {label}
      </Text>
      <Text strong ellipsis={{ tooltip: String(value ?? '') }}>
        {value}
      </Text>
    </Space>
  </Col>
);

const ProductTab = ({ orderCode, order }: { orderCode: string; order: any }) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const { data: products = [], isLoading } = useOrderProductsQuery(orderCode);
  const addWishlistMutation = useAddWishlistItemMutation();
  const exportProductsMutation = useExportOrderProductsMutation(orderCode);
  const [savingProductId, setSavingProductId] = useState<string | number | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportSecret, setExportSecret] = useState('');
  const [exporting, setExporting] = useState(false);

  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (!products.length) return <Empty description={t('product_tab.empty_product')} />;

  const hasInspection = Array.isArray(order?.services)
    ? order.services.some((service: any) => service.code === 'inspection')
    : products.some((product: any) => product.receivedQuantity !== undefined);
  const totalQuantity =
    order?.orderedQuantity ?? products.reduce((sum: number, product: any) => sum + Number(product.quantity || 0), 0);
  const purchasedQuantity =
    order?.purchasedQuantity ??
    products.reduce((sum: number, product: any) => sum + Number(product.purchasedQuantity || product.actualQuantity || 0), 0);
  const receivedQuantity =
    order?.receivedQuantity ?? products.reduce((sum: number, product: any) => sum + Number(product.receivedQuantity || 0), 0);

  const handleSave = (id: string | number) => {
    if (savingProductId) return;
    setSavingProductId(id);
    addWishlistMutation.mutate(
      { source: 'order', data: id },
      {
        onSuccess: () => message.success(t('orderDetail.successfully_save')),
        onError: () => message.error(t('orderDetail.product_err')),
        onSettled: () => setSavingProductId(null),
      },
    );
  };

  const handleCopy = async (value: any) => {
    await navigator.clipboard.writeText(display(value));
    message.success(t('common.copied'));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await exportProductsMutation.mutateAsync({ secret: exportSecret });
      const disposition = response.headers?.['content-disposition'] || '';
      const fileName =
        disposition.split('filename=')[1]?.replaceAll('"', '') ||
        `order_products_${orderCode}_${Date.now()}.xlsx`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', decodeURIComponent(fileName));
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setExportOpen(false);
      setExportSecret('');
      message.success(t('order.data_sent_email'));
    } catch {
      message.error(t('product_tab.export_error'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Flex justify="space-between" align="center" gap={token.marginSM} wrap>
        <Text type="secondary">
          {quantity(totalQuantity)}/{purchasedQuantity > 0 ? quantity(purchasedQuantity) : '---'}
          {hasInspection ? `/${receivedQuantity > 0 ? quantity(receivedQuantity) : '---'}` : ''}
        </Text>
        <Button size="small" icon={<DownloadOutlined />} onClick={() => setExportOpen(true)}>
          {t('button.csv')}
        </Button>
      </Flex>
      <List
        split={false}
        dataSource={products}
        rowKey={(product: any) => product.id || product.code}
        renderItem={(product: any) => {
          const id = product.id || product.code;
          const code = productCode(product);
          const image = productImage(product);
          const name = product.name || product.originalName;
          const actualPrice = product.actualPrice ?? product.price;
          const exchangedActualPrice = product.exchangedActualPrice ?? product.unitPrice;
          const totalAmount = product.totalAmount ?? product.amount;
          const exchangedTotalAmount =
            product.exchangedTotalAmount ??
            product.totalPrice ??
            (exchangedActualPrice && product.quantity ? exchangedActualPrice * product.quantity : undefined);

          return (
            <List.Item style={{ paddingInline: 0 }}>
              <Card style={{ width: '100%' }}>
                <Flex gap={token.marginMD} align="flex-start">
                  <Image
                    src={image}
                    width={84}
                    height={84}
                    preview={false}
                    referrerPolicy="no-referrer"
                    fallback={emptyImage}
                    style={{ objectFit: 'cover', borderRadius: token.borderRadius }}
                  />
                  <Space direction="vertical" size={4} style={{ flex: 1, minWidth: 0 }}>
                    <Paragraph ellipsis={{ rows: 2, tooltip: name }} style={{ marginBottom: 0 }}>
                      {product.productUrl ? (
                        <a href={product.productUrl} target="_blank" rel="noreferrer">
                          {display(name)}
                        </a>
                      ) : (
                        display(name)
                      )}
                    </Paragraph>
                    <Space size={4} wrap>
                      <Text type="secondary">{display(code)}</Text>
                      <Button size="small" type="text" icon={<CopyOutlined />} onClick={() => handleCopy(code)} />
                      <Button
                        size="small"
                        type="text"
                        loading={savingProductId === id}
                        icon={<HeartOutlined />}
                        onClick={() => handleSave(id)}
                      />
                    </Space>
                    {propertyValues(product).length > 0 && (
                      <Text type="secondary" ellipsis={{ tooltip: propertyValues(product).join(' / ') }}>
                        {propertyValues(product).join(' / ')}
                      </Text>
                    )}
                    <Row gutter={[8, 8]}>
                      <Metric label={t('order.quantity')} value={quantity(product.quantity)} />
                      <Metric label={t('order.sale_price')} value={moneyFormat(exchangedActualPrice || actualPrice || 0)} />
                      <Metric label={t('order.total_price')} value={moneyFormat(exchangedTotalAmount || totalAmount || 0)} />
                      <Metric label="CNY" value={totalAmount ? displayOrderDetailYuan(totalAmount) : '---'} />
                    </Row>
                  </Space>
                </Flex>
              </Card>
            </List.Item>
          );
        }}
      />
      <Modal
        title={t('modal.confirm_pin')}
        open={exportOpen}
        onCancel={() => setExportOpen(false)}
        onOk={handleExport}
        okText={t('cartCheckout.confirm')}
        cancelText={t('cartCheckout.cancel')}
        confirmLoading={exporting || exportProductsMutation.isPending}
      >
        <Input.Password
          autoFocus
          value={exportSecret}
          placeholder={t('shipments.input_pin')}
          onChange={(event) => setExportSecret(event.target.value)}
          onPressEnter={handleExport}
        />
      </Modal>
    </Space>
  );
};

const FeeTab = ({ orderCode, order }: { orderCode: string; order: any }) => {
  const { t } = useTranslation();
  const { data: fees = [], isLoading } = useOrderFeesQuery(orderCode);

  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;

  const feeRows = Array.isArray(fees)
    ? [...fees].sort((a: any, b: any) => Number(a.position || 0) - Number(b.position || 0))
    : [];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Row gutter={[12, 12]}>
        <Metric label={t('orderDetail.total_cost')} value={displayOrderDetailMoney(order?.grandTotal)} />
        <Metric label={t('orderDetail.total_need_payment')} value={displayOrderDetailMoney(order?.totalUnpaid ?? 0)} />
        <Metric label={t('orderDetail.deposit_rate')} value={order?.emdPercent != null ? `${order.emdPercent}%` : displayOrderDetailPercent(order?.depositRate)} />
        <Metric label={t('orderDetail.exchange_rate')} value={order?.exchangeRate ? `¥1 = ${moneyFormat(order.exchangeRate)}` : '---'} />
      </Row>
      <Divider style={{ margin: '8px 0' }} />
      {feeRows.length ? (
        <List
          split={false}
          dataSource={feeRows}
          rowKey={(fee: any) => fee.id || fee.code || fee.type?.code}
          renderItem={(fee: any) => (
            <List.Item style={{ paddingInline: 0 }}>
              <Card size="small" style={{ width: '100%' }}>
                <Flex justify="space-between" align="flex-start" gap={8}>
                  <Text>{fee.type?.name || fee.service || fee.code || '---'}</Text>
                  <Text strong>{moneyFormat(fee.actualAmount ?? fee.amount ?? 0)}</Text>
                </Flex>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Empty description={t('common.no_data')} />
      )}
    </Space>
  );
};

const PackageTab = ({ orderCode }: { orderCode: string }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { data: packages = [], isLoading } = useOrderPackagesQuery(orderCode);
  const { data: statuses = [] } = usePackageStatusesQuery();

  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (!packages.length) return <Empty description={t('orderDetail.empty_package')} />;

  return (
    <List
      split={false}
      dataSource={packages}
      rowKey={(record: any) => record.id || record.code}
      renderItem={(record: any) => {
        const status = statuses.find((item: any) => item.code === record.status) || {};
        return (
          <List.Item style={{ paddingInline: 0 }}>
            <Card style={{ width: '100%' }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Flex justify="space-between" align="flex-start" gap={token.marginSM} wrap>
                  <Text strong>#{record.code}</Text>
                  <Tag color={status.color || 'default'} style={{ marginInlineEnd: 0 }}>
                    {status.name || record.status || '---'}
                  </Tag>
                </Flex>
                <Row gutter={[12, 8]}>
                  <Metric label={t('package.weight')} value={record.weight ? `${record.weight} kg` : '---'} />
                  <Metric label={t('package.quantity')} value={record.quantity || record.totalQuantity || '---'} />
                  <Metric label={t('orderDetail.volume')} value={record.volume ? `${record.volume} cm3` : '---'} />
                  <Metric label={t('orders.columns.created_at')} value={record.createdAt ? dayjs(record.createdAt).format('HH:mm DD/MM/YYYY') : '---'} />
                </Row>
              </Space>
            </Card>
          </List.Item>
        );
      }}
    />
  );
};

const TransactionTab = ({ orderCode }: { orderCode: string }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { data: financials, isLoading } = useOrderFinancialsQuery(orderCode);

  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;

  const data = (Array.isArray(financials) ? financials : financials ? [financials] : []).sort(
    (a: any, b: any) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf(),
  );

  if (!data.length) return <Empty description={t('financial_tab.empty_transaction')} />;

  return (
    <List
      split={false}
      dataSource={data}
      rowKey={(record: any) => record.id || record.txid}
      renderItem={(record: any) => (
        <List.Item style={{ paddingInline: 0 }}>
          <Card style={{ width: '100%' }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Flex justify="space-between" gap={8}>
                <Text type="secondary">{record.timestamp ? dayjs(record.timestamp).format('HH:mm DD/MM/YYYY') : '---'}</Text>
                <Text style={{ color: Number(record.amount) >= 0 ? token.colorSuccess : token.colorError }}>
                  {Number(record.amount) >= 0 ? `+${moneyFormat(record.amount)}` : moneyFormat(record.amount)}
                </Text>
              </Flex>
              <Text>{record.type?.name || t('financial_tab.transaction')}</Text>
              <Text type="secondary">
                <DatabaseOutlined /> {t('financial_tab.code')}: {record.txid || '---'}
              </Text>
              <Text>{record.memo || '---'}</Text>
            </Space>
          </Card>
        </List.Item>
      )}
    />
  );
};

const ClaimTab = ({ orderCode }: { orderCode: string }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { data: claims = [], isLoading, isError } = useOrderClaimsQuery(orderCode);
  const { data: statuses = [] } = useClaimStatusesQuery();
  const data = !isError && Array.isArray(claims)
    ? [...claims].sort((a: any, b: any) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
    : [];

  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;

  if (!data.length) {
    return (
      <Empty description={t('complaint_tab.empty_claim_title')}>
        <Link to={`/tickets/create?orderCode=${orderCode}`}>
          <Button type="primary" icon={<PlusOutlined />}>
            {t('tickets.create')}
          </Button>
        </Link>
      </Empty>
    );
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Flex justify="space-between" align="center" wrap gap={token.marginSM}>
        <Text strong>
          {t('ticket_add.list_claims')} ({quantityFormat(data.length)})
        </Text>
        <Link to={`/tickets/create?orderCode=${orderCode}`}>
          <Button size="small" type="primary" ghost icon={<PlusOutlined />}>
            {t('complaint_tab.create_complaint')}
          </Button>
        </Link>
      </Flex>
      <List
        split={false}
        dataSource={data}
        rowKey={(claim: any) => claim.code}
        renderItem={(claim: any) => {
          const status =
            claim.publicStateNewView ||
            (typeof claim.status === 'object' ? claim.status : undefined) ||
            statuses.find((item: any) => item.code === claim.status || item.code === claim.state) ||
            {};
          return (
            <List.Item style={{ paddingInline: 0 }}>
              <Card style={{ width: '100%' }}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Flex justify="space-between" gap={8} wrap>
                    <Text strong>#{claim.code}</Text>
                    <Tag color={status.color || 'warning'} style={{ marginInlineEnd: 0 }}>
                      {status.name || '---'}
                    </Tag>
                  </Flex>
                  <Text>{claim.name || claim.subject || claim.title || claim.content || '---'}</Text>
                  <Flex justify="space-between" gap={8}>
                    <Text type="secondary">{claim.createdAt ? dayjs(claim.createdAt).format('HH:mm DD/MM') : '---'}</Text>
                    <Text strong style={{ color: token.colorSuccess }}>
                      {moneyFormat(claim.totalRefund || 0)}
                    </Text>
                  </Flex>
                </Space>
              </Card>
            </List.Item>
          );
        }}
      />
    </Space>
  );
};

const HistoryTab = ({ orderCode }: { orderCode: string }) => {
  const { t } = useTranslation();
  const { data: milestones = [], isLoading } = useOrderMilestonesQuery(orderCode);

  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (!milestones.length) return <Empty description={t('history_tab.empty_history')} />;

  return (
    <Timeline
      items={milestones.map((item: any, index: number) => ({
        color: index === 0 ? 'red' : 'green',
        children: (
          <Space direction="vertical" size={2}>
            <Text strong>{item.status || '---'}</Text>
            <Text type="secondary">{item.timestamp ? dayjs(item.timestamp).format('HH:mm DD/MM') : '---'}</Text>
            <Text type="secondary">
              {item.handlingTime === null || item.handlingTime === undefined
                ? `(${t('orderDetail.undefined')})`
                : `(${item.handlingTime} ${Number(item.handlingTime) > 1 ? t('label.days') : t('label.day')})`}
            </Text>
          </Space>
        ),
      }))}
    />
  );
};

const LogTab = ({ order, orderCode }: { order: any; orderCode: string }) => {
  const { t } = useTranslation();
  const logModel = useOrderLogsModel({ order, orderCode, t });

  if (logModel.isLoading) return <Skeleton active paragraph={{ rows: 8 }} />;
  if (logModel.isError) return <Empty description={t('orderDetail.empty_log')} />;

  return (
    <List
      itemLayout="vertical"
      dataSource={logModel.logs}
      locale={{ emptyText: <Empty description={t('orderDetail.empty_log')} /> }}
      loadMore={
        logModel.hasNextPage ? (
          <Flex justify="center" style={{ paddingTop: 8 }}>
            <Button type="link" loading={logModel.isFetchingNextPage} onClick={() => logModel.fetchNextPage()}>
              {t('log_product.loading_more')}
            </Button>
          </Flex>
        ) : null
      }
      renderItem={(item: any) => (
        <List.Item style={{ paddingInline: 0 }}>
          <Card size="small" style={{ width: '100%' }}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text type="secondary">
                {dayjs(item.timestamp).format('HH:mm DD/MM/YYYY')}, {t(orderLogRoleLabelKey(item.role))}:{' '}
                <Text strong>{item.fullname}</Text>
              </Text>
              <div
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                dangerouslySetInnerHTML={{ __html: formatOrderLogContent(item, t) }}
              />
              {item.storageDescription && <Text strong>{item.storageDescription}</Text>}
            </Space>
          </Card>
        </List.Item>
      )}
    />
  );
};

const CommentPanel = ({ orderCode }: { orderCode: string }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { data: comments = [], isLoading } = useOrderCommentsQuery(orderCode);
  const createComment = useCreateOrderCommentMutation(orderCode);

  const submit = async () => {
    const values = await form.validateFields();
    await createComment.mutateAsync(values.content);
    form.resetFields();
  };

  return (
    <Card>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Title level={5} style={{ margin: 0 }}>
          {t('chat.title') || 'Trao đổi'}
        </Title>
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : comments.length ? (
          <List
            dataSource={comments}
            rowKey={(item: any) => item.id}
            renderItem={(item: any) => (
              <List.Item style={{ paddingInline: 0 }}>
                <Space direction="vertical" size={2}>
                  <Text strong>{item.creator?.fullname || item.creator?.username || item.actor?.fullname || '---'}</Text>
                  <Text>{item.content || item.message || '---'}</Text>
                  <Text type="secondary">{item.createdAt ? dayjs(item.createdAt).format('HH:mm DD/MM/YYYY') : '---'}</Text>
                </Space>
              </List.Item>
            )}
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('common.no_data')} />
        )}
        <Form form={form} layout="vertical">
          <Form.Item name="content" rules={[{ required: true, message: t('validation.required') || 'Bắt buộc' }]} style={{ marginBottom: 8 }}>
            <Input.TextArea rows={3} placeholder={t('chat.placeholder') || 'Nhập nội dung'} />
          </Form.Item>
          <Flex justify="flex-end">
            <Button type="primary" icon={<SendOutlined />} loading={createComment.isPending} onClick={submit}>
              {t('button.send') || 'Gửi'}
            </Button>
          </Flex>
        </Form>
      </Space>
    </Card>
  );
};

export const OrderDetailStyleDefault = () => {
  const { t } = useTranslation();
  const { notification } = App.useApp();
  const { token } = theme.useToken();
  const [isExpand, setIsExpand] = useState(true);
  const {
    activeTab,
    code,
    detailQuery,
    handleCancelOrder,
    handleReorder,
    handleTabChange,
    handleUpdate,
    isCancellingOrder,
    isReordering,
    isUpdating,
    navigate,
    order,
    services,
    statusInfo,
    memberLevelName,
  } = useOrderDetailPage();

  if (detailQuery.isLoading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 14 }} />
      </Card>
    );
  }

  if (detailQuery.isError || !order) {
    return (
      <Card>
        <Empty
          image={<ShoppingCartOutlined style={{ color: token.colorTextTertiary, fontSize: 48 }} />}
          description={t('orderDetail.not_found')}
        >
          <Button type="primary" onClick={() => navigate('/orders')}>
            {t('orderDetail.back_to_orders')}
          </Button>
        </Empty>
      </Card>
    );
  }

  const merchantName = order.merchantName || order.merchantCode || order.shopName || order.shop?.name;
  const marketplaceImage = order.marketplace?.image;
  const customerCode = order.refCustomerCode || order.customerCode || '';
  const customerOrderCode = order.refOrderCode || order.customerOrderCode || '';
  const needPay = order.totalUnpaid ?? order.grandTotal;
  const baseAddress = order.address || order.shippingAddress || order.deliveryAddress;
  const receiptAddress = order.receiptAddress;
  const exchangeRate = order.exchangeRate ? `¥1 = ${moneyFormat(order.exchangeRate)} ₫` : '---';
  const canCancelOrder = Boolean(statusInfo?.cancellable);

  const handleConfirmCancelOrder = async () => {
    try {
      await handleCancelOrder();
      notification.success({ message: t('orderDetail.order_cancel') });
    } catch {
      notification.error({ message: t('message.update_failed') });
    }
  };

  const handleConfirmReorder = async () => {
    try {
      await handleReorder();
      notification.success({ message: t('orderDetail.re_order_success') });
      navigate('/carts');
    } catch {
      notification.error({ message: t('message.update_failed') });
    }
  };

  const metrics = [
    { label: t('orderDetail.member'), value: memberLevelName },
    { label: t('orderDetail.deposit_rate'), value: order.emdPercent != null ? `${order.emdPercent}%` : displayOrderDetailPercent(order.depositRate) },
    { label: t('orderDetail.costing_weight'), value: formatWeight(order.actualWeight || order.chargeableWeight) },
    { label: t('orderDetail.net_weight'), value: formatWeight(order.netWeight || order.actualWeight) },
    { label: t('orderDetail.packaging_weight'), value: formatWeight(order.packagingWeight || order.packageWeight) },
    { label: t('orderDetail.dimensional_weight'), value: formatWeight(order.dimensionalWeight || order.convertedWeight) },
    { label: t('orderDetail.volume'), value: formatVolume(order.volumetric || order.totalVolume) },
    { label: t('orderDetail.exchange_rate'), value: exchangeRate },
  ];

  const tabItems = [
    { key: 'products', label: t('orderDetail.products'), children: <ProductTab orderCode={code} order={order} /> },
    { key: 'fees', label: t('orderDetail.financial'), children: <FeeTab orderCode={code} order={order} /> },
    { key: 'packages', label: t('orderDetail.packages'), children: <PackageTab orderCode={code} /> },
    { key: 'financial', label: t('orderDetail.transactions'), children: <TransactionTab orderCode={code} /> },
    { key: 'tickets', label: t('orderDetail.claims'), children: <ClaimTab orderCode={code} /> },
    { key: 'history', label: t('orderDetail.history'), children: <HistoryTab orderCode={code} /> },
    { key: 'log', label: t('orderDetail.log'), children: <LogTab orderCode={code} order={order} /> },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Flex justify="space-between" align="center" wrap gap={token.marginSM}>
        <Link to="/orders">
          <Space>
            <ArrowLeftOutlined className="text-primary" />
            <Text className="text-primary">{t('orderDetail.order_list')}</Text>
          </Space>
        </Link>
        <Button type="primary" ghost loading={isReordering} onClick={handleConfirmReorder}>
          {t('orderDetail.re_order')}
        </Button>
      </Flex>

      {order.deliveryNotice && (
        <Alert
          type="success"
          showIcon
          message={<Text strong>{t('orders.notice.title')}</Text>}
          description={
            <Text>
              {t('orderDetail.delivery_notice_1')}{' '}
              <Link to="/delivery/create">{t('orderDetail.delivery_notice_2')}</Link>{' '}
              {t('orderDetail.delivery_notice_3')}
            </Text>
          }
        />
      )}

      <Card style={{ borderTop: `3px solid ${token.colorSuccess}` }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Flex justify="space-between" align="flex-start" wrap gap={token.marginSM}>
            <Space size={token.marginSM} style={{ minWidth: 0, flex: 1 }}>
              <Image
                src={order?.image}
                width={48}
                height={48}
                preview={false}
                fallback={emptyImage}
                referrerPolicy="no-referrer"
                style={{ background: token.colorFillTertiary, borderRadius: token.borderRadius, objectFit: 'cover' }}
              />
              <Space direction="vertical" size={4} style={{ minWidth: 0 }}>
                <Text strong ellipsis={{ tooltip: order.code }}>
                  #{displayOrderDetailValue(order.code)}
                </Text>
                <Tag color={statusInfo?.color || 'default'} style={{ marginInlineEnd: 0 }}>
                  {statusInfo?.name || displayOrderDetailValue(order.status)}
                </Tag>
              </Space>
            </Space>
            <Space direction="vertical" size={4} align="end">
              <Text type="secondary">{t('orderDetail.total_cost')}</Text>
              <Text strong style={{ fontSize: token.fontSizeLG }}>
                {displayOrderDetailMoney(order.grandTotal)}
              </Text>
            </Space>
          </Flex>

          <Space size={token.marginXS} style={{ minWidth: 0, width: '100%' }}>
            {marketplaceImage && <img width={16} height={16} src={marketplaceImage} alt="" referrerPolicy="no-referrer" />}
            <Text type="secondary">{t('orderDetail.seller')}:</Text>
            <Text strong ellipsis={{ tooltip: merchantName }} style={{ minWidth: 0 }}>
              {displayOrderDetailValue(merchantName)}
            </Text>
          </Space>

          <Flex gap={token.marginSM} wrap>
            <Link to={`/tickets/create?orderCode=${order.code}`}>
              <Button>{t('orderDetail.complaint_order')}</Button>
            </Link>
            {canCancelOrder && (
              <Popconfirm
                title={t('orderDetail.confirm_question')}
                okText={t('button.yes')}
                cancelText={t('button.no')}
                onConfirm={handleConfirmCancelOrder}
              >
                <Button danger ghost loading={isCancellingOrder}>
                  {t('orderDetail.cancel_order')}
                </Button>
              </Popconfirm>
            )}
          </Flex>

          {isExpand && (
            <>
              <Divider style={{ margin: '8px 0' }} />
              <Row gutter={[12, 12]}>
                {metrics.map((item) => (
                  <Metric key={item.label} label={item.label} value={item.value} />
                ))}
              </Row>

              {needPay > 0 && (
                <>
                  <Divider style={{ margin: '8px 0' }} />
                  <InfoLine label={t('orderDetail.total_need_payment')}>
                    <Text strong style={{ color: token.colorPrimary }}>
                      {displayOrderDetailMoney(needPay)}
                    </Text>
                  </InfoLine>
                </>
              )}

              <Divider style={{ margin: '8px 0' }} />
              <InfoLine label={t('orderDetail.service')}>
                <Text>{Array.isArray(order.services) ? order.services.map((service: any) => service.name || service).join(', ') : services}</Text>
              </InfoLine>
              <InfoLine label={receiptAddress ? t('orderDetail.delivery_receiptAddress') : t('orderDetail.delivery_address')}>
                <Text>{formatAddress(baseAddress)}</Text>
              </InfoLine>
              {receiptAddress && (
                <InfoLine label={t('orderDetail.delivery_address')}>
                  <Text>{formatAddress(receiptAddress)}</Text>
                </InfoLine>
              )}
              {order.remark && (
                <InfoLine label={t('orderDetail.note_order')}>
                  <Text>{order.remark}</Text>
                </InfoLine>
              )}
              <InfoLine label={t('orderDetail.personal_note')}>
                <Text
                  editable={{
                    text: order.note || '',
                    tooltip: t('orderDetail.edit_note'),
                    onChange: (value) => handleUpdate('note', value, order.note || ''),
                  }}
                  disabled={isUpdating}
                >
                  {displayOrderDetailValue(order.note)}
                </Text>
              </InfoLine>
              <InfoLine label={t('orderDetail.ref_customer_code')}>
                <Text
                  editable={{
                    text: customerCode,
                    tooltip: t('orderDetail.edit_ref_customer_code'),
                    onChange: (value) => handleUpdate('refCustomerCode', value, customerCode),
                  }}
                  disabled={isUpdating}
                >
                  {displayOrderDetailValue(customerCode)}
                </Text>
              </InfoLine>
              <InfoLine label={t('orderDetail.ref_order_code')}>
                <Text
                  editable={{
                    text: customerOrderCode,
                    tooltip: t('orderDetail.edit_ref_order_code'),
                    onChange: (value) => handleUpdate('refOrderCode', value, customerOrderCode),
                  }}
                  disabled={isUpdating}
                >
                  {displayOrderDetailValue(customerOrderCode)}
                </Text>
              </InfoLine>
            </>
          )}

          <Button type="link" onClick={() => setIsExpand((current) => !current)}>
            {isExpand ? t('orderDetail.collapse') : t('orderDetail.show_more')}
          </Button>
        </Space>
      </Card>

      <Card styles={{ body: { paddingTop: 0 } }}>
        <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} />
      </Card>

      <CommentPanel orderCode={code} />
    </Space>
  );
};
