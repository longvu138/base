import { CreateShipmentView } from "./CreateShipmentStyleDefault";
import { useCreateShipmentPage } from "@repo/hooks";

export const CreateShipmentStyleGobiz = () => {
  const logic = useCreateShipmentPage();

  return <CreateShipmentView uiStyle="style-gobiz" logic={logic} />;
};

export default CreateShipmentStyleGobiz;
