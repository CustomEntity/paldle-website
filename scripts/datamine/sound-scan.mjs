import fs from 'node:fs';
const lines = fs.readFileSync('out/manifest.txt', 'utf8').split(/\r?\n/);
const bnk = lines.filter((l) => /WwiseAudio\/Event\/.*\.bnk$/i.test(l)).map((l) => l.split('/').pop().replace(/\.bnk$/i, ''));
const monster = JSON.parse(fs.readFileSync('out/tables/monster.json'))[0].Rows;
const pals = JSON.parse(fs.readFileSync('pals.json'));

console.log('total bnk events:', bnk.length);

const rowKeysByTribe = {};
for (const [k, v] of Object.entries(monster)) {
	const t = (v.Tribe || '').split('::').pop();
	if (t) (rowKeysByTribe[t] ||= []).push(k);
}
const rx = (c) => new RegExp('(^|_)' + c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(_|$)', 'i');
let withAny = 0;
const per = [];
for (const p of pals) {
	const cands = new Set([p.dev_name, p.tribe, ...(rowKeysByTribe[p.tribe] || [])].filter(Boolean));
	const hits = bnk.filter((b) => [...cands].some((c) => rx(c).test(b)));
	if (hits.length) withAny++;
	per.push({ name: p.name, tribe: p.tribe, hits });
}
console.log('roster pals with >=1 named bnk:', withAny, '/', pals.length);
per.sort((a, b) => b.hits.length - a.hits.length);
console.log('top roster pals by bnk count:');
per.slice(0, 6).forEach((p) => console.log(`  ${p.name}(${p.tribe}): ${p.hits.length}  e.g. ${p.hits.slice(0, 3).join(', ')}`));

const suffix = {};
for (const b of bnk) { const s = b.split('_').pop(); suffix[s] = (suffix[s] || 0) + 1; }
console.log('\ntop bnk suffixes (action types):');
Object.entries(suffix).sort((a, b) => b[1] - a[1]).slice(0, 25).forEach(([s, n]) => console.log(`  ${String(n).padStart(4)}  _${s}`));

console.log('\nbnk count by voice/cry keyword:');
for (const kw of ['Cry', 'Voice', 'Damage', 'Dead', 'Death', 'Idle', 'Appear', 'Notice', 'Relax', 'Happy', 'Nakigoe', 'Call', 'Roar', 'Wild', 'Capture', 'Zukan']) {
	const c = bnk.filter((b) => new RegExp(kw, 'i').test(b)).length;
	if (c) console.log(`  ${String(c).padStart(4)}  ${kw}`);
}
