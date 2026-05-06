import { useState } from 'react';
import { Form, message } from 'antd';
import { 
    useFilterWithURL, 
    usePaginationWithURL,
    useWishlistLogic 
} from '@repo/hooks';

/**
 * Web-specific orchestration for Wishlist Page
 */
export const useWishlistPage = () => {
    const [form] = Form.useForm();
    const [deletingId, setDeletingId] = useState<string | number | null>(null);

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 20,
    });

    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    const logic = useWishlistLogic({ page, pageSize, filters });

    const handleSearch = () => {
        applyFilters(form.getFieldsValue());
    };

    const handleReset = () => {
        clearFilters();
    };

    const handleDelete = async (id: string | number) => {
        setDeletingId(id);
        try {
            await logic.deleteWishlistItemMutation.mutateAsync(id);
            message.success('Đã xóa sản phẩm khỏi danh sách yêu thích');
        } catch {
            message.error('Xóa thất bại, vui lòng thử lại');
        } finally {
            setDeletingId(null);
        }
    };

    return {
        form,
        page,
        pageSize,
        setPage,
        setPageSize,
        deletingId,
        ...logic,
        handleSearch,
        handleReset,
        handleDelete
    };
};
