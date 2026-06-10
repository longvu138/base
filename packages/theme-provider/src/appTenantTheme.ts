import { useEffect, useMemo } from "react";
import { theme as antdTheme, type ThemeConfig } from "antd";
import {
  applyTenantConfig,
  getTenantThemeConfig,
  updateTenantCSSVariables,
  type FullTenantResponse,
  type SimpleTenantConfig,
} from "@repo/tenant-config";
import { useTheme } from "./ThemeContext";

const FULL_TENANT_DATA_KEY = "full-tenant-data";
const CURRENT_PROJECT_INFO_KEY = "currentProjectInfo";

const FALLBACK_TENANT_CONFIG: FullTenantResponse = {
  id: "fallback",
  name: "Default",
  tenantConfig: {
    generalConfig: {
      themeConfig: { variantCode: "default" } as SimpleTenantConfig,
    },
  },
};

export interface UseAppTenantThemeOptions {
  lightTheme: ThemeConfig;
  darkTheme: ThemeConfig;
  fetchTenantConfig: () => Promise<FullTenantResponse>;
}

export interface UseAppTenantThemeResult {
  isDark: boolean;
  selectedTenantId: string;
  themeConfig: ThemeConfig;
  tenantConfig: FullTenantResponse | null;
}

const parseLocalStorageJson = (key: string) => {
  const value = localStorage.getItem(key);
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const isFullProjectInfo = (projectInfo: any) =>
  Boolean(projectInfo?.tenantConfig?.generalConfig);

const persistTenantConfig = (tenantConfig: FullTenantResponse) => {
  localStorage.setItem(FULL_TENANT_DATA_KEY, JSON.stringify(tenantConfig));

  const currentProjectInfo = parseLocalStorageJson(CURRENT_PROJECT_INFO_KEY);
  if (
    isFullProjectInfo(tenantConfig) ||
    !isFullProjectInfo(currentProjectInfo)
  ) {
    localStorage.setItem(CURRENT_PROJECT_INFO_KEY, JSON.stringify(tenantConfig));
  }
};

export const useAppTenantTheme = ({
  lightTheme,
  darkTheme,
  fetchTenantConfig,
}: UseAppTenantThemeOptions): UseAppTenantThemeResult => {
  const {
    theme: themeMode,
    tenantConfig: globalTenantConfig,
    setTenantConfig: setGlobalTenantConfig,
  } = useTheme();
  const isDark = themeMode === "dark";

  const selectedTenantId =
    globalTenantConfig?.id || globalTenantConfig?.code || globalTenantConfig?.tenant || "current";

  useEffect(() => {
    fetchTenantConfig()
      .then((tenantConfig) => {
        setGlobalTenantConfig(tenantConfig);
        persistTenantConfig(tenantConfig);
      })
      .catch((error) => {
        console.warn(
          "[Tenant] Failed to load config, using fallback:",
          error?.message || error,
        );

        const cachedTenantConfig = parseLocalStorageJson(FULL_TENANT_DATA_KEY);
        if (cachedTenantConfig) {
          setGlobalTenantConfig(cachedTenantConfig);
          persistTenantConfig(cachedTenantConfig);
          return;
        }

        setGlobalTenantConfig(FALLBACK_TENANT_CONFIG);
      });
  }, [fetchTenantConfig, setGlobalTenantConfig]);

  const tenantThemeConfig = getTenantThemeConfig(globalTenantConfig);

  useEffect(() => {
    updateTenantCSSVariables(tenantThemeConfig, isDark);
  }, [tenantThemeConfig, isDark]);

  const themeConfig = useMemo<ThemeConfig>(() => {
    const baseTheme = isDark ? darkTheme : lightTheme;
    return {
      ...applyTenantConfig(baseTheme, tenantThemeConfig || undefined, isDark),
      algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    };
  }, [darkTheme, isDark, lightTheme, tenantThemeConfig]);

  return {
    isDark,
    selectedTenantId,
    themeConfig,
    tenantConfig: globalTenantConfig,
  };
};
