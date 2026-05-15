# Hệ thống Multi-Tenant Theming

Tài liệu này mô tả cách source hiện tại chọn tenant, chọn theme và chọn UI variant cho Web/Mobile.

## 1. Tổng quan

Luồng chính:

```txt
User chọn tenant
  -> dispatchTenantChange(tenantKey)
  -> localStorage("selected-tenant")
  -> event "app:tenant-changed"
  -> AppContent fetch /api/tenants/:tenantKey/config
  -> ThemeProvider nhận tenantConfig
  -> applyTenantConfig + updateTenantCSSVariables
  -> useVariant(pageKey)
  -> DynamicVariant load component đúng variant
```

## 2. Tenant mặc định và fallback

Theo code hiện tại:

- Client mặc định chọn `baogam` nếu `localStorage("selected-tenant")` chưa có.
- Backend mặc định fallback về `baogam` nếu tenant id không tồn tại.
- Backend fallback `variantCode` về `gd1` nếu tenant có variant sai/không hỗ trợ.
- Frontend fallback về cache `full-tenant-data` nếu API lỗi.
- Nếu cache không có hoặc bị hỏng, frontend dùng `FALLBACK_TENANT_CONFIG`.
- `FALLBACK_TENANT_CONFIG` dùng `variantCode: "gd1"` và `themeConfig: {}`.

Vì vậy “giao diện mặc định” thực tế có 3 lớp:

| Lớp | Mặc định |
|---|---|
| Tenant | `baogam` |
| Variant/UI | `gd1` / `Style1` |
| Theme token | base theme từ `@repo/antd-config` + CSS variables trong `index.css` |

## 3. Backend tenant server

File:

```txt
apps/tenant-server/src/index.js
```

Backend có:

- `VARIANT_NAMES`: `gd1`, `gd2`, `gd3`.
- `PLAN_PRESETS`: preset `free`, `paid`.
- `tenants`: danh sách tenant cụ thể.
- `resolveTenantConfig(tenantId)`: resolve config cuối cùng.

Tenant hiện có:

| Tenant | Variant | Ghi chú |
|---|---|---|
| `baogam` | `gd1` | giao diện phổ thông |
| `thien_long` | `gd1` | cùng variant với Baogam, khác màu |
| `free_sample_3` | `gd1` | sample free tenant |
| `gobiz` | `gd3` | giao diện premium/specialized |
| `tetetete` | `gd2` | giao diện hiện đại |
| `thanhla` | `gd2` | giao diện Thanhla |

Backend merge config theo thứ tự:

```txt
PLAN_PRESETS[planCode] + tenant.override
```

Merge là deep merge object. Field override thắng field preset.

## 4. Frontend AppContent

Web:

```txt
apps/web/src/App.tsx
```

Mobile:

```txt
apps/mobile/src/App.tsx
```

Hai app đều:

1. tạo `selectedTenantId` từ `localStorage("selected-tenant") || "baogam"`.
2. lắng nghe `app:tenant-changed`.
3. fetch tenant config từ `${appConfig.be}/api/tenants/:tenant/config`.
4. đưa response vào `ThemeProvider`.
5. cache response vào `localStorage("full-tenant-data")`.
6. apply theme token và CSS variables.

## 5. ThemeContext

File:

```txt
packages/theme-provider/src/ThemeContext.tsx
```

Context lưu:

- `theme`: `light` hoặc `dark`
- `uiLib`: `antd` hoặc `mui`, mặc định `antd`
- `tenantConfig`: full tenant response hoặc `null`

Lưu ý: source hiện tại chỉ lưu `uiLib` vào context. Chưa có cơ chế runtime để render toàn bộ app bằng MUI.

## 6. Resolve UI variant

Hook:

```ts
useVariant(pageKey)
```

Thứ tự ưu tiên:

1. `tenantConfig.tenantConfig.themeConfig.variants[pageKey]`.
2. `getVariantDefaults(variantCode).componentOverrides[pageKey]`.
3. Guard riêng `gd2 + orderDetail -> OrderDetailStyle1`.
4. Naming convention `${PageKey}Style${numberFromVariantCode}`.

Nếu `tenantConfig` chưa có, `variantCode` mặc định là `gd1`.

Ví dụ convention:

