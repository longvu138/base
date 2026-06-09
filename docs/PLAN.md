# Mobile Page Migration Plan

## Summary

Plan nÃ y track tiáº¿n Ä‘á»™ migrate web -> mobile theo tá»«ng mÃ n. Chá»‰ cÃ¡c dÃ²ng mÃ n hÃ¬nh má»›i cÃ³ checkbox. CÃ¡c pháº§n requirement bÃªn dÆ°á»›i chá»‰ lÃ  tiÃªu chÃ­ báº¯t buá»™c khi lÃ m tá»«ng mÃ n, khÃ´ng tick riÃªng.

## Completed Screens

- [x] `Dashboard` -> mobile route `/dashboard`
- [x] `DeliveryRequests` -> mobile route `/delivery-requests`

## Screens To Redo From Web

CÃ¡c mÃ n dÆ°á»›i Ä‘Ã¢y pháº£i xÃ³a/bá» implementation mobile cÅ© náº¿u cÃ³, rá»“i bá»‘c láº¡i tá»« web theo requirement bÃªn dÆ°á»›i.

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

CÃ¡c route nÃ y cÃ³ trong web nhÆ°ng khÃ´ng cáº§n thÃªm thÃ nh mÃ n migrate riÃªng:

- `/delivery` -> alias cá»§a `DeliveryRequests`; migrate cÃ¹ng `DeliveryRequests` qua route mobile `/delivery-requests`.
- `/transactions` -> web redirect tá»›i `/profile?tab=transactions`; khÃ´ng cÃ³ page web riÃªng Ä‘á»ƒ migrate.
- `/vouchers` -> web redirect tá»›i `/profile?tab=vouchers`; khÃ´ng cÃ³ page web riÃªng Ä‘á»ƒ migrate.
- `/wishlist` -> web redirect tá»›i `/profile?tab=saved-products`; khÃ´ng cÃ³ page web riÃªng Ä‘á»ƒ migrate.
- `/faqs` -> web redirect tá»›i `/profile?tab=faqs`; khÃ´ng cÃ³ page web riÃªng Ä‘á»ƒ migrate.

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
- `LÃ m má»›i` must be left of `TÃ¬m kiáº¿m`.
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
