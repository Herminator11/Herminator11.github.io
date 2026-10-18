import type { Locale } from './i18n';

const fmt = (v: string, locale: Locale) => {
  if (!/^\d{4}-\d{2}$/.test(v)) return v;
  const [y, m] = v.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, 1)));
};

/** "Mar 2024 – present" / "2020 – 2024" */
export const formatRange = (start: string, end: string, locale: Locale, presentLabel: string) =>
  `${fmt(start, locale)} – ${end === 'present' ? presentLabel : fmt(end, locale)}`;

/** Machine-readable value for <time datetime> */
export const isoDate = (v: string) => v;
