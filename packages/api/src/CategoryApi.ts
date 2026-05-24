import { ApiClient } from "@repo/util";

export const CategoryApi = {
  getCurrentExchangeRate: () => {
    return ApiClient.auth.get("customer/exchange_rates/current");
  },
  getNavigationMenus: () => {
    return ApiClient.auth.get("categories/navigation_menus");
  },
  getDepositQr: (amount: number | string) => {
    return ApiClient.auth.get(
      `customer/bank-accounts/deposit?amount=${amount}`,
    );
  },
  getFees: () => {
    return ApiClient.auth.get("categories/fees");
  },
  getServiceGroups: () => {
    return ApiClient.auth.get("categories/service_groups", {
      params: { size: 1000 },
    });
  },
  getShipmentShippingFees: (
    configGroupId: string | number,
    shippingClass: string | number,
  ) => {
    return ApiClient.auth.get("categories/shipment_shipping_fees", {
      params: { configGroupId, shippingClass },
    });
  },
  getOrderShippingFees: (
    configGroupId: string | number,
    shippingClass: string | number,
  ) => {
    return ApiClient.auth.get("categories/shipping_fees", {
      params: { configGroupId, shippingClass },
    });
  },
};
