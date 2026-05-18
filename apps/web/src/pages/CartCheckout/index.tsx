import { DynamicVariant } from "@repo/ui";
import { useVariant } from "@repo/theme-provider";

const modules = import.meta.glob("./*.tsx");

export const CartCheckout = () => {
  const variant = useVariant("cartCheckout", "CartCheckoutStyleDefault");

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="CartCheckoutStyleDefault"
      featureName="CartCheckout"
    />
  );
};

export default CartCheckout;
