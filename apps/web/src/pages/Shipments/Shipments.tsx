import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
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
    List,
    Pagination,
    Row,
    Select,
    Skeleton,
    Space,
    Statistic,
    Tag,
    Typography,
} from 'antd';
import {
    DownOutlined,
    FileSearchOutlined,
    RedoOutlined,
    RightOutlined,
    SearchOutlined,
    UpOutlined,
} from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { useShipmentsPage } from './hooks/useShipmentsPage';

const { Text, Title } = Typography;

const formatDate = (value?: string) => value ? dayjs(value).format('HH:mm DD/MM/YYYY') : '---';

const formatNumber = (value?: number | string) => {
    const numericValue = Number(value ?? 0);
    return Number.isFinite(numericValue) ? new Intl.NumberFormat('vi-VN').format(numericValue) : '0';
};

const formatMoney = (value?: number | string, currency?: string) => {
    const numericValue = Number(value ?? 0);
    const suffix = currency ? ` ${currency}` : '';
    return `${formatNumber(numericValue)}${suffix}`;
};

const getFirstValue = (record: Record<string, any>, keys: string[]) => {
    for (const key of keys) {
        if (record[key]) return record[key];
    }
    return undefined;
};

export const Shipments: React.FC<{ isTabView?: boolean }> = ({ isTabView }) => {
    const [expanded, setExpanded] = useState(false);
    const {
        t,
        form,
        page,
        pageSize,
        setPage,
        setPageSize,
        shipmentData,
        isShipmentLoading,
        statusData,
        servicesData,
        isServicesLoading,
        statusOptions,
        handleSearch,
        clearFilters,
    } = useShipmentsPage();

    const statusByCode = useMemo(() => {
        return new Map((statusData || []).map((item: any) => [item.code, item]));
    }, [statusData]);

    const total = shipmentData?.total || 0;

    const renderInfo = (label: string, value?: React.ReactNode) => (
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <Text type="secondary">{label}</Text>
            <Text strong>{value || '---'}</Text>
        </Space>
    );

    const renderShipmentItem = (item: any) => {
        const status: any = statusByCode.get(item.status);
        const waybill = getFirstValue(item, ['wayBill', 'waybillCode']);
        const merchant = getFirstValue(item, ['merchantName', 'shopName']);
        const refShipmentCode = getFirstValue(item, ['refShipmentCode', 'orderCode']);
        const refCustomerCode = getFirstValue(item, ['refCustomerCode', 'customerCode']);

        return (
            <List.Item style={{ paddingInline: 0 }}>
                <Card
                    size="small"
                    style={{ width: '100%' }}
                    title={
                        <Flex justify="space-between" align="center" gap={12} wrap>
                            <Space wrap>
                                <Typography.Paragraph copyable={{ text: item.code }} style={{ marginBottom: 0 }}>
                                    <Link to={`/shipments/${item.code}`}>
                                        <Text strong>{item.code}</Text>
                                    </Link>
                                </Typography.Paragraph>
                                <Tag color={status?.color || 'processing'}>{status?.name || item.status || '---'}</Tag>
                            </Space>
                            <Space>
                                <Text type="secondary">{formatDate(item.timestamp || item.createdAt)}</Text>
                                <Link to={`/shipments/${item.code}`}>
                                    <Button type="primary" icon={<RightOutlined />}>
                                        {t('button.detail')}
                                    </Button>
                                </Link>
                            </Space>
                        </Flex>
                    }
                >
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={6}>
                                {renderInfo(t('shipments.columns.waybill'), waybill)}
                            </Col>
                            <Col xs={24} md={6}>
                                {renderInfo(t('shipments.columns.shop'), merchant)}
                            </Col>
                            <Col xs={24} md={6}>
                                {renderInfo(t('shipments.filters.original_invoice'), item.originalReceiptCode)}
                            </Col>
                            <Col xs={24} md={6}>
                                {renderInfo(t('shipments.columns.warehouse'), item.receivingWarehouseDisplayName || item.warehouseName)}
                            </Col>
                        </Row>

                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={6}>
                                {renderInfo(t('shipments.filters.your_order_code'), refShipmentCode)}
                            </Col>
                            <Col xs={24} md={6}>
                                {renderInfo(t('shipments.filters.your_customer_code'), refCustomerCode)}
                            </Col>
                            <Col xs={24} md={6}>
                                {renderInfo(
                                    t('shipments.columns.quantity'),
                                    `${formatNumber(item.totalProducts)} / ${formatNumber(item.receivedQuantity)}`
                                )}
                            </Col>
                            <Col xs={24} md={6}>
                                {renderInfo(t('shipments.columns.packages'), formatNumber(item.totalPackages))}
                            </Col>
                        </Row>

                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={6}>
                                {renderInfo(t('shipments.columns.total_value'), formatMoney(item.totalValue, item.currency))}
                            </Col>
                            <Col xs={24} md={6}>
                                {renderInfo(t('shipments.columns.total_fee'), formatMoney(item.totalFee))}
                            </Col>
                            <Col xs={24} md={6}>
                                {renderInfo(t('shipments.columns.total_unpaid'), formatMoney(item.totalUnpaid))}
                            </Col>
                            <Col xs={24} md={6}>
                                {renderInfo(t('shipments.columns.weight'), item.actualWeight ? `${item.actualWeight}kg` : undefined)}
                            </Col>
                        </Row>

                        {Array.isArray(item.services) && item.services.length > 0 && (
                            <Space wrap>
                                <Text type="secondary">{t('shipments.filters.services')}:</Text>
                                {item.services.map((service: any) => (
                                    <Tag key={service.code || service.id || service.name}>{service.name || service.code}</Tag>
                                ))}
                            </Space>
                        )}
                    </Space>
                </Card>
            </List.Item>
        );
    };

    return (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {!isTabView && (
                <Flex justify="space-between" align="center" gap={16} wrap>
                    <Space direction="vertical" size={0}>
                        <Title level={3} style={{ margin: 0 }}>{t('shipments.consignment_title')}</Title>
                        <Text type="secondary">{t('shipments.consignment_subtitle')}</Text>
                    </Space>
                    <Statistic title={t('shipments.total')} value={total} />
                </Flex>
            )}

            <Card>
                <Form form={form} layout="vertical" onFinish={handleSearch}>
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                        <Card size="small" title={t('shipments.filters.status')}>
                            <Form.Item name="statuses" style={{ marginBottom: 0 }}>
                                <Checkbox.Group>
                                    <Space wrap>
                                        {statusOptions.map((option: any) => (
                                            <Checkbox key={option.value} value={option.value}>
                                                {option.label}
                                            </Checkbox>
                                        ))}
                                    </Space>
                                </Checkbox.Group>
                            </Form.Item>
                        </Card>

                        <Row gutter={[16, 8]}>
                            <Col xs={24} md={8}>
                                <Form.Item name="query" label={t('shipments.filters.code')}>
                                    <Input allowClear placeholder={t('shipments.search_placeholder')} onPressEnter={handleSearch} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={16}>
                                <Form.Item label={t('shipments.filters.created_at')}>
                                    <Row gutter={[12, 8]}>
                                        <Col xs={24} md={12}>
                                            <Form.Item name="timestampFrom" noStyle>
                                                <DatePicker
                                                    style={{ width: '100%' }}
                                                    format="DD/MM/YYYY"
                                                    placeholder={t('orders.filters.start_date')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item name="timestampTo" noStyle>
                                                <DatePicker
                                                    style={{ width: '100%' }}
                                                    format="DD/MM/YYYY"
                                                    placeholder={t('orders.filters.end_date')}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Form.Item>
                            </Col>
                        </Row>

                        {expanded && (
                            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                <Row gutter={[16, 8]}>
                                    <Col xs={24} md={8}>
                                        <Form.Item name="originalReceiptCode" label={t('shipments.filters.original_invoice')}>
                                            <Input allowClear />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Form.Item name="wayBill" label={t('shipments.filters.waybill')}>
                                            <Input allowClear />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Form.Item name="merchantName" label={t('shipments.filters.shop_name')}>
                                            <Input allowClear />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item name="refShipmentCode" label={t('shipments.filters.your_order_code')}>
                                            <Input allowClear />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item name="refCustomerCode" label={t('shipments.filters.your_customer_code')}>
                                            <Input allowClear />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Card size="small" title={t('shipments.filters.services')}>
                                    {isServicesLoading ? (
                                        <Skeleton active paragraph={{ rows: 1 }} title={false} />
                                    ) : (
                                        <Form.Item name="services" style={{ marginBottom: 0 }}>
                                            <Checkbox.Group>
                                                <Space wrap>
                                                    {(servicesData || []).map((service: any) => (
                                                        <Checkbox key={service.code} value={service.code}>
                                                            {service.name}
                                                        </Checkbox>
                                                    ))}
                                                </Space>
                                            </Checkbox.Group>
                                        </Form.Item>
                                    )}
                                </Card>

                                <Row gutter={[16, 8]}>
                                    <Col xs={24} md={6}>
                                        <Form.Item name="cutOffStatus" label={t('shipments.filters.stuck_at')}>
                                            <Select
                                                allowClear
                                                showSearch
                                                optionFilterProp="label"
                                                options={(statusData || []).map((status: any) => ({
                                                    label: status.name,
                                                    value: status.code,
                                                }))}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={6}>
                                        <Form.Item name="typeSearch" label={t('shipments.filters.period')}>
                                            <Select
                                                allowClear
                                                options={[
                                                    { label: t('orders.filters.time_range'), value: 'range' },
                                                    { label: t('orders.filters.cut_off_equal'), value: 'equal' },
                                                    { label: t('orders.filters.cut_off_from'), value: 'from' },
                                                    { label: t('orders.filters.cut_off_to'), value: 'to' },
                                                ]}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={6}>
                                        <Form.Item name="handlingTimeFrom" label={t('shipments.filters.from')}>
                                            <Input allowClear type="number" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={6}>
                                        <Form.Item name="handlingTimeTo" label={t('shipments.filters.to')}>
                                            <Input allowClear type="number" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item name="existsProduct" valuePropName="checked" style={{ marginBottom: 0 }}>
                                            <Checkbox>{t('shipments.filters.lack_product_info')}</Checkbox>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Space>
                        )}

                        <Flex justify="space-between" align="center" gap={16} wrap>
                            <Button
                                type="link"
                                icon={expanded ? <UpOutlined /> : <DownOutlined />}
                                onClick={() => setExpanded((value) => !value)}
                            >
                                {expanded ? t('orders.buttons.search_collapse') : t('orders.buttons.search_expand')}
                            </Button>
                            <Space>
                                <Button icon={<RedoOutlined />} onClick={clearFilters}>
                                    {t('orders.buttons.reset')}
                                </Button>
                                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                                    {t('orders.buttons.search')}
                                </Button>
                            </Space>
                        </Flex>
                    </Space>
                </Form>
            </Card>

            <Card
                title={
                    <Space>
                        <FileSearchOutlined />
                        <span>{t('shipments.list_title')}</span>
                        <Tag>{formatNumber(total)}</Tag>
                    </Space>
                }
            >
                <List
                    dataSource={shipmentData?.data || []}
                    loading={isShipmentLoading}
                    rowKey={(record: any) => record.id || record.code}
                    renderItem={renderShipmentItem}
                    locale={{ emptyText: <Empty description={t('shipments.empty_list')} /> }}
                />

                <Flex justify="flex-end" style={{ marginTop: 16 }}>
                    <Pagination
                        current={page}
                        pageSize={pageSize}
                        total={total}
                        showSizeChanger
                        onChange={(nextPage, nextPageSize) => {
                            setPage(nextPage);
                            if (nextPageSize !== pageSize) setPageSize(nextPageSize);
                        }}
                    />
                </Flex>
            </Card>
        </Space>
    );
};
