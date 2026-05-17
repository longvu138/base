# Tenant `thanhla`: Trạng Thái Hiện Tại Và Cách Mở Rộng

Tài liệu này đã được cập nhật theo code hiện tại. `thanhla` không còn là kế hoạch `gd4`; trong source hiện tại tenant này đang dùng `thanhla`.

## 1. Backend config hiện tại

File:

```txt
apps/tenant-server/src/index.js
```

Tenant hiện tại:

```js
thanhla: {
  name: "Thanhla Logistics",
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

Vì `planCode = "paid"`, config cuối cùng là `PLAN_PRESETS.paid` deep merge với override trên.

## 2. Tenant selector

File:

```txt
packages/tenant-config/src/index.ts
```

`tenantExamples` đã có:

```ts
thanhla: {
  name: "Thanhla Logistics",
}
```

Do đó tenant này đã xuất hiện trong dropdown nếu UI dùng `getTenantOptions()`.

## 3. Variant defaults cho `thanhla`

File:

```txt
packages/theme-provider/src/variantDefaults.ts
```

`thanhla` hiện map:

| Page key | Component |
|---|---|
| `layout` | `LayoutStyleThanhla` |
| `login` | `LoginStyleThanhla` |
| `register` | `RegisterStyleThanhla` |
| `dashboard` | `DashboardStyleThanhla` |
| `orders` | `OrdersStyleThanhla` |
| `orderDetail` | `OrderDetailStyleThanhla` |
| `shipments` | `Shipments` |
| `shipmentDetail` | `ShipmentDetailStyleThanhla` |
| `claims` | `ClaimsStyleThanhla` |
| `packages` | `PackagesStyleThanhla` |
| `deliveryRequests` | `DeliveryRequestsStyleThanhla` |
| `createClaim` | `CreateClaimStyleThanhla` |
| `deliveryNotes` | `DeliveryNotesStyleThanhla` |
| `withdrawalSlips` | `WithdrawalSlipsStyleThanhla` |
| `waybills` | `WaybillsStyleThanhla` |
| `profile` | `ProfileStyleThanhla` |
| `notifications` | `NotificationsStyleThanhla` |

Lưu ý mapping lệch tên trên Web:

| Page key | Mapping `thanhla` | File Web đang có | Kết quả hiện tại |
|---|---|---|---|
| `deliveryNotes` | `DeliveryNotesStyleThanhla` | `DeliveryNoteStyleThanhla.tsx` | fallback theo page |
| `packages` | `PackagesStyleThanhla` | `PackageStyleThanhla.tsx` | fallback theo page |
| `withdrawalSlips` | `WithdrawalSlipsStyleThanhla` | `WithdrawalSlipStyleThanhla.tsx` | fallback theo page |

Mobile có file `PackagesStyleThanhla.tsx` và `WithdrawalSlipsStyleThanhla.tsx`, nhưng `deliveryNotes` vẫn lệch vì file là `DeliveryNoteStyleThanhla.tsx`.

Menu:

```ts
menu: {
  preset: "base",
  hiddenKeys: [],
  labelOverrides: {}
}
```

Feature:

```ts
features: {
  shipmentStatusDisplay: "filter"
}
```

## 4. Layout Thanhla

Web:

```txt
apps/web/src/components/Layout/LayoutStyleThanhla.tsx
```

Mobile:

```txt
apps/mobile/src/components/Layout/LayoutStyleThanhla.tsx
```

Layout được chọn bằng:

```ts
useVariant("layout")
```

Với `variantCode = "thanhla"`, `variantDefaults` trả `LayoutStyleThanhla`.

Nếu file layout không load được theo tên variant, layout dispatcher fallback về `LayoutStyleDefault`.

## 5. Page style và fallback

Các page dùng `DynamicVariant` và có `fallbackName` riêng.

Ví dụ Web Orders:

```tsx
const variant = useVariant("orders");

<DynamicVariant
  variantName={variant}
  modules={modules}
  fallbackName="OrdersStyleDefault"
  featureName="Orders"
/>
```

Với Thanhla:

- `useVariant("orders")` trả `OrdersStyleThanhla`.
- nếu `OrdersStyleThanhla.tsx` không tồn tại, `DynamicVariant` fallback về `OrdersStyleDefault`.

Lưu ý: fallback chỉ hoạt động nếu file fallback thật sự tồn tại.

## 6. Default khi không có mapping

`useVariant()` hiện không còn nhánh xử lý riêng theo `variantCode`.

Thứ tự resolve:

1. `themeConfig.variants[pageKey]`
2. `variantDefaults.thanhla.componentOverrides[pageKey]`
3. `defaultComponentName` của dispatcher, ví dụ `OrderDetailStyleDefault`

Nếu muốn ép `thanhla` về `OrderDetailStyleDefault`, đổi mapping `orderDetail` trong `variantDefaults.thanhla.componentOverrides` thành `OrderDetailStyleDefault` hoặc override qua tenant config.

## 7. Khi muốn mở rộng Thanhla

Nếu chỉ đổi màu:

- sửa `override.tenantConfig.themeConfig` của `thanhla`.

Nếu đổi page UI:

- tạo/sửa file `*StyleThanhla.tsx` trong folder page tương ứng.
- hoặc override page key trong `variantDefaults.thanhla.componentOverrides`.

Nếu đổi menu:

- ưu tiên cấu hình `themeConfig.menu.hiddenKeys`.
- ưu tiên cấu hình `themeConfig.menu.labelOverrides`.
- nếu cần menu mới hoàn toàn, sửa `Navigation.ts` và type preset.

Nếu đổi layout:

- sửa `LayoutStyleThanhla.tsx`.
- hoặc đổi `componentOverrides.layout`.

## 8. Không nên làm gì

- Không tạo `gd4` cho Thanhla nếu chưa thêm `gd4` vào `VARIANT_NAMES` và `VARIANT_DEFAULTS`.
- Không copy logic API/filter/pagination vào `*StyleThanhla.tsx`.
- Không assume mọi page đều có `StyleThanhla`; luôn kiểm tra file thật và fallback.
- Không sửa business hooks chỉ để đổi giao diện.

## 9. QA cho Thanhla

Checklist:

- [ ] Chọn tenant `thanhla` từ dropdown.
- [ ] Kiểm tra backend trả `variantCode: "thanhla"`.
- [ ] Kiểm tra layout là `LayoutStyleThanhla`.
- [ ] Kiểm tra màu primary là `#0ea5e9`.
- [ ] Kiểm tra border là `#7dd3fc`.
- [ ] Kiểm tra radius là `10`.
- [ ] Kiểm tra các page chính: login, register, dashboard, orders, profile.
- [ ] Kiểm tra dark mode.
- [ ] Kiểm tra fallback khi xoá/tắt thử một style file trong môi trường dev.
- [ ] Kiểm tra reload vẫn giữ `selected-tenant = "thanhla"`.
