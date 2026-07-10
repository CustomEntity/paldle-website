// Normalize datamined Characters -> villagers.json for Stardewdle "Classic" mode.
// Backend-agnostic: produces a clean array you can load into Postgres OR ship as static JSON.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(__dirname, 'raw');
const read = (f) => JSON.parse(fs.readFileSync(path.join(RAW, f), 'utf8'));

const chars = read('Characters.json');
const namesEN = read('Strings_NPCNames.json');
const namesFR = read('Strings_NPCNames.fr-FR.json');
const giftTastes = read('NPCGiftTastes.json');
const objects = read('Objects.json');
const objNamesEN = read('Strings_Objects.json');

const SEASON = ['Spring', 'Summer', 'Fall', 'Winter'];
const GENDER = { 0: 'Male', 1: 'Female', 2: 'Undefined' };
const AGE = { 0: 'Adult', 1: 'Teen', 2: 'Child' };
const MANNER = { 0: 'Neutral', 1: 'Polite', 2: 'Rude' };

// Map a villager's home *location* (from CharacterData.Home) to the intuitive
// map region players know from the wiki. HomeRegion in the data is too coarse
// (almost everyone is "Town"), so we derive a finer neighborhood here.
const LOCATION_REGION = {
  SeedShop: 'Town', JoshHouse: 'Town', HaleyHouse: 'Town', SamHouse: 'Town',
  HarveyRoom: 'Town', Saloon: 'Town', Blacksmith: 'Town', ManorHouse: 'Town',
  Trailer: 'Town',
  ScienceHouse: 'Mountain', SebastianRoom: 'Mountain', Tent: 'Mountain', Mine: 'Mountain',
  AnimalShop: 'Forest', LeahHouse: 'Forest', WizardHouse: 'Forest',
  ElliottHouse: 'Beach', FishShop: 'Beach',
  SandyHouse: 'Desert',
  Sewer: 'Sewers',
  LeoTreeHouse: 'Ginger Island'
};

// Resolve a "[LocalizedText Strings\Foo:Bar]" token against a strings dict.
function resolveToken(token, dict) {
  if (typeof token !== 'string') return null;
  const m = token.match(/\[LocalizedText\s+Strings\\[^:]+:([^\]]+)\]/);
  if (m) return dict[m[1]] ?? null;
  return token; // already plain
}

// Object display name by item id (handles "Pufferfish_Name" style keys).
function objName(id) {
  const o = objects[id];
  if (!o) return id;
  const dn = resolveToken(o.DisplayName, objNamesEN);
  return dn ?? o.Name ?? id;
}

// The giftable/social villager pool = characters that have individual gift tastes.
const pool = Object.keys(chars).filter(
  (k) => giftTastes[k] && !k.startsWith('Universal_')
);

function loveIdsOf(key) {
  // NPCGiftTastes format: love_dialogue/love_ids/like_dialogue/like_ids/...
  const raw = giftTastes[key];
  if (!raw) return [];
  return (raw.split('/')[1] || '').trim().split(/\s+/).filter(Boolean);
}

function lovedGifts(key) {
  return loveIdsOf(key).map(objName);
}

// SpriteIndex of the first loved gift, only if it lives on the springobjects
// sheet (Texture null) so we can position it by index. Else null (name-only).
function firstGiftSprite(key) {
  const o = objects[loveIdsOf(key)[0]];
  return o && !o.Texture && typeof o.SpriteIndex === 'number' ? o.SpriteIndex : null;
}

const villagers = pool.map((key) => {
  const c = chars[key];
  return {
    key,
    name: resolveToken(c.DisplayName, namesEN) ?? key,
    name_fr: resolveToken(c.DisplayName, namesFR) ?? key,
    gender: GENDER[c.Gender] ?? String(c.Gender),
    birthSeason: c.BirthSeason == null ? null : SEASON[c.BirthSeason],
    birthDay: c.BirthDay ?? null,
    homeRegion: c.HomeRegion ?? null,
    marriageable: !!c.CanBeRomanced,
    age: AGE[c.Age] ?? String(c.Age),
    manner: MANNER[c.Manner] ?? String(c.Manner),
    loveInterest: c.LoveInterest ?? null,
    homeLocation: c.Home?.[0]?.Location ?? null,
    region: LOCATION_REGION[c.Home?.[0]?.Location] ?? c.HomeRegion ?? null,
    lovedGifts: lovedGifts(key),
    lovedGiftSprite: firstGiftSprite(key)
  };
});

// stable sort by name
villagers.sort((a, b) => a.name.localeCompare(b.name));

fs.writeFileSync(
  path.join(__dirname, 'villagers.json'),
  JSON.stringify(villagers, null, 2)
);

// ---- console report ----
console.log(`Villager pool: ${villagers.length}\n`);
const pad = (s, n) => String(s ?? '').padEnd(n);
console.log(
  pad('NAME', 12) + pad('FR', 12) + pad('GENDER', 8) + pad('BDAY', 12) +
  pad('REGION', 10) + pad('MARRY', 7) + pad('AGE', 7) + 'LOVED (first 2)'
);
console.log('-'.repeat(100));
for (const v of villagers) {
  console.log(
    pad(v.name, 12) + pad(v.name_fr, 12) + pad(v.gender, 8) +
    pad(`${v.birthSeason ?? '—'} ${v.birthDay ?? ''}`, 12) +
    pad(v.region, 12) + pad(v.marriageable ? 'yes' : 'no', 7) +
    pad(v.age, 7) + (v.lovedGifts.slice(0, 2).join(', ') || '—')
  );
}
console.log(`\nDistinct regions: ${[...new Set(villagers.map((v) => v.homeRegion))].join(', ')}`);
console.log(`Marriageable: ${villagers.filter((v) => v.marriageable).length}`);
