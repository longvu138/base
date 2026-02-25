import { useMemo, useState } from 'react';
import { Form, Input as AntInput, Button as AntButton, Tag, Skeleton as AntSkeleton, Tabs, Empty, Table, List, DatePicker, Checkbox } from 'antd';
import { Pagination } from '@repo/ui';
import { useFilterWithURL, usePaginationWithURL, useListShipmentQuery, useShipmentStatusesQuery, useShipmentStatisticQuery, useShipmentServicesQuery } from '@repo/hooks';
import { useTranslation } from '@repo/i18n';
import { SearchOutlined, RedoOutlined, ArrowRightOutlined, RocketOutlined, FilterOutlined } from '@ant-design/icons';
import './ShipmentsStyle3.css';

const { RangePicker } = DatePicker;

/**
 * ShipmentsStyle3 — Giao diện cho Gobiz (gd3)
 * Premium table view với status tabs và collapsible filters cho ký gửi.
 */
export const ShipmentsStyle3: React.FC<{ isTabView?: boolean }> = ({ isTabView }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
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

    const [searchText, setSearchText] = useState(filters.query || '');

    const handleSearch = () => {
        applyFilters({ ...filters, query: searchText });
    };

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
                        <div className="font-extrabold text-[#1a1a1a] dark:text-gray-100 tracking-tight text-sm">{text}</div>
                        <div className="text-[10px] text-gray-400 font-medium tracking-widest">{record.createdAt}</div>
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
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (s: string) => getStatusTag(s),
        },
        {
            title: '',
            key: 'action',
            width: 60,
            render: () => (
                <AntButton
                    type="primary"
                    size="small"
                    shape="circle"
                    icon={<ArrowRightOutlined />}
                    className="shadow-sm"
                />
            ),
        },
    ];

    const activeStatus = filters.statuses
        ? (Array.isArray(filters.statuses) ? filters.statuses[0] : filters.statuses)
        : 'ALL';

    return (
        <div className={`shipments-style-3-wrapper ${isTabView ? '' : 'p-6'} space-y-6 max-w-[1600px] mx-auto`}>
            {/* Header / Filter - full page mode */}
            {!isTabView && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Ký gửi Vận chuyển</h1>
                        <p className="text-gray-500 text-sm">Quản lý các yêu cầu ký gửi hàng hóa.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <AntInput
                            placeholder="Tìm mã yêu cầu, vận đơn..."
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
                            Tìm kiếm
                        </AntButton>
                        <AntButton
                            icon={<FilterOutlined />}
                            onClick={() => setShowFilters(!showFilters)}
                            className={`h-11 px-5 rounded-2xl font-bold transition-all ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700'}`}
                        >
                            Bộ lọc
                        </AntButton>
                        <AntButton
                            icon={<RedoOutlined />}
                            onClick={() => { setSearchText(''); clearFilters(); }}
                            className="h-11 px-5 rounded-2xl font-bold border-gray-200 dark:border-gray-700 hover:text-primary transition-all bg-gray-50 dark:bg-gray-900"
                        >
                            Làm mới
                        </AntButton>
                    </div>
                </div>
            )}

            {isTabView && (
                <div className="flex justify-end mb-4 gap-3">
                    <div className="flex flex-wrap gap-3">
                        <AntInput
                            placeholder="Tìm mã yêu cầu, vận đơn..."
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
                        <AntButton
                            icon={<RedoOutlined />}
                            onClick={() => { setSearchText(''); clearFilters(); }}
                            className="h-10 px-4 rounded-xl font-medium border-gray-200 dark:border-gray-700 hover:text-primary transition-all bg-gray-50 dark:bg-gray-900"
                        >
                            Làm mới
                        </AntButton>
                    </div>
                </div>
            )}

            {/* Advanced Filters Panel */}
            <div className={`advanced-filters-container overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-[1000px] opacity-100 mb-6' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <Form form={form} layout="vertical" onValuesChange={() => applyFilters(form.getFieldsValue())}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Form.Item name="waybillCode" label="Mã vận đơn" className="mb-0">
                                <AntInput placeholder="Nhập mã vận đơn" className="h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700" />
                            </Form.Item>
                            <Form.Item name="shopName" label="Tên Shop" className="mb-0">
                                <AntInput placeholder="Nhập tên shop" className="h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700" />
                            </Form.Item>
                            <Form.Item name="dateRange" label="Ngày tạo" className="mb-0">
                                <RangePicker className="w-full h-11 rounded-2xl bg-gray-50 border-0" />
                            </Form.Item>
                        </div>
                        <div className="mt-6">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Dịch vụ</div>
                            <Form.Item name="services" className="mb-0">
                                <Checkbox.Group className="flex flex-wrap gap-x-6 gap-y-3">
                                    {(servicesData || []).map(s => (
                                        <Checkbox key={s.code} value={s.code} className="text-sm">{s.name}</Checkbox>
                                    ))}
                                </Checkbox.Group>
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
                    onChange={(p, s) => {
                        setPage(p);
                        if (s !== pageSize) setPageSize(s);
                    }}
                />
            </div>
        </div>
    );
};
