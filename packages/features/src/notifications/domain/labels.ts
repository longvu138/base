export const getNotificationEventLabel = (
  code?: string,
  t?: (key: string, options?: any) => string,
  fallback?: string,
) => {
  if (!code) return fallback || "";

  const labels: Record<string, string> = {
    FINANCIAL_COLLECT: "Truy thu",
    FINANCIAL_EMD: "Đặt cọc",
    FINANCIAL_PAYMENT: "Thanh toán",
    FINANCIAL_CLAIM: "Hoàn tiền khiếu nại",
    FINANCIAL_DEPOSIT: "Nạp tiền",
    DELIVERY_REQ_STATUS_UPDATE: "Cập nhật yêu cầu giao",
    ORDER_PACKAGE_UPDATE: "Cập nhật kiện hàng",
    SHIPMENT_PACKAGE_UPDATE: "Cập nhật kiện ký gửi",
    ORDER_COMMENT_UPDATE: "Trao đổi đơn hàng",
    PROFILE: "Tài khoản",
  };

  const translated = t?.(`notifications.events.${code}`, {
    defaultValue: labels[code] || fallback || code,
  });

  return translated || labels[code] || fallback || code;
};
