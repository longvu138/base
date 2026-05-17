import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '@repo/ui';

const modules = import.meta.glob('./*.tsx');

/**
 * OrderDetail dispatcher — dùng đúng pattern như các trang khác.
 * Variant được resolve bởi useVariant:
 *   - Ưu tiên tenant override
 *   - Sau đó theo naming convention (StyleDefault/StyleThanhla/StyleGobiz)
 *   - Riêng thanhla hiện fallback về StyleDefault để tránh thiếu component
 */
export const OrderDetail = () => {
    const variant = useVariant('orderDetail', 'OrderDetailStyleDefault');
    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="OrderDetailStyleDefault"
            featureName="OrderDetail"
        />
    );
};
