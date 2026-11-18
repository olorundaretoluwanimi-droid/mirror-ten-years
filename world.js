// The world of "What If Your Mirror Showed You in 10 Years?": one scene, many dioramas.
// Larkfield (Main Street, Theo's building, the roofs, the railway) for the wides; cut-away interiors far east of town:
// the bathroom with its mirror room (a mirror-image copy behind a hole in the wall: the reflection is a real set,
// so the future can differ from the present), the flat, Nan's flat, the audition hall, the seaside bathroom and Port Alder.
import * as THREE from 'three';
import { PX, ramp, h2, fbm, texOf, glow } from './px.js';
import { box, mat } from './kit.js';
import { sky, stars, sea, flick } from './fx.js';
import { cmats, Windows, building, shopFront, lampPost, car, tram, bed, sign, solid } from './city_art.js';
import { cardboard, pendant, table, chair } from './props.js';
import { makeChar } from './chars.js';
import { T, HABIT } from './story.js';
import { track, seg, ss, lerp, clamp, mulberry } from '/core/lib.js';

const C = c => new THREE.Color(c);
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const stdM = o => new THREE.MeshStandardMaterial({ roughness: .85, ...o });
const TT = (w, h, f) => { const P = new PX(w, h); P.fill(f); return P.done(); };

// —— Light keys: each set owns one ——
const KEYS = {
  dark: { top: '#05070c', mid: '#0a0e16', hor: '#121822', sun: '#506080', sunI: .05, sunDir: [-10, 30, 20], hemiS: '#2a3446', hemiG: '#06070a', hemiI: .22, fog: '#0a0e16', fogD: .03, exp: 1.35, moon: 0 },
  bath: { top: '#2a3446', mid: '#5a6a80', hor: '#a8b0c0', sun: '#c8d4ff', sunI: .45, sunDir: [-20, 30, 26], hemiS: '#7a8aa4', hemiG: '#1a1c22', hemiI: .9, fog: '#2a3442', fogD: .02, exp: 1.3, moon: 0 },
  flatN: { top: '#05070c', mid: '#0c1220', hor: '#1a2234', sun: '#7a8ab0', sunI: .2, sunDir: [-20, 30, 26], hemiS: '#4a5878', hemiG: '#14141c', hemiI: 1.1, fog: '#121826', fogD: .02, exp: 1.35, moon: 0 },
  flatD: { top: '#3a5070', mid: '#8aa0b8', hor: '#e0dccc', sun: '#ffe8cc', sunI: 1.1, sunDir: [-20, 30, 26], hemiS: '#b0b8c8', hemiG: '#3a3430', hemiI: 1.2, fog: '#8a8a88', fogD: .015, exp: 1.12, moon: 0 },
  nan: { top: '#1a120c', mid: '#3a2a1e', hor: '#6a4a30', sun: '#ffd0a0', sunI: .3, sunDir: [20, 30, 26], hemiS: '#a08060', hemiG: '#2a1a10', hemiI: 1.0, fog: '#3a2a1e', fogD: .02, exp: 1.25, moon: 0 },
  morning: { top: '#46689a', mid: '#90b0d4', hor: '#f0e2c8', sun: '#fff0d8', sunI: 2.3, sunDir: [30, 30, 34], hemiS: '#b0c4e0', hemiG: '#4a4030', hemiI: 1.2, fog: '#c4c8c8', fogD: .0045, exp: 1.05, moon: .2 },
  dawnT: { top: '#3a4a7a', mid: '#a890b0', hor: '#ffc8a8', sun: '#ffd0b0', sunI: 1.4, sunDir: [40, 12, 30], hemiS: '#c0a8c8', hemiG: '#3a3034', hemiI: 1.4, fog: '#b8a0a8', fogD: .005, exp: 1.3, moon: .5 },
  night: { top: '#03050c', mid: '#0b1428', hor: '#1e2c46', sun: '#8ea8e0', sunI: .7, sunDir: [-20, 34, 16], hemiS: '#3a4c7a', hemiG: '#0a0c14', hemiI: 1.5, fog: '#101a2e', fogD: .006, exp: 1.45, moon: .3 },
  hall: { top: '#050404', mid: '#0a0806', hor: '#140e0a', sun: '#806050', sunI: .05, sunDir: [10, 30, 20], hemiS: '#3a2a20', hemiG: '#050404', hemiI: .45, fog: '#0c0806', fogD: .03, exp: 1.3, moon: 0 },
  seaIn: { top: '#4a8ac0', mid: '#a0cce4', hor: '#f0f4e8', sun: '#fff6e4', sunI: 1.2, sunDir: [-24, 34, 30], hemiS: '#a8c4d4', hemiG: '#4a4a44', hemiI: 1.0, fog: '#a8c0c8', fogD: .01, exp: .9, moon: 0 },
  sea: { top: '#4a8ac0', mid: '#a0cce4', hor: '#f0f4e8', sun: '#fff6e4', sunI: 2.4, sunDir: [-24, 34, 30], hemiS: '#c8e0ec', hemiG: '#6a6a60', hemiI: 1.9, fog: '#c8dce0', fogD: .008, exp: 1.05, moon: 0 },
};
function mixKey(a, b, k) {
  const A = KEYS[a], B = KEYS[b], o = {};
  for (const n in A) { if (typeof A[n] === 'number') o[n] = lerp(A[n], B[n], k); else if (Array.isArray(A[n])) o[n] = A[n].map((v, i) => lerp(v, B[n][i], k)); else o[n] = C(A[n]).lerp(C(B[n]), k); }
  return o;
}

// —— Pixel materials for the interiors ——
function tiles(cols, grout, q = 8, seed = 1) {
  const R = ramp(cols, .45), G = ramp(grout, .45);
  return mat(TT(48, 48, (x, y) => (x % q === 0 || y % q === 0) ? G(.5, x, y) : R(.5 + (h2(Math.floor(x / q), Math.floor(y / q), seed) - .5) * .3 + (x % q === 1 || y % q === 1 ? .14 : 0) + (fbm(x * .2, y * .2, seed) - .5) * .18, x, y)));
}
const wallpaper = (cols, seed) => { const R = ramp(cols, .45); return mat(TT(48, 48, (x, y) => R(.5 + ((x + (y >> 3) * 4) % 12 < 2 ? .18 : 0) + (fbm(x * .15, y * .15, seed) - .5) * .2, x, y))); };
const lino = (cols, seed) => { const R = ramp(cols, .45); return mat(TT(48, 48, (x, y) => R(.45 + (((x >> 3) + (y >> 3)) % 2 ? .18 : 0) + (h2(x, y, seed) - .5) * .12, x, y))); };
const porcelain = () => solid(['#9aa4a8', '#c4ccce', '#e2e8e8', '#f6f8f6'], 61);
const MAT = {};
function mats2() {
  if (MAT.ok) return MAT;
  MAT.tealTile = tiles(['#1e3a3c', '#2a5052', '#3a6a6a', '#4e8482'], ['#7a8a86', '#94a29e'], 6, 3);
  MAT.greyTile = tiles(['#3a4044', '#4c5458', '#60686c', '#767e82'], ['#8a8e8c', '#a2a6a4'], 6, 7);
  MAT.whiteTile = tiles(['#b8c4c4', '#ccd6d4', '#dfe6e2', '#eef2ec'], ['#9aa6a4', '#b4bebc'], 6, 5);
  MAT.lino = lino(['#2a2e30', '#3a3e40', '#4c5052'], 9); MAT.linoW = lino(['#8a9494', '#a6b0ae', '#c2cac8'], 11);
  MAT.porc = porcelain();
  MAT.flatWall = wallpaper(['#4a4a52', '#5c5c66', '#70707a', '#84848e'], 13);
  MAT.nanWall = wallpaper(['#5a3a2a', '#744a34', '#8e5e40', '#a8744e'], 17);
  MAT.curtain = solid(['#2a080c', '#420e14', '#5c1820', '#76242a'], 19);
  MAT.caseM = solid(['#1a120c', '#2a1c12', '#3c2a1a', '#4e3824'], 23);
  MAT.celloM = solid(['#3a1a08', '#6a3414', '#9a5422', '#c07838'], 29);
  MAT.lining = solid(['#3a0a10', '#5a1420', '#7a2030'], 31);
  MAT.towel = solid(['#7a8a84', '#94a49c', '#aebeb6', '#c8d6ce'], 37); MAT.towelW = solid(['#a8aca4', '#c4c8be', '#dcdfd6', '#eef0e8'], 39);
  MAT.metal = cmats().metal; MAT.wood = cmats().wood;
  MAT.ok = true; return MAT;
}

// —— Props ——
function celloProp() {
  const g = new THREE.Group(), m = mats2().celloM;
  const lo = box(.42, .4, .16, m); lo.position.y = .08; g.add(lo);
  const up = box(.34, .32, .15, m); up.position.y = .5; g.add(up);
  const neck = box(.05, .5, .05, cmats().dark); neck.position.y = .82; g.add(neck);
  const scroll = box(.07, .08, .07, m); scroll.position.y = 1.32; g.add(scroll);
  const pin = box(.02, .1, .02, cmats().metal); g.add(pin);
  return g;
}
function celloCase() {   // standing, shut; lid and lining for the open state are separate pieces
  const g = new THREE.Group(), M = mats2();
  const body = new THREE.Group(); g.add(body);
  const b1 = box(.46, .62, .26, M.caseM); body.add(b1); const b2 = box(.36, .5, .24, M.caseM); b2.position.y = .62; body.add(b2); const b3 = box(.16, .3, .2, M.caseM); b3.position.y = 1.12; body.add(b3);
  const strap = box(.04, .9, .02, cmats().dark); strap.position.set(.12, .2, .14); body.add(strap);
  g.userData.body = body; return g;
}
function celloCaseOpen() {   // lying on the floor, lid open, the cello beside it
  const g = new THREE.Group(), M = mats2();
  const tray = box(.46, .12, 1.36, M.caseM); g.add(tray);
  const lin = box(.38, .02, 1.26, M.lining, { cast: false }); lin.position.y = .12; g.add(lin);
  const lid = box(.46, .05, 1.36, M.caseM); lid.position.set(-.23, .12, 0); lid.geometry.translate(-.23, 0, 0); lid.rotation.z = 1.25; lid.position.x = -.23; g.add(lid);
  const c = celloProp(); c.position.set(.5, 0, .1); c.rotation.z = -.12; g.add(c);
  return g;
}
function plant(scale = 1, seed = 1) {
  const g = new THREE.Group(), pot = new THREE.Mesh(new THREE.CylinderGeometry(.13 * scale, .1 * scale, .22 * scale, 8).translate(0, .11 * scale, 0), solid(['#5a2a1a', '#7a3a24', '#9a4e30'], 41));
  pot.castShadow = true; g.add(pot);
  const R = mulberry(seed), lm = solid(['#14301a', '#1e4a24', '#2e6a30', '#46883e'], 43);
  for (let i = 0; i < 6; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(.12 * scale, 6, 4), lm); l.position.set((R() - .5) * .22 * scale, (.28 + R() * .3) * scale, (R() - .5) * .22 * scale); l.scale.y = 1.3; l.castShadow = true; g.add(l); }
  return g;
}
function picture(w, h, draw) { const c = TT(Math.round(w * 40), Math.round(h * 40), draw); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), stdM({ map: texOf(c) })); return m; }
// The postcard from Port Alder: sea, a hall with a green dome, the name
function posterTex(crossed) {   // PORT ALDER / ORCHESTRA / AUDITIONS, and in the future that gave up: a red X
  const P = new PX(21, 28), bg = ramp(['#0e2a3c', '#123a52', '#1a4a66'], .45);
  P.fill((x, y) => bg(.5 + (h2(x, y, 9) - .5) * .25, x, y));
  for (const [y, w, c] of [[3, 15, [240, 230, 200]], [6, 11, [240, 230, 200]], [10, 13, [216, 200, 144]], [17, 15, [255, 208, 112]], [19, 9, [255, 208, 112]]]) for (let x = 0; x < w; x++) if ((x * 7 + y) % 5) P.set(3 + x, y, c);
  P.rect(8, 12, 5, 3, [80, 140, 110]); P.rect(9, 11, 3, 1, [80, 140, 110]);
  for (let y = 22; y < 25; y++) for (let x = 4; x < 17; x += 2) P.set(x, y, [150, 170, 190]);
  if (crossed) for (let i = 0; i < 26; i++) { const x = Math.round(1 + i * 18 / 25), y = 1 + i; for (const d of [0, 1]) { P.set(x + d, y, [200, 30, 30]); P.set(19 - x + d, y, [200, 30, 30]); } }
  return texOf(P.done());
}
function postcardTex() {
  const P = new PX(40, 28), sky_ = ramp(['#7ab0d8', '#a8d0ea', '#d8ecf4'], .45), seaR = ramp(['#1a4a6a', '#2a6a8a', '#4a8aa8'], .45);
  P.fill((x, y) => { const b = Math.min(x, y, 39 - x, 27 - y); if (b < 1) return [236, 230, 214]; if (y < 15) return sky_(1 - y / 15, x, y); return seaR(.4 + (h2(x, y, 3) - .5) * .4 + ((x + y * 3) % 7 === 0 ? .3 : 0), x, y); });
  P.rect(16, 9, 12, 6, [214, 204, 186]); P.rect(18, 6, 8, 3, [80, 140, 110]); P.rect(21, 4, 2, 2, [80, 140, 110]); for (let i = 0; i < 4; i++) P.rect(17 + i * 3, 11, 1, 3, [120, 100, 80]);
  P.rect(4, 12, 6, 3, [170, 90, 70]); P.rect(30, 11, 6, 4, [200, 180, 140]);
  const t = texOf(P.done()); return t;
}

