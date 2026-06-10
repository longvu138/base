import React from "react";
import {
  HomeOutlined,
  ShoppingCartOutlined,
  WalletOutlined,
  InboxOutlined,
  FileProtectOutlined,
  CreditCardOutlined,
  DeliveredProcedureOutlined,
  TagsOutlined,
  GiftOutlined,
  EnvironmentOutlined,
  HeartOutlined,
  QuestionCircleOutlined,
  PayCircleOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import { useTheme, getVariantDefaults } from "@repo/theme-provider";
import { getTenantThemeConfig } from "@repo/tenant-config";
import { useTranslation } from "@repo/i18n";

export interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  labelKey: string;
  path: string;
}

/**
 * Menu dung chung cho tat ca tenant variant.
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
    label: "ÄÆ¡n hÃ ng",
    labelKey: "navigation.orders",
    path: "/orders",
  },
  {
    key: "/shipments",
    icon: React.createElement(DeliveredProcedureOutlined),
    label: "KÃ½ gá»­i",
    labelKey: "navigation.shipments",
    path: "/shipments",
  },
  {
    key: "/delivery",
    icon: React.createElement(InboxOutlined),
    label: "YÃªu cáº§u giao",
    labelKey: "navigation.delivery_requests",
    path: "/delivery",
  },
  {
    key: "/peer-payments",
    icon: React.createElement(PayCircleOutlined),
    label: "YÃªu cáº§u thanh toÃ¡n",
    labelKey: "navigation.peer_payments",
    path: "/peer-payments",
  },
  {
    key: "/cash-request",
    icon: React.createElement(DollarCircleOutlined),
    label: "YÃªu cáº§u thu tiá»n máº·t",
    labelKey: "navigation.cash_request",
    path: "/cash-request",
  },
  {
    key: "/packages",
    icon: React.createElement(InboxOutlined),
    label: "Kiá»‡n hÃ ng",
    labelKey: "navigation.packages",
    path: "/packages",
  },
  {
    key: "/waybills",
    icon: React.createElement(TagsOutlined),
    label: "MÃ£ váº­n Ä‘Æ¡n",
    labelKey: "navigation.waybills",
    path: "/waybills",
  },
  {
    key: "/transactions",
    icon: React.createElement(WalletOutlined),
    label: "Giao dá»‹ch",
    labelKey: "navigation.transactions",
    path: "/profile?tab=transactions",
  },
  {
    key: "/claims",
    icon: React.createElement(FileProtectOutlined),
    label: "Khiáº¿u náº¡i",
    labelKey: "navigation.claims",
    path: "/claims",
  },
  {
    key: "/withdrawal-slips",
    icon: React.createElement(CreditCardOutlined),
    label: "RÃºt tiá»n",
    labelKey: "navigation.withdrawal_slips",
    path: "/withdrawal-slips",
  },
  // {
  //   key: "/vouchers",
  //   icon: React.createElement(GiftOutlined),
  //   label: "MÃ£ giáº£m giÃ¡",
  //   path: "/profile?tab=vouchers",
  // },
  // {
  //   key: "/address",
  //   icon: React.createElement(EnvironmentOutlined),
  //   label: "Dia chi nhan hang",
  //   path: "/profile?tab=address",
  // },
  // {
  //   key: "/wishlist",
  //   icon: React.createElement(HeartOutlined),
  //   label: "Sáº£n pháº©m Ä‘Ã£ lÆ°u",
  //   path: "/profile?tab=saved-products",
  // },
  {
    key: "/faqs",
    icon: React.createElement(QuestionCircleOutlined),
    label: "HÆ°á»›ng dáº«n",
    labelKey: "navigation.faqs",
    path: "/profile?tab=faqs",
  },
];

/**
 * Menu rieng cho Gobiz (gobiz):
 * - Gom /packages + /delivery thanh "Quan ly giao hang"
 * - Gom /transactions + /withdrawal-slips thanh "Giao dich"
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
    label: "ÄÆ¡n hÃ ng",
    labelKey: "navigation.orders",
    path: "/orders",
  },
  {
    key: "/shipments",
    icon: React.createElement(DeliveredProcedureOutlined),
    label: "KÃ½ gá»­i",
    labelKey: "navigation.shipments",
    path: "/shipments",
  },
  {
    key: "/peer-payments",
    icon: React.createElement(PayCircleOutlined),
    label: "YÃªu cáº§u thanh toÃ¡n",
    labelKey: "navigation.peer_payments",
    path: "/peer-payments",
  },
  {
    key: "/cash-request",
    icon: React.createElement(DollarCircleOutlined),
    label: "YÃªu cáº§u thu tiá»n máº·t",
    labelKey: "navigation.cash_request",
    path: "/cash-request",
  },
  {
    key: "/packages",
    icon: React.createElement(DeliveredProcedureOutlined),
    label: "Quáº£n lÃ½ giao hÃ ng",
    labelKey: "navigation.delivery_management",
    path: "/packages",
  },
  {
    // Gom /transactions + /withdrawal-slips thanh 1 muc "Giao dich"
    key: "/transactions",
    icon: React.createElement(WalletOutlined),
    label: "Giao dá»‹ch",
    labelKey: "navigation.transactions",
    path: "/profile?tab=transactions",
  },
  {
    key: "/claims",
    icon: React.createElement(FileProtectOutlined),
    label: "Khiáº¿u náº¡i",
    labelKey: "navigation.claims",
    path: "/claims",
  },
  {
    key: "/waybills",
    icon: React.createElement(TagsOutlined),
    label: "MÃ£ váº­n Ä‘Æ¡n",
    labelKey: "navigation.waybills",
    path: "/waybills",
  },
  {
    key: "/vouchers",
    icon: React.createElement(GiftOutlined),
    label: "MÃ£ giáº£m giÃ¡",
    labelKey: "navigation.vouchers",
    path: "/profile?tab=vouchers",
  },
  {
    key: "/address",
    icon: React.createElement(EnvironmentOutlined),
    label: "Äá»‹a chá»‰ nháº­n hÃ ng",
    labelKey: "navigation.address",
    path: "/profile?tab=address",
  },
  {
    key: "/wishlist",
    icon: React.createElement(HeartOutlined),
    label: "Sáº£n pháº©m Ä‘Ã£ lÆ°u",
    labelKey: "navigation.wishlist",
    path: "/profile?tab=saved-products",
  },
  {
    key: "/faqs",
    icon: React.createElement(QuestionCircleOutlined),
    label: "HÆ°á»›ng dáº«n",
    labelKey: "navigation.faqs",
    path: "/profile?tab=faqs",
  },
];

/**
 * Hook lay danh sach menu hoan toan data-driven tu config backend.
 */
export const useNavigation = (): MenuItem[] => {
  const { tenantConfig } = useTheme();
  const { t } = useTranslation();
  const themeConfig = getTenantThemeConfig(tenantConfig);
  const variantCode = themeConfig?.variantCode || "default";
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
