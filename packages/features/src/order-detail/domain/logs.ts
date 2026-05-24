import { moneyFormat, quantityFormat } from "@repo/util";

export type OrderLogContent = Record<string, any> & {
  fullname: string;
  property: string;
  role?: string;
  storageDescription?: string;
  timestamp?: string;
};

export type OrderLogTranslator = (key: string, options?: any) => string;

export const emptyLogValue = "---";

export const displayLogValue = (value: any) => {
  if (value === null || value === undefined || value === "")
    return emptyLogValue;
  return String(value);
};

const quantity = (value: any) => {
  if (value === null || value === undefined || value === "")
    return emptyLogValue;
  return Number(value).toLocaleString("vi-VN");
};

const money = (value: any, currency?: any) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    Number.isNaN(Number(value))
  ) {
    return emptyLogValue;
  }

  return moneyFormat(value, currency);
};

export const formatTransactionAmount = (activity: string, amount: any) => {
  const formattedAmount = money(amount);
  return activity === "emd"
    ? formattedAmount.toString().replace("-", "")
    : formattedAmount;
};

export const formatChangedValue = (value: any) => {
  if (value === null || value === undefined || value === "")
    return emptyLogValue;
  if (typeof value === "object") {
    return value.name || value.code || value.display || JSON.stringify(value);
  }
  return value;
};

export const packageUpdateUnit = (property?: string) => {
  if (property === "volumetric") return " cm3";
  if (
    property === "netWeight" ||
    property === "dimensionalWeight" ||
    property === "packagingWeight" ||
    property === "actualWeight"
  ) {
    return " kg";
  }
  if (property === "length" || property === "width" || property === "height") {
    return " cm";
  }
  return "";
};

export const packageStatusName = (value: any, packageStatuses: any[] = []) => {
  if (!value) return emptyLogValue;
  if (value.name) return value.name;

  const code = value.code || value;
  return (
    packageStatuses.find((status: any) => status.code === code)?.name ||
    formatChangedValue(value)
  );
};

export const formatPackageChangedValue = (
  property: string,
  value: any,
  packageStatuses: any[] = [],
) => {
  if (property === "status") return packageStatusName(value, packageStatuses);
  if (value === null || value === undefined || value === "")
    return emptyLogValue;

  const unit = packageUpdateUnit(property);
  if (
    unit &&
    (typeof value === "number" ||
      (typeof value === "string" && value.trim() !== "")) &&
    !Number.isNaN(Number(value))
  ) {
    return `${quantityFormat(value)}${unit}`;
  }

  return formatChangedValue(value);
};

export const orderLogRoleLabelKey = (role?: string) =>
  role === "STAFF" ? "shipment_log.staff" : "shipment_log.customer";

