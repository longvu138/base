import { App as AntdApp, ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router-dom";
import { TenantApi } from "@repo/api";
import { mobileAntdTheme, mobileDarkAntdTheme } from "@repo/antd-config";
import { AppQueryProvider } from "@repo/react-query-provider";
import { ThemeProvider, useAppTenantTheme } from "@repo/theme-provider";
import type { FullTenantResponse } from "@repo/tenant-config";
import AppRoutes from "./routes";

const antdLocale = {
  ...viVN,
  Pagination: {
    ...viVN.Pagination,
    items_per_page: "/trang",
  },
};

async function fetchTenantConfig(): Promise<FullTenantResponse> {
  const response = await TenantApi.getCurrentTenant();
  return response.data;
}

function AppContent() {
  const { themeConfig } = useAppTenantTheme({
    lightTheme: mobileAntdTheme,
    darkTheme: mobileDarkAntdTheme,
    fetchTenantConfig,
  });

  return (
    <ConfigProvider theme={themeConfig} locale={antdLocale}>
      <AntdApp>
        <AppQueryProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
          <ReactQueryDevtools initialIsOpen={false} />
        </AppQueryProvider>
      </AntdApp>
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
