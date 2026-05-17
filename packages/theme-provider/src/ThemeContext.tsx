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
 * 1. Tenant-specific override từ themeConfig.variants
 * 2. Variant/UI preset explicit trong variantDefaults
 * 3. Component default của page/layout
 */
export function useVariant(pageKey: string, defaultComponentName?: string): string {
    const { tenantConfig } = useTheme();
    const themeConfig = tenantConfig?.tenantConfig?.themeConfig;
    const variantCode = tenantConfig?.variantCode;
    const variantDefaults = getVariantDefaults(variantCode);
    const normalizedPageKey = normalizePageKey(pageKey);

    const tenantOverride = themeConfig?.variants?.[pageKey] || themeConfig?.variants?.[normalizedPageKey];
    if (tenantOverride) {
        return tenantOverride;
    }

    const variantOverride =
        variantDefaults.componentOverrides?.[pageKey] ||
        variantDefaults.componentOverrides?.[normalizedPageKey];
    if (variantOverride) {
        return variantOverride;
    }

    return defaultComponentName || getDefaultComponentName(normalizedPageKey);
}

function normalizePageKey(pageKey: string): string {
    return pageKey.replace(/[-_]+([a-z])/g, (_, char: string) => char.toUpperCase());
}

function getDefaultComponentName(pageKey: string): string {
    return `${pageKey.charAt(0).toUpperCase()}${pageKey.slice(1)}StyleDefault`;
}
