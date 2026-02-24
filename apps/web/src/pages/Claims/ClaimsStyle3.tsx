import { useMemo, useState } from 'react';
import { Form, Input as AntInput, Button as AntButton, Tag, Skeleton as AntSkeleton, Tabs, Empty, Table, List } from 'antd';
import { Pagination } from '@repo/ui';
import { useFilterWithURL, usePaginationWithURL, useListClaimQuery, useClaimStatusesQuery, useSolutionsQuery } from '@repo/hooks';
import { SearchOutlined, RedoOutlined, ArrowRightOutlined, BugOutlined, FilterOutlined } from '@ant-design/icons';
import './ClaimsStyle3.css';

/**
 * ClaimsStyle3 — Giao diện cho Gobiz (gd3)
 * Premium table view với status tabs, hiện đại và sạch sẽ.
 */
export const ClaimsStyle3 = () => {
    const [form] = Form.useForm();
    const [showFilters, setShowFilters] = useState(false);

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 25,
    });

    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    const apiParams = useMemo(() => {
        const params: Record<string, any> = {
            page: page - 1,
            size: pageSize,
            sort: 'createdAt:desc',
            ...filters,
        };
        ['publicStates', 'ticketTypes', 'solutionCodes'].forEach(key => {
            if (Array.isArray(params[key])) {
                params[key] = params[key].join(',');
            }
        });
        return params;
    }, [page, pageSize, filters]);

    const { data: listData, isLoading } = useListClaimQuery(apiParams);
    const { data: statusData } = useClaimStatusesQuery();
    const { data: solutionData } = useSolutionsQuery();

    const getStatusTag = (status: string) => {
        const found = statusData?.find(s => s.code === status);
        return (
            <Tag
                color={found?.color || 'default'}
                className="rounded-lg px-3 py-0.5 m-0 border-0 font-bold text-[10px] uppercase shadow-sm"
            >
                {found?.name || status}
            </Tag>
        );
    };

    const columns = [
        {
            title: 'Mã khiếu nại',
            dataIndex: 'code',
            key: 'code',
            render: (text: string, record: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <BugOutlined className="text-primary text-sm" />
                    </div>
                    <div>
                        <div className="font-extrabold text-[#1a1a1a] dark:text-gray-100 tracking-tight text-sm">{text}</div>
                        <div className="text-[10px] text-gray-400 font-medium tracking-widest">{record.createdAt}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Hạng mục',
            key: 'category',
            render: (_: any, record: any) => (
                <div>
                    <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                        {record.ticketType === 'order' ? 'Đơn hàng' : 'Vận chuyển'}
                    </div>
                    <div className="text-[11px] text-gray-400">ID: {record.relatedOrder || '—'}</div>
                </div>
            ),
        },
        {
            title: 'Thông tin bổ sung',
            key: 'info',
            render: (_: any, record: any) => (
                <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">SP: {record.relatedProduct || '—'}</div>
                    <div className="text-[11px] text-primary italic">Xử lý: {solutionData?.find(s => s.code === record.solutionCode)?.name || record.solutionCode || '—'}</div>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'publicState',
            key: 'publicState',
            render: (status: string) => getStatusTag(status),
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

    const activeStatus = filters.publicStates
        ? (Array.isArray(filters.publicStates) ? filters.publicStates[0] : filters.publicStates)
        : 'ALL';

    return (
        <div className="claims-style-3-wrapper space-y-6 max-w-[1600px] mx-auto">
            {/* Header / Filter */}
            <Form form={form} onFinish={applyFilters} className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Quản lý Khiếu nại</h1>
                        <p className="text-gray-500 text-sm">Xử lý các vấn đề phát sinh từ dịch vụ.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Form.Item name="code" noStyle>
                            <AntInput
                                placeholder="Tìm theo mã khiếu nại, đơn hàng..."
                                prefix={<SearchOutlined className="text-gray-400" />}
                                className="w-full md:w-80 h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700"
                                onPressEnter={() => form.submit()}
                            />
                        </Form.Item>
                        <AntButton
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={() => form.submit()}
                            className="h-11 px-8 rounded-2xl font-bold shadow-lg shadow-primary/20"
                        >
                            Tìm kiếm
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
                            onClick={clearFilters}
                            className="h-11 w-11 flex items-center justify-center rounded-2xl border-gray-200 dark:border-gray-700 hover:text-primary"
                        />
                    </div>
                </div>

                {/* Advanced Filters (Status, Solution, Type) */}
                <div className={`advanced-filters-container overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-[1000px] opacity-100 mt-6 mb-6' : 'max-h-0 opacity-0'}`}>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item name="relatedOrder" noStyle>
                                <AntInput
                                    placeholder="Mã đơn hàng"
                                    className="h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700"
                                    onChange={(e) => {
                                        form.setFieldValue('relatedOrder', e.target.value);
                                        applyFilters({ ...filters, relatedOrder: e.target.value });
                                    }}
                                />
                            </Form.Item>
                            <Form.Item name="relatedProduct" noStyle>
                                <AntInput
                                    placeholder="Mã sản phẩm"
                                    className="h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700"
                                    onChange={(e) => {
                                        form.setFieldValue('relatedProduct', e.target.value);
                                        applyFilters({ ...filters, relatedProduct: e.target.value });
                                    }}
                                />
                            </Form.Item>
                        </div>

                        <div>
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Phương án xử lý</div>
                            <div className="flex flex-wrap gap-2">
                                <Tag.CheckableTag
                                    checked={!filters.solutionCodes || filters.solutionCodes.length === 0}
                                    onChange={() => applyFilters({ ...filters, solutionCodes: [] })}
                                    className="px-4 py-1.5 rounded-xl border border-gray-100 text-sm"
                                >
                                    Tất cả
                                </Tag.CheckableTag>
                                {(solutionData || []).map(s => (
                                    <Tag.CheckableTag
                                        key={s.code}
                                        checked={Array.isArray(filters.solutionCodes) && filters.solutionCodes.includes(s.code)}
                                        onChange={checked => {
                                            const next = checked
                                                ? [...(filters.solutionCodes || []), s.code]
                                                : (filters.solutionCodes || []).filter((t: string) => t !== s.code);
                                            applyFilters({ ...filters, solutionCodes: next });
                                        }}
                                        className="px-4 py-1.5 rounded-xl border border-gray-100 text-sm"
                                    >
                                        {s.name}
                                    </Tag.CheckableTag>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Loại đơn</div>
                            <div className="flex flex-wrap gap-2">
                                <Tag.CheckableTag
                                    checked={!filters.ticketTypes || filters.ticketTypes.length === 0}
                                    onChange={() => applyFilters({ ...filters, ticketTypes: [] })}
                                    className="px-4 py-1.5 rounded-xl border border-gray-100 text-sm"
                                >
                                    Tất cả
                                </Tag.CheckableTag>
                                {[
                                    { label: 'Đơn hàng', value: 'order' },
                                    { label: 'Vận chuyển', value: 'shipment' }
                                ].map(t => (
                                    <Tag.CheckableTag
                                        key={t.value}
                                        checked={Array.isArray(filters.ticketTypes) && filters.ticketTypes.includes(t.value)}
                                        onChange={checked => {
                                            const next = checked
                                                ? [...(filters.ticketTypes || []), t.value]
                                                : (filters.ticketTypes || []).filter((v: string) => v !== t.value);
                                            applyFilters({ ...filters, ticketTypes: next });
                                        }}
                                        className="px-4 py-1.5 rounded-xl border border-gray-100 text-sm"
                                    >
                                        {t.label}
                                    </Tag.CheckableTag>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Form>

            {/* Status Tabs - Luôn hiển thị vì nó là filter chính */}
            <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto no-scrollbar">
                <Tabs
                    activeKey={activeStatus}
                    onChange={key => applyFilters({ ...filters, publicStates: key === 'ALL' ? undefined : [key] })}
                    className="claims-status-tabs"
                    items={[
                        { key: 'ALL', label: <span className="px-5 py-1">Tất cả</span> },
                        ...(statusData || []).map(s => ({ key: s.code, label: <span className="px-5 py-1">{s.name}</span> })),
                    ]}
                />
            </div>

            {/* Content List/Table */}
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
                        dataSource={listData?.data || []}
                        rowKey="id"
                        pagination={false}
                        locale={{
                            emptyText: (
                                <div className="py-20">
                                    <Empty description="Không tìm thấy khiếu nại nào" />
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
                    total={listData?.total || 0}
                    onChange={(p, s) => {
                        setPage(p);
                        if (s !== pageSize) setPageSize(s);
                    }}
                />
            </div>
        </div>
    );
};
