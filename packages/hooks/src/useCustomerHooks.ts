import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomerApi } from '@repo/api';

export const useCustomerProfile = () => {
    return useQuery({
        queryKey: ['customer.profile'],
        queryFn: async () => {
            const res = await CustomerApi.getProfile();
            return res.data;
        },
        enabled: !!localStorage.getItem('access_token'),
    });
};

export const useUpdateCustomerProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: any) => {
            const res = await CustomerApi.updateProfile(payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer.profile'] });
        },
    });
};

export const useCustomerBalance = () => {
    return useQuery({
        queryKey: ['customer.balance'],
        queryFn: async () => {
            const res = await CustomerApi.getBalance();
            return res.data;
        },
        enabled: !!localStorage.getItem('access_token'),
        refetchInterval: 60000, // Refetch balance every minute
    });
};
