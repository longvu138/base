import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '@repo/ui';

// Stable reference — must be outside component to prevent useMemo invalidation
const modules = import.meta.glob('./*.tsx');

export const Login = () => {
    // Lấy tên style từ cấu hình Tenant (Ví dụ: 'LoginStyleDefault', 'LoginStyleThanhla')
    const variant = useVariant('login', 'LoginStyleDefault');

    return (
        <div>
            <DynamicVariant
                variantName={variant}
                modules={modules}
                fallbackName="LoginStyleDefault"
                featureName="Login"
            />
        </div>
    );
};
