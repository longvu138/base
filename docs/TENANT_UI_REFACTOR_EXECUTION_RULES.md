# Tenant UI Refactor Execution Plan And Rules

## Mục Tiêu Triển Khai

Refactor source theo kiến trúc Headless Core + Tenant View:

- Tenant mới có thể khác UI hoàn toàn.
- Web và mobile responsive React có thể khác view hoàn toàn.
- Business/domain logic dùng chung tối đa.
- Không copy API, formatter, filter normalize, fee/log/coupon transform vào tenant view.

Tài liệu kiến trúc tổng quan: `docs/TENANT_UI_REFACTOR_PLAN.md`.

## Execution Roadmap

### Phase 0: Chuẩn Bị

Mục tiêu: tạo chỗ đặt shared feature code nhưng chưa đổi behavior.

Việc cần làm:

1. Tạo folder feature shared:

```txt
packages/features/
  orders/
    domain/
    model/
    ui/
      antd/
  order-detail/
    domain/
    model/
    ui/
      antd/
```

2. Add package export nếu tạo package mới.
3. Nếu chưa muốn thêm package mới, dùng tạm:

```txt
packages/hooks/src/features/
```

Quyết định khuyến nghị: dùng `packages/features` nếu repo build ổn, vì domain/model/ui shared nên không nên nhét hết vào `hooks`.

Definition of done:

- Folder/package tồn tại.
- TypeScript import được từ app web.
- Chưa đổi UI/behavior.

### Phase 1: Extract Pure Domain Helpers

Mục tiêu: move logic thuần ra shared domain trước, không đổi UI.

Ưu tiên theo thứ tự:

1. `OrderDetail/tabs/FeeTab.tsx`
   - Move fee table builders:
     - inspection fee table.
     - shipping fee table.
     - percentage-of-total-value fee table.
   - Move helpers:
     - range builder.
     - location/weight mapping.
     - fee table fallback data normalization.

2. `OrderDetail/tabs/LogTab.tsx`
   - Move log parser.
   - Move package update value formatter.
   - Move unit rules: `kg`, `cm`, `cm3`.

3. `Orders/hooks/useOrdersPage.ts`
   - Move `normalizeOrderFilters`.
   - Move export filename/error parsing if reused.

Definition of done:

- Existing UI imports domain helper.
- Output behavior unchanged.
- Changed files pass typecheck.
- Lint changed UI/domain files.

### Phase 2: Extract Shared Antd Components Where Useful

Mục tiêu: gom UI nhỏ có thể reuse nhưng không ép tenant dùng.

Ưu tiên:

1. `CutOffStatusFilter`
   - Dùng cho order/package/shipment.
   - Props nhận options, form field names, labels.

2. `CouponModal`
   - Dùng chung order/shipment nếu cùng interaction.

3. `FeeTableModal`
   - Render từ fee table view model/domain data.

4. `OrderNoteEditor`
   - Tách behavior edit note ra khỏi order card.

Definition of done:

- Component không chứa tenant-specific layout lớn.
- Component có props rõ ràng.
- Tenant view có thể dùng hoặc không dùng.

### Phase 3: Extract Model Hooks

Mục tiêu: tách API/query/mutation/action khỏi tenant view.

Ưu tiên:

1. `useOrdersModel`
   - pagination.
   - filters.
   - status/service/marketplace options.
   - list query.
   - update note.
   - export.
   - navigation actions.

2. `useOrderDetailModel`
   - detail query.
   - status info.
   - tab state.
   - cancel/reorder/update actions.

3. Tab models nếu cần:
   - `useOrderFeesModel`
   - `useOrderLogsModel`

Definition of done:

- Tenant view nhận `model` qua props.
- Tenant view không gọi query/mutation trực tiếp cho logic thuộc page.
- Existing page behavior unchanged.

### Phase 4: Convert Existing Web Views

Mục tiêu: đổi các file style hiện tại thành tenant views consume model.

Target structure:

