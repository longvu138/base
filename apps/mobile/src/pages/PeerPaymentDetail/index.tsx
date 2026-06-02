import React from "react";
import { useVariant } from "@repo/theme-provider";
import { DynamicVariant } from "@repo/ui";

const modules = import.meta.glob("./*.tsx");

const PeerPaymentDetailPage: React.FC<any> = (props) => {
  const variant = useVariant("peerPaymentDetail", "PeerPaymentDetailStyleDefault");

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="PeerPaymentDetailStyleDefault"
      featureName="PeerPaymentDetail"
      componentProps={props}
    />
  );
};

export const PeerPaymentDetail = PeerPaymentDetailPage;
export { PeerPaymentDetailPage };
export default PeerPaymentDetailPage;
