import en from './dictionaries/en.json';
import hi from './dictionaries/hi.json';
import bn from './dictionaries/bn.json';

export type Locale = 'en' | 'hi' | 'bn';

export const dictionaries = {
  en,
  hi,
  bn,
};

export const defaultLocale: Locale = 'en';

export const SUPPORTED_LOCALES: { code: Locale; label: string; nativeName: string }[] = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা' },
];

