import { ApiClient } from "@repo/util"

export const ShipmentApi = {
    getShipments: (params: any) => {
        return ApiClient.auth.get(`customer/shipments`, { params });
    },
    getShipmentStatuses: () => {
        return ApiClient.auth.get(`categories/public_shipment_statuses?size=1000&sort=position:asc`);
    },
    getShipmentStatistic: () => {
        return ApiClient.auth.get(`customer/shipments/statistics`);
    },
};
