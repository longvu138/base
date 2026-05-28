import { useVariant } from "@repo/theme-provider";
import { DynamicVariant } from "@repo/ui";

const modules = import.meta.glob("./*.tsx");

export const CreateDelivery = () => {
  const variant = useVariant("createDelivery", "CreateDeliveryStyleDefault");

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="CreateDeliveryStyleDefault"
      featureName="CreateDelivery"
    />
  );
};

export default CreateDelivery;
