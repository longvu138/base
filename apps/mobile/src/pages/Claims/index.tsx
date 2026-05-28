import { DynamicVariant } from '@repo/ui';
import { useVariant } from '@repo/theme-provider';

const modules = import.meta.glob('./*.tsx');

export const ClaimsPage = () => {
    const variant = useVariant('claims', 'ClaimsStyleDefault');

    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="ClaimsStyleDefault"
            featureName="Claims"
        />
    );
};

export default ClaimsPage;
