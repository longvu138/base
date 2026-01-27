import { onLogout } from "../../Common"
import { ApiClient } from "../ApiClient"
import { defaultRequestInterceptors } from "../interceptor"
import { accessTokenRequestInterceptors } from "./interceptor"
import { appConfig } from '@repo/config'

const apiClientAuth = ApiClient.make(appConfig.apiUrl)
console.log("appConfig.apiUrl", appConfig.apiUrl);

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
