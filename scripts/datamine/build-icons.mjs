// Convert datamined icon PNGs -> static/pals/<slug>.webp (one per pal).
//
// Reads out/icon-assets.json ({slug, base}) produced by datamine-local.mjs and the
// PNGs in out/icons_raw/ produced by `PaldleExtractor textures`. Uses ffmpeg/libwebp
// (lossless, to keep the Pixel mode crisp).
//
// Usage: node scripts/datamine/build-icons.mjs

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(__dirname, 'out', 'icons_raw');
const ICONS = JSON.parse(fs.readFileSync(path.join(__dirname, 'out', 'icon-assets.json'), 'utf8'));
const DEST = path.join(__dirname, '..', '..', 'static', 'pals');
const FFMPEG = process.env.FFMPEG || 'C:/ffmpeg/bin/ffmpeg.exe';

fs.mkdirSync(DEST, { recursive: true });

let ok = 0, missing = 0;
const missingList = [];
for (const { slug, base } of ICONS) {
	const src = path.join(RAW, `${base}.png`);
	if (!fs.existsSync(src)) { missing++; missingList.push(`${slug} (${base})`); continue; }
	const dst = path.join(DEST, `${slug}.webp`);
	execFileSync(FFMPEG, ['-y', '-hide_banner', '-loglevel', 'error', '-i', src,
		'-c:v', 'libwebp', '-lossless', '1', '-q:v', '100', dst]);
	ok++;
	if (ok % 50 === 0) process.stdout.write(`\r  ${ok}/${ICONS.length} converted`);
}
console.log(`\nConverted ${ok} icons -> ${path.relative(process.cwd(), DEST)}`);
if (missing) console.log(`  MISSING PNG for ${missing}: ${missingList.join(', ')}`);
console.log(`  total webp in static/pals now: ${fs.readdirSync(DEST).filter((f) => f.endsWith('.webp')).length}`);
