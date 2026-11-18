# Original score for "What If Your Mirror Showed You in 10 Years?": 72 bpm, 3/4 (bar = 2.5 s), D major; B minor at the empty glass.
# The mirror motif: four notes, F#-A-D-C#, on glass harp (the sound of the mirror). The waltz theme carries Theo's days;
# the cello section is Theo's cello (practice, the roof, the audition). Instruments: glass harp, harp, strings (arco and
# pizzicato), flute, clarinet, oboe, French horn, glockenspiel, vibraphone (bowed), timpani, suspended cymbal.
# Usage: <LIB>/.venv/bin/python score.py   → out/score.wav
import sys, os, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.expanduser('~/lemo-opuscar')
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR

S.seed(72)
BPM = 72; B = 60 / BPM; BAR = 3 * B
DUR = 555.0
bt = lambda bar, beat=0: (bar - 1) * BAR + beat * B
EV = []
def ev(t, inst, pitch, dur, vel, pan=0, gain=1.0, **kw):
    if 0 <= t < DUR: EV.append(dict(t=t, inst=inst, pitch=pitch, dur=dur, vel=vel, pan=pan, gain=gain, **kw))
m = S.midi
CH = {'D': ['D2', 'A2', 'D3', 'F#3', 'A3'], 'A': ['A1', 'E2', 'A2', 'C#3', 'E3'], 'A7': ['A1', 'E2', 'G2', 'C#3', 'E3'], 'Bm': ['B1', 'F#2', 'B2', 'D3', 'F#3'],
      'G': ['G1', 'D2', 'G2', 'B2', 'D3'], 'Em': ['E2', 'B2', 'E3', 'G3', 'B3'], 'F#m': ['F#1', 'C#2', 'F#2', 'A2', 'C#3'], 'Gmaj7': ['G1', 'D2', 'F#2', 'B2', 'D3'],
      'F#': ['F#1', 'C#2', 'F#2', 'A#2', 'C#3'], 'Em7': ['E2', 'B2', 'D3', 'G3', 'B3']}
P_MAIN = ['D', 'Bm', 'G', 'A']
P_WARM = ['G', 'D', 'Em', 'A']
P_MIN = ['Bm', 'G', 'Em', 'F#']

# The theme: an 8-bar waltz (beats; 3 per bar)
THEME = [(0, 'F#5', 2), (2, 'A5', 1), (3, 'D6', 2), (5, 'C#6', 1), (6, 'B5', 1), (7, 'A5', 1), (8, 'F#5', 1), (9, 'A5', 3),
         (12, 'G5', 2), (14, 'B5', 1), (15, 'E6', 2), (17, 'D6', 1), (18, 'C#6', 1), (19, 'B5', 1), (20, 'A5', 1), (21, 'D6', 3)]
HALF = THEME[:8]
MOTIF = ['F#5', 'A5', 'D6', 'C#6']

def melody(t0, inst, notes, vel=.45, pan=.1, tr=0, gain=1.0, rate=1.0, leg=.92):
    for b, p, d in notes:
        if p: ev(t0 + b * B / rate, inst, m(p) + tr, d * B / rate * leg, vel, pan, gain, attack=.05)
def motif(t0, vel=.5, tr=0, big=False, inst='glass'):
    """The mirror: four notes on glass harp, harp an octave under."""
    for i, p in enumerate(MOTIF):
        t = t0 + i * B * .75; pp = m(p) + tr
        ev(t, inst, pp, 2.4, vel, .15); ev(t, 'harp', pp - 12, 1.6, vel * .6, -.2)
    if big:
        for p in CH['D']: ev(t0 + 3 * B, 'violins' if m(p) >= 55 else 'cellos', m(p) + 12 + tr, BAR * 2, vel * .5, 0, attack=.4)
        ev(t0 + 3 * B, 'horn', m('A3') + tr, BAR * 2, vel * .4, -.1, attack=.3)
def waltz(t0, bars, prog, vel=.28, tr=0, bass='cellos_pizz', up='violins_pizz'):
    """Oom-pah-pah: bass on 1, chord on 2 and 3."""
    for i in range(bars):
        c = CH[prog[i % len(prog)]]; s = t0 + i * BAR
        ev(s, bass, m(c[0]) + 12 + tr, .5, vel * 1.1, -.2)
        for k in (1, 2):
            for p in c[3:5]: ev(s + k * B, up, m(p) + 12 + tr, .3, vel * (.75 if k == 1 else .6), .25)
