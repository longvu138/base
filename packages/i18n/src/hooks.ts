import { useTranslation as useI18nextTranslation } from 'react-i18next';
import { supportedLanguages } from './config';

/**
 * Hook để sử dụng translation
 * Wrapper around react-i18next's useTranslation
 */
export const useTranslation = () => {
    return useI18nextTranslation();
};

const getBaseLanguageCode = (languageCode?: string) =>
    String(languageCode || 'vi').split('-')[0];

const getApiLanguageCode = (languageCode: string) => {
    const baseLanguageCode = getBaseLanguageCode(languageCode);
    if (baseLanguageCode === 'vi') return 'vi-VN';
    if (baseLanguageCode === 'en') return 'en-US';
    return languageCode;
};

const persistLanguage = (languageCode: string, dispatchChangeEvent = false) => {
    if (typeof window === 'undefined') return;

    const baseLanguageCode = getBaseLanguageCode(languageCode);
    const apiLanguageCode = getApiLanguageCode(languageCode);
    const languageConfig =
        supportedLanguages.find(lang => lang.code === baseLanguageCode) ||
        supportedLanguages[0];

    localStorage.setItem('i18nextLng', baseLanguageCode);
    localStorage.setItem('language', apiLanguageCode);
    localStorage.setItem(
        'currentLanguage',
        JSON.stringify({
            ...languageConfig,
            code: baseLanguageCode,
            languageCode: baseLanguageCode,
            acceptLanguage: apiLanguageCode,
        }),
    );

    if (dispatchChangeEvent) {
        window.dispatchEvent(
            new CustomEvent('app-language-change', {
                detail: {
                    languageCode: baseLanguageCode,
                    acceptLanguage: apiLanguageCode,
                },
            }),
        );
    }
};

/**
 * Hook để thay đổi ngôn ngữ
 */
export const useLanguage = () => {
    const { i18n } = useI18nextTranslation();

    const changeLanguage = (languageCode: string) => {
        const baseLanguageCode = getBaseLanguageCode(languageCode);
        persistLanguage(baseLanguageCode);
        return i18n.changeLanguage(baseLanguageCode).then((result) => {
            persistLanguage(baseLanguageCode, true);
            return result;
        });
    };

    const currentLanguageCode = getBaseLanguageCode(i18n.resolvedLanguage || i18n.language);
    const currentLanguage = supportedLanguages.find(
        lang => lang.code === currentLanguageCode
    ) || supportedLanguages[0];

    return {
        currentLanguage,
        changeLanguage,
        availableLanguages: supportedLanguages,
        language: i18n.language
    };
};
