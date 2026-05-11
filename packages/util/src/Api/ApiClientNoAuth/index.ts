import { appConfig } from "@repo/config"
import { ApiClient } from "../ApiClient"
import { defaultRequestInterceptors } from "../interceptor"

const apiClientNoAuth = ApiClient.make(appConfig.baseUrl)

apiClientNoAuth.interceptors.request.use(defaultRequestInterceptors)

export { apiClientNoAuth }
