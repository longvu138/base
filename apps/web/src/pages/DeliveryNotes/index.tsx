import { useVariant } from "@repo/theme-provider";
import { DynamicVariant } from "@repo/ui";

const modules = import.meta.glob("./*.tsx");

export const DeliveryNotes = () => {
  const variant = useVariant("deliveryNotes");

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="DeliveryNotesStyle1"
      featureName="DeliveryNotes"
    />
  );
};

export default DeliveryNotes;
