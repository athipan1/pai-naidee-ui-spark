import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// For now, we'll use a simple resource object.
// In a real app, this would likely be split into multiple files.
const resources = {
  en: {
    translation: {
      // Add any general translations here if needed
    }
  },
  th: {
    translation: {
      "Sign in with Magic Link": "เข้าสู่ระบบด้วยเมจิกลิงก์"
    }
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;