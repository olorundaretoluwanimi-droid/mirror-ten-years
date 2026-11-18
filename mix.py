# Mix: score (out/score.wav) + ambience beds per place + event foley + voices → out/mix.wav
# Reads events.json (export with: node core/render/events.mjs <project>) for voice and event times.
# Usage: <LIB>/.venv/bin/python mix.py
import sys, os, json, numpy as np, soundfile as sf
from scipy.ndimage import uniform_filter1d
from scipy.signal import resample_poly
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.expanduser('~/lemo-opuscar')
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
from sfx import *

E = json.load(open(os.path.join(HERE, 'events.json')))
DUR = E['dur']; EV = E['ev']; N = int(DUR * SR); tt = np.arange(N) / SR
rng = np.random.default_rng(31)
def stereo(x, pan=0.0): l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4); return np.stack([x * l * 1.414, x * r * 1.414], 1)
def place(buf, x, t, pan=0.0, g=1.0):
    s = int(t * SR); x = stereo(x, pan) if x.ndim == 1 else x
    if s >= len(buf) or s < 0: return
    n = min(len(x), len(buf) - s); buf[s:s + n] += x[:n] * g
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
def full(fn): return fn(DUR)[:N]
def gate(*spans, fi=.5, fo=.5):
    g = np.zeros(N)
    for a, b in spans: g = np.maximum(g, np.clip(np.minimum((tt - a) / fi + 1, (b - tt) / fo + 1), 0, 1))
    return g

# —— Ambience beds ——
NZ = full(noise); BR = full(brown)
def chirps(n, f0, f1, seed, d0=.06, d1=.16):
    r = np.random.default_rng(seed); o = np.zeros(N)
    for k in range(n):
        t0 = r.uniform(0, DUR); f = r.uniform(f0, f1); d = r.uniform(d0, d1); m = int(d * SR); x = np.arange(m) / SR
        ch = np.sin(2 * np.pi * np.cumsum(f * (1 + .35 * np.sin(2 * np.pi * r.uniform(15, 30) * x))) / SR) * np.sin(np.pi * x / d) ** 2
        s = int(t0 * SR); o[s:s + m] += ch[:max(0, min(m, N - s))] * r.uniform(.2, .6)
    return o
birds = chirps(380, 2600, 4300, 1)
gulls = np.zeros(N)
for k in range(90):
    t0 = rng.uniform(0, DUR); d = rng.uniform(.4, .9); m = int(d * SR); x = np.arange(m) / SR
    f = 1200 * (1 + .5 * np.sin(np.pi * x / d)) * (1 - .3 * x / d); g = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x / d) ** 1.5
    g = bp(g + .3 * np.sin(2 * np.pi * np.cumsum(f * 2.01) / SR), 700, 5000); s = int(t0 * SR); gulls[s:s + m] += g[:max(0, min(m, N - s))] * rng.uniform(.2, .5)
seaWash = lp(NZ, 900) * (.5 + .5 * np.sin(2 * np.pi * tt / 7.5) ** 2) + bp(np.roll(NZ, 777), 1500, 6000) * .15 * (np.sin(2 * np.pi * tt / 7.5 + 1.2) > .6)
roomTone = lp(np.roll(BR, 4321), 160) * .7
pipes = np.zeros(N)
for k in range(260):
    t0 = rng.uniform(0, DUR); s = int(t0 * SR); x = t_(.06); c = np.sin(2 * np.pi * rng.uniform(900, 1600) * x) * np.exp(-x / .01)
    pipes[s:s + len(x)] += c[:max(0, min(len(x), N - s))] * rng.uniform(.1, .35)
drip = np.zeros(N); t = .7
while t < DUR - 1:
    s = int(t * SR); x = t_(.12); d = np.sin(2 * np.pi * np.cumsum(1800 + 1400 * np.exp(-x / .02)) / SR) * np.exp(-x / .025); drip[s:s + len(x)] += d[:max(0, min(len(x), N - s))] * .5; t += rng.uniform(2.6, 4.2)
