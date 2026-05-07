import dayjs from 'dayjs';
import { Form, Input, DatePicker, Table, Tag, Empty, Card } from 'antd';
import { FilterPanel, TableComponent, StatusFilter, Pagination } from '@repo/ui';
import { useDeliveryRequestsPage } from './hooks/useDeliveryRequestsPage';

const { RangePicker } = DatePicker;

/**
 * DeliveryRequestsStyle1 — Giao diện cho Baogam (gd1)
 */
export const DeliveryRequestsStyle1 = () => {
    const {
        form, page, pageSize, setPage, setPageSize,
        listData, isDeliveryRequestsLoading, statusData, statusOptions,
        handleSearch, handleReset
    } = useDeliveryRequestsPage();

    const getStatusColor = (code: string) => {
        const found = statusData?.find(s => s.code === code);
        return found?.color || 'default';
    };

    const columns = [
        {
            title: 'Mã yêu cầu',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <span className="font-bold text-primary">{text}</span>,
        },
        {
            title: 'Người nhận',
            dataIndex: 'receiverName',
            key: 'receiverName',
        },
        {
            title: 'SĐT người nhận',
            dataIndex: 'receiverPhone',
            key: 'receiverPhone',
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'receiverAddress',
            key: 'receiverAddress',
            render: (text: string) => <span className="text-gray-600 text-sm">{text || '—'}</span>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {statusData?.find(s => s.code === status)?.name || status}
                </Tag>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text: string) => <span className="text-gray-500 text-sm">{text ? dayjs(text).format('HH:mm DD/MM/YYYY') : '-'}</span>,
        },
    ];

    return (
        <div className="min-h-screen bg-layout">
            <Card className="mb-6 shadow-sm">
                <FilterPanel
                    form={form}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    searchText="Tìm kiếm"
                    resetText="Đặt lại"
                    primaryContent={
                        <>
                            <Form.Item name="statuses" noStyle>
                                <StatusFilter options={statusOptions} label="Trạng thái:" />
                            </Form.Item>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 mt-6 border-t border-border">
                                <Form.Item name="code" label="Mã yêu cầu">
                                    <Input placeholder="Nhập mã yêu cầu" className="h-10" />
                                </Form.Item>
                                <Form.Item name="receiverName" label="Người nhận">
                                    <Input placeholder="Tên người nhận" className="h-10" />
                                </Form.Item>
                                <Form.Item name="dateRange" label="Ngày tạo">
                                    <RangePicker className="w-full h-10" />
                                </Form.Item>
                            </div>
                        </>
                    }
                />
            </Card>

            <TableComponent
                title="Yêu cầu giao hàng"
                totalCount={listData?.total}
                loading={isDeliveryRequestsLoading}
                showEmpty={!isDeliveryRequestsLoading && listData?.data?.length === 0}
                emptyText={<Empty description="Không tìm thấy yêu cầu giao nào" />}
            >
                <Table
                    columns={columns}
                    dataSource={listData?.data || []}
                    pagination={false}
                    rowKey="id"
                    size="middle"
                    locale={{
                        emptyText: (
                            <div className="py-12">
                                <Empty description="Không tìm thấy yêu cầu giao nào" />
                            </div>
                        ),
                    }}
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
