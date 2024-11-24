import  { I18n } from 'i18n-js';

// Import translation files
import en from '../../assets/locales/en.json';
import hi from '../../assets/locales/hi.json';

const i18n = new I18n({
    en:en,
    hi:hi
});

// Set the default language
i18n.defaultLocale = 'en';
i18n.locale = 'en'

// Enable fallbacks if a key is missing in the selected language

i18n.fallbacks = true;

export default i18n;
