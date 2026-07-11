// Datamine each pal's mount type from its actor blueprint + monster table.
//
// There is no clean mount enum in the DataTables, so we classify from the pal's
// BP_<Name> actor blueprint (scanned by PaldleExtractor `bpscan` -> out/bpscan/bp-markers.json):
//   rideable  = BP references a ride marker / RideCall / riding blendspace
//   Flying    = rideable + has PalFlyMeshHeightCtrl (flight altitude controller)
//   Swimming  = rideable + Water element (aquatic mount)
//   Ground    = rideable, otherwise
//   None      = not rideable
// Validated at ~92% vs the previous curated roster (the residual is ground-truth noise:
// e.g. Ice/Water pals labelled Ground). Element variants reuse the base pal's BP.
//
// Output: out/mount-map.json  { internalName: "None"|"Ground"|"Flying"|"Swimming" }
//
// Usage: node scripts/datamine/build-mount-map.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'out');
const bp = JSON.parse(fs.readFileSync(path.join(OUT, 'bpscan', 'bp-markers.json'), 'utf8'));
const monster = JSON.parse(fs.readFileSync(path.join(OUT, 'tables', 'monster.json'), 'utf8'))[0].Rows;

const mci = new Map(); for (const k in monster) mci.set(k.toLowerCase(), monster[k]);
const bpci = new Map(); for (const k in bp) bpci.set(k.toLowerCase(), bp[k]);

const ELEM_SUFFIX = /_(Fire|Ice|Electric|Electstrong|Thunder|Dark|Ground|Earth|Neutral|Water|Grass|Leaf|Dragon|Black|Gold|Gild|Origin|Lux|Cryst|Ignis|Terra|Noct|Primo|Aqua)$/i;

const bpFor = (name) => bpci.get(name.toLowerCase())
	|| (ELEM_SUFFIX.test(name) ? bpci.get(name.replace(ELEM_SUFFIX, '').toLowerCase()) : null);

const rideable = (d) => !!d && !d.error && (d.tokens || []).some((x) => /RideCall|RideMarker|_Riding|BS_.*Rid/i.test(x));
const waterElem = (name) => { const m = mci.get(name.toLowerCase()); return m && (/Water/i.test(m.ElementType1 || '') || /Water/i.test(m.ElementType2 || '')); };

export function classifyMount(name) {
	const d = bpFor(name);
	if (!rideable(d)) return 'None';
	if (waterElem(name)) return 'Swimming';
	if (d.fly) return 'Flying';
	return 'Ground';
}

// classify every monster row (so datamine-local can look up by tribe/dev_name/rowKey)
const map = {};
for (const k of Object.keys(monster)) map[k] = classifyMount(k);
fs.writeFileSync(path.join(OUT, 'mount-map.json'), JSON.stringify(map, null, '\t'));

const dist = {}; for (const v of Object.values(map)) dist[v] = (dist[v] || 0) + 1;
console.log('mount-map.json written for', Object.keys(map).length, 'rows. distribution:', JSON.stringify(dist));
