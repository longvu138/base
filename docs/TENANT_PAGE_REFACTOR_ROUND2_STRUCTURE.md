# Tenant Page Refactor Round 2: Structure

Muc tieu vong 2: sau khi vong 1 cua page da xong, migrate tenant UI sang `variants/<variantCode>/index.tsx` de sau nay them tenant moi de quan ly hon.

Trang thai:

- `[ ]` Chua lam.
- `[~]` Dang lam.
- `[x]` Da migrate structure xong va da verify.
- `[skip]` Khong can migrate.

## Prompt Vong 2

Copy prompt nay va chi thay `<PageName>`.

```txt
Lam vong 2 migrate folder tenant UI cho page <PageName>. Doc docs/TENANT_PAGE_REFACTOR_ROUND2_STRUCTURE.md va chi refactor page nay.

Dieu kien:
- Logic/model/domain cua page <PageName> da refactor o vong 1.
- Khong doi behavior va khong rewrite UI visual.

Pham vi:
- Migrate UI tu *Style*.tsx sang variants/<variantCode>/index.tsx neu rui ro chap nhan duoc.
- Cap nhat resolver backward-compatible voi ca variants folder moi va *Style*.tsx cu.
- Component rieng cua tenant dat trong variants/<variantCode>/components.
- Component UI dung chung cua page dat trong components/ hoac views/shared/.
- Khong dua business logic vao variants.

Muc tieu:
- Tenant moi sau nay chi can them variants/<newtenant>/index.tsx.
- File/folder tenant UI de quan ly hon khi so luong tenant tang.
- Source van chay voi default/gobiz/thanhla hien co.

Quy trinh bat buoc:
1. Doc page <PageName> sau vong 1 va xac nhan model/domain da on dinh.
2. Kiem tra resolver hien tai va DynamicVariant co can update de support variants folder khong.
3. Migrate tung tenant UI an toan, giu export default/named neu can backward compatibility.
4. Chay guard command cho page, bao gom variants folder.
5. Chay typecheck/build/lint lien quan.
6. Bao cao: file da move/sua, resolver fallback, commands pass/fail, checklist vong 2 tick duoc muc nao.
```

## Checklist Vong 2

### Web

| Page | Status | Verify | Notes |
| --- | --- | --- | --- |
| Web Orders | [ ] | [ ] | Vong 1 done, san sang migrate variants khi can |
| Web Notifications | [ ] | [ ] | Lam sau khi vong 1 done |
| Web Claims | [ ] | [ ] | Lam sau khi vong 1 done |
| Web DeliveryNotes | [ ] | [ ] | Lam sau khi vong 1 done |
| Web Waybills | [ ] | [ ] | Lam sau khi vong 1 done |
| Web Lieferscheine | [ ] | [ ] | Lam sau khi vong 1 done |
| Web Shipments | [ ] | [ ] | Lam sau khi vong 1 done |
| Web Packages | [ ] | [ ] | Lam sau khi vong 1 done |
| Web DeliveryRequests | [ ] | [ ] | Lam sau khi vong 1 done |
| Web WithdrawalSlips | [ ] | [ ] | Lam sau khi vong 1 done |
| Web CashRequest | [ ] | [ ] | Lam sau khi vong 1 done |
| Web Statistics | [ ] | [ ] | Lam sau khi vong 1 done |
| Web Dashboard | [ ] | [ ] | Lam sau khi vong 1 done |
| Web Login | [ ] | [ ] | Lam sau khi vong 1 done |
| Web Register | [ ] | [ ] | Lam sau khi vong 1 done |
| Web CreateClaim | [ ] | [ ] | Lam sau khi vong 1 done |
| Web CreateDelivery | [ ] | [ ] | Lam sau khi vong 1 done |
| Web CreateShipment | [ ] | [ ] | Lam sau khi vong 1 done |
| Web OrderDetail | [ ] | [ ] | Lam sau khi vong 1 done |
| Web ShipmentDetail | [ ] | [ ] | Lam sau khi vong 1 done |
| Web PeerPaymentDetail | [ ] | [ ] | Lam sau khi vong 1 done |
| Web Profile | [ ] | [ ] | Lam sau khi vong 1 done |
| Web Carts | [ ] | [ ] | Lam sau khi vong 1 done |
| Web CartCheckout | [ ] | [ ] | Lam sau khi vong 1 done |
| Web PeerPayments | [ ] | [ ] | Lam sau khi vong 1 done |
| Web ThemeConfigurator | [ ] | [ ] | Co the skip neu internal-only |

