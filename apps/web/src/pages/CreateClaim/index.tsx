import { useVariant } from "@repo/theme-provider";
import { DynamicVariant } from "@repo/ui";

const modules = import.meta.glob("./*.tsx");

export const CreateClaim = () => {
  const variant = useVariant("createClaim");

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="CreateClaimStyle1"
      featureName="CreateClaim"
    />
  );
};

export default CreateClaim;
