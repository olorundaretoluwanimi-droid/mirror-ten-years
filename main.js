// What If Your Mirror Showed You in 10 Years? — page contract: window.DUR, window.render(t), window.READY, window.TEXTS, window.EV
import * as THREE from 'three';
import { makePost } from './post_ts.js';
import { DUR, shotAt, VO, T, HABIT, CHIPS } from './story.js';
import { buildWorld } from './world.js';
import { drawOverlay, overlayReady } from './ui.js';

const W = 1920, H = 1080, Q = new URLSearchParams(location.search);
const SS = +(Q.get('ss') ?? 1);
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').appendChild(renderer.domElement);
renderer.domElement.style.width = W + 'px'; renderer.domElement.style.height = H + 'px';
const camera = new THREE.PerspectiveCamera(32, W / H, .1, 2000);
const world = buildWorld();
const post = makePost(renderer, world.scene, camera, W, H, { ssaa: SS });
const V = post.vig.uniforms;
if (Q.has('nobloom')) post.bloom.enabled = false;
await overlayReady();
const DURS = await (await fetch('voices/dur.json')).json();
world.setVoices(VO.map(v => ({ id: v.id, t: v.t, d: DURS[v.id] || 2 })));

const TILT = !Q.has('notilt');
const _v = new THREE.Vector3();
window.DUR = DUR;
window.render = t => {
  const shot = shotAt(t);
  post.dof.scene = world.scene;
  V.fade.value = 1; V.warm.value = .1; V.sat.value = 1.05; V.amt.value = .6; V.contrast.value = .2;
  post.bloom.radius = .7;
  const r = world.update(t, shot, camera, post, renderer) || {};
  if (TILT) {
    let c = r.tiltC;
    if (c == null && r.track) { camera.updateMatrixWorld(); _v.copy(r.track).project(camera); c = Math.min(.8, Math.max(.2, _v.y * .5 + .5)); }
    post.dof.tiltAmt = r.tiltAmt ?? 17; post.dof.tiltC = c ?? .45; post.dof.tiltW = (r.tiltW ?? .075) * (r.band ?? 1); post.dof.tiltF = .3;
    post.dof.maxCoc = Math.max(post.dof.maxCoc, 22); V.sat.value *= 1.12; V.contrast.value = .26;
  }
  post.composer.render();
  drawOverlay(t);
};
window.TEXTS = t => drawOverlay(t);   // 2D only: cheap
// Sound events for the mixer (exported by events.mjs)
const ev = (t, type, o = {}) => ({ t, type, ...o });
const steps = (a, b, dt, surf) => { const o = []; for (let x = a; x < b; x += dt) o.push(ev(x, 'step', { surf })); return o; };
window.EV = [
  ...VO.map(v => ({ t: v.t, type: 'voice', id: v.id, dlg: !!v.dlg, sub: v.sub, who: v.who })),
  ...VO.filter(v => v.dlg).map(v => ev(v.t - .45, 'chime')),
  ...CHIPS.map(c => ev(c.a + .05, 'tick')),
  ...[T.click0, T.click2, T.click3, T.click4, T.click5, T.click6, ...HABIT].map(a => ev(a, 'click')),
  ...steps(T.walkIn[0], T.walkIn[1], .5, 'tile'), ev(T.notice, 'motif'), ev(T.yawn, 'yawn'),
  ...steps(T.hall[0], T.hall[1], .5, 'wood'), ...steps(T.door1, T.door1 + 3.2, .45, 'wood'), ev(T.door1 + 1.3, 'door'),
  ev(T.knock1, 'knock'), ev(T.knock2, 'knock'), ev(T.knock3, 'knock'),
  ...steps(157.4, 174.6, .48, 'pave'), ...steps(392.0, 394.0, .48, 'pave'), ...steps(401.6, T.post[0], .48, 'pave'), ev(T.post[1], 'postbox'),
  ev(T.caseOpen, 'latch'), ev(T.caseOpen + .5, 'latch'), ev(T.thump, 'thump'), ev(T.thump + .5, 'thump'),
  ...[...Array(24)].map((_, i) => ev(T.windows[0] + i * (T.windows[1] - T.windows[0]) / 23, 'window', { i })),
  ev(T.empty, 'stop'), ev(T.flicker, 'flicker'), ...steps(T.runOut, T.runOut + 2.4, .32, 'tile'), ...steps(T.back, T.back + 2.6, .32, 'wood'),
  ev(T.towel + 1.3, 'cloth'), ev(T.scarf, 'cloth'), ev(T.horn, 'horn'), ev(T.trainIn - 3, 'trainIn'),
  ...steps(462.4, T.chair, .5, 'stage'), ev(T.chair + .2, 'chair'), ev(T.flash, 'flash'), ...steps(T.click6 + .4, T.click6 + 3.4, .5, 'tile'),
];
window.READY = true;
