'use strict';
/* =========================================================
   Forja — animações próprias dos exercícios (bonequinho em SVG)
   Cada padrão tem duas poses (A e B); a animação interpola entre elas.
   Coordenadas num quadro 120×120, vista lateral (olhando para a direita)
   ou frontal (front: true — o lado esquerdo é espelhado).
   ========================================================= */

const STAND = { head: [60, 16], sh: [60, 27], hip: [60, 58], kn: [61, 82], ft: [60, 106] };
const LYING = { head: [27, 66], sh: [36, 70], hip: [67, 70], kn: [84, 66], ft: [88, 94], to: [95, 96] };
const SEATED = { head: [54, 30], sh: [56, 41], hip: [58, 72], kn: [80, 72], ft: [82, 98], to: [89, 99] };
const FRONT = { head: [60, 14], sh: [68, 26], hip: [65, 56], kn: [66, 80], ft: [67, 104], to: [70, 106] };
const BENCH = [['rect', 22, 74, 56, 5], ['rect', 28, 79, 3, 27], ['rect', 70, 79, 3, 27]];
const SEAT = [['rect', 44, 74, 26, 5], ['rect', 46, 34, 4, 42], ['rect', 55, 79, 3, 27]];
const m = (base, extra) => Object.assign({}, base, extra);

