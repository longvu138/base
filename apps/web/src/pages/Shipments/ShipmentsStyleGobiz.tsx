import { ShipmentsView } from "./ShipmentsStyleDefault";
import { useShipmentsPage } from "@repo/hooks";

export const ShipmentsStyleGobiz = () => {
  const logic = useShipmentsPage();
  return <ShipmentsView logic={logic} dense />;
};

export default ShipmentsStyleGobiz;
