import en from '../i18n/en.json';
import de from '../i18n/de.json';
import ko from '../i18n/ko.json';

export type Locale = 'en' | 'de' | 'ko';
export const locales: Locale[] = ['en', 'de', 'ko'];
/** `translationNote` exists only where the page is a courtesy translation (KO). */
export type Strings = typeof en & { translationNote?: string };
const dict: Record<Locale, Strings> = { en, de, ko };

export const getStrings = (l: Locale): Strings => dict[l];
export const pathFor = (l: Locale) => (l === 'en' ? '/' : `/${l}/`);

/** Localized field: pick locale, fall back to EN (build warns elsewhere). */
export const loc = (v: { en: string; de?: string; ko?: string }, l: Locale) => v[l] ?? v.en;
export const locList = (v: { en: string[]; de?: string[]; ko?: string[] }, l: Locale) => v[l] ?? v.en;
export const fmt = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
