'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { SUPPORTED_LOCALES, Locale } from '../../i18n/config';

export const LanguageSelector: React.FC = () => {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="relative inline-flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300">
      <Languages className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label="Select display language"
        className="bg-transparent border-none text-xs text-zinc-200 focus:outline-none cursor-pointer pr-1"
      >
        {SUPPORTED_LOCALES.map((l) => (
          <option key={l.code} value={l.code} className="bg-zinc-900 text-zinc-100">
            {l.nativeName} ({l.code.toUpperCase()})
          </option>
        ))}
      </select>
    </div>
  );
};

