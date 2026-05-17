# Hướng Dẫn Cấu Hình Theme Và Giao Diện Theo Tenant

Tài liệu này dành cho backend/devops/admin cần cấu hình tenant theo source hiện tại.

## 1. Cấu trúc tenant config

Tenant server hiện nằm ở:

```txt
apps/tenant-server/src/index.js
```

Ví dụ tenant:

```js
gobiz: {
  name: "Gobiz Logistics",
  planCode: "paid",
  variantCode: "gobiz",
  override: {
    tenantConfig: {
      themeConfig: {
        colorPrimary: "#722ed1",
        colorBorder: "#9254de"
      }
    }
  }
}
```

Backend sẽ merge:

```txt
PLAN_PRESETS[planCode] + override
```

`override` thắng preset.

## 2. Các variant hiện hỗ trợ

Backend validate bằng `VARIANT_NAMES`.

| Variant | Ý nghĩa hiện tại | Tenant đang dùng |
|---|---|---|
| `default` | Giao diện phổ thông / StyleDefault | `baogam`, `thien_long`, `free_sample_3` |
| `thanhla` | Giao diện hiện đại / Thanhla layout | `tetetete`, `thanhla` |
| `gobiz` | Giao diện premium / Gobiz layout | `gobiz` |

Nếu tenant cấu hình `variantCode` sai, backend trả `default`.

## 3. ThemeConfig hỗ trợ

Type chính:

```txt
packages/tenant-config/src/index.ts
```

`SimpleTenantConfig` extend `ThemeConfig` của AntD và có thêm các field:

| Field | Mục đích |
|---|---|
| `uiLib` | lưu lựa chọn `antd` hoặc `mui` trong context |
| `variants` | override component theo page key |
| `menu.hiddenKeys` | ẩn menu item theo key |
| `menu.labelOverrides` | đổi label menu item theo key |
| `colorPrimary` | màu chính |
| `colorPrimaryDark` | màu chính khi dark mode |
| `colorBgContainer` | màu nền container |
| `colorBgContainerDark` | màu nền container khi dark mode |
| `colorBgLayout` | màu nền layout |
| `colorBgLayoutDark` | màu nền layout khi dark mode |
| `colorBorder` | màu border |
| `colorBorderDark` | màu border khi dark mode |
| `colorText` | màu text |
| `colorTextDark` | màu text khi dark mode |
| `colorSuccess` | màu trạng thái success |
| `colorWarning` | màu trạng thái warning |
| `colorError` | màu trạng thái error |
| `borderRadius` | radius AntD |
| `components` | component token override của AntD |

## 4. Token được apply như thế nào

Helper:

```ts
applyTenantConfig(baseTheme, tenantConfig, isDark)
```

Nếu `tenantConfig` rỗng/không tồn tại, app giữ nguyên base theme.

Nếu có config:

1. Resolve dark fields nếu `isDark = true`.
2. Merge `components` vào `baseTheme.components`.
3. Merge toàn bộ resolved config vào `baseTheme.token`.
4. Nếu có `colorPrimary`, đồng bộ thêm link/icon token.

## 5. CSS variables

Helper:

```ts
updateTenantCSSVariables(themeConfig, isDark)
```

Các biến chính:

| Config | CSS variable |
|---|---|
| `colorPrimary` | `--tenant-primary-color` |
| `colorBgContainer` | `--tenant-bg-container` |
| `colorBgLayout` | `--tenant-bg-layout` |
| `colorBorder` | `--tenant-border-color` |
| `colorText` | `--tenant-text-color` |
| `borderRadius` | `--tenant-radius-antd` |

Web có defaults trong `apps/web/src/index.css`.
Mobile có defaults trong `apps/mobile/src/index.css`.

## 6. Chọn giao diện bằng variantCode

UI component được resolve ở frontend qua:

```ts
useVariant(pageKey, defaultComponentName)
```

Thứ tự ưu tiên:

1. `themeConfig.variants[pageKey]`.
2. `variantDefaults.componentOverrides[pageKey]`.
3. `defaultComponentName` do page/layout dispatcher truyền vào.
4. naming convention mặc định `${PageKey}StyleDefault`.

