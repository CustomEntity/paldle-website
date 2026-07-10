// Normalize datamined Crops -> crops.json for the "Crop" guessing mode.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(__dirname, 'raw');
const read = (f) => JSON.parse(fs.readFileSync(path.join(RAW, f), 'utf8'));

const crops = read('Crops.json');
const objects = read('Objects.json');
const objNamesEN = read('Strings_Objects.json');
const objNamesFR = read('Strings_Objects.fr-FR.json');

const SEASON = ['Spring', 'Summer', 'Fall', 'Winter'];
// Stardew object categories -> our Type labels
const CATEGORY = {
  '-75': 'Vegetable', '-79': 'Fruit', '-80': 'Flower', '-81': 'Forage',
  '-74': 'Seed', '-26': 'Artisan', '-17': 'Fruit', '-18': 'Forage'
};

function resolveToken(token, dict) {
  if (typeof token !== 'string') return null;
  const m = token.match(/\[LocalizedText\s+Strings\\[^:]+:([^\]]+)\]/);
  return m ? (dict[m[1]] ?? null) : token;
}
function objName(id, dict) {
  const o = objects[id];
  if (!o) return null;
  return resolveToken(o.DisplayName, dict) ?? o.Name ?? id;
}

const unmapped = new Set();
const out = [];
for (const [seedId, c] of Object.entries(crops)) {
  const hid = c.HarvestItemId;
  const o = objects[hid];
  if (!o) continue;
  const cat = String(o.Category);
  if (cat === '-16') continue; // Fiber & other raw resources aren't real crops
  const type = CATEGORY[cat] ?? 'Other';
  if (!CATEGORY[cat]) unmapped.add(`${objName(hid, objNamesEN)}:${cat}`);

  // icon can live on springobjects (Texture null) or the 1.6 Objects_2 sheet
  let sheet = null, sprite = null;
  if (typeof o.SpriteIndex === 'number') {
    if (!o.Texture) { sheet = 'springobjects'; sprite = o.SpriteIndex; }
    else if (o.Texture === 'TileSheets\\Objects_2') { sheet = 'objects_2'; sprite = o.SpriteIndex; }
  }

  out.push({
    key: String(hid),
    name: objName(hid, objNamesEN),
    name_fr: objName(hid, objNamesFR),
    growth: (c.DaysInPhase || []).reduce((a, b) => a + b, 0),
    regrow: (c.RegrowDays ?? -1) > 0,
    seasons: (c.Seasons || []).map((s) => SEASON[s]),
    price: o.Price ?? null,
    type,
    sprite,
    sheet
  });
}

out.sort((a, b) => a.name.localeCompare(b.name));
fs.writeFileSync(path.join(__dirname, 'crops.json'), JSON.stringify(out, null, 2));

console.log(`crops: ${out.length}`);
const pad = (s, n) => String(s ?? '').padEnd(n);
console.log(pad('NAME', 16) + pad('GROW', 6) + pad('PRICE', 7) + pad('REGROW', 8) + pad('TYPE', 11) + 'SEASONS');
for (const c of out) console.log(pad(c.name, 16) + pad(c.growth + 'd', 6) + pad(c.price + 'g', 7) + pad(c.regrow ? 'Yes' : 'No', 8) + pad(c.type, 11) + c.seasons.join('/'));
console.log('\nunmapped categories:', [...unmapped].join(', ') || 'none');
console.log('types:', [...new Set(out.map((c) => c.type))].join(', '));
console.log('no-sprite:', out.filter((c) => c.sprite == null).map((c) => c.name).join(', ') || 'none');
