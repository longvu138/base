import { Pagination as AntPagination } from 'antd';

export interface PaginationProps {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
    className?: string;
    pageSizeOptions?: string[];
    showSizeChanger?: boolean;
}

export function Pagination({
    current,
    pageSize,
    total,
    onChange,
    className = "",
    pageSizeOptions = ['10', '20', '50', '100'],
    showSizeChanger = true
}: PaginationProps) {
    if (total <= 0) return null;

    return (
        <div className={`flex justify-end py-4 ${className}`}>
            <AntPagination
                current={current}
                pageSize={pageSize}
                total={total}
                onChange={onChange}
                showSizeChanger={showSizeChanger}
                pageSizeOptions={pageSizeOptions}
            />
        </div>
    );
}
