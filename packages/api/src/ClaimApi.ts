import { ApiClient } from "@repo/util"

export type CreateClaimPayload = {
    name: string;
    description?: string;
    relatedProduct?: string;
    relatedOrder: string;
    reasonCode: string;
    solutionCode: string;
    suggest?: string | number | null;
    reasonData: {
        reasonDetail: any[];
    };
    notReceived?: string | number | null;
    ticketType: 'ORDER' | 'ORDER_PRODUCT' | 'SHIPMENT' | 'SHIPMENT_PRODUCT' | string;
};

export const ClaimApi = {
    getClaims: (params: any) => {
        return ApiClient.auth.get(`customer/canines/claims`, { params });
    },
    getClaimStatuses: () => {
        return ApiClient.auth.get(`category/canines/ticket_statuses?size=1000`);
    },
    getSolutions: (ticketTypes: string[] = ['order', 'shipment']) => {
        const params = new URLSearchParams();
        ticketTypes.forEach(type => params.append('ticketTypes', type));
        return ApiClient.auth.get(`category/canines/solutions`, { params });
    },
    getReasons: (ticketType: string) => {
        return ApiClient.auth.get(`category/canines/reasons?size=1000&ticketTypes=${ticketType}`);
    },
    getClaimsByOrder: (orderCode: string) => {
        return ApiClient.auth.get(`customer/canines/claims/orderCode/${orderCode}?page=0&size=10000&sort=createdAt:desc`);
    },
    createClaim: ({ payload, files = [] }: { payload: CreateClaimPayload; files?: File[] }) => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('attachments', file, file.name);
        });
        formData.append('claim', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

        return ApiClient.auth.post(`customer/canines/claims`, formData);
    },
};
