import dayjs from 'dayjs';
import { useState } from 'react';
import { Form, Input as AntInput, Button as AntButton, Tag, Skeleton as AntSkeleton, Empty } from 'antd';
import { Pagination } from '@repo/ui';
import { useTranslation } from '@repo/i18n';
import { SearchOutlined, RedoOutlined, ArrowRightOutlined, BugOutlined, FilterOutlined } from '@ant-design/icons';
import './ClaimsStyle3.css';

export const ClaimsStyle3 = ({ 
    listData, isLoading, statusData,
    page, pageSize, setPage, setPageSize,
    form, applyFilters, handleReset, filters
}: any) => {
    useTranslation();
    
    const [searchText, setSearchText] = useState(filters.code || '');
    const [showFilters, setShowFilters] = useState(false);

    const getStatusTag = (status: string) => {
        const found = statusData?.find((s: any) => s.code === status);
        return (
            <Tag
                color={found?.color || 'default'}
                className="rounded-xl px-2 py-0 m-0 border-0 font-bold text-[9px] uppercase shadow-sm"
            >
                {found?.name || status}
            </Tag>
        );
    };

    const handleSearch = () => applyFilters({ ...form.getFieldsValue(), code: searchText });
    const handleResetAll = () => { setSearchText(''); handleReset(); };

    const inputCls = 'h-10 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700';

    const searchBar = () => (
        <div className="space-y-3">
            <div className="flex gap-2">
                <AntInput
                    placeholder="Tìm mã khiếu nại..."
                    prefix={<SearchOutlined className="text-gray-400" />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={handleSearch}
                    className="flex-1 h-10 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700"
                />
                <AntButton type="primary" icon={<SearchOutlined />} onClick={handleSearch}
                    className="h-10 px-4 rounded-xl font-bold shadow-lg shadow-primary/20"
                />
            </div>
            <div className="flex gap-2">
                <AntButton icon={<FilterOutlined />} onClick={() => setShowFilters(!showFilters)}
                    className={`flex-1 h-10 rounded-xl font-bold transition-all ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700'}`}
                >
                    Bộ lọc
                </AntButton>
                <AntButton icon={<RedoOutlined />} onClick={handleResetAll}
                    className="flex-1 h-10 rounded-xl font-bold border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                >
                    Làm mới
                </AntButton>
            </div>
        </div>
    );

    return (
        <div className="claims-style-3-wrapper space-y-6">
            {/* Header compact for Mobile */}
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-5 rounded-[2rem] shadow-xl shadow-primary/5 border border-white dark:border-gray-800">
                <div className="mb-5">
                    <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white m-0">Khiếu nại <span className="text-primary">Gobiz</span></h1>
                    <p className="text-gray-400 text-xs m-0 font-medium">Hỗ trợ khách hàng tận tâm.</p>
                </div>
                {searchBar()}
            </div>

            {/* Advanced Filters Panel */}
            <div className={`advanced-filters-container overflow-hidden transition-all duration-500 ease-in-out ${showFilters ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700 space-y-5">
                    <Form form={form} layout="vertical" onValuesChange={() => applyFilters(form.getFieldsValue())}>
                        <div className="grid grid-cols-1 gap-4">
                            <Form.Item name="relatedOrder" label={<span className="text-[10px] font-black uppercase text-primary tracking-widest pl-1">Mã đơn hàng</span>} className="mb-0">
                                <AntInput placeholder="Ví dụ: ORD123" className={inputCls} allowClear />
                            </Form.Item>
                            <Form.Item name="relatedProduct" label={<span className="text-[10px] font-black uppercase text-primary tracking-widest pl-1">Mã sản phẩm</span>} className="mb-0">
                                <AntInput placeholder="Nhập mã sản phẩm..." className={inputCls} allowClear />
                            </Form.Item>
                        </div>
                    </Form>
                </div>
            </div>

            {/* Status Tabs - Pill Style */}
            <div className="overflow-x-auto no-scrollbar py-1">
                <div className="flex gap-2">
                    <div 
                        onClick={() => applyFilters({ ...form.getFieldsValue(), publicStates: undefined })}
                        className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer shadow-sm ${!filters.publicStates ? 'bg-primary text-white shadow-primary/30' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700'}`}
                    >
                        Tất cả
                    </div>
                    {(statusData || []).map((s: any) => {
                        const isActive = filters.publicStates?.[0] === s.code;
                        return (
                            <div 
                                key={s.code}
                                onClick={() => applyFilters({ ...form.getFieldsValue(), publicStates: [s.code] })}
                                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer shadow-sm ${isActive ? 'bg-primary text-white shadow-primary/30' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700'}`}
                            >
                                {s.name}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Content List - Modern Cards */}
            <div className="space-y-4 min-h-[400px]">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] shadow-sm">
                            <AntSkeleton active avatar paragraph={{ rows: 2 }} />
                        </div>
                    ))
                ) : (
                    listData?.data?.map((record: any) => (
                        <div 
                            key={record.id}
                            className="group relative bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-md border border-gray-50 dark:border-gray-700/50 active:scale-[0.98] transition-all overflow-hidden"
                        >
                            {/* Decorative accent */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors"></div>
                            
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                        <BugOutlined style={{ fontSize: '20px' }} />
                                    </div>
                                    <div>
                                        <div className="text-base font-black text-gray-900 dark:text-white tracking-tight">{record.code}</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                            {record.createdAt ? dayjs(record.createdAt).format('DD MMM, YYYY HH:mm') : '-'}
                                        </div>
                                    </div>
                                </div>
                                {getStatusTag(record.publicState)}
                            </div>

                            <div className="mb-4 relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${record.ticketType === 'order' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {record.ticketType === 'order' ? 'Đơn hàng' : 'Vận chuyển'}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 italic">
                                    {record.content || 'Không có nội dung mô tả...'}
                                </div>
                            </div>

                            <div className="flex justify-end relative z-10">
                                <AntButton 
                                    type="primary" 
                                    shape="round" 
                                    size="middle"
                                    icon={<ArrowRightOutlined />} 
                                    className="shadow-lg shadow-primary/30 border-0 font-black text-xs px-6"
                                >
                                    Xem giải quyết
                                </AntButton>
                            </div>
                        </div>
                    ))
                )}

                {(!listData?.data || listData.data.length === 0) && !isLoading && (
                    <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-12 text-center border border-dashed border-gray-200 dark:border-gray-700">
                        <Empty description={<span className="text-gray-400 font-bold">Không có khiếu nại nào</span>} />
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center pb-24">
                <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={listData?.total || 0}
                    onChange={(p, s) => { setPage(p); if (s !== pageSize) setPageSize(s); }}
                    showSizeChanger={false}
                    className="custom-modern-pagination"
                />
            </div>
        </div>
    );
};
