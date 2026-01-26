// Export configuration
export {
    resources,
    supportedLanguages,
    defaultI18nConfig,
    initI18nForWeb,
    initI18nForMobile
} from './config';

// Export hooks
export { useTranslation, useLanguage } from './hooks';

// Export i18n instance
export { default as i18n } from './config';

// Export translation files cho advanced usage
export { default as viTranslation } from './locales/vi/translation.json';
export { default as enTranslation } from './locales/en/translation.json';
