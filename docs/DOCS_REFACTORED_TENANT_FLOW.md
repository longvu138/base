# Source Hiện Tại Sau Refactor Và Cách Thêm Tenant Mới

Tài liệu này mô tả cách source đang hoạt động sau refactor theo hướng:

- UI theo tenant dùng naming convention, không map thủ công toàn bộ page.
- `variantDefaults.ts` chỉ giữ exception thật sự.
- Tenant mới nên ưu tiên tái sử dụng theme, layout, page style và logic sẵn có.

## 1. Mục tiêu của refactor

Trước đây, frontend phải khai báo nhiều mapping thủ công kiểu:

- `gd1 -> style1`
- `gd2 -> style2`
- `thanhla -> layout/page A, B, C`
- `gobiz -> layout/page A, B, C`

Sau refactor, hướng chính là:

1. Backend chỉ cần trả `variantCode`.
2. Frontend tự resolve component theo convention:
   `{PageKeyPascal}Style{VariantCodePascal}`
3. Chỉ những page đặc biệt mới cần khai báo thêm trong `variantDefaults.ts`.

Ví dụ:

- `variantCode = "thanhla"` + `pageKey = "orders"` -> `OrdersStyleThanhla`
- `variantCode = "gobiz"` + `pageKey = "layout"` -> `LayoutStyleGobiz`
- `variantCode = "default"` -> dùng `StyleDefault`

## 2. Các file chính đang tham gia

Backend:

- [apps/tenant-server/src/index.js](/Users/lovu/Desktop/base/apps/tenant-server/src/index.js)

Frontend shared:

- [packages/theme-provider/src/ThemeContext.tsx](/Users/lovu/Desktop/base/packages/theme-provider/src/ThemeContext.tsx)
- [packages/theme-provider/src/variantDefaults.ts](/Users/lovu/Desktop/base/packages/theme-provider/src/variantDefaults.ts)
- [packages/ui/src/DynamicVariant.tsx](/Users/lovu/Desktop/base/packages/ui/src/DynamicVariant.tsx)
- [packages/tenant-config/src/index.ts](/Users/lovu/Desktop/base/packages/tenant-config/src/index.ts)

Frontend app:

- [apps/web/src/App.tsx](/Users/lovu/Desktop/base/apps/web/src/App.tsx)
- [apps/mobile/src/App.tsx](/Users/lovu/Desktop/base/apps/mobile/src/App.tsx)
- [apps/web/src/components/Layout/Navigation.ts](/Users/lovu/Desktop/base/apps/web/src/components/Layout/Navigation.ts)

## 3. Runtime flow hiện tại

Luồng tổng quát:

```txt
User chọn tenant
  -> localStorage("selected-tenant")
  -> app:tenant-changed
  -> App fetch /api/tenants/:id/config
  -> ThemeProvider nhận tenantConfig
  -> applyTenantConfig + updateTenantCSSVariables
  -> page/layout gọi useVariant(pageKey, fallback)
  -> DynamicVariant load component theo tên file
  -> nếu không có file thì fallback về StyleDefault
```

### 3.1 Backend trả gì

Backend trả object tenant đã được merge từ:

```txt
PLAN_PRESETS[planCode] + tenant.override
```

Dữ liệu quan trọng nhất cho UI là:

```ts
{
  id: "gobiz",
  name: "Gobiz Logistics",
  variantCode: "gobiz",
  tenantConfig: {
    themeConfig: {
      colorPrimary: "#722ed1",
      menu: {
        hiddenKeys: [],
        labelOverrides: {}
      },
      variants: {}
    }
  }
}
```

Ý nghĩa:

- `variantCode`: quyết định naming convention UI.
- `themeConfig`: quyết định màu, token, menu override, hoặc component override mạnh nhất nếu cần.

### 3.2 App khởi tạo tenant config như thế nào

Web và mobile đều:

1. Đọc `selected-tenant` từ `localStorage`, mặc định là `baogam`.
2. Gọi API tenant config.
3. Nếu API lỗi:
   dùng cache `full-tenant-data`.
4. Nếu cache không dùng được:
   dùng `FALLBACK_TENANT_CONFIG` với `variantCode: "default"`.

Vì vậy app luôn có đường fallback để render.

### 3.3 Theme được apply như thế nào

`packages/tenant-config/src/index.ts` làm 2 việc:

1. `applyTenantConfig(...)`
   merge `themeConfig` vào base AntD theme.
2. `updateTenantCSSVariables(...)`
   sync token quan trọng ra CSS variables như:
   `--tenant-primary-color`, `--tenant-bg-layout`, `--tenant-border-color`.

Điểm chính:

- Tenant có thể chỉ đổi màu mà không cần tạo UI mới.
- Cùng một variant có thể dùng cho nhiều tenant khác nhau nhưng màu sắc khác nhau.

## 4. `useVariant()` đang hoạt động thế nào

File:

- [ThemeContext.tsx](/Users/lovu/Desktop/base/packages/theme-provider/src/ThemeContext.tsx)

Hook `useVariant(pageKey, defaultComponentName)` resolve component theo thứ tự:

