import { useMutation, useQuery } from '@tanstack/react-query';
import { VoucherApi } from '@repo/api';

export const useVouchersQuery = (params: any) => {
    return useQuery({
        queryKey: ['vouchers.list', params],
        queryFn: async () => {
            const res = await VoucherApi.getVouchers(params);
            return {
                data: res.data as any[],
                total: parseInt(res.headers['x-total-count'] || '0', 10),
            };
        },
    });
};

export const useCheckVoucherMutation = () => {
    return useMutation({
        mutationFn: async (data: { code?: string; orderCode?: string; isShipment?: boolean }) => {
            const res = await VoucherApi.checkVoucher(data);
            return res.data;
        },
    });
};
