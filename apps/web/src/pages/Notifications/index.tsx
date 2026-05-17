import { useVariant } from "@repo/theme-provider";
import { DynamicVariant } from "@repo/ui";

const modules = import.meta.glob("./*.tsx");

export const Notifications = () => {
  const variant = useVariant("notifications", "NotificationsStyleDefault");

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="NotificationsStyleDefault"
      featureName="Notifications"
    />
  );
};

export default Notifications;
