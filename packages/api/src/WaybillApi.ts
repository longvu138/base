import { ApiClient } from "@repo/util"

export const WaybillApi = {
    getWaybills: (params: any) => {
        return ApiClient.auth.get(`customer/customer_waybills`, { params });
    },
    getWaybillStatuses: () => {
        return ApiClient.auth.get(`categories/customer_waybill_status?size=1000&sort=position:asc`);
    },
};
