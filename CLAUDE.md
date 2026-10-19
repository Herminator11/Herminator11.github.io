# Portfolio: project guide

Single-page, bilingual (EN `/`, DE `/de/`) portfolio. Astro 7 + TypeScript (strict) + Tailwind v4, static output. Full plan: `~/.claude/plans/pasted-content-id-9cea-you-are-imperative-marshmallow.md`.

## Commands
- `npm run dev` / `npm run build` / `npx astro preview --port 4322 --ignore-lock` (Astro 7 `preview` daemonizes unless `--ignore-lock`; use `astro dev --background`, `astro dev stop` for the dev server)
- `npm run check` (astro check + contrast script), `node scripts/check-placeholders.mjs [--strict]` (runs before every build; use --strict pre-launch), `node scripts/make-assets.mjs` (favicon.ico, apple-touch, OG images per locale; re-run after name/statement changes)
- `npm run check` (astro check + types), `npm run test:e2e` (Playwright: chromium/webkit/firefox), `npm run lighthouse`
- `npm run new-project -- <slug> --categories a,b`, `npm run capture -- <url> --slug <slug>`

## Stack notes
- Astro 7: `astro preview` daemonizes; Playwright config uses `--ignore-lock`. Content config is `src/content.config.ts` (loaders: `glob`, `file`; `z` from `astro/zod`).
- Tailwind v4 is used for the `@theme static` token system only (`tokens.css`); utilities are disabled (`source(none)`) and the design is bespoke CSS on tokens. Add an explicit `@source` before using a utility.
- JS: one module (`src/scripts/main.ts` → theme, header/nav-spy, reveal, images, filter, modal+gallery, rail), ~4 KB gzip. No frameworks.
- Modal content is rendered at build into `<template id="project-<slug>">` (see `ProjectDialog.astro`) and cloned into one native `<dialog>`; routing is hash-based (`modal.ts`, history semantics documented inline).
- Motion rule is enforced by `tests/e2e/motion.spec.ts` (no layout properties in transitions/keyframes). Colour/border-colour hover transitions are allowed (paint only).
- Placeholder media was generated once; real content replaces it. Remove `placeholder: true` per entry as it becomes real.

## Design principles (do not drift)
- Editorial, "printed object": warm paper neutrals, huge serif statement, small precise sans, ONE vermilion accent used sparingly, hairline rules instead of boxes/shadows. Apple-like restraint: whitespace, hierarchy, consistent scale.
- Type: Instrument Serif (display, 400 + italic), Hanken Grotesk (text/UI), Geist Mono (labels, dates, indices; 12-13px uppercase). Fluid `clamp()` scale. Never Inter/Roboto/system-only.
- Layout: 12-col grid, max 1320px, 8pt spacing scale. Asymmetric: narrow sticky left rail (mono section index) + wide content. Signature detail: vermilion dot gliding on a hairline rail to the active section.
- Radii 2px (chips/buttons), 8px (media). No shadows on cards; only the modal gets one soft shadow.
- All tokens (color, type, space, radius, motion) live in `src/styles/tokens.css`. No magic numbers in components.
- Light + dark: follow `prefers-color-scheme`, manual 3-state toggle (system/light/dark), inline head script prevents flash.

## NO AI-SLOP rules
- No purple/blue gradient heroes, glowing blobs, neon, gradient text, glassmorphism beyond the modal backdrop blur.
- No emoji as icons, no "👋 Hi, I'm…", no three-icon feature cards, no "passionate developer crafting digital experiences" filler.
- No symmetrical-by-default stacks; every section needs a clear hierarchy.
- No rounded-everything, no drop-shadow soup.
- Placeholder copy must be specific, plain and flagged (`placeholder: true`).

## Motion
- Animate ONLY `transform` and `opacity`. Durations/easings from tokens. Respect `prefers-reduced-motion` (instant/opacity-only). No decorative animation. `will-change` only while animating.
- Modal: native `<dialog>` + View Transitions (shared cover element) with fade fallback.

## Performance / quality targets
Lighthouse mobile ≥ 95 in all four categories, CLS ≈ 0, JS ≤ ~10 KB gzip, no third-party scripts, images via `astro:assets` (AVIF/WebP, srcset, blur-up, explicit dimensions), self-hosted latin fonts with metric-matched fallbacks. Semantic HTML, one `<h1>`, skip link, focus trap + focus return in modal, AA contrast.

## Content (strict separation: adding content never touches components)
Schemas in `src/content.config.ts` (Zod); build fails on invalid content.
- `src/content/site.yaml`, `categories.yaml` (filter chips come from categories used by projects), `about/{en,de}.md`, `resume/{experience,education,skills}.yaml`
- `src/content/projects/<slug>/` = `project.yaml` (shared: slug, date, categories, featured, cover{src,alt,focal,tone}, stack, links{github,demo,pdf,other}, gallery[image|video|embed], placeholder) + `en.md` / `de.md` (title, summary ≤140, role, context?; body = description) + `media/`.
- Missing DE falls back to EN with a build warning. UI strings in `src/i18n/{en,de}.json`.
- Deep links: `/#slug`, `/de/#slug` open the project modal.

## Phase 2 workflow: add a project from a repo
1. `npm run new-project -- <slug> --categories apps,university`
2. Read the repo (README, manifests for stack, git log for dates/role, deployed URL). Write facts only; flag guesses to the user.
3. Capture screenshots/video: `npm run capture -- <url> --slug <slug> --viewport 1440x900 --name 01` → `media/` (2x DPR, ≤2400px wide). Recordings: `npm run capture -- <url> --slug <slug> --name demo --record 8`, then `node scripts/optimize-video.mjs <file>.raw.webm --slug <slug> --name demo` (H.264 MP4 ≤1080p, no audio, + poster; target ≤3 MB, else embed).
4. Never hand-optimize images; the Astro build produces AVIF/WebP/srcset/blur-up.
5. Fill `project.yaml` (cover, gallery with alt text, stack, links, date); set `placeholder: false`.
6. `npm run check`, then `npm run test:e2e -- --grep projects`; show screenshots to the user for approval.
Résumé: transcribe to `resume/*.yaml`, put PDF in `public/resume/`.

## Verification habits
Every milestone: build + check pass, Playwright screenshots at 375 / 768 / 1440 (light + dark), zero console errors, axe 0 violations. Screenshots go to `tests/screenshots/` (git-ignored).
