import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '@repo/ui';

// Stable reference — must be outside component to prevent useMemo invalidation
const modules = import.meta.glob('./*.tsx');

export const DeliveryRequests = () => {
    const variant = useVariant('deliveryRequests');

    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="DeliveryRequestsStyle1"
            featureName="DeliveryRequests"
        />
    );
};
