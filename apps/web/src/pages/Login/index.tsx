import { useState } from 'react';
import { Radio } from 'antd';
import { useVariant, ThemeSwitcher } from '@repo/theme-provider';
import { getTenantOptions, dispatchTenantChange } from '@repo/tenant-config';
import { DynamicVariant } from '@repo/ui';

// Stable reference — must be outside component to prevent useMemo invalidation
const modules = import.meta.glob('./*.tsx');

export const Login = () => {
    // Lấy tên style từ cấu hình Tenant (Ví dụ: 'LoginStyle1', 'LoginStyle2')
    const variant = useVariant('login');

    const [currentTenant, setCurrentTenant] = useState(() =>
        localStorage.getItem('selected-tenant') || 'baogam'
    );

    const handleTenantSwitch = (value: string) => {
        setCurrentTenant(value);
        dispatchTenantChange(value);
    };

    return (
        <div>
            {/* Thanh test tenant — có thể xóa khi deploy production */}
            <div className="flex items-center gap-4 p-3 bg-gray-100 dark:bg-gray-800 border-b">
                <span className="text-xs text-gray-500 font-medium">TEST UI:</span>
                <Radio.Group
                    value={currentTenant}
                    onChange={(e) => handleTenantSwitch(e.target.value)}
                    size="small"
                    buttonStyle="solid"
                >
                    {getTenantOptions().map(opt => (
                        <Radio.Button key={opt.value} value={opt.value}>
                            {opt.label}
                        </Radio.Button>
                    ))}
                </Radio.Group>
                <span className="text-xs text-gray-400 italic">
                    variant: <strong className="text-primary">{variant}</strong>
                </span>
                <div className="ml-auto">
                    <ThemeSwitcher />
                </div>
            </div>

            <DynamicVariant
                variantName={variant}
                modules={modules}
                fallbackName="LoginStyle1"
                featureName="Login"
            />
        </div>
    );
};
