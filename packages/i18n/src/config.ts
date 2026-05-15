import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import viTranslation from './locales/vi/translation.json';
import enTranslation from './locales/en/translation.json';

// Các resources ngôn ngữ
export const resources = {
    vi: {
        translation: viTranslation
    },
    en: {
        translation: enTranslation
    }
};

// Danh sách ngôn ngữ hỗ trợ
export const supportedLanguages = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', nativeName: 'Tiếng Việt' },
    { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
];

// Cấu hình mặc định cho i18n
export const defaultI18nConfig = {
    resources,
    fallbackLng: 'vi',
    supportedLngs: ['vi', 'en'],
    ns: ['translation'],
    defaultNS: 'translation',
    interpolation: {
        escapeValue: false
    },
    detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng'
    },
    react: {
        useSuspense: false
    }
};

/**
 * Khởi tạo i18n cho Web (Browser)
 * Sử dụng LanguageDetector để tự động phát hiện ngôn ngữ
 */
export const initI18nForWeb = (customConfig = {}) => {
    return i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
            ...defaultI18nConfig,
            debug: false, // Set to true for debugging
            ...customConfig
        });
};

/**
 * Khởi tạo i18n cho Mobile (React Native)
 * Không sử dụng LanguageDetector vì RN không có browser APIs
 */
export const initI18nForMobile = (customConfig = {}) => {
    return i18n
        .use(initReactI18next)
        .init({
            ...defaultI18nConfig,
            debug: false,
            ...customConfig
        });
};

export default i18n;
