// Rename the extracted UI textures in out/ui/ to human names using texture-catalog.json.
//   T_Icon_element_01.png       -> element_Fire.png
//   T_Anubis_icon_normal.png    -> pal_Anubis.png
//   T_icon_skill_pal_WorkRank_* -> work_<label>.png
// In-place, keeps the folder structure. out/ is regenerable, so this is safe.
//
// Usage: node scripts/datamine/rename-textures.mjs [--dry]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'out');
const UI = path.join(OUT, 'ui');
const dry = process.argv.includes('--dry');

const catalog = JSON.parse(fs.readFileSync(path.join(OUT, 'texture-catalog.json'), 'utf8'));

// pal internal name -> display name (nicer than the tribe/dev name)
const palDisplay = new Map();
const palsPath = path.join(__dirname, 'pals.json');
if (fs.existsSync(palsPath)) {
	for (const p of JSON.parse(fs.readFileSync(palsPath, 'utf8'))) {
		if (p.tribe) palDisplay.set(p.tribe.toLowerCase(), p.name);
		if (p.dev_name) palDisplay.set(p.dev_name.toLowerCase(), p.name);
	}
}

const clean = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '');

function walk(dir) {
	const out = [];
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, e.name);
		if (e.isDirectory()) out.push(...walk(p));
		else if (e.name.toLowerCase().endsWith('.png')) out.push(p);
	}
	return out;
}

// fallback for textures not in a data table: the filename already IS the name,
// just strip the T_ + redundant type prefix so it reads cleanly.
function fallbackName(b) {
	let n = b.replace(/^T_/, '');
	n = n.replace(/^(prt|icon|img|btn|bg|eff|ui)_/i, ''); // drop one redundant type tag
	return n || b.replace(/^T_/, '');
}

let renamed = 0, cleaned = 0, skipped = 0;
const bySource = {};
const used = new Set();
for (const file of walk(UI)) {
	const b = path.basename(file, '.png');
	const entry = catalog[b];
	let name, kind;
	if (entry) {
		let key = entry.key;
		if (entry.source === 'pal') key = palDisplay.get(String(key).toLowerCase()) || key;
		name = `${entry.source}_${clean(key)}`;
		kind = entry.source;
	} else if (/^T_/.test(b)) {
		name = fallbackName(b);
		kind = 'filename';
	} else { skipped++; continue; } // already clean
	let dest = path.join(path.dirname(file), name + '.png');
	let n = 2;
	while (used.has(dest) || (dest !== file && fs.existsSync(dest))) { dest = path.join(path.dirname(file), `${name}_${n++}.png`); }
	used.add(dest);
	if (!dry && dest !== file) fs.renameSync(file, dest);
	if (kind === 'filename') cleaned++; else renamed++;
	bySource[kind] = (bySource[kind] || 0) + 1;
}
console.log(`${dry ? '[dry] ' : ''}decoded ${renamed} via data tables, cleaned ${cleaned} via filename, ${skipped} already clean`);
console.log('by source:', JSON.stringify(bySource));
