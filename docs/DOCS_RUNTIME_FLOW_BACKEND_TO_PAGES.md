# Runtime Flow: Backend -> Frontend -> Router -> Page

Tài liệu này phản ánh source hiện tại trong repo `base`, được rà lại từ:

- `apps/tenant-server/src/index.js`
- `apps/web/src/App.tsx`
- `apps/mobile/src/App.tsx`
- `packages/theme-provider/src/ThemeContext.tsx`
- `packages/theme-provider/src/variantDefaults.ts`
- `packages/ui/src/DynamicVariant.tsx`
- `apps/web/src/routes.tsx`
- `apps/mobile/src/routes.tsx`

## 1. Backend trả tenant config

Endpoint hiện tại:

```txt
GET /api/tenants/:id/config
```

Backend định nghĩa tenant trong `apps/tenant-server/src/index.js`.

Các tenant hiện có:

| Tenant | Plan | Variant |
|---|---|---|
| `baogam` | `free` | `gd1` |
| `thien_long` | `free` | `gd1` |
| `free_sample_3` | `free` | `gd1` |
| `gobiz` | `paid` | `gd3` |
| `tetetete` | `paid` | `gd2` |
| `thanhla` | `paid` | `gd2` |

Luồng resolve backend:

1. Lấy tenant theo `:id`.
2. Nếu không có tenant đó, fallback về `baogam`.
3. Lấy `planCode` để nạp preset trong `PLAN_PRESETS`.
4. Merge preset với `tenant.override` bằng `deepMerge`.
5. Validate `variantCode` bằng `VARIANT_NAMES`.
6. Nếu `variantCode` sai/không nằm trong `gd1`, `gd2`, `gd3`, backend trả `variantCode: "gd1"`.

Response trả về có dạng:

```json
{
  "id": "gobiz",
  "tenant": "gobiz",
  "name": "Gobiz Logistics",
  "variantCode": "gd3",
  "tenantConfig": {
    "themeConfig": {
      "uiLib": "antd",
      "colorPrimary": "#722ed1",
      "colorBgLayout": "#f9f5ff",
      "colorBorder": "#9254de",
      "borderRadius": 12,
      "colorBgLayoutDark": "#1a0f2e"
    }
  }
}
```

Backend hiện không trả `variantName`, không trả route mapping, và không trả mapping layout/page phức tạp. Frontend tự quyết định UI theo `variantCode`.

## 2. Frontend fetch config và đặt vào ThemeContext

Web và Mobile có flow gần như giống nhau:

- Web: `apps/web/src/App.tsx`
- Mobile: `apps/mobile/src/App.tsx`

Luồng runtime:

1. Đọc tenant đang chọn từ `localStorage("selected-tenant")`.
2. Nếu chưa có, mặc định là `baogam`.
3. Gọi `fetchAppData(selectedTenantId)`.
4. Fetch `${appConfig.be}/api/tenants/${tenantKey}/config`.
5. Nếu thành công:
   - `setTenantConfig(data)` vào `ThemeProvider`.
   - lưu `full-tenant-data` vào `localStorage`.
   - nếu có `themeConfig.uiLib` thì cập nhật `uiLib` trong context.
6. Nếu API lỗi:
   - thử đọc `full-tenant-data` từ cache.
   - nếu cache parse được thì dùng cache.
   - nếu không có cache hoặc cache hỏng thì dùng `FALLBACK_TENANT_CONFIG`.

`FALLBACK_TENANT_CONFIG` hardcoded ở cả Web và Mobile:

```ts
{
  id: "fallback",
  name: "Default",
  variantCode: "gd1",
  tenantConfig: {
    themeConfig: {}
  }
}
```

## 3. Theme Provider và default runtime

`ThemeProvider` nằm ở `packages/theme-provider/src/ThemeContext.tsx`.

State mặc định:

```ts
theme = localStorage.getItem("theme-mode") || "light"
uiLib = "antd"
tenantConfig = null
```

Khi chưa có tenant config, `useVariant()` tự coi `variantCode` là `gd1`.

Dark mode chỉ quản lý class `.dark` trên `<html>` và lưu `theme-mode` vào `localStorage`.

## 4. Apply theme token và CSS variables

Web dùng:

- light: `webAntdTheme`
- dark: `webDarkAntdTheme`

Mobile dùng:

- light: `mobileAntdTheme`
- dark: `mobileDarkAntdTheme`

Mỗi lần `themeConfig` hoặc dark mode đổi:

1. `updateTenantCSSVariables(themeConfig, isDark)` cập nhật CSS variables trên `document.documentElement`.
2. `applyTenantConfig(baseTheme, themeConfig, isDark)` merge tenant config vào AntD theme.
3. `ConfigProvider` nhận theme cuối cùng.

Nếu `themeConfig` không tồn tại, app dùng base theme từ `@repo/antd-config` và CSS variables mặc định trong `index.css`.

## 5. Resolve component variant

Hook chính:

```ts
useVariant(pageKey)
```

Thứ tự ưu tiên hiện tại:

