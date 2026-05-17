import { ShipmentsView } from "./ShipmentsStyleDefault";
import { useShipmentsPage } from "./hooks/useShipmentsPage";

export const ShipmentsStyleGobiz = () => {
  const logic = useShipmentsPage();
  return <ShipmentsView logic={logic} dense />;
};

export default ShipmentsStyleGobiz;
