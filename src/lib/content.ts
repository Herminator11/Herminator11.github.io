import { getCollection, getEntry, render } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { loc, locList, type Locale } from './i18n';

const videoUrls = import.meta.glob<string>('/src/content/projects/*/media/*.{mp4,webm}', {
  query: '?url',
  import: 'default',
  eager: true,
});
const fileUrls = import.meta.glob<string>('/src/content/projects/*/media/*.pdf', {
  query: '?url',
  import: 'default',
  eager: true,
});
const resolveAsset = (map: Record<string, string>, slug: string, rel: string) => {
  const key = `/src/content/projects/${slug}/media/${rel.replace(/^\.\/media\//, '')}`;
  const hit = map[key];
  if (!hit) throw new Error(`[content] ${slug}: asset not found: ${rel}`);
  return hit;
};

const warned = new Set<string>();
const warnOnce = (msg: string) => {
  if (!warned.has(msg)) {
    warned.add(msg);
    console.warn(`[content] ${msg}`);
  }
};

/** Card ratio: intrinsic ratio clamped to 4:5 .. 16:9 so wildly different covers still sit in one grid. */
const clampRatio = (w: number, h: number) => Math.min(16 / 9, Math.max(4 / 5, w / h));

export type GalleryItem =
  | { type: 'image'; src: ImageMetadata; alt: string; caption?: string }
  | { type: 'video'; src: string; poster: ImageMetadata; alt: string; caption?: string; loop: boolean }
  | { type: 'embed'; url: string; title: string; poster?: ImageMetadata };

export async function getSite(locale: Locale) {
  const s = (await getEntry('site', 'site'))!.data;
  return {
    name: s.name,
    title: loc(s.title, locale),
    email: s.email,
    phone: s.phone,
    phoneHref: s.phone ? `tel:${s.phone.replace(/[^+\d]/g, '')}` : undefined,
    location: loc(s.location, locale),
    resume: s.resume[locale] ?? s.resume.en,
    seoTitle: loc(s.seo.title, locale),
    seoDescription: loc(s.seo.description, locale),
    ogImage: s.ogImage.replace(/\.png$/, `-${locale}.png`),
    socials: s.socials,
  };
}

export async function getAbout(locale: Locale) {
  const entry = (await getEntry('about', locale)) ?? (await getEntry('about', 'en'))!;
  const { Content } = await render(entry);
  return { ...entry.data, Content };
}

export async function getOutside(locale: Locale) {
  const all = (await getCollection('outside')).map((e) => e.data);
  return all.sort((a, b) => a.order - b.order).map((o) => ({ id: o.id, label: loc(o.label, locale), text: loc(o.text, locale), project: o.project, former: o.former }));
}

export async function getCategories(locale: Locale) {
  const all = (await getCollection('categories')).map((c) => c.data);
  return all.sort((a, b) => a.order - b.order).map((c) => ({ id: c.id, label: loc(c.label, locale) }));
}

export async function getResume(locale: Locale) {
  const byStart = <T extends { start: string }>(a: T, b: T) => b.start.localeCompare(a.start);
  const experience = (await getCollection('experience')).map((e) => e.data).sort(byStart);
  const education = (await getCollection('education')).map((e) => e.data).sort(byStart);
  const activities = (await getCollection('activities')).map((e) => e.data);
  const skills = (await getCollection('skills')).map((e) => e.data).sort((a, b) => a.order - b.order);
  return {
    experience: experience.map((e) => ({
      ...e,
      role: loc(e.role, locale),
      summary: loc(e.summary, locale),
      bullets: e.bullets ? locList(e.bullets, locale) : [],
    })),
    education: education.map((e) => ({ ...e, degree: loc(e.degree, locale), summary: e.summary ? loc(e.summary, locale) : undefined })),
    activities: activities.map((a) => ({ id: a.id, title: loc(a.title, locale), org: a.org, period: loc(a.period, locale), summary: loc(a.summary, locale) })),
    skills: skills.map((s) => ({ group: loc(s.group, locale), items: s.items.map((i) => (typeof i === 'string' ? i : loc(i, locale))) })),
  };
}

export async function getProjects(locale: Locale) {
  const categoryIds = new Set((await getCollection('categories')).map((c) => c.data.id));
  const entries = await getCollection('projects');
  const out = [];
  for (const e of entries) {
    const d = e.data;
    if (d.slug !== e.id) throw new Error(`[content] projects/${e.id}: slug "${d.slug}" must equal folder name`);
    for (const c of d.categories)
      if (!categoryIds.has(c)) throw new Error(`[content] projects/${e.id}: unknown category "${c}" (add it to categories.yaml)`);

    const text =
      (await getEntry('projectText', `${e.id}/${locale}`)) ?? (await getEntry('projectText', `${e.id}/en`));
    if (!text) throw new Error(`[content] projects/${e.id}: missing en.md`);
    if (locale !== 'en' && !(await getEntry('projectText', `${e.id}/${locale}`)))
      warnOnce(`projects/${e.id}: no ${locale}.md, falling back to EN`);
    const { Content } = await render(text);

    const cover = d.cover && {
      img: d.cover.src,
      alt: loc(d.cover.alt, locale),
      focal: d.cover.focal,
      tone: d.cover.tone,
      ratio: clampRatio(d.cover.src.width, d.cover.src.height),
    };
    const gallery: GalleryItem[] = d.gallery.map((g) => {
      if (g.type === 'image')
        return { type: 'image', src: g.src, alt: loc(g.alt, locale), caption: g.caption && loc(g.caption, locale) };
      if (g.type === 'video')
        return {
          type: 'video',
          src: resolveAsset(videoUrls, e.id, g.src),
          poster: g.poster,
          alt: loc(g.alt, locale),
          caption: g.caption && loc(g.caption, locale),
          loop: g.loop,
        };
      return { type: 'embed', url: g.url, title: loc(g.title, locale), poster: g.poster };
    });
    out.push({
      slug: d.slug,
      date: d.date,
      year: d.date.slice(0, 4),
      categories: d.categories,
      featured: d.featured,
      ai: d.ai,
      note: d.note ? loc(d.note, locale) : undefined,
      title: text.data.title,
      summary: text.data.summary,
      role: text.data.role,
      context: text.data.context,
      Content,
      stack: d.stack,
      links: {
        github: d.links.github,
        demo: d.links.demo,
        pdf: d.links.pdf ? resolveAsset(fileUrls, e.id, d.links.pdf) : undefined,
        other: d.links.other.map((o) => ({ label: loc(o.label, locale), url: o.url })),
      },
      cover,
      gallery: gallery.length ? gallery : cover ? ([{ type: 'image', src: cover.img, alt: cover.alt }] as GalleryItem[]) : [],
      placeholder: d.placeholder,
    });
  }
  // featured first, then newest
  return out.sort((a, b) => Number(b.featured) - Number(a.featured) || b.date.localeCompare(a.date));
}
export type Project = Awaited<ReturnType<typeof getProjects>>[number];