1. `themeConfig.variants[pageKey]`, nếu backend/config truyền override trực tiếp.
2. `getVariantDefaults(variantCode).componentOverrides[pageKey]`.
3. Guard riêng: nếu `variantCode === "gd2"` và `pageKey === "orderDetail"` thì trả `OrderDetailStyle1`.
4. Naming convention: `${PageKey}Style${numberFromVariantCode}`.

Lưu ý quan trọng: guard ở bước 3 chỉ chạy nếu bước 2 không trả override. Source hiện tại đang có `gd2.componentOverrides.orderDetail = "OrderDetailStyle2"`, nên guard `gd2 + orderDetail -> OrderDetailStyle1` không có hiệu lực cho cấu hình hiện tại.

Ví dụ:

| Input | Kết quả |
|---|---|
| `pageKey = "orders"`, `variantCode = "gd1"` | `OrdersStyle1` |
| `pageKey = "orders"`, `variantCode = "gd2"` | `OrdersStyle2` từ `variantDefaults` |
| `pageKey = "orders"`, `variantCode = "gd3"` | `OrdersCombined` từ `variantDefaults` |
| `pageKey = "login"`, `variantCode = "gd3"` | `LoginStyle3` theo naming convention |
| `pageKey = "layout"`, `variantCode = "gd3"` | `SpecializedLayout` |
| `pageKey = "layout"`, `variantCode = "gd2"` | `ThanhlaLayout` |

## 6. Variant defaults hiện tại

File:

```txt
packages/theme-provider/src/variantDefaults.ts
```

Default chung nếu không có variant hoặc variant không được định nghĩa:

```ts
{
  componentOverrides: {},
  menu: {
    preset: "base",
    hiddenKeys: [],
    labelOverrides: {}
  },
  features: {
    shipmentStatusDisplay: "filter"
  }
}
```

`gd2` hiện đại/Thanhla:

- layout: `ThanhlaLayout`
- login/register/dashboard/orders/orderDetail/... dùng `Style2`
- shipments dùng `Shipments`
- menu preset `base`
- shipment status display `filter`

Một số mapping `gd2` hiện lệch tên với file Web đang có:

| Page key | Mapping trong `variantDefaults` | File Web đang có | Runtime Web |
|---|---|---|---|
| `deliveryNotes` | `DeliveryNotesStyle2` | `DeliveryNoteStyle2.tsx` | fallback theo dispatcher |
| `packages` | `PackagesStyle2` | `PackageStyle2.tsx` | fallback theo dispatcher |
| `withdrawalSlips` | `WithdrawalSlipsStyle2` | `WithdrawalSlipStyle2.tsx` | fallback theo dispatcher |

Mobile không lệch ở `packages` và `withdrawalSlips`, nhưng `deliveryNotes` cũng đang dùng file `DeliveryNoteStyle2.tsx` trong khi mapping là `DeliveryNotesStyle2`.

`gd3` Gobiz:

- layout: `SpecializedLayout`
- orders: `OrdersCombined`
- shipments: `Shipments`
- notifications: `NotificationsStyle3`
- createClaim: `CreateClaimStyle3`
- menu preset `gobiz`
- label `/orders`: `Quản lý Tổng hợp`
- shipment status display `tabs`

## 7. Router và page dispatcher

Web routes:

- Public: `/login`, `/register`
- Private: các route còn lại nằm dưới `<Layout />`
- Route không khớp dưới private layout redirect về `/dashboard`

Mobile routes:

- Public: `/login`, `/register`
- Private: các route còn lại nằm dưới `<Layout />`
- Route không khớp redirect về `/`

Mỗi page variant thường có pattern:

```tsx
const variant = useVariant("orders");
const modules = import.meta.glob("./*.tsx");

return (
  <DynamicVariant
    variantName={variant}
    modules={modules}
    fallbackName="OrdersStyle1"
    featureName="Orders"
  />
);
```

## 8. DynamicVariant fallback

`DynamicVariant` nằm ở `packages/ui/src/DynamicVariant.tsx`.

Luồng:

1. Tìm module `./${variantName}.tsx` trong `import.meta.glob`.
2. Nếu có, lazy import và render component.
3. Nếu không có, log warning và import `./${fallbackName}.tsx`.
4. Trong lúc lazy load, render AntD `Spin`.

Quan trọng: `DynamicVariant` không có fallback cấp 2 nếu cả `variantName` và `fallbackName` đều không tồn tại. Khi thêm page mới, bắt buộc đảm bảo file fallback thật sự tồn tại.

## 9. Kết luận về giao diện mặc định

Theo code hiện tại:

- Tenant mặc định khi client chưa chọn là `baogam`.
- Tenant không tồn tại ở backend fallback về `baogam`.
- Variant sai ở backend fallback về `gd1`.
- API tenant lỗi thì frontend dùng cache, sau đó mới dùng `FALLBACK_TENANT_CONFIG`.
- `FALLBACK_TENANT_CONFIG` dùng `variantCode: "gd1"` và `themeConfig: {}`.
- Khi thiếu file UI variant, page/layout fallback theo `fallbackName` riêng của dispatcher.
- Khi chưa có tenant config, app dùng base AntD theme và CSS variables mặc định.
