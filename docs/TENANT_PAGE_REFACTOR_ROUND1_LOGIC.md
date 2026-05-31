# Tenant Page Refactor Round 1: Logic

Muc tieu vong 1: giu nguyen folder/UI hien tai, dua business logic ra `packages/features/<feature>/domain` va `packages/features/<feature>/model` de tenant moi sau nay chi can code UI.

Trang thai:

- `[ ]` Chua lam.
- `[~]` Dang lam.
- `[x]` Da refactor logic xong va da verify.
- `[skip]` Khong can refactor.

## Prompt Vong 1

Copy prompt nay va chi thay `<PageName>`.

```txt
Lam vong 1 refactor logic tenant reusable cho page <PageName>. Doc docs/TENANT_PAGE_REFACTOR_ROUND1_LOGIC.md va chi refactor page nay.

Pham vi:
- Chi lam page <PageName>, khong refactor lan sang page khac neu khong bat buoc.
- Giu nguyen folder UI hien tai, chua migrate variants.
- Giu nguyen cac file *Style*.tsx hien co va visual UI hien tai toi da.
- Giu nguyen behavior hien tai: route, URL params, filter, pagination, tab, export, mutation, notification, loading/empty/error.

Muc tieu:
- Tenant moi sau nay chi can code UI, khong phai copy business logic.
- Web/mobile dung chung domain/model neu logic giong nhau; chi tach adapter khi behavior that su khac.
- Dua business logic ra khoi *Style*.tsx.
- Pure logic dua vao packages/features/<feature>/domain.
- Query/mutation/action/state dua vao packages/features/<feature>/model.
- Model expose contract ro rang theo shape state/options/actions.

Quy trinh bat buoc:
1. Doc index, Style*, hooks, views, components lien quan cua page <PageName>.
2. Doc ca web/mobile cua page neu ton tai de danh gia logic co dung chung duoc khong.
3. Lap inventory logic dang nam trong UI.
4. Neu page qua lon, bao pham vi cat nho truoc khi sua.
5. Refactor theo rules: domain -> model -> tenant view, nhung KHONG migrate folder variants o vong nay.
6. Chay guard command cho page.
7. Chay typecheck/build/lint lien quan.
8. Bao cao: da sua gi, logic da move, commands pass/fail, web-mobile dung chung model the nao, checklist vong 1 tick duoc muc nao.
```

## Do De Refactor

Rule quan ly:

- Khi vong 1 cua page xong, tick page do trong checklist vong 1.
- Dong thoi gach ngang page do o danh sach do de refactor de de chon viec tiep theo.

1. De nhat, list page it action:
   - ~~Orders web/mobile~~.
   - ~~Notifications web/mobile~~.
   - ~~Claims web/mobile~~.
   - ~~DeliveryNotes web/mobile~~.
   - Waybills web/mobile.
   - Lieferscheine web/mobile.
   - Transactions mobile.
   - Vouchers mobile.
   - Faqs mobile.

2. De vua, list page co filter/action nhieu hon:
   - Shipments web/mobile.
   - Packages web/mobile.
   - DeliveryRequests web/mobile.
   - WithdrawalSlips web/mobile.
   - CashRequest web/mobile.
   - Statistics web.
   - Dashboard web/mobile.
   - Address mobile.
   - Wishlist mobile.

3. Vua-kho, form/create flow:
   - Login web/mobile.
   - Register web/mobile.
   - CreateClaim web/mobile.
   - CreateDelivery web/mobile.
   - CreateShipment web/mobile.

4. Kho, detail page nhieu tab/action:
   - OrderDetail web/mobile.
   - ShipmentDetail web.
   - PeerPaymentDetail web.
   - Profile web/mobile.

5. Kho nhat, flow nhieu mutation/tai chinh/checkout:
   - Carts web/mobile.
   - CartCheckout web.
   - PeerPayments web.

6. Lam cuoi hoac skip:
   - ThemeConfigurator web neu chi la internal tool.

## Checklist Vong 1

### Web

| Page | Status | Verify | Notes |
| --- | --- | --- | --- |
| Web Orders | [x] | [x] | Logic/domain/model refactor done, chua migrate variants |
| Web Notifications | [x] | [x] | Logic/domain/model refactor done, chua migrate variants |
| Web Claims | [x] | [x] | Logic/domain/model refactor done, chua migrate variants |
| Web DeliveryNotes | [x] | [x] | Logic/domain/model refactor done, chua migrate variants |
| Web Waybills | [ ] | [ ] | List/filter/actions |
| Web Lieferscheine | [ ] | [ ] | List/filter/actions |
| Web Shipments | [ ] | [ ] | List/filter/actions |
| Web Packages | [ ] | [ ] | List/filter/actions |
| Web DeliveryRequests | [ ] | [ ] | List/filter/actions |
| Web WithdrawalSlips | [ ] | [ ] | List/filter/actions |
| Web CashRequest | [ ] | [ ] | Request/create/address flow |
| Web Statistics | [ ] | [ ] | Charts/tables/date filters |
| Web Dashboard | [ ] | [ ] | Stats/quick actions |
| Web Login | [ ] | [ ] | Auth flow |
| Web Register | [ ] | [ ] | Auth form |
| Web CreateClaim | [ ] | [ ] | Form/attachment rules |
| Web CreateDelivery | [ ] | [ ] | Form/payload/validation |
| Web CreateShipment | [ ] | [ ] | Form/payload/validation |
| Web OrderDetail | [ ] | [ ] | Nhieu tabs/actions |
| Web ShipmentDetail | [ ] | [ ] | Detail/tabs/actions |
| Web PeerPaymentDetail | [ ] | [ ] | Detail/tabs/actions |
| Web Profile | [ ] | [ ] | Tabs/sub-models |
| Web Carts | [ ] | [ ] | Cart mutations |
| Web CartCheckout | [ ] | [ ] | Checkout/order creation |
| Web PeerPayments | [ ] | [ ] | Rui ro cao, nen cat nho |
| Web ThemeConfigurator | [ ] | [ ] | Co the skip neu internal-only |

