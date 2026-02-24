import { useMemo, useState } from 'react';
import { Form, Input as AntInput, Button as AntButton, Tag, Skeleton as AntSkeleton, Tabs, Empty, Table, List, DatePicker } from 'antd';
import { Pagination } from '@repo/ui';
import { useFilterWithURL, usePaginationWithURL, useListTransactionQuery, useTransactionTypesQuery, useWalletAccountsQuery } from '@repo/hooks';
import { SearchOutlined, RedoOutlined, DollarCircleOutlined, FilterOutlined, DownloadOutlined } from '@ant-design/icons';
import { TransactionApi } from '@repo/api';
import './TransactionsStyle3.css';

/**
 * TransactionsStyle3 — Giao diện cho Gobiz (gd3)
 * Premium table view với status tabs cho loại giao dịch.
 */
export const TransactionsStyle3 = () => {
    const [form] = Form.useForm();
    const [showFilters, setShowFilters] = useState(false);

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 20
    });
    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    const { data: walletAccounts } = useWalletAccountsQuery();
    const defaultAccount = walletAccounts?.find((acc: any) => acc.isDefault) || walletAccounts?.[0];
    const accountId = defaultAccount?.account;

    const apiParams = useMemo(() => {
        const params: any = {
            page: page - 1,
            size: pageSize,
            ...filters
        };

        if (Array.isArray(params.externalTypes)) {
            params.externalTypes = params.externalTypes.join(',');
        }

        if (params.nominalTimestampFrom) {
            params.nominalTimestampFrom = params.nominalTimestampFrom.startOf('day').toISOString();
        }
        if (params.nominalTimestampTo) {
            params.nominalTimestampTo = params.nominalTimestampTo.endOf('day').toISOString();
        }

        return params;
    }, [filters, page, pageSize]);

    const { data: listData, isLoading } = useListTransactionQuery(accountId, apiParams);
    const { data: transactionTypes } = useTransactionTypesQuery();

    const handleExport = async () => {
        if (!accountId) return;
        try {
            const response = await TransactionApi.exportTransactions(accountId, apiParams);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `transactions_${new Date().getTime()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const getTransactionTypeColor = (type: string) => {
        const colorMap: Record<string, string> = {
            'CHARGE': 'orange',
            'DEBIT': 'red',
            'CREDIT': 'green',
            'REFUND': 'cyan',
            'TRANSFER': 'blue',
            'ADJUSTMENT': 'purple',
            'GIFT': 'magenta',
            'DEPOSIT': 'green',
            'WITHDRAW': 'blue',
            'PAYMENT': 'red',
        };
        return colorMap[type?.toUpperCase()] || 'default';
    };

    const columns = [
        {
            title: 'Thời gian / Mã',
            dataIndex: 'actualTimestamp',
            key: 'actualTimestamp',
            render: (value: string, record: any) => {
                const date = value ? new Date(value) : null;
                const formattedTime = date
                    ? `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
                    : '-';

                return (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <DollarCircleOutlined className="text-primary text-sm" />
                        </div>
                        <div>
                            <div className="font-extrabold text-[#1a1a1a] dark:text-gray-100 tracking-tight text-sm">{formattedTime}</div>
                            <div className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">ID: {record.txid || '—'}</div>
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Loại / Nội dung',
            dataIndex: 'externalType',
            key: 'info',
            render: (value: string, record: any) => {
                const typeCode = value || record?.type;
                const type = transactionTypes?.find((t: any) => t.code?.toLowerCase() === typeCode?.toLowerCase());
                return (
                    <div>
                        <Tag color={getTransactionTypeColor(record?.type || typeCode)} className="rounded-lg px-2 py-0 border-0 font-bold text-[9px] uppercase mb-1">
                            {type?.name || typeCode || '-'}
                        </Tag>
                        <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{record.memo || record.description || '-'}</div>
                    </div>
                );
            },
        },
        {
            title: 'Giá trị giao dịch',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right' as const,
            render: (value: number) => {
                const isPositive = value >= 0;
                return (
                    <div className="flex flex-col items-end">
                        <span className={`text-base font-black ${isPositive ? 'text-green-600' : 'text-red-600'} leading-none`}>
                            {isPositive ? '+' : ''}{value?.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-gray-400 uppercase tracking-widest font-black mt-1">VNĐ</span>
                    </div>
                );
            },
        },
        {
            title: 'Số dư sau',
            dataIndex: 'balanceAfter',
            key: 'balanceAfter',
            align: 'right' as const,
            render: (value: number) => (
                <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                        {value?.toLocaleString()}
                    </span>
                    <span className="text-[8px] text-gray-400 uppercase font-bold">Balance</span>
                </div>
            ),
        },
    ];

    const activeType = filters.externalTypes
        ? (Array.isArray(filters.externalTypes) ? filters.externalTypes[0] : filters.externalTypes)
        : 'ALL';

    return (
        <div className="transactions-style-3-wrapper p-6 space-y-6 max-w-[1600px] mx-auto">
            {/* Header / Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Lịch sử Giao dịch</h1>
                    <p className="text-gray-500 text-sm">Theo dõi biến động số dư và dòng tiền.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Form form={form} onFinish={applyFilters} className="flex gap-3">
                        <Form.Item name="query" noStyle>
                            <AntInput
                                placeholder="Mã giao dịch, nội dung..."
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
                    </Form>
                    <AntButton
                        icon={<FilterOutlined />}
                        onClick={() => setShowFilters(!showFilters)}
                        className={`h-11 px-5 rounded-2xl font-bold transition-all ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700'}`}
                    >
                        Bộ lọc {showFilters ? 'đóng' : 'mở'}
                    </AntButton>
                    <AntButton
                        icon={<DownloadOutlined />}
                        onClick={handleExport}
                        className="h-11 px-5 rounded-2xl font-bold bg-green-50 text-green-600 border-green-100 hover:bg-green-100"
                    >
                        Export
                    </AntButton>
                    <AntButton
                        icon={<RedoOutlined />}
                        onClick={clearFilters}
                        className="h-11 w-11 flex items-center justify-center rounded-2xl border-gray-200 dark:border-gray-700 hover:text-primary"
                    />
                </div>
            </div>

            {/* Advanced Filters Panel */}
            <div className={`advanced-filters-container overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-[1000px] opacity-100 mb-6' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <Form form={form} layout="vertical" onValuesChange={() => applyFilters(form.getFieldsValue())}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Form.Item name="nominalTimestampFrom" label="Từ ngày" className="mb-0">
                                <DatePicker className="w-full h-11 rounded-2xl bg-gray-50 border-0" format="DD/MM/YYYY" placeholder="Ngày bắt đầu" />
                            </Form.Item>
                            <Form.Item name="nominalTimestampTo" label="Đến ngày" className="mb-0">
                                <DatePicker className="w-full h-11 rounded-2xl bg-gray-50 border-0" format="DD/MM/YYYY" placeholder="Ngày kết thúc" />
                            </Form.Item>
                        </div>
                    </Form>
                </div>
            </div>

            {/* Status Tabs for Category */}
            <div className="bg-white dark:bg-gray-800 p-1 rounded-2xl border border-gray-100 dark:border-gray-700 inline-block overflow-hidden max-w-full">
                <Tabs
                    activeKey={activeType}
                    onChange={key => {
                        const next = key === 'ALL' ? undefined : [key];
                        applyFilters({ ...filters, externalTypes: next });
                    }}
                    items={[
                        { key: 'ALL', label: <span className="px-5 py-1">Tất cả</span> },
                        ...(transactionTypes || []).map((t: any) => ({ key: t.code, label: <span className="px-5 py-1">{t.name}</span> })),
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
                                    <Empty description="Không tìm thấy giao dịch nào" />
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
