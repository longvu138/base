import { removeCookie, setCookie, setCookieJson } from "./Cookie"
import { LocalStoreUtil } from "./LocalStore"

const isLogged = () => {
  const accessToken = LocalStoreUtil.getItem("accessToken")
  return Boolean(accessToken)
}

const user = () => {
  return LocalStoreUtil.getJson("loggedUser")
}

const setUser = (_user: any) => {
  LocalStoreUtil.setJson("loggedUser", _user)
  setCookieJson("loggedUser", _user, 30)
}

const getAccessToken = () => {
  return LocalStoreUtil.getItem("accessToken")
}

const setAccessToken = (accessToken?: string) => {
  if (accessToken) {
    LocalStoreUtil.setItem("accessToken", accessToken)
    setCookie("accessToken", accessToken, 30)
  }
}

const getRefreshToken = () => {
  return LocalStoreUtil.getItem("idRefreshToken")
}

const setRefreshToken = (refreshToken?: string) => {
  if (refreshToken) {
    LocalStoreUtil.setItem("idRefreshToken", refreshToken)
  }
}

const logout = () => {
  LocalStoreUtil.removeItem("accessToken")
  LocalStoreUtil.removeItem("loggedUser")
  LocalStoreUtil.removeItem("idRefreshToken")
  LocalStoreUtil.removeItem("urlRedirectLogin")
  removeCookie("accessToken")
  LocalStoreUtil.removeItem("permissions")
}

const getUserPermission = () => {
  return LocalStoreUtil.getJson("permissions")
}

export const AuthClient = {
  isLogged,
  user,
  setUser,
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  logout,
  getUserPermission,
}