clockTick = np.zeros(N)
for k in range(int(DUR)): s = int(k * SR); x = t_(.03); c = bp(np.random.default_rng(k).standard_normal(len(x)), 2000, 6000) * np.exp(-x / .004); clockTick[s:s + len(x)] += c * (.6 if k % 2 else .45)
traffic = lp(BR, 220) * .8 + bp(np.roll(NZ, 1234), 200, 1200) * .25 * (.5 + .5 * np.sin(2 * np.pi * .05 * tt) ** 2)
wind = bp(np.roll(NZ, 2222), 200, 1400) * (.4 + .6 * np.sin(2 * np.pi * .07 * tt) ** 2)
hallTone = lp(np.roll(BR, 55), 120) * .8 + bp(np.roll(NZ, 909), 200, 900) * .04
bulbBuzz = (np.sin(2 * np.pi * 100 * tt) + .4 * np.sin(2 * np.pi * 200 * tt) + .2 * np.sin(2 * np.pi * 300 * tt)) * .12
stationHum = lp(np.roll(BR, 3131), 200) * .6 + bp(np.roll(NZ, 4141), 300, 2000) * .06
BATH = [(2.0, 27.5), (37.5, 80), (150, 157), (175, 182), (200, 262), (300, 330), (350, 392), (420, 430), (495, 501)]
g_bath = gate(*BATH, fi=.4, fo=.4)
g_bathBirds = gate((2.0, 27.5), (150, 157), (175, 182), (200, 212), (300, 305), (420, 430), fi=1, fo=.4)
g_flat = gate((80, 100), (182, 200), (392, 420), (430, 446), fi=.4, fo=.4)
g_nan = gate((99.6, 150), (329.2, 350), fi=.6, fo=.4)       # J-cut: the knock is heard before the cut
g_street = gate((27.5, 37.5), (157, 175), fi=.6, fo=.4)
g_roof = gate((262, 297.6), fi=.6, fo=1.6)
g_train = gate((444.0, 462), fi=2.0, fo=.4)                  # J-cut from the doorway
g_hall = gate((462, 495), fi=.4, fo=.4)
g_sea = gate((501, 555), fi=1.0, fo=1.5)
g_buzz = gate((305.0, 330), fi=.05, fo=.4)
amb = (stereo(roomTone * (g_bath + g_flat + g_nan) * .8, 0) + stereo(pipes * g_bath, .35) + stereo(drip * g_bath * .5, .25)
       + stereo(birds * (g_bathBirds * .35 + g_street * .7 + g_flat * .2), -.3) + stereo(np.roll(birds, 9001) * (g_street * .6), .35)
       + stereo(clockTick * g_nan * .35, .3) + stereo(traffic * g_street, -.2) + stereo(np.roll(traffic, 8001) * g_street, .2)
       + stereo(wind * g_roof, -.2) + stereo(np.roll(traffic, 5003) * g_roof * .4, .3)
       + stereo(stationHum * g_train, 0) + stereo(gulls * (g_train * .3 + g_sea), -.25) + stereo(np.roll(gulls, 33333) * g_sea * .7, .35)
       + stereo(hallTone * g_hall, 0) + stereo(seaWash * g_sea, -.15) + stereo(np.roll(seaWash, 44444) * g_sea, .15)
       )
# the empty glass: everything stops at 305.0 for three seconds; only the bulb's buzz is left
amb *= (1 - gate((305.0, 308.6), fi=.02, fo=1.2))[:, None]
amb *= (1 - .8 * gate((293.4, 300), fi=.05, fo=.4))[:, None]          # Nan's light goes out: the night goes quiet
amb *= (1 - .6 * gate((476.0, 484.4), fi=.02, fo=.8))[:, None]        # the snapped string: the hall holds its breath
amb += stereo(bulbBuzz * g_buzz, .1)

