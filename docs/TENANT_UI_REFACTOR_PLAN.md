# Tenant UI Refactor Plan

## Bối Cảnh

Source hiện tại đang có pattern tạo file theo dạng `PageStyleTenant.tsx`, ví dụ:

- `OrdersStyleDefault.tsx`
- `OrdersStyleGobiz.tsx`
- `OrdersStyleThanhla.tsx`
- `OrdersStyleGobizCombined.tsx`

Pattern này phù hợp khi tenant khác UI nhiều, nhưng hiện tại nhiều phần bị copy lại:

- API/query/mutation.
- Normalize filter.
- URL pagination/filter sync.
- Export logic.
- Coupon check/apply logic.
- Log transform.
- Fee table transform.
- Formatter tiền/số lượng/trạng thái.
- Một số component nhỏ như note editor, status popover, modal.

Mobile trong repo cũng là React web responsive, không phải React Native. Vì vậy mobile và web có thể dùng chung nhiều hơn so với kiến trúc native app. Tuy nhiên mobile vẫn có layout/UX riêng, nên không nên ép dùng chung full UI.

Mục tiêu refactor: tenant mới có thể khác UI hoàn toàn, web/mobile có thể khác layout hoàn toàn, nhưng business/domain logic chỉ viết một lần.

## Nguyên Tắc Kiến Trúc

1. UI tenant được phép khác hoàn toàn.
2. Web và mobile được phép khác layout hoàn toàn.
3. Không copy business logic vào tenant UI.
4. Không copy platform logic nếu web/mobile cùng là React web và có thể chia sẻ adapter.
5. Component shared UI là optional, không phải base bắt buộc.
6. Domain/core không import Ant Design component, CSS, Tailwind, hoặc tenant theme.
7. Formatter tiền phải tiếp tục dùng `@repo/util`, đặc biệt `moneyFormat`, `quantityFormat`, `LocaleInputNumber`.

## Kiến Trúc Đề Xuất

```txt
packages/
  features/
    orders/
      domain/
        filters.ts
        apiParams.ts
        transforms.ts
        types.ts
      model/
        useOrdersModel.ts
      ui/
        antd/
          CutOffStatusFilter.tsx
          OrderStatusPopover.tsx
          OrderNoteEditor.tsx
    order-detail/
      domain/
        feeTables.ts
        logs.ts
        coupons.ts
        types.ts
      model/
        useOrderDetailModel.ts
      ui/
        antd/
          FeeTableModal.tsx
          CouponModal.tsx
    shipments/
    packages/

apps/
  web/
    src/pages/Orders/
      index.tsx
      views/
        OrdersDefaultView.tsx
        OrdersGobizView.tsx
        OrdersThanhlaView.tsx
      tenantViews.ts
  mobile/
    src/pages/Orders/
      index.tsx
      views/
        OrdersDefaultMobileView.tsx
        OrdersGobizMobileView.tsx
      tenantViews.ts
```

Nếu chưa muốn tạo package mới ngay, có thể bắt đầu trong `packages/hooks/src/features/*`, sau đó move sang `packages/features` khi ổn định.

## Layer Trách Nhiệm

### 1. Domain Layer

Không phụ thuộc UI. Chỉ chứa pure logic.

Ví dụ:

- `normalizeOrderFilters(values)`
- `buildOrderApiParams(filters, page, pageSize)`
- `parseOrderLogs(logs, order, dictionaries)`
- `buildInspectionFeeTable(data)`
- `buildShippingFeeTable(data, shippingFees)`
- `buildPercentageFeeTable(data)`
- `formatPackageUpdateLogValue(property, value, packageStatuses)`
- `getStatusMeta(statuses, code)`

Domain layer có thể unit test dễ vì không cần render React.

### 2. Model Layer

Chứa React hooks dùng query/mutation/action, nhưng không render UI.

Ví dụ:

```ts
export type OrdersModel = {
  orders: OrderListItem[];
  isLoading: boolean;
  total: number;
  page: number;
  pageSize: number;
  filters: OrderFilters;
  options: {
    statuses: Option[];
    services: Option[];
    marketplaces: Option[];
  };
  actions: {
    search(values: OrderFilterForm): void;
    reset(): void;
    setPage(page: number): void;
    setPageSize(pageSize: number): void;
    updateNote(code: string, note: string): Promise<void>;
    export(secret: string): Promise<void>;
    goToDetail(code: string): void;
  };
};
```