### Mobile

| Page | Status | Verify | Notes |
| --- | --- | --- | --- |
| Mobile Orders | [ ] | [ ] | Vong 1 done, san sang migrate variants khi can |
| Mobile Notifications | [ ] | [ ] | Lam sau khi vong 1 done |
| Mobile Claims | [ ] | [ ] | Lam sau khi vong 1 done |
| Mobile DeliveryNotes | [ ] | [ ] | Lam sau khi vong 1 done |
| Mobile Waybills | [ ] | [ ] | Lam sau khi vong 1 done |
| Mobile Lieferscheine | [ ] | [ ] | Lam sau khi vong 1 done |
| Mobile Transactions | [ ] | [ ] | Lam sau khi vong 1 done |
| Mobile Vouchers | [ ] | [ ] | Lam sau khi vong 1 done |
| Mobile Faqs | [ ] | [ ] | Lam sau khi vong 1 done |
| Mobile Shipments | [ ] | [ ] | Lam sau khi vong 1 done |
| Mobile Packages | [ ] | [ ] | Lam sau khi vong 1 done |
| Mobile DeliveryRequests | [ ] | [ ] | Lam sau khi vong 1 done |
| Mobile WithdrawalSlips | [ ] | [ ] | Lam sau khi vong 1 done |
| Mobile CashRequest | [ ] | [ ] | Lam sau khi vong 1 done |
| Mobile Dashboard | [ ] | [ ] | Lam sau khi vong 1 done |
| Mobile Address | [ ] | [ ] | Lam sau khi vong 1 done |
| Mobile Wishlist | [ ] | [ ] | Lam sau khi vong 1 done |
| Mobile Login | [ ] | [ ] | Lam sau khi vong 1 done |
| Mobile Register | [ ] | [ ] | Lam sau khi vong 1 done |
| Mobile CreateClaim | [ ] | [ ] | Lam sau khi vong 1 done |
| Mobile CreateDelivery | [ ] | [ ] | Lam sau khi vong 1 done |
| Mobile CreateShipment | [ ] | [ ] | Lam sau khi vong 1 done |
| Mobile OrderDetail | [ ] | [ ] | Lam sau khi vong 1 done |
| Mobile Profile | [ ] | [ ] | Lam sau khi vong 1 done |
| Mobile Carts | [ ] | [ ] | Lam sau khi vong 1 done |

## Rules Vong 2

Structure muc tieu:

```txt
apps/web/src/pages/<Page>/
  index.tsx
  variants/
    default/index.tsx
    gobiz/index.tsx
    thanhla/index.tsx
    <newtenant>/index.tsx

apps/mobile/src/pages/<Page>/
  index.tsx
  variants/
    default/index.tsx
    gobiz/index.tsx
    thanhla/index.tsx
    <newtenant>/index.tsx
```

Rules:

- Khong doi visual/behavior trong luc migrate folder.
- Khong dua business logic vao `variants`.
- Component rieng cua tenant dat trong `variants/<variantCode>/components`.
- Component UI dung chung cua page dat trong `components/` hoac `views/shared/`.
- Resolver phai backward-compatible voi file cu.

Resolver order:

```txt
1. ./variants/<variantCode>/index.tsx
2. ./<ComponentName>.tsx
3. ./variants/default/index.tsx
4. ./<FallbackComponentName>.tsx
```

## Definition Of Done Vong 2

- Tenant UI nam trong `variants/<variantCode>/index.tsx`.
- Resolver support variants folder va fallback file cu.
- UI visual/behavior khong doi.
- Business logic khong nam trong variants.
- Guard/typecheck/build lien quan pass.
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
