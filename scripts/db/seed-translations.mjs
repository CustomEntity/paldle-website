// Seed villager / crop / fish NAME translations for every Stardew-supported language,
// using the game's own official localized strings (Strings/NPCNames.<lang>, Strings/Objects.<lang>).
//   node scripts/db/seed-translations.mjs
// Requires DATABASE_URL in .env and the extracted raw/Strings_* dictionaries.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const RAW = path.join(ROOT, 'scripts/datamine/raw');
const DM = path.join(ROOT, 'scripts/datamine');

function loadEnv() {
  const p = path.join(ROOT, '.env');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnv();

const rd = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

// our locale code -> game string-file suffix (en/th have no localized dict -> fall back to base)
const LANGS = {
  en: '', fr: 'fr-FR', es: 'es-ES', de: 'de-DE', it: 'it-IT', pt: 'pt-BR',
  tr: 'tr-TR', ru: 'ru-RU', jp: 'ja-JP', kr: 'ko-KR', cn: 'zh-CN'
};
const strings = (base, suffix) =>
  rd(path.join(RAW, `Strings_${base}${suffix ? '.' + suffix : ''}.json`));

// preload every language dictionary once
const npc = {}, obj = {};
for (const [loc, suffix] of Object.entries(LANGS)) {
  npc[loc] = strings('NPCNames', suffix);
  obj[loc] = strings('Objects', suffix);
}

const OBJECTS = rd(path.join(RAW, 'Objects.json')); // Data/Objects -> DisplayName tokens
const tokenOf = (displayName) => {
  const m = displayName?.match(/\[LocalizedText\s+Strings\\[^:]+:([^\]]+)\]/);
  return m ? m[1] : null;
};

const villagers = rd(path.join(DM, 'villagers.json'));
const crops = rd(path.join(DM, 'crops.json'));
const fish = rd(path.join(DM, 'fish.json'));

// name resolvers per entity type -> { loc: name }
const villagerNames = (key, enName) => {
  const out = {};
  for (const loc of Object.keys(LANGS)) out[loc] = npc[loc]?.[key] || enName;
  return out;
};
const objectNames = (itemKey, enName) => {
  const token = tokenOf(OBJECTS[itemKey]?.DisplayName);
  const out = {};
  for (const loc of Object.keys(LANGS)) out[loc] = (token && obj[loc]?.[token]) || enName;
  return out;
};

async function upsert(client, table, idCol, id, names) {
  for (const [loc, name] of Object.entries(names)) {
    if (!name) continue;
    await client.query(
      `INSERT INTO ${table} (${idCol}, language, name) VALUES ($1,$2,$3)
       ON CONFLICT (${idCol}, language) DO UPDATE SET name=EXCLUDED.name`,
      [id, loc, name]
    );
  }
}

async function main() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const idBy = async (table) => {
      const { rows } = await client.query(`SELECT id, key FROM ${table}`);
      return new Map(rows.map((r) => [r.key, r.id]));
    };
    const [vId, cId, fId] = [await idBy('villagers'), await idBy('crops'), await idBy('fish')];

    let v = 0;
    for (const x of villagers) {
      const id = vId.get(x.key); if (!id) continue;
      await upsert(client, 'villager_translations', 'villager_id', id, villagerNames(x.key, x.name)); v++;
    }
    let c = 0;
    for (const x of crops) {
      const id = cId.get(x.key); if (!id) continue;
      await upsert(client, 'crop_translations', 'crop_id', id, objectNames(x.key, x.name)); c++;
    }
    let f = 0;
    for (const x of fish) {
      const id = fId.get(x.key); if (!id) continue;
      await upsert(client, 'fish_translations', 'fish_id', id, objectNames(x.key, x.name)); f++;
    }
    console.log(`✓ translated ${v} villagers, ${c} crops, ${f} fish into ${Object.keys(LANGS).length} languages`);
  } finally {
    await client.end();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
