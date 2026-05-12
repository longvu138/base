import { useVariant } from "@repo/theme-provider";
import { DynamicVariant } from "@repo/ui";

const modules = import.meta.glob("./*.tsx");

export const CreateDelivery = () => {
  const variant = useVariant("createDelivery");

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="CreateDeliveryStyle1"
      featureName="CreateDelivery"
    />
  );
};

export default CreateDelivery;
