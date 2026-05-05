import { ApiClient } from "@repo/util"

export const AddressApi = {
    getAddresses: (params: any) =>
        ApiClient.auth.get(`customer/addresses`, { params }),
    getLocations: (params: any) =>
        ApiClient.auth.get(`locations`, { params }),
    createAddress: (data: any) =>
        ApiClient.auth.post(`customer/addresses`, data),
    updateAddress: (id: number, data: any) =>
        ApiClient.auth.put(`customer/addresses/${id}`, data),
    deleteAddress: (id: number) =>
        ApiClient.auth.delete(`customer/addresses/${id}`),
};
