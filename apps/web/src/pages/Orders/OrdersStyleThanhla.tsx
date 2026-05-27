import { useOrdersModel } from "@repo/features/orders";
import { OrdersThanhlaView } from "./views/OrdersThanhlaView";

export const OrdersStyleThanhla = () => {
  const model = useOrdersModel();
  return <OrdersThanhlaView model={model} />;
};
