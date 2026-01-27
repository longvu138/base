import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface UsePaginationWithURLOptions {
    defaultPage?: number;
    defaultPageSize?: number;
}

/**
 * Hook quản lý Pagination dựa hoàn toàn vào URL
 * Không sử dụng local state để tránh conflict
 */
export const usePaginationWithURL = (options: UsePaginationWithURLOptions = {}) => {
    const {
        defaultPage = 1,
        defaultPageSize = 20,
    } = options;

    const [searchParams, setSearchParams] = useSearchParams();


    const pageParam = searchParams.get('page');
    const pageSizeParam = searchParams.get('pageSize');

    const page = pageParam ? parseInt(pageParam) : defaultPage;
    const pageSize = pageSizeParam ? parseInt(pageSizeParam) : defaultPageSize;


    useEffect(() => {
        if (!pageParam && !pageSizeParam) {
            setSearchParams(prev => {

                if (prev.has('page') || prev.has('pageSize')) return prev;

                const newParams = new URLSearchParams(prev);
                newParams.set('page', String(defaultPage));
                newParams.set('pageSize', String(defaultPageSize));
                return newParams;
            }, { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const setPage = (newPage: number) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', String(newPage));
            return newParams;
        });
    };

    const setPageSize = (newPageSize: number) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('pageSize', String(newPageSize));
            newParams.set('page', '1');
            return newParams;
        });
    };

    return {
        page,
        pageSize,
        setPage,
        setPageSize
    };
};
