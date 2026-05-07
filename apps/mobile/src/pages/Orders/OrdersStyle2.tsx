import { Card, Skeleton, Typography, Form, Input, Checkbox, DatePicker } from 'antd';
import { Status, Pagination, FilterPanel, StatusFilter } from '@repo/ui';
import { Calendar, DollarSign, Package } from 'lucide-react';
import { useTranslation } from '@repo/i18n';

const { Text } = Typography;
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

export const OrdersStyle2 = ({ 
    data, isLoading, statuses, page, pageSize, setPage, setPageSize,
    form, applyFilters, handleReset, statusOptions, marketplacesData
}: OrdersStyleProps) => {
    const { t } = useTranslation();
    if (isLoading) {
        return (
            <div className="mt-4 space-y-4">
                {[1, 2, 3].map(i => <Card key={i}><Skeleton active /></Card>)}
            </div>
        );
    }

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

            <div className="flex flex-col gap-4">
            {data?.data?.map((order: any) => (
                <Card
                    key={order.id}
                    className="shadow-sm border-0 rounded-xl overflow-hidden"
                    bodyStyle={{ padding: 16 }}
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                <Package size={16} />
                            </div>
                            <span className="font-bold text-base text-primary">{order.code}</span>
                        </div>
                        <Status status={order.status} statuses={statuses} />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-text-color opacity-60 text-sm">
                            <Calendar size={14} />
                            <span>{order.createdAt}</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-color font-medium">
                            <DollarSign size={14} className="text-green-600" />
                            <span>{order.grandTotal?.toLocaleString()} đ</span>
                        </div>
                    </div>

                    {order.note && (
                        <div className="mt-3 pt-3 border-t border-gray-50">
                            <Text type="secondary" className="text-xs italic">"{order.note}"</Text>
                        </div>
                    )}
                </Card>
            ))}

            {!data?.data?.length && (
                <div className="text-center py-10 bg-white rounded-xl">
                    <div className="text-gray-400 mb-2">{t('common.no_data')}</div>
                </div>
            )}

            </div>

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

