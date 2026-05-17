import { ShipmentsView } from "./ShipmentsStyleDefault";
import { useShipmentsPage } from "./hooks/useShipmentsPage";

export const ShipmentsStyleThanhla = () => {
  const logic = useShipmentsPage();
  return <ShipmentsView logic={logic} dense />;
};

export default ShipmentsStyleThanhla;
