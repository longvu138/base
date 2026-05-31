import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '@repo/ui';
import { useOrdersMobileModel } from '@repo/features/orders';

const modules = import.meta.glob('./*.tsx');

export const OrdersPage = () => {
  const variant = useVariant('orders', 'OrdersStyleDefault');
  const page = useOrdersMobileModel();

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="OrdersStyleDefault"
      featureName="Orders"
      componentProps={{ page }}
    />
  );
};

export default OrdersPage;
