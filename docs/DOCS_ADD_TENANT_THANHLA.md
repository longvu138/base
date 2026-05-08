# Hướng Dẫn Thêm Tenant `thanhla` (UI khác hoàn toàn, giữ nguyên logic)

Tài liệu này mô tả cách thêm tenant mới `thanhla` theo hướng:
- UI có thể khác hoàn toàn
- Logic nghiệp vụ (API/query/filter/pagination) tái sử dụng tối đa
- Hạn chế sửa backend/DB cho config UI phức tạp

---

## 1) Mục tiêu kiến trúc

Với code hiện tại, bạn nên tách rõ:
- **Logic layer (dùng lại):** `@repo/hooks`, page hooks (`useOrdersPage`, `useShipmentsPage`, ...)
- **Presentation layer (thay theo tenant):** `*StyleX.tsx`, layout, menu, component sắp xếp

Nguyên tắc:  
**Cùng một hook logic -> nhiều giao diện khác nhau có thể render dữ liệu đó.**

---

## 2) Việc cần làm ở backend (tối thiểu)

Chỉ thêm tenant mới trong `apps/tenant-server/src/index.js`:

- thêm key `thanhla` trong `tenants`
- chọn `planCode` (`free` hoặc `paid`)
- chọn `variantCode` (ví dụ `gd4` nếu bạn muốn hệ style mới)
- giữ `override.tenantConfig.themeConfig` cho token màu/radius (nếu cần)

Ví dụ:

```js
thanhla: {
  name: 'Thanhla Logistics',
  planCode: 'paid',
  variantCode: 'gd4',
  override: {
    tenantConfig: {
      themeConfig: {
        colorPrimary: '#0ea5e9',
        colorBorder: '#7dd3fc',
        borderRadius: 10
      }
    }
  }
}
```

Luu y: backend **khong** can luu menu/layout/pages mapping.

---

## 3) Việc cần làm ở frontend (quan trọng nhất)

## 3.1 Them quy tac tenant-specific tap trung

Hien tai logic tenant-specific dang nam o:
- `packages/theme-provider/src/ThemeContext.tsx` (`useVariant`)
- `apps/web/src/components/Layout/Navigation.ts` (menu)
- `apps/web/src/pages/Shipments/Shipments.tsx` (status tabs rule)

De de bao tri cho tenant moi, nen tao 1 file quy tac trung tam, vi du:
- `apps/web/src/tenant-ui-rules.ts`

Y tuong:
- input: `tenantId`, `variantCode`, `pageKey`
- output:
  - layout nao dung
  - menu nao dung
  - co dung tabs status khong
  - page nao can override component name

Neu chua refactor ngay, ban van co the them rule `thanhla` truc tiep o 3 file tren.

---

## 3.2 Tao giao dien rieng theo page (chi doi UI, giu logic)

Moi page dang theo pattern dispatcher:
- `index.tsx` goi `useVariant('orders')`
- `DynamicVariant` load file `OrdersStyle{n}.tsx`

Ban lam:

1. Tao style moi cho tenant `thanhla`, vi du:
   - `apps/web/src/pages/Orders/OrdersStyle4.tsx`
   - `apps/web/src/pages/Shipments/ShipmentsStyle4.tsx`
   - `apps/web/src/pages/Claims/ClaimsStyle4.tsx`
   - ...

2. Trong moi `*Style4.tsx`, **khong viet lai business logic**.
   - Tai su dung hook page hien co:
     - `useOrdersPage`
     - `useShipmentsPage`
     - `useClaimsPage`
   - Ban chi doi:
     - cau truc JSX
     - className/CSS
     - cach bo tri filter/table/card

Template:

```tsx
export const OrdersStyle4 = () => {
  const {
    t,
    form,
    page,
    pageSize,
    setPage,
    setPageSize,
    ordersData,
    isOrdersLoading,
    handleSearch,
    handleReset,
    navigateToDetail
  } = useOrdersPage(); // GIU NGUYEN LOGIC

  // CHI DOI PHAN UI
  return <YourThanhlaOrdersLayout ... />;
};
```

3. Dam bao fallback an toan:
   - neu page chua co `Style4`, dispatcher fallback ve `Style1` de khong vo UI.

---

## 3.3 Layout va Navigation rieng cho `thanhla`

Neu `thanhla` can layout hoan toan khac:

1. Tao layout moi:
   - `apps/web/src/components/Layout/ThanhlaLayout.tsx`

2. Them rule trong `useVariant('layout')`:
   - `tenantId === 'thanhla' -> 'ThanhlaLayout'`

3. Menu:
   - cach nhanh: them bo menu `THANHLA_MENU_ITEMS` trong `Navigation.ts`
   - cach tot hon: doc menu tu file rules trung tam (`tenant-ui-rules.ts`)

---

## 4) Cach tai su dung hooks toi da

## 4.1 Nhung thu NEN giu nguyen

- API layer trong `packages/api`
- Logic hooks trong `packages/hooks`
- Page hooks orchestration (form + URL + pagination), vi du:
  - `apps/web/src/pages/Orders/hooks/useOrdersPage.ts`

## 4.2 Nhung thu CHI nen doi

- file `*StyleX.tsx`
- CSS/SCSS/Tailwind class
- layout/menu composition

## 4.3 Rule 80/20

- 80% logic dung chung (hooks, query, filter)
- 20% khac biet nam o render layer (component + style)

Neu thay ban dang copy lai nhieu `useEffect` xu ly data giua cac style => nen day phan do ve hook dung chung.

---

## 5) Checklist thuc thi cho tenant `thanhla`

- [ ] Them tenant `thanhla` trong `apps/tenant-server/src/index.js`
- [ ] Chon `variantCode` (de xuat `gd4`)
- [ ] Tao `*Style4.tsx` cho cac page uu tien:
  - [ ] Login
  - [ ] Dashboard
  - [ ] Orders
  - [ ] OrderDetail
  - [ ] Shipments
- [ ] Tao `ThanhlaLayout.tsx` neu can layout rieng
- [ ] Them menu rieng cho `thanhla`
- [ ] Them tenant-specific rules (layout/menu/status-tabs/page override)
- [ ] Kiem tra fallback page chua co Style4 -> Style1
- [ ] Test dark mode + light mode
- [ ] Test URL filters/pagination van hoat dong
- [ ] Test cac action quan trong (search, detail navigate, status update)

---

## 6) Ke hoach lam nhanh de an toan

Phase 1 (an toan, it rui ro):
- them `thanhla`
- doi theme token + layout + menu
- thay UI 2-3 page quan trong
- phan con lai fallback `Style1`

Phase 2 (hoan thien):
- bo sung `Style4` cho cac page con lai
- toi uu hoa component dung chung cho `thanhla`

---

## 7) Tieu chi "chi doi giao dien, logic van day du"

Ban dat dung huong khi dam bao:
- khong sua API contract cho tenant rieng
- khong duplicate query/business logic trong style files
- moi style file chi goi hook va render UI
- thay doi tenant khong lam sai filter/pagination/navigation behavior

Neu can, buoc tiep theo nen lam la refactor 1 file rules trung tam (`tenant-ui-rules.ts`) de tat ca tenant-specific UI behavior nam 1 cho, tranh ro rac khap codebase.
