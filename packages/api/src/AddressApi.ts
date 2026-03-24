import { ApiClient } from "@repo/util"

export const AddressApi = {
    getAddresses: (params: any) =>
        ApiClient.auth.get(`customer/addresses`, { params }),
};
