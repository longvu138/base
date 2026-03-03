import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '../../components/Common/DynamicVariant';

// Stable reference — must be outside component to prevent useMemo invalidation
const modules = import.meta.glob('./*.tsx');

export const Waybills = () => {
    const variant = useVariant('waybills');

    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="WaybillsStyle1"
            featureName="Waybills"
        />
    );
};
