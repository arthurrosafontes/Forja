'use strict';
/* =========================================================
   Forja — mapa do corpo (frente e costas), desenho próprio
   bodySVG(view, colors, opts)  colors: { musculo: 'cor' }
   ========================================================= */

const BODY_BASE = `
  <circle cx="50" cy="14" r="9"/>
  <rect x="45.5" y="21" width="9" height="8" rx="3"/>
  <path d="M33,30 Q50,25 67,30 L72,42 L66,72 L65,92 L67,104 L33,104 L35,92 L34,72 L28,42 Z"/>
  <ellipse cx="26.5" cy="52" rx="5.5" ry="15" transform="rotate(10 26.5 52)"/>
  <ellipse cx="73.5" cy="52" rx="5.5" ry="15" transform="rotate(-10 73.5 52)"/>
  <ellipse cx="21.5" cy="80" rx="4.5" ry="14" transform="rotate(12 21.5 80)"/>
  <ellipse cx="78.5" cy="80" rx="4.5" ry="14" transform="rotate(-12 78.5 80)"/>
  <circle cx="18" cy="97" r="4"/><circle cx="82" cy="97" r="4"/>
  <ellipse cx="42" cy="128" rx="9" ry="25"/>
  <ellipse cx="58" cy="128" rx="9" ry="25"/>
  <ellipse cx="42" cy="168" rx="6" ry="19"/>
  <ellipse cx="58" cy="168" rx="6" ry="19"/>
  <ellipse cx="41" cy="190" rx="5" ry="3.5"/><ellipse cx="59" cy="190" rx="5" ry="3.5"/>`;

const pair = (shape) => shape + shape.replace(/cx="([\d.]+)"/g, (_, x) => `cx="${100 - parseFloat(x)}"`).replace(/rotate\((-?[\d.]+) ([\d.]+) ([\d.]+)\)/g, (_, a, x, y) => `rotate(${-parseFloat(a)} ${100 - parseFloat(x)} ${y})`);

const BODY_FRONT = {
  ombros: pair('<ellipse cx="32" cy="36" rx="7" ry="6"/>'),
  peitoral: '<path d="M36,38 Q43,35 49,38 L49,49 Q42,53 36,48 Z"/><path d="M64,38 Q57,35 51,38 L51,49 Q58,53 64,48 Z"/>',
  biceps: pair('<ellipse cx="27" cy="53" rx="3.8" ry="9" transform="rotate(10 27 53)"/>'),
  antebracos: pair('<ellipse cx="22" cy="79" rx="3.4" ry="10" transform="rotate(12 22 79)"/>'),
  abdomen: '<rect x="44" y="54" width="12" height="32" rx="3.5"/>',
  obliquos: pair('<ellipse cx="38.5" cy="70" rx="3.2" ry="10"/>'),
  abdutores: pair('<ellipse cx="35.5" cy="106" rx="3.2" ry="7"/>'),
  adutores: pair('<ellipse cx="47" cy="114" rx="2.6" ry="10"/>'),
  quadriceps: pair('<ellipse cx="41" cy="128" rx="6.5" ry="18"/>'),
  panturrilhas: pair('<ellipse cx="41.5" cy="165" rx="3.8" ry="11"/>'),
};
const BODY_BACK = {
  trapezio: '<path d="M50,24 L63,33 L55,38 L50,56 L45,38 L37,33 Z"/>',
  ombros: pair('<ellipse cx="32" cy="36" rx="7" ry="6"/>'),
  dorsais: '<path d="M37,40 L47,44 L48,74 L39,64 Z"/><path d="M63,40 L53,44 L52,74 L61,64 Z"/>',
  triceps: pair('<ellipse cx="27" cy="53" rx="3.8" ry="10" transform="rotate(10 27 53)"/>'),
  antebracos: pair('<ellipse cx="22" cy="79" rx="3.4" ry="10" transform="rotate(12 22 79)"/>'),
  lombares: '<rect x="44" y="76" width="12" height="15" rx="3"/>',
  gluteos: pair('<ellipse cx="43" cy="104" rx="7.5" ry="8.5"/>'),
  isquiotibiais: pair('<ellipse cx="42" cy="131" rx="6.2" ry="17"/>'),
  panturrilhas: pair('<ellipse cx="42" cy="162" rx="5" ry="11"/>'),
};

function bodySVG(view, colors = {}, opts = {}) {
  const map = view === 'back' ? BODY_BACK : BODY_FRONT;
  let muscles = '';
  for (const [k, shape] of Object.entries(map)) {
    const col = colors[k];
    const sel = opts.selected === k ? ' sel' : '';
    muscles += `<g class="bm${col ? ' on' : ''}${sel}" data-muscle="${k}" ${opts.click ? `data-action="${opts.click}" data-m="${k}"` : ''} style="${col ? `--mc:${col}` : ''}">${shape}</g>`;
  }
  return `<svg class="body-map ${opts.cls || ''}" viewBox="0 0 100 200" aria-label="Mapa do corpo — ${view === 'back' ? 'costas' : 'frente'}">
    <g class="bm-base">${BODY_BASE}</g>${muscles}</svg>`;
}

/* Dois mapas lado a lado (frente e costas) com legenda opcional */
function bodyPair(colors, opts = {}) {
  return `<div class="body-pair">${bodySVG('front', colors, opts)}${bodySVG('back', colors, opts)}</div>`;
}
