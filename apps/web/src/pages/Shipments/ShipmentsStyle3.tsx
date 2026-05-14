import { ShipmentsView } from "./ShipmentsStyle1";
import { useShipmentsPage } from "./hooks/useShipmentsPage";

export const ShipmentsStyle3 = () => {
  const logic = useShipmentsPage();
  return <ShipmentsView logic={logic} dense />;
};

export default ShipmentsStyle3;
