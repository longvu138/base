import { useVariant } from "@repo/theme-provider";
import { DynamicVariant } from "@repo/ui";

const modules = import.meta.glob("./*.tsx");

export const ShipmentDetail = () => {
  const variant = useVariant("shipmentDetail", "ShipmentDetailStyleDefault");

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="ShipmentDetailStyleDefault"
      featureName="ShipmentDetail"
    />
  );
};

export default ShipmentDetail;
