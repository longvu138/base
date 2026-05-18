export const getName = (sku: any, showTranslatedNames: boolean) =>
  (showTranslatedNames
    ? sku?.product?.name || sku?.productName || sku?.name || sku?.title
    : sku?.product?.originalName ||
      sku?.originalName ||
      sku?.product?.name ||
      sku?.productName ||
      sku?.name ||
      sku?.title) || "Sản phẩm";

export const getImage = (sku: any) =>
  sku?.image ||
  sku?.variantImage ||
  sku?.skuImageUrl ||
  sku?.product?.image ||
  sku?.productImage ||
  sku?.imageUrl ||
  sku?.product?.images?.[0] ||
  sku?.product?.productImages?.[0];

export const getProductUrl = (sku: any) =>
  sku?.product?.url || sku?.productUrl || sku?.url;

export const getProperties = (sku: any, showTranslatedNames: boolean) =>
  Array.isArray(sku?.variantProperties)
    ? sku.variantProperties
        .map((property: any) =>
          showTranslatedNames
            ? property?.value || property?.originalValue
            : property?.originalValue || property?.value,
        )
        .filter(Boolean)
        .join(" / ")
    : "";

export const getUnitPrice = (sku: any) =>
  Number(
    sku?.exchangedSalePrice ??
      sku?.salePrice ??
      sku?.price ??
      sku?.product?.exchangedSalePrice ??
      sku?.product?.salePrice ??
      0,
  );

export const getEffectiveUnitPrice = (sku: any) =>
  Number(
    (sku?.bargainPrice !== null && sku?.bargainPrice !== undefined
      ? sku?.exchangedBargainPrice
      : undefined) ?? getUnitPrice(sku),
  );

export const getForeignCurrency = (sku: any) =>
  sku?.currency?.code ||
  sku?.currencyCode ||
  sku?.currency ||
  sku?.cartGroupCurrency ||
  "CNY";

export const getForeignSalePrice = (sku: any) =>
  Number(sku?.salePrice ?? sku?.product?.salePrice ?? 0);

export const getForeignBargainPrice = (sku: any) =>
  Number(sku?.bargainPrice ?? 0);

export const getExchangeRate = (group: any, exchangeRates: any[]) => {
  const currency = group?.marketplace?.currency;
  if (!currency || !Array.isArray(exchangeRates)) return null;
  return exchangeRates.find((item: any) => item.code === `${currency}/VND`);
};

export const QUANTITY_WARNING_MESSAGE =
  "Chúng tôi sẽ cố gắng mua đủ số lượng sản phẩm quý khách yêu cầu, tuy nhiên việc này không được đảm bảo.";

const getNumberValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const getMinQuantity = (sku: any) =>
  getNumberValue(
    sku?.product?.minQuantity ?? sku?.minQuantity ?? sku?.minOrderQuantity,
  );

const getRequiredSkuMinQuantity = (
  sku: any,
  quantityResolver: (item: any) => number = (item) =>
    Number(item?.quantity || 0),
) => {
  const productMinQuantity = getMinQuantity(sku);
  if (productMinQuantity === null) return null;

  const siblingQuantity = Array.isArray(sku?.product?.skus)
    ? sku.product.skus
        .filter((item: any) => String(item.id) !== String(sku.id))
        .reduce((sum: number, item: any) => sum + quantityResolver(item), 0)
    : 0;

  return productMinQuantity - siblingQuantity;
};

export const getQuantityWarnings = (
  sku: any,
  quantityResolver: (item: any) => number = (item) =>
    Number(item?.quantity || 0),
) => {
  const quantity = quantityResolver(sku);
  const batchSize = getNumberValue(sku?.product?.batchSize ?? sku?.batchSize);
  const stock = getNumberValue(sku?.stock ?? sku?.product?.stock);
  const requiredMinQuantity = getRequiredSkuMinQuantity(sku, quantityResolver);

  return {
    productMinQuantity: getMinQuantity(sku),
    batchSize,
    isBelowMin: requiredMinQuantity !== null && quantity < requiredMinQuantity,
    isAboveStock: stock !== null && quantity > stock,
    isWrongMultiple:
      batchSize !== null && batchSize > 1 && quantity % batchSize !== 0,
  };
};

const hasQuantityBannerWarning = (sku: any) => {
  const warnings = getQuantityWarnings(sku);
  return warnings.isAboveStock || warnings.isBelowMin;
};

export const getCartTableRows = (skus: any[]) =>
  skus.flatMap((sku: any) =>
    hasQuantityBannerWarning(sku)
      ? [
          {
            __rowType: "quantityWarning",
            id: `quantity-warning-${sku.id}`,
            skuId: sku.id,
          },
          sku,
        ]
      : [sku],
  );

export const sameCodes = (left: string[] = [], right: string[] = []) =>
  left.slice().sort().join(",") === right.slice().sort().join(",");
