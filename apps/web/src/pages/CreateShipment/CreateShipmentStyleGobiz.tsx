import { CreateShipmentView } from "./CreateShipmentStyleDefault";
import { useCreateShipmentPage } from "./hooks/useCreateShipmentPage";

export const CreateShipmentStyleGobiz = () => {
  const logic = useCreateShipmentPage();

  return <CreateShipmentView uiStyle="style-gobiz" logic={logic} />;
};

export default CreateShipmentStyleGobiz;
