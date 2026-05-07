import dayjs from 'dayjs';
import { Form, Input, DatePicker, Table, Tag, Select, Card } from 'antd';
import { FilterPanel, TableComponent, StatusFilter, Pagination } from '@repo/ui';
import { useWithdrawalSlipsPage } from './hooks/useWithdrawalSlipsPage';

const { RangePicker } = DatePicker;

/**
 * WithdrawalSlipStyle1 — Traditional layout (Baogam/gd1)
 */
export const WithdrawalSlipStyle1 = () => {
    const {
        form, page, pageSize, setPage, setPageSize,
        listData, isWithdrawalSlipsLoading, statusData, banksData,
        statusOptions, bankOptions, handleSearch, handleReset
    } = useWithdrawalSlipsPage();

    const columns = [
        {
            title: 'Mã yêu cầu',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <span className="font-bold text-primary">{text || '—'}</span>,
        },
        {
            title: 'Tài khoản thụ hưởng',
            dataIndex: 'beneficiaryAccount',
            key: 'beneficiaryAccount',
        },
        {
            title: 'Ngân hàng',
            dataIndex: 'beneficiaryBank',
            key: 'beneficiaryBank',
            render: (val: any) => {
                const bankCode = typeof val === 'object' ? val?.code : val;
                const bank = banksData?.find((b: any) => b.code === bankCode);
                return bank ? bank.name : (typeof val === 'object' ? val?.name : val) || '—';
            }
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (val: number) => val?.toLocaleString('vi-VN') + ' ₫',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (val: any) => {
                const statusCode = typeof val === 'object' ? val?.code : val;
                const found = statusData?.find((s: any) => s.code === statusCode);
                const name = found?.name || (typeof val === 'object' ? val?.name : val);
                return <Tag color={found?.color || 'blue'}>{name || val}</Tag>;
            },
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text: string) => <span className="text-gray-500 text-sm">{text ? dayjs(text).format('HH:mm DD/MM/YYYY') : '-'}</span>,
        },
    ];

    return (
        <div className="min-h-screen bg-layout p-4 space-y-4">
            <Card className="mb-4 shadow-sm">
                <FilterPanel
                    form={form}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    primaryContent={
                        <>
                            <Form.Item name="statuses" noStyle>
                                <StatusFilter options={statusOptions} label="Trạng thái:" />
                            </Form.Item>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 mt-6 border-t border-border">
                                <Form.Item name="query" label="Mã yêu cầu/Số tài khoản">
                                    <Input placeholder="Nhập mã hoặc số tài khoản" className="h-10" />
                                </Form.Item>
                                <Form.Item name="beneficiaryBank" label="Ngân hàng">
                                    <Select placeholder="Chọn ngân hàng" options={bankOptions} allowClear showSearch className="h-10 w-full" />
                                </Form.Item>
                                <Form.Item name="createdAtRange" label="Thời gian">
                                    <RangePicker className="w-full h-10" />
                                </Form.Item>
                            </div>
                        </>
                    }
                />
            </Card>

            <TableComponent
                title="Yêu cầu rút tiền"
                totalCount={listData?.total}
                loading={isWithdrawalSlipsLoading}
            >
                <Table
                    columns={columns}
                    dataSource={listData?.data || []}
                    pagination={false}
                    rowKey="id"
                    size="middle"
                />
            </TableComponent>

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
    );
};