### Mobile

| Page | Status | Verify | Notes |
| --- | --- | --- | --- |
| Mobile Orders | [x] | [x] | Dung model/domain trong packages/features, chua migrate variants |
| Mobile Notifications | [x] | [x] | Dung model/domain trong packages/features, chua migrate variants |
| Mobile Claims | [x] | [x] | Dung model/domain trong packages/features, chua migrate variants |
| Mobile DeliveryNotes | [x] | [x] | Dung model/domain trong packages/features, chua migrate variants |
| Mobile Waybills | [ ] | [ ] | List/filter/actions |
| Mobile Lieferscheine | [ ] | [ ] | List/filter/actions |
| Mobile Transactions | [ ] | [ ] | List/filter |
| Mobile Vouchers | [ ] | [ ] | List/use/copy |
| Mobile Faqs | [ ] | [ ] | List/search/category |
| Mobile Shipments | [ ] | [ ] | List/filter/actions |
| Mobile Packages | [ ] | [ ] | List/filter/actions |
| Mobile DeliveryRequests | [ ] | [ ] | List/filter/actions |
| Mobile WithdrawalSlips | [ ] | [ ] | List/filter/actions |
| Mobile CashRequest | [ ] | [ ] | Request/create/address flow |
| Mobile Dashboard | [ ] | [ ] | Stats/quick actions |
| Mobile Address | [ ] | [ ] | CRUD/default address |
| Mobile Wishlist | [ ] | [ ] | List/delete/actions |
| Mobile Login | [ ] | [ ] | Auth flow |
| Mobile Register | [ ] | [ ] | Auth form |
| Mobile CreateClaim | [ ] | [ ] | Form/attachment rules |
| Mobile CreateDelivery | [ ] | [ ] | Form/payload/validation |
| Mobile CreateShipment | [ ] | [ ] | Form/payload/validation |
| Mobile OrderDetail | [ ] | [ ] | Nen share model/core voi Web OrderDetail |
| Mobile Profile | [ ] | [ ] | Tabs/sub-models |
| Mobile Carts | [ ] | [ ] | Cart mutations |

## Rules Vong 1

### UI Files

`*Style*.tsx` chi duoc:

- Render layout/table/card/list/form/modal/drawer.
- Render loading/empty/error state tu model.
- Goi action tu model, vi du `model.actions.search(values)`.
- Dung local UI state nho khong anh huong business logic.

Khong viet truc tiep trong UI:

- `use*Query`, `use*Mutation`.
- API client, `fetch`, `axios`.
- Build API params, normalize filter, build submit payload.
- Export/download blob.
- Parse API error nghiep vu.
- Cache invalidation.
- Business validation/permission/status transition rules.

### Domain

`packages/features/<feature>/domain` chi chua pure logic va khong import React, Ant Design, React Router, CSS/Tailwind, tenant theme.

Nen chua:

- `normalizeXFilters`.
- `buildXApiParams`.
- `buildXPayload`.
- `transformXResponse`.
- `getXStatusMeta`.
- `canXAction`.
- `formatXLogValue`.
- Validation rule thuan du lieu.

### Model

`packages/features/<feature>/model` chiu trach nhiem:

- Query/mutation.
- URL filter/pagination/tab sync.
- Modal/action state co lien quan logic.
- Success/error notification.
- Navigation.
- Tao params/payload bang domain function.
- Expose `state/options/actions` cho UI.

Model nen return:

```ts
{
  state: {},
  options: {},
  actions: {},
  form,
  t,
}
```

Co the giu field cu tam thoi de backward-compatible voi UI hien tai.

### Web/Mobile Sharing

- Mac dinh web/mobile dung chung `domain`.
- Mac dinh web/mobile dung chung `model` neu chi khac UI.
- Chi tach `use<Page>WebModel` / `use<Page>MobileModel` khi behavior that su khac.
- Neu khac nho, uu tien `use<Page>Model(options)`.
- Neu khac nhieu nhung van share core, dung `use<Page>CoreModel`, `use<Page>WebModel`, `use<Page>MobileModel`.

## Definition Of Done Vong 1

- UI folder va visual hien tai giu nguyen.
- `*Style*.tsx` khong con query/mutation/API/business logic truc tiep.
- Domain pure logic da nam trong `packages/features/<feature>/domain`.
- Model query/mutation/action/state da nam trong `packages/features/<feature>/model`.
- Web/mobile share domain/model neu logic giong nhau, hoac ghi ro ly do tach.
- Behavior cu giu nguyen: route, URL params, filter, pagination, tab, export, mutation, notification, loading/empty/error.
- Guard command cho page pass hoac exception duoc ghi ro.
- Typecheck/build lien quan pass.
- Lint lien quan pass, hoac fail do unrelated existing issues duoc ghi ro.

## Commands

Guard page:

```bash
rg "use[A-Z][A-Za-z0-9]*(Query|Mutation)|fetch\\(|axios|Api\\.|window\\.location|localStorage|sessionStorage|App\\.useApp|message\\.|notification\\." apps/web/src/pages/<Page> apps/mobile/src/pages/<Page> -g "*.tsx"
```

Verify:

```bash
pnpm --filter web check-types
pnpm --filter mobile check-types
pnpm --filter web build
pnpm --filter mobile build
pnpm --filter web lint
pnpm --filter mobile lint
```
