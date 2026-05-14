import { ApiClient } from "@repo/util"

export const PackageApi = {
    getPackages: (params: any) => {
        return ApiClient.auth.get(`customer/packages`, { params });
    },
    exportPackages: (params: any, data: any) => {
        return ApiClient.auth.post(`customer/packages/export_excel`, data, {
            params,
            responseType: "blob",
        });
    },
    getPackageStatuses: () => {
        return ApiClient.auth.get(`categories/public_package_statuses?size=1000&sort=position:asc`);
    },
    getParcelStatuses: () => {
        return ApiClient.auth.get(`categories/public_parcel_statuses?sort=position:asc`);
    },
    getParcelMilestones: (parcelCode: string) => {
        return ApiClient.auth.get(`customer/parcels/${parcelCode}/milestones`);
    },
    getPackageMilestones: (packageCode: string) => {
        return ApiClient.auth.get(`customer/packages/${packageCode}/milestones`);
    },
    getPackageIOHistories: (packageCode: string) => {
        return ApiClient.auth.get(`customer/packages/${packageCode}/io-histories?sort=createdAt:desc`);
    },
};
