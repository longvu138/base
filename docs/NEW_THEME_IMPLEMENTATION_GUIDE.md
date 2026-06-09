# Huong dan lam theme UI moi ma khong mat logic tinh nang

Du an nay duoc thiet ke de moi tenant/theme co the thay doi giao dien gan nhu hoan toan, nhung van dung chung API, hooks, filter, mutation, cache invalidation va route behavior hien co. Khi lam mot theme moi, hay xem cac file `Style*.tsx` la lop hien thi. Logic lay du lieu va xu ly thao tac phai nam trong hooks dung chung.

## Nguyen Tac Cot Loi

Khong viet lai business logic truc tiep trong component theme moi.

Voi moi page:

1. Dung page hook trong `apps/web/src/pages/<Page>/hooks` neu da co.
2. Neu page chua co page-level hook, tao hook truoc va dua logic vao do.
3. Component `Style<Theme>.tsx` chi nen render UI tu state/action ma hook tra ve.
4. API method phai nam trong `packages/api/src`.
5. React Query hook/mutation phai nam trong `packages/hooks/src`.
6. Page composition va UI rieng theo tenant nam trong `apps/web/src/pages`.

Lam dung nhu vay thi cac theme default/gobiz/thanhla/theme moi se giu duoc cung hanh vi tinh nang.

## Cau Truc Source

```txt
apps/
  web/
    src/
      App.tsx
      routes.tsx
      components/
        Layout/
          index.tsx                    # dispatcher chon layout theo theme
          LayoutStyleDefault.tsx
          LayoutStyleGobiz.tsx
          LayoutStyleThanhla.tsx
          Navigation.ts                # menu dung chung + default theo variant
        Common/
          ChatPanel.tsx                # chat dung lai cho order/shipment
        DepositModal/
          index.tsx
      pages/
        <Page>/
          index.tsx                    # dispatcher dung useVariant + DynamicVariant
          <Page>StyleDefault.tsx       # giao dien default
          <Page>StyleGobiz.tsx         # giao dien gobiz
          <Page>StyleThanhla.tsx       # giao dien thanhla
          <Page>Style<NewTheme>.tsx    # giao dien theme moi
          hooks/
            use<Page>Page.ts           # logic page: filter, query, action, navigation
          components/
            *.tsx                      # component rieng cua page
          tabs/
            *.tsx                      # tab cua detail page neu co

packages/
  api/
    src/
      *Api.ts                          # raw API client methods
      index.ts
  hooks/
    src/
      use*Hooks.ts                     # React Query hooks/mutations dung chung
      pages/
        *.ts                           # logic dung chung cho web/mobile
      index.ts
  theme-provider/
    src/
      ThemeContext.tsx                 # useTheme + useVariant resolver
      variantDefaults.ts               # chi khai bao exception/default menu
  ui/
    src/
      DynamicVariant.tsx               # load file Style duoc chon
```

## Co Che Chon Theme Hoat Dong Nhu The Nao

Moi feature co route rieng deu co mot dispatcher:

```tsx
const variant = useVariant("orders", "OrdersStyleDefault");

return (
  <DynamicVariant
    variantName={variant}
    modules={import.meta.glob("./*.tsx")}
    fallbackName="OrdersStyleDefault"
    featureName="Orders"
  />
);
```

Thu tu resolve component:

1. `tenantConfig.tenantConfig.themeConfig.variants[pageKey]`
2. Override trong `packages/theme-provider/src/variantDefaults.ts`
3. Naming convention theo `variantCode`
4. Fallback cua dispatcher

Naming convention:

```txt
pageKey="orders"      + variantCode="newbrand" -> OrdersStyleNewbrand.tsx
pageKey="layout"      + variantCode="newbrand" -> LayoutStyleNewbrand.tsx
pageKey="orderDetail" + variantCode="newbrand" -> OrderDetailStyleNewbrand.tsx
```

Chi sua `variantDefaults.ts` khi co exception, vi du mot page co ten component khong theo convention hoac theme can preset menu rieng. Khong map tat ca page trong file nay.

## Quy Trinh Lam Theme Moi Nhanh Nhat

Gia su backend tra `variantCode = "newbrand"`.

1. Tao shell layout truoc:

```txt
apps/web/src/components/Layout/LayoutStyleNewbrand.tsx
```