// —— The bathroom: a cut-away box. Local frame: floor centre at the origin, mirror wall at x = +1.5 ——
const BW = 3.0, BD = 2.6, BH = 2.7, TH = .16, HOLE = { z0: -.65, z1: .25, y0: 1.0, y1: 2.0 };
const HOLE_C = V3(BW / 2, (HOLE.y0 + HOLE.y1) / 2, (HOLE.z0 + HOLE.z1) / 2);
function bathroom(o) {
  const M = mats2(), g = new THREE.Group(), wall = o.wall, R = {};
  const fl = box(BW + 2 * TH, .1, BD + TH, o.floor, { cast: false }); fl.position.set(0, -.1, -TH / 2); g.add(fl);
  const bk = box(BW + 2 * TH, BH, TH, wall); bk.position.set(0, 0, -BD / 2 - TH / 2); g.add(bk);
  const lw = box(TH, BH, BD, wall); lw.position.set(-BW / 2 - TH / 2, 0, 0); g.add(lw);
  if (!o.noRight) {
    const x = BW / 2 + TH / 2, H = HOLE;
    const a = box(TH, H.y0, BD, wall); a.position.set(x, 0, 0); g.add(a);
    const b = box(TH, BH - H.y1, BD, wall); b.position.set(x, H.y1, 0); g.add(b);
    const c = box(TH, H.y1 - H.y0, H.z0 + BD / 2, wall); c.position.set(x, H.y0, (-BD / 2 + H.z0) / 2); g.add(c);
    const d = box(TH, H.y1 - H.y0, BD / 2 - H.z1, wall); d.position.set(x, H.y0, (H.z1 + BD / 2) / 2); g.add(d);
    // the mirror frame and the glass sheen
    const fm = solid(['#5a4a30', '#8a7244', '#b89a5a', '#dcc07a'], 47);
    for (const [w, h, y, z] of [[.06, .06, H.y0 - .06, (H.z0 + H.z1) / 2], [.06, .06, H.y1, (H.z0 + H.z1) / 2]]) { const f = box(w, h, H.z1 - H.z0 + .12, fm, { cast: false }); f.position.set(BW / 2 - .02, y, z); g.add(f); }
    for (const z of [H.z0 - .03, H.z1 + .03]) { const f = box(.06, H.y1 - H.y0 + .12, .06, fm, { cast: false }); f.position.set(BW / 2 - .02, H.y0 - .06, z); g.add(f); }
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(H.z1 - H.z0, H.y1 - H.y0), new THREE.MeshBasicMaterial({ color: '#9fc4cc', transparent: true, opacity: .07, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    gl.rotation.y = -Math.PI / 2; gl.position.set(BW / 2 - .005, (H.y0 + H.y1) / 2, (H.z0 + H.z1) / 2); g.add(gl); R.glass = gl;
    const towel = box(.05, 1.25, 1.2, M.towelW); towel.position.set(BW / 2 - .05, .86, (H.z0 + H.z1) / 2); g.add(towel); towel.visible = false; R.cover = towel;
  }
  if (o.ceil) { const c = box(BW + 2 * TH, .12, BD + TH, wall, { cast: false }); c.position.set(0, BH, -TH / 2); g.add(c); R.ceil = c; }
  if (o.front) { const f = box(BW + 2 * TH, BH + .12, TH, o.frontM ?? wall); f.position.set(0, 0, BD / 2 + TH / 2); g.add(f); R.front = f; }
  // sink, tap, shelf, cup
  const ped = box(.26, .74, .26, M.porc); ped.position.set(BW / 2 - .3, 0, HOLE_C.z); g.add(ped);
  const basin = box(.5, .16, .44, M.porc); basin.position.set(BW / 2 - .28, .74, HOLE_C.z); g.add(basin);
  const tap = box(.05, .14, .05, cmats().rail); tap.position.set(BW / 2 - .1, .9, HOLE_C.z); g.add(tap);
  const shelf = box(.14, .03, .8, M.porc, { cast: false }); shelf.position.set(BW / 2 - .07, HOLE.y0 - .14, HOLE_C.z); g.add(shelf);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(.035, .03, .1, 8).translate(0, .05, 0), stdM({ color: o.cupCol ?? '#5a9ac8' })); cup.position.set(BW / 2 - .08, HOLE.y0 - .11, HOLE_C.z + .3); cup.castShadow = true; g.add(cup); R.cup = cup;
  // bath along the back wall
  const bath = box(1.6, .52, .72, M.porc); bath.position.set(-.6, 0, -BD / 2 + .38); g.add(bath);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(1.44, .56), stdM({ color: '#8a9ea4', roughness: .3 })); water.rotation.x = -Math.PI / 2; water.position.set(-.6, .5, -BD / 2 + .38); g.add(water);
  // towel rail (left wall), window (back wall)
  const rail = box(.04, .04, .7, cmats().rail, { cast: false }); rail.position.set(-BW / 2 + .06, 1.25, .45); g.add(rail);
  const tw = box(.05, .62, .5, o.towel ?? M.towel); tw.position.set(-BW / 2 + .07, .64, .45); g.add(tw); R.towel = tw;
  const win = new THREE.Mesh(new THREE.PlaneGeometry(.7, .55), new THREE.MeshBasicMaterial({ color: C(o.winCol ?? '#9fb0c8') })); win.position.set(o.winX ?? -.2, 1.85, -BD / 2 + .005); g.add(win); R.win = win;
  const wf = box(.8, .06, .08, cmats().paint, { cast: false }); wf.position.set(o.winX ?? -.2, 1.55, -BD / 2 + .04); g.add(wf);
  // the bulb on its cord (moved by the swing)
  const bulbG = new THREE.Group(); g.add(bulbG); bulbG.position.set(0, BH + .2, .1);
  const cord = box(.015, .5, .015, cmats().dark, { cast: false }); cord.position.y = -.5; bulbG.add(cord);
  const sock = box(.06, .07, .06, cmats().dark, { cast: false }); sock.position.y = -.57; bulbG.add(sock);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.06, 8, 6), new THREE.MeshBasicMaterial({ color: C('#3a3428') })); bulb.position.y = -.62; bulbG.add(bulb);
  const pull = box(.006, .9, .006, cmats().paint, { cast: false }); pull.position.set(.4, BH - .9, .5); g.add(pull);
  R.bulbG = bulbG; R.bulb = bulb;
  // the cello case in the back-left corner (shut), the open case, the lanyard on its hook, the postcard, moving boxes
  const cs = celloCase(); cs.position.set(-BW / 2 + .32, 0, -BD / 2 + .95); cs.rotation.set(0, .5, .06); g.add(cs); R.case = cs;
  const co = celloCaseOpen(); co.position.set(-BW / 2 + .5, 0, .35); co.rotation.y = .1; g.add(co); co.visible = false; R.caseOpen = co;
  const hook = new THREE.Group(); g.add(hook); hook.position.set(-BW / 2 + .02, 1.5, -.35);
  const strap = box(.01, .4, .02, stdM({ color: '#284c90' }), { cast: false }); strap.position.y = -.4; hook.add(strap);
  const card = box(.01, .12, .09, stdM({ color: '#e8eaee', emissive: C('#e8eaee'), emissiveIntensity: .15 }), { cast: false }); card.position.y = -.52; hook.add(card); R.badge = hook;
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(.4, .54), stdM({ map: posterTex(true), emissive: C('#ffffff'), emissiveMap: posterTex(true), emissiveIntensity: .12 })); sheet.position.set(-BW / 2 + .01, 1.3, -.55); sheet.rotation.y = Math.PI / 2; g.add(sheet); R.sheet = sheet; sheet.visible = false;
  const pc = new THREE.Mesh(new THREE.PlaneGeometry(.2, .14), stdM({ map: postcardTex(), emissive: C('#ffffff'), emissiveMap: postcardTex(), emissiveIntensity: .25 })); pc.rotation.y = -Math.PI / 2; pc.rotation.x = .08; g.add(pc); pc.visible = false; R.postcard = pc;
  const boxes = new THREE.Group(); g.add(boxes); boxes.visible = false; R.boxes = boxes;
  [[.5, .4, .5, -.4, .3, 5], [.4, .35, .45, -.9, .35, 6], [.45, .3, .4, -.6, -.1, 7]].forEach(([w, h, d, x, z, s]) => { const b = cardboard(w, h, d, s); b.position.set(x, 0, z); boxes.add(b); });
  if (o.plant) { const p = plant(1.1, 3); p.position.set(-BW / 2 + .3, .52, -BD / 2 + .2); g.add(p); R.plant = p; }
  g.userData = R; return g;
}

