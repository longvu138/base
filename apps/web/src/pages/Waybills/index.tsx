import { useVariant } from "@repo/theme-provider";
import { DynamicVariant } from "@repo/ui";

const modules = import.meta.glob("./*.tsx");

export const Waybills = () => {
  const variant = useVariant("waybills", "WaybillsStyleDefault");

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="WaybillsStyleDefault"
      featureName="Waybills"
    />
  );
};

export default Waybills;
