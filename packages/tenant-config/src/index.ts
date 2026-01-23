import type { ThemeConfig } from 'antd';

export interface SimpleTenantConfig {
    colorPrimary?: string;
    borderRadius?: number;
    colorBorder?: string;
    colorSuccess?: string;
    colorWarning?: string;
    colorError?: string;
    [key: string]: string | number | undefined;
}

export const tenantExamples: Record<string, { name: string; config: SimpleTenantConfig }> = {
    default: {
        name: 'Default (Blue)',
        config: {
            colorPrimary: '#1890ff',
            borderRadius: 8,
        },
    },
    luxury: {
        name: 'Luxury (Gold)',
        config: {
            colorPrimary: '#b8860b',
            borderRadius: 4,
            colorSuccess: '#52c41a',
        },
    },
    tech: {
        name: 'High Tech (Purple)',
        config: {
            colorPrimary: '#722ed1',
            borderRadius: 12,
            colorSuccess: '#3f6600',
        },
    },
    green: {
        name: 'Green Solutions',
        config: {
            colorPrimary: '#237804',
            borderRadius: 20,
        },
    }
};

export function getTenantExample(key: string): SimpleTenantConfig {
    const example = tenantExamples[key] || tenantExamples['default'];
    return example!.config;
}

export function getTenantOptions() {
    return Object.entries(tenantExamples).map(([key, value]) => ({
        label: value.name,
        value: key,
    }));
}

export function applyTenantConfig(
    baseTheme: ThemeConfig,
    tenantConfig?: SimpleTenantConfig
): ThemeConfig {
    if (!tenantConfig) return baseTheme;
    return {
        ...baseTheme,
        token: {
            ...baseTheme.token,
            ...tenantConfig,
        },
    };
}

export function updateTenantCSSVariables(config?: SimpleTenantConfig): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    if (!config) {
        root.style.removeProperty('--tenant-primary-color');
        root.style.removeProperty('--tenant-success-color');
        root.style.removeProperty('--tenant-warning-color');
        root.style.removeProperty('--tenant-error-color');
        root.style.removeProperty('--tenant-border-color');
        root.style.removeProperty('--tenant-radius-antd');
        return;
    }

    if (config.colorPrimary) root.style.setProperty('--tenant-primary-color', (config.colorPrimary as string).trim());
    if (config.colorSuccess) root.style.setProperty('--tenant-success-color', (config.colorSuccess as string).trim());
    if (config.colorWarning) root.style.setProperty('--tenant-warning-color', (config.colorWarning as string).trim());
    if (config.colorError) root.style.setProperty('--tenant-error-color', (config.colorError as string).trim());
    if (config.colorBorder) root.style.setProperty('--tenant-border-color', (config.colorBorder as string).trim());

    if (config.borderRadius !== undefined) {
        root.style.setProperty('--tenant-radius-antd', `${config.borderRadius}px`);
    }
}

export function getTenantConfigFromStorage(): SimpleTenantConfig | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('tenant-config');
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch {
        return null;
    }
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
