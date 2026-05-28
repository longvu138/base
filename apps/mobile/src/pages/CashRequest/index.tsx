import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '@repo/ui';
import { useCashRequestPage } from '@repo/hooks';

const modules = import.meta.glob('./*.tsx');

const CashRequestPage = () => {
  const variant = useVariant('cashRequest', 'CashRequestStyleDefault');
  const page = useCashRequestPage({ infinite: true });

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="CashRequestStyleDefault"
      featureName="CashRequest"
      componentProps={{ page }}
    />
  );
};

export default CashRequestPage;
