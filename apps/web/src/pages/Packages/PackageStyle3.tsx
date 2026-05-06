import React, { useState } from 'react';
import {
    Form,
    Input as AntInput,
    Button as AntButton,
    Tag,
    Skeleton as AntSkeleton,
    Tabs,
    Empty,
    Table,
    List,
    DatePicker,
} from 'antd';
import { Pagination } from '@repo/ui';
import {
    SearchOutlined,
    RedoOutlined,
    FilterOutlined,
    BarcodeOutlined,
    ArrowRightOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { ParcelMilestoneSteps } from '../../components/Package/ParcelMilestoneSteps';
import './PackageStyle3.css';
import { usePackagesPage } from './hooks/usePackagesPage';

/**
 * PackageStyle3 — Giao diện cho Gobiz (gd3)
 * Premium table view với status tabs, hiện đại và sạch sẽ.
 */
export const PackageStyle3: React.FC<{ isTabView?: boolean }> = ({ isTabView }) => {
    const {
        form, page, pageSize, setPage, setPageSize,
        filters, listData, isPackagesLoading, statusData,
        handleSearch, handleReset, applyFilters
    } = usePackagesPage();

    const [showFilters, setShowFilters] = useState(false);

    const getStatusInfo = (val: any) => {
        const code = typeof val === 'object' ? val?.code : val;
        const found = statusData?.find((s: any) => s.code === code);
        return { name: found?.name || code, color: found?.color || 'blue' };
    };

    const columns = [
        {
            title: 'Mã kiện',
            dataIndex: 'code',
            key: 'code',
            render: (text: string, record: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <BarcodeOutlined className="text-primary text-sm" />
                    </div>
                    <div>
                        <div className="font-extrabold text-[#1a1a1a] dark:text-gray-100 tracking-tight text-sm">{text}</div>
                        <div className="text-[10px] text-gray-400 font-medium">Đơn: {record.orderCode || '—'}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Mã vận đơn',
            dataIndex: 'trackingNumber',
            key: 'trackingNumber',
            render: (t: string) => <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">{t || '—'}</span>,
        },
        {
            title: 'Trọng lượng / KT',
            key: 'specs',
            render: (_: any, r: any) => (
                <div>
                    <div className="font-semibold text-sm text-gray-700 dark:text-gray-200">{r.weight || '0'} kg</div>
                    <div className="text-[10px] text-gray-400">{r.length || 0}×{r.width || 0}×{r.height || 0} cm</div>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (val: any) => {
                const { name, color } = getStatusInfo(val);
                return <Tag color={color} className="rounded-lg px-3 py-0.5 m-0 border-0 font-bold text-[10px] uppercase shadow-sm">{name}</Tag>;
            },
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (t: string) => <span className="text-sm text-gray-500">{dayjs(t).format('DD/MM/YYYY HH:mm')}</span>,
        },
        {
            title: '',
            key: 'action',
            width: 60,
            render: () => <AntButton type="primary" size="small" shape="circle" icon={<ArrowRightOutlined />} className="shadow-sm" />,
        },
    ];

    const activeStatus = filters.statuses
        ? (Array.isArray(filters.statuses) ? filters.statuses[0] : filters.statuses)
        : 'ALL';

    return (
        <div className={`package-style-3-wrapper ${isTabView ? '' : 'p-6'} space-y-6 max-w-[1600px] mx-auto`}>

            {/* Header STANDALONE */}
            {!isTabView && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Kiện hàng</h1>
                        <p className="text-gray-500 text-sm">Theo dõi và tra cứu trạng thái các kiện hàng.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Form form={form} component={false}>
                            <Form.Item name="packageCode" noStyle>
                                <AntInput placeholder="Tìm theo mã kiện, mã đơn..." prefix={<SearchOutlined className="text-gray-400" />} className="w-full md:w-80 h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700" onPressEnter={handleSearch} />
                            </Form.Item>
                        </Form>
                        <AntButton type="primary" icon={<SearchOutlined />} onClick={handleSearch} className="h-11 px-8 rounded-2xl font-bold shadow-lg shadow-primary/20">Tìm kiếm</AntButton>
                        <AntButton icon={<FilterOutlined />} onClick={() => setShowFilters(!showFilters)} className={`h-11 px-5 rounded-2xl font-bold transition-all ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700'}`}>Bộ lọc</AntButton>
                        <AntButton icon={<RedoOutlined />} onClick={handleReset} className="h-11 px-5 rounded-2xl font-bold border-gray-200 dark:border-gray-700 hover:text-primary transition-all bg-gray-50 dark:bg-gray-900">Làm mới</AntButton>
                    </div>
                </div>
            )}

            {/* Header TAB VIEW */}
            {isTabView && (
                <div className="flex justify-end gap-3">
                    <Form form={form} component={false}>
                        <Form.Item name="packageCode" noStyle>
                            <AntInput placeholder="Tìm theo mã kiện, mã đơn..." prefix={<SearchOutlined className="text-gray-400" />} className="w-full md:w-72 h-10 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700" onPressEnter={handleSearch} />
                        </Form.Item>
                    </Form>
                    <AntButton type="primary" icon={<SearchOutlined />} onClick={handleSearch} className="h-10 px-6 rounded-xl font-medium">Tìm kiếm</AntButton>
                    <AntButton icon={<FilterOutlined />} onClick={() => setShowFilters(!showFilters)} className={`h-10 px-4 rounded-xl font-medium transition-all ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700'}`}>Bộ lọc</AntButton>
                    <AntButton icon={<RedoOutlined />} onClick={handleReset} className="h-10 px-4 rounded-xl font-medium border-gray-200 dark:border-gray-700 hover:text-primary transition-all bg-gray-50 dark:bg-gray-900">Làm mới</AntButton>
                </div>
            )}

            {/* Advanced Filters */}
            <div className={`advanced-filters-container overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-[400px] opacity-100 mb-6' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <Form form={form} layout="vertical" onValuesChange={() => applyFilters(form.getFieldsValue())}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Form.Item name="packageCode" label="Mã kiện" className="mb-0">
                                <AntInput placeholder="Nhập mã kiện" className="h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700" allowClear />
                            </Form.Item>
                            <Form.Item name="orderCode" label="Mã đơn hàng" className="mb-0">
                                <AntInput placeholder="Nhập mã đơn" className="h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700" allowClear />
                            </Form.Item>
                            <Form.Item name="trackingNumber" label="Mã vận đơn" className="mb-0">
                                <AntInput placeholder="Nhập mã vận đơn" className="h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700" allowClear />
                            </Form.Item>
                            <Form.Item name="createdAtRange" label="Khoảng thời gian" className="mb-0">
                                <DatePicker.RangePicker className="w-full h-11 rounded-2xl" format="DD/MM/YYYY" placeholder={['Từ ngày', 'Đến ngày']} />
                            </Form.Item>
                        </div>
                    </Form>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="bg-white dark:bg-gray-800 p-1 rounded-2xl border border-gray-100 dark:border-gray-700 inline-block overflow-hidden max-w-full">
                <Tabs
                    activeKey={activeStatus}
                    onChange={key => applyFilters({ ...filters, statuses: key === 'ALL' ? undefined : [key] })}
                    items={[
                        { key: 'ALL', label: <span className="px-4 py-1">Tất cả</span> },
                        ...(statusData || []).map((s: any) => ({ key: s.code, label: <span className="px-4 py-1">{s.name}</span> })),
                    ]}
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
                {isPackagesLoading ? (
                    <List
                        dataSource={Array.from({ length: 6 }).map((_, i) => ({ id: `sk-${i}` }))}
                        renderItem={() => (
                            <div className="p-5 border-b border-gray-50 dark:border-gray-700/50">
                                <AntSkeleton active paragraph={{ rows: 1 }} title={false} />
                            </div>
                        )}
                    />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={listData?.data || []}
                        rowKey="code"
                        pagination={false}
                        expandable={{
                            expandedRowRender: (r) => <ParcelMilestoneSteps parcelCode={r.code} />,
                            expandRowByClick: true,
                        }}
                        locale={{ emptyText: <div className="py-20"><Empty description="Không tìm thấy kiện hàng nào" /></div> }}
                    />
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center pt-4">
                <Pagination current={page} pageSize={pageSize} total={listData?.total || 0}
                    onChange={(p, s) => { setPage(p); if (s !== pageSize) setPageSize(s); }} />
            </div>
        </div>
    );
};

