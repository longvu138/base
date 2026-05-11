import { appConfig } from "@repo/config"
import { ApiClient } from "../ApiClient"
import { defaultRequestInterceptors } from "../interceptor"

const apiClientNoAuth = ApiClient.make(appConfig.apiUrl)
console.log("apiClientNoAuth", appConfig.apiUrl);

apiClientNoAuth.interceptors.request.use(defaultRequestInterceptors)

export { apiClientNoAuth }
