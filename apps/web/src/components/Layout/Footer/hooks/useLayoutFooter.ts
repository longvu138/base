import { useMemo } from "react";
import { useTheme } from "@repo/theme-provider";
import { useTranslation } from "@repo/i18n";
import { useCustomerArticles } from "@repo/hooks";

type Article = {
  content?: string;
  purpose?: string;
  publishDate?: string;
};

function parseStorageJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function getLatestFooterArticle(articles?: Article[] | null) {
  if (!Array.isArray(articles)) return null;

  return (
    [...articles]
      .filter((article) => article?.purpose === "FOOTER" && article?.content)
      .sort((a, b) => {
        const first = new Date(a.publishDate || 0).getTime();
        const second = new Date(b.publishDate || 0).getTime();
        return second - first;
      })[0] || null
  );
}

export function useLayoutFooter() {
  const { t } = useTranslation();
  const { tenantConfig } = useTheme();
  const { data: articles } = useCustomerArticles();

  return useMemo(() => {
    const projectInfo =
      tenantConfig || parseStorageJson<any>("currentProjectInfo") || {};
    const generalConfig = projectInfo?.tenantConfig?.generalConfig || {};
    const footerArticle = getLatestFooterArticle(
      articles || parseStorageJson<Article[]>("articleList")
    );
    const customFooterHtml =
      generalConfig.customFooterEnabled && footerArticle?.content
        ? footerArticle.content
        : "";

    const changeToMobileVersion = () => {
      if (typeof window === "undefined") return;

      window.localStorage.setItem("currentVer", "mobile");
      const nextPath = window.location.pathname.startsWith("/m")
        ? `${window.location.pathname}${window.location.search}`
        : `/m${window.location.pathname}${window.location.search}`;
      window.location.href = `${window.location.origin}${nextPath}`;
    };

    return {
      t,
      projectName:
        projectInfo?.description || projectInfo?.name || "nhaphang.com",
      tenantName:
        projectInfo?.name ||
        projectInfo?.tenantConfig?.generalConfig?.tenantName ||
        window.localStorage.getItem("selected-tenant") ||
        "Tenant",
      companyDescription: projectInfo?.description || "",
      emailContact: generalConfig.emailContact || "",
      phoneContacts: Array.isArray(generalConfig.phoneContacts)
        ? generalConfig.phoneContacts
        : [],
      addressContact: generalConfig.addressContact || "",
      bankAccount: generalConfig.bankAccount || "",
      customFooterHtml,
      changeToMobileVersion,
    };
  }, [articles, t, tenantConfig]);
}
