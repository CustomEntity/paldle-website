// Stardewdle DB setup + seed.
//   node scripts/db/seed-villagers.mjs            -> apply schema + upsert villagers/translations + seed 60 days of daily_villager
//   node scripts/db/seed-villagers.mjs --daily-only
// Requires DATABASE_URL in env (.env) and the `pg` package.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

// tiny .env loader (no dep) so the script is standalone
function loadEnv() {
  const p = path.join(ROOT, '.env');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnv();

const villagers = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../datamine/villagers.json'), 'utf8')
);
const dailyOnly = process.argv.includes('--daily-only');

// deterministic daily pick so re-running is idempotent (no Math.random)
function hashDate(iso) {
  let h = 2166136261;
  for (const ch of iso) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

async function main() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    if (!dailyOnly) {
      await client.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

      for (const v of villagers) {
        const { rows } = await client.query(
          `INSERT INTO villagers (key, gender, region, birth_season, birth_day,
              marriageable, age, love_interest, home_location, loved_gifts, loved_gift_sprite, portrait_url, released)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,true)
           ON CONFLICT (key) DO UPDATE SET
              gender=EXCLUDED.gender, region=EXCLUDED.region,
              birth_season=EXCLUDED.birth_season, birth_day=EXCLUDED.birth_day,
              marriageable=EXCLUDED.marriageable, age=EXCLUDED.age,
              love_interest=EXCLUDED.love_interest, home_location=EXCLUDED.home_location,
              loved_gifts=EXCLUDED.loved_gifts, loved_gift_sprite=EXCLUDED.loved_gift_sprite,
              portrait_url=EXCLUDED.portrait_url, updated_at=NOW()
           RETURNING id`,
          [v.key, v.gender, v.region, v.birthSeason, v.birthDay, v.marriageable,
           v.age, v.loveInterest, v.homeLocation, JSON.stringify(v.lovedGifts),
           v.lovedGiftSprite ?? null, `/portraits/${v.key}.png`]
        );
        const id = rows[0].id;
        for (const [lang, name] of [['en', v.name], ['fr', v.name_fr]]) {
          if (!name) continue;
          await client.query(
            `INSERT INTO villager_translations (villager_id, language, name)
             VALUES ($1,$2,$3)
             ON CONFLICT (villager_id, language) DO UPDATE SET name=EXCLUDED.name`,
            [id, lang, name]
          );
        }

      }
      console.log(`✓ upserted ${villagers.length} villagers (+ en/fr names)`);
    }

    // seed daily_* tables for today .. +59 days.
    // salt differs per mode so the daily answer differs across modes.
    const { rows: ids } = await client.query('SELECT id FROM villagers ORDER BY key');
    const pool = ids.map((r) => r.id);
    const today = new Date();
    const modes = [
      { table: 'daily_villager', salt: 'villager' }
    ];
    for (const { table, salt } of modes) {
      let inserted = 0;
      for (let i = 0; i < 60; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const iso = d.toISOString().slice(0, 10);
        const villagerId = pool[hashDate(salt + iso) % pool.length];
        const res = await client.query(
          `INSERT INTO ${table} (game_id, date, villager_id)
           VALUES ($1, $2::date, $3)
           ON CONFLICT (date) DO NOTHING`,
          [i + 1, iso, villagerId]
        );
        inserted += res.rowCount;
      }
      console.log(`✓ seeded ${inserted} new ${table} rows`);
    }
  } finally {
    await client.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
