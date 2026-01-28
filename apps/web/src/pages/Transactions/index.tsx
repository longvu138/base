import { useMemo } from 'react';
import { Form, Input, DatePicker, Table, Button, Card, Tag } from 'antd';
import { FilterPanel, TableComponent, Pagination, StatusFilter } from '@repo/ui';
import { useFilterWithURL, usePaginationWithURL, useListTransactionQuery, useTransactionTypesQuery, useWalletAccountsQuery } from '@repo/hooks';
import { Download } from 'lucide-react';
import { TransactionApi } from '@repo/api';


export const Transactions = () => {

    const [form] = Form.useForm();

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 20
    });
    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    const { data: walletAccounts, isLoading: isLoadingAccounts } = useWalletAccountsQuery();
    const defaultAccount = walletAccounts?.find((acc: any) => acc.isDefault) || walletAccounts?.[0];
    const accountId = defaultAccount?.account;

    const currentFilters = useMemo(() => {
        const params: any = {
            page: page - 1,  // Convert from 1-indexed (UI) to 0-indexed (API)
            size: pageSize,
            ...filters
        };

        // Transform array to comma-separated string
        if (Array.isArray(params.externalTypes)) {
            params.externalTypes = params.externalTypes.join(',');
        }

        // Transform dates to ISO strings
        if (params.nominalTimestampFrom) {
            params.nominalTimestampFrom = params.nominalTimestampFrom.startOf('day').toISOString();
        }
        if (params.nominalTimestampTo) {
            params.nominalTimestampTo = params.nominalTimestampTo.endOf('day').toISOString();
        }

        return params;
    }, [filters, page, pageSize]);

    const { data, isLoading } = useListTransactionQuery(accountId, currentFilters);
    const { data: transactionTypes } = useTransactionTypesQuery();

    const handleSearch = () => {
        const values = form.getFieldsValue();
        applyFilters(values);
    };

    const handleReset = () => {
        clearFilters();
    };

    const handleExport = async () => {
        if (!accountId) return;
        try {
            const response = await TransactionApi.exportTransactions(accountId, currentFilters);
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

    const isPageLoading = isLoadingAccounts || isLoading;

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
            title: 'Thời gian',
            dataIndex: 'actualTimestamp',
            key: 'actualTimestamp',
            width: 180,
            render: (value: string, record: any) => {
                const date = value ? new Date(value) : null;
                const formattedTime = date
                    ? `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
                    : '-';

                return (
                    <div className='flex flex-col gap-1'>
                        <div className="font-medium">{formattedTime}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-0.5">
                            <span>  STK:</span> <span>{record?.account || '-'}</span>
                        </div>
                        {record?.txid && (
                            <div className="text-xs text-gray-400 flex items-center gap-0.5">
                                <span>Mã:</span> <span>{record.txid}</span>
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: 'Loại giao dịch',
            dataIndex: 'externalType',
            key: 'externalType',
            width: 150,
            render: (value: string, record: any) => {
                const typeCode = value || record?.type;
                if (!typeCode) {
                    return <Tag color="default">-</Tag>;
                }

                // Map với financial_types từ API theo code
                const type = transactionTypes?.find((t: any) =>
                    t.code?.toLowerCase() === typeCode?.toLowerCase()
                );

                return (
                    <Tag color={getTransactionTypeColor(record?.type || typeCode)}>
                        {type?.name || typeCode || '-'}
                    </Tag>
                );
            },
        },
        {
            title: 'Nội dung',
            dataIndex: 'memo',
            key: 'memo',
            render: (value: string, record: any) => (
                <div className="max-w-md">
                    {value || record?.description || '-'}
                </div>
            ),
        },
        {
            title: 'Giá trị',
            dataIndex: 'amount',
            key: 'amount',
            width: 150,
            align: 'right' as const,
            render: (value: number) => {
                if (value === null || value === undefined) {
                    return <span className="font-semibold text-gray-400">0đ</span>;
                }
                const isPositive = value >= 0;
                return (
                    <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive && '+'}{value.toLocaleString()}đ
                    </span>
                );
            },
        },
        {
            title: 'Số dư',
            dataIndex: 'balanceAfter',
            key: 'balanceAfter',
            width: 150,
            align: 'right' as const,
            render: (value: number) => (
                <span className="font-semibold">
                    {value?.toLocaleString() || '0'}đ
                </span>
            ),
        },
    ];

    const transactionTypeOptions = useMemo(() => {
        if (!transactionTypes) return [];
        return transactionTypes.map((type: any) => ({
            label: type.name,
            value: type.code,
        }));
    }, [transactionTypes]);

    return (
        <div className="min-h-screen bg-layout">
            <Card className="mb-6 shadow-sm">
                <FilterPanel
                    form={form}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    searchText="Tìm kiếm"
                    resetText="Làm mới bộ lọc"
                    showCollapseAll={false}
                    primaryContent={
                        <div className="space-y-4">
                            <Form.Item name="externalTypes" noStyle>
                                <StatusFilter
                                    options={transactionTypeOptions}
                                    label="Loại giao dịch:"
                                />
                            </Form.Item>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Form.Item
                                    label="Nhập mã đơn, mã giao dịch:"
                                    name="query"
                                    className="mb-0"
                                >
                                    <Input placeholder="Nhập mã đơn hoặc mã giao dịch" />
                                </Form.Item>

                                <Form.Item
                                    label="Từ ngày:"
                                    name="nominalTimestampFrom"
                                    className="mb-0"
                                >
                                    <DatePicker
                                        className="w-full"
                                        placeholder="Chọn ngày bắt đầu"
                                        format="DD/MM/YYYY"
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Đến ngày:"
                                    name="nominalTimestampTo"
                                    className="mb-0"
                                >
                                    <DatePicker
                                        className="w-full"
                                        placeholder="Chọn ngày kết thúc"
                                        format="DD/MM/YYYY"
                                    />
                                </Form.Item>
                            </div>
                        </div>
                    }
                />
            </Card>

            <TableComponent
                title="Danh Sách Lịch Sử Giao Dịch"
                totalCount={data?.total}
                loading={isPageLoading}
                extra={
                    <Button
                        icon={<Download size={16} />}
                        onClick={handleExport}
                        disabled={!accountId}
                    >
                        Xuất Excel
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={data?.data || []}
                    loading={isPageLoading}
                    pagination={false}
                    rowKey="id"
                    scroll={{ x: 'max-content' }}
                />
            </TableComponent>

            <Pagination
                current={page}
                pageSize={pageSize}
                total={data?.total || 0}
                onChange={(p, s) => {
                    setPage(p);
                    if (s !== pageSize) setPageSize(s);
                }}
            />
        </div>
    );
};
