// Convert datamined pal-cry wems -> ogg and place one representative cry per pal.
//
// Input:  out/cry-map.json      (slug -> { sourceIds:[...] })  from build-cry-map.mjs
//         out/cry_wems/<id>.wem (extracted by PaldleExtractor `media`)
// Output: out/cry_ogg/<id>.ogg          (full deduped cry library)
//         static/sounds/<slug>.ogg      (one representative cry per pal, for the site)
//         out/sounds-map.json           (slug -> [ogg ids], for future multi-cry use)
//
// wem is Wwise Vorbis -> vgmstream decodes to wav -> ffmpeg encodes ogg (libvorbis).
//
// Usage: node scripts/datamine/build-sounds.mjs

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'out');
const WEM = path.join(OUT, 'cry_wems');
const OGG = path.join(OUT, 'cry_ogg');
const TMP = path.join(OUT, 'tmp_wav');
const DEST = path.join(__dirname, '..', '..', 'static', 'sounds');
const VGM = process.env.VGMSTREAM || path.join(__dirname, 'extractor', 'tools', 'vgmstream', 'vgmstream-cli.exe');
const FFMPEG = process.env.FFMPEG || 'C:/ffmpeg/bin/ffmpeg.exe';

for (const d of [OGG, TMP, DEST]) fs.mkdirSync(d, { recursive: true });

const map = JSON.parse(fs.readFileSync(path.join(OUT, 'cry-map.json'), 'utf8'));
const allIds = [...new Set(Object.values(map).flatMap((p) => p.sourceIds))];
console.log(`converting ${allIds.length} distinct cry wems -> ogg ...`);

const run = (cmd, args) => new Promise((res, rej) => {
	const p = spawn(cmd, args, { windowsHide: true });
	let err = '';
	p.stderr.on('data', (d) => (err += d));
	p.on('close', (code) => (code === 0 ? res() : rej(new Error(`${path.basename(cmd)} exit ${code}: ${err.slice(-200)}`))));
	p.on('error', rej);
});

async function convert(id) {
	const wem = path.join(WEM, `${id}.wem`);
	const ogg = path.join(OGG, `${id}.ogg`);
	if (fs.existsSync(ogg)) return true;
	if (!fs.existsSync(wem)) { console.error(`  missing wem ${id}`); return false; }
	const wav = path.join(TMP, `${id}.wav`);
	try {
		await run(VGM, ['-o', wav, wem]);
		await run(FFMPEG, ['-y', '-hide_banner', '-loglevel', 'error', '-i', wav, '-c:a', 'libvorbis', '-q:a', '5', ogg]);
		return true;
	} catch (e) { console.error(`  ERR ${id}: ${e.message}`); return false; }
	finally { if (fs.existsSync(wav)) fs.unlinkSync(wav); }
}

// bounded-concurrency map
async function mapLimit(items, limit, fn) {
	let i = 0, done = 0; const out = new Array(items.length);
	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
		while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx]); if (++done % 200 === 0) process.stdout.write(`\r  ${done}/${items.length}`); }
	}));
	return out;
}

const okFlags = await mapLimit(allIds, Math.max(4, os.cpus().length - 2), convert);
const okIds = new Set(allIds.filter((id, i) => okFlags[i]));
console.log(`\nconverted ${okIds.size}/${allIds.length} ogg -> ${path.relative(process.cwd(), OGG)}`);

// place one representative cry per pal + build sounds-map
const soundsMap = {};
let placed = 0, noSound = 0;
for (const [slug, p] of Object.entries(map)) {
	const ids = p.sourceIds.filter((id) => okIds.has(id));
	soundsMap[slug] = ids;
	if (!ids.length) { noSound++; continue; }
	fs.copyFileSync(path.join(OGG, `${ids[0]}.ogg`), path.join(DEST, `${slug}.ogg`));
	placed++;
}
fs.writeFileSync(path.join(OUT, 'sounds-map.json'), JSON.stringify(soundsMap, null, '\t'));
fs.rmSync(TMP, { recursive: true, force: true });

console.log(`placed representative cry for ${placed} pals -> ${path.relative(process.cwd(), DEST)} (${noSound} without sound)`);
console.log(`sounds-map.json written (${okIds.size} cries in library)`);
