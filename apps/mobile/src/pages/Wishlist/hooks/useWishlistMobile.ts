import { useState } from 'react';
import { useWishlistLogic } from '@repo/hooks';

/**
 * Connector cho trang Wishlist bản Mobile
 * Xử lý state đặc thù của mobile (không dùng URL sync, không dùng AntD form)
 */
export const useWishlistMobile = () => {
    // 1. Mobile State (Dùng local state thay vì URL)
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [deletingId, setDeletingId] = useState<string | number | null>(null);
    const [filters, setFilters] = useState<Record<string, any>>({});

    // 2. Tái sử dụng Business Logic Core (100% giống bản Web)
    const logic = useWishlistLogic({ page, pageSize, filters });

    // 3. Các hàm xử lý riêng cho mobile
    const handleRefresh = () => {
        setPage(1);
        // logic.wishlistData sẽ tự động tải lại nhờ react-query
    };

    const handleLoadMore = () => {
        const total = logic.wishlistData?.total || 0;
        if (total > page * pageSize) {
            setPage(prev => prev + 1);
        }
    };

    const updateQuery = (text: string) => {
        setFilters(prev => ({ ...prev, query: text }));
        setPage(1);
    };

    const handleDelete = async (id: string | number) => {
        try {
            setDeletingId(id);
            await logic.deleteWishlistItemMutation.mutateAsync(id);
            // Show mobile alert/toast here
        } catch (error) {
            // Show error toast
        } finally {
            setDeletingId(null);
        }
    };

    return {
        page,
        setPage,
        ...logic,
        deletingId,
        handleRefresh,
        handleLoadMore,
        updateQuery,
        handleDelete
    };
};

