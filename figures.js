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


/* ajustes por padrão: corpo de bruços (prone), largura lateral das mãos/cotovelos (zw), profundidade em padrões frontais (fd) */
const PAT_EXTRA = {
  pushup: { prone: 1, zw: { ha: 13, el: 13 } }, plank: { prone: 1, zw: { ha: 6, el: 9 } }, leg_curl: { prone: 1, zw: { ha: 8, el: 10 } }, back_ext: { prone: 1, zw: { ha: 4, el: 8 } },
  bench: { zw: { ha: 15, el: 15 } }, fly: { zw: { ha: 20, el: 17 } }, skull: { zw: { ha: 6, el: 8 } }, pullover: { zw: { ha: 4, el: 8 } },
  chest_press: { zw: { ha: 13, el: 13 } }, pulldown: { zw: { ha: 18, el: 17 } }, pullup: { zw: { ha: 18, el: 16 } }, straight_pulldown: { zw: { ha: 9, el: 11 } },
  squat: { zw: { ha: 17, el: 15 } }, row: { zw: { ha: 12, el: 12 } }, deadlift: { zw: { ha: 11 } }, stiff: { zw: { ha: 11 } }, hip_thrust: { zw: { ha: 14, el: 13 } },
  goblet: { zw: { ha: 3, el: 9 } }, seated_row: { zw: { ha: 5, el: 10 } }, face_pull: { zw: { ha: 7, el: 15 } }, cable_crunch: { zw: { ha: 4, el: 8 } },
  overhead_ext: { zw: { ha: 3, el: 7 } }, crunch: { zw: { ha: 7, el: 12 } }, wrist_curl: { zw: { ha: 8 } }, leg_press: { zw: { kn: 8, ft: 9 } },
  pec_deck: { fd: { kn: 20, ft: 22, el: 6, ha: 12, to: 28 } }, abduction: { fd: { kn: 22, ft: 23, el: 4, ha: 10, to: 29 } },
  cable_cross: { fd: { el: 5, ha: 12 } }, upright_row: { fd: { ha: 5, el: -2 } }, shoulder_press: { fd: { el: 3, ha: 2 } }, lateral_raise: { fd: { ha: 3 } }, shrug: { fd: { ha: 2 } },
};

/* =========================================================
   Desenho 3D simplificado: as poses (2D) viram pontos 3D e são
   projetadas no ângulo escolhido. Corpo com volume + músculos.
   ========================================================= */
const ANGLES = [
  { k: 'lat', n: 'Lateral', a: 0 },
  { k: 'tq', n: '3/4', a: -40 },
  { k: 'fr', n: 'Frente', a: -90 },
  { k: 'bk', n: 'Costas', a: 90 },
];
const defaultAngle = (ex) => ((PATTERNS[ex && ex.a] || {}).front ? 2 : 0);
const ZW = { sh: 8.5, el: 10.5, ha: 11, hip: 5.5, kn: 5.8, ft: 6.2, to: 6.2 };
const V = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  mul: (a, k) => [a[0] * k, a[1] * k, a[2] * k],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  len: (a) => Math.hypot(a[0], a[1], a[2]),
  norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  lerp: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t],
};

/* pose 2D → esqueleto 3D (lado R = perto na vista lateral, L = longe) */
function lift(pat, pose, ex) {
  const X = PAT_EXTRA[ex.a] || {};
  const zw = Object.assign({}, ZW, X.zw || {});
  const fd = X.fd || {};
  const rot = (ex.r || 0) * Math.PI / 180, cr = Math.cos(rot), sr = Math.sin(rot);
  const R = (p) => { if (!rot) return p; const dx = p[0] - 50, dy = p[1] - 74; return [50 + dx * cr - dy * sr, 74 + dx * sr + dy * cr, p[2]]; };
  const J = { R: {}, L: {} };
  const toeOf = (ft, kn) => (pat.front ? [ft[0] + 7, ft[1] + 1] : [ft[0] + 6, ft[1] + 1]);
  if (pat.front) {
    for (const j of ['sh', 'el', 'ha', 'hip', 'kn', 'ft']) {
      const p = pose[j]; if (!p) continue;
      const z = p[0] - 60, x = 60 + (fd[j] || 0);
      J.R[j] = R([x, p[1], z]); J.L[j] = R([x, p[1], -z]);
    }
    const tz = pose.ft[0] - 60;
    J.R.to = R([60 + (fd.to || 7), pose.ft[1] + 1.5, tz]); J.L.to = R([60 + (fd.to || 7), pose.ft[1] + 1.5, -tz]);
    J.head = R([60, pose.head[1], 0]);
  } else {
    const far = { el: 'el2', ha: 'ha2', kn: 'kn2', ft: 'ft2', to: 'to2' };
    for (const j of ['sh', 'el', 'ha', 'hip', 'kn', 'ft', 'to']) {
      let p = pose[j];
      if (!p && j === 'to') p = toeOf(pose.ft);
      if (!p) continue;
      J.R[j] = R([p[0], p[1], zw[j]]);
      let q = far[j] && pose[far[j]];
      if (!q && j === 'to' && pose.ft2) q = toeOf(pose.ft2);
      if (!q) q = p;
      J.L[j] = R([q[0], q[1], -zw[j]]);
    }
    J.head = R([pose.head[0], pose.head[1], 0]);
  }
  J.oneArm = !!pose.el2 && !pat.front;
  return J;
}

