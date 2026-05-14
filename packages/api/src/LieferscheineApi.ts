import { ApiClient } from "@repo/util";

export const LieferscheineApi = {
  getLieferscheine: (params: any) => {
    return ApiClient.auth.get("customer/lieferscheine", { params });
  },
  getLieferscheinePackages: (code: string) => {
    return ApiClient.auth.get(`customer/lieferscheine/${code}/packages`);
  },
  getLieferscheineDeliveries: (code: string) => {
    return ApiClient.auth.get(`customer/lieferscheine/${code}/deliveries`);
  },
  getCouriers: () => {
    return ApiClient.auth.get("categories/couriers?size=1000");
  },
};
