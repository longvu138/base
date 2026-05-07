import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { Form, Input, DatePicker, Checkbox, Select, Table, Card, Tabs, Empty, Skeleton } from 'antd';
import { FilterPanel, TableComponent, StatusFilter, Status, Pagination } from '@repo/ui';
import { useTheme } from '@repo/theme-provider';
import { useShipmentsPage } from './hooks/useShipmentsPage';

const { RangePicker } = DatePicker;

export const Shipments: React.FC<{ isTabView?: boolean }> = ({ isTabView }) => {
    const {
        t, form, page, pageSize, setPage, setPageSize,
        shipmentData, isShipmentLoading, statusData,
        servicesData, isServicesLoading, statusOptions,
        handleSearch, clearFilters, filters, applyFilters
    } = useShipmentsPage();

    const columns = [
        {
            title: t('shipments.columns.code'),
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => (
                <Link to={`/shipments/${text}`} className="font-bold text-primary dark:text-primary-light hover:underline">
                    {text}
                </Link>
            )
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
            render: (text: string) => <span>{text ? dayjs(text).format('HH:mm DD/MM/YYYY') : '-'}</span>
        },
    ];

    return (
        <div className={`${isTabView ? '' : 'min-h-screen bg-layout'}`}>
            <Card className={`${isTabView ? 'border-0 shadow-none' : 'border-0 shadow-sm'} mb-6`} bodyStyle={{ padding: isTabView ? 0 : 24 }}>
                <FilterPanel
                    form={form}
                    onSearch={handleSearch}
                    onReset={clearFilters}
                    showCollapseAll={true}
                    searchText={t('orders.buttons.search')}
                    resetText={t('orders.buttons.reset')}
                    primaryContent={
                        <>
                            {(() => {
                                const { tenantConfig } = useTheme();
                                // Backend config drive: nếu variants.shipmentStatusDisplay = 'tabs' thì dùng Tabs, còn lại dùng StatusFilter
                                const useTabsForStatus = tenantConfig?.tenantConfig?.themeConfig?.variants?.['shipmentStatusDisplay'] === 'tabs';
                                return useTabsForStatus ? (
                                    <div className="mb-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                        <Tabs
                                            activeKey={filters.statuses ? (Array.isArray(filters.statuses) ? filters.statuses[0] : filters.statuses) : 'ALL'}
                                            onChange={(key) => {
                                                const newStatuses = key === 'ALL' ? undefined : [key];
                                                applyFilters({ ...form.getFieldsValue(), statuses: newStatuses });
                                            }}
                                            items={[
                                                {
                                                    key: 'ALL',
                                                    label: <span className="px-2">Tất cả</span>
                                                },
                                                ...statusOptions.map((opt: any) => ({
                                                    key: opt.value,
                                                    label: <span className="px-2">{opt.label}</span>
                                                }))
                                            ]}
                                            className="custom-status-tabs"
                                            size="large"
                                        />
                                    </div>
                                ) : (
                                    <Form.Item name="statuses" noStyle>
                                        <StatusFilter options={statusOptions} label={t('shipments.filters.status') + ':'} />
                                    </Form.Item>
                                );
                            })()}

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
                                {isServicesLoading ? (
                                    <Skeleton active paragraph={{ rows: 1 }} title={false} />
                                ) : (
                                    <Form.Item name="services" className="mb-0">
                                        <Checkbox.Group className="flex flex-wrap gap-x-6 gap-y-3">
                                            {(servicesData || []).map(s => (
                                                <Checkbox key={s.code} value={s.code}>{s.name}</Checkbox>
                                            ))}
                                        </Checkbox.Group>
                                    </Form.Item>
                                )}
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
                loading={isShipmentLoading}
                showEmpty={!isShipmentLoading && shipmentData?.data?.length === 0}
                emptyText={<Empty description="Không tìm thấy yêu cầu ký gửi nào" />}
            >
                <Table
                    columns={columns}
                    dataSource={shipmentData?.data || []}
                    pagination={false}
                    rowKey="id"
                    size="middle"
                    locale={{
                        emptyText: (
                            <div className="py-12 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                                <Empty description="Không tìm thấy yêu cầu ký gửi nào" />
                            </div>
                        )
                    }}
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

