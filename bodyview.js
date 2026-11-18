'use strict';
/* =========================================================
   Forja — aba Corpo: peso, medidas, avaliação avançada e fotos
   ========================================================= */

const MEASURES = [
  ['pescoco', 'Pescoço'], ['ombros', 'Ombros'], ['peito', 'Peito'], ['braco_e', 'Braço (E)'], ['braco_d', 'Braço (D)'],
  ['antebraco_e', 'Antebraço (E)'], ['antebraco_d', 'Antebraço (D)'], ['cintura', 'Cintura'], ['abdomen', 'Abdômen'], ['quadril', 'Quadril'],
  ['coxa_e', 'Coxa (E)'], ['coxa_d', 'Coxa (D)'], ['panturrilha_e', 'Panturrilha (E)'], ['panturrilha_d', 'Panturrilha (D)'],
];
const FOLDS = [
  ['triceps', 'Tricipital'], ['subescapular', 'Subescapular'], ['biceps', 'Bicipital'], ['axilar', 'Axilar média'],
  ['suprailiaca', 'Supra-ilíaca'], ['peitoral', 'Torácica (peitoral)'], ['coxa', 'Coxa'], ['abdominal', 'Abdominal'], ['panturrilha', 'Panturrilha medial'],
];
const DIAMS = [['punho', 'Punho'], ['femur', 'Fêmur']];

const byDate = (arr) => [...arr].sort((a, b) => a.date.localeCompare(b.date));
const lastOf = (arr) => byDate(arr).pop() || null;
function bmi(kg) { const h = S.profile.height; return kg && h ? kg / ((h / 100) ** 2) : null; }
function bmiClass(b) {
  if (b == null) return null;
  return b < 18.5 ? ['Abaixo do peso', '#3a8dff'] : b < 25 ? ['Peso normal', '#2ecc71'] : b < 30 ? ['Sobrepeso', '#f5a623'] : b < 35 ? ['Obesidade I', '#ff7a1a'] : b < 40 ? ['Obesidade II', '#ff4d4d'] : ['Obesidade III', '#e01010'];
}
/* % de gordura: dobras (Jackson & Pollock 7 ou 3) → Siri; senão estimativa pelo IMC (Deurenberg) */
function bodyFat(assess, kg) {
  const sex = S.profile.sex, a = age();
  if (assess && assess.fat) return { v: assess.fat, src: 'informado' };
  if (assess && sex && a) {
    const f = assess.folds || {};
    const k7 = ['peitoral', 'axilar', 'triceps', 'subescapular', 'abdominal', 'suprailiaca', 'coxa'];
    if (k7.every((k) => f[k])) {
      const s = sum(k7.map((k) => f[k]));
      const D = sex === 'M' ? 1.112 - 0.00043499 * s + 0.00000055 * s * s - 0.00028826 * a : 1.097 - 0.00046971 * s + 0.00000056 * s * s - 0.00012828 * a;
      return { v: 495 / D - 450, src: 'dobras (7)' };
    }
    const k3 = sex === 'M' ? ['peitoral', 'abdominal', 'coxa'] : ['triceps', 'suprailiaca', 'coxa'];
    if (k3.every((k) => f[k])) {
      const s = sum(k3.map((k) => f[k]));
      const D = sex === 'M' ? 1.10938 - 0.0008267 * s + 0.0000016 * s * s - 0.0002574 * a : 1.0994921 - 0.0009929 * s + 0.0000023 * s * s - 0.0001392 * a;
      return { v: 495 / D - 450, src: 'dobras (3)' };
    }
  }
  const b = bmi(kg);
  if (b && sex && a) return { v: 1.2 * b + 0.23 * a - 10.8 * (sex === 'M' ? 1 : 0) - 5.4, src: 'estimativa pelo IMC' };
  return null;
}
function composition(kg, assess) {
  if (!kg) return null;
  const bf = bodyFat(assess, kg);
  const out = { fat: null, lean: null, residual: null, bone: null, muscle: null, bf };
  if (bf) { out.fat = (kg * bf.v) / 100; out.lean = kg - out.fat; }
  if (S.profile.sex) out.residual = kg * (S.profile.sex === 'F' ? 0.209 : 0.241);
  const d = assess && assess.diam, h = S.profile.height;
  if (d && d.punho && d.femur && h) out.bone = 3.02 * Math.pow((h / 100) ** 2 * (d.punho / 100) * (d.femur / 100) * 400, 0.712);
  if (out.fat != null && out.bone != null && out.residual != null) out.muscle = kg - out.fat - out.bone - out.residual;
  return out;
}

