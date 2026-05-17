import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '@repo/ui';

const modules = import.meta.glob('./*.tsx');

/**
 * ShipmentDetail dispatcher.
 * Backend config decides variant:
 *   Default -> ShipmentDetailStyleDefault
 *   Thanhla -> ShipmentDetailStyleThanhla
 */
export const ShipmentDetail = () => {
    const variant = useVariant('shipmentDetail', 'ShipmentDetailStyleDefault');
    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="ShipmentDetailStyleDefault"
            featureName="ShipmentDetail"
        />
    );
};
