import { useMemo } from 'react';
import { Form, Input, DatePicker, Checkbox, Select, Table, Card } from 'antd';
import { FilterPanel, TableComponent, StatusFilter, Status, Pagination } from '@repo/ui';
import { useFilterWithURL, usePaginationWithURL, useListShipmentQuery, useShipmentStatusesQuery, useShipmentStatisticQuery } from '@repo/hooks';
import { useTranslation } from '@repo/i18n';

const { RangePicker } = DatePicker;

const SHIPMENT_SERVICES = [
    'Bảo hiểm hàng hóa', 'Quấn bọt khí riêng', 'Quấn bọt khí chung',
    'Vận chuyển tiết kiệm', 'Vận chuyển hàng hạn chế', 'Vận chuyển thường',
    'Vận chuyển TMĐT', 'Vận chuyển hàng lô', 'Đóng gỗ riêng', 'Đóng gỗ chung'
];

export const Shipments = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL();
    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    const apiParams = useMemo(() => {
        const params: Record<string, any> = {
            page: page - 1,
            size: pageSize,
            ...filters
        };

        // Convert array types for API
        ['statuses', 'services'].forEach(key => {
            if (Array.isArray(params[key])) {
                params[key] = params[key].join(',');
            }
        });

        return params;
    }, [page, pageSize, filters]);

    const { data: shipmentData, isLoading } = useListShipmentQuery(apiParams);
    const { data: statusData } = useShipmentStatusesQuery();
    const { data: statisticData } = useShipmentStatisticQuery();

    const statusOptions = useMemo(() => {
        if (!statusData) return [];
        return statusData.map((s: any) => {
            const statistic = statisticData?.find((item: any) => item.status === s.code);
            const count = statistic ? statistic.total : 0;
            return {
                label: `${s.name} (${count})`,
                value: s.code,
            };
        });
    }, [statusData, statisticData]);

    const handleSearch = () => {
        const values = form.getFieldsValue();
        applyFilters(values);
    };

    const columns = [
        {
            title: t('shipments.columns.code'),
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <span className="font-bold text-primary">{text}</span>
        },
        {
            title: t('shipments.columns.waybill'),
            dataIndex: 'waybillCode',
            key: 'waybillCode',
        },
        {
            title: t('shipments.columns.shop'),
            dataIndex: 'shopName',
            key: 'shopName',
        },
        {
            title: t('shipments.columns.status'),
            dataIndex: 'status',
            key: 'status',
            render: (s: string) => <Status status={s} statuses={statusData} />
        },
        {
            title: t('shipments.columns.created_at'),
            dataIndex: 'createdAt',
            key: 'createdAt',
        },
    ];

    return (
        <div className="p-6 min-h-screen bg-layout">
            <Card className="border-0 shadow-sm mb-6" bodyStyle={{ padding: 24 }}>
                <FilterPanel
                    form={form}
                    onSearch={handleSearch}
                    onReset={clearFilters}
                    showCollapseAll={true}
                    searchText={t('orders.buttons.search')}
                    resetText={t('orders.buttons.reset')}
                    primaryContent={
                        <>
                            <Form.Item name="statuses" noStyle>
                                <StatusFilter options={statusOptions} label={t('shipments.filters.status') + ':'} />
                            </Form.Item>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 mt-6 border-t border-border">
                                <Form.Item name="code" label={t('shipments.filters.code')}>
                                    <Input placeholder={t('shipments.filters.code')} className="h-10" />
                                </Form.Item>
                                <Form.Item name="dateRange" label={t('shipments.filters.created_at')}>
                                    <RangePicker className="w-full h-10" placeholder={[t('orders.filters.start_date'), t('orders.filters.end_date')]} />
                                </Form.Item>
                            </div>
                        </>
                    }
                    secondaryContent={
                        <div className="pt-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Form.Item name="originalInvoiceCode" label={t('shipments.filters.original_invoice')}>
                                    <Input className="h-10" />
                                </Form.Item>
                                <Form.Item name="waybillCode" label={t('shipments.filters.waybill')}>
                                    <Input className="h-10" />
                                </Form.Item>
                                <Form.Item name="shopName" label={t('shipments.filters.shop_name')}>
                                    <Input className="h-10" />
                                </Form.Item>
                                <Form.Item name="orderCode" label={t('shipments.filters.your_order_code')}>
                                    <Input className="h-10" />
                                </Form.Item>
                                <Form.Item name="customerCode" label={t('shipments.filters.your_customer_code')}>
                                    <Input className="h-10" />
                                </Form.Item>
                            </div>

                            <div>
                                <div className="font-medium text-xs text-gray-500 uppercase mb-3">{t('shipments.filters.services')}:</div>
                                <Form.Item name="services" className="mb-0">
                                    <Checkbox.Group className="flex flex-wrap gap-x-6 gap-y-3">
                                        {SHIPMENT_SERVICES.map(s => (
                                            <Checkbox key={s} value={s}>{s}</Checkbox>
                                        ))}
                                    </Checkbox.Group>
                                </Form.Item>
                            </div>

                            <div className="pt-6 border-t border-border grid grid-cols-1 md:grid-cols-4 gap-6">
                                <Form.Item name="stuckStatus" label={t('shipments.filters.stuck_at')}>
                                    <Select className="h-10" options={statusData?.map((s: any) => ({ label: s.name, value: s.code }))} />
                                </Form.Item>
                                <Form.Item name="period" label={t('shipments.filters.period')}>
                                    <Select className="h-10" options={[{ label: 'Bất kỳ', value: 'any' }]} defaultValue="any" />
                                </Form.Item>
                                <Form.Item name="from" label={t('shipments.filters.from')}>
                                    <Input className="h-10" />
                                </Form.Item>
                                <Form.Item name="to" label={t('shipments.filters.to')}>
                                    <Input className="h-10" />
                                </Form.Item>
                            </div>
                        </div>
                    }
                />
            </Card>

            <TableComponent
                title={t('shipments.title')}
                totalCount={shipmentData?.total}
                loading={isLoading}
                showEmpty={!isLoading && shipmentData?.data?.length === 0}
            >
                <Table
                    columns={columns}
                    dataSource={shipmentData?.data || []}
                    pagination={false}
                    rowKey="id"
                    size="middle"
                />
            </TableComponent>

            <Pagination
                current={page}
                pageSize={pageSize}
                total={shipmentData?.total || 0}
                onChange={(p, s) => {
                    setPage(p);
                    if (s !== pageSize) setPageSize(s);
                }}
            />
        </div>
    );
};

export default Shipments;
