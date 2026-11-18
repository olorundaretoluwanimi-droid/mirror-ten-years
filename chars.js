// Pixel characters for "What If Your Mirror Showed You in 10 Years?": drawn pixel by pixel (3/4 view facing right),
// one frame per pose, packed in an atlas. Poses are data: a parameter object per frame; a new pose is a new table entry.
import * as THREE from 'three';
import { PX, ramp, hex, texOf, billboard, blob } from './px.js';

export const SPX = 1 / 30;            // character pixel → metres (50 px ≈ 1.67 m)
export const FW = 56, FH = 50;        // frame (wide enough for a lying figure)
const CX = 28;                        // body centre column of a standing figure
const D = .22;                        // sprite dither band
const R = cols => ramp(cols, D);
const INK = hex('#1c1214');

export const PAL = {
  skinHero: R(['#6e4432', '#9a6448', '#c08462', '#deaa86']),
  skinOlive: R(['#6e4630', '#9a6644', '#bf885e', '#dcab80']),
  skinDeep: R(['#3a2218', '#5a3626', '#7a4c36', '#96644a']),
  skinPale: R(['#8a6656', '#b88e78', '#dab298', '#f0d0b6']),
  skinOld: R(['#7c5848', '#a87a64', '#c99c82', '#e2bfa6']),
  hoodie: R(['#2e4a06', '#4f7a0a', '#78b014', '#a4e02a', '#d4ff6a']),     // the hero's lime: no set uses it
  suit: R(['#08080a', '#121216', '#1e1e24', '#2c2c34']),
  teal: R(['#0c2a2a', '#164242', '#225e5a', '#327a72']),
  blazer: R(['#0e1424', '#1a2238', '#28344e', '#384664']),
  trousers: R(['#101218', '#1c2028', '#2a303a']),
  jeans: R(['#121a2c', '#203050', '#304a70']),
  skirt: R(['#1e1a22', '#2e2834', '#403848']),
  shoe: R(['#5e6068', '#a8aab0', '#e2e2e6']),
  shoeDark: R(['#141414', '#262626', '#3a3a3a']),
  apron: R(['#6a5a44', '#8e785c', '#b09878', '#cebc9a']),
  hairDark: R(['#120c0a', '#281a14', '#40281c']),
  hairBlack: R(['#0e0a0a', '#1e1614', '#33241c']),
  hairBrown: R(['#2a160c', '#4a2a16', '#6a4022']),
  hairRed: R(['#3a1408', '#6a2810', '#94401c']),
  hairGrey: R(['#5e5a62', '#8e8a92', '#bdb9c1', '#e2dfe6']),
  coatNavy: R(['#0e1424', '#1a2238', '#28344e', '#384664']),
  coatGrey: R(['#24262a', '#36393e', '#4a4e54', '#62666c']),
  coatCamel: R(['#4a3220', '#6e4c30', '#906842', '#ae8456']),
  coatMaroon: R(['#2a0e12', '#44181e', '#5e242a', '#783238']),
  coatOlive: R(['#22261a', '#343a26', '#485036', '#5e6848']),
  coatTeal: R(['#0e2424', '#183636', '#244a4a', '#346262']),
  coatPlum: R(['#22142a', '#34203e', '#483054', '#5e426c']),
  coatMustard: R(['#4a3a0c', '#6e5614', '#94741e', '#b8922c']),
  belt: R(['#1a100a', '#33200f', '#4f3218']),
  leather: R(['#2a160c', '#4a2a14', '#6e4020', '#8c5830']),
  cash: R(['#2a4a2a', '#4a7048', '#76a06c', '#a8c898']),
  paper: R(['#a8a49a', '#d4d0c4', '#f2eee2']),
  gym: R(['#3a0e14', '#6a1a22', '#962a30', '#b84440']),
  saffron: R(['#6a3a06', '#a8600a', '#e09018', '#f4b434', '#ffd878']),     // Theo's jumper: no set uses it
  saffronFade: R(['#5a4026', '#80603a', '#a68252', '#c4a46e']),
  cardigan: R(['#2a2a2e', '#3e3e44', '#56565e', '#6e6e78']),
  scarf: R(['#4a0a10', '#7a1420', '#a82430', '#cc4048']),
  cords: R(['#2a2016', '#3e3022', '#544232']),
  wood: R(['#3a1a08', '#6a3414', '#9a5422', '#c07838']),
};

