import { useVariant } from "@repo/theme-provider";
import { DynamicVariant } from "@repo/ui";

const modules = import.meta.glob("./*.tsx");

export const CreateClaim = () => {
  const variant = useVariant("createClaim", "CreateClaimStyleDefault");

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="CreateClaimStyleDefault"
      featureName="CreateClaim"
    />
  );
};

export default CreateClaim;
