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

export const useLocationsQuery = (params: any) => {
    return useQuery({
        queryKey: ['locations.list', params],
        queryFn: async () => {
            const res = await AddressApi.getLocations(params);
            return res.data as any[];
        },
        enabled: !!params?.parent || params?.allCountries === true,
    });
};

import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateAddressMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => AddressApi.createAddress(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses.list'] });
        },
    });
};

export const useUpdateAddressMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => AddressApi.updateAddress(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses.list'] });
        },
    });
};

export const useDeleteAddressMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => AddressApi.deleteAddress(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses.list'] });
        },
    });
};
