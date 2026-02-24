import { useMemo, useState } from 'react';
import { Form, Input as AntInput, Button as AntButton, Tag, Skeleton as AntSkeleton, Tabs, Empty, Table, List } from 'antd';
import { Pagination } from '@repo/ui';
import { useFilterWithURL, usePaginationWithURL, useListOrderQuery, useOrderStatusesQuery, useOrderStatisticQuery } from '@repo/hooks';
import { useTranslation } from '@repo/i18n';
import { SearchOutlined, RedoOutlined, ArrowRightOutlined, BoxPlotOutlined, FilterOutlined } from '@ant-design/icons';
import './OrdersStyle3.css';

/**
 * Giao diện 3 — Card Grid (Ant Design)
 * Dành cho Gobiz Logistics (gd3) - Hiển thị dạng thẻ sạch sẽ, bo góc lớn
 */
export const OrdersStyle3: React.FC<{ isTabView?: boolean }> = ({ isTabView }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 12
    });

    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    const apiParams = useMemo(() => {
        const params: Record<string, any> = {
            page: page - 1, // 0-indexed pagination for all tenants
            pageSize,
            ...filters
        };
        if (searchText) params.query = searchText;
        ['statuses'].forEach(key => {
            if (Array.isArray(params[key])) {
                params[key] = params[key].join(',');
            }
        });
        return params;
    }, [page, pageSize, filters, searchText]);

    const { data: orderData, isLoading } = useListOrderQuery(apiParams);
    const { data: statusData } = useOrderStatusesQuery();
    const { data: statisticData } = useOrderStatisticQuery();

    const statusOptions = useMemo(() => {
        if (!statusData) return [];
        return statusData.map((s: any) => {
            const stat = statisticData?.find((item: any) => item.status === s.code);
            const count = Number(stat?.total || 0);
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

    const handleSearch = () => {
        applyFilters({ ...form.getFieldsValue(), query: searchText });
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'code',
            key: 'code',
            render: (text: string, record: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BoxPlotOutlined className="text-primary text-sm" />
                    </div>
                    <div>
                        <div className="font-extrabold text-[#1a1a1a] dark:text-gray-100 tracking-tight">{text}</div>
                        <div className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{record.createdAt}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => getStatusTag(status),
        },
        {
            title: 'Kho nhận',
            dataIndex: 'receivingWarehouse',
            key: 'receivingWarehouse',
            render: (warehouse: any) => (
                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
                    {warehouse?.displayName || '---'}
                </span>
            )
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            render: (note: string) => (
                <div className="max-w-[200px]">
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 m-0 italic">
                        {note || <span className="opacity-40">Không có ghi chú</span>}
                    </p>
                </div>
            )
        },
        {
            title: 'Giá trị đơn',
            dataIndex: 'grandTotal',
            key: 'grandTotal',
            align: 'right' as const,
            render: (total: number) => (
                <div className="flex flex-col items-end">
                    <span className="text-base font-black text-primary leading-none">
                        {total?.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest font-black mt-1">VNĐ</span>
                </div>
            )
        },
        {
            title: '',
            key: 'action',
            width: 80,
            render: () => (
                <AntButton
                    type="primary"
                    size="small"
                    shape="circle"
                    icon={<ArrowRightOutlined />}
                    className="shadow-sm"
                />
            )
        }
    ];

    return (
        <div className={`orders-style-3-wrapper ${isTabView ? '' : 'p-6'} space-y-6 max-w-[1600px] mx-auto`}>
            {/* Header section with search */}
            {!isTabView && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Quản lý đơn hàng</h1>
                        <p className="text-gray-500 text-sm">Quản lý và vận hành thông minh cùng Gobiz Logistics.</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <AntInput
                            placeholder={t('orders.search_placeholder')}
                            prefix={<SearchOutlined className="text-gray-400" />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onPressEnter={handleSearch}
                            className="w-full md:w-80 h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700"
                        />
                        <AntButton
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={handleSearch}
                            className="h-11 px-8 rounded-2xl font-bold shadow-lg shadow-primary/20"
                        >
                            {t('common.search')}
                        </AntButton>
                        <AntButton
                            icon={<FilterOutlined />}
                            onClick={() => setShowFilters(!showFilters)}
                            className={`h-11 px-5 rounded-2xl font-bold transition-all ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700'}`}
                        >
                            Bộ lọc {showFilters ? 'đóng' : 'mở'}
                        </AntButton>
                        <AntButton
                            icon={<RedoOutlined />}
                            onClick={() => { setSearchText(''); clearFilters(); }}
                            className="h-11 w-11 flex items-center justify-center rounded-2xl border-gray-200 dark:border-gray-700 hover:text-primary"
                        />
                    </div>
                </div>
            )}

            {isTabView && (
                <div className="flex justify-end mb-4 gap-3">
                    <div className="flex flex-wrap gap-3">
                        <AntInput
                            placeholder={t('orders.search_placeholder')}
                            prefix={<SearchOutlined className="text-gray-400" />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onPressEnter={handleSearch}
                            className="w-full md:w-80 h-10 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700"
                        />
                        <AntButton
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={handleSearch}
                            className="h-10 px-6 rounded-xl font-medium"
                        >
                            {t('common.search')}
                        </AntButton>
                        <AntButton
                            icon={<FilterOutlined />}
                            onClick={() => setShowFilters(!showFilters)}
                            className={`h-10 px-4 rounded-xl font-medium transition-all ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700'}`}
                        >
                            Bộ lọc
                        </AntButton>
                    </div>
                </div>
            )}

            {/* Advanced Filters Panel */}
            <div className={`advanced-filters-container overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-[1000px] opacity-100 mb-6' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <Form form={form} layout="vertical">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Form.Item name="code" label="Mã đơn hàng" className="mb-0">
                                <AntInput placeholder="Nhập mã đơn hàng" className="h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700" />
                            </Form.Item>
                            <Form.Item name="shopName" label="Tên Shop" className="mb-0">
                                <AntInput placeholder="Nhập tên shop" className="h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700" />
                            </Form.Item>
                            <Form.Item name="receivingWarehouse" label="Kho nhận" className="mb-0">
                                <AntInput placeholder="Chọn kho nhận" className="h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700" />
                            </Form.Item>
                        </div>
                    </Form>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="bg-white dark:bg-gray-800 p-1 rounded-2xl border border-gray-100 dark:border-gray-700 inline-block overflow-hidden max-w-full">
                <Tabs
                    activeKey={filters.statuses ? (Array.isArray(filters.statuses) ? filters.statuses[0] : filters.statuses) : 'ALL'}
                    onChange={(key) => {
                        const newStatuses = key === 'ALL' ? undefined : [key];
                        applyFilters({ ...form.getFieldsValue(), statuses: newStatuses });
                    }}
                    items={[
                        {
                            key: 'ALL',
                            label: <span className="px-4 py-1">Tất cả</span>
                        },
                        ...statusOptions.map((opt: any) => ({
                            key: opt.value,
                            label: <span className="px-4 py-1">{opt.label}</span>
                        }))
                    ]}
                    className="custom-modern-tabs"
                />
            </div>

            {/* Table View */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
                {isLoading ? (
                    <List
                        dataSource={Array.from({ length: 5 }).map((_, i) => ({ id: `loading-${i}` }))}
                        renderItem={() => (
                            <div className="p-6 border-b border-gray-50 dark:border-gray-700/50">
                                <AntSkeleton active paragraph={{ rows: 1 }} title={false} />
                            </div>
                        )}
                    />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={orderData?.data || []}
                        rowKey="id"
                        pagination={false}
                        className="custom-modern-table"
                        locale={{
                            emptyText: (
                                <div className="py-20">
                                    <Empty description="Không tìm thấy đơn hàng nào" />
                                </div>
                            )
                        }}
                    />
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center pt-4">
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
    );
};