def pad(t0, bars, prog, vel=.18, upper='violas', low='cellos', att=.6, tr=0):
    for i in range(bars):
        c = CH[prog[i % len(prog)]]; s = t0 + i * BAR
        if low: ev(s, low, m(c[0]) + 12 + tr, BAR * 1.04, vel, -.2, attack=att)
        if upper: ev(s, upper, m(c[3]) + 12 + tr, BAR * 1.04, vel * .8, .25, attack=att); ev(s, upper, m(c[4]) + 12 + tr, BAR * 1.04, vel * .7, .35, attack=att)
def harp(t0, bars, prog, vel=.26, tr=0, per=6):
    for i in range(bars):
        c = [m(x) + 12 + tr for x in CH[prog[i % len(prog)]][1:]]; seq = [c[0], c[1], c[2], c[3], c[2], c[1]]
        for k in range(per): ev(t0 + i * BAR + k * BAR / per, 'harp', seq[k % 6], 1.4, vel * (1 if k == 0 else .78), .3)
def bowed(t0, bars, prog, vel=.12):
    for i in range(bars):
        c = CH[prog[i % len(prog)]]; s = t0 + i * BAR
        for p in c[3:5]: ev(s, 'vibraphone_bowed', m(p) + 24, BAR * 1.1, vel, .1)

