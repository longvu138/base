import { Input, Button, Card, Empty, Tag, Popconfirm } from 'antd';
import { SearchOutlined, DeleteOutlined, ShoppingCartOutlined, HeartFilled } from '@ant-design/icons';
import { DynamicVariant } from '@repo/ui';
import { useVariant } from '@repo/theme-provider';
import { useWishlistMobile } from './hooks/useWishlistMobile';

// Stable reference
const modules = import.meta.glob('./*.tsx');

export const WishlistPage = () => {
    const variant = useVariant('wishlist');
    const {
        wishlistData,
        isWishlistLoading,
        deletingId,
        handleDelete,
        updateQuery,
    } = useWishlistMobile();

    if (variant === 'WishlistStyle3') {
        return (
            <DynamicVariant
                variantName={variant}
                modules={modules}
                fallbackName="WishlistStyle1"
                featureName="Wishlist"
            />
        );
    }

    return (
        <div className="pb-20">
            {/* Vùng Header */}
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 m-0">
                        <HeartFilled className="text-red-500" />
                        Yêu thích
                    </h1>
                    <p className="text-gray-500 text-sm m-0">
                        {wishlistData?.total || 0} sản phẩm trong danh sách
                    </p>
                </div>
                
                <span className="text-[10px] text-gray-400 italic">
                    Variant: <strong className="text-primary">{variant}</strong>
                </span>
            </div>

            {/* Thanh tìm kiếm Mobile */}

            <div className="mb-6 sticky top-0 z-10 bg-layout/80 backdrop-blur-md py-2">
                <Input
                    placeholder="Tìm sản phẩm..."
                    prefix={<SearchOutlined className="text-gray-400" />}
                    className="h-12 rounded-2xl border-none shadow-sm dark:bg-gray-800"
                    onChange={(e) => updateQuery(e.target.value)}
                    allowClear
                />
            </div>


            {/* Danh sách */}
            <div className="grid grid-cols-1 gap-4">
                {isWishlistLoading ? (
                    // Skeleton khi đang tải
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl p-4 animate-pulse h-32" />
                    ))
                ) : wishlistData?.data?.length === 0 ? (
                    <Card className="rounded-3xl border-none shadow-sm py-10">
                        <Empty description="Chưa có sản phẩm yêu thích nào" />
                    </Card>
                ) : (
                    wishlistData?.data?.map((item: any) => (
                        <div
                            key={item.id}
                            className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm flex gap-4 relative group"
                        >
                            {/* Hình ảnh sản phẩm */}
                            <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0 flex items-center justify-center">
                                {item.image ? (
                                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                                ) : (
                                    <ShoppingCartOutlined className="text-gray-300 text-2xl" />
                                )}
                            </div>

                            {/* Chi tiết sản phẩm */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 leading-tight">
                                        {item.productName || item.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-400 font-medium">Shop: {item.shopName || 'N/A'}</span>
                                        {item.status && <Tag color="blue" className="text-[10px] m-0 border-none rounded-full px-2">{item.status}</Tag>}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-primary font-black text-base">
                                        {Number(item.price || 0).toLocaleString('vi-VN')} đ
                                    </span>

                                    <Popconfirm
                                        title="Xóa?"
                                        onConfirm={() => handleDelete(item.id)}
                                        okText="Xóa"
                                        cancelText="Hủy"
                                        okButtonProps={{ danger: true, size: 'small' }}
                                        cancelButtonProps={{ size: 'small' }}
                                    >
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            loading={deletingId === item.id}
                                            className="rounded-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100"
                                        />
                                    </Popconfirm>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Load More Button (Demo) */}
            {!isWishlistLoading && (wishlistData?.total || 0) > (wishlistData?.data?.length || 0) && (
                <div className="mt-8 flex justify-center">
                    <Button type="link" className="font-bold text-primary">Xem thêm sản phẩm</Button>
                </div>
            )}
        </div>
    );
};
