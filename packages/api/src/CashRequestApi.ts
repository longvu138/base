import axios from "axios";
import { appConfig, LocalStoreUtil } from "@repo/util";

const trimTrailingSlash = (value?: string) => (value || "").replace(/\/+$/, "");

const cashRequestClient = axios.create({
  baseURL: `${trimTrailingSlash(appConfig.appM2)}/api/`,
  timeout: 30000,
});

cashRequestClient.interceptors.request.use((config) => {
  const accessToken = LocalStoreUtil.getItem("access_token");

  config.headers.set("X-tenant", appConfig.tenant);
  config.headers.set("X-Realm", "M1");

  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return config;
});

export const CashRequestApi = {
  getCashRequests: (params: any) =>
    cashRequestClient.get("tasks/created", { params }),
  getCashRequestsCount: (params: any) =>
    cashRequestClient.head("tasks/created", { params }),
  createCashRequest: (data: any) => cashRequestClient.post("tasks", data),
  cancelCashRequest: (id: string | number) =>
    cashRequestClient.post(`tasks/${id}/cancel`, {}),
};
