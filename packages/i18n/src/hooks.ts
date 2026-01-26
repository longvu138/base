import { useTranslation as useI18nextTranslation } from 'react-i18next';
import { supportedLanguages } from './config';

/**
 * Hook để sử dụng translation
 * Wrapper around react-i18next's useTranslation
 */
export const useTranslation = () => {
    return useI18nextTranslation();
};

/**
 * Hook để thay đổi ngôn ngữ
 */
export const useLanguage = () => {
    const { i18n } = useI18nextTranslation();

    const changeLanguage = (languageCode: string) => {
        return i18n.changeLanguage(languageCode);
    };

    const currentLanguage = supportedLanguages.find(
        lang => lang.code === i18n.language
    ) || supportedLanguages[0];

    return {
        currentLanguage,
        changeLanguage,
        availableLanguages: supportedLanguages,
        language: i18n.language
    };
};
