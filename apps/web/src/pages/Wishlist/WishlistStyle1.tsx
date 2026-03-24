import { useMemo, useState } from 'react';
import { Form, Input, DatePicker, Table, Empty, Card, Button, Popconfirm, message, Tag } from 'antd';
import { FilterPanel, TableComponent, Pagination } from '@repo/ui';
import { usePaginationWithURL, useFilterWithURL, useWishlistQuery, useDeleteWishlistItemMutation } from '@repo/hooks';
import { DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export const WishlistStyle1 = () => {
    const [form] = Form.useForm();
    const [deletingId, setDeletingId] = useState<string | number | null>(null);

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 20,
    });

    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    const apiParams = useMemo(() => {
        const params: Record<string, any> = {
            page: page - 1,
            size: pageSize,
            sort: 'createdAt:desc',
            ...filters,
        };
        if (params.dateRange) {
            params.createdFrom = params.dateRange[0]?.toISOString?.() ?? params.dateRange[0];
            params.createdTo   = params.dateRange[1]?.toISOString?.() ?? params.dateRange[1];
            delete params.dateRange;
        }
        return params;
    }, [page, pageSize, filters]);

    const { data, isLoading } = useWishlistQuery(apiParams);
    const deleteMutation = useDeleteWishlistItemMutation(apiParams);

    const handleSearch = () => applyFilters(form.getFieldsValue());

    const handleDelete = async (id: string | number) => {
        setDeletingId(id);
        try {
            await deleteMutation.mutateAsync(id);
            message.success('Đã xóa sản phẩm khỏi danh sách yêu thích');
        } catch {
            message.error('Xóa thất bại, vui lòng thử lại');
        } finally {
            setDeletingId(null);
        }
    };

    const columns = [
        {
            title: 'Sản phẩm',
            key: 'product',
            render: (_: any, record: any) => {
                const name = record.productName || record.name || record.title || '—';
                const image = record.image || record.imageUrl || record.thumbnail;
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0 flex items-center justify-center">
                            {image ? (
                                <img src={image} alt={name} className="w-full h-full object-cover" />
                            ) : (
                                <ShoppingCartOutlined className="text-gray-400 text-lg" />
                            )}
                        </div>
                        <span className="font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 max-w-[280px]">
                            {name}
                        </span>
                    </div>
                );
            },
        },
        {
            title: 'Shop',
            key: 'shop',
            render: (_: any, record: any) => (
                <span className="text-gray-500">{record.shopName || record.merchantName || '—'}</span>
            ),
        },
        {
            title: 'Giá',
            key: 'price',
            render: (_: any, record: any) => {
                const price = record.price ?? record.salePrice;
                return price != null ? (
                    <span className="font-bold" style={{ color: 'var(--tenant-primary-color)' }}>
                        {Number(price).toLocaleString('vi-VN')} đ
                    </span>
                ) : <span className="text-gray-400">—</span>;
            },
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_: any, record: any) => (
                record.status
                    ? <Tag color="blue">{record.status}</Tag>
                    : <span className="text-gray-400">—</span>
            ),
        },
        {
            title: 'Ngày lưu',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (t: string) => (
                <span className="text-gray-500 text-sm">
                    {t ? dayjs(t).format('DD/MM/YYYY HH:mm') : '—'}
                </span>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 100,
            render: (_: any, record: any) => (
                <Popconfirm
                    title="Xóa khỏi yêu thích?"
                    description="Bạn có chắc muốn xóa sản phẩm này không?"
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => handleDelete(record.id)}
                >
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        loading={deletingId === record.id}
                        className="rounded-lg"
                    >
                        Xóa
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-layout">
            {/* Filter */}
            <Card className="mb-6 shadow-sm">
                <FilterPanel
                    form={form}
                    onSearch={handleSearch}
                    onReset={clearFilters}
                    searchText="Tìm kiếm"
                    resetText="Đặt lại"
                    primaryContent={
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                            <Form.Item name="query" label="Tên sản phẩm">
                                <Input placeholder="Nhập tên sản phẩm" className="h-10" allowClear onPressEnter={handleSearch} />
                            </Form.Item>
                            <Form.Item name="dateRange" label="Ngày thêm vào" className="md:col-span-2">
                                <RangePicker
                                    className="w-full h-10"
                                    placeholder={['Từ ngày', 'Đến ngày']}
                                />
                            </Form.Item>
                        </div>
                    }
                />
            </Card>

            {/* Table */}
            <TableComponent
                title="❤️ Danh sách sản phẩm đã lưu"
                totalCount={data?.total}
                loading={isLoading}
                showEmpty={!isLoading && data?.data?.length === 0}
                emptyText={<Empty description="Chưa có sản phẩm nào được lưu" />}
            >
                <Table
                    columns={columns}
                    dataSource={data?.data || []}
                    pagination={false}
                    rowKey="id"
                    size="middle"
                    locale={{
                        emptyText: (
                            <div className="py-12">
                                <Empty description="Chưa có sản phẩm nào được lưu" />
                            </div>
                        ),
                    }}
                />
            </TableComponent>

            {/* Pagination */}
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
