# Mobile Page Migration Plan

## Summary

Plan này track tiến độ migrate web -> mobile theo từng màn. Chỉ các dòng màn hình mới có checkbox. Các phần requirement bên dưới chỉ là tiêu chí bắt buộc khi làm từng màn, không tick riêng.

## Completed Screens

- [x] `Dashboard` -> mobile route `/dashboard`
- [x] `DeliveryRequests` -> mobile route `/delivery-requests`
- [x] `Lieferscheine` -> mobile route `/lieferscheine`
- [x] `DeliveryNotes` -> mobile route `/delivery-notes`

## Screens To Redo From Web

Các màn dưới đây phải xóa/bỏ implementation mobile cũ nếu có, rồi bốc lại từ web theo requirement bên dưới.

- [x] `Orders` -> mobile route `/orders`
- [x] `OrderDetail` -> mobile route `/orders/:code`
- [x] `Shipments` -> mobile route `/shipments`
- [x] `ShipmentDetail` -> mobile route `/shipments/:code`
- [x] `CreateShipment` -> mobile route `/shipments/create`
- [x] `Packages` -> mobile route `/packages`
- [x] `Waybills` -> mobile route `/waybills`
- [x] `Claims` -> mobile route `/claims`
- [x] `CreateClaim` -> mobile route `/tickets/create`
- [x] `WithdrawalSlips` -> mobile route `/withdrawal-slips`
- [x] `CreateDelivery` -> mobile route `/delivery/create`
- [x] `PeerPayments` -> mobile route `/peer-payments`
- [x] `PeerPaymentDetail` -> mobile route `/peer-payments/:id`
- [x] `CashRequest` -> mobile route `/cash-request`
- [x] `Carts` -> mobile route `/carts`
- [x] `CartCheckout` -> mobile route `/carts/checkout/:draftOrderId`
- [x] `Profile` -> mobile route `/profile`
- [x] `Notifications` -> mobile route `/notifications`
- [x] `Statistics` -> mobile route `/statistics`
- [ ] `ThemeConfigurator` -> mobile route `/theme-configurator`

## Web Routes That Are Not Separate Migration Screens

Các route này có trong web nhưng không cần thêm thành màn migrate riêng:

- `/delivery` -> alias của `DeliveryRequests`; migrate cùng `DeliveryRequests` qua route mobile `/delivery-requests`.
- `/transactions` -> web redirect tới `/profile?tab=transactions`; không có page web riêng để migrate.
- `/vouchers` -> web redirect tới `/profile?tab=vouchers`; không có page web riêng để migrate.
- `/wishlist` -> web redirect tới `/profile?tab=saved-products`; không có page web riêng để migrate.
- `/faqs` -> web redirect tới `/profile?tab=faqs`; không có page web riêng để migrate.

## Migration Order

1. Auth/account foundation: `Login`, `Register`, `Profile`
2. Navigation/detail foundation: `Orders`, `OrderDetail`, `Shipments`, `ShipmentDetail`
3. Shipping/package operational screens: `CreateShipment`, `Packages`, `Waybills`, `WithdrawalSlips`
4. Claim/delivery flow: `Claims`, `CreateClaim`, `CreateDelivery`
5. Payment/cash flow: `PeerPayments`, `PeerPaymentDetail`, `CashRequest`
6. Cart flow: `Carts`, `CartCheckout`
7. Utility/low priority: `Notifications`, `Statistics`, `ThemeConfigurator`

## Requirements Per Screen

- Delete or ignore the old mobile implementation for that screen before rebuilding.
- Create mobile page from `apps/web/src/pages/<SCREEN_NAME>` into `apps/mobile/src/pages/<SCREEN_NAME>`.
- Mobile `index.tsx` must render `DynamicVariant` like web, without extra layout/padding/background wrappers.
- Keep web UI unchanged. Do not convert web table/pagination while migrating mobile.
- Move shared page logic from web-local hooks into `packages/hooks/src/pages/<screen-name>.ts`.
- Web and mobile must import shared hooks from `@repo/hooks`.
- Mobile must not import from `apps/web`.
- Move reusable page/domain helpers into shared packages, preferring `@repo/hooks` for page/domain logic.

## Mobile UI Requirements

- Mobile list screens must use `Ant Design List + Card`, not `Table`.
- Item/card headers must be inside card body using `Flex`, not `Card.title` for long content.
- Use `minWidth: 0`, `wrap`, and `ellipsis` for long text.
- Status/tag must not overlap or push left-side content out of layout.
- List header/action groups must use `Flex`, support `wrap`, and put primary actions first.
- Filter actions should align right when layout allows.
- `Làm mới` must be left of `Tìm kiếm`.
- Prefer Ant Design components and `theme.useToken()` over custom CSS.
- Text, label, placeholder, button text, modal title, validation message, and empty/end/loading text should match the source web screen unless mobile behavior requires a deliberate wording change.

## Infinite Scroll And Loading Requirements

- Mobile list pages must use TanStack `useInfiniteQuery`.
- Normalize list API responses to `{ data: array, total, pageSize, current, totalPage }`.
- `getNextPageParam` must use loaded item count, `total`, and page metadata.
- Fetch next page with `IntersectionObserver`, using a sentinel around the 5th item from the end of the currently loaded list.
- Prefer whole-page scrolling for mobile infinite lists. Do not create a nested scroll area inside the list unless the screen explicitly needs a fixed-height virtualized panel.
- Prevent duplicate fetches while `isFetchingNextPage` is true.
- If using `InfiniteScroll`, pass `dataLength={rows.length}`.
- If `InfiniteScroll` children is a `<List />` wrapper, pass `hasChildren={rows.length > 0}`.
- Loading must use skeleton cards shaped like the real item.
- Initial list loading shows 5 skeleton cards.
- Load-more shows skeleton card loading.
- Do not use `Spin` for mobile list loading.
- `@rc-component/virtual-list` is optional. Keep it only if build passes and scroll is stable; otherwise fallback to `InfiniteScroll + AntD List + Card`.

## Money And Formatting Requirements

- Use `moneyFormat` from `@repo/util` for every monetary display.
- Do not use `Intl.NumberFormat` or page-local money formatters.
- Pass currency to `moneyFormat(value, currency)` when value has a non-default currency.
- Preserve source-screen rounding, null, and zero behavior.
- Use shared monetary input components where monetary input exists.

## Routes And Menu Requirements

- Add mobile routes for every migrated screen.
- Add menu entries only for main/list screens.
- Do not add menu entries for detail/create/checkout screens.
- Keep existing mobile-only pages untouched unless explicitly requested: `Address`, `Faqs`, `Transactions`, `Vouchers`, `Wishlist`.
- Web routes that redirect to profile tabs do not need separate web-to-mobile migrations unless requested.

## Verification Requirements

- Run `pnpm --filter mobile check-types` after each screen or small batch.
- Run `pnpm --filter web check-types` after shared hook changes.
- Run `pnpm --filter mobile build` after each route/list batch.
- Verify route opens correctly on mobile.
- Verify `DynamicVariant` resolves the correct style.
- Verify mobile list pages use cards, not tables.
- Verify infinite scroll fetches the next page once at bottom.
- Verify skeleton loading stops after data arrives.
- Verify tags, text, and actions do not overlap.
- Verify monetary values use `moneyFormat`.
- Verify web UI remains unchanged.

## Checkbox Rule

Only update a screen checkbox from `[ ]` to `[x]` after that screen is fully rebuilt from web, routed, verified, and all required checks pass.
