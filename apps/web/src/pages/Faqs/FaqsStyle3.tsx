import { useState } from 'react';
import { Collapse, Empty } from 'antd';
import { Input as AntInput, Button as AntButton } from 'antd';
import { Pagination } from '@repo/ui';
import {
    SearchOutlined,
    RedoOutlined,
    QuestionCircleFilled,
    BookOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useFaqsPage } from './hooks/useFaqsPage';
import './FaqsStyle3.css';

export const FaqsStyle3 = () => {
    const [searchText, setSearchText] = useState('');

    const {
        form, page, pageSize, setPage, setPageSize,
        faqsData: data, isFaqsLoading: isLoading,
        handleReset: baseReset,
        applyFilters
    } = useFaqsPage();

    const handleSearch = () => {
        applyFilters({ ...form.getFieldsValue(), query: searchText });
    };
    const handleReset = () => {
        setSearchText('');
        baseReset();
        setPage(1);
    };

    return (
        <div className="faqs-style3-wrapper space-y-6 mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                        <BookOutlined className="text-primary" />
                        Hướng dẫn & Câu hỏi thường gặp
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {data?.total
                            ? `${data.total} bài hướng dẫn`
                            : 'Tìm câu trả lời bạn cần'}
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <AntInput
                        placeholder="Tìm theo tiêu đề..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onPressEnter={handleSearch}
                        className="w-full md:w-64 h-11 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700"
                        allowClear
                        onClear={handleReset}
                    />
                    <AntButton type="primary" icon={<SearchOutlined />} onClick={handleSearch}
                        className="h-11 px-6 rounded-2xl font-bold shadow-lg shadow-primary/20">
                        Tìm
                    </AntButton>
                    <AntButton icon={<RedoOutlined />} onClick={handleReset}
                        className="h-11 px-4 rounded-2xl font-bold border-gray-200 dark:border-gray-700 hover:text-primary transition-all bg-gray-50 dark:bg-gray-900">
                        Xoá lọc
                    </AntButton>
                </div>
            </div>

            {/* FAQ Accordion */}
            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-gray-700 shrink-0" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
                                <div className="w-16 h-4 bg-gray-100 dark:bg-gray-800 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : !data?.data?.length ? (
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 py-20">
                    <Empty description="Không có hướng dẫn nào" />
                </div>
            ) : (
                <Collapse
                    accordion={false}
                    expandIconPosition="end"
                    className="faq-style3-collapse bg-transparent border-0"
                    items={data.data.map((item: any) => ({
                        key: String(item.id),
                        label: (
                            <div className="flex items-center gap-3">
                                {/* Index badge */}
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ background: 'var(--tenant-primary-color, #1677ff)', opacity: 0.9 }}>
                                    <QuestionCircleFilled className="text-white text-sm" />
                                </div>
                                <span className="font-bold text-gray-800 dark:text-gray-100 flex-1">
                                    {item.title}
                                </span>
                                {item.code && (
                                    <span className="text-xs text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-lg shrink-0">
                                        #{item.code}
                                    </span>
                                )}
                            </div>
                        ),
                        children: (
                            <div className="space-y-4 pl-11">
                                {/* HTML Content từ Quill */}
                                <div
                                    className="faq-content text-gray-600 dark:text-gray-300 text-sm leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: item.content || '<p>Không có nội dung</p>' }}
                                />
                                {/* Meta */}
                                {(item.modifiedAt || item.createdAt) && (
                                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-700/60 text-xs text-gray-400">
                                        <span>
                                            Cập nhật:{' '}
                                            <span className="font-medium text-gray-500 dark:text-gray-400">
                                                {dayjs(item.modifiedAt || item.createdAt).format('HH:mm DD/MM/YYYY')}
                                            </span>
                                        </span>
                                        {item.modifiedBy && (
                                            <span>bởi <span className="font-medium text-gray-500 dark:text-gray-400">{item.modifiedBy}</span></span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ),
                    }))}
                />
            )}

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