# —— Foley ——
fx = np.zeros((N, 2))
def tone(f, d, tau, v=1.0, h=((1, 1),)):
    x = t_(d); return norm(sum(a * np.sin(2 * np.pi * f * m * x) for m, a in h) * np.exp(-x / tau) * np.minimum(1, x / .004)) * v
def ping(v=1.0, f=1568): return tone(f, .5, .14, v, ((1, 1), (2, .25)))
def place_m(buf, x, t): s = int(t * SR); n = min(len(x), len(buf) - s); buf[s:s + n] += x[:n]
def stepT(v=1.0): d = .1; x = t_(d); return norm(bp(noise(d), 1500, 8000) * np.exp(-x / .008) + np.sin(2 * np.pi * 420 * x) * np.exp(-x / .01) * .5) * v   # tile
def stepW(v=1.0): d = .12; x = t_(d); return norm(bp(noise(d), 300, 2500) * np.exp(-x / .015) + np.sin(2 * np.pi * 160 * x) * np.exp(-x / .02) * .6) * v   # wood
def stepP(v=1.0): d = .09; x = t_(d); return norm(bp(noise(d), 600, 4500) * np.exp(-x / .014) + np.sin(2 * np.pi * 220 * x) * np.exp(-x / .012) * .35) * v  # paving
def pullcord(v=1.0): o = np.zeros(int(.8 * SR)); place_m(o, click(1.6, .9), 0); place_m(o, tone(3200, .5, .12, .35, ((1, 1), (2.6, .3))), .03); return norm(o) * v
def knock(v=1.0): o = np.zeros(int(1.0 * SR)); [place_m(o, thump(1, 110)[:int(.15 * SR)] + bp(noise(.15), 400, 2500) * np.exp(-t_(.15) / .02) * .6, k * .22) for k in range(3)]; return norm(o) * v
def latch(v=1.0): o = np.zeros(int(.3 * SR)); place_m(o, click(1.3, 1), 0); place_m(o, tone(1900, .2, .04, .4), 0); return norm(o) * v
def cloth(v=1.0, d=.6): x = t_(d); return norm(bp(noise(d), 800, 5000) * np.sin(np.pi * x / d) ** 2) * v
def windowPop(v=1.0): o = np.zeros(int(.6 * SR)); place_m(o, click(.9 + rng.uniform(0, .5), .7), 0); place_m(o, creak(.25)[:int(.4 * SR)], .04); return norm(o) * v
def flickerFx(v=1.0, d=1.6): x = t_(d); return norm(bp(noise(d), 2000, 9000) * (rng.random(len(x)) > .985) * 3 + np.sin(2 * np.pi * 100 * x) * (np.sin(37 * x) > -.2) * .3) * v
def horn(v=1.0, d=1.6): x = t_(d); return norm(lp(sum(np.sign(np.sin(2 * np.pi * f * x)) for f in (311, 392)), 2200) * np.minimum(1, np.minimum(x / .08, (d - x) / .3))) * v
def wheels(d, v=1.0):
    o = np.zeros(int(d * SR)); t = 0.0
    while t < d - .3: place_m(o, thump(.8, 60)[:int(.2 * SR)] + bp(noise(.2), 500, 3000) * np.exp(-t_(.2) / .03) * .5, t); place_m(o, thump(.7, 62)[:int(.2 * SR)], t + .16); t += .9
    return norm(o) * v * np.minimum(1, np.minimum(t_(d) / 3.0, (d - t_(d)) / 2.0))[:len(o)]
def flashFx(v=1.0, d=3.2):
    x = t_(d); out = np.zeros(len(x))
    for i, f in enumerate([1175, 1480, 1760, 2349, 2960]): out += np.sin(2 * np.pi * f * x + i) * np.exp(-x / (.8 + .2 * i)) * np.minimum(1, np.maximum(0, x - i * .05) / .02)
    rise = bp(noise(d), 2000, 10000) * np.exp(-((x - .2) / .25) ** 2)
    return norm(out * .5 + rise * .8) * v
