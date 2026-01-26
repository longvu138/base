import { clsx, type ClassValue } from "clsx"
import bigDecimal from "js-big-decimal"
import { forEach, isEmpty } from "lodash"
import numeral from "numeral"
import { twMerge } from "tailwind-merge"
import { LocalStoreUtil } from "./LocalStore"

export const classMerge = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}
export const formatAmountInput = (value: any) => {
  if (value === null) return ""
  const parts = value.split(".")
  if (parts.length > 2) {
    value = parts[0] + "." + parts.slice(1).join("")
  }
  const [integerPart, decimalPart] = value.split(".")
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  const formattedValue = decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger
  return formattedValue
}
export const convertFixedNumber = (n: number) => {
  return n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)
}

export const bigDecimalFormat = (value: number, decimal = 2, mode: any = bigDecimal.RoundingModes.CEILING) => {
  return Number(bigDecimal.round(value, decimal, mode))
}

export const findLocationWithLevel = (object: any, keyParent: string, key: string) => {
  let r
  if (!isEmpty(object)) {
    if (object?.type === key) {
      return object?.code
    }
    Object.keys(object).some((k) => {
      if (k === keyParent) {
        if (typeof object[k] === "object") {
          r = findLocationWithLevel(object[k], keyParent, key)
          return Boolean(r)
        }
      }
    })
    return r
  }
  return undefined
}

export const renderTitleLocation = (country: string, type: string) => {
  if (country === "VN") {
    switch (type) {
      case "province":
        return {
          title: "Tỉnh/Thành phố",
          placeholder: "Chọn tỉnh/thành phố",
          required: "Tỉnh/Thành phố không được để trống",
        }
      case "district":
        return {
          title: "Quận/Huyện",
          placeholder: "Chọn quận/huyện",
          required: "Quận/Huyện không được bỏ trống",
        }
      case "ward":
        return {
          title: "Phường/Xã",
          placeholder: "Chọn phường/xã",
          required: "Phường/Xã không được bỏ trống",
        }
      default:
        return {
          title: "",
          placeholder: "",
          required: "",
        }
    }
  }
  if (country === "CN") {
    switch (type) {
      case "province":
        return {
          title: "Cấp Tỉnh",
          placeholder: "Chọn địa chỉ cấp tỉnh",
          required: "Cấp tỉnh không được bỏ trống",
        }
      case "district":
        return {
          title: "Cấp Địa Khu",
          placeholder: "Chọn địa chỉ cấp địa khu",
          required: "Cấp địa khu không được bỏ trống",
        }
      case "ward":
        return {
          title: "Cấp Quận/Huyện",
          placeholder: "Chọn địa chỉ cấp quận/huyện",
          required: "Cấp quận/huyện không được bỏ trống",
        }
      case "village":
        return {
          title: "Cấp Hương/Xã",
          placeholder: "Chọn địa chỉ cấp hương/xã",
          required: "Cấp hương/xã không được bỏ trống",
        }
      default:
        return {
          title: "",
          placeholder: "",
          required: "",
        }
    }
  }
}

export const formatPhoneNumber = (phoneNumber: string | number): string => {
  const phoneStr = phoneNumber.toString()

  if (phoneStr.startsWith("+")) {
    return phoneStr.replace(/(\+\d{2})(\d{3})(\d{3})(\d{3})/, "$1 $2 $3 $4")
  }
  return phoneStr.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3")
}

export interface LocationView {
  code: string
  createdAt: string
  createdBy: string
  description: string
  display: string
  id: string
  language: string
  modifiedAt: string
  modifiedBy: string
  name: string
  parent?: LocationView
  position: number
  type: string
}

export const flattenLocation = (location: LocationView) => {
  const result: LocationView[] = []

  const flattenRecursive = (loc: LocationView) => {
    result.push({
      ...loc,
      parent: undefined,
    })

    if (loc?.parent) {
      flattenRecursive(loc?.parent)
    }
  }

  flattenRecursive(location)
  return result.reverse()
}

