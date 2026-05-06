import { Form, Input, DatePicker, Table, Button, Card, Tag } from 'antd';
import { FilterPanel, TableComponent, Pagination, StatusFilter } from '@repo/ui';
import { Download } from 'lucide-react';
import { useTransactionsPage } from './hooks/useTransactionsPage';

export const TransactionsStyle1 = () => {
    const {
        form, page, pageSize, setPage, setPageSize,
        isLoadingAccounts, isTransactionLoading,
        transactionData, transactionTypes,
        transactionTypeOptions, handleSearch, handleReset, handleExport,
        accountId
    } = useTransactionsPage();

    const isPageLoading = isLoadingAccounts || isTransactionLoading;

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

    return (
        <div className="min-h-screen">
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
                totalCount={transactionData?.total}
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
                    dataSource={transactionData?.data || []}
                    loading={isPageLoading}
                    pagination={false}
                    rowKey="id"
                    scroll={{ x: 'max-content' }}
                />
            </TableComponent>

            <Pagination
                current={page}
                pageSize={pageSize}
                total={transactionData?.total || 0}
                onChange={(p, s) => {
                    setPage(p);
                    if (s !== pageSize) setPageSize(s);
                }}
            />
        </div>
    );
};
