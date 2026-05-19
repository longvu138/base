import { matchPath, useLocation } from "react-router-dom";

const FOOTER_HIDDEN_PATTERNS = [
  "/orders/:code",
  "/shipments/:code",
  "/carts",
  "/carts/checkout/:draftOrderId",
];

export function useLayoutFooterVisibility() {
  const location = useLocation();

  return !FOOTER_HIDDEN_PATTERNS.some((pattern) =>
    matchPath({ path: pattern, end: true }, location.pathname),
  );
}
