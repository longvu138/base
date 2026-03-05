import { useMemo, useState } from 'react';
import { Form, Input, DatePicker, Empty, message } from 'antd';
import { FilterPanel, Pagination } from '@repo/ui';
import { useFilterWithURL, usePaginationWithURL, useVouchersQuery } from '@repo/hooks';
import { GiftOutlined, CopyOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

export const VouchersStyle1 = () => {
    const [form] = Form.useForm();
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
        if (params.dateRange) {
            params.createdAtFrom = params.dateRange[0]?.toISOString?.() ?? params.dateRange[0];
            params.createdAtTo = params.dateRange[1]?.toISOString?.() ?? params.dateRange[1];
            delete params.dateRange;
        }
        return params;
    }, [page, pageSize, filters]);

    const { data, isLoading } = useVouchersQuery(apiParams);

    const handleSearch = () => applyFilters(form.getFieldsValue());

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopiedCode(code);
            message.success('Đã sao chép mã!');
            setTimeout(() => setCopiedCode(null), 2000);
        });
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
                    onReset={clearFilters}
                    loading={isLoading}
                    primaryContent={
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Form.Item name="code" label="Mã voucher">
                                <Input placeholder="Nhập mã voucher" allowClear />
                            </Form.Item>
                            <Form.Item name="name" label="Tên voucher">
                                <Input placeholder="Nhập tên voucher" allowClear />
                            </Form.Item>
                            <Form.Item name="dateRange" label="Ngày tạo">
                                <RangePicker className="w-full" placeholder={['Từ ngày', 'Đến ngày']} />
                            </Form.Item>
                        </div>
                    }
                />
            </div>

            {/* Tiêu đề */}
            <div className="flex items-center gap-2 text-base font-bold text-gray-700 dark:text-gray-200">
                <GiftOutlined className="text-primary" />
                <span>Ưu đãi của tôi</span>
                {data?.total != null && (
                    <span className="text-sm font-normal text-gray-400 ml-1">({data.total} voucher)</span>
                )}
            </div>

            {/* Card list */}
            <div className="space-y-3 max-w-[900px]">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-stretch bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
                            <div className="flex flex-col items-center justify-center gap-2 px-5 py-4 min-w-[110px] bg-gray-50 dark:bg-gray-900">
                                <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
                                <div className="w-14 h-2.5 bg-gray-200 dark:bg-gray-700 rounded" />
                            </div>
                            <div className="w-px bg-gray-100 dark:bg-gray-700" />
                            <div className="flex-1 flex flex-col justify-center px-4 py-4 gap-2">
                                <div className="w-28 h-3.5 bg-gray-200 dark:bg-gray-700 rounded" />
                                <div className="w-40 h-2.5 bg-gray-100 dark:bg-gray-800 rounded" />
                            </div>
                            <div className="flex items-center pr-4">
                                <div className="w-24 h-9 bg-gray-200 dark:bg-gray-700 rounded-full" />
                            </div>
                        </div>
                    ))
                ) : !data?.data?.length ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 py-16">
                        <Empty description="Không có mã giảm giá nào" />
                    </div>
                ) : (
                    data.data.map((item: any) => {
                        const isCopied = copiedCode === item.code;
                        const discountLabel = item.discountType === 'percent'
                            ? `Giảm ${item.discountValue}%`
                            : item.discountValue
                                ? `Giảm ${item.discountValue?.toLocaleString()} đ`
                                : item.name || '---';

                        return (
                            <div key={item.id || item.code}
                                className="flex items-stretch bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:border-primary/30 hover:shadow-sm transition-all duration-200">
                                {/* Icon + code */}
                                <div className="flex flex-col items-center justify-center gap-1.5 px-5 py-4 min-w-[110px] bg-gray-50 dark:bg-gray-900/50">
                                    <GiftOutlined className="text-primary text-2xl" />
                                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 text-center leading-tight break-all max-w-[90px]">
                                        {item.code}
                                    </span>
                                </div>
                                <div className="w-px bg-gray-100 dark:bg-gray-700 self-stretch" />
                                {/* Info */}
                                <div className="flex-1 flex flex-col justify-center px-4 py-3 gap-0.5">
                                    <span className="font-bold text-gray-800 dark:text-gray-100">{discountLabel}</span>
                                    <span className="text-xs text-gray-400">Mã: <span className="font-medium text-gray-600 dark:text-gray-300">{item.code}</span></span>
                                    {(item.endDate || item.expiredAt) && (
                                        <span className="text-xs text-gray-400">HSD: <span className="font-medium text-gray-600 dark:text-gray-300">{item.endDate || item.expiredAt}</span></span>
                                    )}
                                </div>
                                {/* Copy */}
                                <div className="flex items-center pr-4 pl-2">
                                    <button
                                        onClick={() => handleCopy(item.code)}
                                        className={`flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-bold text-white transition-all duration-200 ${isCopied ? 'bg-green-500' : 'bg-primary hover:opacity-90'}`}
                                        style={isCopied ? {} : { background: 'var(--tenant-primary-color)' }}
                                    >
                                        <CopyOutlined />
                                        {isCopied ? 'Đã chép!' : 'Sao chép mã'}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {(data?.total ?? 0) > pageSize && (
                <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={data?.total || 0}
                    onChange={(p, s) => { setPage(p); if (s !== pageSize) setPageSize(s); }}
                />
            )}
        </div>
    );
};
