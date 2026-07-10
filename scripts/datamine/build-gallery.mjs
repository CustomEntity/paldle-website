// Build a self-contained, browsable gallery of all extracted game assets.
// Open game-assets/index.html directly in a browser (file://).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GA = path.resolve(__dirname, '../..', 'game-assets');

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith('.png')) acc.push(p);
  }
  return acc;
}

const files = walk(GA).sort();
const byTop = {};
for (const f of files) {
  const rel = path.relative(GA, f);
  const top = rel.split(path.sep)[0];
  (byTop[top] ??= []).push(rel);
}

const dim = (f) => {
  try { const p = PNG.sync.read(fs.readFileSync(path.join(GA, f))); return `${p.width}×${p.height}`; }
  catch { return ''; }
};

const cards = (rels) => rels.map((rel) => {
  const name = rel.split('/').pop();
  return `<figure class="c" data-n="${rel.toLowerCase()}"><a href="${rel}" target="_blank"><img loading="lazy" src="${rel}" alt="${name}"></a><figcaption>${name}<span>${dim(rel)}</span></figcaption></figure>`;
}).join('');

const sections = Object.keys(byTop).sort().map((top) =>
  `<section><h2>${top} <em>${byTop[top].length}</em></h2><div class="grid">${cards(byTop[top])}</div></section>`
).join('');

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Stardewdle · Game Assets (${files.length})</title>
<style>
  :root{--bg:#1e2410;--panel:#2c3a18;--txt:#e8e6d0;--acc:#8fd05a}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--txt);font:14px/1.4 system-ui,sans-serif}
  header{position:sticky;top:0;z-index:5;background:#141a09;padding:14px 20px;border-bottom:2px solid var(--acc);display:flex;gap:16px;align-items:center;flex-wrap:wrap}
  header h1{margin:0;font-size:18px;color:var(--acc)}
  #q{flex:1;min-width:200px;padding:8px 12px;border-radius:8px;border:1px solid #3a4a1e;background:#0e1206;color:var(--txt);font-size:14px}
  .muted{color:#9aa87a;font-size:12px}
  section{padding:8px 20px 24px}
  h2{color:var(--acc);border-bottom:1px solid #3a4a1e;padding-bottom:6px;position:sticky;top:56px;background:var(--bg)}
  h2 em{color:#9aa87a;font-style:normal;font-size:13px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-top:12px}
  .c{margin:0;background:var(--panel);border:1px solid #3a4a1e;border-radius:8px;padding:8px;text-align:center;overflow:hidden}
  .c a{display:flex;align-items:center;justify-content:center;height:120px;border-radius:6px;
    background-color:#20160f;background-image:linear-gradient(45deg,#2a2018 25%,transparent 25%),linear-gradient(-45deg,#2a2018 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#2a2018 75%),linear-gradient(-45deg,transparent 75%,#2a2018 75%);background-size:16px 16px;background-position:0 0,0 8px,8px -8px,-8px 0}
  .c img{max-width:100%;max-height:118px;image-rendering:pixelated;object-fit:contain}
  figcaption{margin-top:6px;font-size:11px;word-break:break-all;color:#cfd3b0}
  figcaption span{display:block;color:#8aa060;font-size:10px}
  .hidden{display:none}
</style></head><body>
<header>
  <h1>✦ Stardewdle · Game Assets</h1>
  <span class="muted">${files.length} PNG · Stardew Valley 1.6</span>
  <input id="q" placeholder="Filter by filename… (e.g. cursor, junimo, crop, heart)">
</header>
${sections}
<script>
  const q=document.getElementById('q');
  q.addEventListener('input',()=>{const v=q.value.trim().toLowerCase();
    document.querySelectorAll('.c').forEach(c=>c.classList.toggle('hidden', v && !c.dataset.n.includes(v)));
    document.querySelectorAll('section').forEach(s=>{const any=[...s.querySelectorAll('.c')].some(c=>!c.classList.contains('hidden'));s.classList.toggle('hidden',!any);});
  });
</script>
</body></html>`;

fs.writeFileSync(path.join(GA, 'index.html'), html);
console.log(`✓ gallery -> game-assets/index.html (${files.length} assets across ${Object.keys(byTop).length} categories)`);
