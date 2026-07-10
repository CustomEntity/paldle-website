// Placeholder data pipeline: scrape the Palworld Paldeck from wikily.gg.
//
// wikily.gg embeds each Pal's *raw datamined DataTable row* (DT_PalMonsterParameter)
// as an escaped JSON blob in the detail page's RSC stream. We extract that verbatim
// into raw-wikily/<slug>.json, then normalize into pals.json.
//
// Field names here (Tribe, BPClass, ZukanIndex, ElementType1, WorkSuitability_*, ...)
// are the game's own DataTable columns. When we datamine the game ourselves, the raw
// dump will have the *same* shape, so only the fetch step is replaced — normalize() and
// the DB seed keep working. That is the whole point of mirroring the DataTable schema.
//
// Usage:  node scripts/datamine/scrape-wikily.mjs
// Output: scripts/datamine/pals.json          (normalized roster, seed input)
//         scripts/datamine/raw-wikily/*.json  (raw DataTable rows, one per Pal)

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ORIGIN = 'https://wikily.gg';
const INDEX_URL = `${ORIGIN}/palworld/pals/`;
const RAW_DIR = path.join(__dirname, 'raw-wikily');
const OUT = path.join(__dirname, 'pals.json');
const CONCURRENCY = 3;
const THROTTLE_MS = 250; // be gentle: wikily rate-limits bursts with 429

// ---- enum normalizers (EPal*::Value -> clean community-facing label) -------------
const ELEMENT_MAP = {
	Normal: 'Neutral', Neutral: 'Neutral',
	Fire: 'Fire', Water: 'Water', Leaf: 'Grass', Grass: 'Grass',
	Electric: 'Electric', Electricity: 'Electric', Electstrong: 'Electric',
	Ice: 'Ice', Earth: 'Ground', Ground: 'Ground', Dark: 'Dark', Dragon: 'Dragon'
};
const stripEnum = (v) => (v == null ? '' : String(v).split('::').pop());
const normElement = (v) => {
	const raw = stripEnum(v);
	if (!raw || raw === 'None') return null;
	return ELEMENT_MAP[raw] || raw;
};
const WORK_KEYS = {
	WorkSuitability_EmitFlame: 'Kindling',
	WorkSuitability_Watering: 'Watering',
	WorkSuitability_Seeding: 'Planting',
	WorkSuitability_GenerateElectricity: 'Electricity',
	WorkSuitability_Handcraft: 'Handiwork',
	WorkSuitability_Collection: 'Gathering',
	WorkSuitability_Deforest: 'Lumbering',
	WorkSuitability_Mining: 'Mining',
	WorkSuitability_OilExtraction: 'OilExtraction',
	WorkSuitability_ProductMedicine: 'Medicine',
	WorkSuitability_Cool: 'Cooling',
	WorkSuitability_Transport: 'Transporting',
	WorkSuitability_MonsterFarm: 'Farming'
};

// derive a coarse mount type from the partner-skill copy (wikily/game don't expose a
// clean enum for it; the partner skill text is the community-facing source of truth)
function deriveMount(pal) {
	const t = `${pal.OverridePartnerSkillTextID || ''} ${pal.PartnerSkillDesc || ''}`.toLowerCase();
	if (/rid(den|e).*(fly|flying|aerial)|flying mount/.test(t)) return 'Flying';
	if (/rid(den|e).*(swim|water|aquatic)|swimming mount|mount.*water/.test(t)) return 'Swimming';
	if (/can be ridden|ground mount|rideable|mount/.test(t)) return 'Ground';
	return 'None';
}

// ---- extract the embedded pal object from a detail page --------------------------
// The RSC stream stores it JS-string-escaped: \"pal\":{\"OverrideNameTextID\":...}.
// Brace-match in the escaped domain (\" toggles string state, \\ is a literal), then
// JS-unescape the slice and JSON.parse it.
function extractPal(html) {
	const marker = '\\"pal\\":';
	const at = html.indexOf(marker);
	if (at < 0) return null;
	const start = html.indexOf('{', at);
	if (start < 0) return null;

	let depth = 0, inStr = false, i = start, end = -1;
	for (; i < html.length; i++) {
		const c = html[i];
		if (c === '\\') {
			if (html[i + 1] === '"') inStr = !inStr;
			i++; // skip the escaped char (\" or \\ or \n ...)
			continue;
		}
		if (!inStr) {
			if (c === '{') depth++;
			else if (c === '}') {
				depth--;
				if (depth === 0) { end = i; break; }
			}
		}
	}
	if (end < 0) return null;
	const encoded = html.slice(start, end + 1); // still JS-string-escaped
	// unescape by treating it as a JS/JSON string literal body, then parse the JSON text
	const jsonText = JSON.parse('"' + encoded.replace(/\r?\n/g, '\\n') + '"');
	return JSON.parse(jsonText);
}

