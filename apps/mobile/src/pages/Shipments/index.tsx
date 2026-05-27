import React from "react";
import { useVariant } from "@repo/theme-provider";
import { DynamicVariant } from "@repo/ui";

const modules = import.meta.glob("./*.tsx");

const ShipmentsPage: React.FC<any> = (props) => {
  const variant = useVariant("shipments", "ShipmentsStyleDefault");

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="ShipmentsStyleDefault"
      featureName="Shipments"
      componentProps={props}
    />
  );
};

export const Shipments = ShipmentsPage;
export { ShipmentsPage };
export default ShipmentsPage;