export const convertStatusToTitle = (status: string) => {
  switch (status) {
    case "NEW,INITIALIZE":
      return "Chờ thanh toán"
    case "DEPOSITED,ACCEPTED,PURCHASING,PROCESSING,PENDING":
      return "Đã thanh toán"
    case "PURCHASED,MERCHANT_DELIVERING,PUTAWAY,TRANSPORTING,READY_FOR_DELIVERY":
      return "Chờ shop giao"
    case "DELIVERING,MIA":
      return "Đang giao"
    case "DELIVERED":
      return "Đã nhận hàng"
    case "DELIVERY_CANCELLED":
      return "Khách không nhận"
    case "CANCELLED,OUT_OF_STOCK":
      return "Huỷ bỏ"
    default:
      return ""
  }
}

export const convertNumber = (num: number) => {
  const numRound = Math.round(num)

  if (numRound >= 1_000_000_000) return (numRound / 1_000_000_000).toFixed(numRound % 1_000_000_000 === 0 ? 0 : 1) + "B"
  if (numRound >= 1_000_000) return (numRound / 1_000_000).toFixed(numRound % 1_000_000 === 0 ? 0 : 1) + "M"
  if (numRound >= 1_000) return (numRound / 1_000).toFixed(numRound % 1_000 === 0 ? 0 : 1) + "K"

  return numRound.toString()
}

export const removeVietnameseAccents = (str: string | any) => {
  if (!str) return ""
  str = str.toLowerCase()
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i")
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
  str = str.replace(/đ/g, "d")

  return str.replace(/\s+/g, "-")
}

export const formatNumber = (n: number, noFixed?: boolean) => {
  const bigDecimalNumber = noFixed ? n?.toString() : n.toFixed(2)
  return bigDecimalNumber?.replace(".", ",")?.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

export const mappingIconClaims: any = {
  faulty_product: "/box.png",
  not_received: "/bed.png",
}

export const buildTreeFormCategoryData = (data: any[]) => {
  const tree: any[] = []
  const lookup: any = {}

  forEach(data, (item) => {
    lookup[item.id] = { ...item, children: [] }
  })

  forEach(data, (item: any) => {
    if (item?.parent?.id) {
      if (lookup[item?.parent?.id]) {
        lookup[item?.parent?.id]?.children.push(lookup?.[item?.id])
      }
    } else {
      tree.push(lookup?.[item?.id])
    }
  })

  return tree
}

export const findChildCategoryByCode = (tree: any[], code: string): any => {
  for (const node of tree) {
    if (node?.code === code) {
      return node
    }
    if (!isEmpty(node?.children)) {
      const found = findChildCategoryByCode(node?.children, code)
      if (found) {
        return found
      }
    }
  }
  return null
}
export const peerPaymentType: any = {
  payment: "Uỷ quyền thanh toán",
  transfer: "Chuyển khoản",
  payment_wechat: "Wechat",
  payment_ali_vn: "Alipay VN",
  payment_ali_cn: "Alipay CN",
}
export const peerPaymentMethod: any = {
  bank_transfer: "Chuyển vào tài khoản ngân hàng",
  alipay: "Chuyển vào tài khoản Alipay",
}

export const formatFileName = (fileName: string, maxLength: number) => {
  if (!fileName) return ""
  if (fileName.length <= maxLength) return fileName
  else {
    const endFile = fileName.substring(fileName.lastIndexOf("."), fileName.length)
    const temp = maxLength - endFile.length
    if (temp > 3) {
      const startFile = fileName.substring(0, temp - 3)
      return startFile + "..." + endFile
    } else {
      const startFile = fileName.substring(0, temp)
      return startFile + endFile
    }
  }
}

export const onLogout = () => {
  LocalStoreUtil.removeItem("accessToken")
  window.location.href = "/login"
}

export const moneyCeil = (value: number) => {
  if (typeof value === "number") {
    return Math.ceil(value)
  }
  return value
}

export const quantityFormat = (value: unknown, noNegative = undefined) => {
  if (value === null || value === undefined || value === "") return "---"
  //loại bỏ tất cả các ký tự ',' trong value
  const temp = value.toString().replace(/[,-]/g, "")
  const result = `${numeral(parseFloat(temp)).format("0,0.[0000]")}`
  if (noNegative) {
    result.replace("-", "")
  }
  return result
}