PAGES.body = function () {
  let html = `<div class="page-head"><h1>Corpo</h1></div>`;
  html += seg('bodySeg', [['peso', 'Peso'], ['medidas', 'Medidas'], ['avancado', 'Avançado'], ['fotos', 'Fotos']], UI.bodySeg);
  if (UI.bodySeg === 'medidas') html += bodyMeasuresTab();
  else if (UI.bodySeg === 'avancado') html += bodyAdvancedTab();
  else if (UI.bodySeg === 'fotos') html += bodyPhotosTab();
  else html += bodyWeightTab();
  const fab = { peso: ['weight', 'Registrar peso'], medidas: ['measures', 'Registrar medidas'], avancado: ['assess', 'Nova avaliação'], fotos: ['photo', 'Adicionar foto'] }[UI.bodySeg];
  html += '<div class="fab-space"></div>';
  html += `<button class="fab" data-action="${fab[0] === 'photo' ? 'addPhoto' : 'openBodyEntry'}" data-kind="${fab[0]}">＋ ${fab[1]}</button>`;
  return html;
};

function bodyWeightTab() {
  const ws = byDate(S.body.weights);
  const cur = ws.length ? ws[ws.length - 1].kg : null;
  const goal = S.body.goal;
  const b = bmi(cur), bc = bmiClass(b);
  const bf = cur ? bodyFat(lastOf(S.body.assess), cur) : null;
  const h = S.profile.height;
  const ideal = h ? [18.5 * (h / 100) ** 2, 24.9 * (h / 100) ** 2] : null;
  const first = ws.length ? ws[0].kg : null;
  let html = `<div class="card weight-hero">
    <div><span>Atual</span><b>${cur ? fmtNum(cur, 1) : '—'}<small> kg</small></b></div>
    <div data-action="setGoal" role="button"><span>Meta ✎</span><b class="blue">${goal ? fmtNum(goal, 1) : '—'}<small> kg</small></b></div>
    <div><span>Diferença</span><b>${cur && goal ? `${cur - goal > 0 ? '+' : ''}${fmtNum(cur - goal, 1)}` : '—'}<small> kg</small></b></div>
  </div>`;
  html += `<div class="card">${lineChart('weight', ws.map((w) => ({ label: fmtDateShort(w.date), full: fmtDateLong(w.date), y: w.kg })), { unit: 'kg', goal, avg: false, empty: 'Registre seu peso para ver o gráfico' })}
    ${first && cur && ws.length > 1 ? `<p class="small muted center">Desde ${fmtDateShort(ws[0].date)}: <b class="${cur <= first ? 'up' : ''}">${cur - first > 0 ? '+' : ''}${fmtNum(cur - first, 1)} kg</b></p>` : ''}</div>`;
  html += `<div class="section-title">Diagnóstico</div>
  <div class="card"><div class="diag">
    <div><span>IMC</span><b>${b ? fmtNum(b, 1) : '—'}</b>${bc ? `<em style="color:${bc[1]}">${bc[0]}</em>` : ''}</div>
    <div><span>Gordura</span><b>${bf ? fmtNum(bf.v, 1) + '%' : '—'}</b>${bf ? `<em>${bf.src}</em>` : ''}</div>
    <div><span>Peso ideal</span><b>${ideal ? `${Math.round(ideal[0])}–${Math.round(ideal[1])}` : '—'}<small> kg</small></b></div>
  </div>
  ${b ? `<div class="bmi-bar"><i style="left:${Math.min(100, Math.max(0, ((b - 15) / 25) * 100))}%"></i></div><div class="bmi-scale"><span>15</span><span>18,5</span><span>25</span><span>30</span><span>40</span></div>` : ''}
  ${!h || !S.profile.sex || !S.profile.birth ? '<button class="link" data-action="openProfile">Complete altura, sexo e nascimento no perfil para ver tudo</button>' : ''}
  </div>`;
  html += `<div class="section-title">Histórico</div><div class="card">${ws.length ? [...ws].reverse().map((w, i, arr) => {
    const prev = arr[i + 1];
    return `<div class="hist-row"><span>📅 ${fmtDateLong(w.date)}</span><b>${fmtNum(w.kg, 1)} kg ${prev ? `<em class="${w.kg <= prev.kg ? 'up' : 'down'}">${w.kg - prev.kg > 0 ? '+' : ''}${fmtNum(w.kg - prev.kg, 1)}</em>` : ''}</b><button class="icon-btn sm" data-action="delBody" data-kind="weights" data-id="${w.id}" aria-label="Excluir">🗑</button></div>`;
  }).join('') : emptyState('Sem registros', 'Toque em “Registrar peso”.')}</div>`;
  return html;
}

