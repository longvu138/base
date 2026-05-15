# Kiến Trúc Multi-Tenant UI/Theming

Tài liệu này mô tả kiến trúc hiện tại sau khi rà source trong repo `base`.

## 1. Các lớp chính

```txt
apps/tenant-server
  -> trả tenant config, plan preset, variantCode

packages/tenant-config
  -> type tenant config
  -> applyTenantConfig()
  -> updateTenantCSSVariables()
  -> dispatchTenantChange()

packages/theme-provider
  -> ThemeProvider
  -> useTheme()
  -> useVariant()
  -> getVariantDefaults()

packages/antd-config
  -> base AntD theme light/dark cho Web/Mobile

packages/ui
  -> DynamicVariant
  -> shared UI primitives

apps/web, apps/mobile
  -> AppContent fetch tenant config
  -> routes/layout/pages
  -> page-specific Style components
```

## 2. Trách nhiệm backend

Backend hiện chỉ chịu trách nhiệm:

- lưu danh sách tenant mock trong `apps/tenant-server/src/index.js`.
- khai báo `planCode`.
- khai báo `variantCode`.
- khai báo `override.tenantConfig.themeConfig`.
- merge `PLAN_PRESETS` với `override`.
- fallback tenant id không tồn tại về `baogam`.
- fallback `variantCode` sai về `gd1`.

Backend không chịu trách nhiệm route mapping, import component, hoặc chọn file layout/page cụ thể.

## 3. Trách nhiệm frontend shared packages

`packages/tenant-config`:

- định nghĩa type `SimpleTenantConfig`, `FullTenantResponse`.
- cung cấp danh sách tenant cho dropdown qua `tenantExamples`.
- merge tenant token vào AntD theme.
- cập nhật CSS variables.
- phát event đổi tenant.

`packages/theme-provider`:

- lưu state `theme`, `uiLib`, `tenantConfig`.
- quản lý dark mode class trên `<html>`.
- resolve component name bằng `useVariant(pageKey)`.
- định nghĩa default UI behavior theo `variantCode`.

`packages/ui`:

- `DynamicVariant` lazy load component theo tên file.
- fallback sang `fallbackName` nếu file variant không tồn tại.

## 4. Trách nhiệm app Web/Mobile

Web và Mobile chịu trách nhiệm:

- đọc `selected-tenant` từ `localStorage`.
- mặc định tenant là `baogam`.
- fetch tenant config từ backend.
- cache tenant config vào `full-tenant-data`.
- dùng cache hoặc `FALLBACK_TENANT_CONFIG` khi API lỗi.
- chọn base theme Web/Mobile.
- khai báo routes.
- đặt page dispatchers và style components.

## 5. Luồng data

```txt
Tenant selector
  -> dispatchTenantChange()
  -> localStorage + event
  -> AppContent state selectedTenantId đổi
  -> fetch tenant config
  -> ThemeProvider tenantConfig đổi
  -> ConfigProvider theme đổi
  -> CSS variables đổi
  -> useVariant(pageKey) resolve lại
  -> DynamicVariant render UI variant
```

## 6. Luồng chọn UI

```txt
tenantConfig.variantCode
  -> getVariantDefaults(variantCode)
  -> useVariant(pageKey)
  -> component name
  -> DynamicVariant
  -> file .tsx trong folder page/layout
```

Thứ tự ưu tiên của `useVariant()`:

1. `themeConfig.variants[pageKey]`
2. `variantDefaults.componentOverrides[pageKey]`
3. guard hardcoded trong `useVariant()`
4. naming convention

## 7. Giao diện mặc định

Giao diện mặc định theo code hiện tại:

- tenant: `baogam`
- variant: `gd1`
- page style: `Style1`
- layout fallback: `VerticalLayout`
- theme token fallback: base AntD theme

## 8. Quy tắc tách logic và UI

Các page nên giữ pattern:

- logic gọi API/filter/pagination nằm trong hooks hoặc page connector.
- file `*StyleX.tsx` chỉ render UI.
- variant mới chỉ nên thay JSX/CSS/composition.
- không copy logic nghiệp vụ sang từng style nếu có thể dùng chung.

## 9. Điểm cần chú ý

- `DynamicVariant` không có fallback cấp 2 nếu `fallbackName` cũng sai.
- `uiLib` hiện mới được lưu trong context, chưa switch toàn bộ UI runtime.
- `variantDefaults.ts` hiện chỉ hỗ trợ menu preset type `base | gobiz`.
- Backend mock server chỉ có các variant `gd1`, `gd2`, `gd3`.
