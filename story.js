// Timeline (seconds): the single source of truth for shots, events, voice, chapter cards and the morning counter.
// 72 bpm in 3/4: one bar = 2.5 s; the downbeat of bar n is at (n-1)*2.5.
export const BPM = 72, BAR = 180 / BPM;
export const bar = n => (n - 1) * BAR;
export const DUR = 555;
export const SHOTS = [
  { id: 'open', a: 0, b: 27.5 },        // dark bathroom, the click, the older reflection
  { id: 'title', a: 27.5, b: 37.5 },    // the town at dawn, one lit window
  { id: 'glass', a: 37.5, b: 62 },      // close on the mirror: left hand, the cheek
  { id: 'inventory', a: 62, b: 80 },    // lateral track along the reflected room
  { id: 'tests', a: 80, b: 100 },       // phone camera, hall mirror
  { id: 'nan1', a: 100, b: 150 },       // Nan's flat
  { id: 'morning2', a: 150, b: 157 },   // the refrain: toothbrush
  { id: 'walk', a: 157, b: 175 },       // Main Street on foot
  { id: 'morning3', a: 175, b: 182 },   // the refrain: he stands straighter
  { id: 'practice', a: 182, b: 200 },   // night: the cello comes out
  { id: 'morning4', a: 200, b: 212 },   // the refrain: the case is open
  { id: 'sit', a: 212, b: 240 },        // both on the edge of the bath
  { id: 'habit', a: 240, b: 262 },      // top-down: mornings 12 … 66
  { id: 'roof', a: 262, b: 300 },       // cello on the roof, windows light up
  { id: 'empty', a: 300, b: 330 },      // the glass is empty
  { id: 'nan2', a: 330, b: 350 },       // "Did you look properly?"
  { id: 'postcard', a: 350, b: 392 },   // the postcard in the reflected frame
  { id: 'notice', a: 392, b: 420 },     // noticeboard, post box
  { id: 'leave', a: 420, b: 430 },      // towel over the mirror
  { id: 'door', a: 430, b: 446 },       // Nan at the door with the scarf
  { id: 'train', a: 446, b: 462 },      // the train at dawn
  { id: 'audition', a: 462, b: 490 },   // one chair, one light
  { id: 'through', a: 490, b: 500 },    // through the glass, ten years
  { id: 'sea', a: 500, b: 541 },        // the refrain by the sea: 34 meets 44
  { id: 'endWide', a: 541, b: 555 },    // pull back over the seaside town; end title
];
export const T = {
  click0: 2.0, walkIn: [2.6, 5.6], yawn: 6.0, notice: 10.0, wave: 18.4,
  titleIn: 28.0, titleOut: 36.6,
  left: 42.9, touch: 50.0,
  phone: 81.0, hall: [86.0, 88.4], door1: 95.6, knock1: 98.4,
  click2: 150.5, click3: 175.5, click4: 200.5,
  caseOpen: 183.2, play: [186.0, 199.4], thump: 192.0,
  habit: [241.0, 258.6],
  roofPlay: [264.0, 299.0], windows: [268.0, 288.0], nanWin: 288.2,
  click5: 302.5, empty: 305.0, flicker: 307.0, runOut: 326.0,
  knock2: 329.2, back: 346.0, check: 356.0,
  post: [403.0, 406.6], towel: 422.6, knock3: 431.0, scarf: 438.0,
  trainIn: 447.0, horn: 448.2,
  chair: 465.6, solo: [469.5, 480.0], hold: 480.0,
  flash: 496.0, click6: 502.5, waves: [516.6, 520.6],
  endTitle: 542.5,
};
// Chapter cards (overlay)
export const CHAPTERS = [
  { t: 37.7, n: 'I', name: 'The Man in the Glass' },
  { t: 150.2, n: 'II', name: 'Small Things' },
  { t: 300.2, n: 'III', name: 'The Empty Glass' },
  { t: 392.7, n: 'IV', name: 'The Long Way' },
  { t: 496.8, n: 'V', name: 'Ten Years Later' },
];
// Voice: t = start; dur from voices/dur.json. dlg = dialogue box (who = name plate). sub = on-screen text.
const TH = 'Theo', NA = 'Nan', PN = 'Panel';
export const VO = [
  { id: 'n01', t: 3.0, sub: 'Every morning, a mirror shows you who you are.' },
  { id: 'n02', t: 11.0, sub: 'This one showed Theo who he was going to be.' },
  { id: 't01', t: 15.0, dlg: true, who: TH, sub: 'Huh.' },
  { id: 't02', t: 18.6, dlg: true, who: TH, sub: 'Oh. Hi?' },
  { id: 'n03', t: 22.0, sub: 'Theo was twenty-four. The man in the glass was not.' },
  { id: 'n04', t: 39.2, sub: 'He did what anyone would do. He tested it.' },
  { id: 't03', t: 43.0, dlg: true, who: TH, sub: 'Left hand.' },
  { id: 'n05', t: 46.2, sub: 'Fun fact: mirrors don’t really swap left and right. They swap front and back. That’s why the words on your T-shirt come out backwards.' },
  { id: 'n06', t: 54.4, sub: 'And the face in a mirror is always a little out of date.' },
  { id: 'n07', t: 58.0, sub: 'Stand a metre from the glass, and the light takes about seven billionths of a second to come back to you.' },
  { id: 'n08', t: 64.4, sub: 'Theo’s mirror was running about ten years ahead.' },
  { id: 'n09', t: 68.2, sub: 'He studied the man. Same nose. Same hair, less of it. Tired eyes.' },
  { id: 'n10', t: 73.6, sub: 'An office badge. And in the corner, his cello. Shut, and dusty.' },
  { id: 't04', t: 81.0, dlg: true, who: TH, sub: 'Okay. Phone camera.' },
  { id: 't05', t: 84.4, dlg: true, who: TH, sub: 'Normal.' },
  { id: 'n11', t: 88.6, sub: 'The mirror in the hallway was normal too. Only the bathroom one knew.' },
  { id: 't06', t: 100.8, dlg: true, who: TH, sub: 'Nan, does your mirror ever show you older?' },
  { id: 'a01', t: 105.4, dlg: true, who: NA, sub: 'Every morning, love. It’s called being seventy-eight.' },
  { id: 't07', t: 110.8, dlg: true, who: TH, sub: 'No, a lot older. Like, ten years.' },
  { id: 'a02', t: 114.8, dlg: true, who: NA, sub: 'Ah. And what’s he like?' },
  { id: 't08', t: 118.2, dlg: true, who: TH, sub: 'Tired. Like he gave up on something.' },
  { id: 'a03', t: 122.4, dlg: true, who: NA, sub: 'Then he’s a stranger. You haven’t met him yet.' },
  { id: 'n12', t: 127.8, sub: 'Psychologists asked over nineteen thousand people about their personalities.' },
  { id: 'n13', t: 133.6, sub: 'They expected to change very little in the next ten years. But they said they’d changed a lot in the last ten.' },
  { id: 'n14', t: 140.6, sub: 'We always think we’re nearly finished. It’s called the end of history illusion.' },
  { id: 'n15', t: 151.6, sub: 'So Theo started running experiments.' },
  { id: 'n16', t: 158.6, sub: 'He walked to work instead of taking the bus.' },
  { id: 'n17', t: 176.6, sub: 'The next morning, the man in the glass stood a little straighter.' },
  { id: 'n18', t: 183.0, sub: 'He opened the cello. Ten minutes a night. His neighbours were very patient.' },
  { id: 'n19', t: 201.4, sub: 'In the glass, the cello case was open.' },
  { id: 't09', t: 205.9, dlg: true, who: TH, sub: 'Did you see that?' },
  { id: 'n20', t: 213.0, sub: 'Here’s something odd about brains. When people imagine themselves in ten years, their brains respond a bit like they’re thinking about someone else.' },
  { id: 'n21', t: 222.4, sub: 'In one experiment, people met an aged picture of themselves first.' },
  { id: 'n22', t: 227.2, sub: 'Then they set aside more than twice as much for retirement.' },
  { id: 'n23', t: 232.2, sub: 'Theo had the full-size version. Every morning.' },
  { id: 'n24', t: 241.0, sub: 'New habits take about sixty-six days, on average, to become automatic.' },
  { id: 'n25', t: 246.6, sub: 'Some took eighteen. Some took over two hundred.' },
  { id: 'n26', t: 262.6, sub: 'On day sixty-six, he took the cello up to the roof.' },
  { id: 'a04', t: 289.0, dlg: true, who: NA, sub: 'Not bad at all, love!' },
  { id: 't10', t: 292.0, dlg: true, who: TH, sub: 'Thank you, Nan!' },
  { id: 'n27', t: 309.0, sub: 'On day seventy, the mirror showed the bathroom. Just the bathroom.' },
  { id: 't11', t: 314.6, dlg: true, who: TH, sub: 'Hello?' },
  { id: 't12', t: 317.4, dlg: true, who: TH, sub: 'Where are you?' },
  { id: 'n28', t: 320.8, sub: 'No man. No badge. No cello. Ten years from now, nobody lived here.' },
  { id: 't13', t: 331.0, dlg: true, who: TH, sub: 'He’s gone. The one in the mirror is gone.' },
  { id: 'a05', t: 335.2, dlg: true, who: NA, sub: 'Where did he go?' },
  { id: 't14', t: 338.2, dlg: true, who: TH, sub: 'I don’t know. Nowhere.' },
  { id: 'a06', t: 341.6, dlg: true, who: NA, sub: 'Or somewhere else. Did you look properly?' },
  { id: 'n29', t: 351.0, sub: 'He hadn’t vanished. He’d moved out.' },
  { id: 't15', t: 359.2, dlg: true, who: TH, sub: 'Port Alder.' },
  { id: 'n30', t: 362.6, sub: 'Bodies are always moving out, too. Your red blood cells only last about four months.' },
  { id: 'n31', t: 369.0, sub: 'But most of the neurons in the outer layer of your brain are as old as you are. Some of you stays.' },
  { id: 'n32', t: 394.6, sub: 'Port Alder had an orchestra. The orchestra had auditions.' },
  { id: 't16', t: 400.0, dlg: true, who: TH, sub: 'Okay. Okay.' },
  { id: 'n33', t: 421.4, sub: 'On his last morning, Theo didn’t check the mirror.' },
  { id: 'n34', t: 425.2, sub: 'He’d seen enough to start. The rest, he wanted to find out by getting there.' },
  { id: 'a07', t: 433.4, dlg: true, who: NA, sub: 'You send me a postcard, love.' },
  { id: 't17', t: 436.8, dlg: true, who: TH, sub: 'I think I already did.' },
  { id: 'p01', t: 467.0, dlg: true, who: PN, sub: 'Whenever you’re ready.' },
  { id: 'p02', t: 482.4, dlg: true, who: PN, sub: 'Thank you. We’ll be in touch.' },
  { id: 'n35', t: 486.8, sub: 'And they were.' },
  { id: 'n36', t: 507.0, sub: 'Ten years later, in a flat by the sea, a man stepped up to a mirror.' },
  { id: 'n37', t: 512.6, sub: 'It showed him at forty-four.' },
  { id: 't18', t: 518.2, dlg: true, who: TH, sub: 'Hi, you.' },
  { id: 'n38', t: 522.4, sub: 'He didn’t ask what he’d become. He knew the trick now. It gets decided every morning.' },
];
// The morning counter (top right). run = [a, b, n1]: counts up from n0 to n1 between a and b.
export const CHIPS = [
  { a: 151.0, b: 156.6, n0: 2 },
  { a: 176.0, b: 181.6, n0: 3 },
  { a: 201.0, b: 211.6, n0: 9 },
  { a: 240.6, b: 261.4, n0: 12, run: [243.0, 258.6, 66] },
  { a: 303.0, b: 313.0, n0: 70 },
];
export function chipState(c, t) {
  let n = c.n0;
  if (c.run) { const [a, b, n1] = c.run, k = Math.max(0, Math.min(1, (t - a) / (b - a))); if (t >= a) n = Math.round(c.n0 + (n1 - c.n0) * k); }
  return { n };
}
// The mornings of the habit board: each one a click, a pose and the reflection of that day
export const HABIT = (() => { const o = [], [a, b] = T.habit, n = 9; for (let i = 0; i < n; i++) o.push(a + (b - a) * i / (n - 1)); return o; })();
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
