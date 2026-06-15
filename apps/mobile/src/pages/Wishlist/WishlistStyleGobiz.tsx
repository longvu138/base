import { useMemo, useState } from 'react';
import { DatePicker, Empty, Form, Tag, Popconfirm, message } from 'antd';
import { Input as AntInput, Button as AntButton } from 'antd';
import { Pagination } from '@repo/ui';
import { usePaginationWithURL, useFilterWithURL, useWishlistQuery, useDeleteWishlistItemMutation } from '@repo/hooks';
import {
    HeartFilled,
    ShoppingCartOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import MobileFilterPanel from '../../components/MobileFilterPanel';
import './WishlistStyleGobiz.css';

const { RangePicker } = DatePicker;

export const WishlistStyleGobiz = () => {
    const [form] = Form.useForm();

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 10, // Fewer items for mobile
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
            params.createdTo = params.dateRange[1]?.toISOString?.() ?? params.dateRange[1];
            delete params.dateRange;
        }
        return params;
    }, [page, pageSize, filters]);

    const { data, isLoading } = useWishlistQuery(apiParams);
    const deleteMutation = useDeleteWishlistItemMutation(apiParams);
    const [deletingId, setDeletingId] = useState<string | number | null>(null);

    const handleDelete = async (id: string | number) => {
        setDeletingId(id);
        try {
            await deleteMutation.mutateAsync(id);
            message.success('Đã xóa sản phẩm');
        } catch {
            message.error('Xóa thất bại');
        } finally {
            setDeletingId(null);
        }
    };

    const handleSearch = (values?: Record<string, any>) => {
        applyFilters(values ?? form.getFieldsValue());
    };
    const handleReset = () => {
        clearFilters();
    };

    const WishlistCard = ({ item }: { item: any }) => {
        const name = item.productName || item.name || item.title || '—';
        const price = item.price ?? item.salePrice;
        const image = item.image || item.imageUrl || item.thumbnail;
        const isDeleting = deletingId === item.id;

        return (
            <div className="wishlist-card bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all">
                {/* Image */}
                <div className="product-image relative w-full h-40 bg-gray-50 dark:bg-gray-900">
                    {image ? (
                        <img src={image} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCartOutlined className="text-4xl text-gray-200 dark:text-gray-700" />
                        </div>
                    )}
                    <div className="absolute top-2 right-2 wishlist-heart-icon scale-90">
                        <HeartFilled style={{ color: 'var(--tenant-primary-color)', fontSize: 12 }} />
                    </div>
                </div>

                {/* Info */}
                <div className="p-3 space-y-2">
                    <p className="text-xs font-black text-gray-800 dark:text-gray-100 line-clamp-2 leading-tight h-8">{name}</p>
                    <div className="flex items-center justify-between">
                        {price != null ? (
                            <span className="text-sm font-black tracking-tight text-primary">
                                {Number(price).toLocaleString('vi-VN')}đ
                            </span>
                        ) : <span />}
                        {item.status && (
                            <Tag color="blue" className="text-[9px] m-0 border-none px-2 rounded-full uppercase font-bold">{item.status}</Tag>
                        )}
                    </div>
                    
                    {/* Delete icon button for compact mobile view */}
                    <Popconfirm
                        title="Xóa khỏi yêu thích?"
                        okText="Xóa"
                        cancelText="Hủy"
                        onConfirm={() => handleDelete(item.id)}
                    >
                        <AntButton
                            danger
                            block
                            icon={<DeleteOutlined />}
                            size="small"
                            loading={isDeleting}
                            className="mt-1 rounded-xl font-bold text-xs border-red-50 bg-red-50/30 dark:bg-red-900/10"
                        >
                            {isDeleting ? '' : 'Xóa'}
                        </AntButton>
                    </Popconfirm>
                </div>
            </div>
        );
    };

    const SkeletonCard = () => (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
            <div className="w-full h-40 bg-gray-100 dark:bg-gray-700" />
            <div className="p-3 space-y-2">
                <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded" />
                <div className="w-1/2 h-4 bg-gray-100 dark:bg-gray-700 rounded" />
            </div>
        </div>
    );

    return (
        <div className="wishlist-style-gobiz-wrapper space-y-4">
            {/* Header Mobile */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="mb-4">
                    <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2 m-0">
                        <HeartFilled className="text-primary" />
                        Sản phẩm đã lưu
                    </h1>
                    <p className="text-gray-400 text-xs mt-1">
                        {data?.total ? `${data.total} sản phẩm` : 'Danh sách yêu thích'}
                    </p>
                </div>
                
            </div>

            <MobileFilterPanel
                form={form}
                onSearch={handleSearch}
                onReset={handleReset}
                primaryContent={
                    <Form.Item name="query" className="mb-0">
                        <AntInput
                            placeholder="Tìm kiếm..."
                            allowClear
                            className="h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700"
                        />
                    </Form.Item>
                }
                secondaryContent={
                    <Form.Item name="dateRange" label={<span className="text-xs font-bold uppercase text-gray-400">Ngày thêm</span>} className="mb-0">
                        <RangePicker className="w-full h-11 rounded-2xl" placeholder={['Từ', 'Đến']} format="DD/MM/YY" />
                    </Form.Item>
                }
            />

            {/* Product Grid - 2 columns on mobile */}
            <div className="grid grid-cols-2 gap-3">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                ) : !data?.data?.length ? (
                    <div className="col-span-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 py-16">
                        <Empty description="Chưa có sản phẩm nào" />
                    </div>
                ) : (
                    data.data.map((item: any) => <WishlistCard key={item.id} item={item} />)
                )}
            </div>

            {/* Pagination */}
            {(data?.total ?? 0) > pageSize && (
                <div className="flex justify-end pb-24">
                    <Pagination
                        current={page}
                        pageSize={pageSize}
                        total={data?.total || 0}
                        onChange={(p, s) => { setPage(p); if (s !== pageSize) setPageSize(s); }}
                        showSizeChanger={false}
                    />
                </div>
            )}
        </div>
    );
};
