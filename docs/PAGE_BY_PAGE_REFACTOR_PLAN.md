# Page By Page Refactor Plan

## Cách Dùng Tài Liệu Này

Khi muốn refactor một trang, chỉ cần giao task theo mẫu:

```txt
Refactor trang [Tên trang] theo docs/PAGE_BY_PAGE_REFACTOR_PLAN.md và docs/TENANT_UI_REFACTOR_EXECUTION_RULES.md.
Làm đúng phạm vi của trang đó, không refactor lan sang trang khác.
Sau khi xong báo checklist nghiệm thu.
```

Ví dụ:

```txt
Refactor trang Orders theo docs/PAGE_BY_PAGE_REFACTOR_PLAN.md.
```

Mỗi lần refactor chỉ xử lý một page hoặc một tab lớn. Không refactor nhiều page cùng lúc.

## Nguyên Tắc Chung

1. Refactor theo Headless Core + Tenant View.
2. Tenant UI được phép khác hoàn toàn.
3. Web và mobile responsive React dùng chung domain/model.
4. Không copy API/query/mutation/filter/log/fee/coupon logic vào tenant view.
5. Không đổi behavior nếu task chỉ yêu cầu refactor.
6. Nếu phát hiện bug trong lúc refactor, ghi lại và chỉ sửa nếu bug đó nằm trong phạm vi page đang làm.
7. Mỗi page refactor xong phải chạy typecheck và lint changed files nếu có thể.

## Thứ Tự Refactor Khuyến Nghị

1. `OrderDetail/FeeTab`
2. `OrderDetail/LogTab`
3. `Orders`
4. `Packages`
5. `Shipments`
6. `OrderDetail` shell và các tab còn lại
7. `Carts`
8. `CartCheckout`
9. `PeerPayments`
10. `PeerPaymentDetail`
11. `Profile`
12. `Dashboard`
13. `Transactions`
14. `Claims`
15. `DeliveryRequests`
16. `CreateDelivery`
17. Mobile responsive views

Ưu tiên này dựa trên mức độ lặp logic và rủi ro copy sang mobile.

## Page 1: OrderDetail/FeeTab

### Mục Tiêu

Tách toàn bộ logic tài chính đơn khỏi UI tenant.

### Files Hiện Tại

```txt
apps/web/src/pages/OrderDetail/tabs/FeeTab.tsx
packages/api/src/CategoryApi.ts
packages/api/src/OrderApi.ts
packages/hooks/src/useOrderHooks.ts
```

### Target Structure

```txt
packages/features/order-detail/domain/feeTables.ts
packages/features/order-detail/domain/coupons.ts
packages/features/order-detail/model/useOrderFeesModel.ts
packages/features/order-detail/ui/antd/FeeTableModal.tsx
packages/features/order-detail/ui/antd/CouponModal.tsx
```

### Scope

Extract:

- percentage fee table.
- inspection fee table.
- shipping fee table.
- fixed fee table.
- coupon check/apply state helpers.
- fee config table fallback logic.

Không làm:

- đổi layout tài chính.
- đổi text/i18n.
- đổi API params trừ khi đang sai.

### Checklist

- [ ] `FeeTab.tsx` không còn chứa fee table builder phức tạp.
- [ ] Fee table builder nằm trong domain.
- [ ] Coupon modal có thể reuse order/shipment nếu cùng behavior.
- [ ] `moneyFormat` và `quantityFormat` vẫn dùng đúng.
- [ ] Bấm phí mua hàng vẫn hiện bảng `% Phí dịch vụ`.
- [ ] Bấm phí kiểm hàng vẫn hiện bảng số lượng/đơn giá.
- [ ] Bấm phí vận chuyển thường vẫn call `categories/shipping_fees`.
- [ ] Check coupon hợp lệ enable nút `Sử dụng`.
- [ ] Check coupon không hợp lệ disable nút `Sử dụng`.
- [ ] `pnpm --filter web check-types` pass.
- [ ] Lint changed files pass hoặc ghi rõ lỗi existing.

## Page 2: OrderDetail/LogTab

### Mục Tiêu

Tách parser log đơn hàng thành domain dùng chung web/mobile.

