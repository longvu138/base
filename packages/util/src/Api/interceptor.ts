import { appConfig } from "@repo/config";
import { set } from "lodash";
import { LocalStoreUtil } from "../LocalStore";

const getCurrentLanguage = () => {
  const legacyLanguage = LocalStoreUtil.getJson("currentLanguage");
  const legacyLanguageCode = LocalStoreUtil.getItem("language");
  const detectedLanguage = LocalStoreUtil.getItem("i18nextLng");

  const language =
    legacyLanguageCode ||
    legacyLanguage?.languageCode ||
    legacyLanguage?.code ||
    detectedLanguage ||
    "vi-VN";

  const normalizedLanguage = String(language).trim();
  if (normalizedLanguage === "vi") return "vi-VN";
  if (normalizedLanguage === "en") return "en-US";
  return normalizedLanguage || "vi-VN";
};

export const defaultRequestInterceptors = function (options: any) {
  set(options, ["headers", "X-tenant"], appConfig.tenant);
  const language = getCurrentLanguage();
  set(options, ["headers", "Accept-Language"], language);
  set(options, ["headers", "accept-language"], language);
  return options;
};
