import { useMemo } from 'react';
import { Form, Input, DatePicker, Table, Tag, Empty, Card } from 'antd';
import { FilterPanel, TableComponent, Pagination } from '@repo/ui';
import { useFilterWithURL, usePaginationWithURL, useDeliveryNotesQuery } from '@repo/hooks';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

/**
 * DeliveryNoteStyle1 — Giao diện cho Baogam (gd1)
 * Dùng FilterPanel + TableComponent chuẩn, filter theo mã phiếu xuất và thời gian.
 */
export const DeliveryNoteStyle1 = () => {
    const [form] = Form.useForm();

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 25,
    });

    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    const apiParams = useMemo(() => {
        const params: Record<string, any> = {
            page: page - 1,
            size: pageSize,
            sort: 'exported_at:desc',
            ...filters,
        };
        if (params.exportedAtRange) {
            params.exportedAtFrom = params.exportedAtRange[0]?.toISOString();
            params.exportedAtTo = params.exportedAtRange[1]?.toISOString();
            delete params.exportedAtRange;
        }
        return params;
    }, [page, pageSize, filters]);

    const { data: listData, isLoading } = useDeliveryNotesQuery(apiParams);

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
                    {t ? dayjs(t).format('DD/MM/YYYY HH:mm') : '—'}
                </span>
            ),
        },
    ];

    const handleSearch = () => applyFilters(form.getFieldsValue());

    return (
        <div className="min-h-screen bg-layout">
            <Card className="mb-6 shadow-sm">
                <FilterPanel
                    form={form}
                    onSearch={handleSearch}
                    onReset={clearFilters}
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
                loading={isLoading}
                showEmpty={!isLoading && listData?.data?.length === 0}
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
