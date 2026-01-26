export const Marketplace = {
  Tmall: "Tmall",
  Taobao: "Taobao",
  Alibaba: "1688",
  TmallMobile: "Tmall Mobile",
  TaobaoMobile: "Taobao Mobile",
  AlibabaMobile: "1688 Mobile",
} as const

type MarketplaceInfo = {
  marketplace: string
  productID?: string
  originalUrl?: string
}

export function extractValidUrl(text: string): string | null {
  const urlRegex = /(https?:\/\/[^\s]+)/ // Regex tìm URL
  const match = text.match(urlRegex)
  return match ? match[0] : null // Lấy URL đầu tiên tìm thấy
}

function detectMarketplace(url: string): string {
  const { hostname } = new URL(url)

  if (hostname === "qr.1688.com") return Marketplace.AlibabaMobile
  if (hostname === "detail.m.1688.com") return Marketplace.Alibaba
  if (hostname.endsWith(".1688.com")) return Marketplace.Alibaba

  const marketplaces = [
    { name: Marketplace.Tmall, patterns: ["tmall.com"] },
    { name: Marketplace.Taobao, patterns: ["taobao.com"] },
    { name: Marketplace.TmallMobile, patterns: ["m.tb.cn"] },
    { name: Marketplace.TaobaoMobile, patterns: ["e.tb.cn"] },
  ]

  const market = marketplaces.find((m) => m.patterns.some((pattern) => hostname.endsWith(pattern)))

  return market ? market.name : "Unknown"
}

function extractProductId(url: string): string | undefined {
  const { hostname, searchParams, pathname, search } = new URL(url)

  if (hostname.includes("tmall.com") || hostname.includes("taobao.com")) {
    return searchParams.get("id") || undefined
  }

  if (hostname.includes("1688.com")) {
    const match = pathname.match(/\/offer\/(\d+)\.html/) || search.match(/offerId=(\d+)/)
    return match ? match[1] : undefined
  }

  return undefined
}

export function parseMarketplaceUrl(inputText: string): MarketplaceInfo | null {
  const url = extractValidUrl(inputText)

  if (!url) {
    return null
  }

  try {
    const marketplace = detectMarketplace(url)
    if (marketplace.includes("Mobile")) {
      return { marketplace, originalUrl: url }
    }

    return { marketplace, productID: extractProductId(url) }
  } catch (error) {
    console.log(error)
    return null
  }
}
