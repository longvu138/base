import { useVariant } from "@repo/theme-provider";
import { DynamicVariant } from "@repo/ui";

const modules = import.meta.glob("./*.tsx");

const CashRequestPage = () => {
  const variant = useVariant("cashRequest", "CashRequestStyleDefault");

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="CashRequestStyleDefault"
      featureName="CashRequest"
    />
  );
};

export default CashRequestPage;
