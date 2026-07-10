// Extract ALL Stardew Valley image assets (Texture2D XNB -> PNG), mirroring the
// Content folder structure into <root>/game-assets/. For site art-direction / HUD.
//   cd scripts/datamine && node extract-assets.mjs               # all image dirs
//   cd scripts/datamine && node extract-assets.mjs LooseSprites  # one dir
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bufferToContents } from 'xnb';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CONTENT = '/Users/morenoflavio/Library/Application Support/Steam/steamapps/common/Stardew Valley/Contents/Resources/Content';
const OUT = path.join(ROOT, 'game-assets');

// image-bearing dirs (skip Data/Strings = dictionaries, Effects = shaders, XACT = audio)
const ALL_DIRS = [
  'LooseSprites', 'TileSheets', 'Portraits', 'Characters', 'Maps',
  'Buildings', 'Animals', 'TerrainFeatures', 'Minigames'
];
const DIRS = process.argv.slice(2).length ? process.argv.slice(2) : ALL_DIRS;

const LOCALIZED = /\.[a-z]{2}-[A-Z]{2}\.xnb$/; // Cursors.fr-FR.xnb -> skip (keep base art)

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith('.xnb') && !LOCALIZED.test(e.name)) acc.push(p);
  }
  return acc;
}

const mute = () => { const o = console.log; console.log = () => {}; return () => (console.log = o); };

let ok = 0, skip = 0, fail = 0;
const perDir = {};

for (const d of DIRS) {
  const base = path.join(CONTENT, d);
  if (!fs.existsSync(base)) { console.log(`(missing ${d})`); continue; }
  const files = walk(base);
  perDir[d] = 0;
  for (const f of files) {
    const rel = path.relative(CONTENT, f).replace(/\.xnb$/, '.png');
    const dst = path.join(OUT, rel);
    const buf = fs.readFileSync(f);
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    const un = mute();
    try {
      const res = await bufferToContents(ab);
      const content = res?.content;
      if (content && typeof content.arrayBuffer === 'function') {
        const png = Buffer.from(await content.arrayBuffer());
        fs.mkdirSync(path.dirname(dst), { recursive: true });
        fs.writeFileSync(dst, png);
        ok++; perDir[d]++;
      } else { skip++; }
    } catch { fail++; }
    finally { un(); }
  }
  console.log(`  ${d}: ${perDir[d]} png`);
}

console.log(`\n=== ${ok} images -> game-assets/  (${skip} non-image skipped, ${fail} failed) ===`);
