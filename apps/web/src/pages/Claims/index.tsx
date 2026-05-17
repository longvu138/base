import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '@repo/ui';

// Stable reference — must be outside component to prevent useMemo invalidation
const modules = import.meta.glob('./*.tsx');

const ClaimsPage = () => {
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
