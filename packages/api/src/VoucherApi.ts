import { ApiClient } from "@repo/util"

export const VoucherApi = {
    getVouchers: (params: any) =>
        ApiClient.auth.get(`customer/customer_coupon`, { params }),
};
