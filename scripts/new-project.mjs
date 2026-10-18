// Scaffold a project: npm run new-project -- <slug> --categories apps,university [--date 2025-06]
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));
const opt = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const fail = (m) => { console.error(`new-project: ${m}`); process.exit(1); };

if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail('slug must be lowercase-kebab, e.g. my-project');
const known = yaml.parse(fs.readFileSync('src/content/categories.yaml', 'utf8')).map((c) => c.id);
const cats = (opt('categories') ?? '').split(',').filter(Boolean);
if (!cats.length) fail(`--categories required (existing: ${known.join(', ')}; add new ones to src/content/categories.yaml first)`);
const unknown = cats.filter((c) => !known.includes(c));
if (unknown.length) fail(`unknown categories: ${unknown.join(', ')} (existing: ${known.join(', ')})`);

const dir = path.join('src/content/projects', slug);
if (fs.existsSync(dir)) fail(`${dir} already exists`);
const now = new Date();
const date = opt('date') ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

fs.mkdirSync(path.join(dir, 'media'), { recursive: true });
fs.writeFileSync(path.join(dir, 'project.yaml'), `slug: ${slug}
date: "${date}"
categories: [${cats.join(', ')}]
featured: false
# cover:                       # omit for a typographic text card
#   src: ./media/cover.png
#   alt: { en: "", de: "" }
#   focal: [0.5, 0.5]
stack: []
links: {}
# gallery:
#   - type: image
#     src: ./media/01.png
#     alt: { en: "", de: "" }
#     caption: { en: "", de: "" }
placeholder: true
`);
for (const [l, role] of [['en', 'Design and development'], ['de', 'Gestaltung und Entwicklung']]) {
  fs.writeFileSync(path.join(dir, `${l}.md`), `---\ntitle: "TODO"\nsummary: "TODO, max 140 characters"\nrole: "${role}"\n# context: "University project"\n---\n\nTODO: what it is, who it is for, what problem it solves. Facts only.\n`);
}
fs.writeFileSync(path.join(dir, 'media/.gitkeep'), '');
console.log(`Created ${dir}\nNext: read the repo, capture media (npm run capture), fill project.yaml, set placeholder: false.`);
