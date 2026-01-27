import { onLogout } from "../../Common"
import { ApiClient } from "../ApiClient"
import { defaultRequestInterceptors } from "../interceptor"
import { accessTokenRequestInterceptors } from "./interceptor"
import { appConfig } from '@repo/config'

const api = appConfig.apiUrl || `https://poseidon.20p.gobizdev.com/api`
const apiClientAuth = ApiClient.make(api)
console.log("api", api);

apiClientAuth.interceptors.request.use(defaultRequestInterceptors)
apiClientAuth.interceptors.request.use(accessTokenRequestInterceptors)
apiClientAuth.interceptors.response.use(
  function (response) {
    return response
  },
  function (error) {
    if (error?.status === 403 || error?.status === 401) {
      onLogout()
    }
    return Promise.reject(error)
  }
)

export { apiClientAuth }
