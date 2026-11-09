'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { SUPPORTED_LOCALES, Locale } from '../../i18n/config';

export const LanguageSelector: React.FC = () => {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="relative inline-flex items-center gap-1.5 bg-[#141E2E]/80 backdrop-blur-md border border-white/[0.08] hover:border-tl-cyan/40 rounded-full px-3 py-1 text-xs text-tl-text-secondary transition-all duration-300 shadow-inner select-none">
      <Languages className="w-3.5 h-3.5 text-tl-cyan shrink-0" />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label="Select display language"
        className="bg-transparent border-none text-xs text-tl-text-primary focus:outline-none cursor-pointer pr-1"
      >
        {SUPPORTED_LOCALES.map((l) => (
          <option key={l.code} value={l.code} className="bg-[#0E1520] text-tl-text-primary">
            {l.nativeName} ({l.code.toUpperCase()})
          </option>
        ))}
      </select>
    </div>
  );
};
