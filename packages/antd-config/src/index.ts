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
    components: {
        Layout: {
            colorBgHeader: '#fff',
        }
    }
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
        colorBgBase: '#0a0c10',
        colorBgContainer: '#141414',
        colorBgElevated: '#1f1f1f',
        colorBorder: '#303030',
        colorText: 'var(--tenant-primary-color)', // Change text to primary color as requested
        colorTextHeading: 'var(--tenant-primary-color)', // Also headers
        colorTextSecondary: 'rgba(255, 255, 255, 0.45)',
        borderRadius: 8,
        fontSize: 14,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    components: {
        Table: {
            headerBg: '#1a1a1a',
        },
        Input: {
            colorBgContainer: '#141414',
            colorBorder: '#303030',
        },
        Pagination: {
            itemBg: '#141414',
        },
        DatePicker: {
            colorBgContainer: '#141414',
        },
        Select: {
            colorBgContainer: '#141414',
        },
        Checkbox: {
            colorBgContainer: 'transparent',
        },
        // Button: {
        //     defaultBg: '#141414',
        //     defaultColor: 'rgba(255, 255, 255, 0.85)',
        //     defaultBorderColor: '#303030',
        // },
    }
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
