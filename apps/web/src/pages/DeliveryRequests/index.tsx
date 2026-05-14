import { useVariant } from "@repo/theme-provider";
import { DynamicVariant } from "@repo/ui";

const modules = import.meta.glob("./*.tsx");

export const DeliveryRequests = () => {
  const variant = useVariant("deliveryRequests");

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="DeliveryRequestsStyle1"
      featureName="DeliveryRequests"
    />
  );
};

export default DeliveryRequests;
