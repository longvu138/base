import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '@repo/ui';
import { useOrdersMobilePage } from '@repo/hooks';

const modules = import.meta.glob('./*.tsx');

export const OrdersPage = () => {
  const variant = useVariant('orders', 'OrdersStyleDefault');
  const page = useOrdersMobilePage();

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