### Files Hiện Tại

```txt
apps/web/src/pages/OrderDetail/tabs/LogTab.tsx
```

### Target Structure

```txt
packages/features/order-detail/domain/logs.ts
packages/features/order-detail/model/useOrderLogsModel.ts
```

### Scope

Extract:

- `parseLogs`.
- `parseLogItem`.
- package update formatter.
- transaction amount formatter.
- activity-specific transform.

Không làm:

- đổi UI timeline/list log.
- đổi i18n message.

### Checklist

- [ ] `LogTab.tsx` chỉ render parsed logs.
- [ ] Activity parser nằm trong domain.
- [ ] `ORDER_PACKAGE_UPDATE` có unit `kg`, `cm`, `cm3`.
- [ ] `emd` amount không hiển thị dấu `-`.
- [ ] Status package map đúng tên.
- [ ] Log unknown activity vẫn fallback đúng.
- [ ] `pnpm --filter web check-types` pass.
- [ ] Lint changed files pass hoặc ghi rõ lỗi existing.

## Page 3: Orders

### Mục Tiêu

Tách danh sách đơn thành model dùng chung và tenant views.

### Files Hiện Tại

```txt
apps/web/src/pages/Orders/index.tsx
apps/web/src/pages/Orders/OrdersStyleDefault.tsx
apps/web/src/pages/Orders/OrdersStyleGobiz.tsx
apps/web/src/pages/Orders/OrdersStyleThanhla.tsx
apps/web/src/pages/Orders/OrdersStyleGobizCombined.tsx
apps/web/src/pages/Orders/hooks/useOrdersPage.ts
packages/hooks/src/pages/orders.ts
```

### Target Structure

```txt
packages/features/orders/domain/filters.ts
packages/features/orders/domain/types.ts
packages/features/orders/model/useOrdersModel.ts
packages/features/orders/ui/antd/CutOffStatusFilter.tsx
packages/features/orders/ui/antd/OrderNoteEditor.tsx

apps/web/src/pages/Orders/views/OrdersDefaultView.tsx
apps/web/src/pages/Orders/views/OrdersGobizView.tsx
apps/web/src/pages/Orders/views/OrdersThanhlaView.tsx
apps/web/src/pages/Orders/tenantViews.ts
```

### Scope

Extract:

- `normalizeOrderFilters`.
- URL pagination/filter model.
- export action.
- note update action.
- status/service/marketplace options.
- cut-off status filter shared UI.

Không làm:

- gộp UI tenant nếu tenant khác thật.
- đổi card/table visual.

### Checklist

- [ ] `useOrdersModel` là nguồn logic chính.
- [ ] Tenant views nhận `model`.
- [ ] Tenant views không gọi API/query/mutation trực tiếp cho list orders.
- [ ] Filter `Đơn dừng ở trạng thái` dùng shared behavior.
- [ ] Note edit vẫn focus cuối dòng, Enter lưu, không call API nếu không đổi.
- [ ] Export Excel vẫn hoạt động.
- [ ] Pagination/filter URL sync vẫn hoạt động.
- [ ] Default/Gobiz/Thanhla view vẫn render.
- [ ] `pnpm --filter web check-types` pass.
- [ ] Lint changed files pass hoặc ghi rõ lỗi existing.

## Page 4: Packages

### Mục Tiêu

Tách danh sách kiện và filter kiện dùng chung với Orders/Shipments.

### Files Hiện Tại

```txt
apps/web/src/pages/Packages/*
apps/web/src/pages/Packages/hooks/usePackagesPage.ts
packages/hooks/src/pages/packages.ts
```

### Target Structure

```txt
packages/features/packages/domain/filters.ts
packages/features/packages/model/usePackagesModel.ts
packages/features/orders/ui/antd/CutOffStatusFilter.tsx
```

### Scope

Extract:

- normalize package filters.
- package list model.
- export package action.
- cut-off status filter reuse.

### Checklist

- [ ] Package page uses `usePackagesModel`.
- [ ] `Kiện dừng ở trạng thái` dùng shared `CutOffStatusFilter`.
- [ ] Filter params không đổi behavior.
- [ ] Export packages vẫn hoạt động.
- [ ] Navigate to order/shipment detail vẫn đúng.
- [ ] `pnpm --filter web check-types` pass.
- [ ] Lint changed files pass hoặc ghi rõ lỗi existing.

