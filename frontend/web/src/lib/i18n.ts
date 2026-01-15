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

// #region agent log
fetch('http://127.0.0.1:7244/ingest/abb7578f-ab51-4215-9b1b-56b2d12e7d0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'i18n.ts:13',message:'after JSON imports',data:{hasFr:!!frTranslation,hasEn:!!enTranslation,hasEs:!!esTranslation,hasIt:!!itTranslation,hasDe:!!deTranslation,hasZhCN:!!zhCNTranslation,hasZhTW:!!zhTWTranslation},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
// #endregion

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

// #region agent log
fetch('http://127.0.0.1:7244/ingest/abb7578f-ab51-4215-9b1b-56b2d12e7d0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'i18n.ts:38',message:'before i18n.init',data:{resourcesCount:Object.keys(resources).length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
// #endregion

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
  
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/abb7578f-ab51-4215-9b1b-56b2d12e7d0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'i18n.ts:66',message:'after i18n.init',data:{language:i18n.language},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
} catch (error) {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/abb7578f-ab51-4215-9b1b-56b2d12e7d0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'i18n.ts:69',message:'error in i18n.init',data:{error:error instanceof Error?error.message:String(error),stack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  console.error('Error initializing i18n:', error);
  throw error;
}

export default i18n;

