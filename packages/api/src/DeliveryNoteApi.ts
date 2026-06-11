import { ApiClient } from "@repo/util"

export const DeliveryNoteApi = {
    getDeliveryNotes: (params: any) => {
        return ApiClient.auth.get(`customer/delivery_notes`, { params });
    },
};