```txt
apps/web/src/pages/Orders/
  index.tsx
  tenantViews.ts
  views/
    OrdersDefaultView.tsx
    OrdersGobizView.tsx
    OrdersThanhlaView.tsx
```

Route/page entry:

```tsx
const model = useOrdersModel();
const View = resolveWebOrderView(tenant);
return <View model={model} />;
```

Definition of done:

- `index.tsx` chỉ resolve tenant view + create model.
- View file chỉ presentation/action binding.
- Không còn `useOrdersPage` tenant-specific nếu đã thay bằng model.

### Phase 5: Apply Same Pattern To Mobile Responsive

Mục tiêu: mobile dùng chung model/domain, tự render view responsive.

Target structure:

```txt
apps/mobile/src/pages/Orders/
  index.tsx
  tenantViews.ts
  views/
    OrdersDefaultMobileView.tsx
    OrdersGobizMobileView.tsx
```

Definition of done:

- Mobile import same model/domain.
- Mobile không duplicate normalize/API/log/fee/coupon logic.
- Mobile view chỉ là presentation.

### Phase 6: Remove Dead Tenant Copies

Mục tiêu: cleanup sau khi views đã chuyển xong.

Việc cần làm:

1. Xóa file tenant cũ không còn route/import.
2. Xóa helper local trùng với domain.
3. Xóa formatter page-local trái rule.
4. Update README/docs nếu cần.

Definition of done:

- `rg` không còn import dead files.
- Typecheck pass.
- Behavior smoke test các tenant chính.

## Refactor Rules

Khi yêu cầu refactor một page/tab theo kiến trúc tenant, luôn tuân thủ các rules sau.

### Rule 1: Không Đổi Behavior Khi Extract

Mỗi bước extract phải giữ output hiện tại trước.

Không làm cùng lúc:

- đổi UI lớn.
- đổi API params.
- đổi data transform.
- đổi text/i18n.

Nếu cần đổi behavior, làm thành task riêng sau khi extract ổn.

### Rule 2: Domain Không Import UI

File trong `domain/` không được import:

- `antd`
- `@ant-design/icons`
- CSS/Tailwind.
- route/navigation.
- tenant config UI.

Domain chỉ được chứa pure function/type/constant.

### Rule 3: Model Không Render UI

File trong `model/` không render JSX.

Model được phép dùng:

- React hooks.
- React Query hooks.
- router/navigation adapter nếu thật cần.
- app-level actions.

Model không được import component Ant Design.

### Rule 4: Tenant View Không Gọi API Trực Tiếp

Tenant view không tự gọi:

- API client.
- React Query hooks cho logic page chính.
- mutation invalidation.
- normalize filters.

Tenant view chỉ gọi `model.actions`.

Ngoại lệ: UI-only query rất cục bộ và không thuộc domain page, nhưng phải được ghi rõ lý do.

### Rule 5: Shared UI Là Optional

Không ép tenant dùng shared Antd component.

Tenant view có thể:

- dùng shared Antd UI nếu phù hợp.
- tự render UI hoàn toàn khác.

Nhưng tenant view vẫn phải dùng shared domain/model logic.

### Rule 6: Formatter Dùng Shared Util

Không tạo formatter tiền local nếu không cần.

Bắt buộc:

- `moneyFormat(...)` cho money display.
- `quantityFormat(...)` cho quantity.
- `LocaleInputNumber` cho money input.

Nếu phải preserve legacy rounding, rounding phải nằm rõ gần call site hoặc shared helper.

### Rule 7: Filter Normalize Chỉ Có Một Nguồn

Mỗi entity chỉ có một normalize function:

- `normalizeOrderFilters`
- `normalizePackageFilters`
- `normalizeShipmentFilters`

Web/mobile/tenant đều dùng chung.

Không copy normalize trong tenant view.

### Rule 8: Fee Table Transform Dùng Chung

Fee table logic phải nằm ở domain:

- percentage fee.
- inspection fee.
- shipping fee.
- fixed order/package.

