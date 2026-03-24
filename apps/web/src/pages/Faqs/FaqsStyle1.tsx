import { useMemo } from 'react';
import { Collapse, Empty, Input, Form, Card, Tag } from 'antd';
import { FilterPanel, Pagination } from '@repo/ui';
import { usePaginationWithURL, useFilterWithURL, useFaqsQuery } from '@repo/hooks';
import { QuestionCircleOutlined, BookOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

export const FaqsStyle1 = () => {
    const [form] = Form.useForm();

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 25,
    });

    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    const apiParams = useMemo(() => ({
        page: page - 1,
        size: pageSize,
        sort: 'position:asc',
        ...filters,
    }), [page, pageSize, filters]);

    const { data, isLoading } = useFaqsQuery(apiParams);

    const handleSearch = () => applyFilters(form.getFieldsValue());

    return (
        <div className="min-h-screen bg-layout space-y-6 p-4">
            {/* Filter */}
            <Card className="shadow-sm">
                <FilterPanel
                    form={form}
                    searchText="Tìm kiếm"
                    resetText="Làm mới"
                    onSearch={handleSearch}
                    onReset={clearFilters}
                    loading={isLoading}
                    primaryContent={
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Form.Item name="query" label="Tiêu đề">
                                <Input placeholder="Tìm theo tiêu đề" className="h-10" allowClear onPressEnter={handleSearch} />
                            </Form.Item>
                        </div>
                    }
                />
            </Card>

            {/* Header */}
            <div className="flex items-center gap-2 text-base font-bold text-gray-700 dark:text-gray-200">
                <BookOutlined className="text-primary" />
                <span>Hướng dẫn</span>
                {data?.total != null && (
                    <span className="text-sm font-normal text-gray-400 ml-1">({data.total} mục)</span>
                )}
            </div>

            {/* FAQ Accordion */}
            <div className="max-w-[900px]">
                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-4 animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !data?.data?.length ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 py-16">
                        <Empty description="Không có hướng dẫn nào" />
                    </div>
                ) : (
                    <Collapse
                        accordion={false}
                        expandIconPosition="end"
                        items={data.data.map((item: any) => ({
                            key: String(item.id),
                            label: (
                                <div className="flex items-center gap-3 py-1">
                                    <QuestionCircleOutlined className="text-primary shrink-0" />
                                    <span className="font-semibold text-gray-800 dark:text-gray-100">{item.title}</span>
                                    {item.code && (
                                        <Tag className="ml-auto shrink-0 text-xs">{item.code}</Tag>
                                    )}
                                </div>
                            ),
                            children: (
                                <div className="space-y-3">
                                    <div
                                        className="faq-content text-gray-600 dark:text-gray-300 text-sm leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: item.content || '' }}
                                    />
                                    <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
                                        <span>Cập nhật: {item.modifiedAt ? dayjs(item.modifiedAt).format('DD/MM/YYYY') : '—'}</span>
                                        {item.modifiedBy && <span>bởi <span className="font-medium">{item.modifiedBy}</span></span>}
                                    </div>
                                </div>
                            ),
                        }))}
                    />
                )}
            </div>

            {/* Pagination */}
            {(data?.total ?? 0) > pageSize && (
                <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={data?.total || 0}
                    onChange={(p: number, s: number) => { setPage(p); if (s !== pageSize) setPageSize(s); }}
                />
            )}
        </div>
    );
};
