# Multi-Tenant UI Monorepo

Repo này là một monorepo React/Vite cho bài toán multi-tenant UI, gồm:

- `apps/web`: web app
- `apps/mobile`: mobile web app
- `packages/*`: theme, hooks, API client, UI shared components

Source hiện tại đã được refactor theo hướng:

- backend trả `variantCode` + `themeConfig`
- frontend tự resolve UI theo naming convention
- không còn map thủ công toàn bộ page kiểu `gd1 -> style1`, `gd2 -> style2`
- `variantDefaults.ts` chỉ giữ exception thật sự

## Cấu trúc chính

### `apps/`

- `web/`
  web app chạy ở `http://localhost:3000`
- `mobile/`
  mobile app chạy ở `http://localhost:3001`

### `packages/`

- `theme-provider/`
  chứa `ThemeProvider`, `useTheme()`, `useVariant()`, `variantDefaults.ts`
- `tenant-config/`
  type tenant config, apply AntD theme, sync CSS variables, tenant selector helpers
- `ui/`
  `DynamicVariant` và shared UI components
- `hooks/`, `api/`, `util/`, `config/`
  logic và tiện ích dùng chung

## Cách source hoạt động

Luồng chính:

```txt
User chọn tenant
  -> localStorage("selected-tenant")
  -> app fetch /api/tenants/:id/config
  -> ThemeProvider nhận tenantConfig
  -> applyTenantConfig + updateTenantCSSVariables
  -> page/layout gọi useVariant(pageKey, fallbackName)
  -> DynamicVariant load file component đúng variant
  -> nếu thiếu file thì fallback về StyleDefault
```

### `variantCode` dùng để làm gì

`variantCode` quyết định naming convention của UI.

Ví dụ:

- `orders` + `thanhla` -> `OrdersStyleThanhla`
- `layout` + `gobiz` -> `LayoutStyleGobiz`
- `login` + `default` -> `LoginStyleDefault`

Convention hiện tại:

```txt
{PageKeyPascal}Style{VariantCodePascal}.tsx
```

### `variantDefaults.ts` dùng để làm gì

File:

- `packages/theme-provider/src/variantDefaults.ts`

File này không còn là nơi map tất cả page.

Nó chỉ giữ:

- default behavior chung của variant
- exception mặc định theo variant
- menu preset mặc định theo variant

Ví dụ hiện tại:

- `gobiz.orders -> OrdersStyleGobizCombined`
- `gobiz.menu.preset -> gobiz`

Nếu tenant đi đúng convention thì không cần thêm vào file này.

### `themeConfig` dùng để làm gì

Backend có thể trả:

- token màu như `colorPrimary`, `colorBorder`, `colorBgLayout`
- `menu.hiddenKeys`
- `menu.labelOverrides`
- `variants`

`themeConfig.variants` là override mạnh nhất ở frontend, nhưng chỉ nên dùng cho exception cụ thể. Không nên dùng để map toàn bộ page của tenant mới.

## Cài đặt và chạy dự án

Yêu cầu:

- Node.js `>= 18`
- `pnpm`

Cài dependencies:

```bash
pnpm install
```

Chạy toàn bộ workspace:

```bash
pnpm dev
```

Thông thường:

- web: `http://localhost:3000`
- mobile: `http://localhost:3001`

Chạy kiểm tra type:

```bash
pnpm check-types
```

Build toàn bộ repo:

```bash
pnpm build
```

## Cách thêm tenant mới

### Trường hợp 1: chỉ đổi màu, tái sử dụng UI cũ

Đây là hướng nên ưu tiên.

Tenant config:

1. Chọn `planCode`
2. Chọn `variantCode` dùng lại như `default`, `thanhla` hoặc `gobiz`
3. Trả `themeConfig` nếu cần đổi màu/token/menu

Ví dụ:

```js
newclient: {
  name: "New Client Logistics",
  planCode: "paid",
  variantCode: "thanhla",
  override: {
    tenantConfig: {
      themeConfig: {
        colorPrimary: "#0ea5e9",
        colorBorder: "#7dd3fc",
        borderRadius: 10,
      },
    },
  },
}
```

Frontend:

- không cần tạo file UI mới nếu tenant chỉ đổi theme

### Trường hợp 2: dùng lại variant cũ nhưng có vài page riêng

Frontend:

1. Tạo file page theo convention hoặc tên special-case
2. Nếu không theo convention, thêm exception ở `variantDefaults.ts` hoặc backend `themeConfig.variants`

Ví dụ:

```txt
apps/web/src/pages/Orders/OrdersStyleNewclientCombined.tsx
```

### Trường hợp 3: tạo variant mới hoàn toàn

Tenant config:

1. Dùng `variantCode: "newclient"`
2. Bảo đảm API/cấu hình tenant trả đúng `variantCode`

Frontend:

1. Tạo layout nếu cần:
   `LayoutStyleNewclient.tsx`
2. Tạo page style theo convention:
   `OrdersStyleNewclient.tsx`, `LoginStyleNewclient.tsx`, `ProfileStyleNewclient.tsx`
3. Chỉ thêm vào `variantDefaults.ts` khi có exception thật sự

## Nguyên tắc mở rộng nên giữ

- Ưu tiên đổi `themeConfig` trước khi tạo UI mới
- Ưu tiên tái sử dụng `default`, `thanhla`, `gobiz`
- Chỉ tạo page mới cho màn thật sự khác
- Chỉ thêm mapping vào `variantDefaults.ts` khi convention không đủ
- Luôn đảm bảo mỗi page/layout dispatcher có fallback `StyleDefault` hợp lệ

## Tài liệu chính

Doc chi tiết nhất cho flow hiện tại:

- [docs/DOCS_REFACTORED_TENANT_FLOW.md](docs/DOCS_REFACTORED_TENANT_FLOW.md)

Reference token AntD:

- [docs/ANTD_COMPONENT_TOKENS.csv](docs/ANTD_COMPONENT_TOKENS.csv)