export const parseLogItem = (
  item: any,
  order: any,
  t: OrderLogTranslator,
  packageStatuses: any[] = [],
): OrderLogContent[] => {
  const base = {
    fullname: item?.actor?.fullname || emptyLogValue,
    role: item?.role,
    timestamp: item?.timestamp || emptyLogValue,
  };
  const data = item?.data;
  const reference = item?.reference || {};
  const orderCurrency = order?.marketplace?.currency || "¥";

  switch (item?.activity) {
    case "ORDER_CREATE":
    case "ORDER_RECEIPT_CREATE":
    case "ORDER_RECEIPT_DELETE":
      return [
        {
          ...base,
          property: item.activity,
          value: data?.code || order?.code || item?.code,
        },
      ];

    case "ORDER_PRODUCT_UPDATE":
      if (!Array.isArray(data)) return [];
      return data
        .map((change: any) => {
          const common = {
            ...base,
            name: reference?.code,
            property: change?.property,
          };

          if (change?.property === "purchasedQuantity") {
            return {
              ...common,
              oldValue:
                change.oldValue === 0
                  ? t("log_product.out_of_stock")
                  : change.oldValue
                    ? quantity(change.oldValue)
                    : t("log_product.not_buy"),
              newValue:
                change.newValue === 0
                  ? t("log_product.out_of_stock")
                  : change.newValue === null
                    ? t("log_product.not_buy")
                    : quantity(change.newValue),
            };
          }

          if (change?.property === "actualPrice") {
            return {
              ...common,
              oldValue: money(change.oldValue, reference?.currency),
              newValue: money(change.newValue, reference?.currency),
            };
          }

          if (change?.property === "staffRemark") {
            return {
              ...common,
              oldValue:
                change.oldValue?.toString().trim() || t("log_product.empty"),
              newValue:
                change.newValue?.toString().trim() || t("log_product.empty"),
            };
          }

          if (change?.property === "confirm") {
            return {
              ...common,
              property: "confirm",
              confirm: change.newValue?.confirm
                ? t("log_order.agree")
                : t("log_order.reject"),
              type:
                change.newValue?.property === "actualPrice"
                  ? t("product_tab.sale_price", { defaultValue: "Đơn giá" })
                  : t("log_order.purchasedQuantity_label"),
              newValue:
                change.newValue?.property === "actualPrice"
                  ? money(change.newValue?.newValue, reference?.currency)
                  : change.newValue?.newValue,
            };
          }

          return {
            ...common,
            oldValue: formatChangedValue(change?.oldValue),
            newValue: formatChangedValue(change?.newValue),
          };
        })
        .filter((log: any) => log?.property);

    case "ORDER_UPDATE": {
      const change = Array.isArray(data) ? data[0] : data;
      if (!change?.property) return [];

      if (change.property === "discountAmount") {
        return [
          {
            ...base,
            property: "discountAmount",
            oldValue: displayLogValue(change.oldValue),
            newValue: displayLogValue(change.newValue),
          },
        ];
      }

      if (change.property === "merchantShippingCost") {
        return [
          {
            ...base,
            property: change.property,
            oldValue:
              change.oldValue === 0
                ? t("shipment_log.free")
                : money(change.oldValue, orderCurrency),
            newValue:
              change.newValue === 0
                ? t("shipment_log.free")
                : money(change.newValue, orderCurrency),
          },
        ];
      }

      if (change.property === "exchangeRate") {
        return [
          {
            ...base,
            property: "exchangeRate",
            oldValue: money(change.oldValue),
            newValue: money(change.newValue),
          },
        ];
      }

      if (change.property === "emdPercent") {
        return [
          {
            ...base,
            property: "ORDER_UPDATE_EMD",
            oldValue: quantity(change.oldValue),
            newValue: quantity(change.newValue),
          },
        ];
      }

      return [
        {
          ...base,
          property: change.property,
          oldValue: formatChangedValue(change.oldValue),
          newValue: formatChangedValue(change.newValue),
        },
      ];
    }

    case "ORDER_ADDRESS_UPDATE":
      if (!Array.isArray(data)) return [];
      return data
        .filter((change: any) => change?.property)
        .map((change: any) => ({
          ...base,
          property:
            change.property === "location"
              ? "ORDER_ADDRESS_UPDATE_LOCATION"
              : `ORDER_ADDRESS_UPDATE_${change.property}`,
          oldValue: formatChangedValue(
            change.oldValue?.display || change.oldValue,
          ),
          newValue: formatChangedValue(
            change.newValue?.display || change.newValue,
          ),
        }));

    case "ORDER_STATUS_UPDATE": {
      const change = Array.isArray(data) ? data[0] : data;
      return [
        {
          ...base,
          property: item.activity,
          oldValue:
            change?.oldValue?.name || change?.oldValue?.code || emptyLogValue,
          newValue:
            change?.newValue?.name || change?.newValue?.code || emptyLogValue,
        },
      ];
    }

    case "ORDER_CANCELLED":
    case "ORDER_FEE_CALCULATE_ALL":
      return [
        { ...base, property: item.activity, name: data?.code || order?.code },
      ];

    case "ORDER_FEE_CREATED":
      return [
        {
          ...base,
          property: item.activity,
          value: data?.type?.name,
          amount: money(data?.actualAmount),
          reason: data?.reason || emptyLogValue,
        },
      ];

    case "ORDER_FEE_UPDATE":
      if (!Array.isArray(data)) return [];
      return data
        .map((change: any) => {
          const name = reference?.type?.name || emptyLogValue;
          if (change.property === "reason") {
            return {
              ...base,
              property: "ORDER_FEE_UPDATE_REASON",
              name,
              oldValue: change.oldValue || t("shipment_log.empty"),
              newValue: change.newValue || emptyLogValue,
            };
          }

          if (
            change.property === "free" &&
            change.newValue !== change.oldValue
          ) {
            return {
              ...base,
              property: "ORDER_FEE_UPDATE_FREE",
              name,
              value: change.newValue
                ? t("shipment_log.free")
                : t("shipment_log.cancel_free"),
            };
          }

          if (change.property === "amount") {
            return {
              ...base,
              property: "ORDER_FEE_UPDATE_AMOUNT",
              name,
              oldValue: money(change.oldValue),
              newValue: money(change.newValue),
            };
          }

          return null;
        })
        .filter(Boolean) as OrderLogContent[];

    case "ORDER_TRACKING_CREATE":
    case "ORDER_PACKAGE_CREATE":
    case "ORDER_PACKAGE_DELETE":
    case "ORDER_TRACKING_DELETE":
      return [
        {
          ...base,
          property: item.activity,
          value: data?.code || data?.[0]?.code || emptyLogValue,
        },
      ];

    case "ORDER_PACKAGE_UPDATE":
      if (!Array.isArray(data)) return [];
      return data
        .filter((change: any) => change?.property)
        .map((change: any) => ({
          ...base,
          property: `ORDER_PACKAGE_UPDATE_${change.property}`,
          name: reference?.code,
          oldValue: formatPackageChangedValue(
            change.property,
            change.oldValue,
            packageStatuses,
          ),
          newValue: formatPackageChangedValue(
            change.property,
            change.newValue,
            packageStatuses,
          ),
        }));

    case "ORDER_SERVICE_UPDATE": {
      const change = Array.isArray(data) ? data[0] : data;
      const added = change?.addedValues || [];
      const removed = change?.removedValues || [];
      return [
        ...added.map((service: any) => ({
          ...base,
          property: "ORDER_SERVICE_UPDATE_ADD",
          addValue: service?.name || service,
        })),
        ...removed.map((service: any) => ({
          ...base,
          property: "ORDER_SERVICE_UPDATE_REMOVE",
          removeValue: service?.name || service,
        })),
      ];
    }

    case "ORDER_SERVICE_APPROVED":
      if (!Array.isArray(data)) return [];
      return data.map((change: any) => ({
        ...base,
        property: change?.newValue
          ? "ORDER_SERVICE_APPROVED_ADD"
          : "ORDER_SERVICE_APPROVED_REMOVE",
        service: reference?.name,
      }));

    case "payment":
    case "claim":
    case "emd":
    case "refund":
    case "collect":
    case "gift":
    case "deposit":
    case "charge":
    case "withdraw":
    case "adjust":
      return [
        {
          ...base,
          property: item.activity,
          amount: formatTransactionAmount(item.activity, item.amount),
          reason: item.memo || emptyLogValue,
        },
      ];

    case "ORDER_COUPON_APPLY":
      return [
        {
          ...base,
          property: item.activity,
          content: data ? `${data.code} - ${data.description}` : emptyLogValue,
        },
      ];

    case "ORDER_UPDATE_EXCHANGE_RATE":
      return [
        {
          ...base,
          property: "edit_exchange_rate",
          oldValue: money(data?.[0]?.oldValue),
          newValue: money(data?.[0]?.newValue),
        },
      ];

    case "ORDER_UPDATE_INTERNAL_EXCHANGE_RATE":
      return [{ ...base, property: "edit_internal_exchange_rate" }];

    default:
      return item?.activity
        ? [
            {
              ...base,
              property: item.activity,
              oldValue: formatChangedValue(data?.oldValue),
              newValue: formatChangedValue(data?.newValue),
              value: formatChangedValue(data?.code || data?.value),
              name: reference?.code || reference?.name,
              reason: item.memo || data?.reason,
            },
          ]
        : [];
  }
};

export const parseLogs = (
  items: any[],
  order: any,
  t: OrderLogTranslator,
  packageStatuses: any[] = [],
) =>
  items
    .flatMap((item) => parseLogItem(item, order, t, packageStatuses))
    .filter((item) => item.property);

export const formatOrderLogContent = (
  item: OrderLogContent,
  t: OrderLogTranslator,
) => {
  const translated = t(`log_order.${item.property}`, {
    ...item,
    defaultValue: item.property,
  });

  return translated === item.property
    ? displayLogValue(item.reason || item.value || item.name || item.property)
    : translated;
};
