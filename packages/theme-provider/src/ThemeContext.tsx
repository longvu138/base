import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getTenantThemeConfig, type FullTenantResponse } from '@repo/tenant-config';
import { getVariantDefaults } from './variantDefaults';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
    toggleTheme: () => void;
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
 *
 * Mục tiêu hiện tại: tenant mới không phải map thủ công từng page.
 * Nếu tenant dùng naming convention thì chỉ cần tạo file theo dạng:
 *   {PageKeyPascal}Style{VariantCodePascal}.tsx
 *
 * Ví dụ:
 *   pageKey="orders", variantCode="thanhla" -> OrdersStyleThanhla
 *   pageKey="layout", variantCode="gobiz"   -> LayoutStyleGobiz
 *
 * variantDefaults chỉ xử lý exception trước convention, ví dụ:
 *   gobiz.orders -> OrdersStyleGobizCombined
 *
 * Luồng ưu tiên:
 * 1. Tenant-specific override từ themeConfig.variants
 * 2. Variant/UI preset explicit trong variantDefaults
 * 3. Naming convention theo generalConfig.themeConfig.variantCode
 * 4. Component default của page/layout
 */
export function useVariant(pageKey: string, defaultComponentName?: string): string {
    const { tenantConfig } = useTheme();
    const themeConfig = getTenantThemeConfig(tenantConfig);
    const variantCode = themeConfig?.variantCode;
    const variantDefaults = getVariantDefaults(variantCode);
    const normalizedPageKey = normalizePageKey(pageKey);

    // Override mạnh nhất: backend có thể chỉ định component chính xác cho từng page.
    // Dùng khi cần hotfix hoặc tenant-specific mapping mà không muốn sửa default frontend.
    const tenantOverride = themeConfig?.variants?.[pageKey] || themeConfig?.variants?.[normalizedPageKey];
    if (tenantOverride) {
        return tenantOverride;
    }

    // Exception mặc định theo variantCode, khai báo ở variantDefaults.ts.
    // Không dùng block này để map toàn bộ page; page bình thường sẽ đi qua convention bên dưới.
    const variantOverride =
        variantDefaults.componentOverrides?.[pageKey] ||
        variantDefaults.componentOverrides?.[normalizedPageKey];
    if (variantOverride) {
        return variantOverride;
    }

    // Naming convention chính:
    // - Nếu dispatcher truyền fallback dạng XxxStyleDefault, ưu tiên thay suffix
    //   thành XxxStyle{Variant}; cách này tránh phải tạo file alias khi pageKey
    //   là số nhiều nhưng component thật dùng số ít.
    // - Nếu không có fallback dạng đó, dựng tên từ pageKey như trước.
    const conventionName = getConventionComponentName(normalizedPageKey, variantCode, defaultComponentName);
    if (conventionName) {
        return conventionName;
    }

    // Trường hợp default variant hoặc không có variantCode: dùng fallback do dispatcher truyền vào.
    return defaultComponentName || getDefaultComponentName(normalizedPageKey);
}

function normalizePageKey(pageKey: string): string {
    return pageKey.replace(/[-_]+([a-z])/g, (_, char: string) => char.toUpperCase());
}

function getDefaultComponentName(pageKey: string): string {
    return `${pageKey.charAt(0).toUpperCase()}${pageKey.slice(1)}StyleDefault`;
}

function getConventionComponentName(pageKey: string, variantCode?: string, defaultComponentName?: string): string | null {
    const variantSuffix = toPascalCase(variantCode);
    if (!variantSuffix || variantSuffix === 'Default') {
        return null;
    }

    if (defaultComponentName?.endsWith('StyleDefault')) {
        return defaultComponentName.replace(/StyleDefault$/, `Style${variantSuffix}`);
    }

    return `${pageKey.charAt(0).toUpperCase()}${pageKey.slice(1)}Style${variantSuffix}`;
}

function toPascalCase(value?: string): string {
    if (!value) return '';
    return value
        .trim()
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}
