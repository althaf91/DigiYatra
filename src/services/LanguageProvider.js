import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18n } from 'i18n-js';
import en from '../../assets/locales/en.json';
import hi from '../../assets/locales/hi.json';

// Initialize i18n with translations
const i18n = new I18n({
  en: en,
  hi: hi
});
i18n.fallbacks = true;

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); // Default language
  const [loading, setLoading] = useState(true); // Track if the language is being loaded

  // Load saved language from AsyncStorage on app start
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('appLanguage');
        if (savedLanguage) {
          setLanguage(savedLanguage);
          i18n.locale = savedLanguage;
        } else {
          i18n.locale = language; // Fallback to default language
        }
      } catch (error) {
        i18n.locale = language; // Fallback to default language
        console.error('Failed to load language', error);
      } finally {
        setLoading(false); // Once language is loaded, set loading to false
      }
    };

    loadLanguage();
  }, []);

  // Update language and save it to AsyncStorage
  const switchLanguage = async (newLanguage) => {
    try {
      setLanguage(newLanguage);
      i18n.locale = newLanguage;
      await AsyncStorage.setItem('appLanguage', newLanguage);
    } catch (error) {
      console.error('Failed to switch language', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, switchLanguage, i18n, loading }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);
