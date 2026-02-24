import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '../../components/Common/DynamicVariant';

// Stable reference — must be outside component to prevent useMemo invalidation
const modules = import.meta.glob('./*.tsx');

const ClaimsPage = () => {
    const variant = useVariant('claims');

    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="ClaimsStyle1"
            featureName="Claims"
        />
    );
};

export default ClaimsPage;
