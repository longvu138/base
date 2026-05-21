import { useVariant } from "@repo/theme-provider";
import { DynamicVariant } from "@repo/ui";

const modules = import.meta.glob("./*.tsx");

export const PeerPayments = () => {
  const variant = useVariant("peerPayments", "PeerPaymentsStyleDefault");

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="PeerPaymentsStyleDefault"
      featureName="PeerPayments"
    />
  );
};

export default PeerPayments;
