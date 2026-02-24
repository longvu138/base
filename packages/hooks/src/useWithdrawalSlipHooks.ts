import { useQuery } from '@tanstack/react-query';
import { WithdrawalSlipApi } from '@repo/api';

export const useListWithdrawalSlipQuery = (params: any) => {
    return useQuery({
        queryKey: ['withdrawal_slip.list', params],
        queryFn: async () => {
            const res = await WithdrawalSlipApi.getWithdrawalSlips(params);
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

export const useWithdrawalSlipStatusesQuery = () => {
    return useQuery({
        queryKey: ['withdrawal_slip.statuses'],
        queryFn: async () => {
            const res = await WithdrawalSlipApi.getStatuses();
            return res.data;
        },
        staleTime: Infinity,
    });
};

export const useWithdrawalSlipStatisticsQuery = () => {
    return useQuery({
        queryKey: ['withdrawal_slip.statistics'],
        queryFn: async () => {
            const res = await WithdrawalSlipApi.getStatistics();
            return res.data;
        },
        staleTime: 30000,
    });
};

export const useBanksQuery = () => {
    return useQuery({
        queryKey: ['categories.banks'],
        queryFn: async () => {
            const res = await WithdrawalSlipApi.getBanks();
            return res.data;
        },
        staleTime: Infinity,
    });
};