export function buildWorld() {
  const M = cmats(), M2 = mats2(), scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#101a2e', .006);
  const SK = sky(); scene.add(SK.mesh);
  const ST = stars(500, 11); scene.add(ST);
  const sun = new THREE.DirectionalLight('#ffffff', 1); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera; sc.left = -26; sc.right = 26; sc.top = 20; sc.bottom = -20; sc.near = 1; sc.far = 200; sun.shadow.bias = -.0006; sun.shadow.normalBias = .02;
  const sunT = new THREE.Object3D(); scene.add(sunT); sun.target = sunT; scene.add(sun);
  const hemi = new THREE.HemisphereLight('#ffffff', '#222222', 1); scene.add(hemi);
  const W = new Windows(5000); scene.add(W.mesh);
  const R = mulberry(81);

  // ================= Larkfield =================
  const HB = { x: 13, z: -11.4, w: 10, d: 12, floors: 4 }, RH = 3.6 + 3.1 * (HB.floors - 1);
  const NB = { x: 26, w: 14, floors: 5 };   // Nan's building, next door (her balcony looks over Theo's roof)
  const ROOF = V3(HB.x - 1.5, RH + .3, HB.z + 1.0);
  const popT = p => { const d = Math.hypot(p[0] - ROOF.x, (p[2] - ROOF.z) * 1.2); return d > 70 ? Infinity : T.windows[0] + (T.windows[1] - T.windows[0]) * clamp(d / 70) + R() * .9; };
  const gnd = box(420, .2, 300, M.asphalt, { cast: false }); gnd.position.set(0, -.2, 0); scene.add(gnd);
  const road = box(240, .04, 6, M.asphalt, { cast: false }); road.position.set(0, -.02, 0); scene.add(road);
  for (const s of [-1, 1]) { const pv = box(240, .14, 2.4, M.paving, { cast: false }); pv.position.set(0, 0, s * 4.2); scene.add(pv); const kb = box(240, .16, .2, M.kerb, { cast: false }); kb.position.set(0, 0, s * 3.05); scene.add(kb); }
  for (let x = -110; x < 110; x += 4) { const d = box(2, .03, .12, M.paint, { cast: false }); d.position.set(x, .01, 0); scene.add(d); }
  const row = [
    { x: -64, w: 14, mat: 'brickY', floors: 5 }, { x: -48, w: 16, mat: 'stone', floors: 4 }, { x: -32, w: 14, mat: 'concreteW', floors: 4 },
    { x: -18, w: 12, mat: 'brick', floors: 4 }, { x: -2, w: 20, mat: 'brickY', floors: 3 },
    { x: HB.x, w: HB.w, mat: 'brickD', floors: HB.floors, hero: 1 }, { x: NB.x, w: NB.w, mat: 'concrete', floors: NB.floors, sides: 1 },
    { x: 42, w: 16, mat: 'brick', floors: 4 }, { x: 58, w: 14, mat: 'concreteB', floors: 5 }, { x: 74, w: 16, mat: 'brickY', floors: 4 },
  ];
  for (const b of row) scene.add(building(W, { x: b.x, z: -11.4, w: b.w, d: 12, floors: b.floors, mat: b.mat, shop: true, rnd: R, lampP: .3, wpm: .45, roofBoxes: b.hero ? 0 : 2, sides: !!b.sides, phone: p => popT(p) }));
  for (const [x, w, sg, inside] of [[-64, 10, 'PHARMACY', '#c8f0d8'], [-48, 12, 'BOOKS', '#ffd090'], [-32, 10, 'BAKERY', '#ffc070'], [-18, 8, 'FLORIST', '#ffc8a0'], [HB.x, 6, 'LAUNDRY', '#d8e8ff'], [NB.x, 10, 'GROCER', '#ffe0a0'], [42, 12, 'HARDWARE', '#ffd8a0'], [58, 10, 'TOYS', '#ffd0e0']]) {
    const s = shopFront(w, 3.6, { sign: sg, inside, signO: { bg: '#16181e', fg: '#e8d8a8', k: .55 } }); s.position.set(x, 0, -5.38); scene.add(s);
  }
  // the music shop: a cello in the window
  const MUS = { x: -4 };
  const mus = shopFront(10, 3.6, { sign: 'MUSIC', inside: '#ffd8a0', opacity: .25, signO: { bg: '#20140e', fg: '#f0dca8', k: .6, font: '"Cormorant Garamond"' } }); mus.position.set(MUS.x, 0, -5.38); scene.add(mus); mus.userData.glass.depthWrite = false;
  const mFloor = box(9.6, .3, 1.2, M2.wood); mFloor.position.set(MUS.x, 0, -6.1); scene.add(mFloor);
  const mc = celloProp(); mc.position.set(MUS.x - 1.5, .3, -6.0); mc.rotation.y = .4; scene.add(mc);
  const mc2 = celloProp(); mc2.scale.setScalar(.6); mc2.position.set(MUS.x + 1.2, .3, -6.1); mc2.rotation.y = -.3; scene.add(mc2);
  const mback = box(9.6, 3.2, .1, solid(['#3a2418', '#4e3222', '#64422e'], 51)); mback.position.set(MUS.x, 0, -6.8); scene.add(mback);
  // noticeboard and post box
  const NOTE = { x: -12.6, z: -5.1 };
  const nb = box(2.4, 1.5, .1, M2.wood); nb.position.set(NOTE.x, .8, NOTE.z); scene.add(nb);
  for (const [k, txt, w, h, x, y, bg, fg] of [[0, 'LOST CAT', .55, .4, -.75, 1.75, '#e8e0c8', '#3a2a1a'], [1, 'YOGA', .45, .35, .8, 1.85, '#d8e8f0', '#204060'], [2, 'ROOM TO LET', .6, .3, .7, 1.3, '#f0e0d0', '#5a2a1a']]) {
    const s = sign(txt, w, h, { bg, fg, k: .32, font: 'Cinzel', edge: bg }); s.position.set(NOTE.x + x, y, NOTE.z + .06); s.rotation.z = (k - 1) * .05; scene.add(s);
  }
  const poster = new THREE.Group(); scene.add(poster); poster.position.set(NOTE.x - .1, 1.55, NOTE.z + .07);
  const pp = sign('PORT ALDER', .62, .2, { bg: '#123a52', fg: '#f0e6c8', k: .7, edge: '#123a52' }); pp.position.y = .2; poster.add(pp);
  const pp2 = sign('ORCHESTRA', .62, .14, { bg: '#123a52', fg: '#d8c890', k: .7, edge: '#123a52' }); pp2.position.y = .04; poster.add(pp2);
  const pp3 = sign('AUDITIONS', .62, .22, { bg: '#123a52', fg: '#ffd070', k: .72, edge: '#123a52' }); pp3.position.y = -.14; poster.add(pp3);
  const POST = { x: -9.6, z: -3.6 };
  const pbx = new THREE.Mesh(new THREE.CylinderGeometry(.28, .28, 1.2, 12).translate(0, .6, 0), solid(['#4a0a0a', '#7a1410', '#a42418', '#c83a28'], 53)); pbx.castShadow = true; pbx.position.set(POST.x, 0, POST.z); scene.add(pbx);
  const pcap = new THREE.Mesh(new THREE.SphereGeometry(.3, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), pbx.material); pcap.position.set(POST.x, 1.2, POST.z); scene.add(pcap);
  const pslot = box(.3, .05, .02, M.dark, { cast: false }); pslot.position.set(POST.x, .95, POST.z + .28); scene.add(pslot);
  // Theo's roof: water tank, chimney pots, a crate to sit on; Nan's balcony on the building next door
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, 1.6, 12).translate(0, .8, 0), M.steel); tank.castShadow = true; tank.position.set(HB.x + 3, RH + .3, HB.z - 2.5); scene.add(tank);
  for (const [x, z] of [[HB.x - 4, HB.z - 3], [HB.x - 3.4, HB.z - 3]]) { const c = box(.4, 1.0, .4, M.brickD); c.position.set(x, RH + .3, z); scene.add(c); }
  const crate = box(.6, .42, .5, M2.wood); crate.position.copy(ROOF).add(V3(-.1, 0, -.05)); scene.add(crate);
  const roofLamp = new THREE.PointLight('#ffc070', 0, 7, 2); roofLamp.castShadow = true; roofLamp.shadow.mapSize.set(1024, 1024); roofLamp.shadow.bias = -.003; scene.add(roofLamp);
  const lantern = box(.18, .26, .18, solid(['#5a3a10', '#a8721e', '#ffd070'], 55), { cast: false }); lantern.position.copy(ROOF).add(V3(.55, 0, .3)); scene.add(lantern);
  const lanternG = glow('#ffc060', .9, 1.2); lanternG.position.copy(lantern.position).add(V3(0, .2, 0)); scene.add(lanternG);
  const BAL = V3(NB.x - NB.w / 2 - .45, RH + 3.1, HB.z + 3.4);
  const bal = box(.9, .12, 1.6, M.concrete); bal.position.copy(BAL).add(V3(0, -.12, 0)); scene.add(bal);
  const balR = box(.06, .9, 1.6, M.rail); balR.position.copy(BAL).add(V3(-.42, 0, 0)); scene.add(balR);
  const balW = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.0), new THREE.MeshBasicMaterial({ color: C('#ffc890').multiplyScalar(1.6) })); balW.rotation.y = -Math.PI / 2; balW.position.copy(BAL).add(V3(.44, 1.0, 0)); scene.add(balW);
  const balL = new THREE.PointLight('#ffc890', 0, 6, 2); balL.position.copy(BAL).add(V3(-.2, 1.6, 0)); scene.add(balL);
  // the bathroom window of Theo's flat on the front, top floor (the title's one lit window)
  const tWin = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.35), new THREE.MeshBasicMaterial({ color: C('#ffd8a0').multiplyScalar(2.2) })); tWin.position.set(HB.x + 2.4, RH - 3.1 + 1.7, HB.z + HB.d / 2 + .04); scene.add(tWin);
  // south side, lamps, cars, the city grid, the railway
  for (const [x0, x1] of [[-90, -60], [-58, -30], [-28, -2], [0, 22], [24, 54], [56, 70], [72, 100]]) { const b = box(x1 - x0, 3.4, 10, M[['brick', 'concrete', 'brickY', 'concreteW'][Math.abs(x0) % 4]], { cast: false }); b.position.set((x0 + x1) / 2, 0, 12); scene.add(b); }
  const lamps = [];
  for (const x of [-42, -28, -14, 0, 14, 28, 56, 70]) { const L = lampPost(4.8); L.position.set(x, 0, 4.95); L.rotation.y = Math.PI / 2; scene.add(L); lamps.push(L); }
  const lampGlows = lamps.map(L => { const g = glow('#ffd9a0', 1.6, .9); g.position.copy(L.localToWorld(L.userData.head.clone())); g.material.depthTest = false; g.renderOrder = 6; scene.add(g); return g; });
  for (const [x, col] of [[-36, ['#1a2a3a', '#2a4058', '#3c5878', '#527296']], [-22, ['#3a1a1a', '#5a2828', '#7a3a38', '#9a5048']], [30, ['#2a2a2a', '#404040', '#5a5a5a', '#787878']], [50, ['#3a3420', '#585030', '#786c44', '#988a5a']]]) { const c = car(col, { seed: x & 7 }); c.position.set(x, 0, 2.15); scene.add(c); }
  const mats = ['concrete', 'brick', 'brickD', 'brickY', 'concreteW', 'concreteB', 'stone'];
  for (let gx = -140; gx <= 140; gx += 24) for (const gz of [-30, -50, -74, -98, 24]) {
    const n = 1 + Math.floor(R() * 2.5);
    for (let k = 0; k < n; k++) { const w = 16 / n - .6, x = gx - 8 + (k + .5) * 16 / n, d = 12 + R() * 3, fl = 3 + Math.floor(R() * (Math.abs(gz) > 60 ? 5 : 3));
      scene.add(building(W, { x, z: gz, w, d, floors: fl, mat: mats[Math.floor(R() * mats.length)], rnd: R, lampP: .3, wpm: .34, cast: Math.abs(gz) < 40, phone: p => popT(p) })); }
  }
  const RAIL = { z: 40 };
  const bed_ = box(300, .3, 4, M.gravel, { cast: false }); bed_.position.set(0, 0, RAIL.z); scene.add(bed_);
  for (const s of [-.7, .7]) { const r = box(300, .08, .08, M.rail, { cast: false }); r.position.set(0, .3, RAIL.z + s); scene.add(r); }
  for (let x = -150; x < 150; x += 1.2) { const s = box(.25, .05, 2.2, M.wood, { cast: false }); s.position.set(x, .28, RAIL.z); scene.add(s); }
  const plat = box(40, .9, 4, M.paving); plat.position.set(-20, 0, RAIL.z - 4.2); scene.add(plat);
  const canopy = box(30, .2, 3.6, M.metal); canopy.position.set(-20, 3.8, RAIL.z - 4.4); scene.add(canopy);
  for (let i = 0; i < 6; i++) { const p = box(.2, 2.9, .2, M.metal); p.position.set(-34 + i * 5.6, .9, RAIL.z - 5.6); scene.add(p); }
  const stSign = sign('LARKFIELD', 4, .6, { bg: '#16304a', fg: '#f0e6c8', k: .6, lit: .8 }); stSign.position.set(-20, 3.2, RAIL.z - 2.5); scene.add(stSign);
  const train = new THREE.Group(); scene.add(train);
  for (let i = 0; i < 4; i++) { const c = tram({ len: 13 }); c.position.x = -i * 13.6; train.add(c); }
  train.position.set(-60, .32, RAIL.z);

  // ================= Interiors =================
  const BA = V3(200, 0, 0), SB = V3(320, 0, 0), LR = V3(230, 0, 0), NF = V3(255, 0, 0), AH = V3(280, 0, 0);
  // Theo's bathroom and the room behind the glass
  const bathR = bathroom({ wall: M2.tealTile, floor: M2.lino, towel: M2.towel, winCol: '#5a6e94' }); bathR.position.copy(BA); scene.add(bathR);
  const bathM = bathroom({ wall: M2.greyTile, floor: M2.lino, towel: M2.towelW, noRight: true, ceil: true, front: true, frontM: cmats().dark, cupCol: '#8a8a8a', winCol: '#4a5a74' });
  bathM.position.set(BA.x + BW, 0, BA.z); bathM.scale.x = -1; scene.add(bathM);
  const BR = bathR.userData, BM = bathM.userData;
  BM.postcard.position.set(BW / 2 + .02, HOLE.y1 - .16, HOLE.z1 - .14);   // tucked in the reflected frame (local, mirrored)
  BM.postcard.rotation.y = Math.PI / 2;
  const bulbL = new THREE.PointLight('#ffd8a0', 0, 9, 1.6); bulbL.castShadow = true; bulbL.shadow.mapSize.set(1024, 1024); bulbL.shadow.bias = -.004; bulbL.shadow.radius = 2; scene.add(bulbL);
  const bulbLM = new THREE.PointLight('#ffd8a0', 0, 9, 1.6); scene.add(bulbLM);
  const bulbG = glow('#ffd090', .7, 1.4); bulbG.renderOrder = 7; scene.add(bulbG);
  const bulbGM = glow('#ffd090', .7, 1.4); bulbGM.renderOrder = 7; scene.add(bulbGM);
  const winL = new THREE.PointLight('#a8b8e0', 0, 6, 2); scene.add(winL);
  // the seaside bathroom, ten years on, and its glass
  const seaR = bathroom({ wall: M2.whiteTile, floor: M2.linoW, towel: M2.towel, winCol: '#c8ecff', winX: -.5, plant: 1, cupCol: '#e8a020' }); seaR.position.copy(SB); scene.add(seaR);
  const seaM = bathroom({ wall: M2.whiteTile, floor: M2.linoW, towel: M2.towel, winCol: '#c8ecff', winX: -.5, plant: 1, cupCol: '#e8a020', noRight: true, ceil: true, front: true, frontM: cmats().dark }); seaM.position.set(SB.x + BW, 0, SB.z); seaM.scale.x = -1; scene.add(seaM);
  for (const B of [seaR.userData, seaM.userData]) { B.case.visible = false; B.badge.visible = false; }
  const SR = seaR.userData;
  const scarfHook = box(.04, .5, .1, solid(['#4a0a10', '#7a1420', '#a82430'], 57)); scarfHook.position.set(-BW / 2 + .04, 1.3, .9); seaR.add(scarfHook);
  const seaWin = new THREE.PointLight('#e8f4ff', 0, 7, 1.6); scene.add(seaWin);
  // the flat: living room with a small hall mirror on the right wall (normal: a plain mirrored copy)
  const RW = 4.4, RD = 3.0, RHt = 2.7;
  function livingRoom(o) {
    const g = new THREE.Group(), Rr = {}, wall = M2.flatWall;
    const fl = box(RW + .32, .1, RD + .16, M.wood, { cast: false }); fl.position.set(0, -.1, -.08); g.add(fl);
    const bk = box(RW + .32, RHt, .16, wall); bk.position.set(0, 0, -RD / 2 - .08); g.add(bk);
    const lw0 = box(.16, RHt, 1.5, wall); lw0.position.set(-RW / 2 - .08, 0, -RD / 2 + .75); g.add(lw0);
    const lw1 = box(.16, RHt - 2.1, 1.5, wall); lw1.position.set(-RW / 2 - .08, 2.1, .75); g.add(lw1);   // the door gap (front half of the left wall)
    const door = box(.06, 2.1, 1.0, solid(['#3a2a1c', '#4e3a28', '#644a34'], 59)); door.geometry.translate(0, 0, .5); door.position.set(-RW / 2 - .06, 0, .1); g.add(door); Rr.door = door;
    if (!o.noRight) {
      const x = RW / 2 + .08, H = { z0: -.45, z1: .15, y0: 1.1, y1: 1.9 };
      for (const [h, y, d, z] of [[H.y0, 0, RD, 0], [RHt - H.y1, H.y1, RD, 0], [H.y1 - H.y0, H.y0, H.z0 + RD / 2, (-RD / 2 + H.z0) / 2], [H.y1 - H.y0, H.y0, RD / 2 - H.z1, (H.z1 + RD / 2) / 2]]) { const b = box(.16, h, d, wall); b.position.set(x, y, z); g.add(b); }
      const fm = solid(['#2a2a2e', '#3e3e44', '#56565e'], 63);
      for (const [y, z, w, h, d] of [[H.y0 - .05, (H.z0 + H.z1) / 2, .05, .05, H.z1 - H.z0 + .1], [H.y1, (H.z0 + H.z1) / 2, .05, .05, H.z1 - H.z0 + .1]]) { const f = box(w, h, d, fm, { cast: false }); f.position.set(RW / 2 - .02, y, z); g.add(f); }
      for (const z of [H.z0 - .03, H.z1 + .03]) { const f = box(.05, H.y1 - H.y0 + .1, .05, fm, { cast: false }); f.position.set(RW / 2 - .02, H.y0 - .05, z); g.add(f); }
      Rr.H = H;
    }
    if (o.ceil) { const c = box(RW + .32, .12, RD + .16, wall, { cast: false }); c.position.set(0, RHt, -.08); g.add(c); }
    if (o.front) { const f = box(RW + .32, RHt + .12, .16, wall); f.position.set(0, 0, RD / 2 + .08); g.add(f); }
    if (o.bare) { g.userData = Rr; return g; }
    const B = bed(); B.position.set(-1.1, 0, -RD / 2 + .62); g.add(B);
    const ns = box(.45, .5, .4, M.wood); ns.position.set(.1, 0, -RD / 2 + .3); g.add(ns);
    const lampB = box(.18, .3, .18, solid(['#a89470', '#c8b48a', '#e2d0a4'], 41)); lampB.position.set(.1, .5, -RD / 2 + .3); g.add(lampB); Rr.lampAt = V3(.1, .9, -RD / 2 + .4);
    const ward = box(1.0, 2.0, .55, M.wood); ward.position.set(1.4, 0, -RD / 2 + .3); g.add(ward);
    const ch = chair(); ch.position.set(.9, 0, .5); ch.rotation.y = -.8; g.add(ch);
    const rug = box(1.8, .02, 1.2, M.rug, { cast: false }); rug.position.set(.2, 0, .3); g.add(rug);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(.9, 1.0), new THREE.MeshBasicMaterial({ color: C('#1a2438') })); win.position.set(-1.1, 1.55, -RD / 2 + .005); g.add(win); Rr.win = win;
    const cs = celloCase(); cs.position.set(.75, 0, -RD / 2 + .35); cs.rotation.set(0, -.3, .05); g.add(cs); Rr.case = cs;
    const co = celloCaseOpen(); co.position.set(1.1, 0, .75); co.rotation.y = Math.PI / 2 - .3; g.add(co); co.visible = false; Rr.caseOpen = co;
    const stool = box(.4, .45, .4, M.wood); stool.position.set(-.55, 0, .45); g.add(stool); Rr.stool = stool; stool.visible = false;
    const boxes = new THREE.Group(); g.add(boxes); boxes.visible = false; Rr.boxes = boxes;
    [[.6, .45, .5, -.6, .7, 8], [.5, .4, .5, .1, .9, 9], [.55, .5, .45, .9, -.4, 10], [.45, .35, .45, .95, -.4, 11]].forEach(([w, h, d, x, z, s], i) => { const b = cardboard(w, h, d, s); b.position.set(x, i === 3 ? .5 : 0, z); boxes.add(b); });
    g.userData = Rr; return g;
  }
  const flat = livingRoom({}); flat.position.copy(LR); scene.add(flat);
  const flatM = livingRoom({ noRight: true, ceil: true, front: true, bare: true }); flatM.position.set(LR.x + RW, 0, LR.z); flatM.scale.x = -1; scene.add(flatM);
  const FL = flat.userData;
  const lampL = new THREE.PointLight('#ffb870', 0, 7, 2); lampL.castShadow = true; lampL.shadow.mapSize.set(1024, 1024); lampL.shadow.bias = -.003; lampL.position.copy(LR).add(FL.lampAt).add(V3(0, .1, .35)); scene.add(lampL);
  const lampG = glow('#ffc070', .5, 1); lampG.position.copy(LR).add(FL.lampAt).add(V3(0, -.15, 0)); scene.add(lampG);
  const lampLM = new THREE.PointLight('#ffb870', 0, 7, 2); lampLM.position.set(LR.x + RW - FL.lampAt.x, FL.lampAt.y + .1, LR.z + FL.lampAt.z + .35); scene.add(lampLM);
  const landing = new THREE.Group(); scene.add(landing); landing.position.copy(LR).add(V3(-RW / 2 - 1.3, 0, 0));
  const lf = box(2.4, .1, 3.2, M.wood, { cast: false }); lf.position.y = -.1; landing.add(lf);
  const lwl = box(.16, RHt, 3.2, M2.flatWall); lwl.position.x = -1.2; landing.add(lwl);
  // Nan's flat: rugs, an upright piano, two lamps, plants, a clock
  const NW = 4.8, ND = 3.2;
  const nan_ = new THREE.Group(); nan_.position.copy(NF); scene.add(nan_);
  { const fl = box(NW + .32, .1, ND + .16, M.wood, { cast: false }); fl.position.set(0, -.1, -.08); nan_.add(fl);
    const bk = box(NW + .32, 2.8, .16, M2.nanWall); bk.position.set(0, 0, -ND / 2 - .08); nan_.add(bk);
    const rw = box(.16, 2.8, ND, M2.nanWall); rw.position.set(NW / 2 + .08, 0, 0); nan_.add(rw);
    const lw0 = box(.16, 2.8, 1.6, M2.nanWall); lw0.position.set(-NW / 2 - .08, 0, -ND / 2 + .8); nan_.add(lw0);
    const lw1 = box(.16, .7, 1.6, M2.nanWall); lw1.position.set(-NW / 2 - .08, 2.1, .8); nan_.add(lw1);
    const rug = box(2.6, .02, 1.8, M.rug, { cast: false }); rug.position.set(.3, 0, .2); nan_.add(rug);
    const piano = box(1.5, 1.25, .6, solid(['#140a06', '#24140c', '#361e12', '#4a2a18'], 65)); piano.position.set(1.2, 0, -ND / 2 + .32); nan_.add(piano);
    const keys = box(1.36, .04, .22, solid(['#c8c4b8', '#e2ded2', '#f2eee4'], 67)); keys.position.set(1.2, .74, -ND / 2 + .72); nan_.add(keys);
    const arm = box(.9, .5, .8, solid(['#3a1a2a', '#542638', '#6e3448', '#884a5c'], 69)); arm.position.set(-.6, 0, -.6); nan_.add(arm);
    const armB = box(.9, .55, .2, arm.material); armB.position.set(-.6, .5, -.95); nan_.add(armB);
    const tbl = table(.7, .7, .55); tbl.position.set(.5, 0, .4); nan_.add(tbl);
    const cup2 = new THREE.Mesh(new THREE.CylinderGeometry(.05, .04, .08, 8).translate(0, .04, 0), stdM({ color: '#e8e0d0' })); cup2.position.set(.55, .56, .45); nan_.add(cup2);
    for (const [x, z, s] of [[2.0, .9, 1.4], [-2.0, -1.2, 1.1], [.2, -1.3, .9]]) { const p = plant(s, Math.round(x * 7 + 9)); p.position.set(x, 0, z); nan_.add(p); }
    for (const [x, y, w, h, s] of [[-.4, 1.8, .5, .4, 1], [.3, 1.9, .35, .45, 2], [1.2, 1.75, .6, .35, 3]]) { const R2 = ramp(['#3a2a1a', '#6a5a3a', '#9a8a5a', '#c8b88a'], .45); const pc = picture(w, h, (x2, y2) => { const b = Math.min(x2, y2, w * 40 - 1 - x2, h * 40 - 1 - y2); return b < 2 ? [120, 90, 40] : R2(.4 + fbm(x2 * .1, y2 * .1, s) * .6, x2, y2); }); pc.position.set(x, y, -ND / 2 + .01); nan_.add(pc); }
    const ndoor = box(.06, 2.1, 1.0, solid(['#4a2a1c', '#5e3a28', '#744a34'], 71)); ndoor.geometry.translate(0, 0, .5); ndoor.position.set(-NW / 2 - .06, 0, .1); ndoor.rotation.y = -1.2; nan_.add(ndoor);
  }
  const nanL1 = new THREE.PointLight('#ffb070', 0, 7, 1.8); nanL1.castShadow = true; nanL1.shadow.mapSize.set(1024, 1024); nanL1.shadow.bias = -.003; nanL1.position.copy(NF).add(V3(-1.3, 1.5, -.9)); scene.add(nanL1);
  const nanL2 = new THREE.PointLight('#ffc890', 0, 6, 1.8); nanL2.position.copy(NF).add(V3(1.9, 1.7, .3)); scene.add(nanL2);
  for (const [x, y, z] of [[-1.3, 1.3, -1.1], [1.9, 1.5, .3]]) { const sh = new THREE.Mesh(new THREE.CylinderGeometry(.12, .2, .24, 10, 1, true), stdM({ color: '#e8c890', emissive: C('#ffb060'), emissiveIntensity: .9, side: THREE.DoubleSide })); sh.position.copy(NF).add(V3(x, y, z)); scene.add(sh); const st = box(.04, y - .1, .04, M.metal); st.position.copy(NF).add(V3(x, 0, z)); scene.add(st); const g = glow('#ffb870', .8, .9); g.position.copy(sh.position); scene.add(g); }
  // the audition hall: a raised stage, curtains, one chair under one light; the panel's table in the dark
  const hall = new THREE.Group(); hall.position.copy(AH); scene.add(hall);
  { const stage = box(9, .6, 5, M.wood); stage.position.set(0, 0, -1); hall.add(stage);
    const fl = box(14, .1, 12, M.wood, { cast: false }); fl.position.set(0, -.1, 2); hall.add(fl);
    const back = box(10, 6, .3, M2.curtain); back.position.set(0, .6, -3.5); hall.add(back);
    for (const s of [-1, 1]) { const c = box(1.4, 6, .5, M2.curtain); c.position.set(s * 4.4, .6, -2.8); hall.add(c); }
    const chairS = chair(); chairS.position.set(0, .6, -1.2); chairS.rotation.y = -.5; hall.add(chairS);
    const stand = box(.04, 1.0, .04, M.metal); stand.position.set(.75, .6, -.9); hall.add(stand); const sht = box(.4, .3, .03, M.metal); sht.position.set(.75, 1.55, -.9); sht.rotation.x = -.4; hall.add(sht);
    const pt = table(2.4, .8, .74); pt.position.set(-1.6, 0, 3.4); hall.add(pt);
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { const s = box(.5, .45, .5, solid(['#2a0a10', '#3a1018', '#4a1820'], 73)); s.position.set(-4 + i * 1.6, 0, 5.4 + j * 1.2); hall.add(s); }
  }
  const spot = new THREE.SpotLight('#ffe0b0', 0, 14, .36, .5, 1.2); spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -.002;
  spot.position.copy(AH).add(V3(1.5, 7, 2.2)); spot.target.position.copy(AH).add(V3(0, .6, -1.2)); scene.add(spot); scene.add(spot.target);
  const deskL = new THREE.PointLight('#ffc080', 0, 3, 2); deskL.position.copy(AH).add(V3(-1.2, 1.1, 3.2)); scene.add(deskL);
  // Port Alder: a harbour town on a slope, the sea in front, a hall with a green dome
  const PA = V3(-260, 0, 0);
  const seaW = sea(900, { deep: '#2a6a8a', shallow: '#4a98b8', crest: '#bfe4f0', ppm: 10 }); seaW.mesh.position.set(PA.x, -.4, PA.z + 300); scene.add(seaW.mesh);
  seaW.u.calm.value = .5;
  const quay = box(140, .6, 8, M.stone); quay.position.set(PA.x, -.4, PA.z + 2); scene.add(quay);
  const paMats = ['concreteW', 'stone', 'brickY', 'concrete'];
  const paCols = [['#c8b8a0', '#dcd0b8', '#ece4d0'], ['#a8c0c8', '#c0d4d8', '#d8e6e8'], ['#d8b8a0', '#e8ccb4', '#f2dccc'], ['#e8e0c8', '#f2ecd8', '#faf6e8']];
  const RP = mulberry(5);
  for (let i = 0; i < 9; i++) for (let j = 0; j < 3; j++) {
    const x = PA.x - 56 + i * 13 + (RP() - .5) * 2, z = PA.z - 6 - j * 13, y = j * 4.5, w = 9 + RP() * 2, fl = 2 + Math.floor(RP() * 3);
    const b = building(W, { x, z, w, d: 9, floors: fl, mat: paMats[(i + j) % 4], rnd: RP, lampP: .1, wpm: .4, roofBoxes: 1 });
    b.position.y = y; b.traverse(o => { if (o.material && o.material.map) { o.material = o.material.clone(); o.material.color = C(paCols[(i * 3 + j) % 4][1]); } }); scene.add(b);
    if (j > 0) { const base = box(w, y, 9, M.stone, { cast: false }); base.position.set(x, 0, z); scene.add(base); }
  }
  // the windows of Port Alder sit on lifted buildings: lift their window quads too
  const hallP = new THREE.Group(); scene.add(hallP); hallP.position.set(PA.x + 30, 0, PA.z - 4);
  { const b = box(14, 6, 9, M.stone); hallP.add(b); const dome = new THREE.Mesh(new THREE.SphereGeometry(3.6, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), solid(['#2a5a48', '#3a7a60', '#4e9a7a', '#6ab496'], 75)); dome.position.y = 6; dome.castShadow = true; hallP.add(dome); }
  const boats = []; for (let i = 0; i < 6; i++) { const bt = new THREE.Group(); const hull = box(3.2, .7, 1.2, solid([['#7a1a14', '#9a2a1c'], ['#14406a', '#20588a'], ['#e8e0c8', '#f4ecd8']][i % 3], 77 + i)); bt.add(hull); const mast = box(.08, 3.2, .08, M.wood); mast.position.y = .7; bt.add(mast); bt.position.set(PA.x - 40 + i * 14, -.35, PA.z + 9 + (i % 2) * 3); scene.add(bt); boats.push(bt); }
  const paWin = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.3), new THREE.MeshBasicMaterial({ color: C('#ffd8a0').multiplyScalar(2.4) })); paWin.position.set(PA.x - 4, 4.5 + 3.6 * .55 + 1.2, PA.z - 19 + 4.52); scene.add(paWin);

  // ================= Cast =================
  const theo = makeChar('hero', 'theo'), theoS = makeChar('hero', 'fut2', { tag: 'theo34' });
  const theoScarf = makeChar('hero', 'theoS', { tag: 'theoScarf' });
  const fut = { fut0: makeChar('hero', 'fut0'), fut0b: makeChar('hero', 'fut0b'), fut1: makeChar('hero', 'fut1'), fut2: makeChar('hero', 'fut2'), fut3: makeChar('hero', 'fut3'), young: makeChar('hero', 'theo', { tag: 'young' }) };
  const nan = makeChar('nan', 'nan'), nanB = makeChar('nan', 'nanB', { tag: 'nanB' });
  const panel = ['t3', 't1', 't6'].map(l => makeChar('folk', l));
  const folk = ['t1', 't2', 't4', 't5', 't7', 't8'].map(l => makeChar('folk', l));
  const all = [theo, theoS, theoScarf, ...Object.values(fut), nan, nanB, ...panel, ...folk];
  all.forEach(c => { scene.add(c.root); c.root.visible = false; });
  const fill = new THREE.PointLight('#c8d4f0', 0, 7, 2); scene.add(fill);
  const pracL = new THREE.PointLight('#ffc890', 0, 5, 2); scene.add(pracL);
  const blinkOr = (t, f, b, s = 0) => (((t + s) % 3.7) < .12 ? b : f);
  const place = (c, x, y, z) => { c.root.visible = true; c.root.position.set(x, y, z); };
  const walk4 = (t, fps = 7, pre = 'w') => pre + (Math.floor(t * fps) % 4);
  const B = (x, y, z) => [BA.x + x, y, BA.z + z], S = (x, y, z) => [SB.x + x, y, SB.z + z], L = (x, y, z) => [LR.x + x, y, LR.z + z], N = (x, y, z) => [NF.x + x, y, NF.z + z], A = (x, y, z) => [AH.x + x, y, AH.z + z], P = (x, y, z) => [PA.x + x, y, PA.z + z];

  // —— Cameras per shot (local time) ——
  const BATH_P = track([[0, B(-1.9, 4.0, 4.9)], [7, B(-1.75, 3.85, 4.65)]]), BATH_L = track([[0, B(1.0, 1.35, -.3)], [7, B(1.05, 1.38, -.3)]]);
  const CAM = {
    open: { p: track([[0, B(-2.5, 4.7, 5.9)], [8, B(-2.3, 4.45, 5.5)], [27.5, B(-1.25, 3.2, 3.6)]]), l: track([[0, B(.8, 1.2, -.4)], [27.5, B(1.1, 1.42, -.3)]]), fov: 32 },
    title: { p: track([[0, [-34, 58, 82]], [10, [-20, 50, 72]]]), l: track([[0, [HB.x, 6, -6]], [10, [HB.x + 2, 6, -6]]]), fov: 32 },
    glass: { p: track([[0, B(-.75, 2.85, 2.5)], [24.5, B(-.45, 2.6, 2.05)]]), l: track([[0, B(1.2, 1.35, -.15)], [24.5, B(1.3, 1.4, -.18)]]), fov: 30 },
    inventory: { p: track([[0, B(1.6, 2.6, 4.2)], [18, B(4.2, 2.5, 3.8)]]), l: track([[0, B(2.2, 1.1, -.6)], [18, B(4.0, 1.0, -.7)]]), fov: 30 },
    tests: { p: track([[0, L(-.6, 3.1, 4.8)], [20, L(.1, 2.9, 4.3)]]), l: track([[0, L(.9, 1.0, -.2)], [20, L(1.3, 1.1, -.2)]]), fov: 32 },
    nan1: { p: track([[0, N(1.6, 3.4, 5.6)], [44, N(1.0, 3.0, 4.8)], [50, N(.6, 2.5, 3.9)]]), l: track([[0, N(-.6, 1.0, -.2)], [44, N(-.7, 1.0, -.2)], [50, N(-.6, 1.1, .3)]]), fov: 30 },
    morning2: { p: BATH_P, l: BATH_L, fov: 32 }, morning3: { p: BATH_P, l: BATH_L, fov: 32 }, morning4: { p: track([[0, B(-1.9, 4.0, 4.9)], [12, B(-1.5, 3.6, 4.2)]]), l: BATH_L, fov: 32 },
    practice: { p: track([[0, L(1.6, 3.3, 4.4)], [5, L(1.2, 2.9, 3.9)], [10.6, L(1.0, 2.7, 3.6)], [18, L(.45, 1.9, 2.5)]]), l: track([[0, L(.2, .8, .3)], [5, L(-.4, .8, .3)], [18, L(-.5, .85, .4)]]), fov: 30 },
    practice2: { p: track([[0, L(1.5, 3.2, 4.3)], [27, L(.5, 2.0, 2.6)], [28, L(.48, 1.98, 2.58)]]), l: track([[0, L(-.3, .8, .3)], [28, L(-.5, .9, .4)]]), fov: track([[0, [32]], [28, [27]]]) },
    sit: { p: track([[0, B(1.5, 3.6, 7.0)], [28, B(1.5, 3.1, 5.9)]]), l: track([[0, B(1.5, .95, -.5)], [28, B(1.5, .95, -.5)]]), fov: 34 },
    habit: { p: track([[0, B(1.5, 8.4, 3.6)], [22, B(1.5, 7.6, 3.1)]]), l: track([[0, B(1.5, 0, -.35)], [22, B(1.5, 0, -.35)]]), fov: 36 },
    roof: { p: track([[0, [ROOF.x + 2.4, ROOF.y + 2.2, ROOF.z + 3.6]], [7, [ROOF.x + 2.2, ROOF.y + 2.0, ROOF.z + 3.3]], [18, [ROOF.x + 16, ROOF.y + 20, ROOF.z + 46]], [20.6, [ROOF.x + 17, ROOF.y + 21, ROOF.z + 48]], [25, [ROOF.x - .6, ROOF.y + 3.4, ROOF.z + 12.8]], [38, [ROOF.x + .2, ROOF.y + 2.9, ROOF.z + 11.2]]]),
      l: track([[0, [ROOF.x, ROOF.y + .7, ROOF.z]], [7, [ROOF.x, ROOF.y + .7, ROOF.z]], [18, [ROOF.x - 4, ROOF.y - 4, ROOF.z - 12]], [20.6, [ROOF.x - 4, ROOF.y - 4, ROOF.z - 12]], [25, [ROOF.x + 3.5, ROOF.y + 1.7, ROOF.z + 1.2]], [38, [ROOF.x + 3.5, ROOF.y + 1.7, ROOF.z + 1.2]]]), fov: track([[0, [30]], [18, [36]], [20.6, [36]], [25, [36]], [38, [33]]]) },
    empty: { p: track([[0, B(-1.9, 4.0, 4.9)], [5, B(-1.8, 3.9, 4.7)], [30, B(.15, 2.05, 1.35)]]), l: track([[0, B(1.0, 1.35, -.3)], [5, B(1.1, 1.4, -.3)], [30, B(1.5, 1.5, -.22)]]), fov: 32 },
    nan2: { p: track([[0, N(.9, 2.7, 4.2)], [20, N(.3, 2.2, 3.2)]]), l: track([[0, N(-.4, .9, -.3)], [20, N(-.4, .9, -.3)]]), fov: 30 },
    postcard: { p: track([[0, B(-.6, 2.7, 2.8)], [5, B(.35, 2.0, .95)], [16, B(.55, 1.95, .7)], [24, B(.5, 1.95, .75)], [42, B(-1.9, 4.0, 4.9)]]), l: track([[0, B(1.3, 1.45, -.25)], [5, B(1.5, 1.7, .05)], [24, B(1.5, 1.7, .05)], [42, B(1.0, 1.35, -.3)]]), fov: track([[0, [32]], [5, [26]], [24, [26]], [42, [32]]]) },
    notice: { p: track([[0, [NOTE.x + 4.6, 3.2, 2.4]], [6, [NOTE.x + 3.6, 3.0, 2.0]], [12, [NOTE.x + 2.0, 2.3, .2]], [18, [NOTE.x + 1.8, 2.2, 0]]]), l: track([[0, [NOTE.x + 1.2, 1.2, NOTE.z]], [6, [NOTE.x + .4, 1.3, NOTE.z]], [12, [NOTE.x - .1, 1.55, NOTE.z]], [18, [NOTE.x - .1, 1.6, NOTE.z]]]), fov: track([[0, [30]], [12, [28]], [18, [26]]]) },
    leave: { p: track([[0, B(-1.9, 4.0, 4.9)], [10, B(-1.6, 3.7, 4.4)]]), l: BATH_L, fov: 32 },
    door: { p: track([[0, L(.4, 3.0, 4.2)], [16, L(.1, 2.7, 3.7)]]), l: track([[0, L(-1.6, 1.0, .3)], [16, L(-1.7, 1.0, .3)]]), fov: 30 },
    train: { p: track([[0, [-60, 40, 96]], [16, [-36, 36, 90]]]), l: track([[0, [-30, 0, RAIL.z]], [16, [-8, 0, RAIL.z]]]), fov: 32 },
    audition: { p: track([[0, A(1.2, 7.6, 6.6)], [5, A(1.3, 6.0, 6.6)], [14, A(.9, 3.5, 4.8)], [22, A(.4, 1.95, 2.3)], [28, A(.5, 2.2, 2.7)], [33, A(1.0, 3.6, 5.0)]]), l: track([[0, A(0, .8, -1.2)], [14, A(0, 1.2, -1.2)], [22, A(0, 1.35, -1.1)], [33, A(0, 1.2, -1.2)]]), fov: track([[0, [34]], [14, [30]], [22, [26]], [33, [30]]]) },
    through: { p: track([[0, B(-1.9, 4.0, 4.9)], [3, B(-.6, 2.5, 2.4)], [5.95, B(1.38, 1.5, -.2)]]), l: track([[0, B(1.1, 1.4, -.3)], [3, B(1.4, 1.48, -.22)], [5.95, B(2.4, 1.5, -.2)]]), fov: track([[0, [32]], [5.95, [30]]]) },
    sea: { p: track([[0, S(-1.3, 3.2, 3.8)], [32, S(-.9, 2.75, 3.0)], [41, S(-1.6, 3.6, 4.6)]]), l: track([[0, S(1.0, 1.35, -.3)], [41, S(1.1, 1.42, -.3)]]), fov: 32 },
    endWide: { p: track([[0, P(2, 10, 22)], [14, P(26, 38, 92)]]), l: track([[0, P(-4, 6, -15)], [14, P(0, 4, -12)]]), fov: track([[0, [30]], [14, [36]]]) },
  };

  function applyKey(K, renderer) {
    SK.u.top.value.copy(K.top); SK.u.mid.value.copy(K.mid); SK.u.hor.value.copy(K.hor);
    const sd = new THREE.Vector3(...K.sunDir).normalize();
    SK.u.moonDir.value.copy(sd); SK.u.moonCol.value.copy(K.sun); SK.u.moonI.value = K.moon;
    sun.color.copy(K.sun); sun.intensity = K.sunI; sun.position.copy(sunT.position).addScaledVector(sd, 90);
    hemi.color.copy(K.hemiS); hemi.groundColor.copy(K.hemiG); hemi.intensity = K.hemiI;
    scene.fog.color.copy(K.fog); scene.fog.density = K.fogD; renderer.toneMappingExposure = K.exp;
  }
  const KEY_OF = { open: 'bath', title: 'dawnT', glass: 'bath', inventory: 'bath', tests: 'flatD', nan1: 'nan', morning2: 'bath', walk: 'morning', morning3: 'bath', practice: 'flatN', morning4: 'bath', sit: 'bath', habit: 'bath', roof: 'night',
    empty: 'bath', nan2: 'nan', postcard: 'bath', notice: 'morning', practice2: 'flatN', leave: 'bath', door: 'flatD', train: 'dawnT', audition: 'hall', through: 'bath', sea: 'seaIn', endWide: 'sea' };
  const BATH = ['open', 'glass', 'inventory', 'morning2', 'morning3', 'morning4', 'sit', 'habit', 'empty', 'postcard', 'leave', 'through'];
  // the bulb: off until the click, then a swing that dies away; flicker at the empty mirror
  const CLICKS = [T.click0, T.click2, T.click3, T.click4, T.click5, T.click6, ...HABIT];
  const swing = t => { const c = CLICKS.filter(a => a <= t).pop(); if (c == null) return [0, 0]; const d = t - c; return [.11 * Math.sin(d * 2.6) * Math.exp(-d * .55), .06 * Math.sin(d * 2.6 + 1.2) * Math.exp(-d * .55)]; };

  // where the reflection stands: the true mirror position, slid along the glass so that it shows through the hole from this camera
  function mirrorChar(Rc, src, planeX, holeC, cam, k = 1) {
    const sp = src.root.position, xm = 2 * planeX - sp.x;
    let z = sp.z;
    if (k > 0) { const d = holeC.clone().sub(cam.position); if (Math.abs(d.x) > .05) { const s = (xm - cam.position.x) / d.x; z = lerp(sp.z, cam.position.z + d.z * s + (sp.z - holeC.z) * .5, k); } }
    place(Rc, xm, sp.y, z); Rc.face(cam, true);
  }
  const lookOf = (t) => t < 175.5 ? 'fut0' : t < 200.5 ? 'fut0b' : t < 246 ? 'fut0' : t < 252 ? 'fut1' : 'fut2';

  const poseGlass = t => t < T.left - .3 ? blinkOr(t, 'stare', 'blink') : t < T.left + 3.5 ? 'left' : t < T.touch ? blinkOr(t, 'idle0', 'blink') : t < 57 ? 'touch' : blinkOr(t, 'lean', 'blink');
  function update(t, shot, cam, post, renderer) {
    const lt = t - shot.a, id = shot.id;
    all.forEach(c => { c.root.visible = false; c.mesh.scale.x = 1; });
    fill.intensity = 0; pracL.intensity = 0; bulbL.intensity = bulbLM.intensity = 0; bulbG.visible = bulbGM.visible = false; winL.intensity = 0; seaWin.intensity = 0;
    lampL.intensity = lampLM.intensity = 0; lampG.visible = false; nanL1.intensity = nanL2.intensity = 0; spot.intensity = 0; deskL.intensity = 0; roofLamp.intensity = 0; lanternG.visible = false; balL.intensity = 0;
    BR.cover.visible = false; BR.boxes.visible = false; BM.boxes.visible = false; BM.postcard.visible = false; BR.case.visible = true; BM.case.visible = true; BM.caseOpen.visible = false; BM.badge.visible = true; BR.badge.visible = false; BM.sheet.visible = false;
    BM.ceil.visible = true; BM.front.visible = true; BM.towel.visible = true; BM.cup.visible = true; BR.cup.visible = true; BR.towel.visible = true;
    FL.boxes.visible = false; FL.caseOpen.visible = false; FL.case.visible = true; FL.stool.visible = false; FL.door.rotation.y = 0;
    SR.cover.visible = false;

    // ——— key ———
    let K = mixKey(KEY_OF[id] || 'morning', KEY_OF[id] || 'morning', 0);
    const clicks = { open: T.click0, morning2: T.click2, morning3: T.click3, morning4: T.click4, empty: T.click5, sea: T.click6 };
    let bulbK = 0;
    if (BATH.includes(id)) {
      const c = clicks[id];
      bulbK = c != null ? (t >= c ? 1 : 0) : 1;
      if (id === 'habit') { const c2 = HABIT.filter(a => a <= t).pop(); bulbK = c2 == null ? 1 : Math.min(1, (t - c2) / .05); }
      if (id === 'empty' && t > T.flicker && t < T.flicker + 1.6) { const d = t - T.flicker; bulbK = (Math.sin(d * 37) > -.2 ? 1 : .15) * (d > 1.2 ? 1 : .7 + .3 * Math.sin(d * 91)); }
      K = mixKey('dark', 'bath', bulbK > .5 ? 1 : .12 + bulbK * .5);
      if (id === 'open' && t < T.click0) K = mixKey('dark', 'bath', .08);
    }
    if (id === 'sea' && t < T.click6) K = mixKey('seaIn', 'bath', .45);
    if (['title', 'endWide', 'train'].includes(id)) K.fogD *= .5;
    const CK = CAM[id];
    let look = null;
    if (CK) { cam.position.set(...CK.p(lt)); look = V3(...CK.l(lt)); cam.fov = typeof CK.fov === 'number' ? CK.fov : CK.fov(lt)[0]; }
    if (id === 'through' && lt > 6) {
      const k = ss(seg(lt, 6, 10)); cam.position.set(...S(lerp(1.15, -1.3, k), lerp(1.5, 3.2, k), lerp(-.2, 3.8, k)));
      look = V3(...S(lerp(2.4, 1.0, k), lerp(1.5, 1.35, k), lerp(-.2, -.3, k))); cam.fov = 32;
    }
    let hx = 0;
    if (id === 'walk') { hx = lerp(HB.x - 1.5, MUS.x + 2.0, ss(seg(t, 157.4, 174.6))); cam.position.set(hx + 1.2, 4.8, 5.4); look = V3(hx - 2.6, 1.3, -5.0); cam.fov = 32; }
    if (id === 'roof' && lt >= 22.6) {   // hard cuts: Nan on her balcony, then Theo
      if (lt < 32.3) { cam.position.set(BAL.x - 3.4, BAL.y + 1.0, BAL.z + 3.1); look = V3(BAL.x - .1, BAL.y + .9, BAL.z); cam.fov = 30; }
      else { cam.position.set(ROOF.x + 2.3, ROOF.y + 1.9, ROOF.z + 3.3); look = V3(ROOF.x + .1, ROOF.y + .78, ROOF.z); cam.fov = 30; }
    }
    if (look) cam.lookAt(look);
    sunT.position.copy(look || V3(0, 0, 0)); sunT.position.y = 0;
    applyKey(K, renderer);
    const night = ['night', 'flatN'].includes(KEY_OF[id]);
    ST.visible = KEY_OF[id] === 'night'; ST.material.uniforms.t.value = t;
    W.update(t, { night: night ? 1 : 0, day: night ? null : [K.mid.r * .5, K.mid.g * .5, K.mid.b * .55], pop: id === 'roof' });
    lampGlows.forEach(g => { g.visible = night; });
    lamps.forEach(Lp => { Lp.userData.bulb.material.color.setRGB(night ? 3 : .6, night ? 2.5 : .55, night ? 1.6 : .5); });
    seaW.u.t.value = t; seaW.u.camPos.value.copy(cam.position); seaW.u.fogColor.value.copy(scene.fog.color); seaW.u.fogDensity.value = scene.fog.density;

    let tiltC = null, focusOn = null, tiltW = null;
    const idle = (tt, s = 0) => blinkOr(tt, Math.floor((tt + s) * 1.1) % 2 ? 'idle1' : 'idle0', 'blink', s);

    // ——— the bathroom ———
    if (BATH.includes(id)) {
      const [sx, sz] = swing(t);
      BR.bulbG.position.set(sx, BH + .2, .1 + sz); BM.bulbG.position.set(sx, BH + .2, .1 + sz);
      const bw = BR.bulb.getWorldPosition(V3(0, 0, 0)), bm = BM.bulb.getWorldPosition(V3(0, 0, 0));
      const bk = bulbK;
      BR.bulb.material.color.setRGB(.12 + 3.2 * bk, .1 + 2.8 * bk, .08 + 2.0 * bk); BM.bulb.material.color.copy(BR.bulb.material.color);
      bulbL.position.copy(bw).add(V3(0, -.05, .1)); bulbL.intensity = 7.5 * bk; bulbLM.position.copy(bm); bulbLM.intensity = 6.0 * bk;
      bulbG.visible = bulbGM.visible = bk > .05; bulbG.position.copy(bw); bulbGM.position.copy(bm); bulbG.material.opacity = bulbGM.material.opacity = Math.min(1, bk);
      winL.position.copy(BA).add(V3(-.2, 1.9, -.9)); winL.intensity = .9;
      fill.position.copy(BA).add(V3(-.2, 1.9, 1.6)); fill.intensity = .45 + .9 * bk; fill.color.set('#c8d4f0');
      const H0 = V3(BA.x + HOLE_C.x, HOLE_C.y, BA.z + HOLE_C.z);
      const refl = fut[lookOf(t)];
      // the man in the glass: what's in the future room
      const empty = (id === 'empty' && t >= T.empty) || id === 'postcard' || id === 'leave' || id === 'through';
      BM.badge.visible = t < 246; BM.case.visible = t < 252 && !empty; BM.caseOpen.visible = t >= 252 && !empty; BM.sheet.visible = t < 249 && !empty;
      if (empty) { BM.towel.visible = false; BM.cup.visible = false; BM.postcard.visible = true; }
      if (id === 'leave' || id === 'through') { BR.boxes.visible = id === 'leave'; BR.case.visible = false; BR.cup.visible = id === 'leave' ? false : false; BR.towel.visible = false; }
      let hf = 'idle0', at = V3(BA.x + .78, 0, BA.z + .05);
      const sink = V3(BA.x + .78, 0, BA.z + .05);
      if (id === 'open') {
        const k = ss(seg(t, T.walkIn[0], T.walkIn[1])); at = V3(lerp(BA.x - .9, sink.x, k), 0, lerp(BA.z + .9, sink.z, k));
        hf = t < T.walkIn[1] ? walk4(t, 6) : t < T.yawn + 1.6 ? (t > T.yawn ? 'yawn' : 'idle0') : t < 9.4 ? blinkOr(t, 'idle0', 'blink') : t < 14.6 ? 'wide' : t < 16.6 ? (t < 15.6 ? 'stare' : 'lean') : t < T.wave ? 'lean' : t < T.palm + .4 ? (Math.floor(t * 2.4) % 2 ? 'wave' : 'wave2') : t < T.recoil ? 'stare' : t < T.recoil + 1.4 ? 'recoil' : blinkOr(t, 'worry', 'worryF');
        if (t < T.walkIn[0]) at = V3(BA.x - 2, 0, BA.z + 1.6);
        if (t > T.recoil) { const k2 = ss(seg(t, T.recoil, T.recoil + .7)); at = V3(sink.x - .45 * k2, 0, sink.z + .25 * k2); }
      } else if (id === 'glass') {
        hf = poseGlass(t);
      } else if (id === 'inventory') { hf = blinkOr(t, 'lean', 'blink'); }
      else if (id === 'morning2') { hf = t < T.click2 + .6 ? 'idle0' : Math.floor(t * 3) % 2 ? 'brush' : 'idle0'; if (t > 153) hf = Math.floor(t * 3) % 2 ? 'brush' : 'yawn'; }
      else if (id === 'morning3') { hf = t < T.click3 + 1.2 ? 'idle0' : blinkOr(t, 'stare', 'blink'); }
      else if (id === 'morning4') { hf = t < T.click4 + .8 ? 'idle0' : t < T.away + .6 ? blinkOr(t, 'stare', 'blink') : t < 206.6 ? 'worry' : t < 209.2 ? (Math.floor(t * 2.6) % 2 ? 'call' : 'talkO') : blinkOr(t, 'worryF', 'flatBlink'); }
      else if (id === 'sit') { at = V3(BA.x - .45, .22, BA.z - BD / 2 + .82); hf = blinkOr(t, t > 232 ? 'sitSmile' : 'sit', 'sitBlink'); }
      else if (id === 'habit') {
        const i = Math.max(0, HABIT.filter(a => a <= t).length - 1), poses = ['brush', 'yawn', 'idle0', 'smile', 'brush', 'left', 'smile', 'wave', 'smile'];
        hf = poses[i % poses.length];
      } else if (id === 'empty') {
        const k = ss(seg(t, T.click5 + .3, T.click5 + 2.4)); at = V3(lerp(BA.x - .9, sink.x, k), 0, lerp(BA.z + .9, sink.z, k));
        hf = k < 1 ? walk4(t, 6) : t < T.empty ? blinkOr(t, 'smile', 'smileBlink') : t < 312 ? 'wide' : (t > 314.6 && t < 315.6) || (t > 317.2 && t < 318.6) ? 'talk' : t < T.runOut ? blinkOr(t, 'worry', 'worryF') : walk4(t, 9);
        if (t > T.runOut) { const k2 = ss(seg(t, T.runOut, T.runOut + 2.4)); at = V3(lerp(sink.x, BA.x - 1.2, k2), 0, lerp(sink.z, BA.z + 1.4, k2)); theo.root.visible = true; }
      } else if (id === 'postcard') {
        const k = ss(seg(t, 350.0, 351.6)); at = V3(lerp(BA.x - .6, sink.x, k), 0, lerp(BA.z + .9, sink.z, k));
        hf = k < 1 ? walk4(t, 8) : t < T.check ? blinkOr(t, 'lean', 'blink') : t < T.check + 2 ? 'touch' : t < 359 ? 'worryF' : t < 361 ? 'talk' : blinkOr(t, 'smile', 'smileBlink');
      } else if (id === 'leave') { hf = t < T.towel ? blinkOr(t, 'idle0', 'blink') : t < T.towel + 1.6 ? 'towel' : blinkOr(t, 'smile', 'smileBlink'); BR.cover.visible = t > T.towel + 1.3; }
      if (!['through'].includes(id)) {
        place(theo, at.x, at.y, at.z); theo.frame(hf); theo.face(cam, (id === 'empty' && t > T.runOut) || (id === 'postcard' && t < 351.6 && false));
        if (id === 'empty' && t > T.runOut) theo.mesh.scale.x = -1;
        if (!empty) {
          // the man in the glass: a copy, except when he isn't (the first morning, the lag, the morning he turns away)
          let rf = hf, src = theo;
          if (id === 'open' && t > T.notice) { rf = t < T.palm ? blinkOr(t, 'stare', 'blink', .37) : blinkOr(t, 'palm', 'palmB', .9); src = { root: { position: sink } }; }
          if (id === 'glass' && t > T.left - 1 && t < T.left + 6) rf = poseGlass(t - T.lag);
          if (id === 'morning4' && t > T.away) { rf = blinkOr(t, 'worryF', 'flatBlink', .5); src = { root: { position: sink } }; }
          refl.frame(refl.atlas.names.includes(rf) ? rf : 'idle0');
          const cut = id === 'sit' || id === 'habit' || id === 'inventory';
          mirrorChar(refl, src, BA.x + BW / 2, H0, cam, cut ? 0 : 1);
          if (id === 'morning4' && t > T.away) { const k3 = ss(seg(t, T.away, T.away + .5)); refl.mesh.scale.x = k3 > .5 ? 1 : -1; refl.root.position.x += .1 * k3; }
          // a reflection walking in from the left of the glass only appears once it is at the sink
          if (id === 'open' && t < T.walkIn[1] - .8) refl.root.visible = false;
          if (id === 'empty' && t < T.empty) { refl.root.visible = t > T.click5 + 2.0; }
        }
      }
      if (['sit', 'habit', 'inventory'].includes(id)) { BM.ceil.visible = false; BM.front.visible = false; }
      // focus
      focusOn = theo.root.position.clone().add(V3(0, 1.3, 0));
      if (id === 'open' && t < T.walkIn[0] + 1) focusOn = sink.clone().add(V3(0, 1.2, 0));
      if (id === 'open' && t > T.notice && t < 21.6) focusOn = H0.clone().add(V3(.9, 0, 0));
      if (id === 'glass' && t > T.touch - .5) focusOn = H0.clone().add(V3(.9, 0, 0));
      if (id === 'inventory') focusOn = V3(cam.position.x, 1.1, BA.z - .6);
      if (id === 'sit') { focusOn = V3(BA.x + 1.5, 1.0, BA.z - .6); tiltC = .46; }
      if (id === 'habit') { focusOn = V3(BA.x + 1.5, 0, BA.z - .3); tiltC = .5; tiltW = .2; }
      if (id === 'empty' && t > T.empty) focusOn = H0.clone().add(V3(.8, 0, 0));
      if (id === 'postcard' && t > 351 && t < 380) focusOn = H0.clone().add(V3(.02, .2, .3));
      if (id === 'through') { focusOn = H0.clone(); if (lt > 4.5) { BR.glass.material.opacity = .07 + .5 * ss(seg(lt, 4.5, 5.95)); } }
      else BR.glass.material.opacity = .07;
    }
    // ——— the seaside bathroom ———
    if (id === 'sea' || (id === 'through' && lt > 6)) {
      const sw = swing(t), bk = id === 'sea' ? (t >= T.click6 ? 1 : 0) : 0;
      const SRb = seaR.userData, SMb = seaM.userData;
      SRb.bulbG.position.set(sw[0], BH + .2, .1 + sw[1]); SMb.bulbG.position.set(sw[0], BH + .2, .1 + sw[1]);
      const bw = SRb.bulb.getWorldPosition(V3(0, 0, 0)), bm = SMb.bulb.getWorldPosition(V3(0, 0, 0));
      SRb.bulb.material.color.setRGB(.3 + 3.2 * bk, .26 + 2.8 * bk, .2 + 2 * bk); SMb.bulb.material.color.copy(SRb.bulb.material.color);
      bulbL.position.copy(bw).add(V3(0, -.05, .1)); bulbL.intensity = 6.5 * bk; bulbLM.position.copy(bm); bulbLM.intensity = 5 * bk;
      bulbG.visible = bulbGM.visible = bk > .05; bulbG.position.copy(bw); bulbGM.position.copy(bm);
      seaWin.position.copy(SB).add(V3(-.5, 1.9, -.8)); seaWin.intensity = 2.2;
      fill.position.copy(SB).add(V3(-.2, 1.9, 1.6)); fill.intensity = 1.0; fill.color.set('#e0ecf4');
      const sink = V3(SB.x + .78, 0, SB.z + .05), H0 = V3(SB.x + HOLE_C.x, HOLE_C.y, SB.z + HOLE_C.z);
      if (id === 'sea') {
        const k = ss(seg(t, T.click6 + .4, T.click6 + 3.4)); place(theoS, lerp(SB.x - .9, sink.x, k), 0, lerp(SB.z + .9, sink.z, k));
        theoS.frame(k < 1 ? walk4(t, 6) : t < 515.0 ? blinkOr(t, 'idle0', 'blink') : t < T.waveR + 1.2 ? 'stare' : t < T.waves[0] ? 'wide' : t < T.waves[1] ? (Math.floor(t * 2.2) % 2 ? 'waveS' : 'waveS2') : blinkOr(t, 'smile', 'smileBlink'));
        theoS.face(cam, false);
        const r = fut.fut3, ind = t > T.waveR - .2 && t < T.waves[1];
        r.frame(ind ? (Math.floor(t * 2.2) % 2 ? 'waveS' : 'waveS2') : theoS.cur); mirrorChar(r, theoS, SB.x + BW / 2, H0, cam, 1); if (k < .8) r.root.visible = false;
        focusOn = t < 515 ? theoS.root.position.clone().add(V3(0, 1.3, 0)) : H0.clone().add(V3(.7, 0, 0));
      } else focusOn = H0.clone();
    }
    // ——— the flat ———
    if (id === 'tests' || id === 'practice' || id === 'practice2' || id === 'door') {
      const day = id !== 'practice' && id !== 'practice2';
      FL.win.material.color.set(day ? '#c8d8ec' : '#141c2c');
      fill.position.copy(LR).add(V3(.2, 2.0, 2.4)); fill.intensity = day ? .9 : 1.3; fill.color.set(day ? '#fff0e0' : '#7a94d0');
      lampL.intensity = day ? .4 : 2.2; lampLM.intensity = day ? 2.0 : lampL.intensity * .8; lampG.visible = true;
      winL.position.copy(LR).add(V3(-1.1, 1.6, -.8)); winL.intensity = day ? 1.6 : .3; winL.color.set(day ? '#e8f0ff' : '#5a70a8');
      const H0 = V3(LR.x + RW / 2, 1.5, LR.z - .15);
      if (id === 'tests') {
        let x = LR.x + .9, z = LR.z + .3, f = t < T.phone ? idle(t) : t < 86 ? 'phone' : 'idle0';
        if (t > T.hall[0]) { const k = ss(seg(t, T.hall[0], T.hall[1])); x = lerp(x, LR.x + RW / 2 - .55, k); z = lerp(z, LR.z - .1, k); f = k < 1 ? walk4(t, 6) : blinkOr(t, 'stare', 'blink'); }
        if (t > T.door1) { const k = ss(seg(t, T.door1, T.door1 + 3.4)); x = lerp(LR.x + RW / 2 - .55, LR.x - RW / 2 - .3, k); z = lerp(LR.z - .1, LR.z + .7, k); f = k < 1 ? walk4(t, 7) : 'knock'; }
        place(theo, x, 0, z); theo.frame(f); theo.face(cam, t > T.door1); if (t > T.door1) theo.mesh.scale.x = -1;
        if (t > T.door1 + 1.2) FL.door.rotation.y = -1.3 * ss(seg(t, T.door1 + 1.2, T.door1 + 2.2));
        if (t > T.hall[0] && t < T.door1 + .6) { const r = fut.young; r.frame(theo.cur); mirrorChar(r, theo, LR.x + RW / 2, H0, cam, 1); }
        focusOn = theo.root.position.clone().add(V3(0, 1.1, 0));
      } else if (id === 'practice') {
        FL.case.visible = t < T.caseOpen; FL.caseOpen.visible = t >= T.caseOpen; FL.stool.visible = true;
        let f = t < T.caseOpen ? 'reach' : t < T.play[0] ? blinkOr(t, 'sitSmile', 'sitBlink') : t < T.stop ? (Math.floor(t * 2.2) % 2 ? 'play0o' : 'play1o') : t < 193.0 ? 'playStop' : t < 194.8 ? 'playTalk' : t < 195.6 ? 'playStopB' : 'playSlump';
        if (t < T.caseOpen) place(theo, LR.x + .6, 0, LR.z + .8); else place(theo, LR.x - .55, .15, LR.z + .5);
        if (t >= T.caseOpen) FL.caseOpen.visible = true;
        theo.frame(f); theo.face(cam, false); pracL.position.copy(theo.root.position).add(V3(.9, 1.3, 1.1)); pracL.intensity = 2.4;
        focusOn = theo.root.position.clone().add(V3(0, .9, 0));
      } else if (id === 'practice2') {
        FL.case.visible = false; FL.caseOpen.visible = true; FL.stool.visible = true;
        place(theo, LR.x - .55, .15, LR.z + .5);
        theo.frame(t < T.play2[0] ? blinkOr(t, 'playRest', 'sitBlink') : t < T.play2[1] ? (Math.floor(t * (t > 408 ? 2.6 : 1.9)) % 2 ? 'play0' : 'play1') : 'playRest');
        theo.face(cam, false); pracL.position.copy(theo.root.position).add(V3(.9, 1.3, 1.1)); pracL.intensity = 2.6 + .4 * Math.sin(t * 1.3);
        lampL.intensity = 1.2;
        focusOn = theo.root.position.clone().add(V3(0, .9, 0));
      } else {
        FL.boxes.visible = true; FL.case.visible = false;
        FL.door.rotation.y = -1.3;
        const tk = T.scarf;
        const th = t < tk + 2 ? theo : theoScarf;
        place(th, LR.x - RW / 2 + .7, 0, LR.z + .55); th.frame(t < 433.4 ? blinkOr(t, 'caseIdle', 'caseBlink') : t < 437.2 ? 'caseSmile' : t < 439.0 ? 'talk' : t < tk ? 'smile' : t < tk + 2 ? 'scarfGet' : blinkOr(t, 'caseSmile', 'caseBlink'));
        th.face(cam, true); th.mesh.scale.x = -1;
        place(nan, LR.x - RW / 2 - .55, 0, LR.z + .6); nan.frame(t < 433.4 ? idle(t) : t < 436.8 ? 'scarfTalk' : t < tk + .4 ? 'scarf' : blinkOr(t, 'smile', 'smileBlink')); nan.face(cam, false);
        focusOn = V3(LR.x - RW / 2, 1.1, LR.z + .55);
      }
    }
    // ——— Nan's flat ———
    if (id === 'nan1' || id === 'nan2') {
      nanL1.intensity = 3.0; nanL2.intensity = 2.0;
      fill.position.copy(NF).add(V3(0, 2.0, 2.6)); fill.intensity = 1.0; fill.color.set('#ffe0c0');
      const sp = a => VOA.some(v => v.id.startsWith(a) && t > v.t && t < v.t + v.d);
      let tx = NF.x - 1.55, tz = NF.z + .6, tf;
      if (id === 'nan1') {
        if (t < 100.9) { const k = ss(seg(t, 100.0, 100.9)); tx = lerp(NF.x - 2.8, tx, k); tf = walk4(t, 7); }
        else tf = sp('t') ? 'talk' : t > 127 ? blinkOr(t, 'flat', 'flatBlink') : idle(t);
        if (t > 145) { const k = ss(seg(t, 145.0, 146.0)); tx = lerp(NF.x - 1.55, NF.x - 2.1, k); tf = k > 0 && k < 1 ? walk4(t, 6) : tf; }
        if (t > T.cough1[0]) tf = t < 148.2 ? blinkOr(t, 'worry', 'worryF') : tf;
        if (t > 148.2) { const k = ss(seg(t, 148.2, 150)); tx = lerp(NF.x - 2.1, NF.x - 3.0, k); tf = walk4(t, 6); }
      } else {
        if (t < 330.8) { const k = ss(seg(t, 330.0, 330.8)); tx = lerp(NF.x - 2.8, tx, k); tf = walk4(t, 9); }
        else tf = sp('t') ? (t < 334 ? 'talkO' : 'talk') : blinkOr(t, 'worry', 'worryF');
        if (t < 330.8) tf = walk4(t, 9);
        if (t > T.back) { const k = ss(seg(t, T.back, T.back + 2.6)); tx = lerp(NF.x - 1.55, NF.x - 3.0, k); tf = k < 1 ? walk4(t, 9) : tf; }
      }
      if (id === 'nan2') {   // Nan in her armchair, a blanket over her knees; Theo standing beside her
        tx = NF.x + .42; tz = NF.z - .12;
        if (t < 330.8) { const k = ss(seg(t, 330.0, 330.8)); tx = lerp(NF.x - 1.2, tx, k); }
        if (t > T.back) { const k = ss(seg(t, T.back, T.back + 2.6)); tx = lerp(NF.x + .42, NF.x - 2.6, k); tz = lerp(tz, NF.z + .7, k); }
      }
      place(theo, tx, 0, tz); theo.frame(tf); theo.face(cam, false);
      if ((id === 'nan1' && t > 145.0 && !(t > T.cough1[0] && t < 148.2)) || (id === 'nan2' && (t < 330.8 ? false : true))) theo.mesh.scale.x = -1;
      if (id === 'nan2' && t < 330.8) theo.mesh.scale.x = 1;
      if (id === 'nan1') {
        place(nan, NF.x - .2, 0, NF.z + .55);
        nan.frame(t > T.cough1[0] && t < T.cough1[1] ? (Math.floor(t * 5) % 2 ? 'cough' : 'cough2') : sp('a') ? 'cupTalk' : blinkOr(t, 'cup', 'blink', .7)); nan.face(cam, true); nan.mesh.scale.x = -1;
        focusOn = V3(NF.x - .9, 1.1, NF.z + .55);
      } else {
        place(nanB, NF.x - .6, .2, NF.z - .42);
        nanB.frame(t > 333.1 && t < 334.4 ? 'sitCough' : sp('a') ? 'sitTalk' : blinkOr(t, t > 346.6 ? 'sitSmile' : 'sitWorry', 'sitBlink', .7)); nanB.face(cam, false);
        focusOn = V3(NF.x - .1, 1.0, NF.z - .2);
      }
    }
    // ——— Main Street ———
    if (id === 'walk') {
      place(theo, hx, .14, -4.3); theo.frame(t > 166.5 && t < 168.5 ? 'idle0' : walk4(t, 6)); theo.face(cam, true); theo.mesh.scale.x = -1;
      folk.slice(0, 4).forEach((f, i) => { const x = hx - 6 - i * 4.5 + ((t * (i % 2 ? .8 : 1.1)) % 20) * (i % 2 ? 1 : -1) * .3; place(f, x, .14, i % 2 ? -4.6 : -3.9); f.frame(walk4(t + i, 6)); f.face(cam, i % 2 === 0); if (i % 2 === 0) f.mesh.scale.x = -1; });
      focusOn = theo.root.position.clone().add(V3(0, 1, 0));
    }
    if (id === 'notice') {
      let x = NOTE.x + 1.0, f = blinkOr(t, t > 171 ? 'worryF' : 'stare', 'blink');
      if (t < 160.4) { const k = ss(seg(t, 157.0, 160.4)); x = lerp(NOTE.x + 5, x, k); f = walk4(t, 6); }
      else if (t > 168.8 && t < 170.2) f = 'talk';
      if (t > 401.6) { const k = ss(seg(t, 401.6, T.post[0])); x = lerp(NOTE.x + 1.0, POST.x - .55, k); f = k < 1 ? walk4(t, 6) : t < T.post[1] + .4 ? 'letter' : blinkOr(t, 'smile', 'smileBlink'); }
      const z = t > 401.6 ? lerp(-4.4, POST.z - .1, ss(seg(t, 401.6, T.post[0]))) : -4.4;
      place(theo, x, .14, z); theo.frame(f); theo.face(cam, t < 394); if (t < 394) theo.mesh.scale.x = -1;
      folk.slice(2, 5).forEach((fk, i) => { const xx = NOTE.x + 9 - ((t - 150) * (1 + i * .3)) % 22; place(fk, xx, .14, -3.7 - i * .4); fk.frame(walk4(t + i * .3, 6)); fk.face(cam, true); fk.mesh.scale.x = -1; });
      focusOn = theo.root.position.clone().add(V3(0, 1.1, 0));
    }
    // ——— the roof ———
    if (id === 'roof') {
      roofLamp.position.copy(ROOF).add(V3(.55, .7, .55)); roofLamp.intensity = 3.2 * flick(t, 2); lanternG.visible = true;
      fill.position.copy(ROOF).add(V3(1.5, 1.5, 2.4)); fill.intensity = .8; fill.color.set('#7a94d0');
      place(theo, ROOF.x, ROOF.y + .2, ROOF.z + .05); theo.face(cam, false);
      theo.frame(t < T.roofPlay[0] ? 'playRest' : t < T.roofPlay[1] ? (Math.floor(t * 1.6) % 2 ? 'play0' : 'play1') : t < T.cough2[0] + .3 ? blinkOr(t, 'playRest', 'sitBlink') : t < 294.3 ? 'playStop' : t < 296 ? 'playTalk' : 'playStopB');
      const on = t > T.nanWin - 1.2 && t < T.nanOut;
      balW.material.color.set('#ffc890').multiplyScalar(t < T.nanOut ? (lt > 22 ? .9 : 1.6) : t < T.nanOut + .12 ? .4 : .04);
      if (on) { balL.intensity = 2.0; place(nan, BAL.x - .1, BAL.y, BAL.z); nan.frame(t < 287.2 ? 'idle0' : t < 289.4 ? 'call' : t < T.cough2[0] ? 'call2' : (Math.floor(t * 5) % 2 ? 'cough' : 'cough2')); nan.face(cam, true); nan.mesh.scale.x = -1; }
      focusOn = lt < 9 || lt >= 32.3 ? theo.root.position.clone().add(V3(0, .8, 0)) : lt >= 22.6 ? V3(BAL.x - .1, BAL.y + .95, BAL.z) : null;
      if (lt >= 9 && lt < 22.6) tiltC = .42;
    }
    // ——— the train ———
    if (id === 'train') { train.position.x = lerp(-90, 75, ss(seg(t, T.trainIn - 1, 461.5)) * .9 + seg(t, T.trainIn - 1, 461.5) * .1); train.children.forEach(c => { c.userData.winM.emissiveIntensity = 1.2; }); focusOn = V3(train.position.x - 20, 2, RAIL.z); tiltC = .45; }
    else train.position.x = -400;
    // ——— the audition ———
    if (id === 'audition') {
      const k = ss(seg(t, 462.4, T.chair)); spot.intensity = 70; deskL.intensity = .6;
      fill.position.copy(AH).add(V3(.6, 2.2, 1.6)); fill.intensity = .35; fill.color.set('#ffd8b0');
      if (k < 1) { place(theo, lerp(AH.x - 3.6, AH.x - .2, k), .6, AH.z - 1.1); theo.frame(walk4(t, 6, 'wc')); }
      else {
        place(theo, AH.x - .05, .78, AH.z - 1.05);
        theo.frame(t < T.solo[0] ? blinkOr(t, 'playRest', 'sitBlink') : t < T.snap ? (Math.floor(t * 1.5) % 2 ? 'play0' : 'play1') : t < 478.6 ? 'playStop' : t < 482.2 ? blinkOr(t, 'playStopB', 'playStop') : t < 483.8 ? 'playTalk' : t < T.resume ? 'playStopB' : t < T.soloEnd ? (Math.floor(t * 2.0) % 2 ? 'play0' : 'play1') : t < 491.4 ? 'play1o' : 'playRest');
      }
      theo.face(cam, false);
      panel.forEach((p, i) => { place(p, AH.x - 2.4 + i * .8, 0, AH.z + 3.9); p.frame(i === 1 && t > 478.4 && t < 480.6 ? 'lean' : 'sit'); p.face(cam, false); });
      if (t > T.snap && t < T.resume) { spot.intensity = 70 * (1 - .18 * ss(seg(t, T.snap, T.snap + 3))); }
      focusOn = theo.root.position.clone().add(V3(0, .9, 0));
    }
    // ——— the wides ———
    if (id === 'title') { focusOn = V3(HB.x + 2.4, RH - 1.4, HB.z + 6); tiltC = .5; }
    if (id === 'endWide') { focusOn = paWin.position.clone(); tiltC = .52; }

    cam.updateProjectionMatrix();
    const fo = focusOn || look || V3(0, 0, 0);
    post.dof.focus = cam.position.distanceTo(fo);
    const far = ['title', 'endWide', 'train'].includes(id) || (id === 'roof' && lt > 12 && lt < 22.6);
    post.dof.aper = far ? 420 : 240; post.dof.maxCoc = far ? 20 : 16;
    if (id === 'glass' || id === 'postcard' || id === 'through') { post.dof.aper = 120; post.dof.maxCoc = 12; }
    if ((id === 'audition' && t > T.snap && t < T.resume + 1) || id === 'practice2' || id === 'nan2') { post.dof.aper = 150; post.dof.maxCoc = 14; }
    post.bloom.strength = id === 'roof' && lt > 22 ? .5 : night || KEY_OF[id] === 'hall' ? .75 : BATH.includes(id) ? .6 : .45; post.bloom.threshold = night ? .78 : .86;
    post.vig.uniforms.warm.value = KEY_OF[id] === 'nan' ? .2 : id === 'sea' || id === 'endWide' ? .04 : .1;
    post.vig.uniforms.amt.value = night || BATH.includes(id) || KEY_OF[id] === 'hall' ? .66 : .55;
    const band = id === 'endWide' ? 1 - ss(seg(t, 548, 554)) * .6 : 1;
    if (tiltW == null && (id === 'glass' || id === 'postcard')) tiltW = .2;
    return { tiltC, track: tiltC == null ? fo : null, tiltW, band };
  }
  // voice spans for "who is talking"
  const VOA = [];
  return { scene, update, setVoices(vs) { VOA.push(...vs); } };
}
