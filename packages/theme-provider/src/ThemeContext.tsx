import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { FullTenantResponse } from '@repo/tenant-config';

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

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    // Apply theme class on mount and theme change
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
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
 * Láy mã giao diện gốc (Ví dụ: 'gd1', 'gd3') từ cấu hình Tenant.
 * Dùng cho các logic điều hướng hoặc tính năng đặc thù theo bộ giao diện.
 */
export function useVariantCode(): string {
    const { tenantConfig } = useTheme();
    return tenantConfig?.tenantConfig?.themeConfig?.variant || 'gd1';
}

/**
 * Lấy tên Component của trang hiện tại theo quy ước (Convention).
 * Ví dụ: 'login' -> 'LoginStyle1'
 *
 * @param pageKey - tên trang (ví dụ: 'login', 'orders', 'shipments')
 * @returns Tên component tương ứng
 */
export function useVariant(pageKey: string): string {
    const { tenantConfig } = useTheme();
    const themeConfig = tenantConfig?.tenantConfig?.themeConfig;

    // 1. Ưu tiên cấu hình đè (override) cụ thể
    if (themeConfig?.variants?.[pageKey]) {
        return themeConfig.variants[pageKey];
    }

    const globalVariant = useVariantCode();

    // 2. Quy tắc suy luận cho Layout
    if (pageKey === 'layout') {
        const layoutMap: Record<string, string> = {
            'gd3': 'SpecializedLayout',
        };
        return layoutMap[globalVariant] || 'VerticalLayout';
    }

    // 3. Đặc cách cho Global/Combined variants
    if (globalVariant === 'gd3' && pageKey === 'orders') return 'OrdersCombined';

    // 4. Mặc định theo Style: gd1 -> Style1, gd2 -> Style2, gd3 -> Style3
    const styleNumber = globalVariant.replace(/\D/g, '') || '1';
    const capitalizedKey = pageKey.charAt(0).toUpperCase() + pageKey.slice(1);

    return `${capitalizedKey}Style${styleNumber}`;
}
