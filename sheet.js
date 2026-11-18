// Model sheet: every pose of every character, enlarged (review only: ?sheet=1)
import { atlas, TABLES, LOOKS, FW, FH } from './chars.js';
const c = document.getElementById('ov'), g = c.getContext('2d'); g.imageSmoothingEnabled = false;
g.fillStyle = '#6a6258'; g.fillRect(0, 0, 1920, 1080);
const Q = new URLSearchParams(location.search), S = +(Q.get('s') ?? 3);
const rows = (Q.get('rows') || 'hero:theo,hero:fut0,hero:fut1,hero:fut2,hero:fut3,nan:nan').split(',').map(r => r.split(':'));
const only = Q.get('only') ? Q.get('only').split(',') : null;
let y = 6;
for (const [k, l] of rows) {
  const A = atlas(TABLES[k], LOOKS[l]), idx = A.names.map((n, i) => [n, i]).filter(([n]) => !only || only.includes(n)), perRow = Math.floor(1900 / (FW * S));
  idx.forEach(([, i], j) => { const col = j % perRow, row = Math.floor(j / perRow); g.drawImage(A.canvas, i * FW, 0, FW, FH, 10 + col * FW * S, y + row * FH * S, FW * S, FH * S); });
  y += Math.ceil(idx.length / perRow) * FH * S + 4;
}
window.DUR = 1; window.render = () => {}; window.READY = true;
