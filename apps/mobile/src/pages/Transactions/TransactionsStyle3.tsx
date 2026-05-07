import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Input as AntInput, Button as AntButton, Skeleton as AntSkeleton, Empty } from 'antd';
import { Pagination } from '@repo/ui';
import { SearchOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface TransactionsStyle3Props {
    data: any;
    isLoading: boolean;
    statusData?: any[];
    typeData?: any[];
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

export const TransactionsStyle3: React.FC<TransactionsStyle3Props> = ({
    data, isLoading, typeData,
    page, pageSize, setPage, setPageSize,
    form, applyFilters, filters, isTabView
}) => {
    const [searchText, setSearchText] = useState(filters.code || '');

    const handleSearch = () => applyFilters({ ...form.getFieldsValue(), code: searchText });

    return (
        <div className={`transactions-style-3 space-y-6 ${isTabView ? 'p-4' : ''}`}>
            {!isTabView && (
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-5 rounded-[2rem] shadow-xl shadow-primary/5 border border-white dark:border-gray-800">
                    <div className="flex gap-2">
                        <AntInput
                            placeholder="Mã giao dịch..."
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
                    data?.data?.map((item: any) => {
                        const isIncrease = item.amount > 0;
                        return (
                            <div key={item.id} className="bg-white dark:bg-gray-800 p-5 rounded-[2.5rem] shadow-md border border-gray-50 dark:border-gray-700/50 flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 shadow-inner ${isIncrease ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                                    {isIncrease ? <ArrowUpOutlined style={{ fontSize: '20px' }} /> : <ArrowDownOutlined style={{ fontSize: '20px' }} />}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="text-sm font-black text-gray-900 dark:text-white truncate pr-2">{item.code}</div>
                                        <div className={`text-base font-black ${isIncrease ? 'text-green-500' : 'text-red-500'}`}>
                                            {isIncrease ? '+' : ''}{item.amount?.toLocaleString()}đ
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                            {typeData?.find(t => t.code === item.type)?.name || item.type}
                                        </div>
                                        <div className="text-[9px] font-medium text-gray-400">
                                            {item.createdAt ? dayjs(item.createdAt).format('HH:mm DD/MM') : '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}

                {(!data?.data || data.data.length === 0) && !isLoading && (
                    <Empty description={<span className="text-gray-400 font-bold">Không có giao dịch nào</span>} />
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
