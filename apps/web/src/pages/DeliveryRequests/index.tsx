import { useVariant } from "@repo/theme-provider";
import { DynamicVariant } from "@repo/ui";

const modules = import.meta.glob("./*.tsx");

export const DeliveryRequests = () => {
  const variant = useVariant("deliveryRequests", "DeliveryRequestsStyleDefault");

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="DeliveryRequestsStyleDefault"
      featureName="DeliveryRequests"
    />
  );
};

export default DeliveryRequests;
