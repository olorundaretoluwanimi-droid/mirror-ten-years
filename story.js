// Timeline (seconds): the single source of truth for shots, events, voice, chapter cards and the countdown.
// The dramatic cut: the reflection that won't copy, seventy days to an audition, Nan falling ill, a string that snaps.
// 72 bpm in 3/4: one bar = 2.5 s; the downbeat of bar n is at (n-1)*2.5.
export const BPM = 72, BAR = 180 / BPM;
export const bar = n => (n - 1) * BAR;
export const DUR = 555;
export const SHOTS = [
  { id: 'open', a: 0, b: 27.5 },        // dark bathroom, the click, the older reflection that does not copy him
  { id: 'title', a: 27.5, b: 37.5 },    // the town at dawn, one lit window
  { id: 'glass', a: 37.5, b: 62 },      // close on the mirror: left hand, followed a moment too late
  { id: 'inventory', a: 62, b: 80 },    // lateral track along the reflected room: badge, dusty cello, the crossed-out poster
  { id: 'tests', a: 80, b: 100 },       // phone camera, hall mirror
  { id: 'nan1', a: 100, b: 150 },       // Nan's flat: "He gave up on me." She coughs.
  { id: 'morning2', a: 150, b: 157 },   // the refrain: still there
  { id: 'notice', a: 157, b: 175 },     // Main Street: the poster. Seventy days.
  { id: 'morning3', a: 175, b: 182 },   // the refrain: he stands straighter
  { id: 'practice', a: 182, b: 200 },   // night: the cello comes out; the neighbour bangs; he stops
  { id: 'morning4', a: 200, b: 212 },   // the reflection turns away. "Look at me!"
  { id: 'sit', a: 212, b: 240 },        // both on the edge of the bath: the future self is a stranger
  { id: 'habit', a: 240, b: 262 },      // top-down: the days run down
  { id: 'roof', a: 262, b: 300 },       // cello on the roof, windows light up; Nan's light goes out
  { id: 'empty', a: 300, b: 330 },      // the glass is empty
  { id: 'nan2', a: 330, b: 350 },       // Nan in her chair: "Don't you dare stay for me."
  { id: 'postcard', a: 350, b: 392 },   // the postcard in the reflected frame
  { id: 'practice2', a: 392, b: 420 },  // the last night: he plays until his fingers hurt
  { id: 'leave', a: 420, b: 430 },      // towel over the mirror
  { id: 'door', a: 430, b: 446 },       // Nan at the door with the scarf
  { id: 'train', a: 446, b: 462 },      // the train at dawn
  { id: 'audition', a: 462, b: 495 },   // one chair, one light; the string snaps
  { id: 'through', a: 495, b: 503 },    // through the glass, ten years
  { id: 'sea', a: 503, b: 541 },        // by the sea: the man in the glass waves first
  { id: 'endWide', a: 541, b: 555 },    // pull back over the seaside town; end title
];
export const T = {
  click0: 2.0, walkIn: [2.6, 5.6], yawn: 6.0, notice: 10.0, wave: 18.0, palm: 20.2, recoil: 22.6,
  titleIn: 28.0, titleOut: 36.6,
  left: 42.9, lag: .7, touch: 50.0,
  phone: 81.0, hall: [86.0, 88.4], door1: 95.6, knock1: 98.4,
  cough1: [146.0, 147.6],
  click2: 150.5, poster: 163.4, click3: 175.5, click4: 200.5, away: 202.0,
  caseOpen: 183.2, play: [187.0, 196.0], thump: [190.6, 191.5, 192.4], stop: 192.6,
  habit: [241.0, 258.6],
  roofPlay: [264.0, 287.6], windows: [266.0, 284.0], nanWin: 286.0, cough2: [290.6, 292.8], nanOut: 293.4,
  click5: 302.5, empty: 305.0, flicker: 307.0, runOut: 326.0,
  knock2: 329.2, back: 347.0, check: 356.0,
  play2: [394.0, 419.0],
  towel: 422.6, knock3: 431.0, scarf: 440.0,
  trainIn: 447.0, horn: 448.2,
  chair: 465.6, solo: [469.5, 476.0], snap: 476.0, resume: 484.4, soloEnd: 489.4,
  flash: 501.0, click6: 505.5, waveR: 518.8, waves: [520.4, 524.4],
  endTitle: 542.5,
};
// Chapter cards (overlay)
export const CHAPTERS = [
  { t: 37.7, n: 'I', name: 'The Man in the Glass' },
  { t: 150.2, n: 'II', name: 'Seventy Days' },
  { t: 300.2, n: 'III', name: 'The Empty Glass' },
  { t: 392.7, n: 'IV', name: 'The Last Night' },
  { t: 501.8, n: 'V', name: 'Ten Years Later' },
];
// Voice: t = start; dur from voices/dur.json. dlg = dialogue box (who = name plate). sub = on-screen text.
const TH = 'Theo', NA = 'Nan', PN = 'Panel';
export const VO = [
  { id: 'n01', t: 3.0, sub: 'Every morning, a mirror shows you who you are.' },
  { id: 'n02', t: 7.4, sub: 'One Tuesday, Theo’s mirror showed him who he was going to be.' },
  { id: 't01', t: 13.4, dlg: true, who: TH, sub: 'Wait. What?' },
  { id: 't02', t: 17.6, dlg: true, who: TH, sub: 'Hello? Hey!' },
  { id: 'n03', t: 21.6, sub: 'The man in the glass was ten years older. And he wasn’t copying him.' },
  { id: 'n04', t: 39.2, sub: 'He did what anyone would do. He tested it.' },
  { id: 't03', t: 43.0, dlg: true, who: TH, sub: 'Left hand.' },
  { id: 'n05', t: 46.0, sub: 'The reflection followed. A moment too late.' },
  { id: 'n06', t: 50.4, sub: 'Every face in a mirror is a little out of date.' },
  { id: 'n07', t: 53.8, sub: 'Stand a metre from the glass, and the light takes about seven billionths of a second to come back to you.' },
  { id: 'n08', t: 62.8, sub: 'Theo’s mirror was ten years out. In the wrong direction.' },
  { id: 'n09', t: 67.3, sub: 'Same nose. Less hair. Tired eyes. An office badge.' },
  { id: 'n10', t: 72.9, sub: 'His cello, shut and dusty. And on the wall, an audition poster. Crossed out.' },
  { id: 't04', t: 81.0, dlg: true, who: TH, sub: 'Okay. Phone camera.' },
  { id: 't05', t: 84.4, dlg: true, who: TH, sub: 'Normal. Totally normal.' },
  { id: 'n11', t: 89.0, sub: 'The hall mirror was normal too. Only the bathroom one knew.' },
  { id: 't06', t: 100.8, dlg: true, who: TH, sub: 'Nan, does your mirror ever show you older?' },
  { id: 'a01', t: 105.0, dlg: true, who: NA, sub: 'Every morning, love. It’s called being seventy-eight.' },
  { id: 't07', t: 110.0, dlg: true, who: TH, sub: 'No, I mean ten years older. And he looked like he’d given up.' },
  { id: 'a02', t: 115.4, dlg: true, who: NA, sub: 'Given up on what?' },
  { id: 't08', t: 118.0, dlg: true, who: TH, sub: 'On me. He gave up on me.' },
  { id: 'a03', t: 121.6, dlg: true, who: NA, sub: 'Then he’s a stranger, love. You haven’t met him yet.' },
  { id: 'n12', t: 127.6, sub: 'Psychologists asked over nineteen thousand people how much they’d change in the next ten years.' },
  { id: 'n13', t: 134.4, sub: 'Not much, they said. But people ten years older said they’d changed a lot.' },
  { id: 'n14', t: 140.0, sub: 'We always think we’re nearly finished. It’s called the end of history illusion.' },
  { id: 'n15', t: 151.4, sub: 'The next morning, the man was still there.' },
  { id: 'n16', t: 158.4, sub: 'On the way to work, Theo saw the poster from the mirror.' },
  { id: 'n17', t: 163.6, sub: 'Port Alder Orchestra. Auditions. In seventy days.' },
  { id: 't09', t: 168.8, dlg: true, who: TH, sub: 'Seventy days.' },
  { id: 'n18', t: 175.8, sub: 'He walked to work. The next morning, the man in the glass stood a little straighter.' },
  { id: 'n19', t: 182.6, sub: 'That night, he opened the cello for the first time in two years.' },
  { id: 't10', t: 193.0, dlg: true, who: TH, sub: 'Sorry! Sorry.' },
  { id: 'n20', t: 196.0, sub: 'He was rusty. And seventy days is not very long.' },
  { id: 'n21', t: 202.4, sub: 'In the glass, the man had stopped looking at him.' },
  { id: 't11', t: 206.6, dlg: true, who: TH, sub: 'Hey. Hey! Look at me!' },
  { id: 'n22', t: 213.0, sub: 'Here’s the strange part. When people imagine themselves in ten years, their brains respond a bit like they’re thinking about a stranger.' },
  { id: 'n23', t: 222.2, sub: 'In one experiment, people who met an aged picture of themselves set aside more than twice as much for retirement.' },
  { id: 'n24', t: 230.6, sub: 'Theo didn’t have a picture. He had a witness. And the witness was losing hope.' },
  { id: 'n25', t: 241.0, sub: 'New habits take about sixty-six days, on average, to become automatic.' },
  { id: 'n26', t: 246.4, sub: 'Some take eighteen. Some take over two hundred. Theo had sixty-four.' },
  { id: 'n27', t: 262.6, sub: 'Six days before the audition, he took the cello up to the roof.' },
  { id: 'a04', t: 287.2, dlg: true, who: NA, sub: 'Not bad at all, love!' },
  { id: 't12', t: 294.4, dlg: true, who: TH, sub: 'Nan? Nan!' },
  { id: 'n28', t: 308.6, sub: 'Three days before the audition, the mirror showed the bathroom. Just the bathroom.' },
  { id: 't13', t: 314.8, dlg: true, who: TH, sub: 'Hello?' },
  { id: 't14', t: 317.4, dlg: true, who: TH, sub: 'Where are you?' },
  { id: 'n29', t: 320.4, sub: 'No man. No office badge. Not even the cello. Ten years from now, nobody lived here.' },
  { id: 't15', t: 330.6, dlg: true, who: TH, sub: 'He’s gone. The one in the mirror is gone.' },
  { id: 'a05', t: 334.7, dlg: true, who: NA, sub: 'Gone where, love?' },
  { id: 't16', t: 337.6, dlg: true, who: TH, sub: 'I don’t know. And I’m not going to Port Alder. Not with you like this.' },
  { id: 'a06', t: 343.0, dlg: true, who: NA, sub: 'Don’t you dare stay for me. Did you look properly?' },
  { id: 'n30', t: 357.4, sub: 'He hadn’t vanished. He’d moved out.' },
  { id: 't17', t: 361.0, dlg: true, who: TH, sub: 'Port Alder.' },
  { id: 'n31', t: 364.6, sub: 'Tucked in the frame was a postcard from the sea. In his own handwriting.' },
  { id: 'n32', t: 370.6, sub: 'The future hadn’t ended. It had moved. But only if he went.' },
  { id: 'n33', t: 394.6, sub: 'He had one more night. He played until his fingers hurt.' },
  { id: 'n34', t: 421.2, sub: 'On the last morning, Theo didn’t check the mirror.' },
  { id: 'n35', t: 425.4, sub: 'He had seen enough to start.' },
  { id: 'a07', t: 433.4, dlg: true, who: NA, sub: 'Go on, love. And send me a postcard.' },
  { id: 't18', t: 437.4, dlg: true, who: TH, sub: 'I think I already did.' },
  { id: 'n36', t: 451.0, sub: 'The train left at six. The audition was at nine.' },
  { id: 'p01', t: 466.6, dlg: true, who: PN, sub: 'Whenever you’re ready.' },
  { id: 'p02', t: 478.9, dlg: true, who: PN, sub: 'Would you like to stop?' },
  { id: 't19', t: 482.2, dlg: true, who: TH, sub: 'No. I’m not stopping.' },
  { id: 'p03', t: 489.9, dlg: true, who: PN, sub: 'Thank you. We’ll be in touch.' },
  { id: 'n37', t: 496.0, sub: 'And they were.' },
  { id: 'n38', t: 509.6, sub: 'Ten years later, in a flat by the sea, a man stepped up to a mirror.' },
  { id: 'n39', t: 515.2, sub: 'It showed him at forty-four. And this time, the man in the glass waved first.' },
  { id: 't20', t: 522.0, dlg: true, who: TH, sub: 'Hi, you.' },
  { id: 'n40', t: 526.0, sub: 'He didn’t ask what he’d become. He knew the trick now. It gets decided every morning.' },
];
// The countdown (top right). run = [a, b, n1]: counts from n0 to n1 between a and b. n0 = 0 → AUDITION DAY.
export const CHIPS = [
  { a: 169.4, b: 174.6, n0: 70 },
  { a: 201.0, b: 211.6, n0: 66 },
  { a: 240.6, b: 261.4, n0: 62, run: [243.0, 258.6, 7] },
  { a: 263.0, b: 271.0, n0: 6 },
  { a: 303.0, b: 313.0, n0: 3 },
  { a: 393.0, b: 403.0, n0: 1 },
  { a: 447.6, b: 457.6, n0: 0 },
];
export function chipState(c, t) {
  let n = c.n0;
  if (c.run) { const [a, b, n1] = c.run, k = Math.max(0, Math.min(1, (t - a) / (b - a))); if (t >= a) n = Math.round(c.n0 + (n1 - c.n0) * k); }
  return { n };
}
// The mornings of the habit board: each one a click, a pose and the reflection of that day
export const HABIT = (() => { const o = [], [a, b] = T.habit, n = 9; for (let i = 0; i < n; i++) o.push(a + (b - a) * i / (n - 1)); return o; })();
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
