export class LocalStoreUtil {
  static getItem = (key: string) => {
    if (typeof window === "undefined") return
    return localStorage.getItem(key)
  }

  static setItem = (key: string, value: any) => {
    if (typeof window === "undefined") return

    localStorage.setItem(key, value)
  }

  static removeItem = (key: string) => {
    if (typeof window === "undefined") return

    localStorage.removeItem(key)
  }

  static getJson = (key: string) => {
    if (typeof window === "undefined") return

    const value = LocalStoreUtil.getItem(key)
    try {
      return value ? JSON.parse(value) : null
    } catch {
      return null
    }
  }

  static setJson = (key: string, value: any) => {
    if (typeof window === "undefined") return

    LocalStoreUtil.setItem(key, JSON.stringify(value))
  }
}