# ===== Open (0–27.5): silence, the click (2.0), a harp alone, the mirror at 10.0 =====
harp(bt(2), 3, ['D', 'Bm', 'G'], vel=.14, per=3)
motif(bt(5), vel=.5)                                    # 10.0: the man in the glass
bowed(bt(5), 2, ['D', 'D'], vel=.1)
harp(bt(7), 4, ['Bm', 'G', 'Em', 'A'], vel=.18, per=3)
pad(bt(7), 4, ['Bm', 'G', 'Em', 'A'], vel=.12)
ev(18.4, 'glass', 'A5', 2.0, .32, .2); ev(19.0, 'glass', 'D6', 2.0, .28, .2)     # the wave
pad(bt(9) + 2.5, 3, ['D', 'G', 'A'], vel=.14, upper='violins')
# ===== Title (27.5–37.5): the theme's first half, tutti =====
melody(bt(12), 'flute', HALF, vel=.42, pan=.15)
melody(bt(12), 'glass', HALF[:2], vel=.3, pan=.2)
harp(bt(12), 4, P_MAIN, vel=.26); pad(bt(12), 4, P_MAIN, vel=.2, upper='violins')
ev(bt(12), 'glockenspiel', 'D7', 1.5, .3, .3); ev(bt(12), 'sus_cymbal', None, None, .2, 0)
ev(bt(15, 2), 'timpani', 'A2', 1.0, .3, 0)
# ===== Ch I (37.5–100): a light waltz; the facts over pizzicato; the inventory on bowed vibraphone =====
waltz(bt(16), 10, P_MAIN, vel=.22)
melody(bt(17), 'clarinet', [(0, 'A4', 2), (2, 'D5', 1), (3, 'C#5', 2), (5, 'B4', 1), (6, 'A4', 3)], vel=.28, pan=.2)
melody(bt(21), 'clarinet', [(0, 'B4', 2), (2, 'E5', 1), (3, 'D5', 2), (5, 'C#5', 1), (6, 'D5', 3)], vel=.26, pan=.2)
ev(43.0, 'glass', 'D5', 1.6, .3, .2)                    # "Left hand."
bowed(bt(26), 8, ['Bm', 'G', 'Bm', 'Em'], vel=.11)       # the inventory: reading the future
motif(bt(26) + .4, vel=.3)
for k in range(6): ev(bt(27) + k * 2.5, 'harp', ['B4', 'D5', 'F#5', 'E5', 'G5', 'F#5'][k], 1.6, .18, .3)
waltz(bt(33), 8, P_MAIN, vel=.18)
ev(84.4, 'glockenspiel', 'A6', 1.0, .22, .3)             # "Normal."
ev(98.4, 'cellos_pizz', 'D3', .4, .3, -.2); ev(99.0, 'cellos_pizz', 'A2', .4, .28, -.2)
# ===== Nan (100–150): warm, harp and violas; stops for "Then he's a stranger" =====
harp(bt(41), 7, P_WARM, vel=.18); pad(bt(41), 7, P_WARM, vel=.12)
melody(bt(42), 'oboe', [(0, 'B4', 2), (2, 'D5', 1), (3, 'G5', 3), (6, 'F#5', 2), (8, 'E5', 1), (9, 'D5', 3)], vel=.22, pan=.2)
pad(122.4, 2, ['Em7', 'Em7'], vel=.1, upper='violas', low=None)                 # under Nan's line, after the hard stop
harp(bt(50), 10, ['G', 'D', 'Em', 'A', 'G', 'D', 'Bm', 'A', 'G', 'A'], vel=.16, per=3)
pad(bt(50), 10, ['G', 'D', 'Em', 'A', 'G', 'D', 'Bm', 'A', 'G', 'A'], vel=.12)
melody(bt(54), 'clarinet', HALF, vel=.2, pan=.2, tr=-12)
# ===== Ch II (150–262) =====
motif(150.5, vel=.42)                                    # morning 2
harp(bt(62), 2, ['D', 'A'], vel=.18, per=3)
waltz(157.5, 7, P_MAIN, vel=.26, bass='contrabass_pizz')  # the walk
melody(157.5, 'flute', THEME, vel=.32, pan=.2)
ev(167.0, 'glockenspiel', 'F#6', 1.5, .24, .3); ev(167.4, 'glockenspiel', 'A6', 1.5, .22, .3)   # the music shop
motif(175.5, vel=.42, tr=0); ev(176.3 + 3 * B, 'harp', 'D4', 2, .3, -.2)            # morning 3: a little more
# practice (182–200): Theo's cello, halting; a wrong note at the thump, a pause, then on
pad(182.0, 2, ['D', 'D'], vel=.08, upper=None)
P1 = [(0, 'D3', 2), (2, 'F#3', 1), (3, 'A3', 3), (6, 'G3', 2), (8, 'F#3', 1), (9, 'E3', 3)]
melody(186.0, 'cellos', P1, vel=.34, pan=-.1, rate=.9)
ev(191.6, 'cellos', m('D#3'), .5, .34, -.1)               # the wrong note → the thump
melody(194.2, 'cellos', [(0, 'D3', 2), (2, 'F#3', 1), (3, 'A3', 2), (5, 'B3', 1), (6, 'A3', 3)], vel=.32, pan=-.1, rate=.9)
motif(200.5, vel=.45); ev(200.5 + 3 * B, 'glockenspiel', 'D7', 2, .3, .3)            # morning 4: the case is open
harp(bt(82), 3, ['D', 'G', 'A'], vel=.2, per=3)
# sit (212–240): two of him; harp and slow strings
pad(bt(86), 11, ['Bm', 'G', 'D', 'A', 'Bm', 'G', 'Em', 'A', 'D', 'G', 'A'], vel=.14, upper='violins')
harp(bt(86), 11, ['Bm', 'G', 'D', 'A', 'Bm', 'G', 'Em', 'A', 'D', 'G', 'A'], vel=.14, per=3)
melody(bt(90), 'glass', [(0, 'F#5', 3), (3, 'E5', 3), (6, 'D5', 6)], vel=.2, pan=.2)
# habit (240–262): the mornings speed up, vibraphone ticks every half bar, a glass note each morning
for k in range(int((258.6 - 240.6) / (BAR / 2))): ev(240.6 + k * BAR / 2, 'vibraphone', ['D5', 'A5'][k % 2], .6, .14 + .004 * k, .3)
waltz(bt(97), 8, P_MAIN, vel=.2)
for i, a in enumerate([241.0 + (258.6 - 241.0) * j / 8 for j in range(9)]): ev(a, 'glass', m(MOTIF[i % 4]) + (12 if i > 5 else 0), 1.6, .26, .2)
pad(258.6, 1, ['A'], vel=.18, upper='violins')
# ===== The roof (262–300): the cello takes the theme; the town joins =====
ev(262.5, 'cellos', 'D2', 2.5, .2, -.2, attack=.5)
melody(264.0, 'cellos', [(b, p, d) for b, p, d in THEME], vel=.42, pan=-.1, tr=-24)
harp(264.0, 8, P_MAIN, vel=.16, per=3)
pad(bt(108), 6, P_MAIN, vel=.16, upper='violins')                                     # 270: the strings
melody(bt(113), 'violins', THEME, vel=.32, pan=.2, tr=-12); melody(bt(113), 'cellos', THEME, vel=.3, pan=-.15, tr=-24)
pad(bt(113), 8, P_MAIN, vel=.22, upper='violas')
ev(bt(115), 'horn', 'D4', BAR * 2, .32, -.1, attack=.4); ev(bt(115), 'horn', 'A3', BAR * 2, .3, .1, attack=.4)
ev(bt(117), 'horn', 'E4', BAR * 2, .32, -.1, attack=.4); ev(bt(117), 'horn', 'C#4', BAR * 2, .28, .1, attack=.4)
for i in range(24): ev(268.0 + i * (288.0 - 268.0) / 23, 'glockenspiel', m(['D6', 'F#6', 'A6', 'D7', 'C#7', 'A6'][i % 6]), 1.0, .16, .35)   # the windows
for p in ['D3', 'A3', 'D4', 'F#4']: ev(bt(120), 'violins' if m(p) >= 55 else 'cellos', p, 4.0, .2, 0, attack=.4)
ev(bt(120), 'timpani', 'D2', 1.5, .3, 0)
# ===== Ch III (300–392): the empty glass =====
harp(bt(121), 2, ['D', 'G'], vel=.16, per=3)
# 305.0 hard stop (below); 305–308 silence; then B minor on the bowed vibraphone and low strings
bowed(308.6, 9, P_MIN, vel=.1)
ev(308.6, 'cellos', 'B1', 12.0, .12, -.2, attack=2.0); ev(321.0, 'cellos', 'G1', 9.0, .12, -.2, attack=2.0)
pad(bt(133), 8, ['Em', 'Bm', 'Em', 'F#'], vel=.1, upper='violas')                     # Nan 2
motif(bt(142), vel=.4)                                                                  # 352.5: the postcard
harp(bt(144), 6, ['Bm', 'G', 'D', 'A', 'Bm', 'G'], vel=.16, per=3); pad(bt(144), 6, ['Bm', 'G', 'D', 'A', 'Bm', 'G'], vel=.12)
melody(bt(150), 'clarinet', [(0, 'F#4', 3), (3, 'G4', 3), (6, 'A4', 6)], vel=.2, pan=.2)
pad(bt(152), 6, ['D', 'G', 'D', 'A', 'G', 'A'], vel=.14, upper='violins'); harp(bt(152), 6, ['D', 'G', 'D', 'A', 'G', 'A'], vel=.18, per=3)
melody(bt(153), 'glass', HALF, vel=.24, pan=.2)
# ===== Ch IV (392–490) =====
waltz(bt(158), 11, P_MAIN, vel=.22); harp(bt(158), 11, P_MAIN, vel=.16, per=3)
melody(bt(159), 'clarinet', THEME, vel=.28, pan=.2)
ev(406.6, 'glockenspiel', 'D7', 1.5, .3, .3)                                           # the letter in the box
pad(bt(169), 4, ['G', 'D', 'Em', 'A'], vel=.12, upper='violas')                         # the last morning
harp(bt(173), 6, P_WARM, vel=.18, per=3); pad(bt(173), 6, P_WARM, vel=.12)
melody(bt(174), 'oboe', [(0, 'D5', 2), (2, 'E5', 1), (3, 'F#5', 3), (6, 'G5', 2), (8, 'F#5', 1), (9, 'E5', 3)], vel=.22, pan=.2)
ev(437.0, 'glass', 'A5', 1.8, .26, .2); ev(437.6, 'glass', 'D6', 2.2, .24, .2)       # "I think I already did."
# the train (444–462): a march-waltz, horns, timpani at the departure
waltz(444.0, 7, P_MAIN, vel=.3, bass='contrabass_pizz')
for i in range(7): ev(444.0 + i * BAR, 'timpani', CH[P_MAIN[i % 4]][0], .8, .22, 0)
melody(444.0 + BAR, 'horn', [(0, 'A3', 2), (2, 'D4', 1), (3, 'F#4', 3), (6, 'E4', 2), (8, 'D4', 1), (9, 'C#4', 3), (12, 'D4', 6)], vel=.36, pan=-.1)
melody(444.0 + BAR, 'flute', HALF, vel=.3, pan=.2)
ev(461.0, 'sus_cymbal', None, None, .16, 0)
# the audition: the hall, then the cello alone, then nothing
melody(469.5, 'cellos', [(0, 'D3', 2), (2, 'F#3', 1), (3, 'A3', 2), (5, 'G3', 1), (6, 'F#3', 1), (7, 'E3', 1), (8, 'D3', 1), (9, 'E3', 3)], vel=.42, pan=0)
# 480.0 hard stop (below); the answer
ev(487.6, 'harp', 'D5', 2.0, .3, .2); ev(487.9, 'harp', 'F#5', 2.0, .28, .2); ev(488.2, 'glockenspiel', 'A6', 2.0, .28, .3)
# ===== Through the glass (490–502): a swell into white; the future =====
bowed(490.4, 2, ['Bm', 'G'], vel=.1)
ev(493.0, 'sus_cymbal', None, None, .3, 0)
for p in ['D3', 'A3', 'D4', 'F#4', 'A4']: ev(496.0, 'violins' if m(p) >= 55 else 'cellos', p, 6.5, .2, 0, attack=.6)
ev(496.0, 'glockenspiel', 'D7', 3, .34, .3); ev(496.0, 'harp', 'D4', 3, .3, -.2)
# ===== Ch V (502.5–541): the click; the full theme; the duet on "Hi, you." =====
motif(502.5, vel=.48, big=True)
harp(bt(203), 15, P_MAIN, vel=.2, per=3); pad(bt(203), 15, P_MAIN, vel=.16, upper='violins')
melody(bt(204), 'flute', THEME, vel=.3, pan=.2)
melody(bt(211), 'glass', HALF, vel=.26, pan=.25); melody(bt(211), 'cellos', HALF, vel=.3, pan=-.15, tr=-24)
melody(bt(214), 'violins', THEME, vel=.24, pan=.2, tr=-12)
# ===== End title (541–555) =====
for p in ['D2', 'A2', 'D3', 'F#3', 'A3', 'D4']: ev(542.5, 'violins' if m(p) >= 55 else 'cellos', p, 11.5, .24, 0, attack=1.0)
ev(542.5, 'horn', 'F#3', 10.0, .22, -.1, attack=.8); ev(542.5, 'horn', 'A3', 10.0, .2, .1, attack=.8)
harp(542.5, 2, ['D', 'D'], vel=.18, per=3)
motif(548.5, vel=.3, tr=12)

