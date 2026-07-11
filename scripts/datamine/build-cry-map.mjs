// Build the pal -> cry-wem map from AKB_Voice_PalCry.bnk.
//
// The pal-cry master bank is a Wwise switch container tree:
//   (pal switch, SwitchId = FNV(palInternalName))  ->  NodeIds
//       -> RandomSequenceContainer / SwitchContainer (emotion) -> ... -> SoundSfxVoice{ SourceId }
// SourceId is a streamed wem in Pal/Content/WwiseAudio/Media/<SourceId>.wem.
//
// Output: out/cry-map.json  { slug: { tribe, names:[internal], sourceIds:[...] } }
//         out/cry-sourceids.txt  (all needed wem ids, one per line)
//
// Usage: node scripts/datamine/build-cry-map.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'out');
const bank = JSON.parse(fs.readFileSync(path.join(OUT, 'dump', 'bank_AKB_Voice_PalCry.json'), 'utf8'));
const H = bank.Hierarchies;
const monster = JSON.parse(fs.readFileSync(path.join(OUT, 'tables', 'monster.json'), 'utf8'))[0].Rows;
const pals = JSON.parse(fs.readFileSync(path.join(__dirname, 'pals.json'), 'utf8'));

const fnv = (name) => { const b = Buffer.from(name.toLowerCase(), 'utf8'); let h = 2166136261 >>> 0; for (const x of b) { h = Math.imul(h, 16777619) >>> 0; h = (h ^ x) >>> 0; } return h >>> 0; };

// index by id + build parent -> children from every node's DirectParentId
const byId = new Map();
const children = new Map();
const sourceOf = new Map(); // id -> SourceId (for SoundSfxVoice leaves)
for (const h of H) {
	byId.set(Number(h.Id), h);
	const dp = h.Data?.BaseParams?.DirectParentId;
	if (dp) { if (!children.has(dp)) children.set(dp, []); children.get(dp).push(Number(h.Id)); }
	const sid = h.Data?.Source?.SourceId;
	if (sid) sourceOf.set(Number(h.Id), sid >>> 0);
}
// also record container ChildIds (covers cases DirectParentId misses)
for (const h of H) {
	const kids = h.Data?.ChildIds;
	if (Array.isArray(kids)) { const id = Number(h.Id); if (!children.has(id)) children.set(id, []); for (const k of kids) children.get(id).push(k >>> 0); }
}

// pal switch: SwitchId (=FNV(name)) -> NodeIds, aggregated across all switch containers
const switchIdToNodes = new Map();
for (const h of H) {
	if (h.Type !== 'SwitchContainer') continue;
	for (const sp of (h.Data.SwitchPackages || [])) {
		const sid = sp.SwitchId >>> 0;
		if (!switchIdToNodes.has(sid)) switchIdToNodes.set(sid, []);
		switchIdToNodes.get(sid).push(...(sp.NodeIds || []).map((n) => n >>> 0));
	}
}

// collect all SoundSfxVoice SourceIds reachable below a set of start node ids
function collectSources(startIds) {
	const seen = new Set(), out = new Set();
	const stack = [...startIds];
	while (stack.length) {
		const id = stack.pop();
		if (seen.has(id)) continue;
		seen.add(id);
		if (sourceOf.has(id)) out.add(sourceOf.get(id));
		for (const c of (children.get(id) || [])) stack.push(c);
	}
	return [...out];
}

// candidate internal names per pal (the row keys sharing this pal's tribe + the tribe itself)
const rowKeysByTribe = {};
for (const [k, v] of Object.entries(monster)) { const t = (v.Tribe || '').split('::').pop(); if (t) (rowKeysByTribe[t] ||= []).push(k); }

// element-variant pals (BluePlatypus_Fire, Bastet_Ice, ...) reuse the base pal's cry
const ELEM_SUFFIX = /_(Fire|Ice|Electric|Electstrong|Thunder|Dark|Ground|Earth|Neutral|Water|Grass|Leaf|Dragon|Black|Gold|Gild|Origin|Lux|Cryst|Ignis|Terra|Noct|Primo|Aqua)$/i;

const map = {};
const allIds = new Set();
let withCry = 0, viaBase = 0;
for (const p of pals) {
	const names = new Set([p.dev_name, p.tribe, ...(rowKeysByTribe[p.tribe] || [])].filter(Boolean));
	// add element-stripped base names as fallback candidates
	for (const n of [...names]) if (ELEM_SUFFIX.test(n)) names.add(n.replace(ELEM_SUFFIX, ''));
	const startNodes = [];
	let usedBase = false;
	for (const n of names) { const nodes = switchIdToNodes.get(fnv(n)); if (nodes) { startNodes.push(...nodes); if (ELEM_SUFFIX.test(p.tribe || '') && !ELEM_SUFFIX.test(n)) usedBase = true; } }
	if (usedBase && startNodes.length) viaBase++;
	const sourceIds = startNodes.length ? collectSources(startNodes) : [];
	if (sourceIds.length) withCry++;
	sourceIds.forEach((s) => allIds.add(s));
	map[p.key] = { name: p.name, tribe: p.tribe, names: [...names], sourceIds };
}

fs.writeFileSync(path.join(OUT, 'cry-map.json'), JSON.stringify(map, null, '\t'));
fs.writeFileSync(path.join(OUT, 'cry-sourceids.txt'), [...allIds].join('\n'));

const counts = pals.map((p) => map[p.key].sourceIds.length);
console.log(`pals with >=1 cry wem: ${withCry} / ${pals.length} (${viaBase} via base-pal fallback)`);
console.log(`total distinct cry wems referenced: ${allIds.size}`);
console.log(`cry wems per pal: min ${Math.min(...counts)} max ${Math.max(...counts)} avg ${(counts.reduce((a, b) => a + b, 0) / counts.length).toFixed(1)}`);
console.log('no-cry pals (sample):', pals.filter((p) => !map[p.key].sourceIds.length).slice(0, 15).map((p) => `${p.name}(${p.tribe})`).join(', '));
console.log('sample:', pals.slice(0, 4).map((p) => `${p.name}:${map[p.key].sourceIds.length}wem`).join(', '));
