import { useState } from 'react';
import {
    Form, Input as AntInput, Button as AntButton, Tag,
    Skeleton as AntSkeleton, Tabs, Empty, Table, List,
} from 'antd';
import { Pagination } from '@repo/ui';
import {
    SearchOutlined, RedoOutlined, WalletOutlined,
    FilterOutlined, ArrowRightOutlined,
} from '@ant-design/icons';
import './WithdrawalSlipStyle3.css';
import { useWithdrawalSlipsPage } from './hooks/useWithdrawalSlipsPage';

/**
 * WithdrawalSlipStyle3 — Giao diện rút tiền dành cho Gobiz (gd3)
 */
export const WithdrawalSlipStyle3 = ({ isTabView }: { isTabView?: boolean }) => {
    const {
        form, page, pageSize, setPage, setPageSize,
        filters, listData, isWithdrawalSlipsLoading, statusData,
        handleSearch, handleReset, applyFilters
    } = useWithdrawalSlipsPage();

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
            title: 'Mã phiếu / Ngày tạo',
            dataIndex: 'code',
            key: 'code',
            render: (text: string, record: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <WalletOutlined className="text-primary text-sm" />
                    </div>
                    <div>
                        <div className="font-extrabold text-[#1a1a1a] dark:text-gray-100 text-sm">{text || '—'}</div>
                        <div className="text-[10px] text-gray-400 font-medium">{record.createdAt || '—'}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right' as const,
            render: (value: number) => (
                <div className="flex flex-col items-end">
                    <span className="text-base font-black text-gray-900 dark:text-white leading-none">
                        {value?.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest font-black mt-1">VNĐ</span>
                </div>
            ),
        },
        {
            title: 'Ngân hàng / Tài khoản',
            dataIndex: 'bankName',
            key: 'bank',
            render: (text: string, record: any) => (
                <div>
                    <div className="text-sm font-bold text-gray-700 dark:text-gray-200">{text || '—'}</div>
                    <div className="text-[11px] text-gray-400">{record.bankAccountName} - {record.bankAccountNumber}</div>
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
        <div className="withdrawal-slip-style-3-wrapper space-y-6">
            {/* Header STANDALONE */}
            {!isTabView && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Yêu cầu rút tiền</h1>
                </div>
            )}

            {/* Search + actions */}
            <div className="flex flex-wrap gap-3">
                <Form form={form} component={false}>
                    <Form.Item name="query" noStyle>
                        <AntInput
                            placeholder="Mã phiếu, ngân hàng..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            className="w-full md:w-80 h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700"
                            onPressEnter={handleSearch}
                        />
                    </Form.Item>
                </Form>
                <AntButton type="primary" icon={<SearchOutlined />} onClick={handleSearch}
                    className="h-11 px-8 rounded-2xl font-bold shadow-lg shadow-primary/20">
                    Tìm kiếm
                </AntButton>
                <AntButton icon={<FilterOutlined />} onClick={() => setShowFilters(!showFilters)}
                    className={`h-11 px-5 rounded-2xl font-bold transition-all ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700'}`}>
                    Bộ lọc
                </AntButton>
                <AntButton icon={<RedoOutlined />} onClick={handleReset}
                    className="h-11 px-5 rounded-2xl font-bold border-gray-200 dark:border-gray-700 hover:text-primary transition-all bg-gray-50 dark:bg-gray-900">
                    Làm mới
                </AntButton>
            </div>

            {/* Advanced Filters */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <Form form={form} layout="vertical" onValuesChange={() => applyFilters(form.getFieldsValue())}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Form.Item name="bankName" label="Tên ngân hàng" className="mb-0">
                                <AntInput placeholder="VD: Vietcombank" className="h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700" />
                            </Form.Item>
                            <Form.Item name="bankAccountNumber" label="Số tài khoản" className="mb-0">
                                <AntInput placeholder="VD: 0123456789" className="h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700" />
                            </Form.Item>
                        </div>
                    </Form>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="bg-white dark:bg-gray-800 p-1 rounded-2xl border border-gray-100 dark:border-gray-700 inline-block overflow-hidden max-w-full">
                <Tabs
                    activeKey={activeStatus}
                    onChange={key => applyFilters({ ...filters, statuses: key === 'ALL' ? undefined : [key] })}
                    items={[
                        { key: 'ALL', label: <span className="px-5 py-1">Tất cả</span> },
                        ...(statusData || []).map((s: any) => ({ key: s.code, label: <span className="px-5 py-1">{s.name}</span> })),
                    ]}
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
                {isWithdrawalSlipsLoading ? (
                    <List
                        dataSource={Array.from({ length: 6 }).map((_, i) => ({ id: `sk-${i}` }))}
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
                        locale={{ emptyText: <div className="py-20"><Empty description="Không tìm thấy yêu cầu rút tiền nào" /></div> }}
                    />
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center pt-4">
                <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={listData?.total || 0}
                    onChange={(p, s) => { setPage(p); if (s !== pageSize) setPageSize(s); }}
                />
            </div>
        </div>
    );
};

