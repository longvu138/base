import { useQuery } from '@tanstack/react-query';
import { DeliveryNoteApi } from '@repo/api';

export const useDeliveryNotesQuery = (params: any) => {
    return useQuery({
        queryKey: ['delivery_notes.list', params],
        queryFn: async () => {
            const res = await DeliveryNoteApi.getDeliveryNotes(params);
            return {
                data: res.data,
                total: parseInt(res.headers['x-total-count'] || '0', 10),
                pageSize: parseInt(res.headers['x-page-size'] || '0', 10),
                current: parseInt(res.headers['x-page-number'] || '0', 10),
                totalPage: parseInt(res.headers['x-page-count'] || '0', 10),
            };
        },
        enabled: !!params,
    });
};
