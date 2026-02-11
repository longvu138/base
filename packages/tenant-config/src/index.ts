import type { ThemeConfig } from 'antd';

export interface SimpleTenantConfig extends ThemeConfig {
    uiLib?: 'antd' | 'mui';
    variants?: Record<string, string>;
    colorPrimary?: string;
    colorPrimaryDark?: string;
    colorBgContainer?: string;
    colorBgContainerDark?: string;
    colorBgLayout?: string;
    colorBgLayoutDark?: string;
    colorBorder?: string;
    colorBorderDark?: string;
    colorText?: string;
    colorTextDark?: string;
    colorSuccess?: string;
    colorWarning?: string;
    colorError?: string;
    borderRadius?: number;
}

export interface FullTenantResponse {
    id: string;
    name: string;
    code: string;
    tenantConfig: {
        themeConfig: SimpleTenantConfig;
        [key: string]: any;
    };
    [key: string]: any;
}

/**
 * Tenant mock data for selection (Dropdown only).
 * The actual values are fetched from the API.
 */
export const tenantExamples: Record<string, { name: string }> = {
    baogam: {
        name: 'Báo Gấm',
    },
    gobiz: {
        name: 'Gobiz Logistics',
    },
};

/**
 * Lấy config đã resolved dựa trên theme (Dark/Light)
 */
function getResolvedConfig(config: SimpleTenantConfig, isDark: boolean): SimpleTenantConfig {
    const {
        colorBgContainerDark, colorBgLayoutDark, colorBorderDark,
        colorTextDark, colorPrimaryDark,
        ...baseConfig
    } = config;

    const resolved = { ...baseConfig };

    if (isDark) {
        if (colorBgContainerDark) resolved.colorBgContainer = colorBgContainerDark;
        else delete resolved.colorBgContainer;

        if (colorBgLayoutDark) resolved.colorBgLayout = colorBgLayoutDark;
        else delete resolved.colorBgLayout;

        if (colorBorderDark) resolved.colorBorder = colorBorderDark;
        else delete resolved.colorBorder;

        if (colorTextDark) resolved.colorText = colorTextDark;
        else delete resolved.colorText;

        if (colorPrimaryDark) resolved.colorPrimary = colorPrimaryDark;
    }

    return resolved;
}

const CSS_VAR_MAP: Record<string, string> = {
    colorPrimary: '--tenant-primary-color',
    colorPrimaryDark: '--tenant-primary-dark',
    colorBgContainer: '--tenant-bg-container',
    colorBgContainerDark: '--tenant-bg-container-dark',
    colorBgLayout: '--tenant-bg-layout',
    colorBgLayoutDark: '--tenant-bg-layout-dark',
    colorBorder: '--tenant-border-color',
    colorBorderDark: '--tenant-border-color-dark',
    colorText: '--tenant-text-color',
    colorTextDark: '--tenant-text-color-dark',
    colorSuccess: '--tenant-success-color',
    colorWarning: '--tenant-warning-color',
    colorError: '--tenant-error-color',
    borderRadius: '--tenant-radius-antd',
};

export function getTenantOptions() {
    return Object.entries(tenantExamples).map(([key, value]) => ({
        label: value.name,
        value: key,
    }));
}

export function applyTenantConfig(
    baseTheme: ThemeConfig,
    tenantConfig?: SimpleTenantConfig,
    isDark?: boolean
): ThemeConfig {
    if (!tenantConfig) return baseTheme;
    const resolved = getResolvedConfig(tenantConfig, !!isDark);

    const mergedComponents = { ...baseTheme.components };
    if (resolved.components) {
        Object.entries(resolved.components).forEach(([key, value]) => {
            mergedComponents[key as keyof typeof mergedComponents] = {
                ...(mergedComponents[key as keyof typeof mergedComponents] as any),
                ...(value as any),
            };
        });
    }

    return {
        ...baseTheme,
        token: { ...baseTheme.token, ...resolved },
        components: mergedComponents,
    };
}

export function updateTenantCSSVariables(config?: SimpleTenantConfig, isDark?: boolean): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    if (!config) {
        Object.values(CSS_VAR_MAP).forEach(v => root.style.removeProperty(v));
        root.style.removeProperty('--tenant-primary-rgb');
        return;
    }

    const resolved = getResolvedConfig(config, !!isDark);

    const ACTIVE_VARS: Record<string, string> = {
        colorPrimary: '--tenant-primary-color',
        colorBgContainer: '--tenant-bg-container',
        colorBgLayout: '--tenant-bg-layout',
        colorBorder: '--tenant-border-color',
        colorText: '--tenant-text-color',
    };

    Object.entries(ACTIVE_VARS).forEach(([key, cssVar]) => {
        const value = (resolved as any)[key];
        if (value) {
            root.style.setProperty(cssVar, String(value).trim());
        } else {
            root.style.removeProperty(cssVar);
        }
    });

    const DARK_VARS: Record<string, string> = {
        colorPrimaryDark: '--tenant-primary-dark',
        colorBgContainerDark: '--tenant-bg-container-dark',
        colorBgLayoutDark: '--tenant-bg-layout-dark',
        colorBorderDark: '--tenant-border-color-dark',
        colorTextDark: '--tenant-text-color-dark',
    };

    Object.entries(DARK_VARS).forEach(([key, cssVar]) => {
        const value = (config as any)[key];
        if (value) root.style.setProperty(cssVar, String(value).trim());
        else root.style.removeProperty(cssVar);
    });

    if (config.colorSuccess) root.style.setProperty('--tenant-success-color', String(config.colorSuccess).trim());
    if (config.colorWarning) root.style.setProperty('--tenant-warning-color', String(config.colorWarning).trim());
    if (config.colorError) root.style.setProperty('--tenant-error-color', String(config.colorError).trim());
    if (config.borderRadius) root.style.setProperty('--tenant-radius-antd', `${config.borderRadius}px`);

    if (resolved.colorPrimary) {
        const hex = String(resolved.colorPrimary).trim().replace('#', '');
        if (hex.length === 6) {
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            root.style.setProperty('--tenant-primary-rgb', `${r} ${g} ${b}`);
        }
    }
}

export function getTenantConfigFromStorage(): SimpleTenantConfig | null {
    if (typeof window === 'undefined') return null;
    try {
        const stored = localStorage.getItem('tenant-config');
        return stored ? JSON.parse(stored) : null;
    } catch { return null; }
}

export function saveTenantConfigToStorage(config: SimpleTenantConfig): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('tenant-config', JSON.stringify(config));
}

export function dispatchTenantChange(tenantKey: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('selected-tenant', tenantKey);
    window.dispatchEvent(new CustomEvent('app:tenant-changed', { detail: tenantKey }));
}
