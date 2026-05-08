# Runtime Flow: Backend -> Frontend -> Router -> Page

Tai lieu nay mo ta luong chay thuc te cua source hien tai (sau refactor), tu luc backend tra tenant config den luc frontend render dung layout/page variant.

---

## 1) Backend tra tenant config

File backend:
- `apps/tenant-server/src/index.js`

Endpoint:
- `GET /api/tenants/:id/config`

Xu ly:
1. Lay `tenant` theo `id` (neu khong co thi fallback ve `baogam`)
2. Lay `planCode` (`free`/`paid`) de nap token mac dinh trong `PLAN_PRESETS`
3. Merge voi `tenant.override` bang `deepMerge`
4. Tra ve:
   - `id`, `name`, `planCode`, `variantCode`, `variantName`
   - `tenantConfig.themeConfig` (mau, border, radius, uiLib...)

Luu y:
- Backend hien tai **khong** tra mapping layout/menu/pages phuc tap.
- Frontend tu quyet dinh variant defaults theo `variantCode`.

---

## 2) Frontend fetch config va dat vao context

Web app:
- `apps/web/src/App.tsx`

Luong:
1. Doc tenant dang chon tu `localStorage('selected-tenant')`
2. Goi `fetchAppData(selectedTenantId)` -> `GET /api/tenants/:id/config`
3. `setGlobalTenantConfig(data)` vao `ThemeProvider` context
4. Cache `full-tenant-data` vao localStorage
5. Neu API loi:
   - thu doc cache `full-tenant-data`
   - neu khong co cache thi dung `FALLBACK_TENANT_CONFIG`

Theme ap dung song song:
- `applyTenantConfig(...)` -> merge token AntD
- `updateTenantCSSVariables(...)` -> cap nhat CSS variables

Mobile app (`apps/mobile/src/App.tsx`) di cung flow tuong tu.

---

## 3) Detect variant o frontend (diem quyet dinh UI)

### 3.1 Nguon defaults theo variant

File:
- `packages/theme-provider/src/variantDefaults.ts`

Ham:
- `getVariantDefaults(variantCode)`

Vi du `gd3` defaults:
- `componentOverrides.layout = 'SpecializedLayout'`
- `componentOverrides.orders = 'OrdersCombined'`
- `menu.preset = 'gobiz'`
- `menu.hiddenKeys = ['/shipments']`
- `menu.labelOverrides['/orders'] = 'Quản lý Tổng hợp'`
- `features.shipmentStatusDisplay = 'tabs'`

### 3.2 Resolve ten component cho tung page

File:
- `packages/theme-provider/src/ThemeContext.tsx`

Hook:
- `useVariant(pageKey)`

Thu tu uu tien:
1. `themeConfig.variants[pageKey]` (tenant override neu co)
2. `getVariantDefaults(variantCode).componentOverrides[pageKey]`
3. Guard dac biet (`gd2 + orderDetail -> OrderDetailStyle1`)
4. Naming convention: `${PageKey}Style${numberFromVariantCode}`

---

## 4) Router di vao layout va pages

File:
- `apps/web/src/routes.tsx`

Cau truc:
1. `/login`, `/register` la public routes
2. Cac route con lai di qua `<PrivateRoute />`
3. Sau auth, root route dung `<Layout />`

`Layout` trong:
- `apps/web/src/components/Layout/index.tsx`

Tai day:
1. Goi `useVariant('layout')`
2. `DynamicVariant` load layout file tu `import.meta.glob('./*.tsx')`
3. Neu khong tim thay -> fallback `VerticalLayout`

Voi `gd3`, `useVariant('layout')` tra `SpecializedLayout` (tu variant defaults), nen vao layout rieng.

---

## 5) Di vao tung page nhu the nao

Moi page theo pattern dispatcher:
- Vi du `apps/web/src/pages/Orders/index.tsx`
- Vi du `apps/web/src/pages/Shipments/index.tsx`

Pattern:
1. Goi `useVariant('<pageKey>')` de lay ten component
2. `DynamicVariant` tim file trung ten trong cung folder
3. Render component dung variant
4. Neu khong co file -> fallback ve style an toan

Vi du Orders:
- `gd1` -> `OrdersStyle1`
- `gd3` -> `OrdersCombined` (tu variant defaults)

---

## 6) Menu detect va render

File:
- `apps/web/src/components/Layout/Navigation.ts`

Hook `useNavigation()`:
1. Lay `variantCode` tu `tenantConfig`
2. Lay `variantDefaults` qua `getVariantDefaults(variantCode)`
3. Chon menu base:
   - `preset='gobiz'` -> `GOBIZ_MENU_ITEMS`
   - nguoc lai -> `BASE_MENU_ITEMS`
4. Ap `hiddenKeys` va `labelOverrides`:
   - uu tien `themeConfig.menu` neu tenant override co
   - neu khong co -> dung default cua variant

Ket qua:
- `gd3` giu menu dac thu ma khong can config phuc tap tu backend.

---

## 7) Page-level feature detect (vi du Shipments tabs/filter)

File:
- `apps/web/src/pages/Shipments/Shipments.tsx`

Logic:
1. Lay `variantDefaults.features.shipmentStatusDisplay`
2. Neu la `tabs` -> render `Tabs`
3. Neu khong -> render `StatusFilter`
4. Tenant override van co the ep tabs bang `themeConfig.variants.shipmentStatusDisplay = 'tabs'`

---

## 8) Tong ket kien truc hien tai

Backend phu trach:
- Du lieu tenant + theme token (mau, radius, uiLib...)

Frontend phu trach:
- Quy tac variant/UI defaults (layout, menu preset, page gop...)
- Dynamic render theo route/page

Loi ich:
- Them tenant moi nhanh: chi can them tenant + chon `variantCode`
- Muon UI khac hoan toan: tao style/layout moi, giu nguyen hooks/business logic
- Khong phu thuoc config UI long trong backend/DB
