import { useQuery } from '@tanstack/react-query';
import { FaqApi } from '@repo/api';

export const useFaqsQuery = (params: any) => {
    return useQuery({
        queryKey: ['faqs.list', params],
        queryFn: async () => {
            const res = await FaqApi.getFaqs(params);
            return {
                data: res.data as any[],
                total: parseInt(res.headers['x-total-count'] || '0', 10),
            };
        },
    });
};
