// Lists content still flagged `placeholder: true`. Informational; exit 0. Use --strict to fail (pre-launch).
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';

const root = 'src/content';
const hits = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
for (const f of walk(root)) {
  const src = fs.readFileSync(f, 'utf8');
  if (f.endsWith('.yaml')) {
    const data = yaml.parse(src);
    const items = Array.isArray(data) ? data : [data];
    items.forEach((it) => it?.placeholder === true && hits.push(`${f}${it.id ? ` (${it.id})` : ''}`));
  } else if (f.endsWith('.md')) {
    const fm = /^---\n([\s\S]*?)\n---/.exec(src)?.[1];
    if (fm && yaml.parse(fm)?.placeholder === true) hits.push(f);
  }
}
const set = [...new Set(hits)];
console.log(set.length ? `[placeholders] ${set.length} item(s) still placeholder:\n  ${set.join('\n  ')}` : '[placeholders] none');
if (process.argv.includes('--strict') && set.length) process.exit(1);
