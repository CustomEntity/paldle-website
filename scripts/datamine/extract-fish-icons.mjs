// Extract each crop's 16x16 icon from its game sheet -> static/fish/<key>.png
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const GA = path.join(ROOT, 'game-assets');
const OUT = path.join(ROOT, 'static/fish');
fs.mkdirSync(OUT, { recursive: true });

const crops = JSON.parse(fs.readFileSync(path.join(__dirname, 'fish.json'), 'utf8'));

const SHEETS = {
  springobjects: { file: 'Maps/springobjects.png', cols: 24 },
  objects_2: { file: 'TileSheets/Objects_2.png', cols: 8 },
};
const cache = {};
const sheetPng = (name) => (cache[name] ??= PNG.sync.read(fs.readFileSync(path.join(GA, SHEETS[name].file))));

let ok = 0, skip = 0;
for (const c of crops) {
  if (c.sprite == null || !SHEETS[c.sheet]) { skip++; continue; }
  const src = sheetPng(c.sheet);
  const cols = SHEETS[c.sheet].cols;
  const col = c.sprite % cols;
  const row = Math.floor(c.sprite / cols);
  const dst = new PNG({ width: 16, height: 16 });
  PNG.bitblt(src, dst, col * 16, row * 16, 16, 16, 0, 0);
  fs.writeFileSync(path.join(OUT, `${c.key}.png`), PNG.sync.write(dst));
  ok++;
}
console.log(`✓ ${ok} fish icons -> static/fish/  (${skip} skipped)`);
