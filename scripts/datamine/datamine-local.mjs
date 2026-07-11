// Local datamine normalizer.
//
// Reads the raw DataTable dumps produced by the C# PaldleExtractor
// (scripts/datamine/out/tables/*.json) and normalizes them into pals.json —
// the SAME shape scrape-wikily.mjs produced, so seed-pals.mjs keeps working.
// Adds French translations (name_fr / description_fr / partner_skill_fr) since
// paldle ships EN+FR.
//
// Text linking discovered from the game tables:
//   name        <- DT_PalNameText_Common     row "PAL_NAME_<rowKey>"       (.TextData.LocalizedString)
//   description <- DT_PalLongDescriptionText  row "PAL_LONG_DESC_<rowKey>"
//   partner     <- DT_SkillNameText_Common    row "PARTNERSKILL_<rowKey>"
// (OverrideNameTextID / OverridePartnerSkillNameTextID take precedence when != "None")
//
// mount has no clean enum in the tables; we carry it over from the previous
// pals.json by matching on `tribe` (its values came from the community source).
//
// Usage: node scripts/datamine/datamine-local.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const T = path.join(__dirname, 'out', 'tables');
const OUT = path.join(__dirname, 'pals.json');
const ICON_LIST = path.join(__dirname, 'out', 'icon-assets.json'); // for the texture-extract step

const rows = (f) => JSON.parse(fs.readFileSync(path.join(T, f), 'utf8'))[0].Rows;
// game row keys have inconsistent casing across tables (CowPal vs Cowpal, BadCatgirl
// vs BadCatGirl, ...) -> index every table case-insensitively.
const ciIndex = (tbl) => { const m = new Map(); for (const k in tbl) m.set(k.toLowerCase(), tbl[k]); return m; };
const loc = (idx, key) => (key ? idx.get(key.toLowerCase()) : null)?.TextData?.LocalizedString ?? null;

// ---- load tables (case-insensitive indexes) ----
const monster = rows('monster.json');
const iconTbl = ciIndex(rows('icon.json'));

// Every language Palworld ships (L10N/<dir>): [gameL10nDir, appLocaleCode].
// App codes are lowercase because the server lowercases the requested locale and
// DB locale matching is case-sensitive — so es-MX -> es-mx, zh-Hans -> zh-hans, …
const LANGS = [
	['en', 'en'], ['fr', 'fr'], ['de', 'de'], ['es', 'es'], ['es-MX', 'es-mx'],
	['id', 'id'], ['it', 'it'], ['ko', 'ko'], ['pl', 'pl'], ['pt-BR', 'pt-br'],
	['ru', 'ru'], ['th', 'th'], ['tr', 'tr'], ['vi', 'vi'],
	['zh-Hans', 'zh-hans'], ['zh-Hant', 'zh-hant']
];
// per-language case-insensitive text indexes: TX[code] = { name, desc, skill }
const TX = {};
for (const [dir, code] of LANGS) {
	TX[code] = {
		name: ciIndex(rows(`name_${dir}.json`)),
		desc: ciIndex(rows(`desc_${dir}.json`)),
		skill: ciIndex(rows(`skill_${dir}.json`))
	};
}

// ---- previous roster: reuse key + mount + partner_skill_desc by tribe ----
// curated previous roster (wikily backup) — source of truth for `mount` on known pals and
// for reusing stable `key`s by tribe. NOT the datamined pals.json we overwrite each run.
const PREV = path.join(__dirname, 'pals.wikily-backup.json');
const prev = fs.existsSync(PREV) ? JSON.parse(fs.readFileSync(PREV, 'utf8'))
	: (fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : []);
const prevByTribe = new Map();
for (const p of prev) if (p.tribe) prevByTribe.set(p.tribe, p);

// datamined mount classification (from pal blueprints); see build-mount-map.mjs.
// Used for NEW pals; curated `prev` mount wins for pals we already had.
const MOUNT_MAP = path.join(__dirname, 'out', 'mount-map.json');
const mountMap = fs.existsSync(MOUNT_MAP) ? JSON.parse(fs.readFileSync(MOUNT_MAP, 'utf8')) : {};

// ---- enum + work maps (mirrors scrape-wikily.mjs) ----
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

