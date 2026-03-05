import { useMemo, useState } from 'react';
import { Form, Input as AntInput, Button as AntButton, Tag, Skeleton as AntSkeleton, Tabs, Empty, Table, List, Select, DatePicker } from 'antd';
import { Pagination } from '@repo/ui';
import {
    useFilterWithURL,
    usePaginationWithURL,
    useListWithdrawalSlipQuery,
    useWithdrawalSlipStatusesQuery,
    useBanksQuery,
} from '@repo/hooks';
import { SearchOutlined, RedoOutlined, BankOutlined, FilterOutlined, ArrowRightOutlined } from '@ant-design/icons';
import './WithdrawalSlipStyle3.css';

const { RangePicker } = DatePicker;

/**
 * WithdrawalSlipStyle3 — Premium layout (Gobiz/gd3)
 * Exactly mirrors ClaimsStyle3 layout, logic and colors.
 */
export const WithdrawalSlipStyle3 = ({ isTabView }: { isTabView?: boolean }) => {
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
        if (Array.isArray(params.statuses)) {
            params.statuses = params.statuses.join(',');
        }
        return params;
    }, [page, pageSize, filters]);

    const { data: listData, isLoading } = useListWithdrawalSlipQuery(apiParams);
    const { data: statusData } = useWithdrawalSlipStatusesQuery();
    const { data: banksData } = useBanksQuery();

    const bankOptions = useMemo(() => (banksData || []).map((b: any) => ({ label: b.name, value: b.code })), [banksData]);

    const getStatusTag = (val: any) => {
        const statusCode = typeof val === 'object' ? val?.code : val;
        const found = statusData?.find((s: any) => s.code === statusCode);
        const name = found?.name || (typeof val === 'object' ? val?.name : val);
        return (
            <Tag
                color={found?.color || 'default'}
                className="rounded-lg px-3 py-0.5 m-0 border-0 font-bold text-[10px] uppercase shadow-sm"
            >
                {name || val}
            </Tag>
        );
    };

    const columns = [
        {
            title: 'Mã yêu cầu',
            dataIndex: 'code',
            key: 'code',
            render: (text: string, record: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <BankOutlined className="text-primary text-sm" />
                    </div>
                    <div>
                        <div className="font-extrabold text-[#1a1a1a] dark:text-gray-100 tracking-tight text-sm">{text || '—'}</div>
                        <div className="text-[10px] text-gray-400 font-medium tracking-widest">{record.createdAt}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Tài khoản thụ hưởng',
            key: 'beneficiary',
            render: (_: any, record: any) => {
                const bankVal = record.beneficiaryBank;
                const bankCode = typeof bankVal === 'object' ? bankVal?.code : bankVal;
                const bankName = banksData?.find((b: any) => b.code === bankCode)?.name
                    || (typeof bankVal === 'object' ? bankVal?.name : bankVal)
                    || '—';
                return (
                    <div className="space-y-0.5">
                        <div className="font-semibold text-sm text-gray-800 dark:text-gray-100 font-mono">
                            {record.beneficiaryAccount || '—'}
                        </div>
                        <div className="text-[11px] text-gray-400">
                            {bankName}
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Số tiền rút',
            dataIndex: 'amount',
            key: 'amount',
            render: (val: number) => (
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {val?.toLocaleString('vi-VN')} ₫
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
        <div className="withdrawal-style-3-wrapper space-y-6 max-w-[1600px] mx-auto">
            {/* Header Section — ẩn khi isTabView */}
            <Form form={form} onFinish={applyFilters} className="space-y-4">
                {!isTabView && (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Rút tiền</h1>
                            <p className="text-gray-500 text-sm">Xử lý các yêu cầu rút tiền tài khoản.</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Form.Item name="query" noStyle>
                                <AntInput
                                    placeholder="Tìm mã yêu cầu, số tài khoản..."
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
                                Bộ lọc
                            </AntButton>
                            <AntButton
                                icon={<RedoOutlined />}
                                onClick={clearFilters}
                                className="h-11 px-5 rounded-2xl font-bold border-gray-200 dark:border-gray-700 hover:text-primary transition-all bg-gray-50 dark:bg-gray-900"
                            >
                                Làm mới
                            </AntButton>
                        </div>
                    </div>
                )}

                {/* Search bar khi là tab */}
                {isTabView && (
                    <div className="flex flex-wrap gap-3 mb-2">
                        <Form.Item name="query" noStyle>
                            <AntInput
                                placeholder="Tìm mã yêu cầu, số tài khoản..."
                                prefix={<SearchOutlined className="text-gray-400" />}
                                className="w-full md:w-80 h-10 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700"
                                onPressEnter={() => form.submit()}
                            />
                        </Form.Item>
                        <AntButton type="primary" icon={<SearchOutlined />} onClick={() => form.submit()}
                            className="h-10 px-6 rounded-xl font-bold">
                            Tìm kiếm
                        </AntButton>
                        <AntButton icon={<FilterOutlined />} onClick={() => setShowFilters(!showFilters)}
                            className={`h-10 px-4 rounded-xl font-bold transition-all ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700'}`}>
                            Bộ lọc
                        </AntButton>
                        <AntButton icon={<RedoOutlined />} onClick={clearFilters}
                            className="h-10 px-4 rounded-xl font-bold border-gray-200 dark:border-gray-700 hover:text-primary transition-all bg-gray-50 dark:bg-gray-900">
                            Làm mới
                        </AntButton>
                    </div>
                )}

                {/* Advanced Filter Area */}
                <div className={`advanced-filters-container overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-[1000px] opacity-100 mt-6 mb-6' : 'max-h-0 opacity-0'}`}>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item name="beneficiaryAccount" noStyle>
                                <AntInput
                                    placeholder="Số tài khoản thụ hưởng"
                                    className="h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700"
                                />
                            </Form.Item>
                            <Form.Item name="beneficiaryBank" noStyle>
                                <Select
                                    placeholder="Chọn ngân hàng"
                                    className="h-11 w-full"
                                    options={bankOptions}
                                    allowClear
                                    showSearch
                                />
                            </Form.Item>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item name="createdAtRange" noStyle>
                                <RangePicker
                                    className="h-11 w-full rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700"
                                    placeholder={['Từ ngày', 'Đến ngày']}
                                />
                            </Form.Item>
                        </div>
                    </div>
                </div>
            </Form>

            {/* Main Tabs Selection (GIỐNG CLAIMS) */}
            <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto no-scrollbar">
                <Tabs
                    activeKey={activeStatus}
                    onChange={key => applyFilters({ ...filters, statuses: key === 'ALL' ? undefined : [key] })}
                    className="claims-status-tabs"
                    items={[
                        { key: 'ALL', label: <span className="px-5 py-1">Tất cả</span> },
                        ...(statusData || []).map((s: any) => ({ key: s.code, label: <span className="px-5 py-1">{s.name}</span> })),
                    ]}
                />
            </div>

            {/* List Data View */}
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
                                    <Empty description="Không tìm thấy yêu cầu rút tiền nào" />
                                </div>
                            ),
                        }}
                    />
                )}
            </div>

            {/* Bottom Pagination */}
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
