import React from "react";
import { useVariant } from "@repo/theme-provider";
import { DynamicVariant } from "@repo/ui";

const modules = import.meta.glob("./*.tsx");

const CartCheckoutPage: React.FC<any> = (props) => {
  const variant = useVariant("cartCheckout", "CartCheckoutStyleDefault");

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="CartCheckoutStyleDefault"
      featureName="CartCheckout"
      componentProps={props}
    />
  );
};

export const CartCheckout = CartCheckoutPage;
export { CartCheckoutPage };
export default CartCheckoutPage;
