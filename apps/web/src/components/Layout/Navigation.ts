import React from "react";
import {
  HomeOutlined,
  ShoppingCartOutlined,
  WalletOutlined,
  InboxOutlined,
  FileProtectOutlined,
  CreditCardOutlined,
  DeliveredProcedureOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  TagsOutlined,
  GiftOutlined,
  EnvironmentOutlined,
  HeartOutlined,
  QuestionCircleOutlined,
  PayCircleOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import { useTheme, getVariantDefaults } from "@repo/theme-provider";
import { useTranslation } from "@repo/i18n";

export interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  labelKey: string;
  path: string;
}

/**
 * Menu dùng chung cho tất cả tenant variant.
 */
const BASE_MENU_ITEMS: MenuItem[] = [
  {
    key: "/dashboard",
    icon: React.createElement(HomeOutlined),
    label: "Dashboard",
    labelKey: "navigation.dashboard",
    path: "/dashboard",
  },
  {
    key: "/orders",
    icon: React.createElement(ShoppingCartOutlined),
    label: "Đơn hàng",
    labelKey: "navigation.orders",
    path: "/orders",
  },
  {
    key: "/shipments",
    icon: React.createElement(DeliveredProcedureOutlined),
    label: "Ký gửi",
    labelKey: "navigation.shipments",
    path: "/shipments",
  },
  {
    key: "/delivery",
    icon: React.createElement(InboxOutlined),
    label: "Yêu cầu giao",
    labelKey: "navigation.delivery_requests",
    path: "/delivery",
  },
  {
    key: "/peer-payments",
    icon: React.createElement(PayCircleOutlined),
    label: "Yêu cầu thanh toán",
    labelKey: "navigation.peer_payments",
    path: "/peer-payments",
  },
  {
    key: "/cash-request",
    icon: React.createElement(DollarCircleOutlined),
    label: "Yêu cầu thu tiền mặt",
    labelKey: "navigation.cash_request",
    path: "/cash-request",
  },
  {
    key: "/packages",
    icon: React.createElement(InboxOutlined),
    label: "Kiện hàng",
    labelKey: "navigation.packages",
    path: "/packages",
  },
  {
    key: "/delivery-notes",
    icon: React.createElement(FileTextOutlined),
    label: "Phiếu xuất",
    labelKey: "navigation.delivery_notes",
    path: "/delivery-notes",
  },
  {
    key: "/lieferscheine",
    icon: React.createElement(FileDoneOutlined),
    label: "Phiếu giao",
    labelKey: "navigation.lieferscheine",
    path: "/lieferscheine",
  },
  {
    key: "/waybills",
    icon: React.createElement(TagsOutlined),
    label: "Mã vận đơn",
    labelKey: "navigation.waybills",
    path: "/waybills",
  },
  {
    key: "/transactions",
    icon: React.createElement(WalletOutlined),
    label: "Giao dịch",
    labelKey: "navigation.transactions",
    path: "/profile?tab=transactions",
  },
  {
    key: "/claims",
    icon: React.createElement(FileProtectOutlined),
    label: "Khiếu nại",
    labelKey: "navigation.claims",
    path: "/claims",
  },
  {
    key: "/withdrawal-slips",
    icon: React.createElement(CreditCardOutlined),
    label: "Rút tiền",
    labelKey: "navigation.withdrawal_slips",
    path: "/withdrawal-slips",
  },
  // {
  //   key: "/vouchers",
  //   icon: React.createElement(GiftOutlined),
  //   label: "Mã giảm giá",
  //   path: "/profile?tab=vouchers",
  // },
  // {
  //   key: "/address",
  //   icon: React.createElement(EnvironmentOutlined),
  //   label: "Địa chỉ nhận hàng",
  //   path: "/profile?tab=address",
  // },
  // {
  //   key: "/wishlist",
  //   icon: React.createElement(HeartOutlined),
  //   label: "Sản phẩm đã lưu",
  //   path: "/profile?tab=saved-products",
  // },
  {
    key: "/faqs",
    icon: React.createElement(QuestionCircleOutlined),
    label: "Hướng dẫn",
    labelKey: "navigation.faqs",
    path: "/profile?tab=faqs",
  },
];

/**
 * Menu riêng cho Gobiz (gobiz):
 * - Gom /packages + /delivery + /delivery-notes → "Quản lý giao hàng"
 * - Gom /transactions + /withdrawal-slips → "Giao dịch"
 */