Ví dụ:

```json
{
  "variantCode": "gobiz"
}
```

Nếu page key là `claims` và `variantCode` là `gobiz`, frontend dùng `ClaimsStyleGobiz` từ `variantDefaults`.

Nếu page key là `orders` và variant là `gobiz`, `variantDefaults` override sang `OrdersStyleGobizCombined`.

## 7. Override component trực tiếp

Có thể cấu hình override trong `themeConfig.variants`:

```js
override: {
  tenantConfig: {
    themeConfig: {
      variants: {
        login: "LoginStyleThanhla",
        orders: "OrdersStyleGobizCombined"
      }
    }
  }
}
```

Lưu ý: component được override phải tồn tại trong đúng folder page, vì `DynamicVariant` chỉ quét file cùng folder qua `import.meta.glob("./*.tsx")`.

## 8. Menu

Web menu nằm ở:

```txt
apps/web/src/components/Layout/Navigation.ts
```

Menu chọn theo `variantDefaults.menu.preset`:

- `base`: dùng `BASE_MENU_ITEMS`.
- `gobiz`: dùng `GOBIZ_MENU_ITEMS`.

Tenant có thể override:

```js
themeConfig: {
  menu: {
    hiddenKeys: ["/shipments"],
    labelOverrides: {
      "/orders": "Quản lý Tổng hợp"
    }
  }
}
```

`themeConfig.menu` có độ ưu tiên cao hơn default của variant.

## 9. Default và fallback

| Tình huống | Kết quả hiện tại |
|---|---|
| Client chưa chọn tenant | `baogam` |
| Backend không có tenant id | `baogam` |
| Backend gặp variant sai | `default` |
| Frontend API lỗi | dùng cache `full-tenant-data` |
| API lỗi và cache không dùng được | `FALLBACK_TENANT_CONFIG` |
| `FALLBACK_TENANT_CONFIG` | `variantCode: "default"`, `themeConfig: {}` |
| Không có theme token | base AntD theme |
| Không tìm thấy component variant | `DynamicVariant` dùng `fallbackName` |
| Không tìm thấy layout variant | fallback `LayoutStyleDefault` |

## 10. Mapping lệch tên cần biết

Một vài mapping hiện tại trong `variantDefaults.thanhla` không khớp với file Web:

| Page key | Mapping | File Web đang có |
|---|---|---|
| `deliveryNotes` | `DeliveryNotesStyleThanhla` | `DeliveryNoteStyleThanhla.tsx` |
| `packages` | `PackagesStyleThanhla` | `PackageStyleThanhla.tsx` |
| `withdrawalSlips` | `WithdrawalSlipsStyleThanhla` | `WithdrawalSlipStyleThanhla.tsx` |

Khi gặp các case này, `DynamicVariant` không tìm thấy file variant và sẽ dùng `fallbackName` của page. Nếu muốn `thanhla` thật sự dùng các style này trên Web, cần đổi mapping hoặc đổi tên file cho khớp.

## 11. Checklist cấu hình tenant

Khi thêm hoặc sửa tenant:

1. Thêm tenant trong `apps/tenant-server/src/index.js`.
2. Chọn `planCode`.
3. Chọn `variantCode` trong `default`, `thanhla`, `gobiz`.
4. Thêm `override.tenantConfig.themeConfig` nếu cần đổi màu/token/menu/component.
5. Nếu muốn tenant xuất hiện ở selector, thêm vào `tenantExamples` trong `packages/tenant-config/src/index.ts`.
6. Nếu variant cần layout/page đặc biệt, thêm mapping vào `packages/theme-provider/src/variantDefaults.ts`.
7. Đảm bảo mọi page dispatcher có `fallbackName` trỏ tới file thật.
8. Test light/dark mode.
9. Test đổi tenant runtime bằng dropdown hoặc `dispatchTenantChange()`.

## 12. Lưu ý về `uiLib`

`uiLib` hiện có type `antd | mui` và được set vào `ThemeContext`, nhưng source hiện tại chưa có flow render khác nhau theo `uiLib`. Cấu hình `uiLib: "mui"` không tự động đổi toàn bộ component AntD sang MUI.
