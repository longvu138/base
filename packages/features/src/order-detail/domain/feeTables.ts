import { moneyFormat, quantityFormat } from "@repo/util";

export type FeeTableRange = {
  key: string;
  from: number | null;
  to: number | null;
  value: any;
  empty: boolean;
};

export type FeeTableLabels = {
  emptyOrderValue: string;
  emptyQuantity: string;
  emptyUnitPrice: string;
  from: string;
  to: string;
};

export const emptyFeeValue = "---";

export const displayFeeValue = (value: any) =>
  value === null || value === undefined || value === ""
    ? emptyFeeValue
    : String(value);

export const quantityFeeValue = (value: any) => {
  if (value === null || value === undefined || value === "") {
    return emptyFeeValue;
  }
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return String(value);
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(
    numericValue,
  );
};

export const inputQuantityFeeValue = (value: any) =>
  value === null || value === undefined ? emptyFeeValue : quantityFormat(value, true);

const numericSort = (left: any, right: any) => Number(left) - Number(right);

export const buildRanges = (
  data: Record<string, any>,
  emptyKey: string,
): FeeTableRange[] =>
  Object.keys(data || {})
    .sort(numericSort)
    .map((key, index, keys) => {
      if (key === emptyKey) {
        return { key, from: null, to: null, value: data[key], empty: true };
      }

      const nextKey = keys[index + 1];
      return {
        key,
        from: Number(key),
        to:
          nextKey && nextKey !== emptyKey
            ? Number(nextKey)
            : index === keys.length - 1
              ? null
              : Number(key),
        value: data[key],
        empty: false,
      };
    });

export const rangeText = (
  range: FeeTableRange,
  {
    emptyText,
    moneyUnit,
  }: {
    emptyText: string;
    moneyUnit?: string;
  },
) => {
  if (range.empty) return emptyText;
  const formatValue = (value: any) => {
    const formattedValue = moneyUnit
      ? moneyFormat(value, moneyUnit)
      : quantityFeeValue(value);
    return String(formattedValue).replace(/\+/g, "");
  };

  if (range.to === null || range.to === undefined) {
    return `Từ ${formatValue(range.from)}`;
  }

  return `Từ ${formatValue(range.from)} đến dưới ${formatValue(range.to)}`;
};

export const normalizeFeeTableRows = (data: any) => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];

  if (Array.isArray(data.ranges)) return data.ranges;
  if (Array.isArray(data.rows)) return data.rows;
  if (Array.isArray(data.table)) return data.table;

  const rangeKeys = Object.keys(data).filter(
    (key) => typeof data[key] === "object",
  );
  return rangeKeys.map((key) => ({ range: key, ...data[key] }));
};

export const asArray = (value: any): any[] => (Array.isArray(value) ? value : []);

export const getFeeConfigTableData = (feeConfig: any, order: any) => {
  const metadata = feeConfig?.feeMetadata || {};
  const marketplaceData = metadata.dataWithMarketPlace?.find(
    (item: any) => item.marketplace === order?.marketplace?.code,
  )?.data;

  return {
    metadata,
    template: metadata.template,
    data: marketplaceData || metadata.data || {},
  };
};

export const buildPercentageFeeRows = (
  data: Record<string, any>,
  labels: Pick<FeeTableLabels, "emptyOrderValue">,
) =>
  buildRanges(data, "empty_order").map((range) => ({
    key: range.key,
    orderValue: rangeText(range, {
      emptyText: labels.emptyOrderValue,
      moneyUnit: "VND",
    }),
    fee: range.value,
  }));

export const buildInspectionFeeTable = (
  data: Record<string, any>,
  labels: Pick<FeeTableLabels, "emptyQuantity" | "emptyUnitPrice">,
) => {
  const priceRanges = buildRanges(data, "empty_price");
  const quantityRanges = priceRanges.reduce<FeeTableRange[]>((result, range) => {
    Object.keys(range.value || {}).forEach((key) => {
      if (!result.some((item) => item.key === key)) {
        result.push(buildRanges({ [key]: null }, "empty_quantity")[0]);
      }
    });
    return result;
  }, []);

  const rows = quantityRanges.map((quantityRange) => ({
    key: quantityRange.key,
    quantity: rangeText(quantityRange, {
      emptyText: labels.emptyQuantity,
    }),
    ...priceRanges.reduce((result: Record<string, any>, priceRange) => {
      result[priceRange.key] = priceRange.value?.[quantityRange.key];
      return result;
    }, {}),
  }));

  return { priceRanges, rows };
};

export const getShippingFees = (feeConfig: any, data: any) => {
  if (asArray(feeConfig?.shippingFees).length > 0) {
    return asArray(feeConfig.shippingFees);
  }
  if (asArray(data?.shippingFees).length > 0) {
    return asArray(data.shippingFees);
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [];
};

export const getLocationCode = (item: any) =>
  displayFeeValue(item.location?.code ?? item.locationCode ?? item.code);

export const getLocationName = (location: any) =>
  displayFeeValue(location.display ?? location.name ?? location.code);

export const getLocationFromShippingFee = (item: any) => {
  if (item.location && typeof item.location === "object") return item.location;
  return {
    code: item.locationCode ?? item.location ?? item.code,
    display: item.locationName ?? item.name,
  };
};

export const getWeightKey = (item: any) =>
  `${displayFeeValue(item.minWeight)}-${displayFeeValue(item.maxWeight)}`;

export const buildShippingFeeTable = (shippingFees: any[]) => {
  const locations = shippingFees.reduce<any[]>((result, item) => {
    const location = getLocationFromShippingFee(item);
    const code = displayFeeValue(location.code);
    if (!result.some((locationItem) => displayFeeValue(locationItem.code) === code)) {
      result.push(location);
    }
    return result;
  }, []);
  const firstLocationCode = displayFeeValue(locations[0]?.code);
  const weights = shippingFees
    .filter((item) => getLocationCode(item) === firstLocationCode)
    .sort(
      (left, right) =>
        Number(left.minWeight ?? 0) - Number(right.minWeight ?? 0),
    );

  return {
    tableLocations:
      locations.length > 0 ? locations : [{ code: "newLocation" }],
    tableWeights:
      weights.length > 0
        ? weights
        : [
            {
              minWeight: undefined,
              maxWeight: undefined,
              price: null,
              priceFormula: null,
            },
          ],
  };
};

