import dayjs from 'dayjs';
import { Form, Input, Table, Tag, Empty, Card } from 'antd';
import { FilterPanel, TableComponent, StatusFilter, Pagination } from '@repo/ui';
import { useClaimsPage } from './hooks/useClaimsPage';

/**
 * ClaimsStyle1 — Giao diện cho Baogam (gd1)
 * Phong cách quản lý truyền thống với bộ lọc rõ ràng.
 */
export const ClaimsStyle1 = () => {
    const {
        form, page, pageSize, setPage, setPageSize,
        listData, isClaimsLoading, statusData, solutionData,
        statusOptions, solutionOptions, handleSearch, handleReset
    } = useClaimsPage();

    const getStatusColor = (code: string) => {
        const found = statusData?.find(s => s.code === code);
        return found?.color || 'default';
    };

    const columns = [
        {
            title: 'Mã khiếu nại',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <span className="font-bold text-primary">{text}</span>,
        },
        {
            title: 'Mã đơn',
            dataIndex: 'relatedOrder',
            key: 'relatedOrder',
            render: (text: string) => text || '—',
        },
        {
            title: 'Loại',
            dataIndex: 'ticketType',
            key: 'ticketType',
            render: (text: string) => (
                <Tag color={text === 'order' ? 'blue' : 'cyan'}>
                    {text === 'order' ? 'Đơn hàng' : 'Vận chuyển'}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'publicState',
            key: 'publicState',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {statusData?.find(s => s.code === status)?.name || status}
                </Tag>
            ),
        },
        {
            title: 'Phương án xử lý',
            dataIndex: 'solutionCode',
            key: 'solutionCode',
            render: (code: string) => solutionData?.find(s => s.code === code)?.name || code || '—',
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
            <Card className="mb-4 shadow-sm">
                <FilterPanel
                    form={form}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    searchText="Tìm kiếm"
                    resetText="Đặt lại"
                    primaryContent={
                        <>
                            <Form.Item name="publicStates" noStyle>
                                <StatusFilter options={statusOptions} label="Trạng thái:" />
                            </Form.Item>
                            <Form.Item name="solutionCodes" noStyle>
                                <StatusFilter options={solutionOptions} label="Phương án:" />
                            </Form.Item>
                            <Form.Item name="ticketTypes" noStyle>
                                <StatusFilter
                                    options={[
                                        { label: 'Đơn hàng', value: 'order' },
                                        { label: 'Vận chuyển', value: 'shipment' }
                                    ]}
                                    label="Loại đơn:"
                                />
                            </Form.Item>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 mt-6 border-t border-border">
                                <Form.Item name="code" label="Mã khiếu nại">
                                    <Input placeholder="Nhập mã khiếu nại" className="h-10" />
                                </Form.Item>
                                <Form.Item name="relatedOrder" label="Mã đơn hàng">
                                    <Input placeholder="Nhập mã đơn hàng" className="h-10" />
                                </Form.Item>
                                <Form.Item name="relatedProduct" label="Mã sản phẩm">
                                    <Input placeholder="Nhập mã sản phẩm" className="h-10" />
                                </Form.Item>
                            </div>
                        </>
                    }
                />
            </Card>

            <TableComponent
                title="Quản lý Khiếu nại"
                totalCount={listData?.total}
                loading={isClaimsLoading}
                showEmpty={!isClaimsLoading && listData?.data?.length === 0}
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
                                <Empty description="Không tìm thấy khiếu nại nào" />
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
