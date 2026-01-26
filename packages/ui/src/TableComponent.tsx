
import { Button, Pagination, Empty, Spin } from 'antd';
import { FileSpreadsheet } from 'lucide-react';
import type { TableComponentProps } from './types';

export function TableComponent({
    children,
    title,
    totalCount,
    onExport,
    extra,
    loading = false,
    emptyText = 'Không có dữ liệu',
    showEmpty = false,
    hideTotalCount = false
}: TableComponentProps): any {
    return (
        <div className="rounded-lg shadow-sm overflow-hidden">
            {/* Header with stats and actions */}
            <div className="mb-3">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        {title && <div className="text-lg font-semibold text-primary dark:text-primary-dark">{title}</div>}
                        {totalCount !== undefined && !hideTotalCount && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Tổng: <span className="font-semibold text-gray-900 dark:text-gray-100">{totalCount}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Custom Actions */}
                        {extra}

                        {/* Export (Legacy support, prefer extra) */}
                        {onExport && (
                            <Button
                                icon={<FileSpreadsheet size={16} />}
                                onClick={onExport}
                            >
                                Xuất Excel
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <Spin spinning={loading}>
                <div className="p-0 min-h-[200px]">
                    {showEmpty ? (
                        <div className="py-12">
                            <Empty
                                description={emptyText}
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        </div>
                    ) : (
                        children
                    )}
                </div>
            </Spin>

        </div>
    );
}