const PATTERNS = {
  bench: { A: m(LYING, { el: [48, 80], ha: [44, 62] }), B: m(LYING, { el: [38, 54], ha: [39, 38] }), env: BENCH, hl: ['chest'] },
  fly: { A: m(LYING, { el: [30, 62], ha: [22, 74] }), B: m(LYING, { el: [36, 54], ha: [40, 40] }), env: BENCH, hl: ['chest'] },
  pullover: { A: m(LYING, { el: [37, 54], ha: [38, 38] }), B: m(LYING, { el: [22, 62], ha: [8, 60] }), env: BENCH, hl: ['chest', 'ua'] },
  skull: { A: m(LYING, { el: [40, 54], ha: [27, 60] }), B: m(LYING, { el: [40, 54], ha: [41, 38] }), env: BENCH, hl: ['ua'] },
  chest_press: { A: m(SEATED, { el: [48, 54], ha: [62, 48] }), B: m(SEATED, { el: [70, 45], ha: [86, 43] }), env: SEAT, hl: ['chest'] },
  pec_deck: { front: 1, A: { head: [60, 22], sh: [68, 33], hip: [66, 64], kn: [70, 80], ft: [69, 102], el: [84, 36], ha: [88, 22] }, B: { head: [60, 22], sh: [68, 33], hip: [66, 64], kn: [70, 80], ft: [69, 102], el: [74, 42], ha: [63, 30] }, env: [['rect', 50, 66, 20, 4]], hl: ['chest'] },
  cable_cross: { front: 1, A: m(FRONT, { el: [82, 28], ha: [96, 20] }), B: m(FRONT, { el: [73, 40], ha: [63, 50] }), anchor: [112, 0], hl: ['chest'] },
  pushup: {
    A: { head: [24, 70], sh: [32, 75], el: [32, 88], ha: [33, 102], hip: [64, 84], kn: [80, 91], ft: [98, 100], to: [104, 104] },
    B: { head: [22, 86], sh: [31, 91], el: [43, 93], ha: [33, 102], hip: [64, 94], kn: [80, 97], ft: [98, 100], to: [104, 104] }, hl: ['chest'],
  },
  dips: {
    A: { head: [62, 22], sh: [61, 33], el: [62, 46], ha: [63, 60], hip: [58, 62], kn: [60, 84], ft: [48, 94] },
    B: { head: [59, 36], sh: [58, 46], el: [46, 52], ha: [63, 60], hip: [56, 74], kn: [58, 94], ft: [46, 104] },
    env: [['rect', 56, 61, 22, 3], ['rect', 74, 61, 3, 47]], hl: ['ua', 'chest'],
  },
  bench_dips: {
    A: { head: [50, 24], sh: [52, 35], el: [49, 48], ha: [46, 62], hip: [56, 62], kn: [78, 64], ft: [100, 104], to: [104, 98] },
    B: { head: [50, 38], sh: [52, 48], el: [40, 50], ha: [46, 62], hip: [56, 76], kn: [78, 74], ft: [100, 104], to: [104, 98] },
    env: [['rect', 28, 63, 22, 5], ['rect', 30, 68, 3, 38]], hl: ['ua'],
  },
  pulldown: {
    A: { head: [60, 32], sh: [60, 43], el: [63, 27], ha: [65, 11], hip: [60, 74], kn: [80, 74], ft: [80, 98], to: [87, 99] },
    B: { head: [60, 32], sh: [60, 43], el: [54, 58], ha: [64, 47], hip: [60, 74], kn: [80, 74], ft: [80, 98], to: [87, 99] },
    env: [['rect', 48, 76, 26, 4], ['rect', 74, 66, 12, 4], ['rect', 58, 80, 3, 26]], anchor: [64, -8], hl: ['torso'],
  },
  straight_pulldown: {
    A: { head: [62, 18], sh: [60, 28], el: [72, 18], ha: [85, 10], hip: [56, 58], kn: [58, 82], ft: [56, 106] },
    B: { head: [62, 18], sh: [60, 28], el: [66, 43], ha: [67, 59], hip: [56, 58], kn: [58, 82], ft: [56, 106] }, anchor: [100, -8], hl: ['torso'],
  },
  pullup: {
    A: { head: [64, 19], sh: [60, 28], el: [61, 14], ha: [60, 0], hip: [60, 58], kn: [62, 80], ft: [58, 100] },
    B: { head: [64, 5], sh: [60, 15], el: [69, 12], ha: [60, 0], hip: [60, 45], kn: [62, 67], ft: [58, 87] },
    floor: false, env: [['rect', 40, -2, 40, 3]], hl: ['torso'],
  },
  row: {
    A: { head: [34, 32], sh: [42, 38], el: [43, 54], ha: [44, 70], hip: [66, 56], kn: [70, 80], ft: [64, 104] },
    B: { head: [34, 32], sh: [42, 38], el: [58, 40], ha: [50, 54], hip: [66, 56], kn: [70, 80], ft: [64, 104] }, hl: ['torso'],
  },
  seated_row: {
    A: { head: [54, 36], sh: [56, 47], el: [71, 52], ha: [86, 55], hip: [58, 78], kn: [78, 70], ft: [96, 82], to: [98, 74] },
    B: { head: [52, 36], sh: [54, 47], el: [42, 56], ha: [58, 58], hip: [58, 78], kn: [78, 70], ft: [96, 82], to: [98, 74] },
    env: [['rect', 46, 80, 28, 4], ['rect', 99, 70, 3, 16]], anchor: [118, 58], hl: ['torso'],
  },
  face_pull: {
    A: m(STAND, { el: [72, 30], ha: [86, 25] }), B: m(STAND, { el: [48, 24], ha: [62, 16] }), anchor: [114, 18], hl: ['delt'],
  },
  deadlift: {
    A: { head: [36, 40], sh: [44, 46], el: [45, 62], ha: [46, 78], hip: [64, 62], kn: [72, 82], ft: [64, 106] },
    B: m(STAND, { el: [61, 44], ha: [62, 60] }), hl: ['thigh', 'torso'],
  },
  stiff: {
    A: { head: [32, 46], sh: [40, 50], el: [41, 66], ha: [42, 82], hip: [66, 58], kn: [64, 82], ft: [62, 106] },
    B: m(STAND, { el: [61, 44], ha: [62, 60] }), hl: ['thigh'],
  },
  back_ext: {
    A: { head: [56, 102], sh: [57, 92], el: [62, 96], ha: [66, 90], hip: [62, 62], kn: [84, 72], ft: [102, 82] },
    B: { head: [26, 44], sh: [34, 48], el: [40, 54], ha: [44, 48], hip: [62, 62], kn: [84, 72], ft: [102, 82] },
    env: [['rect', 56, 64, 14, 5], ['rect', 61, 69, 3, 37], ['rect', 98, 86, 8, 4]], hl: ['torso'],
  },
  shrug: {
    front: 1, A: m(FRONT, { sh: [68, 27], el: [71, 43], ha: [72, 59] }), B: m(FRONT, { sh: [68, 21], el: [71, 37], ha: [72, 53] }), hl: ['delt'],
  },
  shoulder_press: { front: 1, A: m(FRONT, { el: [80, 32], ha: [80, 16] }), B: m(FRONT, { el: [73, 11], ha: [70, -5] }), hl: ['delt'] },
  lateral_raise: { front: 1, A: m(FRONT, { el: [71, 42], ha: [73, 58] }), B: m(FRONT, { el: [84, 27], ha: [99, 27] }), hl: ['delt'] },
  front_raise: { A: m(STAND, { el: [61, 44], ha: [62, 60] }), B: m(STAND, { el: [76, 24], ha: [92, 21] }), hl: ['delt'] },
  upright_row: { front: 1, A: m(FRONT, { el: [70, 43], ha: [63, 57] }), B: m(FRONT, { el: [82, 24], ha: [66, 32] }), hl: ['delt'] },
  curl: { A: m(STAND, { el: [61, 44], ha: [63, 60] }), B: m(STAND, { el: [62, 44], ha: [71, 31] }), hl: ['ua'] },
  wrist_curl: {
    A: m(SEATED, { head: [52, 38], sh: [54, 49], el: [66, 72], ha: [82, 78] }), B: m(SEATED, { head: [52, 38], sh: [54, 49], el: [66, 72], ha: [82, 68] }), env: SEAT, hl: ['fa'],
  },
  pushdown: { A: m(STAND, { el: [63, 44], ha: [75, 37] }), B: m(STAND, { el: [63, 44], ha: [65, 60] }), anchor: [80, -8], hl: ['ua'] },
  overhead_ext: { A: m(STAND, { el: [64, 10], ha: [53, 22] }), B: m(STAND, { el: [64, 10], ha: [66, -6] }), hl: ['ua'] },
  kickback: {
    A: { head: [38, 34], sh: [44, 40], el: [58, 40], ha: [58, 56], hip: [66, 56], kn: [68, 80], ft: [64, 104], el2: [40, 56], ha2: [38, 70] },
    B: { head: [38, 34], sh: [44, 40], el: [58, 40], ha: [74, 38], hip: [66, 56], kn: [68, 80], ft: [64, 104], el2: [40, 56], ha2: [38, 70] },
    env: [['rect', 24, 71, 30, 4], ['rect', 30, 75, 3, 31]], hl: ['ua'],
  },
  squat: {
    A: m(STAND, { el: [50, 34], ha: [56, 26] }),
    B: { head: [52, 36], sh: [54, 46], el: [44, 53], ha: [50, 45], hip: [40, 72], kn: [66, 82], ft: [60, 106] }, hl: ['thigh'],
  },
  squat_bw: {
    A: m(STAND, { el: [72, 30], ha: [88, 30] }),
    B: { head: [52, 36], sh: [54, 46], el: [70, 46], ha: [86, 46], hip: [40, 72], kn: [66, 82], ft: [60, 106] }, hl: ['thigh'],
  },
  goblet: {
    A: m(STAND, { el: [64, 41], ha: [67, 31] }),
    B: { head: [55, 36], sh: [56, 46], el: [62, 60], ha: [64, 49], hip: [42, 72], kn: [66, 82], ft: [60, 106] }, hl: ['thigh'],
  },
  lunge: {
    A: m(STAND, { el: [60, 44], ha: [60, 60], kn: [64, 82], ft: [64, 106], kn2: [56, 82], ft2: [54, 106] }),
    B: { head: [60, 30], sh: [60, 41], el: [60, 57], ha: [60, 73], hip: [60, 72], kn: [80, 78], ft: [80, 104], kn2: [52, 96], ft2: [36, 104], to2: [30, 106] }, hl: ['thigh'],
  },
  bulgarian: {
    A: m(STAND, { el: [60, 44], ha: [60, 60], kn: [66, 82], ft: [66, 106], kn2: [48, 72], ft2: [34, 80], to2: [27, 78] }),
    B: { head: [58, 32], sh: [58, 43], el: [58, 59], ha: [58, 75], hip: [58, 74], kn: [76, 82], ft: [70, 106], kn2: [50, 92], ft2: [34, 80], to2: [27, 78] },
    env: [['rect', 18, 81, 22, 5], ['rect', 22, 86, 3, 20]], hl: ['thigh'],
  },
  leg_press: {
    A: { head: [22, 58], sh: [28, 66], el: [34, 80], ha: [42, 88], hip: [46, 86], kn: [60, 64], ft: [78, 70], to: [81, 63] },
    B: { head: [22, 58], sh: [28, 66], el: [34, 80], ha: [42, 88], hip: [46, 86], kn: [68, 74], ft: [90, 60], to: [93, 53] },
    env: [['line', 16, 52, 46, 92, 5], ['line', 46, 92, 58, 92, 5], ['line', 60, 106, 114, 44, 2]], hl: ['thigh'],
  },
  leg_extension: {
    A: m(SEATED, { el: [60, 58], ha: [64, 73] }), B: m(SEATED, { el: [60, 58], ha: [64, 73], ft: [103, 68], to: [104, 61] }),
    env: [['rect', 44, 74, 38, 5], ['rect', 46, 34, 4, 42], ['rect', 55, 79, 3, 27]], hl: ['thigh'],
  },
  seated_leg_curl: {
    A: m(SEATED, { el: [60, 58], ha: [64, 73], ft: [103, 68], to: [104, 61] }), B: m(SEATED, { el: [60, 58], ha: [64, 73], ft: [78, 95], to: [84, 99] }),
    env: [['rect', 44, 74, 38, 5], ['rect', 46, 34, 4, 42], ['rect', 55, 79, 3, 27]], hl: ['thigh'],
  },
  leg_curl: {
    A: { head: [18, 76], sh: [26, 78], el: [22, 88], ha: [12, 86], hip: [58, 80], kn: [82, 80], ft: [106, 82], to: [108, 88] },
    B: { head: [18, 76], sh: [26, 78], el: [22, 88], ha: [12, 86], hip: [58, 80], kn: [82, 80], ft: [92, 58], to: [98, 56] },
    env: [['rect', 14, 84, 74, 5], ['rect', 20, 89, 3, 17], ['rect', 80, 89, 3, 17]], hl: ['thigh'],
  },
  hip_thrust: {
    A: { head: [24, 58], sh: [30, 66], el: [40, 82], ha: [50, 88], hip: [50, 90], kn: [70, 74], ft: [76, 104] },
    B: { head: [24, 58], sh: [30, 66], el: [42, 70], ha: [56, 66], hip: [56, 68], kn: [76, 66], ft: [76, 104] },
    env: [['rect', 14, 68, 24, 6], ['rect', 18, 74, 3, 32]], hl: ['glute'],
  },
  glute_kick: {
    A: { head: [56, 18], sh: [58, 28], el: [66, 40], ha: [74, 46], hip: [60, 58], kn: [64, 80], ft: [60, 104], kn2: [61, 82], ft2: [60, 106] },
    B: { head: [56, 18], sh: [58, 28], el: [66, 40], ha: [74, 46], hip: [60, 58], kn: [46, 74], ft: [30, 84], to: [27, 90], kn2: [61, 82], ft2: [60, 106] },
    env: [['rect', 76, 30, 4, 76]], anchor: [6, 106], anchorTo: 'ft', hl: ['glute'],
  },
  abduction: {
    front: 1,
    A: { head: [60, 24], sh: [68, 35], el: [72, 52], ha: [70, 66], hip: [65, 66], kn: [69, 80], ft: [68, 102] },
    B: { head: [60, 24], sh: [68, 35], el: [72, 52], ha: [70, 66], hip: [65, 66], kn: [84, 78], ft: [80, 100] },
    env: [['rect', 48, 68, 24, 4]], hl: ['thigh'],
  },
  calf_raise: {
    A: m(STAND, { el: [61, 44], ha: [62, 60], to: [67, 106] }),
    B: { head: [60, 10], sh: [60, 21], el: [61, 38], ha: [62, 54], hip: [60, 52], kn: [61, 76], ft: [61, 99], to: [67, 106] },
    env: [['rect', 54, 106, 24, 3]], hl: ['shin'],
  },
  seated_calf: {
    A: m(SEATED, { head: [52, 40], sh: [54, 51], el: [62, 62], ha: [74, 70], hip: [58, 80], kn: [80, 80], ft: [80, 104], to: [87, 104] }),
    B: m(SEATED, { head: [52, 39], sh: [54, 50], el: [62, 61], ha: [74, 69], hip: [58, 80], kn: [80, 75], ft: [80, 98], to: [87, 104] }),
    env: [['rect', 44, 82, 26, 5], ['rect', 50, 87, 3, 19]], hl: ['shin'],
  },
  crunch: {
    A: { head: [24, 96], sh: [32, 99], el: [26, 90], ha: [22, 94], hip: [62, 100], kn: [78, 84], ft: [92, 103], to: [98, 104] },
    B: { head: [36, 80], sh: [42, 88], el: [34, 80], ha: [34, 86], hip: [62, 100], kn: [78, 84], ft: [92, 103], to: [98, 104] }, hl: ['abs'],
  },
  leg_raise: {
    A: { head: [24, 98], sh: [32, 100], el: [46, 102], ha: [58, 102], hip: [62, 101], kn: [84, 101], ft: [106, 101], to: [107, 95] },
    B: { head: [24, 98], sh: [32, 100], el: [46, 102], ha: [58, 102], hip: [62, 101], kn: [70, 80], ft: [78, 58], to: [84, 56] }, hl: ['abs'],
  },
  hanging_raise: {
    A: { head: [63, 19], sh: [60, 28], el: [60, 14], ha: [60, 0], hip: [60, 58], kn: [61, 80], ft: [60, 102] },
    B: { head: [63, 19], sh: [60, 28], el: [60, 14], ha: [60, 0], hip: [60, 58], kn: [80, 58], ft: [100, 60], to: [101, 53] },
    floor: false, env: [['rect', 40, -2, 40, 3]], hl: ['abs'],
  },
  plank: {
    A: { head: [24, 80], sh: [32, 84], el: [32, 102], ha: [44, 102], hip: [62, 88], kn: [80, 94], ft: [98, 100], to: [102, 104] },
    B: { head: [24, 79], sh: [32, 83], el: [32, 102], ha: [44, 102], hip: [62, 85], kn: [80, 93], ft: [98, 100], to: [102, 104] }, hl: ['abs'], speed: 3.5,
  },
  cable_crunch: {
    A: { head: [66, 40], sh: [64, 50], el: [70, 42], ha: [66, 34], hip: [62, 80], kn: [62, 104], ft: [40, 104], to: [36, 106] },
    B: { head: [90, 70], sh: [82, 64], el: [88, 56], ha: [86, 50], hip: [62, 80], kn: [62, 104], ft: [40, 104], to: [36, 106] }, anchor: [72, -8], hl: ['abs'],
  },
  run: {
    A: { head: [61, 16], sh: [61, 27], el: [52, 40], ha: [60, 50], el2: [68, 40], ha2: [77, 32], hip: [60, 58], kn: [72, 74], ft: [66, 96], kn2: [54, 82], ft2: [42, 96] },
    B: { head: [61, 16], sh: [61, 27], el: [68, 40], ha: [77, 32], el2: [52, 40], ha2: [60, 50], hip: [60, 58], kn: [54, 82], ft: [42, 96], kn2: [72, 74], ft2: [66, 96] },
    speed: 0.9, hl: ['thigh'],
  },
  bike: {
    A: { head: [56, 30], sh: [58, 40], el: [68, 50], ha: [80, 48], hip: [50, 64], kn: [70, 70], ft: [64, 84], kn2: [62, 80], ft2: [62, 102] },
    B: { head: [56, 30], sh: [58, 40], el: [68, 50], ha: [80, 48], hip: [50, 64], kn: [62, 80], ft: [62, 102], kn2: [70, 70], ft2: [64, 84] },
    floor: false, env: [['line', 46, 68, 62, 92, 3], ['line', 62, 92, 82, 50, 3], ['line', 62, 92, 50, 106, 3], ['line', 62, 92, 74, 106, 3], ['line', 42, 106, 82, 106, 3]], speed: 1.1, hl: ['thigh'],
  },
  jump: {
    A: m(STAND, { el: [64, 44], ha: [70, 56], kn: [63, 82], ft: [60, 106] }), B: m(STAND, { head: [60, 9], sh: [60, 20], el: [64, 37], ha: [70, 49], hip: [60, 51], kn: [61, 75], ft: [60, 98] }),
    speed: 0.7, hl: ['shin'],
  },
  jack: {
    front: 1, A: m(FRONT, { el: [71, 42], ha: [72, 58], kn: [65, 80], ft: [65, 104] }), B: m(FRONT, { el: [80, 14], ha: [86, 0], kn: [72, 80], ft: [80, 104] }), speed: 1.1, hl: ['delt'],
  },
};

