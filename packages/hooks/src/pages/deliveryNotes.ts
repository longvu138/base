import { useMemo } from 'react';
import dayjs from 'dayjs';
import {
    useDeliveryNotesQuery,
} from '../useDeliveryNoteHooks';

export interface UseDeliveryNotesLogicProps {
    page: number;
    pageSize: number;
    filters: Record<string, any>;
}

/**
 * Shared logic for Delivery Notes Page
 */
export const useDeliveryNotesLogic = ({ page, pageSize, filters }: UseDeliveryNotesLogicProps) => {
    // 1. Format params for API
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
        if (dayjs.isDayjs(params.exportedAtFrom)) {
            params.exportedAtFrom = params.exportedAtFrom.startOf('day').toISOString();
        }
        if (dayjs.isDayjs(params.exportedAtTo)) {
            params.exportedAtTo = params.exportedAtTo.endOf('day').toISOString();
        }
        return params;
    }, [page, pageSize, filters]);

    // 2. Fetch data
    const { data: listData, isLoading: isDeliveryNoteLoading } = useDeliveryNotesQuery(apiParams);

    return {
        listData,
        isDeliveryNoteLoading,
        isDeliveryNotesLoading: isDeliveryNoteLoading, // alias cho UI
        apiParams
    };
};
