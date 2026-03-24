import { useMemo, useState } from 'react';
import { Form, Input as AntInput, Button as AntButton, DatePicker, Empty, message } from 'antd';
import { Pagination } from '@repo/ui';
import { useFilterWithURL, usePaginationWithURL, useVouchersQuery } from '@repo/hooks';
import { SearchOutlined, RedoOutlined, FilterOutlined, GiftOutlined, CopyOutlined } from '@ant-design/icons';
import './VouchersStyle3.css';

const { RangePicker } = DatePicker;

export const VouchersStyle3 = () => {
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 20,
    });

    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    const apiParams = useMemo(() => {
        const params: Record<string, any> = {
            page: page - 1,
            size: pageSize,
            ...filters,
        };
        if (searchText) params.code = searchText;
        if (params.dateRange) {
            params.createdAtFrom = params.dateRange[0]?.toISOString?.() ?? params.dateRange[0];
            params.createdAtTo = params.dateRange[1]?.toISOString?.() ?? params.dateRange[1];
            delete params.dateRange;
        }
        return params;
    }, [page, pageSize, filters, searchText]);

    const { data, isLoading } = useVouchersQuery(apiParams);

    const handleSearch = () => applyFilters({ ...form.getFieldsValue(), code: searchText });
    const handleReset = () => { setSearchText(''); clearFilters(); };

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopiedCode(code);
            message.success('Đã sao chép mã!');
            setTimeout(() => setCopiedCode(null), 2000);
        });
    };

    const inputCls = 'h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700';

    const VoucherCard = ({ item }: { item: any }) => {
        const isCopied = copiedCode === item.code;
        const discountLabel = item.discountType === 'percent'
            ? `Giảm ${item.discountValue}%`
            : item.discountValue
                ? `Giảm ${item.discountValue?.toLocaleString()} đ`
                : item.name || '---';

        return (
            <div className="voucher-card flex items-stretch bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:border-primary/30 hover:shadow-md dark:hover:border-primary/30 transition-all duration-200">
                {/* Left — icon + code */}
                <div className="flex flex-col items-center justify-center gap-2 px-6 py-4 min-w-[120px] bg-gray-50 dark:bg-gray-900/60">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <GiftOutlined className="text-primary text-2xl" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 text-center leading-tight break-all max-w-[100px]">
                        {item.code}
                    </span>
                </div>

                {/* Divider */}
                <div className="w-px bg-gray-100 dark:bg-gray-700 self-stretch" />

                {/* Middle — info */}
                <div className="flex-1 flex flex-col justify-center px-5 py-4 gap-1">
                    <span className="text-base font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">
                        {discountLabel}
                    </span>
                    <div className="flex flex-col gap-0.5 mt-1">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                            Mã: <span className="font-semibold text-gray-600 dark:text-gray-300">{item.code}</span>
                        </span>
                        {(item.endDate || item.expiredAt) && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                HSD: <span className="font-semibold text-gray-600 dark:text-gray-300">
                                    {item.endDate || item.expiredAt}
                                </span>
                            </span>
                        )}
                        {item.minOrderValue > 0 && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                Đơn tối thiểu: <span className="font-semibold text-gray-600 dark:text-gray-300">
                                    {item.minOrderValue?.toLocaleString()} đ
                                </span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Right — copy button */}
                <div className="flex items-center pr-5 pl-3">
                    <AntButton
                        icon={<CopyOutlined />}
                        onClick={() => handleCopy(item.code)}
                        className={`h-10 px-5 rounded-full font-bold text-sm border-0 transition-all duration-200 shadow-sm ${isCopied
                            ? 'bg-green-500 text-white'
                            : 'bg-primary text-white hover:opacity-90'
                            }`}
                        style={{ background: isCopied ? '#22c55e' : 'var(--tenant-primary-color)' }}
                    >
                        {isCopied ? 'Đã chép!' : 'Sao chép mã'}
                    </AntButton>
                </div>
            </div>
        );
    };

    const SkeletonCard = () => (
        <div className="flex items-stretch bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-4 min-w-[120px] bg-gray-50 dark:bg-gray-900/60">
                <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="w-px bg-gray-100 dark:bg-gray-700" />
            <div className="flex-1 flex flex-col justify-center px-5 py-4 gap-2">
                <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="w-48 h-3 bg-gray-100 dark:bg-gray-800 rounded" />
                <div className="w-36 h-3 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
            <div className="flex items-center pr-5 pl-3">
                <div className="w-28 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
        </div>
    );

    return (
        <div className="vouchers-style-3-wrapper space-y-6 mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                        <GiftOutlined className="text-primary" />
                        Mã giảm giá của tôi
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {data?.total ? `${data.total} voucher khả dụng` : 'Danh sách voucher và mã giảm giá'}
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <AntInput
                        placeholder="Tìm mã voucher..."
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
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <Form form={form} layout="vertical" onValuesChange={() => applyFilters(form.getFieldsValue())}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item name="name" label="Tên voucher" className="mb-0">
                                <AntInput placeholder="Nhập tên voucher" className={inputCls} allowClear />
                            </Form.Item>
                            <Form.Item name="dateRange" label="Ngày tạo" className="mb-0">
                                <RangePicker className="w-full h-11 rounded-2xl" placeholder={['Từ ngày', 'Đến ngày']} />
                            </Form.Item>
                        </div>
                    </Form>
                </div>
            </div>

            {/* Voucher list */}
            <div className="space-y-3">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                ) : !data?.data?.length ? (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 py-20">
                        <Empty description="Không có mã giảm giá nào" />
                    </div>
                ) : (
                    data.data.map((item: any) => <VoucherCard key={item.id || item.code} item={item} />)
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
