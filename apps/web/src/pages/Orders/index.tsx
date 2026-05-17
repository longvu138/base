import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '@repo/ui';

// Move glob OUTSIDE the component so it's created once (stable reference)
// This prevents DynamicVariant from recreating React.lazy on every re-render
const modules = import.meta.glob('./*.tsx');

export const Orders = () => {
    // Lấy tên style từ cấu hình Tenant (Ví dụ: 'OrdersStyleDefault', 'OrdersStyleGobizCombined')
    const variant = useVariant('orders', 'OrdersStyleDefault');

    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="OrdersStyleDefault"
            featureName="Orders"
        />
    );
};
