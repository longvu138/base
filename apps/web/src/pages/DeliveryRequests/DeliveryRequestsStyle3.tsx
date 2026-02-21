import { useMemo, useState } from 'react';
import { Input as AntInput, Button as AntButton, Tag, Skeleton as AntSkeleton, Tabs, Empty, Table, List } from 'antd';
import { Pagination } from '@repo/ui';
import { useFilterWithURL, usePaginationWithURL, useListDeliveryRequestQuery, useDeliveryRequestStatusesQuery } from '@repo/hooks';
import { SearchOutlined, RedoOutlined, ArrowRightOutlined, InboxOutlined } from '@ant-design/icons';
import './DeliveryRequestsStyle3.css';

/**
 * DeliveryRequestsStyle3 — Giao diện cho Gobiz (gd3)
 * Premium table view với status tabs, aligned với phong cách Gobiz Logistics.
 */
export const DeliveryRequestsStyle3 = () => {
    const [searchText, setSearchText] = useState('');

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 25,
    });

    const { applyFilters, clearFilters, filters } = useFilterWithURL({});

    const apiParams = useMemo(() => {
        const params: Record<string, any> = {
            page: page - 1,
            size: pageSize,
            sort: 'createdAt:desc',
            ...filters,
        };
        if (searchText) params.query = searchText;
        ['statuses'].forEach(key => {
            if (Array.isArray(params[key])) {
                params[key] = params[key].join(',');
            }
        });
        return params;
    }, [page, pageSize, filters, searchText]);

    const { data: listData, isLoading } = useListDeliveryRequestQuery(apiParams);
    const { data: statusData } = useDeliveryRequestStatusesQuery();

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

    const handleSearch = () => {
        applyFilters({ query: searchText });
    };

    const columns = [
        {
            title: 'Mã yêu cầu',
            dataIndex: 'code',
            key: 'code',
            render: (text: string, record: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <InboxOutlined className="text-primary text-sm" />
                    </div>
                    <div>
                        <div className="font-extrabold text-[#1a1a1a] dark:text-gray-100 tracking-tight text-sm">{text}</div>
                        <div className="text-[10px] text-gray-400 font-medium tracking-widest">{record.createdAt}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Người nhận',
            key: 'receiver',
            render: (_: any, record: any) => (
                <div>
                    <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">{record.receiverName || '—'}</div>
                    <div className="text-[11px] text-gray-400">{record.receiverPhone || ''}</div>
                </div>
            ),
        },
        {
            title: 'Địa chỉ giao',
            dataIndex: 'receiverAddress',
            key: 'receiverAddress',
            render: (text: string) => (
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 m-0 max-w-[220px]">
                    {text || <span className="opacity-40 italic">Chưa có địa chỉ</span>}
                </p>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
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
                    className="shadow-md hover:scale-110 transition-transform"
                />
            ),
        },
    ];

    const activeStatus = filters.statuses
        ? (Array.isArray(filters.statuses) ? filters.statuses[0] : filters.statuses)
        : 'ALL';

    return (
        <div className="delivery-requests-style-3-wrapper p-6 space-y-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Yêu cầu giao hàng</h1>
                    <p className="text-gray-500 text-sm">Quản lý các yêu cầu giao hàng của khách hàng.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <AntInput
                        placeholder="Tìm theo mã, tên người nhận..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
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
                        icon={<RedoOutlined />}
                        onClick={() => { setSearchText(''); clearFilters(); }}
                        className="h-11 w-11 flex items-center justify-center rounded-2xl border-gray-200 dark:border-gray-700 hover:text-primary"
                    />
                </div>
            </div>

            {/* Status Tabs */}
            <div className="bg-white dark:bg-gray-800 p-1 rounded-2xl border border-gray-100 dark:border-gray-700 inline-block overflow-hidden max-w-full">
                <Tabs
                    activeKey={activeStatus}
                    onChange={key => {
                        const newStatuses = key === 'ALL' ? undefined : [key];
                        applyFilters({ statuses: newStatuses });
                    }}
                    items={[
                        { key: 'ALL', label: <span className="px-4 py-1">Tất cả</span> },
                        ...(statusData || []).map(s => ({
                            key: s.code,
                            label: <span className="px-4 py-1">{s.name}</span>,
                        })),
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
                        dataSource={listData?.data || []}
                        rowKey="id"
                        pagination={false}
                        locale={{
                            emptyText: (
                                <div className="py-20">
                                    <Empty description="Không tìm thấy yêu cầu giao nào" />
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