1. `themeConfig.variants[pageKey]`
2. `variantDefaults.componentOverrides[pageKey]`
3. naming convention `PageKeyStyleVariantCode`
4. `defaultComponentName`
5. nếu không truyền `defaultComponentName` thì tự sinh `PageKeyStyleDefault`

Ví dụ:

```ts
useVariant("orders", "OrdersStyleDefault")
```

Kết quả:

- `variantCode = "thanhla"` -> `OrdersStyleThanhla`
- `variantCode = "gobiz"` -> `OrdersStyleGobizCombined`
- `variantCode = "default"` -> `OrdersStyleDefault`
- `variantCode = "wrong-code"` -> frontend có thể tự suy ra tên lạ, nhưng backend hiện đã chặn và fallback về `default`

### 4.1 Naming convention hiện tại

Quy ước hiện tại là:

```txt
{PageKeyPascal}Style{VariantCodePascal}.tsx
```

Ví dụ:

- `login` + `thanhla` -> `LoginStyleThanhla.tsx`
- `register` + `gobiz` -> `RegisterStyleGobiz.tsx`
- `deliveryRequests` + `newclient` -> `DeliveryRequestsStyleNewclient.tsx`
- `layout` + `newclient` -> `LayoutStyleNewclient.tsx`

Đây là cơ chế chính để tái sử dụng nhiều nhất.

## 5. `variantDefaults.ts` dùng để làm gì

File:

- [variantDefaults.ts](/Users/lovu/Desktop/base/packages/theme-provider/src/variantDefaults.ts)

File này không còn là nơi map toàn bộ page.

Vai trò hiện tại:

1. Định nghĩa default behavior chung cho mọi variant.
2. Giữ exception mặc định theo variant.
3. Giữ menu preset mặc định theo variant.

Ví dụ hiện tại:

```ts
gobiz: {
  componentOverrides: {
    orders: "OrdersStyleGobizCombined",
  },
  menu: {
    preset: "gobiz",
    labelOverrides: { "/orders": "Quản lý Tổng hợp" },
  },
}
```

Ý nghĩa:

- `gobiz` không dùng `OrdersStyleGobiz` cho orders.
- `gobiz` có preset menu riêng.

Tenant như `thanhla` hiện không cần entry riêng trong file này, vì mọi thứ đã chạy bằng convention.

## 6. `DynamicVariant` hoạt động thế nào

File:

- [DynamicVariant.tsx](/Users/lovu/Desktop/base/packages/ui/src/DynamicVariant.tsx)

Mỗi page/layout dispatcher thường có dạng:

```tsx
const variant = useVariant("orders", "OrdersStyleDefault");
const modules = import.meta.glob("./*.tsx");

return (
  <DynamicVariant
    variantName={variant}
    modules={modules}
    fallbackName="OrdersStyleDefault"
    featureName="Orders"
  />
);
```

`DynamicVariant` sẽ:

1. Tìm file `./${variantName}.tsx`.
2. Nếu không có, tìm `./${fallbackName}.tsx`.
3. Nếu fallback cũng không có, render lỗi ngay trên UI.

Kết luận:

- Naming convention chỉ hoạt động đúng nếu file thật sự tồn tại.
- Mỗi dispatcher phải có fallback hợp lệ.

## 7. Menu hiện tại được quyết định ra sao

File:

- [Navigation.ts](/Users/lovu/Desktop/base/apps/web/src/components/Layout/Navigation.ts)

Thứ tự áp dụng:

1. `variantDefaults.menu.preset`
2. `themeConfig.menu.hiddenKeys`
3. `themeConfig.menu.labelOverrides`

Hiện tại source có 2 preset:

- `base`
- `gobiz`

Điểm cần nhớ:

- Nếu tenant chỉ cần ẩn vài menu hoặc đổi label, ưu tiên làm từ backend qua `themeConfig.menu`.
- Chỉ thêm preset mới khi thật sự cần một bộ menu khác hẳn.

## 8. Khi thêm tenant mới thì backend cần làm gì

Backend gần như luôn là bước đầu tiên.

Sửa file:

- [apps/tenant-server/src/index.js](/Users/lovu/Desktop/base/apps/tenant-server/src/index.js)

### 8.1 Bắt buộc

1. Thêm tenant mới vào object `tenants`.
2. Chọn `planCode`.
3. Chọn `variantCode`.
4. Khai báo `override.tenantConfig.themeConfig` nếu cần đổi màu/token/menu/variants.

Ví dụ tenant mới nhưng tái sử dụng Thanhla:

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

### 8.2 Nếu tạo variant mới hoàn toàn

Ví dụ:

```js
variantCode: "newclient"
```

Thì backend phải thêm `newclient` vào `VARIANT_NAMES`.

Nếu không thêm:

- backend sẽ fallback `variantCode` về `default`
- frontend sẽ không có cơ hội resolve `StyleNewclient`

### 8.3 Khi nào nên dùng `themeConfig.variants`

Chỉ dùng khi cần override rất cụ thể, ví dụ:

```js
themeConfig: {
  variants: {
    orders: "OrdersStyleNewclientCombined"
  }
}
```

