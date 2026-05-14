import { CreateShipmentView } from "./CreateShipmentStyle1";
import { useCreateShipmentPage } from "./hooks/useCreateShipmentPage";

export const CreateShipmentStyle2 = () => {
  const logic = useCreateShipmentPage();

  return <CreateShipmentView uiStyle="style2" logic={logic} />;
};

export default CreateShipmentStyle2;
