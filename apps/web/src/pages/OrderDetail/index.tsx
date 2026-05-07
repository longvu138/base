import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '@repo/ui';

const modules = import.meta.glob('./*.tsx');

/**
 * OrderDetail dispatcher — dùng đúng pattern như các trang khác.
 * Backend config (tenant-server) quyết định variant:
 *   gd1/gd2 → pages.orderDetail = 'OrderDetailStyle1'
 *   gd3     → pages.orderDetail = 'OrderDetailStyle3'
 */
export const OrderDetail = () => {
    const variant = useVariant('orderDetail');
    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="OrderDetailStyle1"
            featureName="OrderDetail"
        />
    );
};