// —— Body parts ——
function head(P, x, y, p, L) {
  P.ellipse(x, y, 4.4, 4.7, (X, Y, dx, dy) => L.skin(.62 - dx * .12 - dy * .28 + (dx > .55 ? -.18 : 0), X, Y));
  if (L.hairStyle === 'bun') {
    P.ellipse(x - 1.2, y - 2.6, 4.4, 2.6, (X, Y, dx, dy) => L.hair(.6 - dy * .3, X, Y));
    P.ellipse(x - 4.2, y - 1.5, 2.2, 2.2, (X, Y, dx, dy) => L.hair(.55 - dy * .3, X, Y));
    for (let yy = Math.floor(y - 2); yy < y + 2; yy++) P.set(Math.floor(x - 4), yy, L.hair(.4, 0, 0));
  } else if (L.hairStyle === 'crop') {       // very short: a flat cap of hair
    P.ellipse(x - .6, y - 3.2, 4.5, 1.8, (X, Y, dx, dy) => L.hair(.5 - dy * .3, X, Y));
    for (let yy = Math.floor(y - 3); yy < y; yy++) P.set(Math.floor(x - 4), yy, L.hair(.35, 0, 0));
  } else {
    P.ellipse(x - .8, y - 2.8, 4.6, 2.4, (X, Y, dx, dy) => L.hair(.62 - dy * .3 + ((X * 7) % 3 === 0 ? .15 : 0), X, Y));
    for (let yy = Math.floor(y - 3); yy < y + 2; yy++) P.set(Math.floor(x - 4), yy, L.hair(.35, 0, 0));
    for (let yy = Math.floor(y - 2); yy < y + 1; yy++) P.set(Math.floor(x - 3), yy, L.hair(.45, 0, 0));
    if (L.messy) { P.set(Math.round(x + 1), Math.round(y - 5.2), L.hair(.6, 0, 0)); P.set(Math.round(x - 2), Math.round(y - 5.4), L.hair(.6, 0, 0)); }
  }
  if (L.beard) P.poly([[x - 2, y + 1.5], [x + 4, y + 1], [x + 3.5, y + 4.6], [x - 1, y + 4.6]], (X, Y) => L.hair(.5 + ((X + Y) % 3 === 0 ? -.2 : 0), X, Y));
  if (L.streak) { P.set(Math.round(x + 1), Math.round(y - 4), L.streak); P.set(Math.round(x + 2), Math.round(y - 4), L.streak); P.set(Math.round(x), Math.round(y - 5), L.streak); }
  if (L.stubble) for (const [dx, dy] of [[0, 4], [2, 4], [-1, 3], [1, 4.6], [3, 3.6]]) P.set(Math.round(x + dx), Math.round(y + dy), L.skin(.22, 0, 0));
  const ex = Math.round(x + 2 + (p.look ?? 0)), ey = Math.round(y + (p.lookUp ? -1 : 0));
  if (L.shades) {                       // sunglasses: always on
    for (let i = -4; i <= 1; i++) P.set(ex + i, ey, INK);
    P.set(ex, ey - 1, INK); P.set(ex - 3, ey - 1, INK); P.set(ex + 1, ey - 1, INK); P.set(ex - 4, ey - 1, INK);
    P.set(ex, ey - 1, [70, 80, 96]);   // a glint
  } else if (p.closed || p.blink) { P.set(ex, ey, L.skin(.18, 0, 0)); P.set(ex - 3, ey, L.skin(.18, 0, 0)); if (p.closed) P.set(ex + 1, ey, L.skin(.18, 0, 0)); }
  else if (p.wide) { for (const dx of [0, -3]) { P.set(ex + dx, ey, INK); P.set(ex + dx, ey - 1, INK); P.set(ex + dx + 1, ey - 1, [240, 236, 228]); P.set(ex + dx + 1, ey, INK); } }
  else { P.set(ex, ey, INK); P.set(ex, ey - 1, INK); P.set(ex - 3, ey, INK); P.set(ex - 3, ey - 1, INK); }
  if (L.brow) { const b = p.brow ?? 0; P.set(ex, ey - 2 + b - (p.wide ? 1 : 0), L.hair(.2, 0, 0)); P.set(ex + 1, ey - 2 - (p.wide ? 1 : 0), L.hair(.2, 0, 0)); }
  if (L.glasses) { const G = [54, 50, 64]; for (let i = -4; i <= 1; i++) P.set(ex + i, ey - 2, G); P.set(ex - 4, ey - 1, G); P.set(ex + 1, ey - 1, G); P.set(ex - 2, ey - 1, [200, 210, 225]); }
  if (L.lines) { P.set(ex + 2, ey + 1, L.skin(.25, 0, 0)); P.set(ex - 4, ey + 2, L.skin(.3, 0, 0)); }
  P.set(Math.round(x + 4.2), ey + 1, L.skin(.4, 0, 0));
  if (p.smile) { P.set(ex - 2, ey + 2, INK); P.set(ex - 1, ey + 3, INK); P.set(ex, ey + 3, INK); P.set(ex + 1, ey + 2, INK); }
  else if (p.open) { P.rect(ex - 1, ey + 2, 2, 2, INK); }
  else if (p.mouth) { P.set(ex - 1, ey + 3, INK); P.set(ex, ey + 3, INK); }
  else if (p.flat) { P.set(ex - 2, ey + 3, INK); P.set(ex - 1, ey + 3, INK); P.set(ex, ey + 3, INK); }
}
// Arm as a 2-px polyline from shoulder; hand at the end
function arm(P, pts, sleeve, skin, back = false, hand = 2) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1], n = Math.max(Math.abs(bx - ax), Math.abs(by - ay), 1);
    for (let k = 0; k <= n; k++) { const x = Math.round(ax + (bx - ax) * k / n), y = Math.round(ay + (by - ay) * k / n); const s = back ? .25 : .62; P.set(x, y, sleeve(s, x, y)); P.set(x + 1, y, sleeve(s - .2, x, y)); }
  }
  const [hx, hy] = pts[pts.length - 1]; P.rect(hx, hy, hand, 2, skin(back ? .3 : .62, 0, 0));
}
const ARMS = {      // front-arm polylines relative to (CX, top) — top = shoulder row
  down: [[4, 1], [5, 5], [5, 9], [5, 11]],
  fwd: [[4, 1], [7, 3], [10, 4], [12, 4]],
  up: [[4, 0], [6, -3], [7, -7], [7, -10]],
  up2: [[4, 0], [8, -3], [10, -7], [11, -10]],
  cross: [[4, 1], [5, 5], [3, 7], [0, 7]],
  mouth: [[4, 1], [6, 5], [6, 2], [5, -2]],       // cup at the lips
  out: [[4, 1], [6, 5], [7, 9], [8, 11]],
  point: [[4, 0], [8, 1], [12, 0], [15, -1]],
  offer: [[4, 1], [8, 3], [12, 3], [14, 3]],
  hold: [[4, 1], [6, 4], [8, 6], [10, 6]],        // something held at the chest
  look: [[4, 1], [7, 5], [9, 3], [9, 0]],         // held up in front of the face
  reach: [[4, 1], [7, 5], [9, 9], [11, 13]],      // reaching down
  slap: [[4, 1], [8, 4], [12, 8], [14, 9]],       // hand flat on the table
  touch: [[4, 1], [7, 4], [7, 0], [6, -4]],       // fingers on the cheek
  bow0: [[4, 1], [8, 5], [12, 8], [14, 9]],       // bow pushed out (seated)
  bow1: [[4, 1], [6, 5], [5, 8], [4, 9]],         // bow drawn in
};
const BACK = { neck: [[-4, 1], [0, 4], [4, 1], [6, -2]], down: [[-4, 1], [-5, 5], [-5, 10]], swing: [[-4, 1], [-3, 5], [-1, 9]], out: [[-4, 1], [-6, 5], [-7, 10]], up: [[-4, 0], [-6, -3], [-7, -7], [-7, -10]], fwd: [[-4, 1], [-1, 4], [3, 5], [6, 5]] };