Export ca named va default:

```tsx
export const LayoutStyleNewbrand = () => {
  return <YourLayout />;
};

export default LayoutStyleNewbrand;
```

2. Lam cac page co traffic cao truoc:

```txt
apps/web/src/pages/Dashboard/DashboardStyleNewbrand.tsx
apps/web/src/pages/Orders/OrdersStyleNewbrand.tsx
apps/web/src/pages/OrderDetail/OrderDetailStyleNewbrand.tsx
apps/web/src/pages/Shipments/ShipmentsStyleNewbrand.tsx
apps/web/src/pages/ShipmentDetail/ShipmentDetailStyleNewbrand.tsx
apps/web/src/pages/Packages/PackagesStyleNewbrand.tsx
apps/web/src/pages/Profile/ProfileStyleNewbrand.tsx
```

3. Page nao chua redesign thi chua can tao file. `DynamicVariant` se fallback ve `StyleDefault` neu khong tim thay file theme moi.

4. Voi moi style file moi, bat dau bang viec import hook hien co va render UI toi thieu nhung day du action. Sau do moi polish giao dien.

5. Uu tien noi mutation/action truoc khi lam dep. Nut nhin nhu da xong nhung khong goi hook la bug.

## Pattern Dung Page Hook

Theme view nen co dang nhu sau:

```tsx
import { Button, Card, Table } from "antd";
import { useOrdersPage } from "./hooks/useOrdersPage";

export const OrdersStyleNewbrand = () => {
  const page = useOrdersPage();

  return (
    <Card>
      <Button onClick={page.resetFilters}>{page.t("orders.buttons.reset")}</Button>
      <Table
        loading={page.isOrdersLoading}
        dataSource={page.orders}
        pagination={page.pagination}
        onChange={page.handleTableChange}
        rowKey="code"
      />
    </Card>
  );
};

export default OrdersStyleNewbrand;
```

Theme duoc phep quyet dinh layout, density, mau sac va vi tri control. Hook quyet dinh data, action, cache, URL params va navigation.

## Checklist Hook Theo Page

Dung cac hook nay truoc khi dung low-level hook:

| Page | Dispatcher key | View files | Page hook / shared logic |
| --- | --- | --- | --- |
| Layout | `layout` | `components/Layout/LayoutStyle*.tsx` | `useNavigation`, `useTheme`, profile/cart/notification hooks |
| Dashboard | `dashboard` | `pages/Dashboard/DashboardStyle*.tsx` | `useDashboardPage` |
| Orders | `orders` | `pages/Orders/OrdersStyle*.tsx` | `useOrdersPage`, `packages/hooks/src/pages/orders.ts` |
| Order Detail | `orderDetail` | `pages/OrderDetail/OrderDetailStyle*.tsx` | `useOrderDetailPage`, hooks trong `tabs/` |
| Shipments | `shipments` | `pages/Shipments/ShipmentsStyle*.tsx` | `useShipmentsPage` |
| Shipment Detail | `shipmentDetail` | `pages/ShipmentDetail/ShipmentDetailStyle*.tsx` | `useShipmentDetailPage`, `useShipmentDetailContent` |
| Packages | `packages` | `pages/Packages/PackagesStyle*.tsx` | `usePackagesPage`, `PackageShared` |
| Delivery Requests | `deliveryRequests` | `pages/DeliveryRequests/DeliveryRequestsStyle*.tsx` | `useDeliveryRequestsPage` |
| Waybills | `waybills` | `pages/Waybills/WaybillsStyle*.tsx` | `useWaybillsPage`, `WaybillsShared` |
| Claims | `claims` | `pages/Claims/ClaimsStyle*.tsx` | `useClaimsPage`, `GobizClaimsList` |
| Create Claim | `createClaim` | `pages/CreateClaim/CreateClaimStyle*.tsx` | `useCreateClaimPage` |
| Create Shipment | `createShipment` | `pages/CreateShipment/CreateShipmentStyle*.tsx` | `useCreateShipmentPage`, `useCreateShipmentFinancialFields` |
| Create Delivery | `createDelivery` | `pages/CreateDelivery/CreateDeliveryStyle*.tsx` | `useCreateDeliveryPage` |
| Notifications | `notifications` | `pages/Notifications/NotificationsStyle*.tsx` | `useNotificationsPage` |
| Profile | `profile` | `pages/Profile/ProfileStyle*.tsx` | `useProfilePage` va cac profile sub-hooks |
| Login | `login` | `pages/Login/LoginStyle*.tsx` | dispatcher truyen auth props |
| Register | `register` | `pages/Register/RegisterStyle*.tsx` | dispatcher truyen register props |

