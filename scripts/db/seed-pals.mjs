// Paldle DB setup + seed.
//   node scripts/db/seed-pals.mjs               -> schema + upsert pals/translations/media + 60 days of each daily_<mode>
//   node scripts/db/seed-pals.mjs --daily-only  -> only re-seed the daily_<mode> tables
// Requires DATABASE_URL in .env and the `pg` package.
//
// Input: scripts/datamine/pals.json (produced by scrape-wikily.mjs; a future in-house
// datamine can emit the same shape and this seed keeps working unchanged).
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

const pals = JSON.parse(fs.readFileSync(path.join(__dirname, '../datamine/pals.json'), 'utf8'));
const dailyOnly = process.argv.includes('--daily-only');

// deterministic daily pick so re-running is idempotent (no Math.random)
function hashDate(iso) {
	let h = 2166136261;
	for (const ch of iso) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
	return h >>> 0;
}

// seed N days of a daily_<mode> table from a pool, salted so modes diverge
async function seedDaily(client, table, salt, pool, days = 60) {
	if (!pool.length) { console.log(`! ${table}: empty pool, skipped`); return; }
	const today = new Date();
	let inserted = 0;
	for (let i = 0; i < days; i++) {
		const d = new Date(today);
		d.setDate(today.getDate() + i);
		const iso = d.toISOString().slice(0, 10);
		const palId = pool[hashDate(salt + iso) % pool.length];
		const res = await client.query(
			`INSERT INTO ${table} (game_id, date, pal_id) VALUES ($1, $2::date, $3)
			 ON CONFLICT (date) DO NOTHING`,
			[i + 1, iso, palId]
		);
		inserted += res.rowCount;
	}
	console.log(`✓ seeded ${inserted} new ${table} rows (pool ${pool.length})`);
}

async function main() {
	const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
	await client.connect();
	try {
		if (!dailyOnly) {
			await client.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

			for (const p of pals) {
				const workKeys = Object.keys(p.work || {});
				const { rows } = await client.query(
					`INSERT INTO pals (key, tribe, dev_name, paldeck, paldeck_num, paldeck_suffix,
						elements, rarity, size, genus, mount, nocturnal, predator, food_amount,
						work, work_keys, partner_skill, drops, is_boss, released)
					 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,true)
					 ON CONFLICT (key) DO UPDATE SET
						tribe=EXCLUDED.tribe, dev_name=EXCLUDED.dev_name, paldeck=EXCLUDED.paldeck,
						paldeck_num=EXCLUDED.paldeck_num, paldeck_suffix=EXCLUDED.paldeck_suffix,
						elements=EXCLUDED.elements, rarity=EXCLUDED.rarity, size=EXCLUDED.size,
						genus=EXCLUDED.genus, mount=EXCLUDED.mount, nocturnal=EXCLUDED.nocturnal,
						predator=EXCLUDED.predator, food_amount=EXCLUDED.food_amount,
						work=EXCLUDED.work, work_keys=EXCLUDED.work_keys,
						partner_skill=EXCLUDED.partner_skill, drops=EXCLUDED.drops,
						is_boss=EXCLUDED.is_boss, updated_at=NOW()
					 RETURNING id`,
					[p.key, p.tribe, p.dev_name, p.paldeck, p.paldeck_num, p.paldeck_suffix || '',
						p.elements || [], p.rarity, p.size, p.genus, p.mount || 'None',
						!!p.nocturnal, !!p.predator, p.food_amount,
						JSON.stringify(p.work || {}), workKeys, p.partner_skill,
						JSON.stringify(p.drops || []), !!p.is_boss]
				);
				const id = rows[0].id;

				// EN translation now; ja/ko/zh/ru names + all-locale descriptions can be added later.
				await client.query(
					`INSERT INTO pal_translations (pal_id, locale, name, description, partner_skill)
					 VALUES ($1,'en',$2,$3,$4)
					 ON CONFLICT (pal_id, locale) DO UPDATE SET
						name=EXCLUDED.name, description=EXCLUDED.description, partner_skill=EXCLUDED.partner_skill`,
					[id, p.name, p.description || null, p.partner_skill || null]
				);

				// icon media (self-hosted under static/pals/<key>.webp)
				if (p.icon) {
					await client.query(
						`INSERT INTO pal_media (pal_id, media_type, path, display_order)
						 VALUES ($1,'icon',$2,0)
						 ON CONFLICT (pal_id, media_type, path) DO NOTHING`,
						[id, `/pals/${p.key}.webp`]
					);
				}
			}
			console.log(`✓ upserted ${pals.length} pals (+ en names/descriptions + icon media)`);
		}

		// Build per-mode answer pools from the DB (source of truth after upsert).
		const { rows } = await client.query(
			`SELECT p.id, p.key,
			        (t.description IS NOT NULL AND length(trim(t.description)) > 0) AS has_desc,
			        EXISTS (SELECT 1 FROM pal_media m WHERE m.pal_id = p.id AND m.media_type='icon') AS has_icon
			 FROM pals p
			 LEFT JOIN pal_translations t ON t.pal_id = p.id AND t.locale='en'
			 WHERE p.released = true
			 ORDER BY p.key`
		);
		const classicPool = rows.map((r) => r.id);
		const descPool = rows.filter((r) => r.has_desc).map((r) => r.id);
		const silhPool = rows.filter((r) => r.has_icon).map((r) => r.id);

		await seedDaily(client, 'daily_classic', 'classic', classicPool);
		await seedDaily(client, 'daily_description', 'description', descPool);
		await seedDaily(client, 'daily_silhouette', 'silhouette', silhPool);
	} finally {
		await client.end();
	}
}

main().catch((e) => { console.error(e); process.exit(1); });
