import { useMemo, useState } from 'react';
import { DatePicker, Empty, Form, Tag, Popconfirm, message } from 'antd';
import { Input as AntInput, Button as AntButton } from 'antd';
import { Pagination } from '@repo/ui';
import { usePaginationWithURL, useFilterWithURL, useWishlistQuery, useDeleteWishlistItemMutation } from '@repo/hooks';
import {
    SearchOutlined,
    RedoOutlined,
    FilterOutlined,
    HeartFilled,
    ShoppingCartOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import './WishlistStyle3.css';

const { RangePicker } = DatePicker;

export const WishlistStyle3 = () => {
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [showFilters, setShowFilters] = useState(false);

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
        if (searchText) params.query = searchText;
        if (params.dateRange) {
            params.createdFrom = params.dateRange[0]?.toISOString?.() ?? params.dateRange[0];
            params.createdTo = params.dateRange[1]?.toISOString?.() ?? params.dateRange[1];
            delete params.dateRange;
        }
        return params;
    }, [page, pageSize, filters, searchText]);

    const { data, isLoading } = useWishlistQuery(apiParams);
    const deleteMutation = useDeleteWishlistItemMutation(apiParams);
    const [deletingId, setDeletingId] = useState<string | number | null>(null);

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

    const handleSearch = () => {
        applyFilters({ ...form.getFieldsValue(), query: searchText });
    };
    const handleReset = () => {
        setSearchText('');
        clearFilters();
    };

    const WishlistCard = ({ item }: { item: any }) => {
        const name = item.productName || item.name || item.title || '—';
        const price = item.price ?? item.salePrice;
        const image = item.image || item.imageUrl || item.thumbnail;
        const shop = item.shopName || item.merchantName;
        const isDeleting = deletingId === item.id;

        return (
            <div className="wishlist-card bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:border-primary/30 hover:shadow-lg dark:hover:border-primary/30">
                {/* Image */}
                <div className="product-image relative w-full h-48 bg-gray-50 dark:bg-gray-900">
                    {image ? (
                        <img src={image} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCartOutlined className="text-5xl text-gray-200 dark:text-gray-700" />
                        </div>
                    )}
                    <div className="absolute top-3 right-3 wishlist-heart-icon">
                        <HeartFilled style={{ color: 'var(--tenant-primary-color)', fontSize: 14 }} />
                    </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-2">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 line-clamp-2 leading-snug">{name}</p>
                    {shop && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{shop}</p>
                    )}
                    <div className="flex items-center justify-between">
                        {price != null ? (
                            <span className="text-base font-extrabold tracking-tight" style={{ color: 'var(--tenant-primary-color)' }}>
                                {Number(price).toLocaleString('vi-VN')} đ
                            </span>
                        ) : <span />}
                        {item.status && (
                            <Tag color="blue" className="text-xs m-0">{item.status}</Tag>
                        )}
                    </div>
                    {/* Delete button */}
                    <Popconfirm
                        title="Xóa khỏi yêu thích?"
                        description="Bạn có chắc muốn xóa sản phẩm này không?"
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleDelete(item.id)}
                    >
                        <AntButton
                            danger
                            block
                            icon={<DeleteOutlined />}
                            size="small"
                            loading={isDeleting}
                            className="mt-1 rounded-xl font-semibold border-red-200 hover:border-red-400 transition-all"
                        >
                            {isDeleting ? 'Đang xóa...' : 'Xóa khỏi yêu thích'}
                        </AntButton>
                    </Popconfirm>
                </div>
            </div>
        );
    };

    const SkeletonCard = () => (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
            <div className="w-full h-48 bg-gray-200 dark:bg-gray-700" />
            <div className="p-4 space-y-2.5">
                <div className="w-full h-3.5 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="w-3/4 h-3 bg-gray-100 dark:bg-gray-800 rounded" />
                <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
        </div>
    );

    return (
        <div className="wishlist-style3-wrapper space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                        <HeartFilled style={{ color: 'var(--tenant-primary-color)' }} />
                        Sản phẩm đã lưu
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {data?.total ? `${data.total} sản phẩm trong danh sách yêu thích` : 'Danh sách sản phẩm yêu thích của bạn'}
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <AntInput
                        placeholder="Tìm theo tên sản phẩm..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onPressEnter={handleSearch}
                        className="w-full md:w-64 h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700"
                    />
                    <AntButton type="primary" icon={<SearchOutlined />} onClick={handleSearch}
                        className="h-11 px-6 rounded-2xl font-bold shadow-lg shadow-primary/20">
                        Tìm
                    </AntButton>
                    <AntButton icon={<FilterOutlined />} onClick={() => setShowFilters(!showFilters)}
                        className={`h-11 px-5 rounded-2xl font-bold transition-all ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700'}`}>
                        Lọc
                    </AntButton>
                    <AntButton icon={<RedoOutlined />} onClick={handleReset}
                        className="h-11 px-4 rounded-2xl font-bold border-gray-200 dark:border-gray-700 hover:text-primary transition-all bg-gray-50 dark:bg-gray-900">
                        Xoá lọc
                    </AntButton>
                </div>
            </div>

            {/* Advanced Filters */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <Form form={form} layout="vertical" onValuesChange={() => applyFilters(form.getFieldsValue())}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item name="dateRange" label="Ngày thêm vào" className="mb-0">
                                <RangePicker className="w-full h-11 rounded-2xl" placeholder={['Từ ngày', 'Đến ngày']} />
                            </Form.Item>
                        </div>
                    </Form>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                ) : !data?.data?.length ? (
                    <div className="col-span-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 py-20">
                        <Empty description="Chưa có sản phẩm nào được lưu" />
                    </div>
                ) : (
                    data.data.map((item: any) => <WishlistCard key={item.id} item={item} />)
                )}
            </div>

            {/* Pagination */}
            {(data?.total ?? 0) > pageSize && (
                <div className="flex justify-center pt-2">
                    <Pagination
                        current={page}
                        pageSize={pageSize}
                        total={data?.total || 0}
                        onChange={(p, s) => { setPage(p); if (s !== pageSize) setPageSize(s); }}
                    />
                </div>
            )}
        </div>
    );
};
