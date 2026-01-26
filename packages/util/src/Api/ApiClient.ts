import axios from "axios"

export class ApiClient {
  static make(baseURL: string) {
    const instance = axios.create()
    instance.defaults.baseURL = baseURL
    instance.defaults.timeout = 30000
    return instance
  }

  static makeDefault(baseURL: string) {
    const instance = axios.create()
    instance.defaults.baseURL = baseURL
    instance.defaults.timeout = 30000
    return instance
  }
}
