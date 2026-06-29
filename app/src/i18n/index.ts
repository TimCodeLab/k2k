import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import km from './locales/km';

export const SUPPORTED_LANGUAGES = ['km', 'en'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANG_STORAGE_KEY = 'agrik2k_lang';

// AgriK2K is bilingual. Default language is Khmer (km) per product spec.
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    km: { translation: km },
  },
  lng: (localStorage.getItem(LANG_STORAGE_KEY) as AppLanguage) || 'km',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
