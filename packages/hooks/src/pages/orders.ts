import { useMemo } from 'react';
import { 
    useListOrderQuery, 
    useOrderStatusesQuery, 
    useOrderStatisticQuery, 
    useOrderServicesQuery, 
    useMarketplacesQuery 
} from '../useOrderHooks';

export interface UseOrdersLogicProps {
    page: number;
    pageSize: number;
    filters: Record<string, any>;
}

/**
 * Logic dùng chung cho trang Danh sách Đơn hàng - có thể dùng cho cả Web và Mobile
 * Nó điều phối việc lấy dữ liệu và tạo state phái sinh.
 */
export const useOrdersLogic = ({ page, pageSize, filters }: UseOrdersLogicProps) => {
    // 1. Định dạng tham số cho API
    const apiParams = useMemo(() => {
        const params: Record<string, any> = {
            page: page - 1,
            size: pageSize,
            ...filters
        };

        // Định dạng các bộ lọc mảng thành chuỗi phân cách bằng dấu phẩy cho backend
        ['statuses', 'marketplaces', 'services'].forEach(key => {
            if (Array.isArray(params[key])) {
                params[key] = params[key].join(',');
            }
        });

        return params;
    }, [page, pageSize, filters]);

    // 2. Lấy dữ liệu
    const { data: orderData, isLoading: isOrderLoading } = useListOrderQuery(apiParams);
    const { data: statusData } = useOrderStatusesQuery();
    const { data: statisticData } = useOrderStatisticQuery();
    const { data: servicesData } = useOrderServicesQuery();
    const { data: marketplacesData } = useMarketplacesQuery();

    // 3. State phái sinh: Các tùy chọn trạng thái kèm số lượng
    const statusOptions = useMemo(() => {
        if (!statusData) return [];
        return statusData.map((s: any) => {
            const statistic = statisticData?.find((item: any) => item.status === s.code);
            const count = statistic ? statistic.total : 0;
            return {
                label: `${s.name} (${count})`,
                value: s.code,
            };
        });
    }, [statusData, statisticData]);

    return {
        orderData,
        isOrderLoading,
        isOrdersLoading: isOrderLoading, // alias cho Style3
        statusData,
        statisticData,
        servicesData,
        marketplacesData,
        statusOptions,
        apiParams
    };
};