# —— Render ——
mus = S.render(EV, dur=DUR, master=False)
N = int(DUR * SR); mus = mus[:N]
def hard_stop(at, until, size=.9):
    cut = int(at * SR)
    tail = np.zeros((int(2.2 * SR), 2), np.float32); tail[:int(.3 * SR)] = mus[cut - int(.3 * SR):cut]
    tail = S.room(tail, size=size, mix=.9)
    mus[cut:int(until * SR)] = 0
    L = min(len(tail) - int(.3 * SR), N - cut)
    mus[cut:cut + L] += tail[int(.3 * SR):int(.3 * SR) + L] * np.linspace(1, 0, L)[:, None]
mus[:int(2.0 * SR)] = 0              # silence until the click
hard_stop(122.0, 122.4, .6)          # "Then he's a stranger."
hard_stop(305.0, 308.6)              # the empty glass
hard_stop(480.0, 487.6, .8)          # after the audition
mus = S.room(mus, size=.55, mix=.2)
fade = int(1.4 * SR); mus[-fade:] *= np.linspace(1, 0, fade)[:, None]
mus /= max(1e-6, np.abs(mus).max()) / .9
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'score.wav'), mus.astype(np.float32), SR)
used = sorted({e['inst'] for e in EV})
open(os.path.join(HERE, 'out', 'score_instruments.txt'), 'w').write('\n'.join(used))
print('score', DUR, 's', len(EV), 'notes', used)
