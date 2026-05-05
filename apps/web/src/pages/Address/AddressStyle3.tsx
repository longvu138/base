import { useMemo, useState } from 'react';
import { Input as AntInput, Button as AntButton, Empty } from 'antd';
import { Pagination } from '@repo/ui';
import { useAddressesQuery } from '@repo/hooks';
import {
    SearchOutlined,
    RedoOutlined,
    EnvironmentOutlined,
    HomeOutlined,
    CheckCircleFilled,
    PhoneOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { Popconfirm, message } from 'antd';
import './AddressStyle3.css';
import { AddressModal } from './AddressModal';
import { useDeleteAddressMutation } from '@repo/hooks';

const PAGE_SIZE = 20;

export const AddressStyle3 = () => {
    const [searchText, setSearchText] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [page, setPage] = useState(1);
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

    // Client-side filter: tên, SĐT, địa chỉ
    const filtered = useMemo(() => {
        const all = data?.data ?? [];
        if (!appliedSearch.trim()) return all;
        const kw = appliedSearch.trim().toLowerCase();
        return all.filter((item: any) => {
            const name = (item.name || item.fullName || '').toLowerCase();
            const phone = (item.phone || '').toLowerCase();
            const address = [item.address, item.wardName, item.districtName, item.provinceName]
                .filter(Boolean).join(' ').toLowerCase();
            return name.includes(kw) || phone.includes(kw) || address.includes(kw);
        });
    }, [data?.data, appliedSearch]);

    const paginated = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, page]);

    const handleSearch = () => {
        setAppliedSearch(searchText);
        setPage(1);
    };

    const handleReset = () => {
        setSearchText('');
        setAppliedSearch('');
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

    const AddressCard = ({ item }: { item: any }) => {
        const fullAddress = [item.address, item.wardName, item.districtName, item.provinceName]
            .filter(Boolean).join(', ');

        return (
            <div className="address-card group flex items-start gap-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 hover:border-primary/30 hover:shadow-md dark:hover:border-primary/30 transition-all duration-200">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <HomeOutlined className="text-primary text-xl" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                            {item.name || item.fullName || '—'}
                        </span>
                        {item.defaultAddress && (
                            <span className="address-default-badge">
                                <CheckCircleFilled style={{ fontSize: 10 }} />
                                Mặc định
                            </span>
                        )}
                    </div>
                    {item.phone && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                            <PhoneOutlined className="text-xs" />
                            <span>{item.phone}</span>
                        </div>
                    )}
                    {fullAddress && (
                        <div className="flex items-start gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                            <EnvironmentOutlined className="text-xs mt-0.5 shrink-0" />
                            <span className="leading-snug">{fullAddress}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <AntButton
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(item)}
                        className="text-gray-400 hover:text-primary rounded-full w-8 h-8 flex items-center justify-center p-0"
                    />
                    <Popconfirm
                        title="Xóa địa chỉ?"
                        description="Bạn có chắc chắn muốn xóa không?"
                        onConfirm={() => handleDelete(item.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <AntButton
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            className="text-gray-400 hover:text-red-500 rounded-full w-8 h-8 flex items-center justify-center p-0"
                        />
                    </Popconfirm>
                </div>
            </div>
        );
    };

    const SkeletonCard = () => (
        <div className="flex items-start gap-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 animate-pulse">
            <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 shrink-0" />
            <div className="flex-1 space-y-2.5 pt-1">
                <div className="flex items-center gap-3">
                    <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="w-16 h-4 bg-gray-100 dark:bg-gray-800 rounded-full" />
                </div>
                <div className="w-28 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="w-72 h-3 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
        </div>
    );

    return (
        <div className="address-style3-wrapper space-y-6 mx-auto">
            {/* Header + Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                        <EnvironmentOutlined className="text-primary" />
                        Địa chỉ nhận hàng
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {appliedSearch
                            ? `${filtered.length} kết quả cho "${appliedSearch}"`
                            : data?.data?.length
                                ? `${data.data.length} địa chỉ đã lưu`
                                : 'Danh sách địa chỉ nhận hàng của bạn'}
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <AntInput
                        placeholder="Tìm theo tên, SĐT, địa chỉ..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onPressEnter={handleSearch}
                        className="w-full md:w-72 h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700"
                        allowClear
                        onClear={handleReset}
                    />
                    <AntButton type="primary" icon={<SearchOutlined />} onClick={handleSearch}
                        className="h-11 px-6 rounded-2xl font-bold shadow-lg shadow-primary/20">
                        Tìm
                    </AntButton>
                    <AntButton icon={<RedoOutlined />} onClick={handleReset}
                        className="h-11 px-4 rounded-2xl font-bold border-gray-200 dark:border-gray-700 hover:text-primary transition-all bg-gray-50 dark:bg-gray-900">
                        Xoá lọc
                    </AntButton>
                    <AntButton type="primary" icon={<PlusOutlined />} onClick={handleAdd}
                        className="h-11 px-6 rounded-2xl font-bold shadow-lg shadow-primary/20">
                        Thêm mới
                    </AntButton>
                </div>
            </div>

            {/* Address list */}
            <div className="space-y-3">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                ) : !paginated.length ? (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 py-20">
                        <Empty description={appliedSearch ? `Không tìm thấy "${appliedSearch}"` : 'Không có địa chỉ nào'} />
                    </div>
                ) : (
                    paginated.map((item: any) => <AddressCard key={item.id} item={item} />)
                )}
            </div>

            {/* Pagination */}
            {filtered.length > PAGE_SIZE && (
                <div className="flex justify-center pt-2">
                    <Pagination
                        current={page}
                        pageSize={PAGE_SIZE}
                        total={filtered.length}
                        onChange={(p) => setPage(p)}
                    />
                </div>
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
