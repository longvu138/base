# Project Instructions

## Money Display

- For any monetary value rendered in UI, use the shared helpers from `@repo/util`.
- Prefer `moneyFormat(...)` for display. Do not build money strings with `Intl.NumberFormat`, manual currency suffixes, or page-local `formatMoney` helpers.
- `moneyFormat(...)` and `quantityFormat(...)` must preserve the legacy `gobiz-amphitrite` number delimiters: Vietnamese uses `.` for thousands and `,` for decimals, while non-Vietnamese uses the English numeral locale.
- Do not register or override number locales inside screens. Keep delimiter behavior centralized in `@repo/util`.
- When an existing screen rounds monetary values before display, preserve that contract explicitly and keep the rounding logic visible near the call site or in a shared helper. Do not silently replace existing `moneyFormat(...)` usage with ad hoc formatting.
- Pass the source currency into `moneyFormat(value, currency)` when the value is stored in a non-default currency, for example CNY item amounts.
- Before changing money rendering, compare null/zero behavior with the source screen or existing product behavior. Some legacy flows intentionally display missing numeric money as `0` after rounding instead of `---`.
