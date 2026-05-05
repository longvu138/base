import { useMemo, useState } from 'react';
import { Form, Input, Empty, Tag } from 'antd';
import { FilterPanel, Pagination } from '@repo/ui';
import { useAddressesQuery, useDeleteAddressMutation } from '@repo/hooks';
import { EnvironmentOutlined, CheckCircleFilled, HomeOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { AddressModal } from './AddressModal';
import { Button, Popconfirm, message } from 'antd';

const PAGE_SIZE = 20;

export const AddressStyle1 = () => {
    const [form] = Form.useForm();
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any>(null);

    const deleteMutation = useDeleteAddressMutation();

    const apiParams = useMemo(() => ({
        page: 0,
        size: 1000,
        receivingAddress: false,
        sort: 'defaultAddress:desc,createdAt:desc',
    }), []);

    const { data, isLoading } = useAddressesQuery(apiParams);

    // Client-side search: tên, SĐT, địa chỉ
    const filtered = useMemo(() => {
        const all = data?.data ?? [];
        if (!keyword.trim()) return all;
        const kw = keyword.trim().toLowerCase();
        return all.filter((item: any) => {
            const name = (item.name || item.fullName || '').toLowerCase();
            const phone = (item.phone || '').toLowerCase();
            const address = [item.address, item.wardName, item.districtName, item.provinceName]
                .filter(Boolean).join(' ').toLowerCase();
            return name.includes(kw) || phone.includes(kw) || address.includes(kw);
        });
    }, [data?.data, keyword]);

    const paginated = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, page]);

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
            await deleteMutation.mutateAsync(id);
            message.success('Xóa địa chỉ thành công');
        } catch (error) {
            message.error('Có lỗi xảy ra khi xóa');
        }
    };

    return (
        <div className="min-h-screen bg-layout space-y-6 p-4">
            {/* Filter */}
            <div className="bg-filter dark:bg-filter-dark p-4 rounded-lg">
                <FilterPanel
                    form={form}
                    searchText="Tìm kiếm"
                    resetText="Làm mới"
                    onSearch={handleSearch}
                    onReset={handleReset}
                    loading={isLoading}
                    primaryContent={
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Form.Item name="keyword" label="Tên / SĐT / Địa chỉ">
                                <Input
                                    placeholder="Tìm theo tên, SĐT hoặc địa chỉ"
                                    allowClear
                                    onPressEnter={handleSearch}
                                />
                            </Form.Item>
                        </div>
                    }
                />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between gap-2 text-base font-bold text-gray-700 dark:text-gray-200">
                <div className="flex items-center gap-2">
                    <EnvironmentOutlined className="text-primary" />
                    <span>Địa chỉ nhận hàng</span>
                    <span className="text-sm font-normal text-gray-400 ml-1">
                        ({filtered.length} địa chỉ{keyword ? ` / ${data?.data?.length ?? 0} tổng` : ''})
                    </span>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    className="h-10 px-6 rounded-lg font-bold shadow-lg shadow-primary/20"
                >
                    Thêm địa chỉ mới
                </Button>
            </div>

            {/* List */}
            <div className="space-y-3">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="w-36 h-3.5 bg-gray-200 dark:bg-gray-700 rounded" />
                                <div className="w-24 h-2.5 bg-gray-100 dark:bg-gray-800 rounded" />
                                <div className="w-64 h-2.5 bg-gray-100 dark:bg-gray-800 rounded" />
                            </div>
                        </div>
                    ))
                ) : !paginated.length ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 py-16">
                        <Empty description={keyword ? `Không tìm thấy "${keyword}"` : 'Không có địa chỉ nào'} />
                    </div>
                ) : (
                    paginated.map((item: any) => (
                        <div key={item.id}
                            className="flex items-start gap-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 hover:border-primary/30 hover:shadow-sm transition-all duration-200">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <HomeOutlined className="text-primary text-lg" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-gray-800 dark:text-gray-100">{item.name || item.fullName}</span>
                                    {item.phone && (
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{item.phone}</span>
                                    )}
                                    {item.defaultAddress && (
                                        <Tag icon={<CheckCircleFilled />} color="success" className="text-xs">Mặc định</Tag>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                    {[item.address, item.wardName, item.districtName, item.provinceName].filter(Boolean).join(', ')}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={() => handleEdit(item)}
                                    className="text-gray-400 hover:text-primary"
                                />
                                <Popconfirm
                                    title="Xóa địa chỉ?"
                                    description="Bạn có chắc chắn muốn xóa địa chỉ này không?"
                                    onConfirm={() => handleDelete(item.id)}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                    okButtonProps={{ danger: true }}
                                >
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        className="text-gray-400 hover:text-red-500"
                                    />
                                </Popconfirm>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {filtered.length > PAGE_SIZE && (
                <Pagination
                    current={page}
                    pageSize={PAGE_SIZE}
                    total={filtered.length}
                    onChange={(p) => setPage(p)}
                />
            )}

            <AddressModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                initialValues={editingAddress}
                isEdit={!!editingAddress}
            />
        </div>
    );
};
