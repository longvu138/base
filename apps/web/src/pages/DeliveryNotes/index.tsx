import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '@repo/ui';

// Stable reference — must be outside component to prevent useMemo invalidation
const modules = import.meta.glob('./*.tsx');

export const DeliveryNotes = () => {
    const variant = useVariant('deliveryNotes');

    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="DeliveryNoteStyle1"
            featureName="DeliveryNote"
        />
    );
};
