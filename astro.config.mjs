// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// TODO(domain): replace once the real domain is known; used for canonical, OG and sitemap.
const site = 'https://example.com';

export default defineConfig({
  site,
  integrations: [sitemap({ i18n: { defaultLocale: 'en', locales: { en: 'en', de: 'de', ko: 'ko' } } })],
  i18n: { defaultLocale: 'en', locales: ['en', 'de', 'ko'], routing: { prefixDefaultLocale: false } },
  build: { inlineStylesheets: 'auto' },
  vite: { plugins: [tailwindcss()], build: { assetsInlineLimit: 0 } },
});
