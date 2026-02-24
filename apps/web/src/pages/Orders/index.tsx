import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '../../components/Common/DynamicVariant';

// Move glob OUTSIDE the component so it's created once (stable reference)
// This prevents DynamicVariant from recreating React.lazy on every re-render
const modules = import.meta.glob('./*.tsx');

export const Orders = () => {
    // Lấy tên style từ cấu hình Tenant (Ví dụ: 'OrdersStyle1', 'OrdersCombined')
    const variant = useVariant('orders');

    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="OrdersStyle1"
            featureName="Orders"
        />
    );
};