Neu UI moi khac hoan toan nhung tinh nang giong nhau, van dung cung page hook. Neu hook thieu action can thiet, them action vao hook va update cac style lien quan.

## Lop Hook Thap Hon

Chi dung low-level hooks trong page hook hoac component tinh nang cua page:

```txt
packages/hooks/src/useOrderHooks.ts
packages/hooks/src/useShipmentHooks.ts
packages/hooks/src/usePackageHooks.ts
packages/hooks/src/useDeliveryRequestHooks.ts
packages/hooks/src/useWaybillHooks.ts
packages/hooks/src/useCustomerHooks.ts
packages/hooks/src/useClaimHooks.ts
packages/hooks/src/useWishlistHooks.ts
packages/hooks/src/useVoucherHooks.ts
packages/hooks/src/useAddressHooks.ts
```

Dung:

```tsx
// useOrderDetailPage.ts
const cancelOrder = useCancelOrderMutation(code);
const handleCancelOrder = () => cancelOrder.mutateAsync();
```

Tranh:

```tsx
// OrderDetailStyleNewbrand.tsx
ApiClient.auth.post(`customer/orders/${code}/cancel`);
```

Goi API truc tiep trong style file se bo qua cache invalidation va rat de lam thieu logic o theme khac.

## Checklist Day Du Tinh Nang

Truoc khi coi mot themed page la xong, hay so voi `StyleDefault` va hook hien co:

```txt
[ ] loading state
[ ] empty state
[ ] error/not found state
[ ] pagination
[ ] sort/filter/search
[ ] sync URL query
[ ] navigation sang detail/list lien quan
[ ] tat ca primary actions
[ ] destructive actions co confirm
[ ] loading/disabled state khi mutation dang chay
[ ] success/error notifications
[ ] cache invalidation thong qua hook mutation
[ ] chi dung i18n keys, khong hard-code text ung dung
[ ] ton trong permission/status flags, vi du cancellable/confirmable
[ ] responsive layout
[ ] dark mode hoac token-based styling neu layout support dark mode
```

Voi detail page, kiem tra them:

```txt
[ ] thong tin summary/header
[ ] editable fields
[ ] tabs
[ ] products/packages/fees/transactions/history/log/claims neu page co
[ ] chat/comment panel neu page hien tai co
[ ] reorder/cancel/claim actions khi status cho phep
```

## Quy Tac Them API Va Mutation

Khi can them action moi:

1. Them raw method trong `packages/api/src/*Api.ts`.
2. Them React Query mutation trong `packages/hooks/src/use*Hooks.ts`.
3. Invalidate tat ca cache key bi anh huong.
4. Expose handler sach tu page hook.
5. Render action tu cac style can tinh nang do.

Vi du:

```tsx
// packages/api/src/OrderApi.ts
reorderProductsToCart: (code: string) => {
  return ApiClient.auth.post(`customer/orders/${code}/products/cart`);
};

// packages/hooks/src/useOrderHooks.ts
export const useReorderMutation = (code: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await OrderApi.reorderProductsToCart(code);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer.cart.statistics"] });
      queryClient.invalidateQueries({ queryKey: ["customer.cart.items"] });
    },
  });
};
```

## Layout Va Navigation

Theme shell moi:

```txt
apps/web/src/components/Layout/LayoutStyleNewbrand.tsx
```

Can giu cac behavior sau:

```txt
[ ] render <Outlet />
[ ] giu profile dropdown actions
[ ] giu cart link/count
[ ] giu notifications link/count
[ ] giu language selector neu tenant can
[ ] giu tenant selector neu appConfig.enableTenantSelector
[ ] giu ThemeSwitcher neu layout support theme mode
[ ] dung useNavigation() cho menu entries
[ ] dung profileMenuItems() hoac logic shared tuong duong cho profile menu
```

