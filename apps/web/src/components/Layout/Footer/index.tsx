import { useVariant } from "@repo/theme-provider";
import { DynamicVariant } from "@repo/ui";

const modules = import.meta.glob("./*.tsx");

const LayoutFooter = () => {
  const variant = useVariant("footer", "FooterStyleDefault");

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="FooterStyleDefault"
      featureName="Footer"
    />
  );
};

export default LayoutFooter;
