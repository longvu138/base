import { useOrdersModel } from "@repo/features/orders";
import { OrdersDefaultView } from "./views/OrdersDefaultView";

export const OrdersStyleDefault = () => {
  const model = useOrdersModel();
  return <OrdersDefaultView model={model} />;
};
