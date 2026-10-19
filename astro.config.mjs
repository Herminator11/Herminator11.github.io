// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Used for canonical, OG and sitemap. GitHub Pages user site (repo Herminator11.github.io), served from the root.
// Replace when a custom domain is added.
const site = 'https://herminator11.github.io';

export default defineConfig({
  site,
  integrations: [sitemap({ i18n: { defaultLocale: 'en', locales: { en: 'en', de: 'de', ko: 'ko' } } })],
  i18n: { defaultLocale: 'en', locales: ['en', 'de', 'ko'], routing: { prefixDefaultLocale: false } },
  build: { inlineStylesheets: 'auto' },
  vite: { plugins: [tailwindcss()], build: { assetsInlineLimit: 0 } },
});
