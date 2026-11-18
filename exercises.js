'use strict';
/* =========================================================
   Forja — aba Exercícios, página do exercício e seletor
   ========================================================= */

function exMatches(e, q, muscle, equip) {
  if (muscle && !e.m.includes(muscle)) return false;
  if (equip && e.eq !== equip) return false;
  if (q) {
    const nq = norm(q);
    const hay = norm(e.n + ' ' + (e.al || []).join(' ') + ' ' + muscleNames(e.m) + ' ' + (EQUIP[e.eq] || ''));
    if (!nq.split(' ').every((w) => hay.includes(w))) return false;
  }
  return true;
}
function exListItem(e, action = 'openExercise', extra = '') {
  const hist = exHistory(e.id);
  const best = hist.length ? Math.max(...hist.map((h) => h.st.maxW)) : 0;
  return `<li class="ex-row" data-action="${action}" data-id="${e.id}" data-name="${esc(e.n)}" ${extra}>
    <div class="thumb sm">${figureSVG(e, { t: 0.55 })}</div>
    <div class="ex-info"><div class="ex-name">${esc(e.n)}</div><div class="ex-meta">${muscleNames(e.m)} · ${EQUIP[e.eq] || ''}</div>
    ${hist.length ? `<div class="last">${plural(hist.length, 'treino', 'treinos')}${best ? ` · recorde ${fmtNum(best)} kg` : ''}</div>` : ''}</div>
    <span class="chev">›</span></li>`;
}
function exerciseListHTML() {
  const q = UI.exSearch, m = UI.exMuscle, eq = UI.exEquip;
  const list = allExercises().filter((e) => exMatches(e, q, m, eq));
  if (!q && !m && !eq) {
    const recent = [];
    sortedLogs().forEach((l) => l.exercises.forEach((x) => { const e = findEx(x.name, x.exId); if (e && !recent.includes(e)) recent.push(e); }));
    let html = '';
    if (recent.length) html += `<div class="section-title">Seus exercícios</div><div class="card"><ul class="ex-list">${recent.slice(0, 8).map((e) => exListItem(e)).join('')}</ul></div>`;
    Object.entries(GROUPS).forEach(([gk, g]) => {
      const ex = list.filter((e) => exGroup(e) === gk);
      if (ex.length) html += `<div class="section-title"><span><i class="gdot" style="background:${g.c}"></i>${g.n}</span><span class="muted small">${ex.length}</span></div><div class="card"><ul class="ex-list">${ex.map((e) => exListItem(e)).join('')}</ul></div>`;
    });
    return html;
  }
  return `<div class="section-title">${plural(list.length, 'exercício', 'exercícios')}${m ? ` · ${MUSCLES[m].n}` : ''}${(m || eq) ? ' <button class="link" data-action="clearExFilter">Limpar</button>' : ''}</div>
    <div class="card"><ul class="ex-list">${list.map((e) => exListItem(e)).join('') || `<li>${emptyState('Nada encontrado', 'Tente outro nome ou crie o exercício.')}</li>`}</ul></div>`;
}

