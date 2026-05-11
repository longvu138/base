import { ApiClient } from "@repo/util"

export const TenantApi = {
    getCurrentTenant: () => {
        return ApiClient.noAuth.get('/tenants/current');
    },
};
