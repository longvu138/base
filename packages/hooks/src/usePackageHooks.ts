import { useQuery } from '@tanstack/react-query';
import { PackageApi } from '@repo/api';

export const usePackagesQuery = (params: any) => {
    return useQuery({
        queryKey: ['packages.list', params],
        queryFn: async () => {
            const res = await PackageApi.getPackages(params);
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

export const usePackageStatusesQuery = () => {
    return useQuery({
        queryKey: ['packages.statuses'],
        queryFn: async () => {
            const res = await PackageApi.getPackageStatuses();
            return res.data;
        },
    });
};

export const useParcelStatusesQuery = () => {
    return useQuery({
        queryKey: ['parcels.statuses'],
        queryFn: async () => {
            const res = await PackageApi.getParcelStatuses();
            return res.data;
        },
    });
};

export const useParcelMilestonesQuery = (parcelCode: string) => {
    return useQuery({
        queryKey: ['parcels.milestones', parcelCode],
        queryFn: async () => {
            const res = await PackageApi.getParcelMilestones(parcelCode);
            return res.data;
        },
        enabled: !!parcelCode,
    });
};
