import type { useOrdersModel } from "../model/useOrdersModel";

export type OrdersModel = ReturnType<typeof useOrdersModel>;

export type OrdersViewProps = {
  model: OrdersModel;
};
