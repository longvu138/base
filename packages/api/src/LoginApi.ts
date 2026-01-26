import { ApiClient } from "@repo/util"

export const LoginApi = {
    login: (payload: any) => {
        return ApiClient.noAuth.post(
            `/oauth/token?username=${payload?.username}&password=${payload?.password}&grant_type=${payload?.grant_type}&scope=${payload?.scope}&client_id=${payload?.client_id}`,
            payload
        );
    },
    getProfile: () => {
        return ApiClient.auth.get("/customer/profile");
    },
};
