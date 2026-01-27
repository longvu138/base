import { appConfig } from "@repo/config"
import { ApiClient } from "../ApiClient"
import { defaultRequestInterceptors } from "../interceptor"

const api = appConfig.apiUrl || `https://poseidon.20p.gobizdev.com/api`
const apiClientNoAuth = ApiClient.make(api)
console.log("api", api);

apiClientNoAuth.interceptors.request.use(defaultRequestInterceptors)

export { apiClientNoAuth }
