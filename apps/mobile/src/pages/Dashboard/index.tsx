import { useVariant } from "@repo/theme-provider";
import { DynamicVariant } from "@repo/ui";

const modules = import.meta.glob("./*.tsx");

export const Dashboard = () => {
  const variant = useVariant("dashboard", "DashboardStyleDefault");

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="DashboardStyleDefault"
      featureName="Dashboard"
    />
  );
};

export default Dashboard;
