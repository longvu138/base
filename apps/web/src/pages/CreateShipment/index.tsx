import React from "react";
import { useVariant } from "@repo/theme-provider";
import { DynamicVariant } from "@repo/ui";

const modules = import.meta.glob("./*.tsx");

const CreateShipmentPage: React.FC<any> = (props) => {
  const variant = useVariant("createShipment");

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="CreateShipmentStyle1"
      featureName="CreateShipment"
      componentProps={props}
    />
  );
};

export const CreateShipment = CreateShipmentPage;
export default CreateShipmentPage;
