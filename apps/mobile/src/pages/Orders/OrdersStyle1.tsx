import { Table, Form, Input, Checkbox, DatePicker } from 'antd';
import { TableComponent, Status, FilterPanel, StatusFilter, Pagination } from '@repo/ui';
import { useTranslation } from '@repo/i18n';

const { RangePicker } = DatePicker;

interface OrdersStyleProps {
    data: any;
    isLoading: boolean;
    statuses?: any[];
    page: number;
    pageSize: number;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    form: any;
    applyFilters: (values: any) => void;
    handleReset: () => void;
    filters: any;
    statusOptions: any[];
    marketplacesData?: any[];
}

export const OrdersStyle1 = ({ 
    data, isLoading, statuses, page, pageSize, setPage, setPageSize,
    form, applyFilters, handleReset, statusOptions, marketplacesData
}: OrdersStyleProps) => {
    const { t } = useTranslation();
    const columns = [
        {
            title: t('orders.columns.code'),
            dataIndex: 'code',
            width: 120,
            render: (text: string) => <span className="font-medium text-primary">{text}</span>
        },
        {
            title: t('orders.columns.status'),
            dataIndex: 'status',
            width: 120,
            render: (s: string) => <Status status={s} statuses={statuses} />
        },
        {
            title: t('orders.columns.total'),
            dataIndex: 'grandTotal',
            width: 120,
            align: 'right' as const,
            render: (v: number) => <span className="font-semibold">{v?.toLocaleString()}đ</span>
        },
    ];

    return (
        <div className="mt-0">
            <div className='bg-filter dark:bg-filter-dark rounded-md p-4 mb-4'>
                <FilterPanel
                    form={form}
                    onSearch={() => applyFilters(form.getFieldsValue())}
                    onReset={handleReset}
                    searchText={t('orders.buttons.search')}
                    showCollapseAll={true}
                    primaryContent={
                        <div className="flex flex-col gap-4">
                            <Form.Item name="statuses" noStyle>
                                <StatusFilter
                                    options={statusOptions}
                                    label={t('orders.filters.status') + ':'}
                                />
                            </Form.Item>

                            <div className="space-y-4">
                                <Form.Item name="query" className="mb-0">
                                    <Input placeholder={t('orders.search_placeholder')} />
                                </Form.Item>
                                <Form.Item name="note" className="mb-0">
                                    <Input placeholder={t('orders.filters.note')} />
                                </Form.Item>
                                <Form.Item name="dateRange" className="mb-0">
                                    <RangePicker className="w-full" placeholder={[t('orders.filters.start_date'), t('orders.filters.end_date')]} />
                                </Form.Item>
                                <Form.Item name="financialPayment" valuePropName="checked" className="mb-0">
                                    <Checkbox>{t('orders.filters.financial_payment')}</Checkbox>
                                </Form.Item>
                            </div>
                        </div>
                    }
                    secondaryContent={
                        <div className='w-full space-y-4 pt-4 border-t border-border'>
                            <div className='space-y-2'>
                                <div className='font-medium text-gray-700 dark:text-gray-300'>{t('orders.filters.source')}:</div>
                                <Form.Item name="source" className="mb-0">
                                    <Checkbox.Group className="flex flex-wrap gap-2">
                                        {marketplacesData?.map((item: any) => (
                                            <Checkbox key={item.code} value={item.code}>{item.name}</Checkbox>
                                        ))}
                                    </Checkbox.Group>
                                </Form.Item>
                            </div>
                        </div>
                    }
                />
            </div>
            <TableComponent
                loading={isLoading}
                totalCount={data?.total || 0}
                showEmpty={!data?.data?.length}
            >
                <Table
                    columns={columns}
                    dataSource={data?.data || []}
                    pagination={false}
                    rowKey="id"
                    size="small"
                    scroll={{ x: 400 }}
                />
            </TableComponent>

            <Pagination
                current={page}
                pageSize={pageSize}
                total={data?.total || 0}
                onChange={(p, s) => {
                    setPage(p);
                    if (s !== pageSize) setPageSize(s);
                }}
                className="pb-20"
                showSizeChanger={false}
            />
        </div>
    );
};