Web view và mobile responsive view đều consume cùng model.

### 3. Shared UI Layer

Chứa component dùng lại được, nhưng tenant không bắt buộc phải dùng.

Ví dụ:

- `CutOffStatusFilter`
- `CouponModal`
- `FeeTableModal`
- `OrderNoteEditor`
- `OrderStatusPopover`

Vì project dùng Ant Design, shared UI có thể nằm trong `ui/antd`. Nếu sau này một tenant muốn render khác hoàn toàn, tenant đó bỏ qua shared UI và chỉ dùng model/domain.

### 4. Tenant View Layer

Mỗi tenant render UI theo ý mình.

Tenant view được phép khác:

- Layout.
- Card/table/list.
- Modal/drawer placement.
- Responsive behavior.
- Order of sections.
- Visual style.
- Density.

Tenant view không nên tự viết:

- API call.
- Query key.
- Mutation invalidation.
- Filter normalization.
- Fee table transform.
- Log transform.
- Coupon rules.

## Tenant View Resolver

Mỗi app có resolver riêng vì web/mobile có thể khác UI:

```ts
const webOrderViews = {
  default: OrdersDefaultView,
  gobiz: OrdersGobizView,
  thanhla: OrdersThanhlaView,
};

export const resolveWebOrderView = (tenant: string) =>
  webOrderViews[tenant] || webOrderViews.default;
```

Mobile responsive:

```ts
const mobileOrderViews = {
  default: OrdersDefaultMobileView,
  gobiz: OrdersGobizMobileView,
};

export const resolveMobileOrderView = (tenant: string) =>
  mobileOrderViews[tenant] || mobileOrderViews.default;
```

Route:

```tsx
export const Orders = () => {
  const model = useOrdersModel();
  const View = resolveWebOrderView(currentTenant);
  return <View model={model} />;
};
```

## Web Và Mobile Responsive Dùng Chung Như Thế Nào

Vì mobile cũng là React web responsive, nên có thể dùng chung:

- Model hooks.
- Domain functions.
- API hooks.
- Formatter.
- Query invalidation.
- Some Ant Design components nếu mobile cũng dùng Ant Design.

Nhưng nên tách view:

```txt
apps/web/src/pages/Orders/views/OrdersGobizView.tsx
apps/mobile/src/pages/Orders/views/OrdersGobizMobileView.tsx
```

Hai view này đều nhận `OrdersModel`.

Nếu UI mobile chỉ khác responsive nhỏ, có thể dùng chung component với prop:

```tsx
<OrdersDefaultView model={model} density="mobile" />
```

Nếu mobile khác nhiều, tạo mobile view riêng. Không copy model.

## Refactor Plan Theo Phase

### Phase 1: Extract Pure Domain Helpers

Ít rủi ro nhất, không đổi UI.

Ưu tiên:

1. `OrderDetail/tabs/LogTab.tsx`
   - Tách `parseLogs`.
   - Tách `formatPackageChangedValue`.
   - Tách unit logic `kg`, `cm`, `cm3`.

2. `OrderDetail/tabs/FeeTab.tsx`
   - Tách fee table builders:
     - `buildInspectionFeeTable`
     - `buildShippingFeeTable`
     - `buildPercentageFeeTable`
   - Tách coupon helpers.

3. `Orders/hooks/useOrdersPage.ts`
   - Tách `normalizeOrderFilters`.
   - Tách export filename/error parsing nếu dùng nhiều nơi.

Output phase này:

```txt
packages/features/order-detail/domain/logs.ts
packages/features/order-detail/domain/feeTables.ts
packages/features/orders/domain/filters.ts
```

### Phase 2: Extract Model Hooks

Tạo model hooks không chứa UI.

Ưu tiên:

```txt
packages/features/orders/model/useOrdersModel.ts
packages/features/order-detail/model/useOrderDetailModel.ts
```

`useOrdersModel` gom:

- Pagination.
- URL filters.
- Query orders.
- Status/service/marketplace options.
- Update note.
- Export.
- Navigation actions.

Ban đầu có thể để URL adapter dùng web router, vì mobile cũng React web. Nếu mobile routing khác, bổ sung adapter sau.

