import { useQuery } from '@tanstack/react-query';
import { AddressApi } from '@repo/api';

export const useAddressesQuery = (params: any) => {
    return useQuery({
        queryKey: ['addresses.list', params],
        queryFn: async () => {
            const res = await AddressApi.getAddresses(params);
            return {
                data: res.data as any[],
                total: parseInt(res.headers['x-total-count'] || '0', 10),
            };
        },
    });
};
