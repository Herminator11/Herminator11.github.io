import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

/** Localized string: EN is canonical, DE/KO optional (fall back to EN with a build warning). */
const L = z.object({ en: z.string().min(1), de: z.string().optional(), ko: z.string().optional() });
const LList = z.object({ en: z.array(z.string()), de: z.array(z.string()).optional(), ko: z.array(z.string()).optional() });
const url = z.string().url();
const ym = z
  .union([z.string(), z.number()])
  .transform(String)
  .pipe(z.string().regex(/^\d{4}(-\d{2})?$/, 'use YYYY or YYYY-MM'));

const site = defineCollection({
  loader: glob({ pattern: 'site.yaml', base: './src/content' }),
  schema: z.object({
    name: z.string(),
    title: L,
    email: z.string().email(),
    phone: z.string().optional(), // international format, e.g. +49 159 0000000
    location: L,
    socials: z.array(z.object({ label: z.string(), url })),
    resume: z.object({ en: z.string(), de: z.string(), ko: z.string().optional() }), // paths under /public
    seo: z.object({ title: L, description: L }),
    ogImage: z.string(),
    placeholder: z.boolean().default(false),
  }),
});

const about = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/about' }),
  schema: z.object({
    statement: z.string(), // first sentence, full ink
    statementRest: z.string().optional(), // second sentence, muted ink
    placeholder: z.boolean().default(false),
  }),
});

const categories = defineCollection({
  loader: file('./src/content/categories.yaml'),
  schema: z.object({ id: z.string(), label: L, order: z.number().default(0) }),
});

const experience = defineCollection({
  loader: file('./src/content/resume/experience.yaml'),
  schema: z.object({
    id: z.string(),
    org: z.string(),
    role: L,
    start: ym,
    end: z.union([ym, z.literal('present')]),
    location: z.string().optional(),
    summary: L,
    bullets: LList.optional(),
    placeholder: z.boolean().default(false),
  }),
});

const education = defineCollection({
  loader: file('./src/content/resume/education.yaml'),
  schema: z.object({
    id: z.string(),
    org: z.string(),
    degree: L,
    start: ym,
    end: z.union([ym, z.literal('present')]),
    location: z.string().optional(),
    summary: L.optional(),
    placeholder: z.boolean().default(false),
  }),
});

const activities = defineCollection({
  loader: file('./src/content/resume/activities.yaml'),
  schema: z.object({
    id: z.string(),
    title: L,
    org: z.string().optional(),
    period: L, // free text, e.g. "about 1 year"
    summary: L,
    placeholder: z.boolean().default(false),
  }),
});

const legal = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/legal' }),
  schema: z.object({ title: z.string(), description: z.string() }),
});

const skills = defineCollection({
  loader: file('./src/content/resume/skills.yaml'),
  schema: z.object({
    id: z.string(),
    group: L,
    order: z.number().default(0),
    items: z.array(z.union([z.string(), L])).min(1), // plain string, or { en, de } when it needs translating
    placeholder: z.boolean().default(false),
  }),
});

/** Shared, non-text fields. Text lives in en.md / de.md next to it. */
const projects = defineCollection({
  loader: glob({
    pattern: '*/project.yaml',
    base: './src/content/projects',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: ({ image }) =>
    z.object({
      slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
      date: ym,
      categories: z.array(z.string()).min(1),
      featured: z.boolean().default(false),
      ai: z.boolean().default(false), // built with AI assistance ("vibe-coded"): shows a standard disclosure
      note: L.optional(), // extra disclosure shown in the modal, e.g. "Based on the card game ..."
      cover: z
        .object({
          src: image(),
          alt: L,
          focal: z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]).default([0.5, 0.5]),
          tone: z.string().optional(),
        })
        .optional(),
      stack: z.array(z.string()).default([]),
      links: z
        .object({
          github: url.optional(),
          demo: url.optional(),
          pdf: z.string().optional(), // path relative to the project folder, e.g. ./media/thesis.pdf
          other: z.array(z.object({ label: L, url })).default([]),
        })
        .default({ other: [] }),
      gallery: z
        .array(
          z.discriminatedUnion('type', [
            z.object({ type: z.literal('image'), src: image(), alt: L, caption: L.optional() }),
            z.object({
              type: z.literal('video'),
              src: z.string(), // ./media/x.mp4
              poster: image(),
              alt: L,
              caption: L.optional(),
              loop: z.boolean().default(false),
            }),
            z.object({ type: z.literal('embed'), url, title: L, poster: image().optional() }),
          ]),
        )
        .default([]),
      placeholder: z.boolean().default(false),
    }),
});

const projectText = defineCollection({
  loader: glob({ pattern: '*/{en,de,ko}.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().max(140),
    role: z.string(),
    context: z.string().optional(),
  }),
});

export const collections = { legal, site, about, categories, experience, education, activities, skills, projects, projectText };
