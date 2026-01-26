import { useMemo } from 'react';
import { Form, Input, DatePicker, Table, Checkbox, Card, Tag, Divider, Typography, Button } from 'antd';
import { TableComponent, Status, StatusFilter, Pagination } from '@repo/ui';
import { useFilterWithURL, usePaginationWithURL, useListOrderQuery, useOrderStatusesQuery, useOrderStatisticQuery, useOrderServicesQuery, useMarketplacesQuery } from '@repo/hooks';
import { useTranslation } from '@repo/i18n';
import { Plus, Download } from 'lucide-react';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export const OrdersStyle2 = () => {
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
            key: 'info',
            width: 300,
            render: (_: any, record: any) => (
                <div className="flex flex-col gap-1">
                    <span className="font-bold text-base text-primary cursor-pointer hover:underline">{record.code}</span>
                    <Text type="secondary" className="text-xs">{record.createdAt}</Text>
                    {record.note && <Tag color="warning" className="w-fit mt-1">{record.note}</Tag>}
                </div>
            )
        },
        {
            title: t('orders.columns.details'),
            key: 'details',
            render: (_: any, record: any) => (
                <div className="flex flex-col gap-1 text-sm">
                    <div className="flex justify-between">
                        <span className="text-text-color opacity-60">{t('orders.columns.warehouse')}:</span>
                        <span>{record.receivingWarehouse?.displayName || '-'}</span>
                    </div>
                </div>
            )
        },
        {
            title: t('orders.columns.total'),
            key: 'finance',
            align: 'right' as const,
            render: (_: any, record: any) => (
                <div className="font-semibold text-green-600">
                    {record.grandTotal?.toLocaleString()} đ
                </div>
            )
        },
        {
            title: t('orders.columns.status'),
            key: 'status',
            align: 'center' as const,
            width: 150,
            render: (_: any, record: any) => <Status status={record.status} statuses={statusData} />
        },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
            <div className="w-full lg:w-80 flex-shrink-0">
                <Card className="sticky top-4 border-0 shadow-sm" bodyStyle={{ padding: 16 }}>
                    <Title level={5} className="mb-4">{t('orders.buttons.search')}</Title>

                    <Form form={form} layout="vertical" onFinish={handleSearch}>
                        <Form.Item name="query" className="mb-4">
                            <Input.Search placeholder={t('orders.search_placeholder')} onSearch={handleSearch} allowClear />
                        </Form.Item>

                        <Divider className="my-3" />

                        <Form.Item name="dateRange" label={t('orders.filters.created_at')}>
                            <RangePicker className="w-full" placeholder={[t('orders.filters.start_date'), t('orders.filters.end_date')]} />
                        </Form.Item>

                        <Form.Item name="financialPayment" valuePropName="checked" className="mb-4">
                            <Checkbox>{t('orders.filters.financial_payment')}</Checkbox>
                        </Form.Item>

                        <Divider className="my-3" />

                        <div className="mb-4">
                            <div className="font-medium text-xs text-gray-500 uppercase mb-2">{t('orders.filters.source')}</div>
                            <Form.Item name="marketplaces" noStyle>
                                <Checkbox.Group className="flex flex-col gap-2">
                                    {marketplacesData?.map((item: any) => (
                                        <Checkbox key={item.code} value={item.code} className="m-0 text-sm">{item.name}</Checkbox>
                                    ))}
                                </Checkbox.Group>
                            </Form.Item>
                        </div>

                        <div className="mb-4">
                            <div className="font-medium text-xs text-gray-500 uppercase mb-2">{t('orders.filters.services')}</div>
                            <Form.Item name="services" noStyle>
                                <Checkbox.Group className="flex flex-col gap-2">
                                    {servicesData?.map((item: any) => (
                                        <Checkbox key={item.code} value={item.code} className="m-0 text-sm">{item.name}</Checkbox>
                                    ))}
                                </Checkbox.Group>
                            </Form.Item>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <Button
                                onClick={handleReset}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                {t('orders.buttons.reset')}
                            </Button>
                            <Button
                                onClick={handleSearch}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                {t('orders.buttons.apply')}
                            </Button>
                        </div>
                    </Form>
                </Card>
            </div>


            <div className="flex-1 min-w-0 flex flex-col h-full">

                <div className="mb-4 overflow-x-auto pb-2">
                    <Form form={form} component={false}>
                        <Form.Item name="statuses" noStyle>
                            <StatusFilter options={statusOptions} label="" />
                        </Form.Item>
                    </Form>
                </div>

                <div className="flex-1 flex flex-col">
                    <TableComponent
                        title={
                            <div className="flex items-center justify-between w-full">
                                <span>{t('orders.title')} ({orderData?.total || 0})</span>
                            </div>
                        }
                        totalCount={orderData?.total || 0}
                        loading={isOrderLoading}
                        showEmpty={!isOrderLoading && (!orderData?.data || orderData?.data.length === 0)}
                        extra={
                            <div className="flex gap-2">
                                <Button
                                    icon={<Download size={16} />}
                                    onClick={() => console.log('Exporting...')}
                                />
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
                            size="middle"
                            rowClassName="hover:bg-blue-50 transition-colors cursor-pointer"
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
            </div>
        </div>
    );
};
