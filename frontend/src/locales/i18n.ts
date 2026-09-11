import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en';
import th from './th';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',

    lng: 'en',

    fallbackLng: 'en',

    interpolation: {
      escapeValue: false,
    },

    resources: {
      en: {
        translation: en,
      },

      th: {
        translation: th,
      },
    },
  });

export default i18n;