// ---- normalize a raw DataTable row into our roster shape -------------------------
function normalize(pal, slug) {
	const elements = [normElement(pal.ElementType1), normElement(pal.ElementType2)].filter(Boolean);
	const work = {};
	for (const [rawKey, label] of Object.entries(WORK_KEYS)) {
		const lvl = Number(pal[rawKey] || 0);
		if (lvl > 0) work[label] = lvl;
	}
	const passives = [pal.PassiveSkill1, pal.PassiveSkill2, pal.PassiveSkill3, pal.PassiveSkill4]
		.filter((s) => s && s !== 'None');
	const drops = Array.isArray(pal.drops) ? [...new Set(pal.drops.map((d) => d.ItemId).filter(Boolean))] : [];
	const paldeckNum = Number.isFinite(pal.ZukanIndex) ? pal.ZukanIndex : null;
	const paldeck = paldeckNum != null ? `${paldeckNum}${pal.ZukanIndexSuffix || ''}` : slug;

	return {
		key: slug, // stable, url-safe, unique on wikily
		tribe: stripEnum(pal.Tribe) || null, // datamine identity (match on this later)
		dev_name: pal.BPClass || null, // datamine blueprint class
		name: pal.OverrideNameTextIDEnglish || pal.OverrideNameTextID || slug,
		paldeck, // e.g. "100" or "100B"
		paldeck_num: paldeckNum,
		paldeck_suffix: pal.ZukanIndexSuffix || '',
		elements,
		rarity: Number.isFinite(pal.Rarity) ? pal.Rarity : null,
		size: stripEnum(pal.Size) || null, // XS|S|M|L|XL
		genus: stripEnum(pal.GenusCategory) || null,
		nocturnal: !!pal.Nocturnal,
		predator: !!pal.Predator,
		edible: !!pal.Edible,
		food_amount: Number.isFinite(pal.FoodAmount) ? pal.FoodAmount : null,
		mount: deriveMount(pal),
		work,
		partner_skill: pal.OverridePartnerSkillTextID || null,
		partner_skill_desc: pal.PartnerSkillDesc || null,
		passive_skills: passives,
		drops,
		description: (pal.description || '').replace(/\r\n/g, '\n').trim(),
		icon: pal.icon || null, // e.g. "T_Anubis_icon_normal" -> media base name
		is_boss: !!pal.IsBoss,
		is_tower_boss: !!pal.IsTowerBoss,
		is_raid_boss: !!pal.IsRaidBoss,
		released: true
	};
}

// ---- fetch helpers ---------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url, tries = 5) {
	for (let a = 1; a <= tries; a++) {
		try {
			const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 paldle-scraper' } });
			if (res.status === 429) throw new Error('HTTP 429');
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return await res.text();
		} catch (e) {
			if (a === tries) throw e;
			// exponential backoff, longer for 429
			const base = /429/.test(e.message) ? 1500 : 400;
			await sleep(base * a + Math.floor(Math.random() * 300));
		}
	}
}

function slugsFromIndex(html) {
	const set = new Set();
	const re = /href="\/palworld\/pals\/([a-z0-9-]+)\/"/g;
	let m;
	while ((m = re.exec(html))) {
		const s = m[1].replace(/-+$/, ''); // drop trailing dashes from truncated hrefs
		if (s) set.add(s);
	}
	return [...set].sort();
}

async function mapLimit(items, limit, fn) {
	const out = new Array(items.length);
	let idx = 0;
	async function worker() {
		while (idx < items.length) {
			const i = idx++;
			out[i] = await fn(items[i], i);
		}
	}
	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
	return out;
}

// ---- main ------------------------------------------------------------------------
async function main() {
	await mkdir(RAW_DIR, { recursive: true });

	console.log('Fetching index …');
	const indexHtml = await fetchText(INDEX_URL);
	const slugs = slugsFromIndex(indexHtml);
	console.log(`Found ${slugs.length} pal slugs.`);

	let ok = 0, fail = 0, cached = 0;
	const results = await mapLimit(slugs, CONCURRENCY, async (slug) => {
		const rawPath = path.join(RAW_DIR, `${slug}.json`);
		try {
			let raw;
			if (existsSync(rawPath)) {
				// resume: reuse already-downloaded raw row, no refetch
				raw = JSON.parse(await readFile(rawPath, 'utf8'));
				cached++;
			} else {
				await sleep(THROTTLE_MS);
				const html = await fetchText(`${ORIGIN}/palworld/pals/${slug}/`);
				raw = extractPal(html);
				if (!raw) throw new Error('no embedded pal object');
				await writeFile(rawPath, JSON.stringify(raw, null, '\t'));
			}
			const norm = normalize(raw, slug);
			ok++;
			process.stdout.write(`\r  ${ok + fail}/${slugs.length}  ${slug.padEnd(28)}`);
			return norm;
		} catch (e) {
			fail++;
			console.warn(`\n  ! ${slug}: ${e.message}`);
			return null;
		}
	});

	const pals = results.filter(Boolean).sort((a, b) => {
		const an = a.paldeck_num ?? 9e9, bn = b.paldeck_num ?? 9e9;
		return an - bn || a.key.localeCompare(b.key);
	});

	await writeFile(OUT, JSON.stringify(pals, null, '\t'));
	console.log(`\n\nDone. ${ok} ok (${cached} from cache), ${fail} failed. Wrote ${pals.length} pals -> ${path.relative(process.cwd(), OUT)}`);

	// quick sanity report
	const elements = new Set();
	const sizes = new Set();
	const works = new Set();
	let noIcon = 0, noDesc = 0, noElement = 0;
	for (const p of pals) {
		p.elements.forEach((e) => elements.add(e));
		if (p.size) sizes.add(p.size);
		Object.keys(p.work).forEach((w) => works.add(w));
		if (!p.icon) noIcon++;
		if (!p.description) noDesc++;
		if (!p.elements.length) noElement++;
	}
	console.log('  elements:', [...elements].sort().join(', '));
	console.log('  sizes   :', [...sizes].join(', '));
	console.log('  work    :', [...works].sort().join(', '));
	console.log(`  missing : icon=${noIcon} description=${noDesc} element=${noElement}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
