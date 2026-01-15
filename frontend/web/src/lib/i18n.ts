import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import des fichiers de traduction
import frTranslation from '../locales/fr/translation.json';
import enTranslation from '../locales/en/translation.json';
import esTranslation from '../locales/es/translation.json';
import itTranslation from '../locales/it/translation.json';
import deTranslation from '../locales/de/translation.json';
import zhCNTranslation from '../locales/zh-CN/translation.json';
import zhTWTranslation from '../locales/zh-TW/translation.json';

const resources = {
  fr: {
    translation: frTranslation,
  },
  en: {
    translation: enTranslation,
  },
  es: {
    translation: esTranslation,
  },
  it: {
    translation: itTranslation,
  },
  de: {
    translation: deTranslation,
  },
  'zh-CN': {
    translation: zhCNTranslation,
  },
  'zh-TW': {
    translation: zhTWTranslation,
  },
};

try {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'fr',
      supportedLngs: ['fr', 'en', 'es', 'it', 'de', 'zh-CN', 'zh-TW'],
      defaultNS: 'translation',
      ns: ['translation'],
      
      // Options de détection
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },

      // Options d'interpolation
      interpolation: {
        escapeValue: false, // React échappe déjà les valeurs
      },

      // Options de réact
      react: {
        useSuspense: false,
      },
    });
} catch (error) {
  console.error('Error initializing i18n:', error);
  throw error;
}

export default i18n;