PAGES.exercises = function () {
  const view = UI.exView;
  const col = UI.exMuscle ? { [UI.exMuscle]: 'var(--accent)' } : {};
  const muscles = view === 'back' ? MUSCLE_BACK : MUSCLE_FRONT;
  return `<div class="page-head"><h1>Exercícios</h1><button class="btn primary sm" data-action="newCustomEx">+ Criar</button></div>
  <div class="search"><span>⌕</span><input data-bind="exsearch" type="search" placeholder="Pesquisar ${allExercises().length} exercícios" value="${esc(UI.exSearch)}"></div>
  <div class="card body-pick">
    <div class="body-pick-map">${bodySVG(view, col, { click: 'pickMuscle', selected: UI.exMuscle })}</div>
    <div class="body-pick-side">
      ${muscles.map((m) => `<button class="mchip ${UI.exMuscle === m ? 'on' : ''}" data-action="pickMuscle" data-m="${m}">${MUSCLES[m].n}</button>`).join('')}
      <button class="mchip ${UI.exMuscle === 'cardio' ? 'on' : ''}" data-action="pickMuscle" data-m="cardio">Cardio</button>
    </div>
    <button class="rotate-btn" data-action="rotateBody">↻ ${view === 'back' ? 'Frente' : 'Costas'}</button>
  </div>
  <div class="filter-row"><select class="chip-select ${UI.exEquip ? 'on' : ''}" data-bind="exequip"><option value="">Todos os equipamentos</option>${Object.entries(EQUIP).map(([k, v]) => `<option value="${k}" ${UI.exEquip === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
  <div id="exList">${exerciseListHTML()}</div>`;
};
PAGE_INPUT.exercises = function (el, type) {
  const b = el.dataset.bind;
  if (b === 'exsearch' && type === 'input') { UI.exSearch = el.value; $('#exList').innerHTML = exerciseListHTML(); startFigures(); }
  if (b === 'exequip' && type === 'change') { UI.exEquip = el.value; render(); }
};

/* ---------------- Página do exercício ---------------- */
const METRICS = {
  vol: { n: 'Volume total', u: 'kg', d: 'Quantidade total de trabalho no exercício em cada treino: soma de peso × repetições de todas as séries.', f: (h) => h.st.vol },
  e1rm: { n: '1RM', u: 'kg', d: 'Estimativa da carga máxima que você levantaria em uma única repetição naquele treino, calculada a partir do peso e das repetições (fórmula de Epley).', f: (h) => h.st.e1rm },
  maxW: { n: 'Carga', u: 'kg', d: 'A maior carga usada no exercício em cada treino.', f: (h) => h.st.maxW },
  reps: { n: 'Repetições', u: 'reps', d: 'Total de repetições feitas no exercício em cada treino. Ajuda a ver sua resistência muscular ao longo do tempo.', f: (h) => h.st.reps },
};
SHEETS.exercise = {
  render(data) {
    const e = findEx(data.name, data.id);
    const key = e ? e.id : exKey(data.name);
    const name = e ? e.n : data.name;
    const hist = exHistory(key);
    if (!data.tab) data.tab = hist.length ? 'stats' : 'instr';
    let body = '';
    if (data.tab === 'stats') body = exStatsTab(data, hist, key);
    else if (data.tab === 'hist') body = exHistTab(hist);
    else body = exInstrTab(e, name);
    return `${sheetHead(esc(name), { right: e && e.custom ? `<button class="link" data-action="editCustomEx" data-id="${e.id}">Editar</button>` : '' })}
    <div class="sheet-body" id="sheetBody">
      <div class="ex-hero">
        ${e ? figureSVG(e, { animate: true, cls: 'big' }) : `<div class="thumb lg letter">${esc(name[0] || '?')}</div>`}
        <div class="ex-hero-info"><h2>${esc(name)}</h2>
          <div class="small muted">${e ? `${EQUIP[e.eq] || ''} · ${e.c ? 'Multiarticular' : 'Isolado'} · ${LEVELS[e.lvl]}` : 'Exercício livre'}</div>
          <div class="tags">${e ? e.m.map(muscleTag).join('') : ''}</div>
        </div>
      </div>
      <a class="btn ghost full yt" href="https://www.youtube.com/results?search_query=${encodeURIComponent('como fazer ' + stripPar(name) + ' ' + (e && e.eq !== 'corporal' ? (EQUIP[e.eq] || '') : '') + ' execução correta')}" target="_blank" rel="noopener">▶ Ver vídeos no YouTube</a>
      ${seg('sheet:tab', [['stats', 'Estatísticas'], ['instr', 'Instruções'], ['hist', 'Histórico']], data.tab)}
      ${body}
    </div>`;
  },
  input(el, data, type) {
    if (el.dataset.bind === 'xperiod' && type === 'change') { data.period = +el.value; UI.tips = {}; refreshSheet(); }
  },
};
function exStatsTab(data, hist, key) {
  const period = data.period ?? 0;
  const metric = data.metric || 'vol';
  const from = period ? addDays(todayKey(), -period) : '0000';
  const h = hist.filter((x) => x.date >= from);
  const M = METRICS[metric];
  const pts = h.map((x) => ({ label: fmtDateShort(x.date), full: fmtDateLong(x.date), y: M.f(x) }));
  const b = bestsFor(key, null);
  const info = (k, t) => `<button class="info" data-action="toggleOpen" data-k="${k}">i</button>${UI.open === k ? `<div class="info-box">${t}</div>` : ''}`;
  const rec = (k, label, v, unit, desc) => `<div class="rec-row"><div><b>${label}</b> ${info('rec_' + k, desc)}${v ? `<div class="small muted">${fmtDateLong(v.date)}</div>` : ''}</div><span>${v ? `${fmtNum(v.v, 1)} ${unit}` : '—'}</span></div>`;
  let pct = '';
  if (b.e1rm) {
    const rows = [95, 90, 85, 80, 75, 70, 65, 60, 50].map((p) => `<div class="pct-cell"><b>${p}%</b><span>${fmtNum(Math.round((b.e1rm.v * p) / 100 / 0.5) * 0.5)} kg</span><small>~${Math.max(1, Math.round(30 * (100 / p - 1)))} reps</small></div>`).join('');
    pct = `<div class="section-title">Cargas por % do 1RM</div><div class="card"><div class="pct-grid">${rows}</div><p class="small muted">Baseado no seu melhor 1RM estimado (${fmtNum(b.e1rm.v, 1)} kg).</p></div>`;
  }
  return `<div class="card">
    <div class="card-head"><h3>Progresso</h3><select class="chip-select" data-bind="xperiod">${[[0, 'Todo o período'], [30, '30 dias'], [90, '3 meses'], [180, '6 meses'], [365, '1 ano']].map(([v, l]) => `<option value="${v}" ${period === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    ${lineChart('ex', pts, { unit: M.u, avg: true, label: M.n, empty: hist.length ? 'Sem dados nesse período' : 'Sem dados ainda — registre um treino com este exercício' })}
    <div class="metric-chips">${Object.entries(METRICS).map(([k, x]) => `<button class="${k === metric ? 'on' : ''}" data-action="seg" data-name="sheet:metric" data-v="${k}">${x.n}</button>`).join('')}</div>
    <div class="metric-desc"><b>${M.n}</b><p>${M.d}</p></div>
  </div>
  <div class="section-title">Recordes pessoais</div>
  <div class="card">
    ${rec('vol', 'Melhor volume', b.vol, 'kg', METRICS.vol.d)}
    ${rec('e1rm', 'Melhor 1RM', b.e1rm, 'kg', METRICS.e1rm.d)}
    ${rec('maxW', 'Maior carga', b.maxW, 'kg', METRICS.maxW.d)}
    ${rec('maxR', 'Mais repetições numa série', b.maxR, 'reps', 'O maior número de repetições que você já fez em uma única série deste exercício.')}
  </div>${pct}`;
}
function exInstrTab(e, name) {
  if (!e) return `<div class="card">${emptyState('Exercício sem instruções', 'Este exercício foi digitado livremente. Crie-o na biblioteca para definir músculos e instruções.')}<button class="btn full" data-action="newCustomEx" data-name="${esc(name)}">Criar na biblioteca</button></div>`;
  const col = {};
  e.s.forEach((m) => { col[m] = 'var(--accent-mid)'; });
  e.m.forEach((m) => { col[m] = 'var(--accent)'; });
  return `${e.prep ? `<div class="instr"><h3>Preparação</h3><p>${esc(e.prep)}</p></div>` : ''}
  ${e.steps && e.steps.length ? `<div class="instr"><h3>Execução</h3><ol>${e.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>` : ''}
  ${e.tips && e.tips.length ? `<div class="instr"><h3>Dicas</h3><ul>${e.tips.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>` : ''}
  <div class="instr"><h3>Músculos alvo</h3>${bodyPair(col)}
    <p class="small"><i class="lg-dot" style="background:var(--accent)"></i> <b>Primários:</b> ${muscleNames(e.m)}</p>
    ${e.s.length ? `<p class="small"><i class="lg-dot" style="background:var(--accent-mid)"></i> <b>Secundários:</b> ${muscleNames(e.s)}</p>` : ''}
  </div>
  <button class="btn ghost full" data-action="findSimilar" data-m="${e.m[0]}">Ver exercícios parecidos</button>`;
}
function exHistTab(hist) {
  if (!hist.length) return `<div class="card">${emptyState('Sem histórico', 'Quando você registrar este exercício, cada treino aparece aqui.')}</div>`;
  return [...hist].reverse().map((h) => `<div class="card">
    <div class="card-head"><div><b>${fmtDateLong(h.date)}</b><div class="small muted">${esc(h.log.title)}</div></div><button class="icon-btn sm" data-action="editLog" data-id="${h.log.id}" aria-label="Editar">✎</button></div>
    <div class="hist-sets">${h.ex.sets.map((s, i) => `<div><span class="set-n">${i + 1}</span>${s.r != null ? fmtNum(s.r) : '—'} reps · ${s.w != null ? fmtNum(s.w) : '—'} kg</div>`).join('')}</div>
    <div class="small muted">Volume ${fmtInt(h.st.vol)} kg · 1RM ${fmtNum(h.st.e1rm, 1)} kg</div>
    ${h.ex.note ? `<p class="notes">📝 ${esc(h.ex.note)}</p>` : ''}
  </div>`).join('');
}

/* ---------------- Seletor de exercícios ---------------- */
const PICK = {
  draftAdd(e) {
    const cardio = exGroup(e) === 'cardio';
    S.draft.exercises.push(draftExercise(e.n, e.id, cardio ? 1 : 3, cardio ? '15' : '10', cardio ? 0 : S.settings.restDefault, '', S.draft.date, S.draft.logId));
    save();
  },
  draftReplace(e, d) {
    const old = S.draft.exercises[d.idx];
    const n = draftExercise(e.n, e.id, old.sets.length, old.reps, old.rest, old.tech, S.draft.date, S.draft.logId);
    n.sets.forEach((s, i) => { if (old.sets[i] && old.sets[i].done) { s.done = true; s.r = old.sets[i].r; } });
    S.draft.exercises[d.idx] = n; save(); toast(`Substituído por ${e.n}`);
  },
  planAdd(e, d) { const t = topSheet(); ensureDay(t.data.plan, d.wd).exercises.push({ id: uid(), exId: e.id, name: e.n, sets: 3, reps: exGroup(e) === 'cardio' ? '15' : '10', rest: exGroup(e) === 'cardio' ? 0 : 90, tech: '' }); },
  planReplace(e, d) { const x = topSheet().data.plan.days[d.wd].exercises[d.i]; x.exId = e.id; x.name = e.n; },
  instantAdd(e) { topSheet().data.list.push(instantItem(e)); },
};
SHEETS.pick = {
  render(data) {
    const q = data.q || '', m = data.m || '';
    const list = allExercises().filter((e) => exMatches(e, q, m, ''));
    const sug = data.suggest && !q && !m ? data.suggest : null;
    return `${sheetHead(data.mode === 'draftReplace' || data.mode === 'planReplace' ? 'Substituir exercício' : 'Adicionar exercício')}
    <div class="sheet-body" id="sheetBody">
      <div class="search"><span>⌕</span><input data-bind="pq" type="search" placeholder="Pesquisar exercício" value="${esc(q)}"></div>
      <div class="chip-scroll">${['', ...Object.keys(MUSCLES)].map((k) => `<button class="mchip ${m === k ? 'on' : ''}" data-action="pickFilter" data-m="${k}">${k ? MUSCLES[k].n : 'Todos'}</button>`).join('')}</div>
      ${sug ? `<div class="section-title">Mesmo músculo</div><div class="card"><ul class="ex-list">${allExercises().filter((e) => e.m.includes(sug)).map((e) => exListItem(e, 'pickEx')).join('')}</ul></div><div class="section-title">Todos</div>` : ''}
      <div class="card"><ul class="ex-list" id="pickList">${list.map((e) => exListItem(e, 'pickEx')).join('')}</ul></div>
      <button class="btn ghost full" data-action="newCustomEx" data-pick="1">+ Criar exercício personalizado</button>
    </div>`;
  },
  input(el, data, type) {
    if (el.dataset.bind !== 'pq' || type !== 'input') return;
    data.q = el.value;
    const list = allExercises().filter((e) => exMatches(e, data.q, data.m || '', ''));
    $('#pickList').innerHTML = list.map((e) => exListItem(e, 'pickEx')).join('') || `<li>${emptyState('Nada encontrado', 'Crie um exercício personalizado.')}</li>`;
  },
};

/* ---------------- Exercício personalizado ---------------- */
const CUSTOM_PATTERNS = {
  curl: 'Rosca (bíceps)', pushdown: 'Extensão de braço (tríceps)', bench: 'Supino deitado', chest_press: 'Empurrar sentado',
  shoulder_press: 'Empurrar acima da cabeça', lateral_raise: 'Elevação lateral', row: 'Remada curvada', seated_row: 'Remada sentada',
  pulldown: 'Puxada', squat: 'Agachamento', leg_press: 'Leg press', lunge: 'Afundo', leg_extension: 'Extensora', leg_curl: 'Flexora',
  deadlift: 'Levantamento terra', hip_thrust: 'Elevação pélvica', calf_raise: 'Panturrilha', crunch: 'Abdominal', plank: 'Prancha', run: 'Cardio',
};
SHEETS.customEx = {
  render(data) {
    const x = data.ex;
    const mchips = (field) => Object.entries(MUSCLES).map(([k, mm]) => `<button class="${x[field].includes(k) ? 'on' : ''}" data-action="customMuscle" data-f="${field}" data-m="${k}">${mm.n}</button>`).join('');
    return `${sheetHead(data.editing ? 'Editar exercício' : 'Novo exercício', { right: '<button class="btn primary sm" data-action="saveCustomEx">Salvar</button>' })}
    <div class="sheet-body" id="sheetBody">
      <div class="ex-hero">${figureSVG(x, { animate: true, cls: 'big' })}<div class="small muted">Prévia da animação</div></div>
      <label class="field"><span>Nome</span><input data-bind="cn" value="${esc(x.n)}" placeholder="Ex: Remada na máquina articulada"></label>
      <label class="field"><span>Tipo de movimento (animação)</span><select data-bind="ca">${Object.entries(CUSTOM_PATTERNS).map(([k, v]) => `<option value="${k}" ${x.a === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
      <label class="field"><span>Equipamento</span><select data-bind="ceq">${Object.entries(EQUIP).map(([k, v]) => `<option value="${k}" ${x.eq === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
      <div class="field"><span>Músculos principais</span><div class="chip-pick">${mchips('m')}</div></div>
      <div class="field"><span>Músculos secundários</span><div class="chip-pick">${mchips('s')}</div></div>
      <label class="field"><span>Como fazer (opcional — um passo por linha)</span><textarea data-bind="csteps" rows="4">${esc((x.steps || []).join('\n'))}</textarea></label>
      ${data.editing ? '<button class="btn ghost full danger" data-action="deleteCustomEx">Excluir exercício</button>' : ''}
    </div>`;
  },
  input(el, data, type) {
    const x = data.ex, b = el.dataset.bind;
    if (b === 'cn') x.n = el.value;
    if (b === 'csteps') x.steps = el.value.split('\n').map((s) => s.trim()).filter(Boolean);
    if (b === 'ceq') x.eq = el.value;
    if (b === 'ca' && type === 'change') { x.a = el.value; refreshSheet(); }
  },
};

Object.assign(actions, {
  openExercise(el) { pushSheet('exercise', { id: el.dataset.id || null, name: el.dataset.name || '' }); },
  pickMuscle(el) { const m = el.dataset.m; UI.exMuscle = UI.exMuscle === m ? null : m; render(); },
  rotateBody() { UI.exView = UI.exView === 'back' ? 'front' : 'back'; render(); },
  clearExFilter() { UI.exMuscle = null; UI.exEquip = ''; render(); },
  findSimilar(el) { UI.tab = 'exercises'; UI.exMuscle = el.dataset.m; UI.exSearch = ''; closeAllSheets(); window.scrollTo(0, 0); },
  pickFor(el) {
    const mode = el.dataset.mode, data = { mode, idx: +el.dataset.ex, wd: el.dataset.wd, i: +el.dataset.i };
    if (mode === 'draftReplace') { const e = findEx(S.draft.exercises[data.idx].name, S.draft.exercises[data.idx].exId); if (e) data.suggest = e.m[0]; }
    pushSheet('pick', data);
  },
  pickFilter(el) { topSheet().data.m = el.dataset.m; refreshSheet(); },
  pickEx(el) {
    const e = exById(el.dataset.id);
    const data = topSheet().data;
    popSheet();
    PICK[data.mode](e, data);
    refreshSheet();
  },
  newCustomEx(el) {
    pushSheet('customEx', { pick: !!el.dataset.pick, ex: { id: 'c_' + uid(), n: el.dataset.name || '', m: [], s: [], eq: 'maquina', a: 'curl', p: null, c: false, r: 0, rev: false, al: [], lvl: 1, prep: '', steps: [], tips: [], custom: true } });
  },
  editCustomEx(el) { pushSheet('customEx', { editing: true, ex: clone(exById(el.dataset.id)) }); },
  customMuscle(el) {
    const x = topSheet().data.ex, arr = x[el.dataset.f], m = el.dataset.m, i = arr.indexOf(m);
    if (i >= 0) arr.splice(i, 1); else arr.push(m);
    refreshSheet();
  },
  saveCustomEx() {
    const data = topSheet().data, x = data.ex;
    if (!x.n.trim()) { alert('Dê um nome ao exercício.'); return; }
    if (!x.m.length) { alert('Escolha pelo menos um músculo principal.'); return; }
    x.n = x.n.trim();
    x.c = x.m.length + x.s.length >= 3;
    const i = S.customExercises.findIndex((c) => c.id === x.id);
    if (i >= 0) S.customExercises[i] = x; else S.customExercises.push(x);
    indexExercises(); save();
    popSheet();
    const under = topSheet();
    if (data.pick && under && under.type === 'pick') { const pd = under.data; popSheet(); PICK[pd.mode](x, pd); }
    if (topSheet()) refreshSheet(); else render();
    toast('Exercício salvo');
  },
  deleteCustomEx() {
    const x = topSheet().data.ex;
    if (!confirm(`Excluir “${x.n}” da biblioteca? Seu histórico continua salvo.`)) return;
    S.customExercises = S.customExercises.filter((c) => c.id !== x.id);
    indexExercises(); save(); closeAllSheets();
  },
});
