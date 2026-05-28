import type { ComponentProps } from 'react';
import { OrdersMobileView } from './OrdersShared';

type OrdersStyleThanhlaProps = {
  page: ComponentProps<typeof OrdersMobileView>['page'];
};

export const OrdersStyleThanhla = ({ page }: OrdersStyleThanhlaProps) => (
  <OrdersMobileView page={page} />
);
