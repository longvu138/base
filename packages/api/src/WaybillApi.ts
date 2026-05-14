import { ApiClient } from "@repo/util"

export const WaybillApi = {
    getWaybills: (params: any) => {
        return ApiClient.auth.get(`customer/customer_waybills`, { params });
    },
    getWaybillStatuses: () => {
        return ApiClient.auth.get(`categories/customer_waybill_status?size=1000&sort=position:asc`);
    },
    createWaybills: (data: any) => {
        return ApiClient.auth.post(`customer/customer_waybills/add_batch`, data);
    },
    updateWaybill: (id: string | number, data: any) => {
        return ApiClient.auth.patch(`customer/customer_waybills/${id}`, data);
    },
    deleteWaybill: (code: string) => {
        return ApiClient.auth.delete(`customer/customer_waybills/${code}`);
    },
    exportWaybills: (params: any, data: any) => {
        return ApiClient.auth.post(`customer/customer_waybills/export_excel`, data, {
            params,
            responseType: "blob",
        });
    },
};
