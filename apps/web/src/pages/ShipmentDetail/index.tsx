import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '@repo/ui';

const modules = import.meta.glob('./*.tsx');

/**
 * ShipmentDetail dispatcher.
 * Backend config decides variant:
 *   Style 1 -> ShipmentDetailStyle1
 *   Style 2 -> ShipmentDetailStyle2
 */
export const ShipmentDetail = () => {
    const variant = useVariant('shipmentDetail');
    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="ShipmentDetailStyle1"
            featureName="ShipmentDetail"
        />
    );
};