/* ---------------- Desenho ---------------- */
const lerp = (a, b, t) => a + (b - a) * t;
function poseAt(pat, t) {
  const out = {};
  for (const k of Object.keys(pat.A)) {
    const a = pat.A[k], b = (pat.B && pat.B[k]) || a;
    out[k] = [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
  }
  if (pat.B) for (const k of Object.keys(pat.B)) {
    if (out[k]) continue;
    const base = k === 'to' ? pat.A.ft : k === 'to2' ? pat.A.ft2 : null;
    const a = base ? [base[0] + 6, base[1] + 1] : pat.B[k], b = pat.B[k];
    out[k] = [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
  }
  return out;
}

const fseg = (a, b, w, cls) => `<line class="${cls}" x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke-width="${w}"/>`;
const mir = (p) => [120 - p[0], p[1]];

function propAt(prop, p, front) {
  if (!p) return '';
  const [x, y] = p;
  switch (prop) {
    case 'barbell': case 'barbell_back': case 'barbell_hip':
      return `<circle class="f-prop" cx="${x}" cy="${y}" r="7.5"/><circle class="f-prop2" cx="${x}" cy="${y}" r="2"/>`;
    case 'dumbbell':
      return front ? `<rect class="f-propf" x="${x - 2.5}" y="${y - 5}" width="5" height="10" rx="1.5"/>` : `<rect class="f-propf" x="${x - 5}" y="${y - 2.5}" width="10" height="5" rx="1.5"/>`;
    case 'handle': case 'pad': return `<circle class="f-propf" cx="${x}" cy="${y}" r="2.6"/>`;
    case 'sled': return `<rect class="f-propf" x="${x - 2}" y="${y - 9}" width="4" height="18" rx="1.5" transform="rotate(-42 ${x} ${y})"/>`;
    default: return '';
  }
}

function drawPose(pat, pose, ex) {
  const prop = ex ? ex.p : null;
  let s = '';
  // ambiente
  if (pat.floor !== false) s += `<line class="f-env" x1="4" y1="108" x2="116" y2="108" stroke-width="1.5"/>`;
  (pat.env || []).forEach((e) => {
    if (e[0] === 'rect') s += `<rect class="f-envf" x="${e[1]}" y="${e[2]}" width="${e[3]}" height="${e[4]}" rx="1.5"/>`;
    else s += `<line class="f-env" x1="${e[1]}" y1="${e[2]}" x2="${e[3]}" y2="${e[4]}" stroke-width="${e[5] || 2}"/>`;
  });
  // cabo
  if (pat.anchor && (prop === 'handle' || prop === 'cable_ankle' || ex == null)) {
    const to = pose[pat.anchorTo || 'ha'];
    s += fseg(pat.anchor, to, 1, 'f-cable');
    if (pat.front) s += fseg(mir(pat.anchor), mir(to), 1, 'f-cable');
  }
  const hl = new Set(pat.hl || []);
  const C = (part) => (hl.has(part) ? 'f-hl' : 'f-body');
  const toe = (ft, to) => to || [ft[0] + 6, ft[1] + 1];

  if (pat.front) {
    const P = pose;
    const neck = [60, P.sh[1] - 2], pel = [60, P.hip[1]];
    // pernas
    [[P.hip, P.kn, P.ft], [mir(P.hip), mir(P.kn), mir(P.ft)]].forEach(([h, k, f]) => {
      s += fseg(h, k, 5.5, C('thigh')) + fseg(k, f, 5, C('shin'));
    });
    s += fseg(P.hip, mir(P.hip), 6, 'f-body');
    s += fseg(neck, pel, 10, hl.has('abs') ? 'f-hl' : 'f-body');
    s += fseg(P.sh, mir(P.sh), 6, 'f-body');
    if (hl.has('chest')) s += `<ellipse class="f-hlf" cx="60" cy="${P.sh[1] + 7}" rx="9" ry="4.5"/>`;
    // braços
    [[P.sh, P.el, P.ha], [mir(P.sh), mir(P.el), mir(P.ha)]].forEach(([sh, el, ha]) => {
      s += fseg(sh, el, 4.5, C('ua')) + fseg(el, ha, 4, C('fa'));
      if (hl.has('delt')) s += `<circle class="f-hlf" cx="${sh[0]}" cy="${sh[1]}" r="4.2"/>`;
    });
    if (prop === 'hbar') s += fseg([P.ha[0] + 6, P.ha[1]], [120 - P.ha[0] - 6, P.ha[1]], 2.5, 'f-propl');
    else if (prop) { s += propAt(prop, P.ha, true) + propAt(prop, mir(P.ha), true); }
    s += fseg(neck, P.head, 3.5, 'f-body');
    s += `<circle class="f-head" cx="${P.head[0]}" cy="${P.head[1]}" r="6.5"/>`;
    return s;
  }

  const P = pose;
  // membros de trás (mais claros)
  if (P.kn2) s += fseg(P.hip, P.kn2, 5, 'f-far') + fseg(P.kn2, P.ft2, 4.5, 'f-far') + fseg(P.ft2, toe(P.ft2, P.to2), 3.5, 'f-far');
  if (P.el2) s += fseg(P.sh, P.el2, 4, 'f-far') + fseg(P.el2, P.ha2, 3.5, 'f-far');
  // tronco e pernas
  s += fseg(P.sh, P.hip, 8, hl.has('torso') || hl.has('abs') ? 'f-hl' : 'f-body');
  if (hl.has('chest')) {
    const cx = lerp(P.sh[0], P.hip[0], 0.22), cy = lerp(P.sh[1], P.hip[1], 0.22);
    s += `<circle class="f-hlf" cx="${cx}" cy="${cy}" r="5"/>`;
  }
  if (hl.has('glute')) s += `<circle class="f-hlf" cx="${P.hip[0]}" cy="${P.hip[1]}" r="5"/>`;
  s += fseg(P.hip, P.kn, 6, C('thigh')) + fseg(P.kn, P.ft, 5, C('shin')) + fseg(P.ft, toe(P.ft, P.to), 3.5, 'f-body');
  // acessórios presos ao corpo
  if (prop === 'barbell_back') s += propAt('barbell', [P.sh[0] - 2, P.sh[1] - 1]);
  if (prop === 'barbell_hip') s += propAt('barbell', [P.hip[0], P.hip[1] - 6]);
  if (prop === 'sled') s += propAt('sled', P.ft);
  if (prop === 'pad' && pat.hl && (pat.hl.includes('thigh') || pat.hl.includes('shin'))) s += propAt('pad', pat.hl.includes('shin') ? P.kn : P.ft);
  // braço
  s += fseg(P.sh, P.el, 4.5, C('ua')) + fseg(P.el, P.ha, 4, C('fa'));
  if (hl.has('delt')) s += `<circle class="f-hlf" cx="${P.sh[0]}" cy="${P.sh[1]}" r="4.5"/>`;
  if (['barbell', 'dumbbell', 'handle'].includes(prop)) s += propAt(prop, P.ha);
  if (prop === 'hbar') s += propAt('dumbbell', P.ha);
  // cabeça
  s += fseg(P.sh, P.head, 3.5, 'f-body');
  s += `<circle class="f-head" cx="${P.head[0]}" cy="${P.head[1]}" r="6.5"/>`;
  return s;
}

function figureSVG(ex, opts = {}) {
  const pat = PATTERNS[ex && ex.a] || PATTERNS.curl;
  const t0 = opts.t != null ? opts.t : 0.5;
  const pose = poseAt(pat, ex && ex.rev ? 1 - t0 : t0);
  const rot = ex && ex.r ? `rotate(${ex.r} 50 74)` : '';
  return `<svg class="fig ${opts.animate ? 'anim' : ''} ${opts.cls || ''}" viewBox="0 -10 120 124" data-ex="${ex ? ex.id : ''}" aria-hidden="true"><g transform="${rot}">${drawPose(pat, pose, ex)}</g></svg>`;
}

/* ---------------- Loop de animação ---------------- */
let figRAF = null, figLast = 0;
function figTick(now) {
  figRAF = requestAnimationFrame(figTick);
  if (now - figLast < 33) return; // ~30 fps
  figLast = now;
  const list = document.querySelectorAll('svg.fig.anim');
  if (!list.length) { cancelAnimationFrame(figRAF); figRAF = null; return; }
  list.forEach((svg, i) => {
    const ex = EX_LOOKUP(svg.dataset.ex);
    if (!ex) return;
    const pat = PATTERNS[ex.a] || PATTERNS.curl;
    const period = (pat.speed || 2.6) * 1000;
    const ph = ((now + i * 370) % period) / period;
    let t = (1 - Math.cos(ph * Math.PI * 2)) / 2; // vai e volta suave
    if (ex.rev) t = 1 - t;
    const g = svg.firstElementChild;
    g.innerHTML = drawPose(pat, poseAt(pat, t), ex);
  });
}
function startFigures() {
  if (!figRAF && document.querySelector('svg.fig.anim')) figRAF = requestAnimationFrame(figTick);
}
// definido em core.js (procura também exercícios criados pelo usuário)
let EX_LOOKUP = (id) => EX_BY_ID[id];
