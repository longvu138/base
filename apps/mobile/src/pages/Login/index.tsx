import { useState } from 'react';
import { Radio } from 'antd';
import { useLanguage } from '@repo/i18n';
import { useVariant, ThemeSwitcher } from '@repo/theme-provider';
import { getTenantOptions, dispatchTenantChange } from '@repo/tenant-config';
import { DynamicVariant } from '@repo/ui';

// Stable reference
const modules = import.meta.glob('./*.tsx');

export const Login = () => {
    const { currentLanguage, changeLanguage } = useLanguage();
    const variant = useVariant('login');

    const [currentTenant, setCurrentTenant] = useState(() =>
        localStorage.getItem('selected-tenant') || 'baogam'
    );

    const handleTenantSwitch = (value: string) => {
        setCurrentTenant(value);
        dispatchTenantChange(value);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50/50 relative overflow-hidden">
            {/* Background elements for visual flair */}
            <div className="absolute -top-24 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>

            <div className="p-6 flex flex-col gap-4 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Radio.Group
                            value={currentLanguage.code}
                            onChange={(e) => changeLanguage(e.target.value)}
                            size="small"
                            buttonStyle="solid"
                        >
                            <Radio.Button value="vi">VI</Radio.Button>
                            <Radio.Button value="en">EN</Radio.Button>
                        </Radio.Group>
                        <div className="scale-90 opacity-80">
                            <ThemeSwitcher />
                        </div>
                    </div>
                    <span className="text-[10px] text-gray-400 italic">
                        Variant: <strong className="text-primary">{variant}</strong>
                    </span>
                </div>

                {/* Tenant Switcher for Testing */}
                <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded-xl backdrop-blur-sm border border-white/20 overflow-x-auto no-scrollbar">
                    <Radio.Group
                        value={currentTenant}
                        onChange={(e) => handleTenantSwitch(e.target.value)}
                        size="small"
                        buttonStyle="solid"
                        className="flex whitespace-nowrap"
                    >
                        {getTenantOptions().map(opt => (
                            <Radio.Button key={opt.value} value={opt.value} className="text-[10px]">
                                {opt.label}
                            </Radio.Button>
                        ))}
                    </Radio.Group>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center px-6 pb-12 z-10">
                <DynamicVariant
                    variantName={variant}
                    modules={modules}
                    fallbackName="LoginStyle1"
                    featureName="Login"
                />
            </div>

        </div>
    );
};

export default Login;
