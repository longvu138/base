import { ApiClient } from "@repo/util"

export const DeliveryRequestApi = {
    getDeliveryRequests: (params: any) => {
        return ApiClient.auth.get(`customer/delivery_requests`, { params });
    },
    getDeliveryRequestStatuses: () => {
        return ApiClient.auth.get(`categories/delivery_request_statuses?size=1000&sort=position:asc`);
    },
};
