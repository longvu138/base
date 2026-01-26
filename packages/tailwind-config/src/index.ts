import type { Config } from 'tailwindcss';

export const baseTailwindConfig: Partial<Config> = {
    darkMode: 'class',
    important: true,
    theme: {
        extend: {
            colors: {
                primary: "var(--tenant-primary-color)",
                "primary-dark": "var(--tenant-primary-dark)",
                success: "var(--tenant-success-color)",
                warning: "var(--tenant-warning-color)",
                error: "var(--tenant-error-color)",
                border: "var(--tenant-border-color)",
                layout: "var(--tenant-bg-layout)",
                "container-bg": "var(--tenant-bg-container)",
                "text-color": "var(--tenant-text-color)",
            },
            borderRadius: {
                'antd': 'var(--tenant-radius-antd, 8px)',
            },
        },
    },
    corePlugins: {
        preflight: false,
    },
};


