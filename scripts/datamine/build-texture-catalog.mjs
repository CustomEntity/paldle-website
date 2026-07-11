// Recover human names for the generically-named datamined UI textures.
//
// Palworld's icon DataTables map a SEMANTIC key (item name, build object, pal,
// control key, ...) to a texture asset. This reverses them into a catalog:
//   { "<texture basename>": { source, key } }
// so e.g. T_itemicon_Material_Stone -> { source: "item", key: "Stone" }.
//
// Element type icons (T_Icon_element_NN) live only in a widget's bytecode, so
// their mapping is hard-coded here from a visual pass. Work-suitability icons
// already carry their type name in the filename.
//
// Usage: node scripts/datamine/build-texture-catalog.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const T = path.join(__dirname, 'out', 'tables');
const rows = (f) => { const p = path.join(T, f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8'))[0].Rows : {}; };

const base = (assetPath) => {
	if (!assetPath || assetPath === 'None') return null;
	// "/Game/.../T_foo.T_foo" -> "T_foo"
	return String(assetPath).split('/').pop().split('.')[0];
};
// pull the first texture asset path found anywhere in a row value
const findTexture = (val) => {
	let hit = null;
	JSON.stringify(val, (k, v) => {
		if (!hit && typeof v === 'string' && /^\/Game\/.*\/(T_|t_)/.test(v)) hit = v;
		return v;
	});
	return base(hit);
};

const catalog = {}; // textureBasename -> { source, key }
const add = (tex, source, key) => { if (tex && !catalog[tex]) catalog[tex] = { source, key }; };

// icon tables: row key IS the semantic name
for (const [file, source] of [
	['itemIcon.json', 'item'],
	['buildIcon.json', 'build'],
	['icon.json', 'pal'],
	['keyIcon.json', 'key']
]) {
	const r = rows(file);
	for (const [key, val] of Object.entries(r)) add(findTexture(val), source, key);
}

// element type icons — mapping from a visual pass (widget bytecode isn't readable)
const ELEMENTS = ['Neutral', 'Fire', 'Water', 'Electric', 'Grass', 'Dark', 'Dragon', 'Ground', 'Ice'];
ELEMENTS.forEach((el, i) => {
	add(`T_Icon_element_${String(i).padStart(2, '0')}`, 'element', el);
	add(`T_Icon_element_s_${String(i).padStart(2, '0')}`, 'element', el);
});

// work-suitability icons already name their type in the filename
const WORK = { EmitFlame: 'Kindling', Watering: 'Watering', Seeding: 'Planting', GenerateElectricity: 'Electricity', Handcraft: 'Handiwork', Collection: 'Gathering', Deforest: 'Lumbering', Mining: 'Mining', OilExtraction: 'OilExtraction', ProductMedicine: 'Medicine', Cool: 'Cooling', Transport: 'Transporting', MonsterFarm: 'Farming' };
for (const [g, label] of Object.entries(WORK)) add(`T_icon_skill_pal_WorkRank_${g}`, 'work', label);

const out = path.join(__dirname, 'out', 'texture-catalog.json');
fs.writeFileSync(out, JSON.stringify(catalog, null, '\t'));

const bySource = {};
for (const v of Object.values(catalog)) bySource[v.source] = (bySource[v.source] || 0) + 1;
console.log(`texture catalog: ${Object.keys(catalog).length} textures named -> ${path.relative(process.cwd(), out)}`);
console.log('by source:', JSON.stringify(bySource));
console.log('samples:');
for (const s of ['item', 'build', 'pal', 'element', 'work', 'key'])
	console.log('  ' + Object.entries(catalog).find(([, v]) => v.source === s)?.map((x, i) => i ? JSON.stringify(x) : x).join(' -> '));
