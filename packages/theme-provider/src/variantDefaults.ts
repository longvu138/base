export interface VariantMenuDefaults {
  preset: "base" | "gobiz";
  hiddenKeys?: string[];
  labelOverrides?: Record<string, string>;
}

export interface VariantDefaults {
  /**
   * Chỉ dùng cho các page/layout KHÔNG đi theo naming convention.
   *
   * Convention mặc định nằm trong useVariant():
   *   pageKey="orders" + variantCode="thanhla" -> OrdersStyleThanhla
   *   pageKey="layout" + variantCode="gobiz"   -> LayoutStyleGobiz
   *
   * Vì vậy không cần khai báo tất cả page ở đây. Chỉ thêm key khi component
   * cần render có tên đặc biệt, ví dụ gobiz orders dùng OrdersStyleGobizCombined
   * thay vì OrdersStyleGobiz.
   */
  componentOverrides?: Record<string, string>;
  /**
   * Default menu behavior theo variant.
   *
   * Tenant vẫn có thể override menu từ backend qua themeConfig.menu.
   * variantDefaults chỉ là default theo variantCode, ví dụ gobiz dùng menu preset
   * riêng và đổi label /orders.
   */
  menu?: VariantMenuDefaults;
}

/**
 * Default chung khi:
 * - backend trả variantCode rỗng,
 * - variantCode không có config riêng ở frontend,
 * - hoặc app đang render trước khi tenant config được load.
 *
 * Lưu ý: default này không quyết định file component. File component default
 * được truyền từ page/layout dispatcher qua fallbackName/defaultComponentName.
 */
const DEFAULTS: VariantDefaults = {
  componentOverrides: {},
  menu: {
    preset: "base",
  },
};

/**
 * Bảng này chỉ khai báo "exception mặc định" theo variantCode.
 *
 * Không thêm tenant mới vào đây nếu tenant đó chỉ dùng đúng convention:
 *   LoginStyleNewclient
 *   OrdersStyleNewclient
 *   LayoutStyleNewclient
 *
 * Chỉ thêm variant vào đây khi có behavior khác convention, ví dụ:
 * - một page dùng component tên đặc biệt,
 * - variant cần menu preset khác,
 * - variant cần default hiddenKeys/labelOverrides cho menu.
 */
const VARIANT_DEFAULTS: Record<string, VariantDefaults> = {
  gobiz: {
    componentOverrides: {
      // Exception: Gobiz orders gom nhiều nghiệp vụ trong một màn combined,
      // nên không dùng component convention OrdersStyleGobiz.
      orders: "OrdersStyleGobizCombined",
    },
    menu: {
      preset: "gobiz",
      labelOverrides: { "/orders": "Quản lý Tổng hợp" },
    },
  },
};

/**
 * Trả về default behavior của variant.
 *
 * Nếu variantCode không có trong VARIANT_DEFAULTS thì vẫn trả DEFAULTS.
 * Sau bước này, useVariant() vẫn tiếp tục thử naming convention theo variantCode.
 * Ví dụ variantCode="thanhla" không có entry ở đây nhưng vẫn resolve được
 * OrdersStyleThanhla nhờ convention trong useVariant().
 */
export function getVariantDefaults(variantCode?: string): VariantDefaults {
  if (!variantCode) return DEFAULTS;
  return VARIANT_DEFAULTS[variantCode] || DEFAULTS;
}
