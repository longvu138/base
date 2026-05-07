import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input as AntInput, Button as AntButton, Tag, Skeleton as AntSkeleton, Empty, DatePicker, Checkbox } from 'antd';
import { Pagination } from '@repo/ui';
import { useTranslation } from '@repo/i18n';
import { SearchOutlined, RedoOutlined, ArrowRightOutlined, BoxPlotOutlined, FilterOutlined } from '@ant-design/icons';
import './OrdersStyle3.css';

const { RangePicker } = DatePicker;

interface OrdersStyle3Props {
    data: any;
    isLoading: boolean;
    statuses?: any[];
    page: number;
    pageSize: number;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    form: any;
    applyFilters: (values: any) => void;
    handleReset: () => void;
    filters: any;
    statusOptions: any[];
    marketplacesData?: any[];
    servicesData?: any[];
    isTabView?: boolean;
}

export const OrdersStyle3: React.FC<OrdersStyle3Props> = ({
    data, isLoading, statuses, page, pageSize, setPage, setPageSize,
    form, applyFilters, handleReset, filters, statusOptions, isTabView
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [searchText, setSearchText] = useState(filters.query || '');
    const [showFilters, setShowFilters] = useState(false);

    const getStatusTag = (status: string) => {
        const found = statuses?.find((s: any) => s.code === status);
        return (
            <Tag
                color={found?.color || 'default'}
                className="rounded-xl px-2 py-0 m-0 border-0 font-bold text-[9px] uppercase shadow-sm"
            >
                {found?.name || status}
            </Tag>
        );
    };

    const handleSearch = () => applyFilters({ ...form.getFieldsValue(), query: searchText });
    const handleResetAll = () => { setSearchText(''); handleReset(); };

    const inputCls = 'h-10 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700';


    const searchBar = () => (
        <div className="space-y-3">
            <div className="flex gap-2">
                <AntInput
                    placeholder={t('orders.search_placeholder')}
                    prefix={<SearchOutlined className="text-gray-400" />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={handleSearch}
                    className="flex-1 h-10 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700"
                />
                <AntButton
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={handleSearch}
                    className="h-10 px-4 rounded-xl font-bold shadow-lg shadow-primary/20"
                />
            </div>
            <div className="flex gap-2">
                <AntButton
                    icon={<FilterOutlined />}
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex-1 h-10 rounded-xl font-bold transition-all ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700'}`}
                >
                    Bộ lọc
                </AntButton>
                <AntButton
                    icon={<RedoOutlined />}
                    onClick={handleResetAll}
                    className="flex-1 h-10 rounded-xl font-bold border-gray-200 dark:border-gray-700 hover:text-primary transition-all bg-gray-50 dark:bg-gray-900"
                >
                    Làm mới
                </AntButton>
            </div>
        </div>
    );

    return (
        <div className={`orders-style-3-wrapper space-y-6 ${isTabView ? 'p-4' : ''}`}>
            {/* Header compact for Mobile */}
            {!isTabView && (
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-5 rounded-[2rem] shadow-xl shadow-primary/5 border border-white dark:border-gray-800">
                    <div className="mb-5">
                        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white m-0">Đơn hàng <span className="text-primary">Gobiz</span></h1>
                        <p className="text-gray-400 text-xs m-0 font-medium">Phong cách vận hành hiện đại.</p>
                    </div>
                    {searchBar()}
                </div>
            )}

            {isTabView && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    {searchBar()}
                </div>
            )}

            {/* Advanced Filters Panel */}
            <div className={`advanced-filters-container overflow-hidden transition-all duration-500 ease-in-out ${showFilters ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700 space-y-5">
                    <Form form={form} layout="vertical" onValuesChange={() => applyFilters(form.getFieldsValue())}>
                        <div className="grid grid-cols-1 gap-4">
                            <Form.Item name="code" label={<span className="text-[10px] font-black uppercase text-primary tracking-widest pl-1">Mã đơn hàng</span>} className="mb-0">
                                <AntInput placeholder="Ví dụ: ORD123" className={inputCls} allowClear />
                            </Form.Item>
                            <Form.Item name="note" label={<span className="text-[10px] font-black uppercase text-primary tracking-widest pl-1">Ghi chú</span>} className="mb-0">
                                <AntInput placeholder="Nội dung ghi chú..." className={inputCls} allowClear />
                            </Form.Item>
                            <Form.Item name="dateRange" label={<span className="text-[10px] font-black uppercase text-primary tracking-widest pl-1">Ngày tạo</span>} className="mb-0">
                                <RangePicker className="w-full h-12 rounded-2xl bg-gray-50 dark:bg-gray-900 border-0" format="DD/MM/YYYY" placeholder={['Từ ngày', 'Đến ngày']} />
                            </Form.Item>
                        </div>

                        <div className="pt-5 mt-5 border-t border-gray-50 dark:border-gray-700/50 space-y-4">
                            <Form.Item name="receivingWarehouse" label={<span className="text-[10px] font-black uppercase text-primary tracking-widest pl-1">Kho nhận hàng</span>} className="mb-0">
                                <AntInput placeholder="Nhập tên kho..." className={inputCls} allowClear />
                            </Form.Item>
                            <Form.Item name="shopName" label={<span className="text-[10px] font-black uppercase text-primary tracking-widest pl-1">Tên gian hàng</span>} className="mb-0">
                                <AntInput placeholder="Tên shop" className={inputCls} allowClear />
                            </Form.Item>
                            <Form.Item name="financialPayment" valuePropName="checked" className="mb-0">
                                <Checkbox className="text-xs font-bold text-gray-600 dark:text-gray-300">Đã thanh toán tài chính</Checkbox>
                            </Form.Item>
                        </div>
                    </Form>
                </div>
            </div>

            {/* Status Tabs - Pill Style */}
            <div className="overflow-x-auto no-scrollbar py-1">
                <div className="flex gap-2">
                    <div
                        onClick={() => applyFilters({ ...form.getFieldsValue(), statuses: undefined })}
                        className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer shadow-sm ${!filters.statuses ? 'bg-primary text-white shadow-primary/30' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700'}`}
                    >
                        Tất cả
                    </div>
                    {statusOptions.map((opt: any) => {
                        const isActive = filters.statuses?.[0] === opt.value;
                        return (
                            <div
                                key={opt.value}
                                onClick={() => applyFilters({ ...form.getFieldsValue(), statuses: [opt.value] })}
                                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer shadow-sm ${isActive ? 'bg-primary text-white shadow-primary/30' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700'}`}
                            >
                                {opt.label}
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
                    data?.data?.map((record: any) => (
                        <div
                            key={record.id}
                            onClick={() => navigate(`/orders/${record.code}`)}
                            className="group relative bg-white dark:bg-gray-800 p-5 rounded-[2rem] shadow-md border border-gray-50 dark:border-gray-700/50 active:scale-[0.98] transition-all overflow-hidden"
                        >
                            {/* Decorative accent */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors"></div>

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                        <BoxPlotOutlined style={{ fontSize: '20px' }} />
                                    </div>
                                    <div>
                                        <div className="text-base font-black text-gray-900 dark:text-white tracking-tight">{record.code}</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                            {record.createdAt ? dayjs(record.createdAt).format('DD MMM, YYYY') : '-'}
                                        </div>
                                    </div>
                                </div>
                                {getStatusTag(record.status)}
                            </div>

                            <div className="flex justify-between items-end relative z-10 pt-2">
                                <div className="space-y-1">
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tổng giá trị</div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-gray-900 dark:text-white">{record.grandTotal?.toLocaleString()}</span>
                                        <span className="text-xs font-black text-primary">VNĐ</span>
                                    </div>
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

                {(!data?.data || data.data.length === 0) && !isLoading && (
                    <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-12 text-center border border-dashed border-gray-200 dark:border-gray-700">
                        <Empty description={<span className="text-gray-400 font-bold">Không có dữ liệu đơn hàng</span>} />
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center pb-24">
                <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={data?.total || 0}
                    onChange={(p, s) => { setPage(p); if (s !== pageSize) setPageSize(s); }}
                    showSizeChanger={false}
                    className="custom-modern-pagination"
                />
            </div>
        </div>
    );
};
