import { ShipmentsView } from "./ShipmentsStyle1";
import { useShipmentsPage } from "./hooks/useShipmentsPage";

export const ShipmentsStyle2 = () => {
  const logic = useShipmentsPage();
  return <ShipmentsView logic={logic} dense />;
};

export default ShipmentsStyle2;
