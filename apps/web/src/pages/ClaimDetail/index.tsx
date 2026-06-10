import { useVariant } from "@repo/theme-provider";
import { DynamicVariant } from "@repo/ui";

const modules = import.meta.glob("./*.tsx");

export const ClaimDetail = () => {
  const variant = useVariant("claimDetail", "ClaimDetailStyleDefault");

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="ClaimDetailStyleDefault"
      featureName="ClaimDetail"
    />
  );
};

export default ClaimDetail;
