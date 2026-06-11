import { useEffect, useMemo } from "react";
import { matchPath, useLocation } from "react-router-dom";
import { useTranslation } from "@repo/i18n";
import { useTheme } from "@repo/theme-provider";

type TitleRoute = {
  path: string;
  titleKey: string;
  fallback: string;
  paramKey?: string;
};

const titleRoutes: TitleRoute[] = [
  { path: "/login", titleKey: "auth.login.title", fallback: "Đăng nhập" },
  { path: "/register", titleKey: "auth.login.signUp", fallback: "Đăng ký" },
  { path: "/dashboard", titleKey: "navigation.dashboard", fallback: "Dashboard" },
  { path: "/orders/:code", titleKey: "navigation.orders", fallback: "Đơn hàng", paramKey: "code" },
  { path: "/orders", titleKey: "navigation.orders", fallback: "Đơn hàng" },
  { path: "/carts/checkout/:draftOrderId", titleKey: "cartCheckout.order_info", fallback: "Thanh toán", paramKey: "draftOrderId" },
  { path: "/carts", titleKey: "navigation.cart", fallback: "Giỏ hàng" },
  { path: "/shipments/create", titleKey: "shipments.create_shipment", fallback: "Tạo đơn ký gửi" },
  { path: "/shipments/:code", titleKey: "navigation.shipments", fallback: "Ký gửi", paramKey: "code" },
  { path: "/shipments", titleKey: "navigation.shipments", fallback: "Ký gửi" },
  { path: "/delivery/create", titleKey: "delivery.create_title", fallback: "Tạo yêu cầu giao" },
  { path: "/delivery", titleKey: "navigation.delivery_requests", fallback: "Yêu cầu giao" },
  { path: "/delivery-requests", titleKey: "navigation.delivery_requests", fallback: "Yêu cầu giao" },
  { path: "/delivery-notes", titleKey: "navigation.delivery_notes", fallback: "Phiếu xuất" },
  { path: "/peer-payments/:id", titleKey: "navigation.peer_payments", fallback: "Yêu cầu thanh toán", paramKey: "id" },
  { path: "/peer-payments", titleKey: "navigation.peer_payments", fallback: "Yêu cầu thanh toán" },
  { path: "/waybills", titleKey: "navigation.waybills", fallback: "Mã vận đơn" },
  { path: "/claims", titleKey: "navigation.claims", fallback: "Khiếu nại" },
  { path: "/tickets/create", titleKey: "tickets.create_claims", fallback: "Tạo khiếu nại" },
  { path: "/tickets/:code", titleKey: "tickets.title", fallback: "Khiếu nại", paramKey: "code" },
  { path: "/withdrawal-slips", titleKey: "navigation.withdrawal_slips", fallback: "Rút tiền" },
  { path: "/cash-request", titleKey: "navigation.cash_request", fallback: "Yêu cầu thu tiền mặt" },
  { path: "/packages", titleKey: "navigation.packages", fallback: "Kiện hàng" },
  { path: "/statistics", titleKey: "navigation.statistics", fallback: "Thống kê" },
  { path: "/notifications", titleKey: "navigation.notifications", fallback: "Thông báo" },
  { path: "/theme-configurator", titleKey: "Theme Configurator", fallback: "Theme Configurator" },
];

const profileTabTitles: Record<string, { titleKey: string; fallback: string }> = {
  transactions: { titleKey: "navigation.transactions", fallback: "Giao dịch" },
  vouchers: { titleKey: "navigation.vouchers", fallback: "Mã giảm giá" },
  "saved-products": { titleKey: "navigation.wishlist", fallback: "Sản phẩm đã lưu" },
  faqs: { titleKey: "navigation.faqs", fallback: "Hướng dẫn" },
  address: { titleKey: "navigation.address", fallback: "Địa chỉ nhận hàng" },
};

const translateTitle = (
  t: (key: string, options?: Record<string, unknown>) => string,
  titleKey: string,
  fallback: string,
) => {
  if (!titleKey.includes(".")) return titleKey;
  return t(titleKey, { defaultValue: fallback });
};

export const PageTitle = () => {
  const { t, i18n } = useTranslation();
  const { tenantConfig } = useTheme();
  const location = useLocation();

  const title = useMemo(() => {
    const appName =
      tenantConfig?.name || tenantConfig?.tenantConfig?.generalConfig?.tenantName || "Gobiz";

    let pageTitle = t("navigation.dashboard", { defaultValue: "Dashboard" });

    if (location.pathname === "/profile") {
      const tab = new URLSearchParams(location.search).get("tab") || "profile";
      const tabTitle = profileTabTitles[tab];
      pageTitle = tabTitle
        ? translateTitle(t, tabTitle.titleKey, tabTitle.fallback)
        : t("navigation.profile", { defaultValue: "Hồ sơ" });
    } else {
      for (const route of titleRoutes) {
        const match = matchPath({ path: route.path, end: true }, location.pathname);
        if (!match) continue;

        const translatedTitle = translateTitle(t, route.titleKey, route.fallback);
        const paramValue = route.paramKey ? match.params[route.paramKey] : undefined;
        pageTitle = paramValue ? `${translatedTitle} ${paramValue}` : translatedTitle;
        break;
      }
    }

    return `${pageTitle} - ${appName}`;
  }, [i18n.language, location.pathname, location.search, t, tenantConfig]);

  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
};

export default PageTitle;
