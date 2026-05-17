# SOP: Thêm Tenant Mới Với UI Riêng

Quy trình này bám source hiện tại trong repo `base`.

## 1. Thêm tenant ở backend

Sửa:

```txt
apps/tenant-server/src/index.js
```

Thêm tenant vào object `tenants`:

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
        borderRadius: 10
      }
    }
  }
}
```

Chỉ dùng `variantCode` đã có trong `VARIANT_NAMES`:

- `default`
- `thanhla`
- `gobiz`

Nếu dùng variant khác mà chưa thêm vào `VARIANT_NAMES`, backend sẽ fallback về `default`.

## 2. Thêm tenant vào selector

Sửa:

```txt
packages/tenant-config/src/index.ts
```

Thêm vào `tenantExamples`:

```ts
newclient: {
  name: "New Client Logistics",
}
```

Danh sách này chỉ dùng cho dropdown/select tenant. Config thật vẫn lấy từ tenant server.

## 3. Chọn hướng UI

Có 3 hướng phổ biến.

### Hướng A: Dùng lại `default`

Dùng khi tenant chỉ đổi màu/token, không cần UI riêng.

```js
variantCode: "default"
```

Không cần tạo thêm `StyleX`.

### Hướng B: Dùng lại `thanhla` hoặc `gobiz`

Dùng khi tenant muốn cùng layout/behavior với Thanhla hoặc Gobiz.

```js
variantCode: "thanhla"
```

hoặc:

```js
variantCode: "gobiz"
```

### Hướng C: Thêm behavior mới cho variant hiện có

Sửa:

```txt
packages/theme-provider/src/variantDefaults.ts
```

Thêm hoặc sửa `componentOverrides`, `menu`, `features`.

Ví dụ:

```ts
thanhla: {
  componentOverrides: {
    layout: "LayoutStyleThanhla",
    orders: "OrdersStyleThanhla",
    profile: "ProfileStyleThanhla"
  },
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

Nếu muốn tạo variant mới như `gd4`, phải làm đủ:

1. thêm `gd4` vào `VARIANT_NAMES` ở tenant server.
2. thêm `gd4` vào `VARIANT_DEFAULTS`.
3. tạo đủ style/layout cần thiết.
4. đảm bảo fallback của từng page tồn tại.

## 4. Tạo layout riêng nếu cần

Web layout:

```txt
apps/web/src/components/Layout/
```

Mobile layout:

```txt
apps/mobile/src/components/Layout/
```

Tạo file mới, ví dụ:

```txt
NewClientLayout.tsx
```

Layout phải render `<Outlet />` để route con hiển thị.

Sau đó map trong `variantDefaults.ts`:

```ts
componentOverrides: {
  layout: "NewClientLayout"
}
```

Layout dispatcher fallback về `LayoutStyleDefault`.

## 5. Tạo page style mới

Ví dụ thêm style cho Orders Web:

```txt
apps/web/src/pages/Orders/OrdersStyleThanhla.tsx
```

Quy tắc:

- giữ logic ở hook/page connector.
- file `*StyleX.tsx` chỉ render UI.
- export component đúng tên file hoặc default export.
- nếu page dùng `DynamicVariant`, file style phải nằm cùng folder với `index.tsx`.

Ví dụ dispatcher:

```tsx
const variant = useVariant("orders");
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

## 6. Cấu hình menu

Web menu nằm ở:

```txt
apps/web/src/components/Layout/Navigation.ts
```

Nếu chỉ ẩn hoặc đổi tên menu item, ưu tiên dùng `themeConfig.menu`:

```js
themeConfig: {
  menu: {
    hiddenKeys: ["/shipments"],
    labelOverrides: {
      "/orders": "Quản lý đơn"
    }
  }
}
```

Nếu cần menu preset mới:

1. thêm type preset mới trong `VariantMenuDefaults`.
2. tạo menu item list mới trong `Navigation.ts`.
3. cập nhật logic chọn `baseItems`.
4. set preset trong `variantDefaults.ts`.

Hiện source chỉ type sẵn `base | gobiz`.

## 7. Kiểm tra fallback

Bắt buộc kiểm tra:

- tenant không tồn tại có fallback về `baogam`.
- API tenant lỗi có dùng cache hoặc `FALLBACK_TENANT_CONFIG`.
- variant sai có bị backend trả `default`.
- page thiếu style có fallback về `fallbackName`.
- `fallbackName` thật sự tồn tại.
- layout thiếu file có fallback `LayoutStyleDefault`.

## 8. QA tối thiểu

1. Chạy tenant server.
2. Chạy Web/Mobile app.
3. Chọn tenant từ dropdown.
4. Reload trang để kiểm tra `selected-tenant`.
5. Test light mode và dark mode.
6. Test các route chính: dashboard, orders, shipments, profile.
7. Test các action nghiệp vụ quan trọng.
8. Xoá `full-tenant-data`, tắt backend, reload để kiểm tra hardcoded fallback.
9. Sửa tạm tenant id không tồn tại để kiểm tra fallback backend về `baogam`.

## 9. Checklist hoàn tất

- [ ] Tenant đã thêm ở `apps/tenant-server/src/index.js`.
- [ ] Tenant đã thêm ở `tenantExamples` nếu cần hiển thị dropdown.
- [ ] `variantCode` hợp lệ.
- [ ] Theme token đã có light/dark nếu cần.
- [ ] `variantDefaults.ts` đã map layout/page/menu nếu cần.
- [ ] File `*StyleX.tsx` đã tồn tại.
- [ ] Mọi `fallbackName` trỏ tới file thật.
- [ ] Đã test đổi tenant runtime.
- [ ] Đã test reload/browser cache.
- [ ] Đã test API lỗi/cache lỗi.
