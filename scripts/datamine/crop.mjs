// Crop a region from an extracted game PNG.  node crop.mjs <srcRelToGameAssets> <x> <y> <w> <h> <outRelToStatic>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const [src, x, y, w, h, out] = process.argv.slice(2);
const srcPng = PNG.sync.read(fs.readFileSync(path.join(ROOT, 'game-assets', src)));
const X = +x, Y = +y, W = +w, H = +h;
const dst = new PNG({ width: W, height: H });
PNG.bitblt(srcPng, dst, X, Y, W, H, 0, 0);
const outPath = path.join(ROOT, 'static', out);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, PNG.sync.write(dst));
console.log(`✓ ${src} [${X},${Y} ${W}x${H}] -> static/${out}  (source ${srcPng.width}x${srcPng.height})`);
