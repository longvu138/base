import { useMemo } from 'react';
import dayjs from 'dayjs';
import {
    useWaybillsQuery,
    useWaybillStatusesQuery,
} from '../useWaybillHooks';

export interface UseWaybillsLogicProps {
    page: number;
    pageSize: number;
    filters: Record<string, any>;
}

/**
 * Shared logic for Waybills Page
 */
export const useWaybillsLogic = ({ page, pageSize, filters }: UseWaybillsLogicProps) => {
    // 1. Format params for API
    const apiParams = useMemo(() => {
        const params: Record<string, any> = {
            page: page - 1,
            size: pageSize,
            sort: 'createdAt:desc',
            ...filters,
        };

        // Handle date range
        if (params.receivedTimeRange) {
            params.receivedTimeFrom = params.receivedTimeRange[0]?.toISOString();
            params.receivedTimeTo = params.receivedTimeRange[1]?.toISOString();
            delete params.receivedTimeRange;
        }

        if (dayjs.isDayjs(params.receivedTimeFrom)) {
            params.receivedTimeFrom = params.receivedTimeFrom.startOf('day').toISOString();
        }

        if (dayjs.isDayjs(params.receivedTimeTo)) {
            params.receivedTimeTo = params.receivedTimeTo.endOf('day').toISOString();
        }

        // Handle array status
        if (Array.isArray(params.statuses)) {
            params.statuses = params.statuses.join(',');
        }

        return params;
    }, [page, pageSize, filters]);

    // 2. Fetch data
    const { data: listData, isLoading: isWaybillLoading } = useWaybillsQuery(apiParams);
    const { data: statusData } = useWaybillStatusesQuery();

    // 3. Derived State
    const statusOptions = useMemo(() => {
        if (!statusData) return [];
        return statusData.map((s: any) => ({ label: s.name, value: s.code }));
    }, [statusData]);

    return {
        listData,
        isWaybillLoading,
        isWaybillsLoading: isWaybillLoading, // alias cho UI
        statusData,
        statusOptions,
        apiParams
    };
};