/* ---- projeção ---- */
function makeProj(angleDeg) {
  const a = angleDeg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return {
    p: (P) => [60 + (P[0] - 60) * c + P[2] * s, P[1]],
    d: (P) => -(P[0] - 60) * s + P[2] * c,
    dirD: (D) => -D[0] * s + D[2] * c,
    c, s,
  };
}
function hull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
const f1 = (n) => n.toFixed(1);
const polyStr = (pts) => pts.map((q) => `${f1(q[0])},${f1(q[1])}`).join(' ');
/* segmento afunilado (membro) entre dois pontos projetados */
function capsule(a, b, w1, w2, cls) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 0.001;
  const nx = -dy / L, ny = dx / L;
  const r1 = w1 / 2, r2 = w2 / 2;
  const pts = [[a[0] + nx * r1, a[1] + ny * r1], [b[0] + nx * r2, b[1] + ny * r2], [b[0] - nx * r2, b[1] - ny * r2], [a[0] - nx * r1, a[1] - ny * r1]];
  return `<g class="${cls}"><polygon points="${polyStr(pts)}"/><circle cx="${f1(a[0])}" cy="${f1(a[1])}" r="${f1(r1)}"/><circle cx="${f1(b[0])}" cy="${f1(b[1])}" r="${f1(r2)}"/></g>`;
}
function ellipseAlong(c, dir, rx, ry, cls) {
  const ang = Math.atan2(dir[1], dir[0]) * 180 / Math.PI;
  return `<ellipse class="${cls}" cx="${f1(c[0])}" cy="${f1(c[1])}" rx="${f1(rx)}" ry="${f1(ry)}" transform="rotate(${f1(ang)} ${f1(c[0])} ${f1(c[1])})"/>`;
}

/* músculos-alvo → classes */
function muscleClass(ex) {
  const cls = {};
  (ex.s || []).forEach((m) => { cls[m] = 'mu-s'; });
  (ex.m || []).forEach((m) => { cls[m] = 'mu-p'; });
  return (k) => cls[k] || 'mu';
}

