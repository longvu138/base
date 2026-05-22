import { useVariant } from "@repo/theme-provider";
import { DynamicVariant } from "@repo/ui";

const modules = import.meta.glob("./*.tsx");

export const PeerPaymentDetail = () => {
  const variant = useVariant("peerPaymentDetail", "PeerPaymentDetailStyleDefault");

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="PeerPaymentDetailStyleDefault"
      featureName="PeerPaymentDetail"
    />
  );
};

export default PeerPaymentDetail;
