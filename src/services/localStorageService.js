
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './i18n';


i18n.defaultLocale = 'en'; // Default fallback language

// Load the saved language from AsyncStorage
const loadLocale = async () => {
  try {
    const savedLocale = await AsyncStorage.getItem('appLocale');
    if (savedLocale) {
      i18n.locale = savedLocale;
    } else {
      i18n.locale = i18n.defaultLocale;
    }
  } catch (error) {
    console.error('Error loading locale:', error);
    i18n.locale = i18n.defaultLocale;
  }
};

// Save the selected language to AsyncStorage
const setLocale = async (locale) => {
  try {
    await AsyncStorage.setItem('appLocale', locale);
    i18n.locale = locale;
  } catch (error) {
    console.error('Error saving locale:', error);
  }
};

export { i18n, loadLocale, setLocale };