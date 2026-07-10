// Decode villager portrait XNBs (LZX-compressed Texture2D) -> 64x64 mugshot PNGs.
//   cd scripts/datamine && npm install && node extract-portraits.mjs
// Reads the 34 keys from villagers.json, writes static/portraits/<key>.png.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bufferToContents } from 'xnb';
import { PNG } from 'pngjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const PORTRAITS = '/Users/morenoflavio/Library/Application Support/Steam/steamapps/common/Stardew Valley/Contents/Resources/Content/Portraits';
const OUT = path.join(ROOT, 'static/portraits');
fs.mkdirSync(OUT, { recursive: true });

const villagers = JSON.parse(fs.readFileSync(path.join(__dirname, 'villagers.json'), 'utf8'));

const MUG = 64; // vanilla portrait tile size; top-left = neutral face

// portrait files whose name differs from the character key
const FILE_OVERRIDE = { Leo: 'ParrotBoy' };

async function decode(key) {
  const file = FILE_OVERRIDE[key] ?? key;
  const xnbPath = path.join(PORTRAITS, `${file}.xnb`);
  if (!fs.existsSync(xnbPath)) return { key, ok: false, err: 'no xnb' };
  const buf = fs.readFileSync(xnbPath);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  const res = await bufferToContents(ab);          // { type:'Texture2D', content: Blob(PNG) }
  const pngBytes = Buffer.from(await res.content.arrayBuffer());
  const sheet = PNG.sync.read(pngBytes);
  const w = Math.min(MUG, sheet.width);
  const h = Math.min(MUG, sheet.height);
  const mug = new PNG({ width: w, height: h });
  PNG.bitblt(sheet, mug, 0, 0, w, h, 0, 0);        // top-left crop
  fs.writeFileSync(path.join(OUT, `${key}.png`), PNG.sync.write(mug));
  return { key, ok: true, sheet: `${sheet.width}x${sheet.height}`, mug: `${w}x${h}` };
}

const results = [];
for (const v of villagers) {
  // silence the lib's verbose console during the loop
  const orig = console.log; console.log = () => {};
  try { results.push(await decode(v.key)); }
  catch (e) { results.push({ key: v.key, ok: false, err: e.message }); }
  finally { console.log = orig; }
}

const ok = results.filter((r) => r.ok);
console.log(`\n✓ ${ok.length}/${results.length} portraits -> static/portraits/`);
for (const r of results.filter((r) => !r.ok)) console.log(`  ✗ ${r.key}: ${r.err}`);
console.log(`sheet sizes seen: ${[...new Set(ok.map((r) => r.sheet))].join(', ')}`);
