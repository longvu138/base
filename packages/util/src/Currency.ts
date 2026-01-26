export const currenciesLocaleMapping: { [k: string]: string } = {
  VND: "vi-VN",
  USD: "en-US",
  CNY: "zh-CN",
  CNH: "zh-CN",
}

export const getCurrencySymbol = (currency?: string) => {
  const tempCurrency = currency ?? "VND"
  const tempLocale = currenciesLocaleMapping[tempCurrency as string] ?? "vi-VN"

  const formatter = new Intl.NumberFormat(tempLocale, {
    style: "currency",
    currency: tempCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  const parts = formatter.formatToParts(1)
  const currencySymbol = parts.find((part) => part.type === "currency")?.value

  return currencySymbol || null
}

export const formatNumberByLocale = (value: number, currency?: string) => {
  const tempCurrency = currency ?? "VND"
  const tempLocale = currenciesLocaleMapping[tempCurrency as string] ?? "vi-VN"
  return new Intl.NumberFormat(tempLocale).format(value)
}
