import { DynamicVariant } from "@repo/ui";
import { useVariant } from "@repo/theme-provider";

const modules = import.meta.glob("./*.tsx");

export const ShipmentsPage = ({
  isTabView = false,
}: {
  isTabView?: boolean;
}) => {
  const variant = useVariant("shipments", "ShipmentsStyleDefault");

  const content = (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="ShipmentsStyleDefault"
      featureName="Shipments"
      componentProps={{
        isTabView,
      }}
    />
  );

  if (isTabView) {
    return content;
  }

  return (
    <div className="bg-layout min-h-screen pb-20">
      <div className="p-4">{content}</div>
    </div>
  );
};

export default ShipmentsPage;
