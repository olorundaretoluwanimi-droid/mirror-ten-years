# Original score for "What If Your Mirror Showed You in 10 Years?" — the dramatic cut. 72 bpm, 3/4 (bar = 2.5 s).
# D minor for the mirror and the countdown, D major only when it is earned (the roof, the postcard, the sea).
# The mirror motif: four notes on glass harp — F-A-D-C# in minor (the warning), F#-A-D-C# in major (the promise).
# Devices: a pizzicato clock that runs under the countdown, low drones, string tremolo, timpani heartbeats, stingers,
# and hard stops into silence (the cough, the practice, the light going out, the empty glass, the snapped string).
# Instruments: glass harp, harp, strings (arco, pizzicato, contrabass), flute, clarinet, oboe, French horn, glockenspiel,
# vibraphone (bowed), timpani, suspended cymbal.
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
CH = {'D': ['D2', 'A2', 'D3', 'F#3', 'A3'], 'A': ['A1', 'E2', 'A2', 'C#3', 'E3'], 'Bm': ['B1', 'F#2', 'B2', 'D3', 'F#3'],
      'G': ['G1', 'D2', 'G2', 'B2', 'D3'], 'Em': ['E2', 'B2', 'E3', 'G3', 'B3'], 'F#': ['F#1', 'C#2', 'F#2', 'A#2', 'C#3'], 'Em7': ['E2', 'B2', 'D3', 'G3', 'B3'],
      'Dm': ['D2', 'A2', 'D3', 'F3', 'A3'], 'Bb': ['A#1', 'F2', 'A#2', 'D3', 'F3'], 'Gm': ['G1', 'D2', 'G2', 'A#2', 'D3'], 'C': ['C2', 'G2', 'C3', 'E3', 'G3'],
      'A7': ['A1', 'E2', 'G2', 'C#3', 'E3'], 'F': ['F1', 'C2', 'F2', 'A2', 'C3']}
P_MAIN = ['D', 'Bm', 'G', 'A']
P_WARM = ['G', 'D', 'Em', 'A']
P_MIN = ['Bm', 'G', 'Em', 'F#']
P_DARK = ['Dm', 'Bb', 'Gm', 'A']
P_DRIVE = ['Dm', 'Dm', 'Bb', 'A']

THEME = [(0, 'F#5', 2), (2, 'A5', 1), (3, 'D6', 2), (5, 'C#6', 1), (6, 'B5', 1), (7, 'A5', 1), (8, 'F#5', 1), (9, 'A5', 3),
         (12, 'G5', 2), (14, 'B5', 1), (15, 'E6', 2), (17, 'D6', 1), (18, 'C#6', 1), (19, 'B5', 1), (20, 'A5', 1), (21, 'D6', 3)]
THEME_M = [(b, {'F#5': 'F5', 'C#6': 'C#6', 'B5': 'A#5', 'E6': 'E6', 'G5': 'G5'}.get(p, p), d) for b, p, d in THEME]   # the theme in D minor
HALF = THEME[:8]
MOTIF = ['F#5', 'A5', 'D6', 'C#6']
MOTIF_M = ['F5', 'A5', 'D6', 'C#6']

def melody(t0, inst, notes, vel=.45, pan=.1, tr=0, gain=1.0, rate=1.0, leg=.92):
    for b, p, d in notes:
        if p: ev(t0 + b * B / rate, inst, m(p) + tr, d * B / rate * leg, vel, pan, gain, attack=.05)