## Page 5: Shipments

### Mục Tiêu

Tách danh sách ký gửi và các logic filter/export/coupon/shipping fees dùng chung.

### Files Hiện Tại

```txt
apps/web/src/pages/Shipments/*
apps/web/src/pages/Shipments/hooks/useShipmentsPage.ts
packages/hooks/src/pages/shipments.ts
```

### Target Structure

```txt
packages/features/shipments/domain/filters.ts
packages/features/shipments/model/useShipmentsModel.ts
packages/features/shipments/domain/feeTables.ts
```

### Scope

Extract:

- shipment filter normalization.
- shipment list model.
- export action.
- cut-off status filter shared behavior.

### Checklist

- [ ] Shipment page uses model.
- [ ] Filter dừng trạng thái consistent với Orders/Packages.
- [ ] Export shipments vẫn hoạt động.
- [ ] Delivery notice/ready count logic không đổi.
- [ ] `pnpm --filter web check-types` pass.
- [ ] Lint changed files pass hoặc ghi rõ lỗi existing.

## Page 6: OrderDetail Shell And Remaining Tabs

### Mục Tiêu

Tách shell chi tiết đơn và các tab còn lại sang model/view.

### Files Hiện Tại

```txt
apps/web/src/pages/OrderDetail/OrderDetailStyleDefault.tsx
apps/web/src/pages/OrderDetail/hooks/useOrderDetailPage.ts
apps/web/src/pages/OrderDetail/tabs/ProductTab.tsx
apps/web/src/pages/OrderDetail/tabs/PackageTab.tsx
apps/web/src/pages/OrderDetail/tabs/TransactionTab.tsx
apps/web/src/pages/OrderDetail/tabs/ClaimTab.tsx
apps/web/src/pages/OrderDetail/tabs/HistoryTab.tsx
```

### Target Structure

```txt
packages/features/order-detail/model/useOrderDetailModel.ts
apps/web/src/pages/OrderDetail/views/OrderDetailDefaultView.tsx
apps/web/src/pages/OrderDetail/tenantViews.ts
```

### Checklist

- [ ] Detail shell uses model.
- [ ] Tab state preserved via URL.
- [ ] Cancel/reorder/update actions still work.
- [ ] Product/package/transaction tabs unchanged.
- [ ] `pnpm --filter web check-types` pass.
- [ ] Lint changed files pass hoặc ghi rõ lỗi existing.

## Page 7: Carts

### Mục Tiêu

Tách cart domain/model để tenant UI khác hoàn toàn nhưng logic giỏ hàng dùng chung.

### Files Hiện Tại

```txt
apps/web/src/pages/Carts/*
apps/web/src/pages/Carts/hooks/useCartsPage.ts
```

### Scope

Extract:

- cart grouping.
- service selection.
- SKU selection.
- note/remark/ref code actions.
- place order action.
- cart totals.

### Checklist

- [ ] Cart model exposes groups, selections, totals, actions.
- [ ] Tenant view does not call cart API directly.
- [ ] Place order still navigates correctly.
- [ ] Service dependency behavior preserved.
- [ ] Money inputs use `LocaleInputNumber`.
- [ ] `pnpm --filter web check-types` pass.
- [ ] Lint changed files pass hoặc ghi rõ lỗi existing.

## Page 8: CartCheckout

### Mục Tiêu

Tách checkout flow khỏi UI.

### Scope

Extract:

- draft order loading/update.
- address selection.
- balance/lack-of-money logic.
- create order action.
- fee/emd summary.

### Checklist

- [ ] Checkout model owns draft order actions.
- [ ] UI only renders model.
- [ ] Create order behavior unchanged.
- [ ] Money formatting uses shared util.
- [ ] `pnpm --filter web check-types` pass.
- [ ] Lint changed files pass hoặc ghi rõ lỗi existing.

## Page 9: PeerPayments

### Mục Tiêu

Tách logic thanh toán hộ, filter, export, exchange rate, request actions.

### Checklist

