import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './en';
import ne from './ne';

const LANGUAGE_KEY = '@clinicsathi_language';

export const getStoredLanguage = async (): Promise<string> => {
  try {
    const lang = await AsyncStorage.getItem(LANGUAGE_KEY);
    return lang || 'en';
  } catch {
    return 'en';
  }
};

export const setStoredLanguage = async (lang: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    await i18n.changeLanguage(lang);
  } catch (e) {
    console.error('Failed to save language:', e);
  }
};

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources: {
    en: { translation: en },
    ne: { translation: ne },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
