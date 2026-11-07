'use client';

import { useState, useEffect } from 'react';
import { Locale, defaultLocale, dictionaries } from '../i18n/config';

export function useLanguage() {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const saved = localStorage.getItem('trustlens_locale') as Locale;
    if (saved && (saved === 'en' || saved === 'hi' || saved === 'bn')) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('trustlens_locale', newLocale);
  };

  const t = dictionaries[locale] || dictionaries.en;

  return {
    locale,
    setLocale,
    t,
  };
}

