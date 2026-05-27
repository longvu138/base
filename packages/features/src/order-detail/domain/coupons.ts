import dayjs from "dayjs";

export const orderDetailDateTime = (value: any) =>
  value ? dayjs(value).format("HH:mm DD/MM/YYYY") : "---";

export const getErrorTitle = (error: any) =>
  error?.response?.data?.title ||
  error?.response?.data?.message ||
  error?.title ||
  error?.message;

export const createOrderCouponCheckPayload = (
  code: string,
  orderCode: string,
) => ({
  code,
  orderCode,
  isShipment: false,
});

