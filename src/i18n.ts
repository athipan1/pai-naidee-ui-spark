import i18next from "i18next";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18next
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: "th",
    fallbackLng: "en",
    supportedLngs: ['en', 'th'],
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    detection: {
      order: ['queryString', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['cookie', 'localStorage'],
    },
    react: {
      useSuspense: true,
    },
    debug: process.env.NODE_ENV === 'development',
});

export default i18next;