UI modal chỉ render view model đã được build.

### Rule 9: Log Transform Dùng Chung

Log parser phải nằm ở domain.

Không parse activity trong tenant UI.

Nếu thêm activity mới:

1. thêm transformer ở domain.
2. thêm test/sample nếu có.
3. UI chỉ nhận parsed log item.

### Rule 10: Refactor Theo Vertical Slice Nhỏ

Mỗi PR/task nên chọn một slice:

- một tab (`FeeTab`).
- một parser (`Order logs`).
- một filter group (`CutOffStatusFilter`).
- một page model (`OrdersModel`).

Không refactor cả Orders + OrderDetail + Shipments cùng lúc.

## Prompt Mẫu Để Giao Refactor

### Extract domain helper

```txt
Refactor [file/tab] theo docs/TENANT_UI_REFACTOR_EXECUTION_RULES.md.
Chỉ extract pure domain helpers sang packages/features/[feature]/domain.
Không đổi UI/behavior.
Chạy typecheck và lint changed files.
```

### Extract model

```txt
Refactor [page] sang use[Page]Model theo docs/TENANT_UI_REFACTOR_EXECUTION_RULES.md.
Tenant view vẫn giữ UI hiện tại.
Không đổi route/behavior.
```

### Add new tenant view

```txt
Thêm tenant view mới cho [page] theo kiến trúc Headless Core + Tenant View.
UI tenant mới được khác hoàn toàn, nhưng phải dùng model/domain shared.
Không copy API/query/filter normalize vào view.
```

### Move web logic to mobile

```txt
Triển khai mobile responsive view cho [page] dùng chung model/domain từ web.
Mobile chỉ viết presentation, không duplicate business logic.
```

## Suggested First Tasks

### Task 1: Extract Order Fee Table Domain

Files hiện liên quan:

- `apps/web/src/pages/OrderDetail/tabs/FeeTab.tsx`

Tạo:

```txt
packages/features/order-detail/domain/feeTables.ts
```

Move:

- `buildRanges`
- `rangeText`
- inspection table builder
- shipping table builder
- percentage table builder
- location/weight helpers

### Task 2: Extract Order Log Domain

Files hiện liên quan:

- `apps/web/src/pages/OrderDetail/tabs/LogTab.tsx`

Tạo:

```txt
packages/features/order-detail/domain/logs.ts
```

Move:

- `parseLogItem`
- `parseLogs`
- `formatPackageChangedValue`
- `packageUpdateUnit`
- package status mapping.

### Task 3: Extract Order Filter Domain

Files hiện liên quan:

- `apps/web/src/pages/Orders/hooks/useOrdersPage.ts`
- `apps/web/src/pages/Orders/OrdersStyleDefault.tsx`

Tạo:

```txt
packages/features/orders/domain/filters.ts
```

Move:

- `normalizeOrderFilters`
- cut-off status equal/range handling.
- date normalization helpers.

### Task 4: Extract CutOffStatusFilter UI

Tạo:

```txt
packages/features/orders/ui/antd/CutOffStatusFilter.tsx
```

Dùng cho:

- Orders filter.
- Packages filter.
- Shipments filter nếu cùng field contract.

### Task 5: Build OrdersModel

Tạo:

```txt
packages/features/orders/model/useOrdersModel.ts
```

Sau đó convert web Orders view consume model.

## Checklist Khi Refactor Mỗi Slice

- [ ] Đọc file hiện tại và các tenant variants liên quan.
- [ ] Xác định phần domain/model/UI.
- [ ] Extract domain trước nếu có thể.
- [ ] Không đổi behavior trong cùng commit/task.
- [ ] Không dùng formatter local cho money.
- [ ] Tenant view không gọi API trực tiếp.
- [ ] Web/mobile path import shared code được.
- [ ] Chạy typecheck.
- [ ] Chạy lint changed files nếu có thể.
- [ ] Ghi rõ lỗi lint existing nếu không liên quan.

