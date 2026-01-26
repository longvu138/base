import { useMemo } from 'react';
import { Form, Input, DatePicker, Select, Table, Checkbox, Button } from 'antd';
import { FilterPanel, TableComponent, Status, StatusFilter, Pagination } from '@repo/ui';
import { useFilterWithURL, usePaginationWithURL, useListOrderQuery, useOrderStatusesQuery, useOrderStatisticQuery, useOrderServicesQuery, useMarketplacesQuery } from '@repo/hooks';
import { useTranslation } from '@repo/i18n';
import { Plus, Download } from 'lucide-react';

const { RangePicker } = DatePicker;


export const OrdersStyle1 = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 20
    });

    const { applyFilters, clearFilters, filters } = useFilterWithURL({
        form
    });

    const apiParams = useMemo(() => {
        const params: Record<string, any> = {
            page: page - 1,
            size: pageSize,
            ...filters
        };

        ['statuses', 'marketplaces', 'services'].forEach(key => {
            if (Array.isArray(params[key])) {
                params[key] = params[key].join(',');
            }
        });

        return params;
    }, [page, pageSize, filters]);

    const { data: orderData, isLoading: isOrderLoading } = useListOrderQuery(apiParams);
    const { data: statusData } = useOrderStatusesQuery();
    const { data: statisticData } = useOrderStatisticQuery();
    const { data: servicesData } = useOrderServicesQuery();
    const { data: marketplacesData } = useMarketplacesQuery();

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

    const handleReset = () => {
        clearFilters();
    };

    const columns = [
        {
            title: t('orders.columns.code'),
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <span className="font-medium text-primary">{text}</span>
        },
        {
            title: t('orders.columns.note'),
            dataIndex: 'note',
            key: 'note',
        },
        {
            title: t('orders.columns.warehouse'),
            dataIndex: 'receivingWarehouse',
            key: 'receivingWarehouse',
            render: (warehouse: any) => warehouse?.displayName || warehouse?.name || '-'
        },
        {
            title: t('orders.columns.status'),
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => <Status status={status} statuses={statusData} />
        },
        {
            title: t('orders.columns.total'),
            dataIndex: 'grandTotal',
            key: 'grandTotal',
            render: (amount: number) => <span>{amount?.toLocaleString()} đ</span>
        },
        {
            title: t('orders.columns.created_at'),
            dataIndex: 'createdAt',
            key: 'createdAt',
        }
    ];

    return (
        <div className="space-y-10">

            <div className='bg-filter dark:bg-filter-dark p-4 rounded-lg transition-colors duration-200'>
                <FilterPanel
                    form={form}
                    searchText={t('orders.buttons.search')}
                    resetText={t('orders.buttons.reset')}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    showCollapseAll={true}
                    loading={isOrderLoading}
                    primaryContent={
                        <div className="flex flex-col gap-4">
                            <Form.Item name="statuses" noStyle>
                                <StatusFilter
                                    options={statusOptions}
                                    label={t('orders.filters.status') + ':'}
                                />
                            </Form.Item>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Form.Item name="query" label={t('orders.search_placeholder')}>
                                    <Input placeholder={t('orders.search_placeholder')} />
                                </Form.Item>
                                <Form.Item name="note" label={t('orders.filters.note')}>
                                    <Input placeholder="" />
                                </Form.Item>
                                <Form.Item name="dateRange" label={t('orders.filters.created_at') + ':'}>
                                    <RangePicker className="w-full" placeholder={[t('orders.filters.start_date'), t('orders.filters.end_date')]} />
                                </Form.Item>
                                <div className="flex items-end pb-2">
                                    <Form.Item name="financialPayment" valuePropName="checked" noStyle>
                                        <Checkbox>{t('orders.filters.financial_payment')}</Checkbox>
                                    </Form.Item>
                                </div>
                            </div>
                        </div>
                    }
                    secondaryContent={
                        <div className='w-full space-y-4 pt-2 border-t border-gray-100'>
                            <div className='flex items-start gap-1 w-full'>
                                <div className='whitespace-nowrap pt-1 font-medium text-gray-700 min-w-[120px]'>{t('orders.filters.source')}:</div>
                                <Form.Item name="marketplaces" className="mb-0 flex-1">
                                    <Checkbox.Group className="flex flex-wrap gap-x-6 gap-y-3">
                                        {marketplacesData?.map((item: any) => (
                                            <Checkbox key={item.code} value={item.code}>{item.name}</Checkbox>
                                        ))}
                                    </Checkbox.Group>
                                </Form.Item>
                            </div>

                            <div className='flex items-start gap-1 w-full'>
                                <div className='whitespace-nowrap pt-1 font-medium text-gray-700 min-w-[120px]'>{t('orders.filters.services')}:</div>
                                <Form.Item name="services" className="mb-0 flex-1">
                                    <Checkbox.Group className="flex flex-wrap gap-x-6 gap-y-3">
                                        {servicesData?.map((item: any) => (
                                            <Checkbox key={item.code} value={item.code}>{item.name}</Checkbox>
                                        ))}
                                    </Checkbox.Group>
                                </Form.Item>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-gray-100">
                                <Form.Item name="stuckStatus" label={t('orders.filters.stuck_status') + ':'}>
                                    <Select placeholder={t('orders.filters.status')} options={statusData?.map((s: any) => ({ label: s.name, value: s.code }))} allowClear />
                                </Form.Item>
                                <Form.Item name="stuckRange" label=" ">
                                    <Select placeholder="Khoảng" options={[{ label: 'Khoảng', value: 'range' }]} />
                                </Form.Item>
                                <Form.Item name="stuckFrom" label=" ">
                                    <Input placeholder="Từ" />
                                </Form.Item>
                                <Form.Item name="stuckTo" label=" ">
                                    <Input placeholder="Đến" />
                                </Form.Item>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Form.Item name="timeType" label={<span className="dark:text-gray-100">{t('orders.filters.time_range') + ':'}</span>}>
                                    <Select placeholder={t('orders.filters.time_range')} options={[{ label: 'Ngày tạo', value: 'created' }, { label: 'Ngày cập nhật', value: 'updated' }]} />
                                </Form.Item>
                                <Form.Item name="timeStart" label=" ">
                                    <DatePicker className="w-full" placeholder={t('orders.filters.start_date')} />
                                </Form.Item>
                                <Form.Item name="timeEnd" label=" ">
                                    <DatePicker className="w-full" placeholder={t('orders.filters.end_date')} />
                                </Form.Item>
                            </div>
                        </div>
                    }
                />
            </div>



            <TableComponent
                title={t('orders.title')}
                totalCount={orderData?.total || 0}
                hideTotalCount={true}
                loading={isOrderLoading}
                showEmpty={!isOrderLoading && (!orderData?.data || orderData?.data.length === 0)}
                extra={
                    <div className="flex gap-2">
                        <Button
                            type='default'
                            icon={<Download size={16} />}
                            onClick={() => console.log('Exporting...')}
                        >
                            {t('common.export')}
                        </Button>
                        <Button
                            type="primary"
                            icon={<Plus size={16} />}
                            onClick={() => console.log('Creating...')}
                        >
                            {t('common.create', { defaultValue: 'Tạo mới' })}
                        </Button>
                    </div>
                }
            >
                <Table
                    columns={columns}
                    dataSource={orderData?.data || []}
                    rowKey="id"
                    pagination={false}
                />
            </TableComponent>


            <Pagination
                current={page}
                pageSize={pageSize}
                total={orderData?.total || 0}
                onChange={(p, s) => {
                    setPage(p);
                    if (s !== pageSize) setPageSize(s);
                }}
            />
        </div>
    );
};
