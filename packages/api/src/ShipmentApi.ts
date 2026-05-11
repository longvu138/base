import { ApiClient } from "@repo/util";

export const ShipmentApi = {
  getShipments: (params: any) => {
    return ApiClient.auth.get(`customer/shipments`, { params });
  },
  getShipmentStatuses: () => {
    return ApiClient.auth.get(
      `categories/public_shipment_statuses?size=1000&sort=position:asc`,
    );
  },
  getShipmentStatistic: () => {
    return ApiClient.auth.get(`customer/shipments/statistics`);
  },
  getShipmentServices: () => {
    return ApiClient.auth.get(
      `categories/shipment_services?size=1000&sort=position:asc`,
    );
  },
  getShipmentDetail: (code: string) => {
    return ApiClient.auth.get(`customer/shipments/${code}`);
  },
  updateShipment: (code: string, payload: any) => {
    return ApiClient.auth.patch(`customer/shipments/${code}`, payload);
  },
  getShipmentProducts: (code: string) => {
    return ApiClient.auth.get(`customer/shipments/${code}/products`);
  },
  createShipmentProduct: (code: string, payload: any) => {
    return ApiClient.auth.post(`customer/shipments/${code}/products`, payload);
  },
  updateShipmentProduct: (code: string, productCode: string, payload: any) => {
    return ApiClient.auth.patch(
      `customer/shipments/${code}/products/${productCode}`,
      payload,
    );
  },
  deleteShipmentProduct: (code: string, productCode: string) => {
    return ApiClient.auth.delete(
      `customer/shipments/${code}/products/${productCode}`,
    );
  },
  getShipmentFees: (code: string) => {
    return ApiClient.auth.get(`customer/shipments/${code}/fees`);
  },
  getShipmentWaybills: (code: string) => {
    return ApiClient.auth.get(`customer/shipments/${code}/waybill`);
  },
  createShipmentWaybill: (code: string, payload: any) => {
    return ApiClient.auth.post(`customer/shipments/${code}/waybill`, payload);
  },
  deleteShipmentWaybill: (code: string, waybillCode: string) => {
    return ApiClient.auth.delete(
      `customer/shipments/${code}/waybill/${waybillCode}`,
    );
  },
  checkShipmentWaybillDuplicate: (code: string, waybillCode: string) => {
    return ApiClient.auth.get(
      `customer/shipments/${code}/waybill/${waybillCode}/check_create`,
    );
  },
  getShipmentParcels: (code: string) => {
    return ApiClient.auth.get(`customer/shipments/${code}/parcels`, {
      params: { size: 9999 },
    });
  },
  getShipmentMilestones: (code: string) => {
    return ApiClient.auth.get(`customer/shipments/${code}/milestones`, {
      params: { sort: "timestamp:ASC" },
    });
  },
  getShipmentActivities: (code: string, page = 0, size = 100) => {
    return ApiClient.auth.get(`customer/shipments/${code}/activities`, {
      params: { sort: "timestamp:desc", page, size },
    });
  },
  getShipmentFinancial: (code: string, type?: string) => {
    return ApiClient.auth.get(`customer/shipments/${code}/financial`, {
      params: type ? { type } : { sort: "timestamp:desc", size: 1000 },
    });
  },
  getShipmentClaims: (code: string) => {
    return ApiClient.auth.get(`customer/canines/claims/orderCode/${code}`, {
      params: { page: 0, size: 10000, sort: "createdAt:desc" },
    });
  },
  getShipmentOriginalReceipts: (code: string) => {
    return ApiClient.auth.get(`customer/shipments/${code}/original_receipts`);
  },
  addShipmentOriginalReceipt: (code: string, payload: any) => {
    return ApiClient.auth.post(
      `customer/shipments/${code}/original_receipts`,
      payload,
    );
  },
  deleteShipmentOriginalReceipt: (code: string, payload: any) => {
    return ApiClient.auth.delete(
      `customer/shipments/${code}/original_receipts`,
      {
        data: payload,
      },
    );
  },
  getHarmonizedCommodities: () => {
    return ApiClient.auth.get(`categories/harmonized_commodity`);
  },
  getShipmentCredits: (code: string) => {
    return ApiClient.auth.get(`customer/shipments/${code}/credits`);
  },
  getShipmentLoans: (code: string) => {
    return ApiClient.auth.get(`customer/shipments/${code}/loans`);
  },
  getShipmentThirdPartyLoans: (code: string) => {
    return ApiClient.auth.get(`customer/third-parties/shopkeeper/loans`, {
      params: { orderCodes: code },
    });
  },
};
