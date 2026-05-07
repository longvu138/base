import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { FullTenantResponse } from '@repo/tenant-config';

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
 * Helper: Tìm cấu hình bộ giao diện (UI Variant) mẫu tương ứng với Tenant hiện tại.
 */
export function useActiveVariantConfig() {
    const { tenantConfig } = useTheme();
    const variantCode = tenantConfig?.variantCode || 'gd1';
    return tenantConfig?.uiVariants?.find(v => v.code === variantCode);
}

/**
 * Hook: Quyết định component nào sẽ được render cho một pageKey nhất định.
 * Luồng ưu tiên: 
 * 1. Cấu hình đè riêng của Tenant (Direct Override)
 * 2. Cấu hình trong bộ giao diện mẫu từ Backend (System Mapping)
 * 3. Quy ước đặt tên mặc định (Naming Convention)
 */
export function useVariant(pageKey: string): string {
    const { tenantConfig } = useTheme();
    const themeConfig = tenantConfig?.tenantConfig?.themeConfig;
    const activeMapping = useActiveVariantConfig();

    // 1. Direct Override từ Tenant
    if (themeConfig?.variants?.[pageKey]) {
        return themeConfig.variants[pageKey];
    }

    // 2. Tra cứu từ Mẫu Hệ thống
    if (activeMapping?.config?.pages?.[pageKey]) {
        return activeMapping.config.pages[pageKey];
    }

    // Trường hợp đặc biệt cho Layout
    if (pageKey === 'layout' && activeMapping?.config?.layout) {
        return activeMapping.config.layout;
    }

    // 3. Naming Convention (Ví dụ: 'orders' + 'gd3' -> 'OrdersStyle3')
    const variantCode = tenantConfig?.variantCode || 'gd1';
    const styleNumber = variantCode.replace(/\D/g, '') || '1';
    const capitalizedKey = pageKey.charAt(0).toUpperCase() + pageKey.slice(1);

    const result = `${capitalizedKey}Style${styleNumber}`;
    console.log(`[useVariant] ${pageKey} -> ${result} (code: ${variantCode})`);
    return result;
}
