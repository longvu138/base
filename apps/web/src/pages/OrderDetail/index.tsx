import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '@repo/ui';

const modules = import.meta.glob('./*.tsx');

/**
 * OrderDetail dispatcher — dùng đúng pattern như các trang khác.
 * Variant được resolve bởi useVariant:
 *   - Ưu tiên tenant override
 *   - Sau đó theo naming convention (Style1/2/3)
 *   - Riêng gd2 hiện fallback về Style1 để tránh thiếu component
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
