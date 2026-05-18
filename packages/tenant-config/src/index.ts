import type { ThemeConfig } from 'antd';

/**
 * Cấu hình menu navigation được drive từ backend.
 * Thay vì client hardcode theo mã UI, backend khai báo luôn.
 */
export interface MenuConfig {
    /** Danh sách path cần ẩn khỏi menu (VD: ['/shipments']) */
    hiddenKeys?: string[];
    /** Override label của menu item (VD: { '/orders': 'Quản lý Tổng hợp' }) */
    labelOverrides?: Record<string, string>;
}

/**
 * Top-level tenant theme config sent from backend.
 * Extends AntD ThemeConfig and adds:
 * - *Dark variants: separate values applied when dark mode is active
 * - variants: per-page component name overrides
 */
export interface SimpleTenantConfig extends ThemeConfig {
    /** Per-page component overrides. E.g. { orders: 'OrdersStyleGobizCombined', login: 'LoginStyleGobiz' } */
    variants?: Record<string, string>;
    menu?: MenuConfig;
    // Top-level color shorthands (mapped to AntD tokens + CSS variables)
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
    variantCode: string; // Mã giao diện tenant chọn (default, thanhla, gobiz...)
    tenantConfig?: {
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
    thien_long: {
        name: 'Thiên Long Express',
    },
    tetetete: {
        name: 'Tetetete',
    },
    thanhla: {
        name: 'Thanhla Logistics',
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

    const token = { ...baseTheme.token, ...resolved };
    if (resolved.colorPrimary) {
        token.colorIcon = resolved.colorPrimary;
        token.colorLink = resolved.colorPrimary;
        token.colorLinkHover = resolved.colorPrimary;
        token.colorLinkActive = resolved.colorPrimary;
    }

    return {
        ...baseTheme,
        token: token,
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
        const hex = String(resolved.colorPrimary).trim();
        // Set legacy variables
        const cleanHex = hex.replace('#', '');
        if (cleanHex.length === 6) {
            const r = parseInt(cleanHex.substring(0, 2), 16);
            const g = parseInt(cleanHex.substring(2, 4), 16);
            const b = parseInt(cleanHex.substring(4, 6), 16);
            root.style.setProperty('--tenant-primary-rgb', `${r} ${g} ${b}`);
        }

        // Sync with shadcn/ui variables used by Tailwind (text-primary, bg-primary, etc.)
        const hsl = hexToHsl(hex);
        root.style.setProperty('--primary', hsl);
        root.style.setProperty('--ring', hsl);
    }
}

/**
 * Helper to convert HEX to HSL format used by shadcn/ui CSS variables
 * Format: "H S% L%" (e.g. "221 83% 53%")
 */
function hexToHsl(hex: string): string {
    let r = 0, g = 0, b = 0;
    const cleanHex = hex.replace('#', '');
    
    if (cleanHex.length === 3) {
        r = parseInt(cleanHex[0] + cleanHex[0], 16);
        g = parseInt(cleanHex[1] + cleanHex[1], 16);
        b = parseInt(cleanHex[2] + cleanHex[2], 16);
    } else if (cleanHex.length === 6) {
        r = parseInt(cleanHex.substring(0, 2), 16);
        g = parseInt(cleanHex.substring(2, 4), 16);
        b = parseInt(cleanHex.substring(4, 6), 16);
    }

    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}



export function dispatchTenantChange(tenantKey: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('selected-tenant', tenantKey);
    window.dispatchEvent(new CustomEvent('app:tenant-changed', { detail: tenantKey }));
}
