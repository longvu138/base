import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { FullTenantResponse } from '@repo/tenant-config';
import { getVariantDefaults } from './variantDefaults';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
    toggleTheme: () => void;
    uiLib: 'antd' | 'mui';
    setUiLib: (lib: 'antd' | 'mui') => void;
    tenantConfig: FullTenantResponse | null;
    setTenantConfig: (config: FullTenantResponse | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<ThemeMode>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('theme-mode') as ThemeMode) || 'light';
        }
        return 'light';
    });

    const [uiLib, setUiLib] = useState<'antd' | 'mui'>('antd');
    const [tenantConfig, setTenantConfig] = useState<FullTenantResponse | null>(null);

    useEffect(() => {
        localStorage.setItem('theme-mode', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    return (
        <ThemeContext.Provider value={{
            theme, setTheme, toggleTheme,
            uiLib, setUiLib,
            tenantConfig, setTenantConfig
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

/**
 * Hook: Quyết định component nào sẽ được render cho một pageKey nhất định.
 * Luồng ưu tiên:
 * 1. Quy tắc tenant-specific ở frontend
 * 2. Quy ước đặt tên mặc định (Naming Convention)
 */
export function useVariant(pageKey: string): string {
    const { tenantConfig } = useTheme();
    const themeConfig = tenantConfig?.tenantConfig?.themeConfig;
    const variantCode = tenantConfig?.variantCode || 'gd1';
    const variantDefaults = getVariantDefaults(variantCode);

    // Direct override injected by frontend tenant UI rules.
    if (themeConfig?.variants?.[pageKey]) {
        return themeConfig.variants[pageKey];
    }

    // Variant-level defaults for UI behavior without backend mapping.
    const variantOverride = variantDefaults.componentOverrides?.[pageKey];
    if (variantOverride) {
        return variantOverride;
    }

    // Guard các trang chưa có Style2 để không bị văng UI.
    if (variantCode === 'gd2' && pageKey === 'orderDetail') {
        return 'OrderDetailStyle1';
    }

    // Naming Convention (Ví dụ: 'orders' + 'gd3' -> 'OrdersStyle3')
    const styleNumber = variantCode.replace(/\D/g, '') || '1';
    const capitalizedKey = pageKey.charAt(0).toUpperCase() + pageKey.slice(1);

    const result = `${capitalizedKey}Style${styleNumber}`;
    console.log(`[useVariant] ${pageKey} -> ${result} (code: ${variantCode})`);
    return result;
}
