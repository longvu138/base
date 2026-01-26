import { useState, useMemo } from 'react';
import { Form, Input, Radio, DatePicker, Select, Checkbox } from 'antd';
import { FilterPanel, StatusFilter } from '@repo/ui';
import { useFilterWithURL, usePaginationWithURL, useListOrderQuery, useOrderStatusesQuery, useOrderServicesQuery, useMarketplacesQuery } from '@repo/hooks';
import { useTranslation } from '@repo/i18n';
import { LayoutDashboard, Columns } from 'lucide-react';
import { OrdersStyle1 } from './OrdersStyle1';
import { OrdersStyle2 } from './OrdersStyle2';

const { RangePicker } = DatePicker;

export const OrdersPage = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [style, setStyle] = useState<'style1' | 'style2'>('style1');

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL();
    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    const apiParams = useMemo(() => {
        const params: Record<string, any> = {
            page: page - 1,
            size: pageSize,
            ...filters
        };

        ['statuses', 'source', 'services'].forEach(key => {
            if (Array.isArray(params[key])) {
                params[key] = params[key].join(',');
            }
        });

        return params;
    }, [page, pageSize, filters]);

    const { data: orderData, isLoading } = useListOrderQuery(apiParams);
    const { data: statusData } = useOrderStatusesQuery();
    const { data: servicesData } = useOrderServicesQuery();
    const { data: marketplacesData } = useMarketplacesQuery();

    const statusOptions = useMemo(() => {
        if (!statusData) return [];
        return statusData.map((s: any) => ({
            label: s.name,
            value: s.code,
        }));
    }, [statusData]);

    return (
        <div className="bg-layout min-h-screen pb-20">
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold mb-0">{t('orders.title')}</h1>
                    <Radio.Group
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        size="small"
                        buttonStyle="solid"
                    >
                        <Radio.Button value="style1">
                            <LayoutDashboard size={14} />
                        </Radio.Button>
                        <Radio.Button value="style2">
                            <Columns size={14} />
                        </Radio.Button>
                    </Radio.Group>
                </div>

                <div className='bg-filter dark:bg-filter-dark rounded-md p-4'>
                    <FilterPanel
                        form={form}
                        onSearch={() => applyFilters(form.getFieldsValue())}
                        onReset={clearFilters}
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

                                <div className='space-y-2'>
                                    <div className='font-medium text-gray-700 dark:text-gray-300'>{t('orders.filters.services')}:</div>
                                    <Form.Item name="services" className="mb-0">
                                        <Checkbox.Group className="grid grid-cols-2 gap-2">
                                            {servicesData?.map((item: any) => (
                                                <Checkbox key={item.code} value={item.code}>{item.name}</Checkbox>
                                            ))}
                                        </Checkbox.Group>
                                    </Form.Item>
                                </div>

                                <div className="space-y-4 pt-2 border-t border-border">
                                    <Form.Item name="stuckStatus" label={<span className="dark:text-gray-300">{t('orders.filters.stuck_status')}</span>}>
                                        <Select placeholder={t('orders.filters.status')} options={statusData?.map((s: any) => ({ label: s.name, value: s.code }))} allowClear />
                                    </Form.Item>

                                    <div className="grid grid-cols-2 gap-2">
                                        <Form.Item name="stuckFrom" className="mb-0">
                                            <Input placeholder="Từ ngày" />
                                        </Form.Item>
                                        <Form.Item name="stuckTo" className="mb-0">
                                            <Input placeholder="Đến ngày" />
                                        </Form.Item>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2 border-t border-border pb-4">
                                    <Form.Item name="timeType" label={<span className="dark:text-gray-300">{t('orders.filters.time_range')}</span>}>
                                        <Select placeholder={t('orders.filters.time_range')} options={[{ label: 'Ngày tạo', value: 'created' }, { label: 'Ngày cập nhật', value: 'updated' }]} />
                                    </Form.Item>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Form.Item name="timeStart" className="mb-0">
                                            <DatePicker className="w-full" placeholder={t('orders.filters.start_date')} />
                                        </Form.Item>
                                        <Form.Item name="timeEnd" className="mb-0">
                                            <DatePicker className="w-full" placeholder={t('orders.filters.end_date')} />
                                        </Form.Item>
                                    </div>
                                </div>
                            </div>
                        }
                    />
                </div>


                {style === 'style1' ? (
                    <OrdersStyle1
                        data={orderData}
                        isLoading={isLoading}
                        statuses={statusData}
                        page={page}
                        pageSize={pageSize}
                        setPage={setPage}
                        setPageSize={setPageSize}
                    />
                ) : (
                    <OrdersStyle2
                        data={orderData}
                        isLoading={isLoading}
                        statuses={statusData}
                        page={page}
                        pageSize={pageSize}
                        setPage={setPage}
                        setPageSize={setPageSize}
                    />
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
