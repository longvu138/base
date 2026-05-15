# Luồng Theming Runtime

Tài liệu này mô tả luồng màu sắc/theme theo source hiện tại.

## 1. Thành phần liên quan

| Thành phần | File | Vai trò |
|---|---|---|
| Tenant server | `apps/tenant-server/src/index.js` | Trả tenant config đã merge preset + override |
| App Web | `apps/web/src/App.tsx` | Fetch config, apply AntD theme, cập nhật CSS variables |
| App Mobile | `apps/mobile/src/App.tsx` | Flow giống Web nhưng dùng mobile base theme |
| Theme context | `packages/theme-provider/src/ThemeContext.tsx` | Giữ `theme`, `uiLib`, `tenantConfig` |
| Tenant helpers | `packages/tenant-config/src/index.ts` | `applyTenantConfig`, `updateTenantCSSVariables`, `dispatchTenantChange` |
| AntD base theme | `packages/antd-config/src/index.ts` | Base light/dark theme cho Web/Mobile |

## 2. Khởi tạo app

Khi app render lần đầu:

1. `ThemeProvider` đọc `theme-mode` từ `localStorage`, mặc định `light`.
2. `ThemeProvider` khởi tạo `uiLib = "antd"`.
3. `ThemeProvider` khởi tạo `tenantConfig = null`.
4. `AppContent` đọc `selected-tenant` từ `localStorage`.
5. Nếu chưa có `selected-tenant`, dùng `baogam`.
6. Khi chưa fetch xong config, theme đang dùng base theme từ `@repo/antd-config`.

## 3. Fetch tenant config

Web và Mobile gọi:

```txt
GET ${appConfig.be}/api/tenants/:tenantKey/config
```

Khi thành công:

```ts
setTenantConfig(data)
localStorage.setItem("full-tenant-data", JSON.stringify(data))

if (data.tenantConfig?.themeConfig?.uiLib) {
  setUiLib(data.tenantConfig.themeConfig.uiLib)
}
```

`uiLib` hiện chỉ được lưu trong context. Source hiện tại chưa có nhánh render riêng để chuyển toàn bộ UI sang MUI.

## 4. Khi API lỗi

Flow fallback trong Web và Mobile:

```txt
API lỗi
  -> đọc localStorage("full-tenant-data")
    -> parse thành công: dùng cache
    -> parse lỗi hoặc không có cache: dùng FALLBACK_TENANT_CONFIG
```

`FALLBACK_TENANT_CONFIG`:

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

Vì `themeConfig` rỗng, app dùng base token của `@repo/antd-config` và CSS variables mặc định trong `index.css`.

## 5. Merge AntD theme

Helper:

```ts
applyTenantConfig(baseTheme, tenantConfig, isDark)
```

Luồng:

1. Nếu không có `tenantConfig`, trả nguyên `baseTheme`.
2. Nếu có config, gọi `getResolvedConfig(config, isDark)`.
3. Khi dark mode bật:
   - `colorPrimaryDark` ghi đè `colorPrimary`, nếu có.
   - `colorBgContainerDark` ghi đè `colorBgContainer`, nếu có.
   - `colorBgLayoutDark` ghi đè `colorBgLayout`, nếu có.
   - `colorBorderDark` ghi đè `colorBorder`, nếu có.
   - `colorTextDark` ghi đè `colorText`, nếu có.
4. Merge `resolved.components` vào `baseTheme.components`.
5. Merge resolved config vào `baseTheme.token`.
6. Nếu có `colorPrimary`, đồng bộ thêm:
   - `colorIcon`
   - `colorLink`
   - `colorLinkHover`
   - `colorLinkActive`

Web chọn base:

```ts
isDark ? webDarkAntdTheme : webAntdTheme
```

Mobile chọn base:

```ts
isDark ? mobileDarkAntdTheme : mobileAntdTheme
```

Sau đó `ConfigProvider` nhận kết quả merge và AntD algorithm tương ứng:

```ts
algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm
```

## 6. Cập nhật CSS variables

Helper:

```ts
updateTenantCSSVariables(themeConfig, isDark)
```

Nếu không có config:

- xoá các tenant CSS variables inline trên `<html>`.
- xoá `--tenant-primary-rgb`.
- trình duyệt quay về giá trị mặc định trong `index.css`.

Nếu có config, helper cập nhật các biến active:

| Config | CSS variable |
|---|---|
| `colorPrimary` | `--tenant-primary-color` |
| `colorBgContainer` | `--tenant-bg-container` |
| `colorBgLayout` | `--tenant-bg-layout` |
| `colorBorder` | `--tenant-border-color` |
| `colorText` | `--tenant-text-color` |

Các biến dark vẫn được ghi riêng nếu config có:

| Config | CSS variable |
|---|---|
| `colorPrimaryDark` | `--tenant-primary-dark` |
| `colorBgContainerDark` | `--tenant-bg-container-dark` |
| `colorBgLayoutDark` | `--tenant-bg-layout-dark` |
| `colorBorderDark` | `--tenant-border-color-dark` |
| `colorTextDark` | `--tenant-text-color-dark` |

Các biến bổ sung:

| Config | CSS variable |
|---|---|
| `colorSuccess` | `--tenant-success-color` |
| `colorWarning` | `--tenant-warning-color` |
| `colorError` | `--tenant-error-color` |
| `borderRadius` | `--tenant-radius-antd` |

Nếu `colorPrimary` là hex hợp lệ 6 ký tự, helper còn cập nhật:

- `--tenant-primary-rgb`
- `--primary`
- `--ring`

`--primary` và `--ring` dùng format HSL để tương thích các class theo shadcn/ui/Tailwind.

## 7. Đổi tenant runtime

Đổi tenant dùng:

```ts
dispatchTenantChange(tenantKey)
```

Hàm này:

1. ghi `selected-tenant` vào `localStorage`.
2. dispatch event `app:tenant-changed`.

Web/Mobile lắng nghe event này trong `AppContent`, cập nhật `selectedTenantId`, rồi fetch lại tenant config.

## 8. Dark mode

`ThemeProvider` quản lý dark mode:

```ts
theme = "light" | "dark"
toggleTheme()
localStorage.setItem("theme-mode", theme)
document.documentElement.classList.toggle("dark", theme === "dark")
```

Khi dark mode đổi:

- AntD theme được tính lại bằng dark base theme.
- tenant config được resolve lại bằng các field `*Dark`.
- CSS variables được cập nhật lại.

## 9. Default và fallback hiện tại

| Tình huống | Kết quả |
|---|---|
| Chưa chọn tenant | `selectedTenantId = "baogam"` |
| Tenant id không tồn tại ở backend | backend trả config của `baogam` |
| `variantCode` backend sai | backend trả `gd1` |
| API tenant lỗi, cache tốt | dùng `full-tenant-data` từ cache |
| API tenant lỗi, không có cache/cache hỏng | dùng `FALLBACK_TENANT_CONFIG` |
| Không có `themeConfig` | dùng base AntD theme + CSS variables mặc định |
| Dark field không có | field light tương ứng bị xoá trong resolved dark config, sau đó AntD/base CSS xử lý phần còn lại |
