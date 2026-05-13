import { ApiClient } from "@repo/util"

export const VoucherApi = {
    getVouchers: (params: any) =>
        ApiClient.auth.get(`customer/customer_coupon`, { params }),
    checkVoucher: (data: { code?: string; orderCode?: string; isShipment?: boolean }) =>
        ApiClient.auth.post(`customer/customer_coupon/check`, data),
};
