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
        return ApiClient.auth.get(`customer/orders/${code}`);
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
    getOrderComments: (code: string) => {
        return ApiClient.auth.get(`customer/orders/${code}/comments`);
    },
    createOrderComment: (code: string, data: { content: string }) => {
        return ApiClient.auth.post(`customer/orders/${code}/comments`, data);
    },
    patchOrder: (code: string, data: any) => {
        return ApiClient.auth.patch(`customer/orders/${code}`, data);
    },
    cancelOrder: (code: string) => {
        return ApiClient.auth.post(`customer/orders/${code}/cancel`);
    },
    reorderProductsToCart: (code: string) => {
        return ApiClient.auth.post(`customer/orders/${code}/products/cart`);
    },
    getOrderProducts: (code: string) => {
        return ApiClient.auth.get(`customer/orders/${code}/products?size=6969`);
    },
    exportOrderProducts: (code: string, data: { secret?: string }) => {
        return ApiClient.auth.post(`customer/orders/${code}/products/export_excel`, data, {
            responseType: 'blob',
        });
    },
    getOrderPackages: (code: string) => {
        return ApiClient.auth.get(`customer/orders/${code}/packages?size=10000&sort=createdAt:DESC`);
    },
    getOrderFinancials: (code: string) => {
        return ApiClient.auth.get(`customer/orders/${code}/financial`);
    },
    getOrderLogs: (code: string, page = 0) => {
        return ApiClient.auth.get(`customer/orders/${code}/logs?sort=timestamp:desc&page=${page}&size=25`);
    },
    getOrderMilestones: (code: string) => {
        return ApiClient.auth.get(`customer/orders/${code}/milestones?sort=timestamp:ASC`);
    },
    getOrderFees: (code: string) => {
        return ApiClient.auth.get(`customer/orders/${code}/fees`);
    },
    getOrderCoupons: (code: string) => {
        return ApiClient.auth.get(`customer/orders/${code}/coupons`);
    },
    getOrderFeesConfigGroup: (configGroupId: string | number) => {
        return ApiClient.auth.get(`categories/fees`, {
            params: {
                configGroupId,
            },
        });
    },
    exportOrders: (params: any, data: { secret?: string }) => {
        return ApiClient.auth.post(`customer/orders/export_excel`, data, {
            params,
            responseType: 'blob',
        });
    },
};