| Variant | Page key | Component |
|---|---|---|
| `gd1` | `orders` | `OrdersStyle1` |
| `gd2` | `login` | `LoginStyle2` |
| `gd3` | `claims` | `ClaimsStyle3` |

Một số page không dùng convention thuần vì có override trong `variantDefaults`.

## 7. Variant defaults

File:

```txt
packages/theme-provider/src/variantDefaults.ts
```

Default chung:

- menu preset `base`
- không ẩn menu item
- không đổi label menu
- `shipmentStatusDisplay = "filter"`

`gd2` override:

- layout: `ThanhlaLayout`
- nhiều page dùng `Style2`
- shipments dùng `Shipments`
- menu preset `base`

Lưu ý theo source hiện tại: một số tên override `gd2` không khớp với file Web thật, nên `DynamicVariant` sẽ fallback theo `fallbackName` của page:

- `deliveryNotes` map `DeliveryNotesStyle2`, nhưng Web có `DeliveryNoteStyle2.tsx`.
- `packages` map `PackagesStyle2`, nhưng Web có `PackageStyle2.tsx`.
- `withdrawalSlips` map `WithdrawalSlipsStyle2`, nhưng Web có `WithdrawalSlipStyle2.tsx`.

Mobile cũng lệch `deliveryNotes` theo cách tương tự.

`gd3` override:

- layout: `SpecializedLayout`
- orders: `OrdersCombined`
- shipments: `Shipments`
- notifications: `NotificationsStyle3`
- createClaim: `CreateClaimStyle3`
- menu preset `gobiz`
- `/orders` đổi label thành `Quản lý Tổng hợp`
- shipment status display `tabs`

Nếu variant code không nằm trong `VARIANT_DEFAULTS`, `getVariantDefaults()` trả default chung. Tuy nhiên backend hiện đã chặn variant sai và trả `gd1`.

## 8. DynamicVariant

File:

```txt
packages/ui/src/DynamicVariant.tsx
```

Mỗi dispatcher truyền:

- `variantName`: component cần load.
- `modules`: danh sách file lấy từ `import.meta.glob("./*.tsx")`.
- `fallbackName`: component fallback của page/layout đó.
- `featureName`: tên để log/debug.

Nếu không tìm thấy `variantName`, `DynamicVariant` load `fallbackName`.

Ví dụ Web Orders:

```tsx
<DynamicVariant
  variantName={variant}
  modules={modules}
  fallbackName="OrdersStyle1"
  featureName="Orders"
/>
```

Điểm cần nhớ: fallback chỉ an toàn nếu file fallback thật sự tồn tại trong folder đó.

## 9. Layout và menu

Layout dispatcher:

- Web: `apps/web/src/components/Layout/index.tsx`
- Mobile: `apps/mobile/src/components/Layout/index.tsx`

Fallback layout là `VerticalLayout`.

Web menu:

```txt
apps/web/src/components/Layout/Navigation.ts
```

Menu chọn theo:

1. `tenantConfig.variantCode`.
2. `getVariantDefaults(variantCode).menu.preset`.
3. preset `gobiz` dùng `GOBIZ_MENU_ITEMS`, còn lại dùng `BASE_MENU_ITEMS`.
4. `themeConfig.menu.hiddenKeys` override default hidden keys.
5. `themeConfig.menu.labelOverrides` override default label overrides.

## 10. Khi thêm page mới

Pattern bắt buộc:

1. Tạo folder page.
2. Tạo ít nhất một component fallback, thường là `PageStyle1.tsx`.
3. `index.tsx` gọi `useVariant(pageKey)`.
4. `index.tsx` dùng `DynamicVariant`.
5. Đảm bảo `fallbackName` đúng tên file đang tồn tại.
6. Nếu variant cần component đặc biệt, thêm vào `variantDefaults.ts` hoặc truyền qua `themeConfig.variants`.

## 11. Debug nhanh

Trong browser console:

```js
localStorage.getItem("selected-tenant")
JSON.parse(localStorage.getItem("full-tenant-data") || "null")
getComputedStyle(document.documentElement).getPropertyValue("--tenant-primary-color")
window.dispatchEvent(new CustomEvent("app:tenant-changed", { detail: "gobiz" }))
```

Kiểm tra variant đang resolve bằng log:

```txt
[useVariant] orders -> OrdersStyle1 (code: gd1)
```

Log này được in trong `useVariant()` cho nhánh naming convention.