// Props in the hand (hx, hy = hand). E = emissive canvas
function prop(P, E, k, hx, hy) {
  if (!k) return;
  if (k === 'wallet') { P.rect(hx - 1, hy - 1, 4, 3, PAL.leather(.55, 0, 0)); P.rect(hx - 1, hy - 1, 4, 1, PAL.leather(.85, 0, 0)); }
  else if (k === 'walletOpen' || k === 'walletFull') {
    P.rect(hx - 2, hy, 6, 3, PAL.leather(.55, 0, 0)); P.rect(hx - 2, hy, 6, 1, PAL.leather(.9, 0, 0));
    if (k === 'walletFull') for (let i = 0; i < 5; i++) { const c = PAL.cash(i % 2 ? .75 : .95, 0, 0); P.set(hx - 2 + i, hy - 1, c); P.set(hx - 2 + i, hy - 2 + (i % 2), c); }
  }
  else if (k === 'note') { P.rect(hx, hy - 1, 5, 2, PAL.cash(.8, 0, 0)); P.set(hx + 2, hy - 1, PAL.cash(.2, 0, 0)); }
  else if (k === 'fan') { for (let i = 0; i < 4; i++) P.rect(hx - 1 + i, hy - 3 + (i % 2), 2, 4, PAL.cash(.6 + i * .1, 0, 0)); }
  else if (k === 'cup') { P.rect(hx, hy - 3, 3, 4, [236, 230, 218]); P.rect(hx, hy - 3, 3, 1, [96, 60, 36]); P.set(hx + 3, hy - 2, [210, 204, 192]); }
  else if (k === 'bag') { P.rect(hx - 4, hy + 2, 9, 6, PAL.gym(.55, 0, 0)); P.rect(hx - 4, hy + 2, 9, 1, PAL.gym(.85, 0, 0)); P.rect(hx - 1, hy, 2, 2, PAL.gym(.3, 0, 0)); P.rect(hx - 4, hy + 5, 9, 1, PAL.gym(.25, 0, 0)); }
  else if (k === 'form') { P.rect(hx - 1, hy - 5, 5, 6, PAL.paper(.85, 0, 0)); for (let j = 0; j < 3; j++) P.rect(hx, hy - 4 + j * 2, 3, 1, PAL.paper(.2, 0, 0)); }
  else if (k === 'coins') { P.set(hx + 1, hy - 1, [210, 190, 120]); P.set(hx + 2, hy - 1, [200, 204, 212]); P.set(hx + 1, hy - 2, [230, 210, 140]); }
  else if (k === 'phone') { P.rect(hx, hy - 3, 2, 4, [24, 24, 30]); for (const [a, b] of [[0, -3], [0, -2], [1, -3], [1, -2]]) { E.set(hx + a, hy + b, [150, 190, 255]); P.set(hx + a, hy + b, [150, 190, 255]); } }
  else if (k === 'brush') { P.rect(hx + 1, hy - 3, 1, 4, [90, 170, 220]); P.set(hx + 1, hy - 4, [240, 240, 240]); }
  else if (k === 'towel') { P.rect(hx - 2, hy - 2, 5, 8, [214, 220, 214]); P.rect(hx - 2, hy + 1, 5, 1, [150, 190, 190]); }
  else if (k === 'letter') { P.rect(hx, hy - 2, 5, 3, [236, 232, 220]); P.set(hx + 2, hy - 1, [180, 60, 50]); }
  else if (k === 'scarf') { P.rect(hx - 1, hy - 1, 5, 3, PAL.scarf(.7, 0, 0)); P.rect(hx - 1, hy + 2, 2, 3, PAL.scarf(.5, 0, 0)); }
  else if (k === 'box') { P.rect(hx - 4, hy - 4, 9, 7, [150, 112, 70]); P.rect(hx - 4, hy - 4, 9, 1, [190, 150, 98]); P.rect(hx, hy - 4, 1, 7, [118, 86, 52]); }
}