### Phase 3: Convert Current Web Views To Consume Model

Không đổi UI ngay.

Đổi từ:

```tsx
export const OrdersStyleDefault = () => {
  const logic = useOrdersPage();
  return ...
}
```

Sang:

```tsx
export const OrdersDefaultView = ({ model }: { model: OrdersModel }) => {
  return ...
}
```

Route:

```tsx
const model = useOrdersModel();
const View = resolveWebOrderView(tenant);
return <View model={model} />;
```

### Phase 4: Introduce Tenant Resolvers

Tạo resolver cho từng page:

```txt
apps/web/src/pages/Orders/tenantViews.ts
apps/mobile/src/pages/Orders/tenantViews.ts
```

Tenant mới thêm view tại đây. Không cần copy model.

### Phase 5: Extract Optional Shared Antd Components

Sau khi model ổn, tách component UI dùng lại.

Ưu tiên:

- `CutOffStatusFilter`
- `DateRangeFilter`
- `StatusCheckboxFilter`
- `CouponModal`
- `FeeTableModal`
- `OrderStatusPopover`
- `OrderNoteEditor`

Những component này để trong package shared UI hoặc feature UI:

```txt
packages/features/orders/ui/antd/CutOffStatusFilter.tsx
packages/features/order-detail/ui/antd/FeeTableModal.tsx
```

Tenant khác hoàn toàn có thể không dùng.

### Phase 6: Apply To Mobile Responsive

Sau khi web test ổn:

1. Mobile import cùng model/domain.
2. Mobile viết view riêng nếu layout khác.
3. Mobile không viết lại API/filter/log/fee/coupon.

Ví dụ:

```tsx
export const OrdersGobizMobileView = ({ model }: { model: OrdersModel }) => {
  return <MobileOrderList orders={model.orders} actions={model.actions} />;
};
```

## Migration Strategy

Không refactor toàn bộ một lần.

Thứ tự nên làm:

1. `OrderDetail/FeeTab`
   - Đang có nhiều business logic nhất.
   - Dễ bug nếu copy sang mobile.

2. `OrderDetail/LogTab`
   - Log transform nên dùng chung tuyệt đối.

3. `Orders`
   - Filter, export, note edit, card/list/table.

4. `Shipments` và `Packages`
   - Gom các filter dừng trạng thái, shipping fees, coupon.

5. `Carts` và `PeerPayments`
   - Làm sau vì blast radius lớn.

## Definition Of Done

Một page được coi là refactor xong khi:

1. Tenant UI file không gọi API trực tiếp.
2. Tenant UI file không normalize filter trực tiếp.
3. Tenant UI file không tự transform log/fee table.
4. Web và mobile có thể import cùng model/domain.
5. Tenant mới có thể thêm UI mới bằng cách tạo view và register resolver.
6. Existing tenant vẫn chạy đúng behavior cũ.
7. Typecheck và lint file changed pass.

## Example Target Flow

```txt
Route
  -> useOrdersModel()
    -> useOrdersQuery()
    -> normalizeOrderFilters()
    -> updateNote/export/navigation actions
  -> resolveTenantView(tenant)
  -> <TenantOrdersView model={model} />
```

Tenant view chỉ quyết định hiển thị.

## Anti-Patterns Cần Tránh

1. Tạo tenant mới bằng cách copy nguyên `OrdersStyleDefault.tsx`.
2. Viết lại API/mutation trong tenant view.
3. Mỗi page tự có một `formatMoney` riêng.
4. Mỗi tab tự parse log theo cách riêng.
5. Web và mobile mỗi bên tự normalize filter riêng.
6. Shared UI bắt buộc tất cả tenant phải dùng.

## Gợi Ý Naming

Page model:

```txt
useOrdersModel
useOrderDetailModel
useShipmentsModel
usePackagesModel
```

Domain:

```txt
orders/domain/filters.ts
orders/domain/apiParams.ts
order-detail/domain/feeTables.ts
order-detail/domain/logs.ts
order-detail/domain/coupons.ts
```

Views:

```txt
OrdersDefaultView
OrdersGobizView
OrdersThanhlaView
OrdersDefaultMobileView
OrdersGobizMobileView
```

Resolvers:

```txt
resolveWebOrderView
resolveMobileOrderView
```

