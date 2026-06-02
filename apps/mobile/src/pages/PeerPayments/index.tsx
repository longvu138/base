import React from "react";
import { useVariant } from "@repo/theme-provider";
import { DynamicVariant } from "@repo/ui";

const modules = import.meta.glob("./*.tsx");

const PeerPaymentsPage: React.FC<any> = (props) => {
  const variant = useVariant("peerPayments", "PeerPaymentsStyleDefault");

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="PeerPaymentsStyleDefault"
      featureName="PeerPayments"
      componentProps={props}
    />
  );
};

export const PeerPayments = PeerPaymentsPage;
export { PeerPaymentsPage };
export default PeerPaymentsPage;