// Standing / walking figure. L = look (palettes and garment), p = pose
function figure(P, E, L, p) {
  const by = p.bob || 0, top = 17 + by;                       // shoulder row
  const garmentBot = L.long ? 46 : L.tunic ? 35 : 31;
  const st = p.step ?? -1;
  const legs = st < 0 ? [[CX - 4, 0], [CX + 1, 0]] : [[[CX - 6, 0], [CX + 3, -1]], [[CX - 3, -1], [CX, 0]], [[CX + 3, -1], [CX - 6, 0]], [[CX, 0], [CX - 3, -1]]][st];
  legs.forEach(([lx, ly], i) => {
    for (let y = garmentBot - 2; y < 47 + ly; y++) for (let x = lx; x < lx + 4; x++) P.set(x, y, L.leg((i ? .55 : .8) - (x === lx ? .25 : 0), x, y));
    P.rect(lx, 47 + ly, 5, 2, L.foot(i ? .5 : .85, 0, 0)); P.rect(lx + 1, 47 + ly, 4, 1, L.foot(.95, 0, 0));
  });
  if (p.caseBack) { P.poly([[CX - 8, top - 8], [CX - 4, top - 8], [CX - 2, top + 22], [CX - 9, top + 22]], (x, y) => PAL.cords(.75 - (x - CX + 9) * .05 + (y < top ? .1 : 0), x, y)); P.rect(CX - 7, top - 9, 2, 1, PAL.cords(.4, 0, 0)); }
  const bk = BACK[p.barm || (st >= 0 ? 'swing' : 'down')];
  arm(P, bk.map(([x, y]) => [CX + x, top + y + (st === 1 || st === 3 ? 1 : 0)]), L.top, L.skin, true);
  const shL = CX - 5, shR = CX + 5, hmL = L.long ? CX - 8 : CX - 6, hmR = L.long ? CX + 8 : CX + 6;
  P.poly([[shL, top], [shR, top], [hmR, garmentBot], [hmL, garmentBot]], (x, y) => {
    const u = (y - top) / (garmentBot - top), l = hmL * u + shL * (1 - u), r = hmR * u + shR * (1 - u), s = (x - l) / Math.max(1, r - l);
    let v = .7 - s * .42 + (1 - u) * .12;
    if (s > .8) v -= .1;
    return L.top(v, x, y);
  });
  if (L.inner) for (let y = top + 1; y < garmentBot; y++) { P.set(CX + 2, y, L.inner(.75, 0, 0)); P.set(CX + 3, y, L.inner(.55, 0, 0)); }
  if (L.lanyard) { for (let y = top; y < top + 7; y++) P.set(CX + Math.round((y - top) * .3), y, [40, 60, 120]); P.rect(CX + 2, top + 7, 3, 3, [230, 232, 236]); P.set(CX + 3, top + 8, [70, 110, 180]); }
  if (L.jeansTop) for (let y = 29 + by; y < 33; y++) for (let x = CX - 5; x < CX + 6; x++) P.set(x, y, L.leg(.7 - (x - CX + 5) * .04, x, y));
  if (L.hoodiePocket) { P.rect(CX - 2, top + 9, 7, 3, L.top(.45, 0, 0)); P.rect(CX - 2, top + 9, 7, 1, L.top(.3, 0, 0)); }
  if (L.hoodRoll) { P.ellipse(CX - 2, top - .5, 5, 2.2, (x, y, dx, dy) => L.top(.75 - dy * .3, x, y)); P.set(CX + 2, top + 2, [235, 235, 225]); P.set(CX + 2, top + 3, [235, 235, 225]); }
  if (L.tie) { for (let y = top; y < top + 5; y++) { P.set(CX + 2, y, [228, 228, 222]); P.set(CX + 3, y, [228, 228, 222]); } for (let y = top + 1; y < top + 9; y++) P.set(CX + 2 + (y > top + 6 ? 1 : 0), y, [30, 34, 60]); }
  if (L.collar) { P.set(CX + 1, top, [230, 228, 220]); P.set(CX + 3, top, [230, 228, 220]); P.set(CX + 2, top + 1, [230, 228, 220]); }
  if (L.belt) P.rect(CX - 5, top + 11, 11, 1, PAL.belt(.6, 0, 0));
  if (L.apron) P.poly([[CX - 1, top + 4], [CX + 6, top + 4], [CX + 7, garmentBot + 6], [CX - 1, garmentBot + 6]], (x, y) => PAL.apron(.6 - (x - CX) * .04, x, y));
  if (L.badge) { P.set(CX + 4, top + 4, [230, 200, 120]); P.set(CX + 4, top + 5, [200, 170, 90]); }
  head(P, CX + 1 + (L.slouch ? 1 : 0), top - 7 + (L.short ? 1 : 0) + (L.slouch ? 1 : 0), p, L);
  if (L.scarfOn) { for (let x = CX - 4; x < CX + 5; x++) { P.set(x, top, PAL.scarf(.75 - (x - CX) * .03, 0, 0)); P.set(x, top + 1, PAL.scarf(.55, 0, 0)); } for (let y = top + 2; y < top + 9; y++) { P.set(CX + 3, y, PAL.scarf(.65, 0, 0)); P.set(CX + 4, y, PAL.scarf(.45, 0, 0)); } }
  const a = ARMS[p.arm || 'down'];
  if (!p.pockets) arm(P, a.map(([x, y]) => [CX + x, top + y]), L.top, L.skin);
  else { P.rect(CX + 2, top + 1, 3, 9, L.top(.55, 0, 0)); }
  const [hx, hy] = a[a.length - 1].map((v, i) => v + (i ? top : CX));
  prop(P, E, p.hold, hx, hy);
}

