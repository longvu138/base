import type { ComponentProps } from 'react';
import { OrdersMobileView } from './OrdersShared';

type OrdersStyleGobizCombinedProps = {
  page: ComponentProps<typeof OrdersMobileView>['page'];
};

export const OrdersStyleGobizCombined = ({ page }: OrdersStyleGobizCombinedProps) => (
  <OrdersMobileView page={page} />
);
