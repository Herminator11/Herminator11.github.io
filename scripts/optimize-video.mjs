// node scripts/optimize-video.mjs <input> --slug <slug> --name <name>
// -> media/<name>.mp4 (H.264, <=1080p, no audio, faststart) + media/<name>-poster.jpg
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith('--'));
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const slug = opt('slug'), name = opt('name');
if (!input || !slug || !name) { console.error('usage: optimize-video <input> --slug <slug> --name <name>'); process.exit(1); }
const media = path.join('src/content/projects', slug, 'media');
const mp4 = path.join(media, `${name}.mp4`);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', input, '-an', '-vf', "scale='min(1920,iw)':-2", '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4]);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '1', '-i', mp4, '-frames:v', '1', '-q:v', '3', path.join(media, `${name}-poster.jpg`)]);
const mb = fs.statSync(mp4).size / 1e6;
console.log(`${mp4}: ${mb.toFixed(2)} MB${mb > 3 ? ' (over the 3 MB target: shorten, lower the resolution, or embed it)' : ''}\nposter: ${name}-poster.jpg`);
