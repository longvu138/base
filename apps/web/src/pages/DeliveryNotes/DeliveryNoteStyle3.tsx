import { useMemo, useState } from 'react';
import {
    Form,
    Input as AntInput,
    Button as AntButton,
    Tag,
    Skeleton as AntSkeleton,
    Empty,
    Table,
    List,
    DatePicker,
} from 'antd';
import { Pagination } from '@repo/ui';
import { useFilterWithURL, usePaginationWithURL, useDeliveryNotesQuery } from '@repo/hooks';
import {
    SearchOutlined,
    RedoOutlined,
    FilterOutlined,
    FileTextOutlined,
    ArrowRightOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './DeliveryNoteStyle3.css';

/**
 * DeliveryNoteStyle3 — Giao diện cho Gobiz (gd3)
 * Premium table view với advanced filters, aligned với phong cách Gobiz Logistics.
 * Hỗ trợ filter theo: mã phiếu xuất (code), khoảng thời gian xuất (exportedAtFrom/To).
 */
export const DeliveryNoteStyle3: React.FC<{ isTabView?: boolean }> = ({ isTabView }) => {
    const [form] = Form.useForm();
    const [showFilters, setShowFilters] = useState(false);

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 25,
    });

    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    const apiParams = useMemo(() => {
        const params: Record<string, any> = {
            page: page - 1,
            size: pageSize,
            sort: 'exported_at:desc',
            ...filters,
        };
        if (params.exportedAtRange) {
            params.exportedAtFrom = params.exportedAtRange[0]?.toISOString();
            params.exportedAtTo = params.exportedAtRange[1]?.toISOString();
            delete params.exportedAtRange;
        }
        return params;
    }, [page, pageSize, filters]);

    const { data: listData, isLoading } = useDeliveryNotesQuery(apiParams);

    const columns = [
        {
            title: 'Mã phiếu xuất',
            dataIndex: 'code',
            key: 'code',
            render: (text: string, record: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileTextOutlined className="text-primary text-sm" />
                    </div>
                    <div>
                        <div className="font-extrabold text-[#1a1a1a] dark:text-gray-100 tracking-tight text-sm">
                            {text}
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium">
                            {record.exportedAt
                                ? dayjs(record.exportedAt).format('DD/MM/YYYY HH:mm')
                                : '—'}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderCode',
            key: 'orderCode',
            render: (t: string) => (
                <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">
                    {t || '—'}
                </span>
            ),
        },
        {
            title: 'Tổng kiện / Trọng lượng',
            key: 'specs',
            render: (_: any, r: any) => (
                <div>
                    <div className="font-semibold text-sm text-gray-700 dark:text-gray-200">
                        {r.totalPackages ?? '—'} kiện
                    </div>
                    <div className="text-[10px] text-gray-400">
                        {r.totalWeight != null ? `${r.totalWeight} kg` : ''}
                    </div>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) =>
                status ? (
                    <Tag className="rounded-lg px-3 py-0.5 m-0 border-0 font-bold text-[10px] uppercase shadow-sm">
                        {status}
                    </Tag>
                ) : (
                    <span className="text-gray-300">—</span>
                ),
        },
        {
            title: '',
            key: 'action',
            width: 60,
            render: () => (
                <AntButton
                    type="primary"
                    size="small"
                    shape="circle"
                    icon={<ArrowRightOutlined />}
                    className="shadow-sm"
                />
            ),
        },
    ];

    return (
        <div className={`delivery-note-style-3-wrapper ${isTabView ? '' : 'p-6'} space-y-6 max-w-[1600px] mx-auto`}>
            {/* Header — chỉ hiện khi không phải tab view */}
            {!isTabView && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Danh sách phiếu xuất
                        </h1>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Form form={form} onFinish={applyFilters} className="flex gap-3">
                            <Form.Item name="code" noStyle>
                                <AntInput
                                    placeholder="Tìm theo mã phiếu xuất..."
                                    prefix={<SearchOutlined className="text-gray-400" />}
                                    className="w-full md:w-80 h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700"
                                    onPressEnter={() => form.submit()}
                                />
                            </Form.Item>
                            <AntButton
                                type="primary"
                                icon={<SearchOutlined />}
                                onClick={() => form.submit()}
                                className="h-11 px-8 rounded-2xl font-bold shadow-lg shadow-primary/20"
                            >
                                Tìm kiếm
                            </AntButton>
                        </Form>
                        <AntButton
                            icon={<FilterOutlined />}
                            onClick={() => setShowFilters(!showFilters)}
                            className={`h-11 px-5 rounded-2xl font-bold transition-all ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700'}`}
                        >
                            Bộ lọc
                        </AntButton>
                        <AntButton
                            icon={<RedoOutlined />}
                            onClick={clearFilters}
                            className="h-11 px-5 rounded-2xl font-bold border-gray-200 dark:border-gray-700 hover:text-primary transition-all bg-gray-50 dark:bg-gray-900"
                        >
                            Làm mới
                        </AntButton>
                    </div>
                </div>
            )}

            {/* Tab view: search bar nhỏ gọn */}
            {isTabView && (
                <div className="flex justify-end gap-3">
                    <Form form={form} onFinish={applyFilters} className="flex gap-3">
                        <Form.Item name="code" noStyle>
                            <AntInput
                                placeholder="Tìm theo mã phiếu xuất..."
                                prefix={<SearchOutlined className="text-gray-400" />}
                                className="w-full md:w-72 h-10 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700"
                                onPressEnter={() => form.submit()}
                            />
                        </Form.Item>
                        <AntButton
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={() => form.submit()}
                            className="h-10 px-6 rounded-xl font-medium"
                        >
                            Tìm kiếm
                        </AntButton>
                    </Form>
                    <AntButton
                        icon={<FilterOutlined />}
                        onClick={() => setShowFilters(!showFilters)}
                        className={`h-10 px-4 rounded-xl font-medium transition-all ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700'}`}
                    >
                        Bộ lọc
                    </AntButton>
                    <AntButton
                        icon={<RedoOutlined />}
                        onClick={clearFilters}
                        className="h-10 px-4 rounded-xl font-medium border-gray-200 dark:border-gray-700 hover:text-primary transition-all bg-gray-50 dark:bg-gray-900"
                    >
                        Làm mới
                    </AntButton>
                </div>
            )}

            {/* Advanced Filters Panel */}
            <div
                className={`advanced-filters-container overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-[400px] opacity-100 mb-6' : 'max-h-0 opacity-0 overflow-hidden'}`}
            >
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <Form
                        form={form}
                        layout="vertical"
                        onValuesChange={() => applyFilters(form.getFieldsValue())}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Form.Item name="code" label="Mã phiếu xuất" className="mb-0">
                                <AntInput
                                    placeholder="Nhập mã phiếu xuất"
                                    className="h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700"
                                    allowClear
                                />
                            </Form.Item>
                            <Form.Item
                                name="exportedAtRange"
                                label="Thời gian xuất"
                                className="mb-0 col-span-1 md:col-span-1 lg:col-span-2"
                            >
                                <DatePicker.RangePicker
                                    className="w-full h-11 rounded-2xl"
                                    showTime
                                    format="DD/MM/YYYY HH:mm"
                                    placeholder={['Từ ngày', 'Đến ngày']}
                                />
                            </Form.Item>
                        </div>
                    </Form>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
                {isLoading ? (
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
                        rowKey="id"
                        pagination={false}
                        locale={{
                            emptyText: (
                                <div className="py-20">
                                    <Empty description="Không tìm thấy phiếu xuất nào" />
                                </div>
                            ),
                        }}
                    />
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center pt-4">
                <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={listData?.total || 0}
                    onChange={(p, s) => {
                        setPage(p);
                        if (s !== pageSize) setPageSize(s);
                    }}
                />
            </div>
        </div>
    );
};
