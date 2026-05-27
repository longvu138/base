import { App as AntdApp, ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import { I18nextProvider, useTranslation } from "react-i18next";
import { BrowserRouter } from "react-router-dom";
import { webAntdTheme, webDarkAntdTheme } from "@repo/antd-config";
import { appConfig } from "@repo/config";
import { i18n } from "@repo/i18n";
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

async function fetchTenantConfig(
  tenantKey: string,
): Promise<FullTenantResponse> {
  const tenantRes = await fetch(
    `${appConfig.be}/api/tenants/${tenantKey}/config`,
  );

  if (!tenantRes.ok) {
    throw new Error(`Backend error: tenant=${tenantRes.status}`);
  }

  return tenantRes.json();
}

function AppContent() {
  const { t } = useTranslation();
  const { themeConfig } = useAppTenantTheme({
    lightTheme: webAntdTheme,
    darkTheme: webDarkAntdTheme,
    fetchTenantConfig,
  });

  return (
    <ConfigProvider theme={themeConfig} locale={antdLocale}>
      <AntdApp>
        <AppQueryProvider
          systemErrorMessage={t("message.system_error_contact_technical")}
        >
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AppQueryProvider>
      </AntdApp>
    </ConfigProvider>
  );
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </I18nextProvider>
  );
}

export default App;
