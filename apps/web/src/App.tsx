import { App as AntdApp, ConfigProvider, theme } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { webAntdTheme, webDarkAntdTheme } from "@repo/antd-config";
import { ThemeProvider, useTheme } from "@repo/theme-provider";
import {
  applyTenantConfig,
  updateTenantCSSVariables,
  type FullTenantResponse,
  type SimpleTenantConfig,
} from "@repo/tenant-config";
import AppRoutes from "./routes";
import { appConfig } from "@repo/config";
import { I18nextProvider } from "react-i18next";
import { i18n } from "@repo/i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

/**
 * Default config used when the tenant API is unavailable.
 * Ensures the app always renders with a sensible baseline theme.
 */
const FALLBACK_TENANT_CONFIG: FullTenantResponse = {
  id: "fallback",
  name: "Default",
  variantCode: "default",
  tenantConfig: {
    themeConfig: {} as SimpleTenantConfig,
  },
};

/**
 * Fetches tenant config + available UI variant list from the backend.
 * Returns merged result as a FullTenantResponse.
 */
async function fetchAppData(tenantKey: string): Promise<FullTenantResponse> {
  const tenantRes = await fetch(
    `${appConfig.be}/api/tenants/${tenantKey}/config`,
  );

  if (!tenantRes.ok) {
    throw new Error(`Backend error: tenant=${tenantRes.status}`);
  }

  return tenantRes.json();
}

function AppContent() {
  const {
    theme: themeMode,
    setUiLib,
    tenantConfig: globalTenantConfig,
    setTenantConfig: setGlobalTenantConfig,
  } = useTheme();
  console.log("appConfig.be", appConfig.be);

  const isDark = themeMode === "dark";

  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    () =>
      (typeof window !== "undefined" &&
        localStorage.getItem("selected-tenant")) ||
      "baogam",
  );

  // Listen for tenant changes dispatched by the tenant selector UI
  useEffect(() => {
    const handleTenantChange = (e: Event) =>
      setSelectedTenantId((e as CustomEvent).detail);
    window.addEventListener("app:tenant-changed", handleTenantChange);
    return () =>
      window.removeEventListener("app:tenant-changed", handleTenantChange);
  }, []);

  // Fetch tenant config whenever the selected tenant changes
  useEffect(() => {
    fetchAppData(selectedTenantId)
      .then((data) => {
        setGlobalTenantConfig(data);
        localStorage.setItem("full-tenant-data", JSON.stringify(data));
        localStorage.setItem("currentProjectInfo", JSON.stringify(data));

        const uiLib = data.tenantConfig?.themeConfig?.uiLib;
        if (uiLib) setUiLib(uiLib);
      })
      .catch((err) => {
        // API failed — apply fallback so the app still renders correctly
        console.warn(
          "[Tenant] Failed to load config, using fallback:",
          err.message,
        );

        // Try to restore last known-good config from localStorage
        const cached = localStorage.getItem("full-tenant-data");
        if (cached) {
          try {
            const cachedTenantConfig = JSON.parse(cached);
            setGlobalTenantConfig(cachedTenantConfig);
            localStorage.setItem(
              "currentProjectInfo",
              JSON.stringify(cachedTenantConfig),
            );
            return;
          } catch {
            // cached data is corrupt — ignore and use hardcoded fallback
          }
        }

        setGlobalTenantConfig(FALLBACK_TENANT_CONFIG);
      });
  }, [selectedTenantId, setGlobalTenantConfig, setUiLib]);

  const themeConfig = globalTenantConfig?.tenantConfig?.themeConfig;

  // Keep CSS variables in sync with current theme mode and tenant config
  useEffect(() => {
    updateTenantCSSVariables(themeConfig, isDark);
  }, [themeConfig, isDark]);

  // Merge tenant config into the Ant Design theme
  const antdTheme = useMemo(() => {
    const base = isDark ? webDarkAntdTheme : webAntdTheme;
    return {
      ...applyTenantConfig(base, themeConfig || undefined, isDark),
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    };
  }, [themeConfig, isDark]);

  return (
    <ConfigProvider theme={antdTheme}>
      <AntdApp>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}

export default App;
