import { useMemo } from 'react';
import { Form, Input, DatePicker, Table, Tag, Empty, Card } from 'antd';
import { FilterPanel, TableComponent, StatusFilter, Pagination } from '@repo/ui';
import { useFilterWithURL, usePaginationWithURL, useWaybillsQuery, useWaybillStatusesQuery } from '@repo/hooks';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

/**
 * WaybillsStyle1 — Giao diện cho Baogam (gd1)
 * Dùng FilterPanel + TableComponent chuẩn, phong cách quản lý truyền thống.
 * Filter theo mã vận đơn (query) và thời gian nhận (receivedTimeFrom/To).
 */
export const WaybillsStyle1 = () => {
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
            sort: 'createdAt:desc',
            ...filters,
        };
        if (params.receivedTimeRange) {
            params.receivedTimeFrom = params.receivedTimeRange[0]?.toISOString();
            params.receivedTimeTo = params.receivedTimeRange[1]?.toISOString();
            delete params.receivedTimeRange;
        }
        if (Array.isArray(params.statuses)) {
            params.statuses = params.statuses.join(',');
        }
        return params;
    }, [page, pageSize, filters]);

    const { data: listData, isLoading } = useWaybillsQuery(apiParams);
    const { data: statusData } = useWaybillStatusesQuery();

    const statusOptions = useMemo(() => {
        if (!statusData) return [];
        return statusData.map((s) => ({ label: s.name, value: s.code }));
    }, [statusData]);

    const getStatusColor = (code: string) => {
        const found = statusData?.find(s => s.code === code);
        return found?.color || 'default';
    };

    const columns = [
        {
            title: 'Mã vận đơn',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <span className="font-bold text-primary">{text || '—'}</span>,
        },
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderCode',
            key: 'orderCode',
            render: (text: string) => <span className="text-gray-700">{text || '—'}</span>,
        },
        {
            title: 'Đối tác vận chuyển',
            dataIndex: 'carrierName',
            key: 'carrierName',
            render: (text: string) => <span className="text-gray-600">{text || '—'}</span>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {statusData?.find(s => s.code === status)?.name || status || '—'}
                </Tag>
            ),
        },
        {
            title: 'Thời gian nhận',
            dataIndex: 'receivedTime',
            key: 'receivedTime',
            render: (t: string) => (
                <span className="text-gray-500 text-sm">
                    {t ? dayjs(t).format('DD/MM/YYYY HH:mm') : '—'}
                </span>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
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
                            <Form.Item name="statuses" noStyle>
                                <StatusFilter options={statusOptions} label="Trạng thái:" />
                            </Form.Item>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 mt-6 border-t border-border">
                                <Form.Item name="query" label="Mã vận đơn">
                                    <Input placeholder="Nhập mã vận đơn" className="h-10" />
                                </Form.Item>
                                <Form.Item name="receivedTimeRange" label="Thời gian nhận" className="md:col-span-2">
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
                title="Danh sách mã vận đơn"
                totalCount={listData?.total}
                loading={isLoading}
                showEmpty={!isLoading && listData?.data?.length === 0}
                emptyText={<Empty description="Không tìm thấy mã vận đơn nào" />}
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
                                <Empty description="Không tìm thấy mã vận đơn nào" />
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