// Seated (on a chair or bed edge), legs forward
function seated(P, E, L, p) {
  const top = 30 + (p.bob || 0);
  for (let y = 44; y < 48; y++) for (let x = CX - 4; x < CX + 10; x++) P.set(x, y, L.leg(.75 - (y - 44) * .12, x, y));
  for (let y = 48; y < 50; y++) for (let x = CX + 7; x < CX + 11; x++) P.set(x, y, L.leg(.5, x, y));
  P.rect(CX + 9, 48, 4, 2, L.foot(.85, 0, 0));
  if (!p.cello) arm(P, BACK.down.map(([x, y]) => [CX + x - 1, top + y + 2]), L.top, L.skin, true);
  P.poly([[CX - 5, top], [CX + 5, top], [CX + 6, 46], [CX - 6, 46]], (x, y) => L.top(.68 - (x - CX + 5) * .035, x, y));
  if (L.inner) for (let y = top + 1; y < 44; y++) { P.set(CX + 2, y, L.inner(.75, 0, 0)); P.set(CX + 3, y, L.inner(.55, 0, 0)); }
  if (L.hoodRoll) P.ellipse(CX - 2, top - .5, 5, 2.2, (x, y, dx, dy) => L.top(.75 - dy * .3, x, y));
  if (L.hoodiePocket) { P.rect(CX - 2, top + 9, 7, 3, L.top(.45, 0, 0)); }
  head(P, CX + 1 + (p.slump ? 1 : 0), top - 7 + (p.slump ? 3 : 0), p, L);
  if (L.scarfOn) for (let x = CX - 4; x < CX + 5; x++) { P.set(x, top, PAL.scarf(.7, 0, 0)); P.set(x, top + 1, PAL.scarf(.5, 0, 0)); }
  if (p.cello) {      // the cello between the knees, scroll above the shoulder; then the left hand on the neck
    const W2 = PAL.wood;
    for (let y = 21; y < 34; y++) { P.set(CX + 8, y, [30, 20, 14]); P.set(CX + 9, y, [48, 32, 20]); }
    P.rect(CX + 8, 19, 2, 2, W2(.4, 0, 0)); P.set(CX + 10, 19, W2(.6, 0, 0));
    P.ellipse(CX + 9, 37, 4.2, 3.6, (x, y, dx) => W2(.7 - dx * .25, x, y)); P.ellipse(CX + 9, 43, 5, 4.4, (x, y, dx) => W2(.66 - dx * .25, x, y));
    P.set(CX + 8, 40, [20, 12, 8]); P.set(CX + 10, 40, [20, 12, 8]); for (let y = 36; y < 46; y++) P.set(CX + 9, y, W2(.95, 0, 0));
    P.set(CX + 9, 48, [60, 60, 66]); P.set(CX + 9, 49, [60, 60, 66]);
    arm(P, BACK.neck.map(([x, y]) => [CX + x, top + y]), L.top, L.skin, false);
  }
  const a = ARMS[p.arm || 'down'];
  arm(P, a.map(([x, y]) => [CX + x, top + y]), L.top, L.skin);
  if (p.cello && p.arm && p.arm.startsWith('bow')) { const [bx, byy] = a[a.length - 1].map((v, i) => v + (i ? top : CX)); const x0 = bx - (p.arm === 'bow0' ? 11 : 2), x1 = bx + (p.arm === 'bow0' ? 2 : 11); P.line(x0, byy + 1, x1, byy, [214, 196, 160]); P.line(x0, byy, x1, byy - 1, [60, 36, 20]); }
  const [hx, hy] = a[a.length - 1].map((v, i) => v + (i ? top : CX));
  prop(P, E, p.hold, hx, hy);
}
// Rotate a standing drawing 90° to lie on the back (head left)
function lying(P, E, L, p) {
  const T = new PX(FW, FH), TE = new PX(FW, FH);
  figure(T, TE, L, { ...p, arm: 'down', hold: null });
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) { const c = T.get(x, y); if (!c) continue; const nx = y + 2, ny = 48 - (x - (CX - 8)); if (ny >= 0 && ny < FH) P.set(nx, ny, [c[0], c[1], c[2]]); }
}

