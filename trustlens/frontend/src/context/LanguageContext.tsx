'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, defaultLocale, dictionaries } from '../i18n/config';

export type Dictionary = typeof dictionaries.en;

export interface LanguageContextType {
  locale: Locale;
  setLocale: (newLocale: Locale) => void;
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: defaultLocale,
  setLocale: () => {},
  t: dictionaries[defaultLocale],
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('trustlens_locale') as Locale;
      if (saved && (saved === 'en' || saved === 'hi' || saved === 'bn')) {
        setLocaleState(saved);
        if (typeof document !== 'undefined') {
          document.documentElement.lang = saved;
        }
      }
    } catch {
      // LocalStorage unavailable in certain iframe/sandboxed modes
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem('trustlens_locale', newLocale);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLocale;
      }
    } catch {
      // Graceful fallback
    }
  };

  const t = dictionaries[locale] || dictionaries.en;

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  return context;
}
