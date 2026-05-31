import type { NotificationItem } from "./types";

export const getNotificationLink = (item: NotificationItem) => {
  const refData = item.refData || {};
  const order = refData.order;

  switch (item.eventCode) {
    case "FINANCIAL_COLLECT":
    case "FINANCIAL_EMD":
    case "FINANCIAL_PAYMENT":
    case "FINANCIAL_CLAIM":
    case "FINANCIAL_DEPOSIT":
      return "/profile?tab=transactions";
    case "DELIVERY_REQ_STATUS_UPDATE":
      return refData.deliveryRequest?.code
        ? `/delivery-requests?query=${refData.deliveryRequest.code}`
        : "/delivery-requests";
    case "ORDER_PACKAGE_UPDATE":
    case "SHIPMENT_PACKAGE_UPDATE":
      if (order?.updatedPackageCode) {
        return `/packages?query=${order.updatedPackageCode}`;
      }
      if (order?.code) {
        return `/${order.isShipment ? "shipments" : "orders"}/${order.code}`;
      }
      return "/packages";
    case "PROFILE":
      return "/profile";
    default:
      if (order?.code) {
        return `/${order.isShipment ? "shipments" : "orders"}/${order.code}`;
      }
      return "/dashboard";
  }
};