// —— Looks ——
export const LOOKS = {
  theo: { skin: PAL.skinHero, hair: PAL.hairDark, messy: 1, top: PAL.saffron, leg: PAL.jeans, foot: PAL.shoe, jeansTop: 1, brow: 1 },
  theoS: { skin: PAL.skinHero, hair: PAL.hairDark, messy: 1, top: PAL.saffron, leg: PAL.jeans, foot: PAL.shoe, jeansTop: 1, brow: 1, scarfOn: 1 },
  fut0: { skin: PAL.skinHero, hair: PAL.hairDark, hairStyle: 'crop', top: PAL.cardigan, inner: PAL.saffronFade, leg: PAL.trousers, foot: PAL.shoeDark, lanyard: 1, glasses: 1, stubble: 1, slouch: 1, brow: 1 },
  fut0b: { skin: PAL.skinHero, hair: PAL.hairDark, hairStyle: 'crop', top: PAL.cardigan, inner: PAL.saffronFade, leg: PAL.trousers, foot: PAL.shoeDark, lanyard: 1, glasses: 1, stubble: 1, brow: 1 },
  fut1: { skin: PAL.skinHero, hair: PAL.hairDark, top: PAL.saffron, leg: PAL.jeans, foot: PAL.shoe, jeansTop: 1, stubble: 1, brow: 1 },
  fut2: { skin: PAL.skinHero, hair: PAL.hairDark, messy: 1, streak: [150, 146, 156], top: PAL.saffron, leg: PAL.cords, foot: PAL.shoeDark, beard: 1, scarfOn: 1, brow: 1 },
  fut3: { skin: PAL.skinHero, hair: PAL.hairGrey, messy: 1, top: PAL.saffron, leg: PAL.cords, foot: PAL.shoeDark, beard: 1, glasses: 1, lines: 1, scarfOn: 1, brow: 1 },
  nan: { skin: PAL.skinOld, hair: PAL.hairGrey, hairStyle: 'bun', top: PAL.coatPlum, leg: PAL.skirt, foot: PAL.shoeDark, tunic: 1, short: 1, glasses: 1, lines: 1, brow: 1 },
  t1: { skin: PAL.skinPale, hair: PAL.hairBrown, top: PAL.coatNavy, leg: PAL.trousers, foot: PAL.shoeDark, long: 1, belt: 1 },
  t2: { skin: PAL.skinDeep, hair: PAL.hairBlack, top: PAL.coatCamel, leg: PAL.jeans, foot: PAL.shoeDark, long: 1 },
  t3: { skin: PAL.skinOld, hair: PAL.hairGrey, hairStyle: 'crop', top: PAL.coatGrey, leg: PAL.trousers, foot: PAL.shoeDark, long: 1, brow: 1 },
  t4: { skin: PAL.skinOlive, hair: PAL.hairRed, hairStyle: 'bun', top: PAL.coatMaroon, leg: PAL.skirt, foot: PAL.shoeDark, long: 1, short: 1 },
  t5: { skin: PAL.skinHero, hair: PAL.hairDark, top: PAL.coatOlive, leg: PAL.jeans, foot: PAL.shoe, jeansTop: 1 },
  t6: { skin: PAL.skinPale, hair: PAL.hairGrey, hairStyle: 'bun', top: PAL.coatPlum, leg: PAL.skirt, foot: PAL.shoeDark, long: 1, short: 1 },
  t7: { skin: PAL.skinDeep, hair: PAL.hairBlack, top: PAL.coatTeal, leg: PAL.trousers, foot: PAL.shoeDark, long: 1, beard: 1 },
  t8: { skin: PAL.skinOlive, hair: PAL.hairBrown, top: PAL.coatMustard, leg: PAL.jeans, foot: PAL.shoe, jeansTop: 1, beard: 1 },
};

