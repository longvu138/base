import type { ComponentProps } from 'react';
import { OrdersMobileView } from './OrdersShared';

type OrdersStyleDefaultProps = {
  page: ComponentProps<typeof OrdersMobileView>['page'];
};

export const OrdersStyleDefault = ({ page }: OrdersStyleDefaultProps) => (
  <OrdersMobileView page={page} />
);
