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
  // cssTarget: the CSS minifier adds vendor prefixes for these browsers (e.g. -webkit-backdrop-filter for
  // Safari < 18). Write only the unprefixed property in source: with both, it keeps just the last one.
  vite: { plugins: [tailwindcss()], build: { assetsInlineLimit: 0, cssTarget: ['chrome111', 'firefox114', 'safari16.4'] } },
});
