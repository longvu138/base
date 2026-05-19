import { useVariant } from "@repo/theme-provider";
import { DynamicVariant } from "@repo/ui";

const modules = import.meta.glob("./*.tsx");

export const Statistics = () => {
  const variant = useVariant("statistics", "StatisticsStyleDefault");

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="StatisticsStyleDefault"
      featureName="Statistics"
    />
  );
};

export default Statistics;
