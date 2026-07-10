// Seed the Crop mode: node scripts/db/seed-crops.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

function loadEnv() {
  const p = path.join(ROOT, '.env');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnv();

const crops = JSON.parse(fs.readFileSync(path.join(__dirname, '../datamine/crops.json'), 'utf8'));

function hashDate(iso) {
  let h = 2166136261;
  for (const ch of iso) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

async function main() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

    for (const c of crops) {
      const { rows } = await client.query(
        `INSERT INTO crops (key, growth, price, regrow, type, seasons, sprite, sheet, released)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true)
         ON CONFLICT (key) DO UPDATE SET
            growth=EXCLUDED.growth, price=EXCLUDED.price, regrow=EXCLUDED.regrow,
            type=EXCLUDED.type, seasons=EXCLUDED.seasons, sprite=EXCLUDED.sprite, sheet=EXCLUDED.sheet
         RETURNING id`,
        [c.key, c.growth, c.price, c.regrow, c.type, c.seasons, c.sprite, c.sheet]
      );
      const id = rows[0].id;
      for (const [lang, name] of [['en', c.name], ['fr', c.name_fr]]) {
        if (!name) continue;
        await client.query(
          `INSERT INTO crop_translations (crop_id, language, name) VALUES ($1,$2,$3)
           ON CONFLICT (crop_id, language) DO UPDATE SET name=EXCLUDED.name`,
          [id, lang, name]
        );
      }
    }
    console.log(`✓ upserted ${crops.length} crops (+ en/fr names)`);

    const { rows: ids } = await client.query('SELECT id FROM crops ORDER BY key');
    const pool = ids.map((r) => r.id);
    const today = new Date();
    let inserted = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const cropId = pool[hashDate('crop' + iso) % pool.length];
      const res = await client.query(
        `INSERT INTO daily_crop (game_id, date, crop_id) VALUES ($1,$2::date,$3)
         ON CONFLICT (date) DO NOTHING`,
        [i + 1, iso, cropId]
      );
      inserted += res.rowCount;
    }
    console.log(`✓ seeded ${inserted} new daily_crop rows`);
  } finally {
    await client.end();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