def postbox(v=1.0): o = np.zeros(int(.8 * SR)); place_m(o, bp(noise(.15), 600, 5000) * np.exp(-t_(.15) / .03), 0); place_m(o, clack(.8, .7)[:int(.4 * SR)], .25); return norm(o) * v
def cough(v=1.0, far=False):
    o = np.zeros(int(.7 * SR))
    for k, (d, f) in enumerate([(.16, 1.0), (.12, .8)]):
        x = t_(d); b = bp(noise(d), 250, 2600) * np.exp(-x / .05) * np.minimum(1, x / .006) + np.sin(2 * np.pi * 180 * x) * np.exp(-x / .03) * .25
        place_m(o, b * f, k * .24)
    o = norm(o) * v
    return lp(o, 2200) * .8 if far else o
def snapFx(v=1.0):   # a cello string breaking: a crack, then the string's slack twang falling away
    d = 1.4; x = t_(d)
    crack = bp(noise(d), 2500, 11000) * np.exp(-x / .006) * 1.6
    f = 196 * (1 - .45 * (1 - np.exp(-x / .08))); tw = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x / .25) + .4 * np.sin(2 * np.pi * np.cumsum(f * 2.02) / SR) * np.exp(-x / .15)
    return norm(crack + tw * .7) * v
def scrape(v=1.0, d=.5): x = t_(d); return norm(bp(noise(d), 500, 3200) * (1 + .6 * np.sin(2 * np.pi * 31 * x)) * np.sin(np.pi * x / d)) * v
def lightOff(v=1.0): o = np.zeros(int(.6 * SR)); place_m(o, click(1.4, 1), 0); x = t_(.4); place_m(o, np.sin(2 * np.pi * 100 * x) * np.exp(-x / .06) * .3, .01); return norm(o) * v
def chairFx(v=1.0): o = np.zeros(int(.8 * SR)); place_m(o, creak(.6)[:int(.6 * SR)], 0); place_m(o, thump(.5, 120)[:int(.2 * SR)], .1); return norm(o) * v

STEP = {'tile': stepT, 'wood': stepW, 'pave': stepP, 'stage': stepW}
for e in EV:
    t0, k = e['t'], e['type']
    if k == 'chime': place(fx, ping(.12, 1318), t0)
    elif k == 'tick': place(fx, ping(.1, 2093), t0, .45)
    elif k == 'click': place(fx, pullcord(.55), t0, .15)
    elif k == 'step': place(fx, STEP.get(e.get('surf'), stepP)(.3 * rng.uniform(.8, 1.1)), t0 + rng.uniform(-.01, .01), rng.uniform(-.2, .2))
    elif k == 'door': place(fx, creak(.5), t0, -.4)
    elif k == 'knock': place(fx, knock(.55), t0, -.3)
    elif k == 'postbox': place(fx, postbox(.5), t0, .1)
    elif k == 'latch': place(fx, latch(.5), t0, .1)
    elif k == 'thump': place(fx, thump(1, 62)[:int(.4 * SR)] * .9, t0, .6)
    elif k == 'window': place(fx, windowPop(.22), t0, rng.uniform(-.8, .8))
    elif k == 'flicker': place(fx, flickerFx(.35), t0, .1)
    elif k == 'cloth': place(fx, cloth(.35), t0, 0)
    elif k == 'horn': place(fx, horn(.3), t0, .3)
    elif k == 'trainIn': place(fx, wheels(18.0, .4), t0, 0)
    elif k == 'chair': place(fx, chairFx(.4), t0, 0)
    elif k == 'flash': place(fx, flashFx(.6), t0 - .25, 0)
    elif k == 'cough': far = 289 < t0 < 294; place(fx, cough(.3 if far else .42, far), t0, .45 if far else .15)
    elif k == 'snap': place(fx, snapFx(.75), t0, 0)
    elif k == 'scrape': place(fx, scrape(.35), t0 - .3, 0)
    elif k == 'lightOff': place(fx, lightOff(.3), t0, .4)
    elif k in ('yawn', 'sting'): pass
