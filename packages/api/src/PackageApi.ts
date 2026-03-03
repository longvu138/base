import { ApiClient } from "@repo/util"

export const PackageApi = {
    getPackages: (params: any) => {
        return ApiClient.auth.get(`customer/packages`, { params });
    },
    getPackageStatuses: () => {
        return ApiClient.auth.get(`categories/public_package_statuses?size=1000&sort=position:asc`);
    },
    getParcelStatuses: () => {
        return ApiClient.auth.get(`categories/public_parcel_statuses?size=1000&sort=position:asc`);
    },
    getParcelMilestones: (parcelCode: string) => {
        return ApiClient.auth.get(`customer/parcels/${parcelCode}/milestones`);
    },
};
