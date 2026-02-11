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
