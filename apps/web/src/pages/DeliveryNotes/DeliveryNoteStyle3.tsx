import { useState } from 'react';
import {
    Form,
    Input as AntInput,
    Button as AntButton,
    Tag,
    Skeleton as AntSkeleton,
    Tabs,
    Empty,
    Table,
    List,
} from 'antd';
import { Pagination } from '@repo/ui';
import {
    SearchOutlined,
    RedoOutlined,
    FilterOutlined,
    ArrowRightOutlined,
    FileDoneOutlined,
} from '@ant-design/icons';
import './DeliveryNoteStyle3.css';
import { useDeliveryNotesPage } from './hooks/useDeliveryNotesPage';

/**
 * DeliveryNoteStyle3 — Giao diện cho Gobiz (gd3)
 * Premium table view với status tabs, hiện đại và sạch sẽ.
 */
export const DeliveryNoteStyle3 = ({ isTabView: _isTabView }: { isTabView?: boolean }) => {
    const {
        form, page, pageSize, setPage, setPageSize,
        filters, listData, isDeliveryNotesLoading,
        handleSearch, handleReset, applyFilters
    } = useDeliveryNotesPage();

    const statusData: any[] = []; // Delivery notes không có status phân loại

    const [showFilters, setShowFilters] = useState(false);

    const getStatusTag = (status: string) => {
        const found = statusData?.find((s: any) => s.code === status);
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
            title: 'Mã phiếu',
            dataIndex: 'code',
            key: 'code',
            render: (text: string, record: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileDoneOutlined className="text-primary text-sm" />
                    </div>
                    <div>
                        <div className="font-extrabold text-[#1a1a1a] dark:text-gray-100 tracking-tight text-sm">{text}</div>
                        <div className="text-[10px] text-gray-400 font-medium tracking-widest">{record.createdAt}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Kho xuất',
            dataIndex: 'warehouseName',
            key: 'warehouseName',
            render: (text: string) => (
                <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">{text || '—'}</span>
            ),
        },
        {
            title: 'Số lượng kiện',
            dataIndex: 'totalPackages',
            key: 'totalPackages',
            align: 'center' as const,
            render: (num: number) => (
                <span className="text-sm font-bold text-primary bg-primary/5 px-3 py-1 rounded-full">{num || 0}</span>
            ),
        },
        {
            title: 'Tổng cân nặng',
            dataIndex: 'totalWeight',
            key: 'totalWeight',
            render: (weight: number) => (
                <div className="text-sm font-medium">
                    <span className="text-gray-900 dark:text-white font-bold">{weight || 0}</span>
                    <span className="text-gray-400 text-[10px] ml-1 uppercase">kg</span>
                </div>
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
                    className="shadow-sm"
                />
            ),
        },
    ];

    const activeStatus = filters.statuses
        ? (Array.isArray(filters.statuses) ? filters.statuses[0] : filters.statuses)
        : 'ALL';

    return (
        <div className="delivery-note-style-3-wrapper space-y-6 max-w-[1600px] mx-auto">
            {/* Header / Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Phiếu giao hàng</h1>
                    <p className="text-gray-500 text-sm">Quản lý và xuất các phiếu bàn giao hàng hóa.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Form form={form} component={false}>
                        <Form.Item name="query" noStyle>
                            <AntInput
                                placeholder="Tìm theo mã phiếu, kho xuất..."
                                prefix={<SearchOutlined className="text-gray-400" />}
                                className="w-full md:w-80 h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700"
                                onPressEnter={handleSearch}
                            />
                        </Form.Item>
                    </Form>
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
                        onClick={handleReset}
                        className="h-11 px-5 rounded-2xl font-bold border-gray-200 dark:border-gray-700 hover:text-primary transition-all bg-gray-50 dark:bg-gray-900"
                    >
                        Làm mới
                    </AntButton>
                </div>
            </div>

            {/* Advanced Filters */}
            <div
                className={`advanced-filters-container overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-[400px] opacity-100 mb-6' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <Form
                        form={form}
                        layout="vertical"
                        onValuesChange={() => applyFilters(form.getFieldsValue())}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item name="query" label="Tìm kiếm nhanh">
                                <AntInput
                                    placeholder="Nhập mã phiếu hoặc tên kho..."
                                    className="h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700"
                                />
                            </Form.Item>
                            <Form.Item name="warehouseName" label="Kho xuất">
                                <AntInput
                                    placeholder="Lọc theo tên kho..."
                                    className="h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700"
                                />
                            </Form.Item>
                        </div>
                    </Form>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto no-scrollbar">
                <Tabs
                    activeKey={activeStatus}
                    onChange={key =>
                        applyFilters({ ...filters, statuses: key === 'ALL' ? undefined : [key] })
                    }
                    className="delivery-note-status-tabs"
                    items={[
                        { key: 'ALL', label: <span className="px-5 py-1">Tất cả</span> },
                        ...(statusData || []).map((s: any) => ({
                            key: s.code,
                            label: <span className="px-5 py-1">{s.name}</span>,
                        })),
                    ]}
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
                {isDeliveryNotesLoading ? (
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
                                    <Empty description="Không tìm thấy phiếu giao hàng nào" />
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

