import { Form, Input, DatePicker, Table, Tag, Empty, Card } from 'antd';
import { FilterPanel, TableComponent, Pagination } from '@repo/ui';
import dayjs from 'dayjs';
import { useDeliveryNotesPage } from './hooks/useDeliveryNotesPage';

const { RangePicker } = DatePicker;

/**
 * DeliveryNoteStyle1 — Giao diện cho Baogam (gd1)
 * Dùng FilterPanel + TableComponent chuẩn, filter theo mã phiếu xuất và thời gian.
 */
export const DeliveryNoteStyle1 = () => {
    const {
        form, page, pageSize, setPage, setPageSize,
        listData, isDeliveryNotesLoading, handleSearch, handleReset
    } = useDeliveryNotesPage();

    const columns = [
        {
            title: 'Mã phiếu xuất',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <span className="font-bold text-primary">{text}</span>,
        },
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderCode',
            key: 'orderCode',
            render: (text: string) => <span className="text-gray-700">{text || '—'}</span>,
        },
        {
            title: 'Tổng kiện',
            dataIndex: 'totalPackages',
            key: 'totalPackages',
            render: (v: number) => <span className="font-semibold">{v ?? '—'}</span>,
        },
        {
            title: 'Trọng lượng (kg)',
            dataIndex: 'totalWeight',
            key: 'totalWeight',
            render: (v: number) => <span className="text-gray-600">{v ?? '—'}</span>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => <Tag>{status || '—'}</Tag>,
        },
        {
            title: 'Ngày xuất',
            dataIndex: 'exportedAt',
            key: 'exportedAt',
            render: (t: string) => (
                <span className="text-gray-500 text-sm">
                    {t ? dayjs(t).format('HH:mm DD/MM/YYYY') : '—'}
                </span>
            ),
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 mt-4 border-t border-border">
                                <Form.Item name="code" label="Mã phiếu xuất">
                                    <Input placeholder="Nhập mã phiếu xuất" className="h-10" />
                                </Form.Item>
                                <Form.Item name="exportedAtRange" label="Thời gian xuất">
                                    <RangePicker
                                        className="w-full h-10"
                                        showTime
                                        format="DD/MM/YYYY HH:mm"
                                        placeholder={['Từ ngày', 'Đến ngày']}
                                    />
                                </Form.Item>
                            </div>
                        </>
                    }
                />
            </Card>

            <TableComponent
                title="Danh sách phiếu xuất"
                totalCount={listData?.total}
                loading={isDeliveryNotesLoading}
                showEmpty={!isDeliveryNotesLoading && listData?.data?.length === 0}
                emptyText={<Empty description="Không tìm thấy phiếu xuất nào" />}
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
                                <Empty description="Không tìm thấy phiếu xuất nào" />
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