const slugify = (s) => (s || '').toLowerCase().normalize('NFD')
	.replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// clean UE rich text. Strip ALL <tags> (incl. <characterName>, <Elem_Water>, </>): for the
// Description guessing mode, blanking the pal's own name is desirable (no spoiler). Then tidy
// whitespace left behind (double spaces, space-before-punct, blank-line runs).
function cleanText(s, _palName) {
	if (!s) return '';
	return s
		.replace(/<[^>]+>/g, '')
		.replace(/\r\n/g, '\n')
		.replace(/[ \t]{2,}/g, ' ')
		.replace(/ +([,.;:!?])/g, '$1')
		.replace(/[ \t]+\n/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

// which of several rows sharing a paldeck id is the "canonical" one
const VARIANT_RE = /(^SUMMON_|^Quest_|_Oilrig$|_Oilrig_|_Tower$|_Tower_|_MAX$|_Debug)/i;
function variantScore(key, v) {
	let s = 0;
	if (v.IsBoss) s += 100;
	if (v.IsRaidBoss) s += 100;
	if (v.IsTowerBoss) s += 50;
	if (VARIANT_RE.test(key)) s += 40;
	s += key.length * 0.01; // prefer shorter/base keys on tie
	return s;
}

// ---- select roster: IsPal && ZukanIndex>=1, dedupe per paldeck id ----
const byId = new Map();
for (const [key, v] of Object.entries(monster)) {
	if (v.IsPal !== true) continue;
	const zk = Number(v.ZukanIndex);
	if (!Number.isFinite(zk) || zk < 1) continue;
	const id = `${zk}${v.ZukanIndexSuffix || ''}`;
	const cur = byId.get(id);
	if (!cur || variantScore(key, v) < variantScore(cur.key, cur.v)) byId.set(id, { key, v });
}

const usedSlugs = new Set();
const iconAssets = []; // {slug, assetPath, base}

const pals = [];
for (const { key, v } of byId.values()) {
	const nameKeyId = v.OverrideNameTextID && v.OverrideNameTextID !== 'None' ? v.OverrideNameTextID : `PAL_NAME_${key}`;
	const descKeyId = `PAL_LONG_DESC_${key}`;
	const partnerKeyId = v.OverridePartnerSkillNameTextID && v.OverridePartnerSkillNameTextID !== 'None'
		? v.OverridePartnerSkillNameTextID : `PARTNERSKILL_${key}`;

	const nameEn = loc(TX.en.name, nameKeyId) || key;
	const descEn = cleanText(loc(TX.en.desc, descKeyId), nameEn);

	// One translation per shipped language. Names fall back to EN where a locale
	// doesn't localize them (Latin-script locales keep the English name).
	const translations = {};
	for (const [, code] of LANGS) {
		const nm = loc(TX[code].name, nameKeyId) || nameEn;
		const ds = cleanText(loc(TX[code].desc, descKeyId), nm);
		const sk = loc(TX[code].skill, partnerKeyId);
		translations[code] = { name: nm, description: ds, partner_skill: sk };
	}
	const partnerEn = translations.en.partner_skill;

	const tribe = stripEnum(v.Tribe) || null;
	const prevP = tribe ? prevByTribe.get(tribe) : null;

	// mount: curated value from the previous roster wins; otherwise datamined from the BP.
	const dataminedMount = mountMap[key] || (tribe && mountMap[tribe]) || 'None';
	const mount = prevP ? (prevP.mount || 'None') : dataminedMount;

	// stable key: reuse previous slug for this tribe if we had one; else slugify EN name
	let slug = prevP?.key || slugify(nameEn) || slugify(key);
	if (usedSlugs.has(slug)) slug = `${slug}-${slugify(key)}`;
	if (usedSlugs.has(slug)) slug = `${slug}-${byId.size}`;
	usedSlugs.add(slug);

	const elements = [normElement(v.ElementType1), normElement(v.ElementType2)].filter(Boolean);
	const work = {};
	for (const [rawKey, label] of Object.entries(WORK_KEYS)) {
		const lvl = Number(v[rawKey] || 0);
		if (lvl > 0) work[label] = lvl;
	}
	const passives = [v.PassiveSkill1, v.PassiveSkill2, v.PassiveSkill3, v.PassiveSkill4]
		.filter((s) => s && s !== 'None');

	const paldeckNum = Number(v.ZukanIndex);
	const paldeck = `${paldeckNum}${v.ZukanIndexSuffix || ''}`;

	// icon: DT_PalCharacterIconDataTable keyed by row key (fallback: tribe / dev_name)
	const iconRow = iconTbl.get(key.toLowerCase())
		|| (tribe && iconTbl.get(tribe.toLowerCase()))
		|| (v.BPClass && iconTbl.get(v.BPClass.toLowerCase())) || null;
	const assetPath = iconRow?.Icon?.AssetPathName || null; // /Game/.../T_X_icon_normal.T_X_icon_normal
	const iconBase = assetPath ? assetPath.split('/').pop().split('.')[0] : null; // T_X_icon_normal
	if (assetPath) iconAssets.push({ slug, assetPath, base: iconBase });

	pals.push({
		key: slug,
		tribe,
		dev_name: v.BPClass || key,
		name: nameEn,
		paldeck,
		paldeck_num: paldeckNum,
		paldeck_suffix: v.ZukanIndexSuffix || '',
		elements,
		rarity: Number.isFinite(v.Rarity) ? v.Rarity : null,
		size: stripEnum(v.Size) || null,
		genus: stripEnum(v.GenusCategory) || null,
		nocturnal: !!v.Nocturnal,
		predator: !!v.Predator,
		edible: !!v.Edible,
		food_amount: Number.isFinite(v.FoodAmount) ? v.FoodAmount : null,
		mount, // curated (prev) for known pals, datamined from BP for new ones
		work,
		partner_skill: partnerEn,
		partner_skill_desc: prevP?.partner_skill_desc || null,
		passive_skills: passives,
		drops: [],
		description: descEn,
		icon: iconBase,
		is_boss: !!v.IsBoss,
		is_tower_boss: !!v.IsTowerBoss,
		is_raid_boss: !!v.IsRaidBoss,
		released: true,
		// --- i18n: name/description/partner_skill for every shipped language (see LANGS) ---
		// flat fr fields kept for backward compat; `translations` is the full set keyed by locale.
		name_fr: translations.fr.name,
		description_fr: translations.fr.description,
		partner_skill_fr: translations.fr.partner_skill,
		translations
	});
}

pals.sort((a, b) => (a.paldeck_num - b.paldeck_num) || a.key.localeCompare(b.key));

fs.writeFileSync(OUT, JSON.stringify(pals, null, '\t'));
fs.writeFileSync(ICON_LIST, JSON.stringify(iconAssets, null, '\t'));

// ---- report ----
const elements = new Set(), sizes = new Set(), works = new Set();
let noIcon = 0, noDesc = 0, noElement = 0, noMount = 0, noFrName = 0;
for (const p of pals) {
	p.elements.forEach((e) => elements.add(e));
	if (p.size) sizes.add(p.size);
	Object.keys(p.work).forEach((w) => works.add(w));
	if (!p.icon) noIcon++;
	if (!p.description) noDesc++;
	if (!p.elements.length) noElement++;
	if (p.mount === 'None') noMount++;
	if (!p.name_fr || p.name_fr === p.name) noFrName++;
}
// per-language coverage (how many pals have a localized name/description in each locale)
const langReport = LANGS.map(([, code]) => {
	let nm = 0, ds = 0;
	for (const p of pals) {
		const t = p.translations[code];
		if (t?.name) nm++;
		if (t?.description) ds++;
	}
	return `${code}:${nm}/${ds}`;
}).join('  ');

console.log(`Wrote ${pals.length} pals -> ${path.relative(process.cwd(), OUT)}`);
console.log(`Wrote ${iconAssets.length} icon refs -> ${path.relative(process.cwd(), ICON_LIST)}`);
console.log('  elements :', [...elements].sort().join(', '));
console.log('  sizes    :', [...sizes].join(', '));
console.log('  work     :', [...works].sort().join(', '));
console.log(`  missing  : icon=${noIcon} description=${noDesc} element=${noElement} mount=None:${noMount} fr-name-same-as-en=${noFrName}`);
console.log('  langs (name/desc counts):', langReport);
console.log('  sample   :', pals.slice(0, 3).map((p) => `${p.paldeck} ${p.name}/${p.name_fr} [${p.elements}] r${p.rarity} ${p.size}`).join(' | '));
