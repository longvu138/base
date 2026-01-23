import type { ThemeConfig } from 'antd';

/**
 * Base Ant Design theme configuration (Light Mode)
 */
export const baseAntdTheme: ThemeConfig = {
    token: {
        colorPrimary: '#1890ff',
        colorSuccess: '#52c41a',
        colorWarning: '#faad14',
        colorError: '#f5222d',
        colorInfo: '#1890ff',
        colorBgBase: '#ffffff',
        borderRadius: 8,
        colorBorder: '#d9d9d9',
        fontSize: 14,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
};

/**
 * Base Dark Mode theme configuration
 */
export const baseDarkAntdTheme: ThemeConfig = {
    token: {
        colorPrimary: '#1890ff',
        colorSuccess: '#52c41a',
        colorWarning: '#faad14',
        colorError: '#ff4d4f',
        colorInfo: '#1890ff',
        colorBgBase: '#141414',
        colorBgContainer: '#1f1f1f',
        colorBgElevated: '#262626',
        colorBorder: '#434343',
        colorText: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 8,
        fontSize: 14,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
};

export const webAntdTheme: ThemeConfig = {
    ...baseAntdTheme,
    token: {
        ...baseAntdTheme.token,
        fontSize: 14,
        borderRadius: 8,
        controlHeight: 32,
    },
};

export const webDarkAntdTheme: ThemeConfig = {
    ...baseDarkAntdTheme,
    token: {
        ...baseDarkAntdTheme.token,
        fontSize: 14,
        borderRadius: 8,
        controlHeight: 32,
    },
};

export const mobileAntdTheme: ThemeConfig = {
    ...baseAntdTheme,
    token: {
        ...baseAntdTheme.token,
        fontSize: 16,
        borderRadius: 12,
        controlHeight: 44,
        lineHeight: 1.6,
    },
};

export const mobileDarkAntdTheme: ThemeConfig = {
    ...baseDarkAntdTheme,
    token: {
        ...baseDarkAntdTheme.token,
        fontSize: 16,
        borderRadius: 12,
        controlHeight: 44,
        lineHeight: 1.6,
    },
};
