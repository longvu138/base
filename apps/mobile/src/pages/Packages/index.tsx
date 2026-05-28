import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '@repo/ui';
import { usePackagesMobilePage } from '@repo/hooks';

const modules = import.meta.glob('./*.tsx');

const PackagesPage = () => {
  const variant = useVariant('packages', 'PackagesStyleDefault');
  const page = usePackagesMobilePage();

  return (
    <DynamicVariant
      variantName={variant}
      modules={modules}
      fallbackName="PackagesStyleDefault"
      featureName="Packages"
      componentProps={{ page }}
    />
  );
};

export default PackagesPage;