const BASE = {
  idle0: {}, idle1: { bob: 1 }, blink: { blink: 1 },
  w0: { step: 0 }, w1: { step: 1, bob: -1 }, w2: { step: 2 }, w3: { step: 3, bob: -1 },
};
const walkWith = (o, pre) => Object.fromEntries([0, 1, 2, 3].map(i => [pre + i, { step: i, bob: i % 2 ? -1 : 0, ...o }]));
// One table for Theo and every reflection: the man in the glass mimics by frame name
export const TABLES = {
  hero: {
    ...BASE, ...walkWith({ caseBack: 1 }, 'wc'), ...walkWith({ arm: 'hold', hold: 'box' }, 'wx'),
    smile: { smile: 1 }, smileBlink: { smile: 1, blink: 1 }, flat: { flat: 1 }, flatBlink: { flat: 1, blink: 1 },
    wide: { wide: 1, open: 1 }, stare: { wide: 1 }, yawn: { arm: 'mouth', closed: 1, open: 1 },
    wave: { arm: 'up', mouth: 1 }, wave2: { arm: 'up2', mouth: 1 }, waveS: { arm: 'up', smile: 1 }, waveS2: { arm: 'up2', smile: 1 },
    touch: { arm: 'touch', look: 1 }, left: { arm: 'up', flat: 1 }, lean: { arm: 'fwd', look: 1, wide: 1 },
    phone: { arm: 'look', hold: 'phone', flat: 1 }, brush: { arm: 'mouth', hold: 'brush' },
    talk: { arm: 'fwd', mouth: 1 }, talkO: { arm: 'out', barm: 'out', open: 1 }, knock: { arm: 'fwd' }, worry: { brow: 1, open: 1 }, worryF: { brow: 1, flat: 1 },
    call: { arm: 'up2', barm: 'up', open: 1 }, shrug: { arm: 'out', barm: 'out', open: 1 },
    sit: { kind: 'sit' }, sitBlink: { kind: 'sit', blink: 1 }, sitSmile: { kind: 'sit', smile: 1 }, sitFlat: { kind: 'sit', flat: 1 }, sitTalk: { kind: 'sit', arm: 'fwd', mouth: 1 },
    play0: { kind: 'sit', cello: 1, arm: 'bow0', closed: 1 }, play1: { kind: 'sit', cello: 1, arm: 'bow1', closed: 1 }, play0o: { kind: 'sit', cello: 1, arm: 'bow0' }, play1o: { kind: 'sit', cello: 1, arm: 'bow1' }, playRest: { kind: 'sit', cello: 1, arm: 'down', smile: 1 },
    towel: { arm: 'up2', hold: 'towel' }, letter: { arm: 'offer', hold: 'letter' }, box: { arm: 'hold', hold: 'box' }, scarfGet: { arm: 'offer', hold: 'scarf', smile: 1 },
    caseIdle: { caseBack: 1 }, caseBlink: { caseBack: 1, blink: 1 }, caseSmile: { caseBack: 1, smile: 1 },
    reach: { arm: 'reach', bob: 2 },
  },
  nan: { ...BASE, talk: { arm: 'fwd', mouth: 1 }, smile: { smile: 1 }, smileBlink: { smile: 1, blink: 1 }, cup: { arm: 'hold', hold: 'cup' }, cupTalk: { arm: 'hold', hold: 'cup', mouth: 1 }, call: { arm: 'up', open: 1 }, call2: { arm: 'up2', smile: 1 },
    scarf: { arm: 'offer', hold: 'scarf', smile: 1 }, scarfTalk: { arm: 'offer', hold: 'scarf', mouth: 1 }, cross: { arm: 'cross' }, cross1: { arm: 'cross', bob: 1 }, worry: { brow: 1, flat: 1 } },
  folk: { ...BASE, cross: { arm: 'cross' }, point: { arm: 'point', mouth: 1 }, up: { arm: 'up', open: 1 }, sit: { kind: 'sit' }, cheer: { arm: 'up2', barm: 'up', smile: 1 }, lean: { arm: 'fwd' } },
};

