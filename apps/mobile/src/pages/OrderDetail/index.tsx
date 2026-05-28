import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '@repo/ui';

const modules = import.meta.glob('./*.tsx');

export const OrderDetail = () => {
  const variant = useVariant('orderDetail', 'OrderDetailStyleDefault');

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="OrderDetailStyleDefault"
      featureName="OrderDetail"
    />
  );
};

export default OrderDetail;