const GOBIZ_MENU_ITEMS: MenuItem[] = [
  {
    key: "/dashboard",
    icon: React.createElement(HomeOutlined),
    label: "Dashboard",
    labelKey: "navigation.dashboard",
    path: "/dashboard",
  },
  {
    key: "/orders",
    icon: React.createElement(ShoppingCartOutlined),
    label: "Đơn hàng",
    labelKey: "navigation.orders",
    path: "/orders",
  },
  {
    key: "/shipments",
    icon: React.createElement(DeliveredProcedureOutlined),
    label: "Ký gửi",
    labelKey: "navigation.shipments",
    path: "/shipments",
  },
  {
    key: "/peer-payments",
    icon: React.createElement(PayCircleOutlined),
    label: "Yêu cầu thanh toán",
    labelKey: "navigation.peer_payments",
    path: "/peer-payments",
  },
  {
    key: "/cash-request",
    icon: React.createElement(DollarCircleOutlined),
    label: "Yêu cầu thu tiền mặt",
    labelKey: "navigation.cash_request",
    path: "/cash-request",
  },
  {
    key: "/packages",
    icon: React.createElement(DeliveredProcedureOutlined),
    label: "Quản lý giao hàng",
    labelKey: "navigation.delivery_management",
    path: "/packages",
  },
  {
    // Gom /transactions + /withdrawal-slips thành 1 mục "Giao dịch"
    key: "/transactions",
    icon: React.createElement(WalletOutlined),
    label: "Giao dịch",
    labelKey: "navigation.transactions",
    path: "/profile?tab=transactions",
  },
  {
    key: "/claims",
    icon: React.createElement(FileProtectOutlined),
    label: "Khiếu nại",
    labelKey: "navigation.claims",
    path: "/claims",
  },
  {
    key: "/waybills",
    icon: React.createElement(TagsOutlined),
    label: "Mã vận đơn",
    labelKey: "navigation.waybills",
    path: "/waybills",
  },
  {
    key: "/lieferscheine",
    icon: React.createElement(FileDoneOutlined),
    label: "Phiếu giao",
    labelKey: "navigation.lieferscheine",
    path: "/lieferscheine",
  },
  {
    key: "/vouchers",
    icon: React.createElement(GiftOutlined),
    label: "Mã giảm giá",
    labelKey: "navigation.vouchers",
    path: "/profile?tab=vouchers",
  },
  {
    key: "/address",
    icon: React.createElement(EnvironmentOutlined),
    label: "Địa chỉ nhận hàng",
    labelKey: "navigation.address",
    path: "/profile?tab=address",
  },
  {
    key: "/wishlist",
    icon: React.createElement(HeartOutlined),
    label: "Sản phẩm đã lưu",
    labelKey: "navigation.wishlist",
    path: "/profile?tab=saved-products",
  },
  {
    key: "/faqs",
    icon: React.createElement(QuestionCircleOutlined),
    label: "Hướng dẫn",
    labelKey: "navigation.faqs",
    path: "/profile?tab=faqs",
  },
];

/**
 * Hook lấy danh sách menu — hoàn toàn data-driven từ config backend.
 */
export const useNavigation = (): MenuItem[] => {
  const { tenantConfig } = useTheme();
  const { t } = useTranslation();
  const themeConfig = tenantConfig?.tenantConfig?.themeConfig;
  const variantCode = tenantConfig?.variantCode || "default";
  const variantDefaults = getVariantDefaults(variantCode);
  const menuPreset = variantDefaults.menu?.preset || "base";
  const baseItems = menuPreset === "gobiz" ? GOBIZ_MENU_ITEMS : BASE_MENU_ITEMS;

  const defaultHiddenKeys = variantDefaults.menu?.hiddenKeys ?? [];
  const hiddenKeys = themeConfig?.menu?.hiddenKeys ?? defaultHiddenKeys;
  const filtered = baseItems.filter((item) => !hiddenKeys.includes(item.key));

  const defaultLabelOverrides: Record<string, string> =
    variantDefaults.menu?.labelOverrides ?? {};
  const labelOverrides: Record<string, string> =
    themeConfig?.menu?.labelOverrides ?? defaultLabelOverrides;
  return filtered.map((item) => ({
    ...item,
    label: labelOverrides[item.key] ?? t(item.labelKey),
  }));
};