Khong hard-code menu list trong layout tru khi hook hien tai khong the bieu dien yeu cau. Menu behavior nen dieu khien qua `variantDefaults.menu` hoac backend `themeConfig.menu`.

## Khi Nao Tao Shared Component

Tao shared page component khi nhieu theme chi khac wrapper/visual:

```txt
WaybillsShared.tsx
PackageShared.tsx
Profile/components/*.tsx
```

Tao file `Style<Theme>.tsx` moi khi layout, density, grouping hoac workflow khac dang ke.

## Quy Tac Dat Ten File Theme Moi

Voi `variantCode = "newbrand"`:

```txt
LayoutStyleNewbrand.tsx
DashboardStyleNewbrand.tsx
OrdersStyleNewbrand.tsx
OrderDetailStyleNewbrand.tsx
ShipmentsStyleNewbrand.tsx
ShipmentDetailStyleNewbrand.tsx
PackagesStyleNewbrand.tsx
ProfileStyleNewbrand.tsx
LoginStyleNewbrand.tsx
RegisterStyleNewbrand.tsx
```

Voi variant code nhieu tu:

```txt
variantCode="bao-gam-pro" -> StyleBaoGamPro
variantCode="bao_gam_pro" -> StyleBaoGamPro
```

Ten file va export phai khop:

```tsx
export const OrdersStyleBaoGamPro = () => {};
export default OrdersStyleBaoGamPro;
```

## Cach Reuse De Lam Nhanh

Cach nhanh nhat ma van an toan:

1. Copy style file gan nhat.
2. Giu lai tat ca import tu page hook.
3. Chi xoa visual markup ma ban dang thay the.
4. Giu ten handler/state cho den khi UI moi chay dung.
5. Chay type check.
6. So tung action voi default style.
7. Sau do moi polish UI.

Goi y file nen copy:

```txt
Dashboard:       copy DashboardStyleGobiz hoac DashboardStyleDefault
Orders:          copy OrdersStyleGobiz neu can UI van hanh day du, Default neu can table don gian
Order Detail:    copy OrderDetailStyleDefault truoc vi dang co action moi nhat
Shipments:       copy ShipmentsStyleDefault; Gobiz/Thanhla hien dang wrap lai
Shipment Detail: copy ShipmentDetailStyleGobiz cho shell hien dai hoac Default cho flow don gian
Packages:        uu tien pattern PackageShared/PackagesStyleGobiz
Profile:         dung ProfileGobizView voi variant prop moi neu layout gan giong
```

## Lenh Verify

Dung PowerShell tren Windows:

```powershell
pnpm.cmd --filter web check-types
pnpm.cmd --filter web build
```

Neu Ant Design CLI duoc cai trong project:

```powershell
pnpm.cmd exec antd lint apps/web/src/pages/<Page>/<Page>Style<Theme>.tsx --format json
```

Ghi chu hien tai cua repo: neu chua co CLI `antd`, lenh tren se fail voi `Command "antd" not found`.

## Checklist Review PR Cho Theme Moi

```txt
[ ] Moi style file export ca named va default component.
[ ] Khong co ApiClient call truc tiep trong style files.
[ ] Khong copy business rule vao style files.
[ ] Action moi duoc them dung 3 lop: API + hook + page hook.
[ ] Tat ca mutation invalidate dung cache keys.
[ ] Page chua lam theme moi fallback ve default co chu dich.
[ ] Variant exception chi nam trong variantDefaults.ts khi convention khong du.
[ ] Text moi co i18n key.
[ ] Type check pass.
[ ] Da test cac flow chinh: list, detail, create, edit, cancel, reorder, export/import neu co.
```

## Quy Tac Nhanh De Chon Noi Dat Logic

Neu ban dang hoi "logic nay nen dat o dau?":

```txt
Network endpoint?        packages/api/src/*Api.ts
Query/mutation/cache?    packages/hooks/src/use*Hooks.ts
Page state workflow?     apps/web/src/pages/<Page>/hooks/use<Page>Page.ts
UI rieng theo tenant?    apps/web/src/pages/<Page>/<Page>Style<Theme>.tsx
Visual component dung lai? apps/web/src/pages/<Page>/components/*.tsx
UI shell dung chung?     apps/web/src/components/*.tsx
```

Giu dung boundary nay thi co the lam theme moi nhanh ma khong am tham lam mat tinh nang.