function bodyMeasuresTab() {
  const ms = byDate(S.body.measures);
  let html = '<div class="card list-card">';
  MEASURES.forEach(([k, n]) => {
    const series = ms.filter((m) => m.v[k] != null).map((m) => ({ label: fmtDateShort(m.date), full: fmtDateLong(m.date), y: m.v[k] }));
    const cur = series.length ? series[series.length - 1].y : null, prev = series.length > 1 ? series[series.length - 2].y : null;
    const open = UI.open === 'm_' + k;
    html += `<div class="m-row ${open ? 'open' : ''}" data-action="toggleOpen" data-k="m_${k}"><span>📈 ${n}</span><b>${cur != null ? fmtNum(cur, 1) : '--'} cm ${prev != null ? `<em>${cur - prev > 0 ? '+' : ''}${fmtNum(cur - prev, 1)}</em>` : ''}</b></div>
      ${open ? `<div class="m-chart">${lineChart('m_' + k, series, { unit: 'cm', empty: 'Adicione medidas para acompanhar a sua evolução.' })}</div>` : ''}`;
  });
  html += '</div>';
  html += `<div class="section-title">Histórico</div><div class="card">${ms.length ? [...ms].reverse().map((m) => `<div class="hist-row"><span>📅 ${fmtDateLong(m.date)}</span><b>${Object.keys(m.v).length} medidas</b><button class="icon-btn sm" data-action="delBody" data-kind="measures" data-id="${m.id}" aria-label="Excluir">🗑</button></div>`).join('') : emptyState('Sem medidas', 'Use uma fita métrica e registre a cada 2–4 semanas.')}</div>`;
  return html;
}

function bodyAdvancedTab() {
  const a = lastOf(S.body.assess);
  const kg = currentWeight();
  const comp = composition(kg, a);
  const row = (n, v, u) => `<div class="kv"><span>${n}</span><b>${v != null ? `${fmtNum(v, 1)} ${u}` : `-- ${u}`}</b></div>`;
  const b = bmi(kg);
  let html = `<div class="section-title">Informações gerais</div><div class="card list-card">
    <div class="kv" data-action="openProfile" role="button"><span>Altura ✎</span><b>${S.profile.height ? S.profile.height + ' cm' : '-- cm'}</b></div>
    ${row('Peso', kg, 'kg')}${row('IMC', b, 'kg/m²')}
    <div class="kv"><span>Taxa de gordura</span><b>${comp && comp.bf ? fmtNum(comp.bf.v, 1) + ' %' : '-- %'}</b></div>
  </div>
  <div class="section-title">Composição corporal</div><div class="card list-card">
    ${row('Peso gordo', comp && comp.fat, 'kg')}${row('Peso magro', comp && comp.lean, 'kg')}${row('Peso residual', comp && comp.residual, 'kg')}${row('Peso ósseo', comp && comp.bone, 'kg')}${row('Peso muscular', comp && comp.muscle, 'kg')}
  </div>
  <div class="section-title">Dobras cutâneas ${a ? `<span class="muted small">${fmtDateShort(a.date)}</span>` : ''}</div><div class="card list-card">
    ${FOLDS.map(([k, n]) => row(n, a && a.folds[k], 'mm')).join('')}
  </div>
  <div class="section-title">Diâmetro ósseo</div><div class="card list-card">${DIAMS.map(([k, n]) => row(n, a && a.diam[k], 'cm')).join('')}</div>
  <p class="small muted hint">Gordura por dobras usa Jackson & Pollock (7 ou 3 dobras) com a equação de Siri; peso ósseo usa a fórmula de Von Döbeln. As medições devem ser feitas com adipômetro, de preferência por um profissional.</p>`;
  if (S.body.assess.length) html += `<div class="section-title">Avaliações</div><div class="card">${byDate(S.body.assess).reverse().map((x) => `<div class="hist-row"><span>📅 ${fmtDateLong(x.date)}</span><b>${(() => { const f = bodyFat(x, kg); return f ? fmtNum(f.v, 1) + '%' : ''; })()}</b><button class="icon-btn sm" data-action="delBody" data-kind="assess" data-id="${x.id}">🗑</button></div>`).join('')}</div>`;
  return html;
}

