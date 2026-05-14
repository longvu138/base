import { CreateShipmentView } from "./CreateShipmentStyle1";
import { useCreateShipmentPage } from "./hooks/useCreateShipmentPage";

export const CreateShipmentStyle3 = () => {
  const logic = useCreateShipmentPage();

  return <CreateShipmentView uiStyle="style3" logic={logic} />;
};

export default CreateShipmentStyle3;
