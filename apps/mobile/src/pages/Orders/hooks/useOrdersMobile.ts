import { useMemo } from 'react';
import { Form } from 'antd';
import { 
    useFilterWithURL, 
    usePaginationWithURL, 
    useListOrderQuery, 
    useOrderStatusesQuery, 
    useOrderServicesQuery, 
    useMarketplacesQuery 
} from '@repo/hooks';
import { useTranslation } from '@repo/i18n';

export const useOrdersMobile = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL();
    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    const apiParams = useMemo(() => {
        const params: Record<string, any> = {
            page: page - 1,
            size: pageSize,
            ...filters
        };

        ['statuses', 'source', 'services'].forEach(key => {
            if (Array.isArray(params[key])) {
                params[key] = params[key].join(',');
            }
        });

        return params;
    }, [page, pageSize, filters]);

    const { data: orderData, isLoading } = useListOrderQuery(apiParams);
    const { data: statusData } = useOrderStatusesQuery();
    const { data: servicesData } = useOrderServicesQuery();
    const { data: marketplacesData } = useMarketplacesQuery();

    const statusOptions = useMemo(() => {
        if (!statusData) return [];
        return statusData.map((s: any) => ({
            label: s.name,
            value: s.code,
        }));
    }, [statusData]);

    return {
        t,
        form,
        page,
        pageSize,
        setPage,
        setPageSize,
        filters,
        applyFilters,
        clearFilters,
        orderData,
        isLoading,
        statusData,
        servicesData,
        marketplacesData,
        statusOptions
    };
};
