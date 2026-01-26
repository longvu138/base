import { ConfigProvider, theme } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { mobileAntdTheme, mobileDarkAntdTheme } from '@repo/antd-config';
import { ThemeProvider, useTheme } from '@repo/theme-provider';
import {
  applyTenantConfig,
  updateTenantCSSVariables,
  getTenantConfigFromStorage,
  saveTenantConfigToStorage,
  getTenantExample,
  type SimpleTenantConfig,
} from '@repo/tenant-config';
import AppRoutes from './routes';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Mock API call
async function fetchTenantConfigFromAPI(tenantKey: string): Promise<SimpleTenantConfig> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getTenantExample(tenantKey));
    }, 50);
  });
}

function AppContent() {
  const { theme: themeMode } = useTheme();
  const isDark = themeMode === 'dark';

  const [selectedTenantId, setSelectedTenantId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selected-tenant') || 'default';
    }
    return 'default';
  });

  const [tenantConfig, setTenantConfig] = useState<SimpleTenantConfig | null>(
    () => getTenantConfigFromStorage()
  );

  useEffect(() => {
    const handleTenantChange = (e: any) => {
      setSelectedTenantId(e.detail);
    };

    window.addEventListener('app:tenant-changed', handleTenantChange);
    return () => window.removeEventListener('app:tenant-changed', handleTenantChange);
  }, []);

  useEffect(() => {
    fetchTenantConfigFromAPI(selectedTenantId).then(config => {
      setTenantConfig(config);
      saveTenantConfigToStorage(config);
    });
  }, [selectedTenantId]);

  // Cập nhật đồng bộ biến CSS
  if (typeof document !== 'undefined') {
    updateTenantCSSVariables(tenantConfig || undefined, isDark);
  }

  const baseTheme = isDark ? mobileDarkAntdTheme : mobileAntdTheme;
  const finalTheme = applyTenantConfig(baseTheme, tenantConfig || undefined, isDark);

  return (
    <ConfigProvider
      theme={{
        ...finalTheme,
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ConfigProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
