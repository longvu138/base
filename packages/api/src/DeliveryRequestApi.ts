import { ApiClient } from "@repo/util"

export const DeliveryRequestApi = {
    getAvailableOrders: () => {
        return ApiClient.auth.get(`customer/delivery_requests/available_orders?size=9999`);
    },
    getShippingMethods: () => {
        return ApiClient.auth.get(`categories/shipping_methods`);
    },
    createDeliveryRequest: (data: any) => {
        return ApiClient.auth.post(`customer/delivery_requests`, data);
    },
    getDeliveryRequests: (params: any) => {
        return ApiClient.auth.get(`customer/delivery_requests`, { params });
    },
    getDeliveryRequestStatuses: () => {
        return ApiClient.auth.get(`categories/delivery_request_statuses?size=1000&sort=position:asc`);
    },
};
