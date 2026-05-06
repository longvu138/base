import { useState } from 'react';
import { Form, message } from 'antd';
import { useAddressLogic } from '@repo/hooks';

/**
 * Web-specific orchestration for Address Page
 */
export const useAddressPage = () => {
    const [form] = Form.useForm();
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any>(null);

    const logic = useAddressLogic({ keyword });

    const handleSearch = () => {
        const vals = form.getFieldsValue();
        setKeyword(vals.keyword ?? '');
        setPage(1);
    };

    const handleReset = () => {
        form.resetFields();
        setKeyword('');
        setPage(1);
    };

    const handleAdd = () => {
        setEditingAddress(null);
        setModalOpen(true);
    };

    const handleEdit = (item: any) => {
        setEditingAddress(item);
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await logic.deleteAddressMutation.mutateAsync(id);
            message.success('Xóa địa chỉ thành công');
        } catch (error) {
            message.error('Có lỗi xảy ra khi xóa');
        }
    };

    return {
        form,
        page,
        setPage,
        keyword,
        modalOpen,
        setModalOpen,
        editingAddress,
        ...logic,
        handleSearch,
        handleReset,
        handleAdd,
        handleEdit,
        handleDelete
    };
};
