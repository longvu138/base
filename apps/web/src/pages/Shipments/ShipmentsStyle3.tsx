import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Form, Input as AntInput, Button as AntButton, Tag,
    Skeleton as AntSkeleton, Tabs, Empty, Table, List,
    DatePicker, Checkbox, Select,
} from 'antd';
import { Pagination } from '@repo/ui';
import {
    useFilterWithURL, usePaginationWithURL,
    useListShipmentQuery, useShipmentStatusesQuery,
    useShipmentStatisticQuery, useShipmentServicesQuery,
} from '@repo/hooks';
import { useTranslation } from '@repo/i18n';
import { SearchOutlined, RedoOutlined, ArrowRightOutlined, RocketOutlined, FilterOutlined } from '@ant-design/icons';
import './ShipmentsStyle3.css';

const { RangePicker } = DatePicker;

/**
 * ShipmentsStyle3 — Giao diện cho Gobiz (gd3)
 * Bộ lọc đầy đủ ngang bằng giao diện 1:
 * code, dateRange, originalInvoiceCode, waybillCode, shopName,
 * orderCode, customerCode, services, stuckStatus/period/from/to
 */
export const ShipmentsStyle3: React.FC<{ isTabView?: boolean }> = ({ isTabView }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 20
    });
    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    const apiParams = useMemo(() => {
        const params: Record<string, any> = {
            page: page - 1,
            pageSize,
            ...filters
        };
        if (searchText) params.query = searchText;
        ['statuses', 'services'].forEach(key => {
            if (Array.isArray(params[key])) {
                params[key] = params[key].join(',');
            }
        });
        if (params.dateRange) {
            params.createdAtFrom = params.dateRange[0]?.toISOString?.() ?? params.dateRange[0];
            params.createdAtTo = params.dateRange[1]?.toISOString?.() ?? params.dateRange[1];
            delete params.dateRange;
        }
        return params;
    }, [page, pageSize, filters, searchText]);

    const { data: shipmentData, isLoading } = useListShipmentQuery(apiParams);
    const { data: statusData } = useShipmentStatusesQuery();
    const { data: statisticData } = useShipmentStatisticQuery();
    const { data: servicesData } = useShipmentServicesQuery();

    const statusOptions = useMemo(() => {
        if (!statusData) return [];
        return statusData.map((s: any) => {
            const statistic = statisticData?.find((item: any) => item.status === s.code);
            const count = Number(statistic?.total || 0);
            return {
                label: count > 0 ? `${s.name} (${count})` : s.name,
                value: s.code,
            };
        });
    }, [statusData, statisticData]);

    const getStatusTag = (status: string) => {
        const found = statusData?.find((s: any) => s.code === status);
        return (
            <Tag
                color={found?.color || 'default'}
                className="rounded-xl px-3 py-0.5 m-0 border-0 font-bold text-[10px] uppercase shadow-sm"
            >
                {found?.name || status}
            </Tag>
        );
    };

    const handleSearch = () => applyFilters({ ...filters, query: searchText });
    const handleReset = () => { setSearchText(''); clearFilters(); };

    const inputCls = 'h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700';

    const columns = [
        {
            title: 'Mã yêu cầu',
            dataIndex: 'code',
            key: 'code',
            render: (text: string, record: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <RocketOutlined className="text-primary text-sm" />
                    </div>
                    <div>
                        <Link to={`/shipments/${text}`}>
                            <div className="font-extrabold text-[#1a1a1a] dark:text-gray-100 tracking-tight text-sm hover:text-primary transition-colors">{text}</div>
                            <div className="text-[10px] text-gray-400 font-medium tracking-widest">
                                {record.createdAt ? dayjs(record.createdAt).format('HH:mm DD/MM/YYYY') : '-'}
                            </div>
                        </Link>
                    </div>
                </div>
            ),
        },
        {
            title: 'Vận đơn / Shop',
            key: 'info',
            render: (_: any, record: any) => (
                <div>
                    <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">{record.waybillCode || '—'}</div>
                    <div className="text-[11px] text-gray-400">{record.shopName || '—'}</div>
                </div>
            ),
        },
        {
            title: 'Mã đơn / KH',
            key: 'refs',
            render: (_: any, record: any) => (
                <div>
                    <div className="text-sm text-gray-700 dark:text-gray-200">{record.orderCode || '—'}</div>
                    <div className="text-[11px] text-gray-400">{record.customerCode || ''}</div>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (s: string) => getStatusTag(s),
        },
        {
            title: '',
            key: 'action',
            width: 60,
            render: (_: any, record: any) => (
                <Link to={`/shipments/${record.code}`}>
                    <AntButton type="primary" size="small" shape="circle" icon={<ArrowRightOutlined />} className="shadow-sm" />
                </Link>
            ),
        },
    ];

    const activeStatus = filters.statuses
        ? (Array.isArray(filters.statuses) ? filters.statuses[0] : filters.statuses)
        : 'ALL';

    const searchBar = (compact: boolean) => (
        <div className="flex flex-wrap gap-3">
            <AntInput
                placeholder="Tìm mã yêu cầu, vận đơn..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={handleSearch}
                className={`w-full md:w-80 ${compact ? 'h-10 rounded-xl' : 'h-11 rounded-2xl'} bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700`}
            />
            <AntButton type="primary" icon={<SearchOutlined />} onClick={handleSearch}
                className={compact ? 'h-10 px-6 rounded-xl font-medium' : 'h-11 px-8 rounded-2xl font-bold shadow-lg shadow-primary/20'}>
                Tìm kiếm
            </AntButton>
            <AntButton icon={<FilterOutlined />} onClick={() => setShowFilters(!showFilters)}
                className={`${compact ? 'h-10 px-4 rounded-xl font-medium' : 'h-11 px-5 rounded-2xl font-bold'} transition-all ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700'}`}>
                Bộ lọc
            </AntButton>
            <AntButton icon={<RedoOutlined />} onClick={handleReset}
                className={`${compact ? 'h-10 px-4 rounded-xl font-medium' : 'h-11 px-5 rounded-2xl font-bold'} border-gray-200 dark:border-gray-700 hover:text-primary transition-all bg-gray-50 dark:bg-gray-900`}>
                Làm mới
            </AntButton>
        </div>
    );

    return (
        <div className={`shipments-style-3-wrapper ${isTabView ? '' : 'p-6'} space-y-6 max-w-[1600px] mx-auto`}>
            {/* Header full page */}
            {!isTabView && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Ký gửi Vận chuyển</h1>
                        <p className="text-gray-500 text-sm">Quản lý các yêu cầu ký gửi hàng hóa.</p>
                    </div>
                    {searchBar(false)}
                </div>
            )}

            {/* Tab view compact */}
            {isTabView && (
                <div className="flex justify-end mb-4">
                    {searchBar(true)}
                </div>
            )}

            {/* Advanced Filters Panel — đầy đủ như giao diện 1 */}
            <div className={`advanced-filters-container overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-[1200px] opacity-100 mb-6' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
                    <Form form={form} layout="vertical" onValuesChange={() => applyFilters(form.getFieldsValue())}>
                        {/* Hàng 1: code + dateRange */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Form.Item name="code" label={t('shipments.filters.code')} className="mb-0">
                                <AntInput placeholder="Nhập mã yêu cầu" className={inputCls} allowClear />
                            </Form.Item>
                            <Form.Item name="dateRange" label={t('shipments.filters.created_at')} className="mb-0 md:col-span-2">
                                <RangePicker className="w-full h-11 rounded-2xl" showTime format="DD/MM/YYYY HH:mm"
                                    placeholder={['Từ ngày', 'Đến ngày']} />
                            </Form.Item>
                        </div>

                        {/* Hàng 2: mã vận đơn + mã hóa đơn gốc + shop */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <Form.Item name="waybillCode" label={t('shipments.filters.waybill')} className="mb-0">
                                <AntInput placeholder="Nhập mã vận đơn" className={inputCls} allowClear />
                            </Form.Item>
                            <Form.Item name="originalInvoiceCode" label={t('shipments.filters.original_invoice')} className="mb-0">
                                <AntInput placeholder="Nhập mã hóa đơn gốc" className={inputCls} allowClear />
                            </Form.Item>
                            <Form.Item name="shopName" label={t('shipments.filters.shop_name')} className="mb-0">
                                <AntInput placeholder="Nhập tên shop" className={inputCls} allowClear />
                            </Form.Item>
                        </div>

                        {/* Hàng 3: mã đơn hàng + mã khách hàng */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <Form.Item name="orderCode" label={t('shipments.filters.your_order_code')} className="mb-0">
                                <AntInput placeholder="Mã đơn hàng của bạn" className={inputCls} allowClear />
                            </Form.Item>
                            <Form.Item name="customerCode" label={t('shipments.filters.your_customer_code')} className="mb-0">
                                <AntInput placeholder="Mã khách hàng của bạn" className={inputCls} allowClear />
                            </Form.Item>
                        </div>

                        {/* Hàng 4: Dịch vụ */}
                        {(servicesData?.length ?? 0) > 0 && (
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                                    {t('shipments.filters.services')}
                                </div>
                                <Form.Item name="services" className="mb-0">
                                    <Checkbox.Group className="flex flex-wrap gap-x-6 gap-y-3">
                                        {servicesData!.map((s: any) => (
                                            <Checkbox key={s.code} value={s.code} className="text-sm">{s.name}</Checkbox>
                                        ))}
                                    </Checkbox.Group>
                                </Form.Item>
                            </div>
                        )}

                        {/* Hàng 5: Kẹt trạng thái */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <Form.Item name="stuckStatus" label={t('shipments.filters.stuck_at')} className="mb-0">
                                <Select placeholder="Chọn trạng thái" allowClear className="h-11"
                                    options={statusData?.map((s: any) => ({ label: s.name, value: s.code }))} />
                            </Form.Item>
                            <Form.Item name="period" label={t('shipments.filters.period')} className="mb-0">
                                <Select placeholder="Khoảng thời gian" allowClear className="h-11"
                                    options={[
                                        { label: 'Bất kỳ', value: 'any' },
                                        { label: '1 ngày', value: '1d' },
                                        { label: '3 ngày', value: '3d' },
                                        { label: '7 ngày', value: '7d' },
                                    ]}
                                    defaultValue="any"
                                />
                            </Form.Item>
                            <Form.Item name="from" label={t('shipments.filters.from')} className="mb-0">
                                <AntInput placeholder="VD: 1" className={inputCls} type="number" />
                            </Form.Item>
                            <Form.Item name="to" label={t('shipments.filters.to')} className="mb-0">
                                <AntInput placeholder="VD: 7" className={inputCls} type="number" />
                            </Form.Item>
                        </div>
                    </Form>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="bg-white dark:bg-gray-800 p-1 rounded-2xl border border-gray-100 dark:border-gray-700 inline-block overflow-hidden max-w-full">
                <Tabs
                    activeKey={activeStatus}
                    onChange={key => {
                        const next = key === 'ALL' ? undefined : [key];
                        applyFilters({ ...filters, statuses: next });
                    }}
                    items={[
                        { key: 'ALL', label: <span className="px-5 py-1">Tất cả</span> },
                        ...statusOptions.map((opt: { value: string; label: string }) => ({
                            key: opt.value,
                            label: <span className="px-5 py-1">{opt.label}</span>
                        }))
                    ]}
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
                {isLoading ? (
                    <List
                        dataSource={Array.from({ length: 6 }).map((_, i) => ({ id: `skel-${i}` }))}
                        renderItem={() => (
                            <div className="p-5 border-b border-gray-50 dark:border-gray-700/50">
                                <AntSkeleton active paragraph={{ rows: 1 }} title={false} />
                            </div>
                        )}
                    />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={shipmentData?.data || []}
                        rowKey="id"
                        pagination={false}
                        locale={{
                            emptyText: (
                                <div className="py-20">
                                    <Empty description="Không tìm thấy yêu cầu ký gửi nào" />
                                </div>
                            ),
                        }}
                    />
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center pt-4">
                <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={shipmentData?.total || 0}
                    onChange={(p, s) => { setPage(p); if (s !== pageSize) setPageSize(s); }}
                />
            </div>
        </div>
    );
};
