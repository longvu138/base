import { appConfig } from "@repo/config"
import { set } from "lodash"

export const defaultRequestInterceptors = function (options: any) {
  set(options, ["headers", "X-tenant"], appConfig.tenant)
  return options
}
