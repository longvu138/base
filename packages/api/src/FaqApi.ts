import { ApiClient } from "@repo/util"

export const FaqApi = {
    getFaqs: (params: any) =>
        ApiClient.auth.get(`faqs`, { params }),
};
