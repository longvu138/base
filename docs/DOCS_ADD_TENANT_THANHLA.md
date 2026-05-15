# Tenant `thanhla`: Trạng Thái Hiện Tại Và Cách Mở Rộng

Tài liệu này đã được cập nhật theo code hiện tại. `thanhla` không còn là kế hoạch `gd4`; trong source hiện tại tenant này đang dùng `gd2`.

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
  variantCode: "gd2",
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

## 3. Variant defaults cho `gd2`

File:

```txt
packages/theme-provider/src/variantDefaults.ts
```

`gd2` hiện map:

| Page key | Component |
|---|---|
| `layout` | `ThanhlaLayout` |
| `login` | `LoginStyle2` |
| `register` | `RegisterStyle2` |
| `dashboard` | `DashboardStyle2` |
| `orders` | `OrdersStyle2` |
| `orderDetail` | `OrderDetailStyle2` |
| `shipments` | `Shipments` |
| `shipmentDetail` | `ShipmentDetailStyle2` |
| `claims` | `ClaimsStyle2` |
| `packages` | `PackagesStyle2` |
| `deliveryRequests` | `DeliveryRequestsStyle2` |
| `createClaim` | `CreateClaimStyle2` |
| `deliveryNotes` | `DeliveryNotesStyle2` |
| `withdrawalSlips` | `WithdrawalSlipsStyle2` |
| `waybills` | `WaybillsStyle2` |
| `profile` | `ProfileStyle2` |
| `notifications` | `NotificationsStyle2` |

Lưu ý mapping lệch tên trên Web:

| Page key | Mapping `gd2` | File Web đang có | Kết quả hiện tại |
|---|---|---|---|
| `deliveryNotes` | `DeliveryNotesStyle2` | `DeliveryNoteStyle2.tsx` | fallback theo page |
| `packages` | `PackagesStyle2` | `PackageStyle2.tsx` | fallback theo page |
| `withdrawalSlips` | `WithdrawalSlipsStyle2` | `WithdrawalSlipStyle2.tsx` | fallback theo page |

Mobile có file `PackagesStyle2.tsx` và `WithdrawalSlipsStyle2.tsx`, nhưng `deliveryNotes` vẫn lệch vì file là `DeliveryNoteStyle2.tsx`.

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
apps/web/src/components/Layout/ThanhlaLayout.tsx
```

Mobile:

```txt
apps/mobile/src/components/Layout/ThanhlaLayout.tsx
```

Layout được chọn bằng:

```ts
useVariant("layout")
```

Với `variantCode = "gd2"`, `variantDefaults` trả `ThanhlaLayout`.

Nếu file layout không load được theo tên variant, layout dispatcher fallback về `VerticalLayout`.

## 5. Page style và fallback

Các page dùng `DynamicVariant` và có `fallbackName` riêng.

Ví dụ Web Orders:

```tsx
const variant = useVariant("orders");

<DynamicVariant
  variantName={variant}
  modules={modules}
  fallbackName="OrdersStyle1"
  featureName="Orders"
/>
```

Với Thanhla:

- `useVariant("orders")` trả `OrdersStyle2`.
- nếu `OrdersStyle2.tsx` không tồn tại, `DynamicVariant` fallback về `OrdersStyle1`.

Lưu ý: fallback chỉ hoạt động nếu file fallback thật sự tồn tại.

## 6. Guard riêng cho OrderDetail

`useVariant()` hiện có guard:

```ts
if (variantCode === "gd2" && pageKey === "orderDetail") {
  return "OrderDetailStyle1";
}
```

Tuy nhiên `variantDefaults.gd2.componentOverrides` cũng đang khai báo:

```ts
orderDetail: "OrderDetailStyle2"
```

Vì `variantDefaults` được kiểm tra trước guard, source hiện tại sẽ trả `OrderDetailStyle2` cho `gd2` nếu mapping này còn tồn tại.

Nếu muốn thật sự ép `gd2` về `OrderDetailStyle1`, cần bỏ `orderDetail` khỏi `variantDefaults.gd2.componentOverrides` hoặc đổi mapping trực tiếp thành `OrderDetailStyle1`.

## 7. Khi muốn mở rộng Thanhla

Nếu chỉ đổi màu:

- sửa `override.tenantConfig.themeConfig` của `thanhla`.

Nếu đổi page UI:

- tạo/sửa file `*Style2.tsx` trong folder page tương ứng.
- hoặc override page key trong `variantDefaults.gd2.componentOverrides`.

Nếu đổi menu:

- ưu tiên cấu hình `themeConfig.menu.hiddenKeys`.
- ưu tiên cấu hình `themeConfig.menu.labelOverrides`.
- nếu cần menu mới hoàn toàn, sửa `Navigation.ts` và type preset.

Nếu đổi layout:

- sửa `ThanhlaLayout.tsx`.
- hoặc đổi `componentOverrides.layout`.

## 8. Không nên làm gì

- Không tạo `gd4` cho Thanhla nếu chưa thêm `gd4` vào `VARIANT_NAMES` và `VARIANT_DEFAULTS`.
- Không copy logic API/filter/pagination vào `*Style2.tsx`.
- Không assume mọi page đều có `Style2`; luôn kiểm tra file thật và fallback.
- Không sửa business hooks chỉ để đổi giao diện.

## 9. QA cho Thanhla

Checklist:

- [ ] Chọn tenant `thanhla` từ dropdown.
- [ ] Kiểm tra backend trả `variantCode: "gd2"`.
- [ ] Kiểm tra layout là `ThanhlaLayout`.
- [ ] Kiểm tra màu primary là `#0ea5e9`.
- [ ] Kiểm tra border là `#7dd3fc`.
- [ ] Kiểm tra radius là `10`.
- [ ] Kiểm tra các page chính: login, register, dashboard, orders, profile.
- [ ] Kiểm tra dark mode.
- [ ] Kiểm tra fallback khi xoá/tắt thử một style file trong môi trường dev.
- [ ] Kiểm tra reload vẫn giữ `selected-tenant = "thanhla"`.
