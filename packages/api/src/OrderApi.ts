import { ApiClient } from "@repo/util"

export const OrderApi = {
    getOrders: (params: any) => {
        return ApiClient.auth.get(`customer/orders`, { params });
    },
    getOrderStatuses: () => {
        return ApiClient.auth.get(`categories/public_order_statuses?size=1000&sort=position:asc`);
    },
    getWarehouse: (delivered: boolean) => {
        return ApiClient.auth.get(
            `categories/warehouses?size=1000${delivered
                ? "&sort=enabled:desc,position:asc&delivered=true&enabled=true"
                : "&sort=enabled:desc,position:asc&received=true&enabled=true"
            }`
        );
    },
    getOrderDetail: (code: string) => {
        return ApiClient.auth.get(`customer/vmt-orders/${code}`);
    },
    getOrderStatistic: () => {
        return ApiClient.auth.get(`customer/orders/statistics`);
    },
    getOrderServices: () => {
        return ApiClient.auth.get(`categories/order_services?size=1000`);
    },
    getMarketplaces: () => {
        return ApiClient.auth.get(`categories/marketplaces?size=1000`);
    },
};
