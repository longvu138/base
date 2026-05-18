import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '@repo/ui';

const modules = import.meta.glob('./*.tsx');

export const Carts = () => {
  const variant = useVariant('carts', 'CartsStyleDefault');

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="CartsStyleDefault"
      featureName="Carts"
    />
  );
};

export default Carts;
