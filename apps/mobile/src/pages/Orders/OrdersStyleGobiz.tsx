import type { ComponentProps } from 'react';
import { OrdersMobileView } from './OrdersShared';

type OrdersStyleGobizProps = {
  page: ComponentProps<typeof OrdersMobileView>['page'];
  isTabView?: boolean;
};

export const OrdersStyleGobiz = ({ page }: OrdersStyleGobizProps) => (
  <OrdersMobileView page={page} />
);

export default OrdersStyleGobiz;
