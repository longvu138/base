import type { Config } from 'tailwindcss';

export const baseTailwindConfig: Partial<Config> = {
    darkMode: 'class',
    important: true,
    theme: {
        extend: {
            colors: {
                primary: "var(--tenant-primary-color)",
                success: "var(--tenant-success-color)",
                warning: "var(--tenant-warning-color)",
                error: "var(--tenant-error-color)",
                border: 'var(--tenant-border-color, #d9d9d9)',
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

export const webTailwindConfig: Partial<Config> = {
    ...baseTailwindConfig,
};

export const mobileTailwindConfig: Partial<Config> = {
    ...baseTailwindConfig,
};
