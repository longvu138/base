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
    DatePicker,
} from 'antd';
import { Pagination } from '@repo/ui';
import {
    SearchOutlined,
    RedoOutlined,
    FilterOutlined,
    ArrowRightOutlined,
    BarcodeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './WaybillsStyle3.css';
import { useWaybillsPage } from './hooks/useWaybillsPage';

/**
 * WaybillsStyle3 — Giao diện cho Gobiz (gd3)
 * Premium table view với status tabs, aligned với phong cách Gobiz Logistics.
 */
export const WaybillsStyle3 = () => {
    const {
        form, page, pageSize, setPage, setPageSize,
        filters, listData, isWaybillsLoading, statusData,
        handleSearch, handleReset, applyFilters
    } = useWaybillsPage();

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
            title: 'Mã vận đơn',
            dataIndex: 'code',
            key: 'code',
            render: (text: string, record: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <BarcodeOutlined className="text-primary text-sm" />
                    </div>
                    <div>
                        <div className="font-extrabold text-[#1a1a1a] dark:text-gray-100 tracking-tight text-sm">
                            {text || '—'}
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium tracking-widest">
                            {record.createdAt ? dayjs(record.createdAt).format('DD/MM/YYYY HH:mm') : ''}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderCode',
            key: 'orderCode',
            render: (t: string) => (
                <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">{t || '—'}</span>
            ),
        },
        {
            title: 'Đối tác vận chuyển',
            key: 'carrier',
            render: (_: any, record: any) => (
                <div>
                    <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                        {record.carrierName || '—'}
                    </div>
                    {record.carrierCode && (
                        <div className="text-[11px] text-gray-400">{record.carrierCode}</div>
                    )}
                </div>
            ),
        },
        {
            title: 'Thời gian nhận',
            dataIndex: 'receivedTime',
            key: 'receivedTime',
            render: (t: string) => (
                <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {t ? dayjs(t).format('DD/MM/YYYY') : '—'}
                    </div>
                    {t && (
                        <div className="text-[10px] text-gray-400">{dayjs(t).format('HH:mm')}</div>
                    )}
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
        <div className="waybills-style-3-wrapper space-y-6 max-w-[1600px] mx-auto">
            {/* Header / Filter card */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Mã vận đơn
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Tra cứu và theo dõi trạng thái các mã vận đơn.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Form form={form} component={false}>
                        <Form.Item name="query" noStyle>
                            <AntInput
                                placeholder="Tìm theo mã vận đơn..."
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
                        className={`h-11 px-5 rounded-2xl font-bold transition-all ${showFilters
                                ? 'bg-primary/10 text-primary border-primary/20'
                                : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700'
                            }`}
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Form.Item name="query" label="Mã vận đơn" className="mb-0">
                                <AntInput
                                    placeholder="Nhập mã vận đơn"
                                    className="h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700"
                                    allowClear
                                />
                            </Form.Item>
                            <Form.Item
                                name="receivedTimeRange"
                                label="Thời gian nhận"
                                className="mb-0 md:col-span-2"
                            >
                                <DatePicker.RangePicker
                                    className="w-full h-11 rounded-2xl"
                                    showTime
                                    format="DD/MM/YYYY HH:mm"
                                    placeholder={['Từ ngày', 'Đến ngày']}
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
                    className="waybills-status-tabs"
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
                {isWaybillsLoading ? (
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
                                    <Empty description="Không tìm thấy mã vận đơn nào" />
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