- [ ] Peer payment list model exists.
- [ ] Tenant views do not call API directly.
- [ ] Filter URL sync preserved.
- [ ] Export still works.
- [ ] Exchange rate display/action unchanged.
- [ ] `pnpm --filter web check-types` pass.
- [ ] Lint changed files pass hoặc ghi rõ lỗi existing.

## Page 10: PeerPaymentDetail

### Mục Tiêu

Tách detail model và financial/action logic.

### Checklist

- [ ] Detail model exists.
- [ ] Fee display logic shared.
- [ ] Actions still work.
- [ ] `pnpm --filter web check-types` pass.
- [ ] Lint changed files pass hoặc ghi rõ lỗi existing.

## Page 11: Profile

### Mục Tiêu

Tách profile/customer/address/voucher logic để mobile responsive reuse.

### Checklist

- [ ] Profile model exists.
- [ ] Address modal actions reuse model.
- [ ] Voucher check logic shared with order/shipment coupon if possible.
- [ ] Money/discount display uses shared util.
- [ ] `pnpm --filter web check-types` pass.
- [ ] Lint changed files pass hoặc ghi rõ lỗi existing.

## Page 12: Dashboard

### Mục Tiêu

Tách dashboard stats model khỏi tenant presentation.

### Checklist

- [ ] Dashboard model exists.
- [ ] Tenant view renders stats from model.
- [ ] Status statistic mapping shared.
- [ ] `pnpm --filter web check-types` pass.
- [ ] Lint changed files pass hoặc ghi rõ lỗi existing.

## Page 13: Transactions

### Mục Tiêu

Tách transaction list/filter/export logic.

### Checklist

- [ ] Transaction model exists.
- [ ] Filter normalize shared.
- [ ] Export/download behavior unchanged.
- [ ] `pnpm --filter web check-types` pass.
- [ ] Lint changed files pass hoặc ghi rõ lỗi existing.

## Page 14: Claims

### Mục Tiêu

Tách claim list/create/detail logic.

### Checklist

- [ ] Claim model exists.
- [ ] Claim status/reason mapping shared.
- [ ] Create claim flow unchanged.
- [ ] `pnpm --filter web check-types` pass.
- [ ] Lint changed files pass hoặc ghi rõ lỗi existing.

## Page 15: DeliveryRequests

### Mục Tiêu

Tách yêu cầu giao hàng list/filter/actions.

### Checklist

- [ ] Delivery request model exists.
- [ ] Filter normalize shared.
- [ ] Actions unchanged.
- [ ] `pnpm --filter web check-types` pass.
- [ ] Lint changed files pass hoặc ghi rõ lỗi existing.

## Page 16: CreateDelivery

### Mục Tiêu

Tách create delivery flow để mobile responsive reuse.

### Checklist

- [ ] Create delivery model exists.
- [ ] Package/order selection logic shared.
- [ ] Address/warehouse logic shared.
- [ ] Submit behavior unchanged.
- [ ] `pnpm --filter web check-types` pass.
- [ ] Lint changed files pass hoặc ghi rõ lỗi existing.

## Mobile Responsive Migration Checklist

Sau khi một web page đã có model/domain:

- [ ] Mobile imports same model/domain.
- [ ] Mobile has its own tenant view resolver.
- [ ] Mobile view only renders presentation.
- [ ] No duplicate filter normalization in mobile.
- [ ] No duplicate API/query/mutation in mobile.
- [ ] Responsive UI tested on narrow viewport.
- [ ] `pnpm --filter mobile check-types` pass nếu script tồn tại.

## Global Refactor Completion Checklist

Một page được coi là hoàn thành refactor khi:

- [ ] Có domain/model rõ ràng.
- [ ] Tenant web view consume model.
- [ ] Tenant mobile view có thể consume cùng model.
- [ ] View không gọi API trực tiếp cho page logic.
- [ ] View không chứa data transform phức tạp.
- [ ] Money/quantity dùng shared util.
- [ ] Filter normalize không bị copy nhiều nơi.
- [ ] Existing behavior preserved.
- [ ] Typecheck pass.
- [ ] Lint changed files pass hoặc warning/error existing được ghi rõ.

