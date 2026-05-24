import type { FC } from "react";
import { useOrdersModel } from "@repo/features/orders";
import { OrdersGobizView } from "./views/OrdersGobizView";

export const OrdersStyleGobiz: FC<{ isTabView?: boolean }> = ({
  isTabView,
}) => {
  const model = useOrdersModel();
  return <OrdersGobizView model={model} isTabView={isTabView} />;
};

export default OrdersStyleGobiz;