Use case hợp lý:

- hotfix cho một tenant cụ thể
- A/B layout đặc biệt
- một page có tên component không theo convention

Không nên dùng `themeConfig.variants` để map toàn bộ page của tenant mới, vì như vậy sẽ quay lại cách cũ, khó bảo trì.

## 9. Khi thêm tenant mới thì frontend cần làm gì

Frontend nên chia làm 3 mức.

### 9.1 Mức 1: Chỉ đổi màu, tái sử dụng toàn bộ UI

Không cần tạo file UI mới.

Chỉ cần:

1. Backend trả `variantCode` dùng lại `default`, `thanhla` hoặc `gobiz`.
2. Backend trả `themeConfig` với token/màu cần đổi.

Đây là mức tái sử dụng cao nhất.

### 9.2 Mức 2: Dùng variant cũ nhưng có vài page riêng

Ví dụ tenant dùng `thanhla`, nhưng orders cần màn riêng.

Frontend cần:

1. Tạo file theo convention hoặc tên special-case.
2. Nếu tên không theo convention, khai báo exception trong `variantDefaults.ts` hoặc backend `themeConfig.variants`.

Ví dụ:

```txt
apps/web/src/pages/Orders/OrdersStyleNewclientCombined.tsx
apps/mobile/src/pages/Orders/OrdersStyleNewclientCombined.tsx
```

Rồi chọn một trong hai hướng:

```ts
componentOverrides: {
  orders: "OrdersStyleNewclientCombined"
}
```

hoặc backend:

```js
themeConfig: {
  variants: {
    orders: "OrdersStyleNewclientCombined"
  }
}
```

### 9.3 Mức 3: Tạo variant mới hoàn toàn

Frontend cần:

1. Tạo layout theo convention nếu layout khác:
   `LayoutStyleNewclient.tsx`
2. Tạo page style theo convention cho những page cần khác:
   `OrdersStyleNewclient.tsx`, `LoginStyleNewclient.tsx`, `ProfileStyleNewclient.tsx`
3. Chỉ thêm vào `variantDefaults.ts` nếu có exception hoặc menu preset riêng.
4. Đảm bảo mọi page dispatcher có fallback `StyleDefault` hợp lệ.

## 10. Cách thêm tenant mới để tái sử dụng nhiều nhất

Thứ tự quyết định nên là:

1. Chỉ đổi theme token nếu đủ.
2. Nếu chưa đủ, dùng lại variant cũ như `thanhla` hoặc `gobiz`.
3. Nếu vẫn chưa đủ, chỉ tạo page riêng cho các màn thật sự khác.
4. Chỉ tạo variant mới hoàn toàn khi layout và nhiều page đã khác đáng kể.
5. Chỉ thêm mapping vào `variantDefaults.ts` khi convention không giải quyết được.

Nguyên tắc:

- đừng map lại tất cả page nếu chỉ 1-2 page khác.
- đừng tạo preset menu mới nếu chỉ cần ẩn/đổi tên vài item.
- đừng dùng backend override toàn bộ UI nếu file có thể đi theo convention.

## 11. Checklist chuẩn khi thêm tenant mới

### Backend

- [ ] Thêm tenant vào `tenants`.
- [ ] Chọn đúng `planCode`.
- [ ] Chọn đúng `variantCode`.
- [ ] Nếu là variant mới, thêm vào `VARIANT_NAMES`.
- [ ] Khai báo `themeConfig` nếu cần đổi màu, radius, menu, component override.

### Frontend

- [ ] Nếu cần hiển thị tenant trong dropdown, thêm vào `tenantExamples`.
- [ ] Nếu chỉ đổi màu, không tạo file UI mới.
- [ ] Nếu cần page mới, đặt đúng tên theo convention.
- [ ] Nếu có exception, thêm đúng một chỗ ở `variantDefaults.ts` hoặc `themeConfig.variants`.
- [ ] Mọi page/layout dispatcher đều có fallback hợp lệ.
- [ ] Nếu web và mobile cùng hỗ trợ tenant đó, kiểm tra cả hai app.

### QA

- [ ] Đổi tenant runtime hoạt động đúng.
- [ ] Reload vẫn giữ tenant đúng.
- [ ] Variant code sai fallback về `default`.
- [ ] Thiếu file variant fallback về `StyleDefault`.
- [ ] API lỗi vẫn dùng cache hoặc fallback config.
- [ ] Test light mode và dark mode.

## 12. Kết luận ngắn

Source hiện tại sau refactor đang đi theo mô hình:

- backend quyết định `variantCode` và theme config
- frontend tự resolve UI bằng convention
- `variantDefaults.ts` chỉ giữ exception
- `DynamicVariant` chịu trách nhiệm fallback file

Nếu muốn thêm tenant mới theo cách bền nhất:

1. ưu tiên tái sử dụng `default`, `thanhla`, `gobiz`
2. chỉ tạo file mới cho page thực sự khác
3. chỉ thêm mapping khi naming convention không đủ

Đó là cách ít sửa code nhất và giữ source dễ mở rộng nhất.