function bodyPhotosTab() {
  const ph = UI.photos;
  if (!ph) { loadPhotos(); return `<div class="card">${emptyState('Carregando fotos…', '')}</div>`; }
  if (!ph.length) return `<div class="card">${emptyState('Nenhuma foto ainda', 'Tire fotos de frente, lado e costas a cada 4 semanas, com a mesma luz e posição. Ficam salvas só neste aparelho.', '📸')}</div>`;
  const sorted = [...ph].sort((a, b) => a.date.localeCompare(b.date));
  let html = sorted.length >= 2 ? `<div class="section-title">Antes e depois</div><div class="card compare">
    <figure><img src="${sorted[0].data}" alt=""><figcaption>${fmtDateShort(sorted[0].date)}</figcaption></figure>
    <figure><img src="${sorted[sorted.length - 1].data}" alt=""><figcaption>${fmtDateShort(sorted[sorted.length - 1].date)}</figcaption></figure></div>` : '';
  html += `<div class="section-title">Galeria</div><div class="photo-grid">${[...sorted].reverse().map((p) => `<button class="photo" data-action="viewPhoto" data-id="${p.id}"><img src="${p.data}" alt="" loading="lazy"><span>${fmtDateShort(p.date)}</span></button>`).join('')}</div>`;
  return html;
}
async function loadPhotos() {
  try { UI.photos = await PhotoDB.all(); } catch (e) { UI.photos = []; }
  if (UI.tab === 'body' && UI.bodySeg === 'fotos' && !topSheet()) render();
}
function compressImage(file, max = 1000) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      res(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

/* ---------------- Registros (folha) ---------------- */
SHEETS.bodyEntry = {
  render(data) {
    const k = data.kind;
    const title = { weight: 'Registrar peso', measures: 'Registrar medidas', assess: 'Nova avaliação', goal: 'Meta de peso' }[k];
    let body = '';
    if (k === 'weight') body = `<label class="field"><span>Peso (kg)</span><input class="big-input" data-bind="kg" inputmode="decimal" placeholder="${currentWeight() ? fmtNum(currentWeight(), 1) : '75,0'}" value="${esc(data.v.kg || '')}"></label>`;
    else if (k === 'goal') body = `<label class="field"><span>Meta (kg)</span><input class="big-input" data-bind="kg" inputmode="decimal" value="${esc(data.v.kg || S.body.goal || '')}"></label>`;
    else if (k === 'measures') body = `<div class="grid2">${MEASURES.map(([key, n]) => `<label class="field"><span>${n} (cm)</span><input data-bind="m_${key}" inputmode="decimal" value="${esc(data.v['m_' + key] || '')}"></label>`).join('')}</div>`;
    else body = `<div class="section-title">Dobras cutâneas (mm)</div><div class="grid2">${FOLDS.map(([key, n]) => `<label class="field"><span>${n}</span><input data-bind="f_${key}" inputmode="decimal" value="${esc(data.v['f_' + key] || '')}"></label>`).join('')}</div>
      <div class="section-title">Diâmetro ósseo (cm)</div><div class="grid2">${DIAMS.map(([key, n]) => `<label class="field"><span>${n}</span><input data-bind="d_${key}" inputmode="decimal" value="${esc(data.v['d_' + key] || '')}"></label>`).join('')}</div>
      <label class="field"><span>% de gordura (se já souber, ex: bioimpedância)</span><input data-bind="fat" inputmode="decimal" value="${esc(data.v.fat || '')}"></label>`;
    return `${sheetHead(title, { right: '<button class="btn primary sm" data-action="saveBodyEntry">Salvar</button>' })}
    <div class="sheet-body" id="sheetBody">
      ${k !== 'goal' ? `<label class="field"><span>Data</span><input type="date" data-bind="date" value="${data.date}" max="${todayKey()}"></label>` : ''}
      ${body}
      <button class="btn primary full big" data-action="saveBodyEntry">Salvar</button>
    </div>`;
  },
  input(el, data) { if (el.dataset.bind === 'date') data.date = el.value || todayKey(); else data.v[el.dataset.bind] = el.value; },
};

SHEETS.photo = {
  render(data) {
    const p = (UI.photos || []).find((x) => x.id === data.id);
    if (!p) return sheetHead('Foto');
    return `${sheetHead(fmtDateLong(p.date))}<div class="sheet-body" id="sheetBody"><img class="photo-full" src="${p.data}" alt="">
      <button class="btn ghost full danger" data-action="delPhoto" data-id="${p.id}">Excluir foto</button></div>`;
  },
};

Object.assign(actions, {
  openBodyEntry(el) { pushSheet('bodyEntry', { kind: el.dataset.kind, date: todayKey(), v: {} }); },
  setGoal() { pushSheet('bodyEntry', { kind: 'goal', date: todayKey(), v: {} }); },
  saveBodyEntry() {
    const data = topSheet().data, k = data.kind, v = data.v;
    if (k === 'weight' || k === 'goal') {
      const kg = parseNum(v.kg);
      if (!kg || kg < 20 || kg > 400) { alert('Informe um peso válido.'); return; }
      if (k === 'goal') S.body.goal = kg;
      else {
        S.body.weights = S.body.weights.filter((w) => w.date !== data.date);
        S.body.weights.push({ id: uid(), date: data.date, kg });
      }
    } else if (k === 'measures') {
      const vals = {};
      MEASURES.forEach(([key]) => { const n = parseNum(v['m_' + key]); if (n) vals[key] = n; });
      if (!Object.keys(vals).length) { alert('Preencha pelo menos uma medida.'); return; }
      S.body.measures.push({ id: uid(), date: data.date, v: vals });
    } else {
      const folds = {}, diam = {};
      FOLDS.forEach(([key]) => { const n = parseNum(v['f_' + key]); if (n) folds[key] = n; });
      DIAMS.forEach(([key]) => { const n = parseNum(v['d_' + key]); if (n) diam[key] = n; });
      const fat = parseNum(v.fat);
      if (!Object.keys(folds).length && !Object.keys(diam).length && !fat) { alert('Preencha pelo menos um valor.'); return; }
      S.body.assess.push({ id: uid(), date: data.date, folds, diam, fat: fat || null });
    }
    save();
    celebrate(checkAchievements());
    popSheet();
    if (!topSheet()) { if (k !== 'goal' && UI.tab !== 'body') toast('Registrado'); render(); }
  },
  delBody(el) {
    if (!confirm('Excluir este registro?')) return;
    S.body[el.dataset.kind] = S.body[el.dataset.kind].filter((x) => x.id !== el.dataset.id);
    save(); render();
  },
  addPhoto() { $('#photoFile').click(); },
  viewPhoto(el) { pushSheet('photo', { id: el.dataset.id }); },
  async delPhoto(el) {
    if (!confirm('Excluir esta foto?')) return;
    await PhotoDB.del(el.dataset.id); UI.photos = null; closeAllSheets(); loadPhotos();
  },
});

document.addEventListener('change', async (e) => {
  if (e.target.id !== 'photoFile') return;
  const f = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!f) return;
  try {
    const data = await compressImage(f);
    await PhotoDB.put({ id: uid(), date: todayKey(), data });
    UI.photos = null;
    celebrate(checkAchievements({ photo: true }));
    toast('Foto salva');
    loadPhotos();
  } catch (err) { alert('Não foi possível salvar a foto.'); }
});