def motif(t0, vel=.5, tr=0, big=False, minor=False, inst='glass'):
    for i, p in enumerate(MOTIF_M if minor else MOTIF):
        t = t0 + i * B * .75; pp = m(p) + tr
        ev(t, inst, pp, 2.4, vel, .15); ev(t, 'harp', pp - 12, 1.6, vel * .6, -.2)
    if big:
        for p in CH['Dm' if minor else 'D']: ev(t0 + 3 * B, 'violins' if m(p) >= 55 else 'cellos', m(p) + 12 + tr, BAR * 2, vel * .5, 0, attack=.4)
        ev(t0 + 3 * B, 'horn', m('A3') + tr, BAR * 2, vel * .4, -.1, attack=.3)
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
def clock(t0, t1, prog, vel=.2, cresc=0.0, per=6, inst='violins_pizz', bass=True, tr=0):
    """The countdown: pizzicato eighths (per bar), root in the contrabass on 1. Grows by cresc over the span."""
    n = int((t1 - t0) / (BAR / per))
    for k in range(n):
        t = t0 + k * BAR / per; i = int((t - t0) // BAR); c = CH[prog[i % len(prog)]]; u = k / max(1, n - 1)
        v = vel * (1 + cresc * u) * (1.15 if k % per == 0 else .85 if k % 2 else 1)
        ev(t, inst, m([c[2], c[3], c[4], c[3]][k % 4]) + 12 + tr, .22, v, .25)
        if bass and k % per == 0: ev(t, 'contrabass_pizz', m(c[0]) + 12 + tr, .5, v * 1.2, -.2)
def drone(t0, dur, note, vel=.14, inst='cellos', pan=-.15, att=1.5):
    ev(t0, inst, note, dur, vel, pan, attack=att)
def trem(t0, dur, notes, vel=.12, cresc=1.0, inst='violins', rate=.125):
    """String tremolo: fast repeated short notes, swelling by cresc."""
    n = int(dur / rate)
    for k in range(n):
        u = k / max(1, n - 1)
        for j, p in enumerate(notes): ev(t0 + k * rate, inst, p, rate * 1.6, vel * (1 + (cresc - 1) * u) * (.9 + .2 * ((k + j) % 2)), .2 - .1 * j)
def hit(t, vel=.6, chord='Dm', cym=True):
    """A stinger: timpani, low strings and horns together, cymbal."""
    c = CH[chord]
    ev(t, 'timpani', c[0] if m(c[0]) >= m('F2') else S.name(m(c[0]) + 12), 2.0, vel, 0)
    for p in c[:3]: ev(t, 'cellos', m(p) + 12, 1.6, vel * .7, -.2, attack=.01)
    ev(t, 'contrabass', m(c[0]) + 12, 2.2, vel * .6, -.1, attack=.01)
    for p in c[3:5]: ev(t, 'horn', m(p) + 12, 1.8, vel * .55, .1, attack=.02)
    for p in c[2:5]: ev(t, 'violins', m(p) + 24, 1.2, vel * .5, .25, attack=.01)
    if cym: ev(t - .02, 'sus_cymbal', None, None, vel * .5, 0)
def heart(t0, n, gap=.9, vel=.22, note='D2'):
    for i in range(n): ev(t0 + i * gap, 'timpani', note, .6, vel, 0); ev(t0 + i * gap + .22, 'timpani', note, .5, vel * .6, 0)

# ===== Open (0–27.5): silence, the click (2.0), a drone; the mirror at 10.0 in minor; he will not copy =====
drone(2.4, 8.0, 'D2', vel=.1); drone(2.4, 8.0, 'A2', vel=.07, inst='violas')
for k, p in enumerate(['A4', 'D5', 'F5', 'E5']): ev(3.2 + k * 1.6, 'harp', p, 2.0, .14, .3)
motif(10.0, vel=.5, minor=True)
bowed(10.0, 2, ['Dm', 'Dm'], vel=.12)
drone(12.0, 8.5, 'D2', vel=.14); drone(12.0, 8.5, 'C#3', vel=.08, inst='violas', pan=.2)     # the rub under "Wait. What?"
heart(14.0, 6, gap=1.0, vel=.16)
ev(17.6, 'glass', 'A5', 1.6, .28, .2)
# 20.2: the palm comes up to the glass. The sting, then tremolo that climbs into the cut
ev(20.2, 'glass', 'D#6', 3.0, .4, .2); ev(20.2, 'glass', 'D6', 3.0, .34, -.1)
ev(20.2, 'sus_cymbal', None, None, .3, 0); ev(20.2, 'timpani', 'D2', 2, .45, 0)
trem(20.4, 7.0, [m('A4'), m('A#4')], vel=.1, cresc=3.0)
trem(22.6, 4.8, [m('D3'), m('D#3')], vel=.1, cresc=2.6, inst='cellos')
for k in range(9): ev(23.0 + k * .5, 'violins', m('D5') + k, .5, .1 + .03 * k, .2, attack=.02)   # rising
# ===== Title (27.5–37.5): a hard cut to a hit; the motif on horns over tremolo =====
hit(27.5, vel=.72, chord='Dm')
trem(27.6, 9.0, [m('D4'), m('A4')], vel=.1, cresc=.6, inst='violas')
melody(28.4, 'horn', [(0, 'F3', 2), (2, 'A3', 1), (3, 'D4', 3), (6, 'C#4', 6)], vel=.5, pan=-.05)
melody(28.4, 'glass', [(0, 'F5', 2), (2, 'A5', 1), (3, 'D6', 3), (6, 'C#6', 6)], vel=.3, pan=.2)
ev(33.4, 'timpani', 'A2', 1.2, .4, 0); ev(34.2, 'timpani', 'D2', 2.0, .5, 0)
pad(32.5, 2, ['Bb', 'A'], vel=.2, upper='violins')
# ===== Ch I (37.5–100): a mystery: the pizzicato clock, quiet; the lag; the inventory and its reveal =====
clock(38.0, 61.6, P_DARK, vel=.13, cresc=.4)
ev(43.0, 'glass', 'D5', 1.2, .3, .2); ev(43.7, 'glass', 'C#5', 1.8, .32, -.2)            # "Left hand." … and the late copy
ev(46.0, 'vibraphone_bowed', 'D#6', 3.0, .14, .1)
bowed(50.0, 4, ['Dm', 'Bb', 'Gm', 'A'], vel=.1)
drone(62.0, 18.0, 'D2', vel=.13); drone(62.0, 10.0, 'A2', vel=.08, inst='violas')
motif(62.6, vel=.3, minor=True)
for k in range(6): ev(65.0 + k * 1.9, 'harp', ['D5', 'F5', 'A5', 'G5', 'A#5', 'A5'][k], 1.6, .17, .3)
trem(72.9, 4.0, [m('A#4')], vel=.07, cresc=2.0)
hit(76.9, vel=.42, chord='Bb', cym=False)                                                 # "Crossed out."
ev(76.9, 'glass', 'E6', 3.0, .3, .2)
clock(80.5, 99.6, ['Dm', 'C', 'Bb', 'A'], vel=.12)
ev(84.4, 'glockenspiel', 'A6', 1.0, .2, .3)
ev(89.0, 'vibraphone_bowed', 'F6', 4.0, .1, .1)
ev(98.4, 'cellos_pizz', 'D3', .4, .3, -.2); ev(99.0, 'cellos_pizz', 'A2', .4, .28, -.2)
# ===== Nan (100–150): warm, then it isn't =====
harp(bt(41), 7, P_WARM, vel=.16, per=3); pad(bt(41), 7, P_WARM, vel=.11)
melody(bt(42), 'oboe', [(0, 'B4', 2), (2, 'D5', 1), (3, 'G5', 3), (6, 'F#5', 2), (8, 'E5', 1), (9, 'D5', 3)], vel=.2, pan=.2)
# 118.0 hard stop under "On me." (below); then one held note for Nan's answer
drone(119.8, 6.5, 'E2', vel=.12); ev(121.6, 'violas', 'G3', 5.0, .1, .2, attack=1.0)
clock(127.4, 145.0, P_MIN, vel=.12, cresc=.5, inst='cellos_pizz', tr=0)
pad(127.4, 7, P_MIN, vel=.11, upper='violas', low=None)
ev(140.0, 'glass', 'F#5', 2.0, .2, .2)
drone(145.8, 4.4, 'D#3', vel=.12, inst='violas', pan=.2); drone(145.8, 4.4, 'D2', vel=.1)     # the cough: something is wrong
# ===== Ch II (150–262): Seventy days =====
motif(150.6, vel=.4, minor=True)
clock(157.0, 169.4, P_DRIVE, vel=.15, cresc=1.2)                                         # the walk to the poster
trem(160.4, 3.0, [m('A4')], vel=.08, cresc=2.2)
hit(163.4, vel=.45, chord='Dm', cym=False); melody(163.4, 'horn', [(0, 'F3', 1), (1, 'A3', 1), (2, 'D4', 3)], vel=.4)
trem(165.0, 4.3, [m('D5'), m('C#5')], vel=.08, cresc=2.5)
hit(169.4, vel=.62, chord='Dm')                                                          # "Seventy days." — the clock appears
clock(169.6, 175.0, P_DRIVE, vel=.12, bass=False)
motif(175.5, vel=.42); ev(175.5 + 3 * B, 'harp', 'D4', 2, .3, -.2)                        # morning 3: a little hope (major)
pad(176.0, 2, ['D', 'G'], vel=.12, upper='violins')
# practice (182–200): Theo's cello, halting; the neighbour; it stops
pad(182.0, 2, ['Dm', 'Dm'], vel=.07, upper=None)
P1 = [(0, 'D3', 2), (2, 'F#3', 1), (3, 'A3', 3), (6, 'G3', 2), (8, 'F#3', 1), (9, 'E3', 3)]
melody(187.0, 'cellos', P1, vel=.36, pan=-.1, rate=.92)
ev(190.6, 'cellos', m('D#3'), .5, .34, -.1); ev(191.5, 'cellos', m('C3'), .4, .3, -.1)
# 192.6 hard stop (below); then the low sadness under "He was rusty"
drone(195.6, 4.3, 'D2', vel=.12); ev(196.0, 'violas', 'F3', 4.0, .1, .2, attack=1.2)
# morning 4 (200–212): the motif, then he turns away: a cluster, a heartbeat, "Look at me!"
motif(200.6, vel=.36, minor=True)
ev(202.0, 'glass', 'C#6', 3.0, .36, .2); ev(202.0, 'glass', 'D6', 3.0, .3, -.2); ev(202.0, 'vibraphone_bowed', 'D#6', 4, .14, 0)
trem(202.2, 9.4, [m('D4'), m('D#4')], vel=.08, cresc=2.8, inst='violas')
heart(203.0, 8, gap=.95, vel=.2)
hit(206.6, vel=.4, chord='Bb', cym=False)
# sit (212–240): the stranger; slow, cold strings over a soft pulse
pad(212.0, 11, ['Bm', 'G', 'Em', 'F#', 'Bm', 'G', 'Em', 'F#', 'Bm', 'G', 'F#'], vel=.12, upper='violins')
clock(212.0, 239.6, P_MIN, vel=.08, per=3, inst='harp', bass=False)
melody(222.0, 'glass', [(0, 'F#5', 3), (3, 'E5', 3), (6, 'D5', 6)], vel=.18, pan=.2)
ev(230.6, 'cellos', 'B1', 8.0, .14, -.2, attack=1.0)
trem(234.0, 5.6, [m('F#4'), m('G4')], vel=.07, cresc=2.0)
# habit (240–262): the montage. The clock drives, timpani on every bar, a glass note each morning, rising
clock(240.6, 258.6, P_DRIVE + ['Dm', 'Bb', 'C', 'A'], vel=.16, cresc=1.6)
for i in range(7): ev(240.6 + i * BAR, 'timpani', ['D2', 'D2', 'A#1', 'A1'][i % 4] if i % 4 not in (2, 3) else 'A2', .8, .22 + .03 * i, 0)
pad(240.6, 7, P_DRIVE + ['Dm', 'Bb', 'C'], vel=.12, upper='violas')
for i, a in enumerate([241.0 + (258.6 - 241.0) * j / 8 for j in range(9)]): ev(a, 'glass', m(MOTIF[i % 4]) + (12 if i > 5 else 0), 1.6, .24, .2)
trem(252.0, 6.6, [m('A4'), m('D5')], vel=.08, cresc=2.6)
hit(258.6, vel=.5, chord='A', cym=True)
# ===== The roof (262–294): the cello takes the theme, the town lights up; then the cough, the dark =====
ev(262.5, 'cellos', 'D2', 2.5, .2, -.2, attack=.5)
melody(264.0, 'cellos', THEME, vel=.42, pan=-.1, tr=-24)
harp(264.0, 8, P_MAIN, vel=.16, per=3)
pad(270.0, 6, P_MAIN, vel=.16, upper='violins')
melody(276.5, 'violins', HALF, vel=.32, pan=.2, tr=-12); melody(276.5, 'cellos', HALF, vel=.3, pan=-.15, tr=-24)
ev(276.5, 'horn', 'D4', BAR * 2, .3, -.1, attack=.4); ev(276.5, 'horn', 'A3', BAR * 2, .28, .1, attack=.4)
for i in range(24): ev(266.0 + i * (284.0 - 266.0) / 23, 'glockenspiel', m(['D6', 'F#6', 'A6', 'D7', 'C#7', 'A6'][i % 6]), 1.0, .15, .35)   # the windows
for p in ['D3', 'A3', 'D4', 'F#4']: ev(284.0, 'violins' if m(p) >= 55 else 'cellos', p, 6.0, .2, 0, attack=.4)
ev(284.0, 'timpani', 'D2', 1.5, .3, 0)
ev(287.4, 'glass', 'A5', 1.6, .2, .2); ev(287.9, 'glass', 'D6', 1.8, .18, .2)
drone(290.6, 3.0, 'D#3', vel=.1, inst='violas', pan=.2)                                    # the cough
# 293.4 the light goes out: hard stop (below). Then a drone and the heart into the black
drone(294.2, 6.0, 'D2', vel=.16); drone(294.2, 6.0, 'D#2', vel=.1, inst='contrabass')
heart(294.6, 5, gap=.8, vel=.26)
# ===== Ch III (300–392): the empty glass =====
ev(302.5, 'glass', 'D5', 2.0, .2, .2)
# 305.0 hard stop; 305–308.6 nothing but the bulb
bowed(308.6, 9, P_MIN, vel=.1)
drone(308.6, 12.0, 'B1', vel=.13); drone(321.0, 9.0, 'G1', vel=.13)
trem(318.0, 8.0, [m('F#4'), m('G4')], vel=.07, cresc=2.6)
heart(320.4, 6, gap=.9, vel=.18, note='B1')
clock(326.0, 329.8, ['Bm', 'G'], vel=.16, per=12, bass=False)                              # he runs
pad(330.6, 4, ['Em', 'Em', 'Bm', 'F#'], vel=.1, upper='violas')                            # Nan in her chair
harp(343.0, 3, ['G', 'Em', 'A'], vel=.16, per=3); ev(343.0, 'oboe', 'B4', 3.0, .18, .2)   # "Don't you dare stay for me."
drone(347.0, 3.0, 'A1', vel=.1)
motif(352.5, vel=.36, minor=True)                                                          # he looks properly
trem(353.0, 4.4, [m('A4'), m('A#4')], vel=.07, cresc=2.4)
# 357.4: the postcard. The promise, in major. Then resolve: "only if he went"
motif(357.4, vel=.5, big=True)
ev(361.0, 'glockenspiel', 'F#6', 2.0, .26, .3); ev(361.4, 'glockenspiel', 'A6', 2.0, .24, .3)
harp(362.4, 6, ['Bm', 'G', 'D', 'A', 'Bm', 'G'], vel=.16, per=3); pad(362.4, 6, ['Bm', 'G', 'D', 'A', 'Bm', 'G'], vel=.12)
melody(366.0, 'clarinet', [(0, 'F#4', 3), (3, 'G4', 3), (6, 'A4', 6)], vel=.2, pan=.2)
clock(372.0, 391.6, ['D', 'G', 'D', 'A', 'Bm', 'G', 'A', 'A'], vel=.12, cresc=1.4, inst='violins_pizz')
melody(377.0, 'horn', [(0, 'A3', 2), (2, 'D4', 1), (3, 'F#4', 3), (6, 'E4', 3), (9, 'D4', 3)], vel=.34)
for i in range(4): ev(382.0 + i * BAR, 'timpani', ['D2', 'G2', 'D2', 'A2'][i], .8, .22 + .05 * i, 0)
trem(386.0, 5.6, [m('A4'), m('D5')], vel=.08, cresc=2.6)
# ===== Ch IV (392–462): the last night; the door; the train =====
# the last night: Theo's cello plays the theme, the orchestra comes in under him
melody(394.0, 'cellos', THEME, vel=.4, pan=-.1, tr=-24)
clock(394.0, 419.0, P_MAIN, vel=.1, cresc=1.6, inst='violas', bass=True)
pad(400.0, 8, P_MAIN, vel=.13, upper='violins')
melody(408.4, 'cellos', THEME, vel=.46, pan=-.1, tr=-24, rate=1.15)
melody(408.4, 'violins', THEME, vel=.26, pan=.2, tr=-12, rate=1.15)
for i in range(4): ev(409.0 + i * BAR, 'timpani', ['D2', 'A2'][i % 2], .8, .26 + .04 * i, 0)
hit(419.0, vel=.36, chord='D', cym=True)
# the last morning; Nan at the door
pad(421.0, 4, ['G', 'D', 'Em', 'A'], vel=.1, upper='violas')
harp(431.0, 6, P_WARM, vel=.16, per=3); pad(431.0, 6, P_WARM, vel=.11)
melody(432.6, 'oboe', [(0, 'D5', 2), (2, 'E5', 1), (3, 'F#5', 3), (6, 'G5', 2), (8, 'F#5', 1), (9, 'E5', 3)], vel=.2, pan=.2)
ev(437.4, 'glass', 'A5', 1.8, .24, .2); ev(438.0, 'glass', 'D6', 2.2, .22, .2)
# the train (444–462): drive, horns, timpani; the clock reads AUDITION DAY
clock(444.0, 461.6, ['Dm', 'Bb', 'C', 'A'], vel=.18, cresc=1.0, per=6)
for i in range(7): ev(444.0 + i * BAR, 'timpani', ['D2', 'A#1', 'C2', 'A1'][i % 4] if i % 4 == 0 else 'A2', .8, .26, 0)
melody(446.5, 'horn', [(0, 'A3', 2), (2, 'D4', 1), (3, 'F4', 3), (6, 'E4', 2), (8, 'D4', 1), (9, 'C#4', 3), (12, 'D4', 6)], vel=.42, pan=-.1)
melody(446.5, 'violins', [(0, 'A4', 2), (2, 'D5', 1), (3, 'F5', 3), (6, 'E5', 2), (8, 'D5', 1), (9, 'C#5', 3), (12, 'D5', 6)], vel=.22, pan=.2)
hit(447.6, vel=.5, chord='Dm', cym=True)
trem(457.0, 4.8, [m('A4'), m('A#4')], vel=.08, cresc=3.0)
# ===== The audition (462–495): the cello alone; the string snaps; silence; "No."; the orchestra comes in =====
drone(462.6, 6.0, 'D2', vel=.06)
SOLO = [(0, 'D3', 2), (2, 'F#3', 1), (3, 'A3', 2), (5, 'G3', 1), (6, 'F#3', 1), (7, 'E3', 1), (8, 'D3', 1), (9, 'E3', 3)]
melody(469.5, 'cellos', SOLO, vel=.62, pan=0); melody(469.5, 'cellos', SOLO, vel=.3, pan=.1, tr=-12)
ev(475.6, 'cellos', 'A3', .4, .62, 0)
# 476.0 snap: hard stop (below). Only the heartbeat, then a held breath
heart(477.0, 7, gap=1.0, vel=.14)
trem(481.0, 3.3, [m('D3'), m('D#3')], vel=.06, cresc=2.0, inst='cellos')
# 484.4: he plays on — the theme, and the orchestra rises under him to the end
melody(484.4, 'cellos', THEME[:12], vel=.52, pan=-.05, tr=-24, rate=1.25)
pad(484.4, 2, ['D', 'G'], vel=.2, upper='violins')
melody(484.4, 'violins', THEME[:12], vel=.24, pan=.2, tr=-12, rate=1.25)
ev(484.4, 'horn', 'D4', 4.8, .3, -.1, attack=.6); ev(484.4, 'horn', 'A3', 4.8, .28, .1, attack=.6)
for i in range(4): ev(485.6 + i * .9, 'timpani', ['D2', 'D2', 'A2', 'D2'][i], .6, .28 + .06 * i, 0)
for p in ['D3', 'A3', 'D4', 'F#4', 'A4']: ev(488.6, 'violins' if m(p) >= 55 else 'cellos', p, 1.0, .34, 0, attack=.05)
ev(488.6, 'sus_cymbal', None, None, .34, 0)
# 489.4 hard stop: the panel in silence
# ===== Through the glass (495–503): "And they were." A swell into white =====
ev(496.0, 'glass', 'A5', 2.0, .3, .2); ev(496.5, 'glass', 'D6', 2.4, .28, .2)
bowed(496.0, 2, ['D', 'G'], vel=.1)
ev(498.0, 'sus_cymbal', None, None, .3, 0)
for p in ['D3', 'A3', 'D4', 'F#4', 'A4']: ev(501.0, 'violins' if m(p) >= 55 else 'cellos', p, 6.5, .22, 0, attack=.6)
ev(501.0, 'glockenspiel', 'D7', 3, .34, .3); ev(501.0, 'harp', 'D4', 3, .3, -.2)
# ===== Ch V (505.5–541): the click; the full theme; the man in the glass waves first =====
motif(505.5, vel=.48, big=True)
harp(508.0, 14, P_MAIN, vel=.2, per=3); pad(508.0, 14, P_MAIN, vel=.16, upper='violins')
melody(510.5, 'flute', THEME, vel=.3, pan=.2)
ev(518.8, 'glass', 'D6', 2.0, .34, .2); ev(519.3, 'glass', 'F#6', 2.2, .3, .2)            # he waves first
melody(526.0, 'glass', HALF, vel=.24, pan=.25); melody(526.0, 'cellos', HALF, vel=.3, pan=-.15, tr=-24)
melody(528.5, 'violins', THEME, vel=.24, pan=.2, tr=-12)
# ===== End title (541–555) =====
for p in ['D2', 'A2', 'D3', 'F#3', 'A3', 'D4']: ev(542.5, 'violins' if m(p) >= 55 else 'cellos', p, 11.5, .26, 0, attack=1.0)
ev(542.5, 'horn', 'F#3', 10.0, .24, -.1, attack=.8); ev(542.5, 'horn', 'A3', 10.0, .22, .1, attack=.8)
ev(542.5, 'timpani', 'D2', 2.0, .3, 0)
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
hard_stop(27.45, 27.5, .3)           # the smash cut to the title
hard_stop(118.0, 119.8, .6)          # "On me."
hard_stop(192.6, 195.6, .7)          # the practice stops
hard_stop(211.8, 212.0, .5)
hard_stop(293.4, 294.2, .9)          # Nan's light goes out
hard_stop(299.8, 302.4, .5)          # into the black
hard_stop(305.0, 308.6)              # the empty glass
hard_stop(476.0, 477.0, 1.0)         # the string snaps
hard_stop(489.4, 495.9, 1.0)         # after the audition
mus = S.room(mus, size=.55, mix=.2)
fade = int(1.4 * SR); mus[-fade:] *= np.linspace(1, 0, fade)[:, None]
mus /= max(1e-6, np.abs(mus).max()) / .9
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'score.wav'), mus.astype(np.float32), SR)
used = sorted({e['inst'] for e in EV})
open(os.path.join(HERE, 'out', 'score_instruments.txt'), 'w').write('\n'.join(used))
print('score', DUR, 's', len(EV), 'notes', used)
