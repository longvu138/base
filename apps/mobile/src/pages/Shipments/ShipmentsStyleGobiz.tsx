import { ShipmentsView } from "./ShipmentsStyleDefault";
import { useMobileShipmentsPage } from "@repo/hooks";

export const ShipmentsStyleGobiz = () => {
  const logic = useMobileShipmentsPage();
  return <ShipmentsView logic={logic} dense />;
};

export default ShipmentsStyleGobiz;
