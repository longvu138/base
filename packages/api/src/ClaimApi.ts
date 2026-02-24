import { ApiClient } from "@repo/util"

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
};
