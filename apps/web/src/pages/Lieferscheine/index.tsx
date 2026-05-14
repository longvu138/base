import { useVariant } from "@repo/theme-provider";
import { DynamicVariant } from "@repo/ui";

const modules = import.meta.glob("./*.tsx");

export const Lieferscheine = () => {
  const variant = useVariant("lieferscheine");

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="LieferscheineStyle1"
      featureName="Lieferscheine"
    />
  );
};

export default Lieferscheine;