function render3D(pat, pose, ex, angleIdx) {
  const ang = ANGLES[angleIdx] || ANGLES[0];
  const PR = makeProj(ang.a);
  const J = lift(pat, pose, ex);
  const X = PAT_EXTRA[ex.a] || {};
  const mc = muscleClass(ex);
  const items = []; // [profundidade, svg]
  const push = (d, svg) => items.push([d, svg]);
  const P = PR.p, D = PR.d;

  // ambiente (bancos, máquinas) em 3D simples
  let bg = '';
  if (pat.floor !== false) bg += `<ellipse class="f-shadow" cx="60" cy="108.5" rx="34" ry="3"/><line class="f-env" x1="2" y1="108" x2="118" y2="108" stroke-width="1.2"/>`;
  const rot = (ex.r || 0) * Math.PI / 180;
  const R2 = (x, y) => { if (!rot) return [x, y]; const dx = x - 50, dy = y - 74; return [50 + dx * Math.cos(rot) - dy * Math.sin(rot), 74 + dx * Math.sin(rot) + dy * Math.cos(rot)]; };
  (pat.env || []).forEach((e) => {
    if (e[0] === 'rect') {
      const [, x, y, w, h] = e, zh = w < 6 || h < 6 && w < 20 ? 3 : 11;
      const corners = [];
      [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(([cx, cy]) => { const q = R2(cx, cy); corners.push(P([q[0], q[1], zh]), P([q[0], q[1], -zh])); });
      bg += `<polygon class="f-envf" points="${polyStr(hull(corners))}"/>`;
    } else {
      const a = R2(e[1], e[2]), b = R2(e[3], e[4]);
      bg += `<line class="f-env" x1="${f1(P([a[0], a[1], 0])[0])}" y1="${f1(a[1])}" x2="${f1(P([b[0], b[1], 0])[0])}" y2="${f1(b[1])}" stroke-width="${e[5] || 2}"/>`;
    }
  });
  // cabos
  if (pat.anchor && ['handle', 'cable_ankle'].includes(ex.p)) {
    const to = pat.anchorTo || 'ha';
    const sides = to === 'ft' ? ['R'] : J.oneArm ? ['R'] : ['R', 'L'];
    sides.forEach((sd) => {
      const az = pat.front ? (sd === 'R' ? pat.anchor[0] - 60 : -(pat.anchor[0] - 60)) : J[sd][to][2];
      const ax = pat.front ? 60 : pat.anchor[0];
      const A3 = [ax, pat.anchor[1], az], H = P(J[sd][to]), A = P(A3);
      bg += `<line class="f-cable" x1="${f1(A[0])}" y1="${f1(A[1])}" x2="${f1(H[0])}" y2="${f1(H[1])}" stroke-width="1"/>`;
    });
  }

  // tronco
  const shM = V.lerp(J.R.sh, J.L.sh, 0.5), hipM = V.lerp(J.R.hip, J.L.hip, 0.5);
  const sp = V.sub(hipM, shM), spL = V.len(sp) || 1;
  let n = V.norm([sp[1], -sp[0], 0]); if (X.prone) n = V.mul(n, -1);
  const Z = [0, 0, 1];
  const up = V.norm(V.mul(sp, -1));
  const tPt = (t, z, off) => V.add(V.add(V.add(shM, V.mul(sp, t)), V.mul(Z, z)), V.mul(n, off));
  const tor = [];
  [[0.02, 9.6, 4.6, 4.2], [0.4, 8.4, 5.2, 4.4], [0.72, 6.6, 4.2, 3.8], [1, 7.2, 4, 4.8]].forEach(([t, hw, fw, bw]) => {
    [hw, -hw].forEach((z) => { tor.push(P(tPt(t, z, fw))); tor.push(P(tPt(t, z, -bw))); });
  });
  const torD = D(V.lerp(shM, hipM, 0.5)) - 0.4;
  push(torD, `<polygon class="f-skin" points="${polyStr(hull(tor))}"/>`);
  // músculos do tronco (cada um com sua profundidade; os de trás ficam escondidos)
  const belly = (C3, rx, ry, dir3, cls, base = torD) => {
    const c = P(C3), dd = PR.p(V.add(C3, dir3)), dir = [dd[0] - c[0], dd[1] - c[1]];
    push(base + 0.05 + (D(C3) - base) * 0.6, ellipseAlong(c, dir, rx, ry, cls));
  };
  [4.3, -4.3].forEach((z) => belly(tPt(0.2, z, 4.6), 4.6, 3.6, Z, mc('peitoral')));
  belly(tPt(0.62, 0, 4.4), 8, 3.4, up, mc('abdomen'));
  [6, -6].forEach((z) => belly(tPt(0.6, z, 2.6), 6, 2.3, up, mc('obliquos')));
  [5.6, -5.6].forEach((z) => belly(tPt(0.38, z, -3.9), 9.5, 2.9, up, mc('dorsais')));
  belly(tPt(0.1, 0, -3.8), 6.5, 3.6, up, mc('trapezio'));
  [2.2, -2.2].forEach((z) => belly(tPt(0.84, z, -3.8), 4.5, 1.8, up, mc('lombares')));
  // pescoço e cabeça
  const neckTop = V.add(J.head, V.mul(up, -3));
  push(D(J.head) - 0.2, capsule(P(V.add(shM, V.mul(up, 1))), P(neckTop), 6, 5, 'f-skin'));
  const hd = P(J.head);
  push(D(J.head) + 0.1, `<circle class="f-skin" cx="${f1(hd[0])}" cy="${f1(hd[1])}" r="6.2"/>`);
  // rostinho: indica para onde a pessoa olha
  const faceDir = V.norm(V.add(V.mul(n, 1), V.mul(up, 0.15)));
  const fdD = PR.dirD(faceDir);
  if (fdD > -0.2) {
    const fc = P(V.add(J.head, V.mul(faceDir, 4.2)));
    push(D(J.head) + 0.2, `<circle class="f-face" cx="${f1(fc[0])}" cy="${f1(fc[1])}" r="1.3"/>`);
  }

  // membros
  ['R', 'L'].forEach((sd) => {
    const j = J[sd], side = sd === 'R' ? 1 : -1;
    const limb = (a3, b3, w1, w2, cls) => push((D(a3) + D(b3)) / 2, capsule(P(a3), P(b3), w1, w2, cls));
    const antOf = (a3, b3) => {
      const u = V.norm(V.sub(b3, a3));
      let ant = V.sub(n, V.mul(u, V.dot(n, u)));
      if (V.len(ant) < 0.35) ant = V.sub(up, V.mul(u, V.dot(up, u)));
      return V.norm(ant);
    };
    const segBelly = (a3, b3, t, dir3, amt, rxf, ry, cls) => {
      const base = (D(a3) + D(b3)) / 2;
      const C = V.add(V.lerp(a3, b3, t), V.mul(dir3, amt));
      const c = P(C), pa = P(a3), pb = P(b3);
      const L = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]);
      push(base + 0.05 + (D(C) - base) * 0.6, ellipseAlong(c, [pb[0] - pa[0], pb[1] - pa[1]], Math.max(2, L * rxf), ry, cls));
    };
    // pernas
    limb(j.hip, j.kn, 10.5, 7, 'f-skin');
    limb(j.kn, j.ft, 7, 4.2, 'f-skin');
    limb(j.ft, j.to, 3.8, 3, 'f-skin');
    const ta = antOf(j.hip, j.kn), sa = antOf(j.kn, j.ft);
    segBelly(j.hip, j.kn, 0.52, ta, 2.8, 0.34, 4, mc('quadriceps'));
    segBelly(j.hip, j.kn, 0.48, V.mul(ta, -1), 2.6, 0.3, 3.4, mc('isquiotibiais'));
    segBelly(j.hip, j.kn, 0.3, [0, 0, -side], 3, 0.24, 2.2, mc('adutores'));
    segBelly(j.kn, j.ft, 0.3, V.mul(sa, -1), 2.2, 0.26, 3, mc('panturrilhas'));
    const gl = V.add(V.add(j.hip, V.mul(n, -4.4)), [0, 0, -side * 1.6]);
    belly(gl, 4.6, 4, up, mc('gluteos'), D(j.hip));
    belly(V.add(j.hip, [0, 0, side * 2.8]), 3.2, 2.2, up, mc('abdutores'), D(j.hip));
    // braços
    limb(j.sh, j.el, 7.6, 5.6, 'f-skin');
    limb(j.el, j.ha, 5.6, 3.6, 'f-skin');
    const hh = P(j.ha);
    push(D(j.ha) + 0.02, `<circle class="f-skin" cx="${f1(hh[0])}" cy="${f1(hh[1])}" r="2.7"/>`);
    const aa = antOf(j.sh, j.el);
    segBelly(j.sh, j.el, 0.56, aa, 1.9, 0.3, 2.8, mc('biceps'));
    segBelly(j.sh, j.el, 0.5, V.mul(aa, -1), 1.9, 0.32, 2.8, mc('triceps'));
    segBelly(j.el, j.ha, 0.3, antOf(j.el, j.ha), 0.6, 0.26, 2.4, mc('antebracos'));
    const dl = P(V.add(j.sh, [0, 0, side * 1.2]));
    push(D(j.sh) + 0.3, `<circle class="${mc('ombros')}" cx="${f1(dl[0])}" cy="${f1(dl[1])}" r="4.6"/>`);
  });

  // acessórios
  const plate = (C3, r, w) => {
    const c = P(C3), rx = Math.max(w || 1.6, r * Math.abs(PR.c));
    push(D(C3) + 0.4, `<ellipse class="f-plate" cx="${f1(c[0])}" cy="${f1(c[1])}" rx="${f1(rx)}" ry="${f1(r)}"/>`);
  };
  const barBetween = (a3, b3, ext, r) => {
    const mid = V.lerp(a3, b3, 0.5), ends = [V.add(mid, [0, 0, ext]), V.add(mid, [0, 0, -ext])];
    const e1 = P(ends[0]), e2 = P(ends[1]);
    push(D(mid) + 0.35, `<line class="f-bar" x1="${f1(e1[0])}" y1="${f1(e1[1])}" x2="${f1(e2[0])}" y2="${f1(e2[1])}" stroke-width="2"/>`);
    [ext - 3, -(ext - 3)].forEach((z) => plate(V.add(mid, [0, 0, z]), r));
  };
  const p = ex.p;
  if (p === 'barbell' || p === 'hbar') barBetween(J.R.ha, J.L.ha, p === 'hbar' ? 21 : 26, p === 'hbar' ? 5.5 : 8);
  else if (p === 'barbell_back') barBetween(V.add(J.R.sh, V.mul(n, -4)), V.add(J.L.sh, V.mul(n, -4)), 26, 8);
  else if (p === 'barbell_hip') barBetween(V.add(J.R.hip, V.mul(n, 5)), V.add(J.L.hip, V.mul(n, 5)), 26, 8);
  else if (p === 'dumbbell') {
    (J.oneArm ? ['R'] : ['R', 'L']).forEach((sd) => {
      const h = J[sd].ha;
      const a = P(V.add(h, [0, 0, 4.5])), b = P(V.add(h, [0, 0, -4.5]));
      push(D(h) + 0.35, `<line class="f-bar" x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke-width="2"/>`);
      [4, -4].forEach((z) => plate(V.add(h, [0, 0, z]), 3.4, 1.6));
    });
  } else if (p === 'handle') {
    (J.oneArm ? ['R'] : ['R', 'L']).forEach((sd) => { const h = P(J[sd].ha); push(D(J[sd].ha) + 0.3, `<circle class="f-plate" cx="${f1(h[0])}" cy="${f1(h[1])}" r="1.8"/>`); });
  } else if (p === 'sled') {
    const mid = V.lerp(J.R.ft, J.L.ft, 0.5), corners = [];
    [[-6, -10], [6, 10]].forEach(() => {});
    const u = V.norm([-0.7, -0.7, 0]);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => corners.push(P(V.add(V.add(V.add(mid, [3, -2, 0]), V.mul(u, a * 9)), [0, 0, b * 13]))));
    push(D(mid) + 2, `<polygon class="f-envf strong" points="${polyStr(hull(corners))}"/>`);
  } else if (p === 'pad') {
    const at = ['shin', 'seated_calf'].includes(ex.a) || ex.a === 'seated_calf' ? 'kn' : 'ft';
    const a = P(V.add(J.R[at], [0, 0, 9])), b = P(V.add(J.L[at], [0, 0, -9]));
    push(Math.max(D(J.R[at]), D(J.L[at])) + 0.5, `<line class="f-pad" x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke-width="4.5"/>`);
  }

  items.sort((a, b) => a[0] - b[0]);
  return bg + items.map((x) => x[1]).join('');
}

