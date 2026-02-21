import type { Config } from 'tailwindcss';

export const baseTailwindConfig: Partial<Config> = {
    darkMode: 'class',
    important: true,
    theme: {
        extend: {
            colors: {
                // shadcn/ui color system (compatible with tenant theming via CSS variables)
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",

                // Legacy tenant colors for backward compatibility
                success: "var(--tenant-success-color)",
                warning: "var(--tenant-warning-color)",
                error: "var(--tenant-error-color)",
                layout: "var(--tenant-bg-layout)",
                "container-bg": "var(--tenant-bg-container)",
                "text-color": "var(--tenant-text-color)",
            },
            borderRadius: {
                'antd': 'var(--tenant-radius-antd, 8px)',
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
        },
    },
    corePlugins: {
        preflight: false,
    },
};