function draw(P, E, L, p) {
  if (p.kind === 'sit') return seated(P, E, L, p);
  if (p.kind === 'lie') return lying(P, E, L, p);
  return figure(P, E, L, p);
}

export function atlas(table, L) {
  const names = Object.keys(table), n = names.length;
  const P = new PX(FW * n, FH), E = new PX(FW * n, FH);
  names.forEach((k, i) => {
    const p1 = new PX(FW, FH), e1 = new PX(FW, FH);
    draw(p1, e1, L, table[k]); p1.outline(.3);
    for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) { const c = p1.get(x, y); if (c) P.set(i * FW + x, y, c); const e = e1.get(x, y); if (e) E.set(i * FW + x, y, e); }
  });
  const tex = texOf(P.done()), em = texOf(E.done());
  for (const t of [tex, em]) t.repeat.set(1 / n, 1);
  return { tex, em, names, n, canvas: P.c };
}

const _AT = {};   // one atlas per (kind, look); every character gets its own texture view of it
export function makeChar(kind, look = kind, o = {}) {
  const TB = TABLES[kind], key = kind + ':' + look, A0 = _AT[key] || (_AT[key] = atlas(TB, LOOKS[look] ?? LOOKS.theo));
  const A = { ...A0, tex: A0.tex.clone(), em: A0.em.clone() }; A.tex.needsUpdate = A.em.needsUpdate = true;
  const mesh = billboard(A.tex, FW * SPX, FH * SPX, { em: A.em, emCol: '#ffffff', emI: 2.4 });
  const root = new THREE.Group(); root.add(mesh); root.userData.char = o.tag ?? kind;
  const sh = blob(.42, .5); sh.position.y = .015; root.add(sh);
  let cur = TB.idle0 ? 'idle0' : A.names[0];
  return {
    root, mesh, atlas: A, shadowBlob: sh,
    get cur() { return cur; },
    frame(name) { const i = A.names.indexOf(name); if (i < 0) throw new Error(kind + ' frame ' + name); cur = name; A.tex.offset.x = A.em.offset.x = i / A.n; },
    face(cam, flip = false, lean = 0) {
      root.rotation.set(0, 0, 0); root.rotation.order = 'YXZ';
      root.rotation.y = Math.atan2(cam.position.x - root.position.x, cam.position.z - root.position.z); root.rotation.x = -lean;
      mesh.scale.x = flip ? -1 : 1;
    },
    // world position of the hand (for the wallet's glow)
    handPos(flip = false) {
      const p = TB[cur] || {}, a = ARMS[p.arm || 'hold'], hx = CX + a[a.length - 1][0] + 1, top = (p.kind === 'sit' ? 30 : 17) + (p.bob || 0), hy = top + a[a.length - 1][1] - 1;
      const v = new THREE.Vector3((hx - FW / 2) * SPX * (flip ? -1 : 1), (FH - hy) * SPX, .06);
      v.applyEuler(root.rotation); return v.add(root.position);
    },
  };
}
