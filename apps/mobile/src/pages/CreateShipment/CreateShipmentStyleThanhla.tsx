import { CreateShipmentView } from "./CreateShipmentStyleDefault";
import { useCreateShipmentPage } from "@repo/hooks";

export const CreateShipmentStyleThanhla = () => {
  const logic = useCreateShipmentPage();

  return <CreateShipmentView uiStyle="style-thanhla" logic={logic} />;
};

export default CreateShipmentStyleThanhla;
