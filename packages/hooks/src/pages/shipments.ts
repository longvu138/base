import { useMemo } from 'react';
import { 
    useListShipmentQuery, 
    useShipmentStatusesQuery, 
    useShipmentStatisticQuery, 
    useShipmentServicesQuery 
} from '../useShipmentHooks';

export interface UseShipmentsLogicProps {
    page: number;
    pageSize: number;
    filters: Record<string, any>;
}

/**
 * Shared logic for Shipments Page - usable in Web and Mobile
 */
export const useShipmentsLogic = ({ page, pageSize, filters }: UseShipmentsLogicProps) => {
    // 1. Format params for API
    const apiParams = useMemo(() => {
        const params: Record<string, any> = {
            page: page - 1,
            pageSize,
            ...filters
        };

        // Convert array types for API
        ['statuses', 'services'].forEach(key => {
            if (Array.isArray(params[key])) {
                params[key] = params[key].join(',');
            }
        });

        return params;
    }, [page, pageSize, filters]);

    // 2. Fetch data
    const { data: shipmentData, isLoading: isShipmentLoading } = useListShipmentQuery(apiParams);
    const { data: statusData } = useShipmentStatusesQuery();
    const { data: statisticData } = useShipmentStatisticQuery();
    const { data: servicesData, isLoading: isServicesLoading } = useShipmentServicesQuery();

    // 3. Derived State: Status Options with counts
    const statusOptions = useMemo(() => {
        if (!statusData) return [];
        return statusData.map((s: any) => {
            const statistic = statisticData?.find((item: any) => item.status === s.code);
            const count = Number(statistic?.total || 0);
            return {
                label: count > 0 ? `${s.name} (${count})` : s.name,
                value: s.code,
            };
        });
    }, [statusData, statisticData]);

    return {
        shipmentData,
        isShipmentLoading,
        statusData,
        statisticData,
        servicesData,
        isServicesLoading,
        statusOptions,
        apiParams
    };
};