function figureSVG(ex, opts = {}) {
  const pat = PATTERNS[ex && ex.a] || PATTERNS.curl;
  const e = ex || { a: 'curl', m: [], s: [] };
  const t0 = opts.t != null ? opts.t : 0.55;
  const ang = opts.angle != null ? opts.angle : defaultAngle(e);
  const pose = poseAt(pat, e.rev ? 1 - t0 : t0);
  return `<svg class="fig ${opts.animate ? 'anim' : ''} ${opts.cls || ''}" viewBox="0 -10 120 124" data-ex="${e.id || ''}" data-angle="${ang}" ${opts.slow ? 'data-slow="1"' : ''} aria-hidden="true"><g>${render3D(pat, pose, e, ang)}</g></svg>`;
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
    const r = svg.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return; // fora da tela
    const ex = EX_LOOKUP(svg.dataset.ex);
    if (!ex) return;
    const pat = PATTERNS[ex.a] || PATTERNS.curl;
    const period = (pat.speed || 2.6) * 1000 * (svg.dataset.slow ? 2.4 : 1);
    const ph = ((now + (svg.classList.contains('sync') ? 0 : i * 370)) % period) / period;
    let t = (1 - Math.cos(ph * Math.PI * 2)) / 2;
    if (ex.rev) t = 1 - t;
    svg.firstElementChild.innerHTML = render3D(pat, poseAt(pat, t), ex, +svg.dataset.angle || 0);
  });
}
function startFigures() {
  if (!figRAF && document.querySelector('svg.fig.anim')) figRAF = requestAnimationFrame(figTick);
}
// definido em core.js (procura também exercícios criados pelo usuário)
let EX_LOOKUP = (id) => EX_BY_ID[id];
