import { apiClientAuth } from "./ApiClientAuth"
import { apiClientNoAuth } from "./ApiClientNoAuth"

export const ApiClient = {
  auth: apiClientAuth,
  noAuth: apiClientNoAuth
}