# breath of the man in the empty glass? no: a single heartbeat in the silence
place(fx, heartbeat(.3), 306.4)

# —— Voices ——
VT = {e['id']: e['t'] for e in EV if e['type'] == 'voice'}
DLG = {e['id'] for e in EV if e['type'] == 'voice' and e.get('dlg')}
Dd = json.load(open(os.path.join(HERE, 'voices', 'dur.json')))
vo = np.zeros((N, 2)); vmask = np.zeros(N)
for k, t0 in VT.items():
    y, sr = sf.read(os.path.join(HERE, 'voices', k + '.wav'))
    if y.ndim > 1: y = y.mean(1)
    if sr != SR: y = resample_poly(y, SR, sr)
    y = compress(norm(y, .9), thr=.25, ratio=3.2)
    act = np.abs(y) > .02 * np.abs(y).max(); y = y * (10 ** (-20 / 20)) / (np.sqrt(np.mean(y[act] ** 2)) + 1e-9)
    if k in DLG: y = lp(y, 7000) * 1.05
    if k.startswith('a') and 286 < t0 < 289: y = lp(y, 4500) * .8          # Nan from her balcony, further off
    pan = -.12 if k.startswith('t') else .15 if k[0] in 'ap' else 0
    place(vo, y, t0, pan); s = int(t0 * SR); vmask[s:s + len(y)] = 1

# —— Music ——
m, sr = sf.read(os.path.join(HERE, 'out', 'score.wav'), always_2d=True)
mus = np.zeros((N, 2)); n = min(len(m), N); mus[:n] = m[:n]
duck = uniform_filter1d(vmask, int(.35 * SR)); mus *= (1 - .2 * np.clip(duck * 1.6, 0, 1))[:, None]

def lvl(x, db): sel = np.abs(x).sum(1) > 1e-4; r = np.sqrt(np.mean(x[sel] ** 2)) if sel.any() else 1; return x * (10 ** (db / 20)) / (r + 1e-9)
voS = lvl(vo, -17); musS = lvl(mus, -21); ambS = lvl(amb, -32); fxS = lvl(fx, -27)
bedG = np.ones(N)
for k, t0 in sorted(VT.items(), key=lambda kv: kv[1]):   # each line dips the bed just enough for 10 dB; overlapping dips take the deeper one
    a, b = int(t0 * SR), int((t0 + Dd[k]) * SR); need = rms_db(voS[a:b]) - 10 - rms_db((musS + ambS + fxS)[a:b]) - 1.5; g = min(1.0, 10 ** (need / 20))
    env = np.interp(tt, [t0 - .35, t0 - .05, t0 + Dd[k] + .1, t0 + Dd[k] + .6], [1.0, g, g, 1.0]); bedG = np.minimum(bedG, env)
musS *= bedG[:, None]; ambS *= (.2 + .8 * bedG)[:, None]; fxS *= (.45 + .55 * bedG)[:, None]
mix = voS + musS + ambS + fxS
pk = np.abs(mix).max(); mix = np.tanh(mix / max(pk, 1e-6) * 1.2) * .9
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR, subtype='FLOAT')
print('wrote out/mix.wav', DUR, 's | vo', round(rms_db(voS), 1), 'mus', round(rms_db(musS), 1), 'amb', round(rms_db(ambS), 1), 'fx', round(rms_db(fxS), 1))
low = []
for k, t0 in sorted(VT.items(), key=lambda kv: kv[1]):
    a, b = int(t0 * SR), int((t0 + Dd[k]) * SR); gap = rms_db(voS[a:b]) - rms_db((musS + ambS + fxS)[a:b])
    if gap < 7: low.append(f'{k}@{t0:.1f}:{gap:.1f}dB')
print('voice over bed below 7 dB:', low or 'none')
