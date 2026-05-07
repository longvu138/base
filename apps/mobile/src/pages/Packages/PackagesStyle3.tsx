import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Input as AntInput, Button as AntButton, Tag, Skeleton as AntSkeleton, Empty } from 'antd';
import { Pagination } from '@repo/ui';
import { SearchOutlined, BoxPlotOutlined } from '@ant-design/icons';

interface PackagesStyle3Props {
    data: any;
    isLoading: boolean;
    statusData?: any[];
    page: number;
    pageSize: number;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    form: any;
    applyFilters: (values: any) => void;
    handleReset: () => void;
    filters: any;
    isTabView?: boolean;
}

export const PackagesStyle3: React.FC<PackagesStyle3Props> = ({
    data, isLoading, statusData,
    page, pageSize, setPage, setPageSize,
    form, applyFilters, filters, isTabView
}) => {
    const [searchText, setSearchText] = useState(filters.query || '');

    const handleSearch = () => applyFilters({ ...form.getFieldsValue(), query: searchText });

    const getStatusTag = (status: string) => {
        const found = statusData?.find((s: any) => s.code === status);
        return (
            <Tag color={found?.color || 'default'} className="rounded-full px-3 py-0.5 m-0 border-0 font-black text-[10px] uppercase shadow-sm">
                {found?.name || status}
            </Tag>
        );
    };

    return (
        <div className={`packages-style-3 space-y-6 ${isTabView ? 'p-4' : ''}`}>
            {!isTabView && (
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-5 rounded-[2rem] shadow-xl shadow-primary/5 border border-white dark:border-gray-800">
                    <div className="flex gap-2">
                        <AntInput
                            placeholder="Tìm mã kiện hàng..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onPressEnter={handleSearch}
                            className="flex-1 h-12 rounded-2xl bg-gray-50 dark:bg-gray-900 border-0"
                        />
                        <AntButton type="primary" icon={<SearchOutlined />} onClick={handleSearch} className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30" />
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] shadow-sm">
                            <AntSkeleton active avatar paragraph={{ rows: 2 }} />
                        </div>
                    ))
                ) : (
                    data?.data?.map((item: any) => (
                        <div key={item.id} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-md border border-gray-50 dark:border-gray-700/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
                            
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <BoxPlotOutlined style={{ fontSize: '20px' }} />
                                    </div>
                                    <div>
                                        <div className="text-base font-black text-gray-900 dark:text-white tracking-tight">{item.code}</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                            {item.createdAt ? dayjs(item.createdAt).format('DD MMM, YYYY') : '-'}
                                        </div>
                                    </div>
                                </div>
                                {getStatusTag(item.status)}
                            </div>

                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl">
                                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Cân nặng</div>
                                    <div className="text-sm font-black text-gray-900 dark:text-white">{item.weight || 0} kg</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl">
                                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Kho hiện tại</div>
                                    <div className="text-sm font-black text-primary truncate">{item.currentWarehouseName || '—'}</div>
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {(!data?.data || data.data.length === 0) && !isLoading && (
                    <Empty description={<span className="text-gray-400 font-bold">Không có kiện hàng nào</span>} />
                )}
            </div>

            <div className="flex justify-center pb-24">
                <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={data?.total || 0}
                    onChange={(p, s) => { setPage(p); if (s !== pageSize) setPageSize(s); }}
                    showSizeChanger={false}
                />
            </div>
        </div>
    );
};
