import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Form, Input as AntInput, Button as AntButton, Tag, Skeleton as AntSkeleton, Empty } from 'antd';
import { Pagination } from '@repo/ui';
import { useTranslation } from '@repo/i18n';
import { SearchOutlined, RedoOutlined, ArrowRightOutlined, FileDoneOutlined, FilterOutlined } from '@ant-design/icons';
import './DeliveryNoteStyle3.css';

interface DeliveryNoteStyle3Props {
    listData: any;
    isLoading: boolean;
    page: number;
    pageSize: number;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    form: any;
    applyFilters: (values: any) => void;
    handleReset: () => void;
    filters: any;
}

export const DeliveryNoteStyle3: React.FC<DeliveryNoteStyle3Props> = ({
    listData, isLoading,
    page, pageSize, setPage, setPageSize,
    form, applyFilters, handleReset, filters
}) => {
    useTranslation();
    
    const [searchText, setSearchText] = useState(filters.query || '');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = () => applyFilters({ ...form.getFieldsValue(), query: searchText });
    const handleResetAll = () => { setSearchText(''); handleReset(); };

    const inputCls = 'h-10 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700';


    const searchBar = () => (
        <div className="space-y-3">
            <div className="flex gap-2">
                <AntInput
                    placeholder="Tìm mã phiếu, kho..."
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
        <div className="delivery-note-style-3-wrapper space-y-6">
            {/* Header compact for Mobile */}
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-5 rounded-[2rem] shadow-xl shadow-primary/5 border border-white dark:border-gray-800">
                <div className="mb-5">
                    <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white m-0">Phiếu giao <span className="text-primary">Gobiz</span></h1>
                    <p className="text-gray-400 text-xs m-0 font-medium">Bàn giao nhanh chóng, chính xác.</p>
                </div>
                {searchBar()}
            </div>

            {/* Advanced Filters Panel */}
            <div className={`advanced-filters-container overflow-hidden transition-all duration-500 ease-in-out ${showFilters ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700 space-y-5">
                    <Form form={form} layout="vertical" onValuesChange={() => applyFilters(form.getFieldsValue())}>
                        <div className="grid grid-cols-1 gap-4">
                            <Form.Item name="warehouseName" label={<span className="text-[10px] font-black uppercase text-primary tracking-widest pl-1">Kho xuất hàng</span>} className="mb-0">
                                <AntInput placeholder="Nhập tên kho..." className={inputCls} allowClear />
                            </Form.Item>
                        </div>
                    </Form>
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
                                        <FileDoneOutlined style={{ fontSize: '20px' }} />
                                    </div>
                                    <div>
                                        <div className="text-base font-black text-gray-900 dark:text-white tracking-tight">{record.code}</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                            {record.createdAt ? dayjs(record.createdAt).format('DD MMM, YYYY HH:mm') : '-'}
                                        </div>
                                    </div>
                                </div>
                                <Tag className="rounded-full px-3 py-0.5 m-0 border-0 bg-green-50 text-green-600 font-black text-[10px] uppercase shadow-sm">Hoàn thành</Tag>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Kho xuất</div>
                                    <div className="text-xs font-black text-gray-700 dark:text-gray-200 truncate">{record.warehouseName || '—'}</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Số kiện</div>
                                    <div className="text-xs font-black text-primary">{record.totalPackages || 0} kiện</div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center relative z-10">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Tổng cân nặng</span>
                                    <span className="text-sm font-black text-gray-900 dark:text-white">{record.totalWeight || 0} kg</span>
                                </div>
                                <AntButton 
                                    type="primary" 
                                    shape="circle" 
                                    size="large"
                                    icon={<ArrowRightOutlined />} 
                                    className="shadow-xl shadow-primary/30 border-0 flex items-center justify-center"
                                />
                            </div>
                        </div>
                    ))
                )}

                {(!listData?.data || listData.data.length === 0) && !isLoading && (
                    <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-12 text-center border border-dashed border-gray-200 dark:border-gray-700">
                        <Empty description={<span className="text-gray-400 font-bold">Không có phiếu giao nào</span>} />
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
