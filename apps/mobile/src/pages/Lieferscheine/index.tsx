import { useVariant } from "@repo/theme-provider";
import { DynamicVariant } from "@repo/ui";

const modules = import.meta.glob("./*.tsx");

export const Lieferscheine = () => {
  const variant = useVariant("lieferscheine", "LieferscheineStyleDefault");

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="LieferscheineStyleDefault"
      featureName="Lieferscheine"
    />
  );
};

export default Lieferscheine;
