import { ConfigProvider, theme } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { webAntdTheme, webDarkAntdTheme } from '@repo/antd-config';
import { ThemeProvider, useTheme } from '@repo/theme-provider';
import {
  applyTenantConfig,
  updateTenantCSSVariables,
  type FullTenantResponse,
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

async function fetchTenantConfigFromAPI(tenantKey: string): Promise<FullTenantResponse> {
  const response = await fetch(`http://localhost:3003/api/tenants/${tenantKey}/config`);
  if (!response.ok) {
    throw new Error('Failed to fetch tenant config');
  }
  return response.json();
}

function AppContent() {
  const { theme: themeMode, setUiLib, tenantConfig: globalTenantConfig, setTenantConfig: setGlobalTenantConfig } = useTheme();
  const isDark = themeMode === 'dark';

  // 1. Dùng useState để lưu tenant ID hiện tại
  const [selectedTenantId, setSelectedTenantId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selected-tenant') || 'baogam';
    }
    return 'baogam';
  });

  // 2. Khởi tạo từ cache để tránh flash default theme
  useEffect(() => {
    const cached = localStorage.getItem('full-tenant-data');
    if (cached && !globalTenantConfig) {
      setGlobalTenantConfig(JSON.parse(cached));
    }
  }, [setGlobalTenantConfig, globalTenantConfig]);

  // 3. Effect lắng nghe sự kiện thay đổi tenant
  useEffect(() => {
    const handleTenantChange = (e: any) => {
      setSelectedTenantId(e.detail);
    };

    window.addEventListener('app:tenant-changed', handleTenantChange);
    return () => window.removeEventListener('app:tenant-changed', handleTenantChange);
  }, []);

  // 4. Effect call API lấy config khi tenant ID thay đổi
  useEffect(() => {
    fetchTenantConfigFromAPI(selectedTenantId).then(data => {
      console.log('API Response for', selectedTenantId, ':', data);
      setGlobalTenantConfig(data);
      localStorage.setItem('full-tenant-data', JSON.stringify(data));
    }).catch(err => {
      console.error('Failed to fetch tenant config:', err);
    });
  }, [selectedTenantId, setGlobalTenantConfig]);

  const tenantConfig = globalTenantConfig?.tenantConfig?.themeConfig;

  // Sync uiLib khi config thay đổi
  useEffect(() => {
    if (tenantConfig?.uiLib) {
      console.log('Switching uiLib to:', tenantConfig.uiLib);
      setUiLib(tenantConfig.uiLib);
    }
  }, [tenantConfig, setUiLib]);

  // 4. CẬP NHẬT BIẾN CSS ĐỒNG BỘ
  if (typeof document !== 'undefined' && tenantConfig) {
    console.log('Updating CSS variables for:', selectedTenantId, 'Color:', tenantConfig.colorPrimary);
    updateTenantCSSVariables(tenantConfig, isDark);
  }

  // Apply tenant config vào AntD theme
  const baseTheme = isDark ? webDarkAntdTheme : webAntdTheme;
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
    </QueryClientProvider>
  );
}

export default App;
