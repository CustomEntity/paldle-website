// Download Pal icons referenced by pals.json into static/pals/<key>.webp.
//
// Source: wikily.gg's R2 CDN (icon base name comes from the datamined `icon` field,
// e.g. "T_Anubis_icon_normal"). Self-hosting keeps the site working in dev and prod
// without hotlinking. When the game is datamined in-house, swap the source URL for the
// exported textures — the target filenames (static/pals/<key>.webp) stay the same.
//
// Usage: node scripts/datamine/download-icons.mjs

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CDN = 'https://r2.wikily.gg/images/palworld/icons';
const OUT_DIR = path.join(__dirname, '..', '..', 'static', 'pals');
const CONCURRENCY = 4;
const THROTTLE_MS = 150;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function mapLimit(items, limit, fn) {
	let idx = 0;
	await Promise.all(
		Array.from({ length: Math.min(limit, items.length) }, async () => {
			while (idx < items.length) {
				const i = idx++;
				await fn(items[i], i);
			}
		})
	);
}

async function main() {
	await mkdir(OUT_DIR, { recursive: true });
	const pals = JSON.parse(await readFile(path.join(__dirname, 'pals.json'), 'utf8'));
	const withIcon = pals.filter((p) => p.icon);
	console.log(`Downloading ${withIcon.length} icons -> static/pals/`);

	let ok = 0, cached = 0, fail = 0;
	await mapLimit(withIcon, CONCURRENCY, async (p) => {
		const dest = path.join(OUT_DIR, `${p.key}.webp`);
		if (existsSync(dest)) { cached++; return; }
		try {
			await sleep(THROTTLE_MS);
			const res = await fetch(`${CDN}/${p.icon}.webp`, { headers: { 'user-agent': 'Mozilla/5.0 paldle' } });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const buf = Buffer.from(await res.arrayBuffer());
			await writeFile(dest, buf);
			ok++;
			process.stdout.write(`\r  ${ok + cached + fail}/${withIcon.length}  ${p.key.padEnd(28)}`);
		} catch (e) {
			fail++;
			console.warn(`\n  ! ${p.key} (${p.icon}): ${e.message}`);
		}
	});
	console.log(`\nDone. ${ok} downloaded, ${cached} cached, ${fail} failed.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
