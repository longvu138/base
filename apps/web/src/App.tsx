import { ConfigProvider, theme } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { webAntdTheme, webDarkAntdTheme } from '@repo/antd-config';
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
import './App.css';

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

// Mock API call - Replace with your actual API endpoint
async function fetchTenantConfigFromAPI(tenantKey: string): Promise<SimpleTenantConfig> {
  // TODO: Replace with your actual API call
  // const response = await fetch(`/api/tenants/${tenantKey}/config`);
  // return response.json();

  // Fake delay for demo
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getTenantExample(tenantKey));
    }, 50);
  });
}

function AppContent() {
  const { theme: themeMode } = useTheme();
  const isDark = themeMode === 'dark';

  // 1. Dùng useState để lưu tenant ID hiện tại (test/demo)
  const [selectedTenantId, setSelectedTenantId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selected-tenant') || 'default';
    }
    return 'default';
  });

  // 2. Dùng useState để lưu config được inject từ API
  const [tenantConfig, setTenantConfig] = useState<SimpleTenantConfig | null>(
    () => getTenantConfigFromStorage() // Khởi tạo từ cache nếu có
  );

  // 3. Effect lắng nghe sự kiện thay đổi tenant (để update UI ngay lập tức)
  useEffect(() => {
    const handleTenantChange = (e: any) => {
      setSelectedTenantId(e.detail);
    };

    window.addEventListener('app:tenant-changed', handleTenantChange);
    return () => window.removeEventListener('app:tenant-changed', handleTenantChange);
  }, []);

  // 4. Effect call API lấy config khi tenant ID thay đổi
  useEffect(() => {
    fetchTenantConfigFromAPI(selectedTenantId).then(config => {
      setTenantConfig(config);
      saveTenantConfigToStorage(config);
    });
  }, [selectedTenantId]);

  // 5. Effect cập nhật CSS variables cho Tailwind
  useEffect(() => {
    updateTenantCSSVariables(tenantConfig || undefined);
  }, [tenantConfig]);

  // Apply tenant config vào base theme
  const baseTheme = isDark ? webDarkAntdTheme : webAntdTheme;
  const finalTheme = applyTenantConfig(baseTheme, tenantConfig || undefined);

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
