import { ShipmentsView } from "./ShipmentsStyleDefault";
import { useMobileShipmentsPage } from "@repo/hooks";

export const ShipmentsStyleThanhla = () => {
  const logic = useMobileShipmentsPage();
  return <ShipmentsView logic={logic} dense />;
};

export default ShipmentsStyleThanhla;
