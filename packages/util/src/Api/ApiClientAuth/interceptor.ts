import { set } from "lodash"
import { LocalStoreUtil } from "../../LocalStore"

// Dùng cái này khi muốn authorization với api
export const accessTokenRequestInterceptors = function (options: any) {
  const accessToken = LocalStoreUtil.getItem("access_token")

  if (accessToken) {
    set(options, ["headers", "Authorization"], `Bearer ${accessToken}`)
  }

  return options
}
