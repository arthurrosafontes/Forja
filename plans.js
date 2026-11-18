'use strict';
/* =========================================================
   Forja — aba Treinos (Meus treinos + Explorar) e editor
   ========================================================= */

function planMuscles(daysObj) {
  const col = {};
  Object.values(daysObj).forEach((d) => (d.exercises || []).forEach((x) => {
    const e = findEx(x.name, x.exId);
    if (!e) return;
    e.s.forEach((m) => { col[m] = col[m] || 'var(--accent-mid)'; });
    e.m.forEach((m) => { col[m] = 'var(--accent)'; });
  }));
  return col;
}
function programDaysAsPlan(p) {
  const days = {};
  Object.entries(p.days).forEach(([wd, [title, list]]) => { days[wd] = { title, exercises: list.map(([id, sets, reps, rest, tech]) => ({ exId: id, name: EX_BY_ID[id].n, sets, reps, rest, tech: tech || '' })) }; });
  return days;
}
const programTags = (p) => [LEVELS[p.level], `${Object.keys(p.days).length} dias`, p.place === 'casa' ? 'Em casa' : 'Academia', GOALS[p.goal].n, p.weeks ? `${p.weeks} semanas` : ''].filter(Boolean);

PAGES.plans = function () {
  let html = `<div class="page-head"><h1>Treinos</h1>${UI.plansSeg === 'mine' ? '<div class="row-btns gap"><button class="btn ghost sm" data-action="importPlan">Importar</button><button class="btn primary sm" data-action="newPlan">+ Criar</button></div>' : ''}</div>`;
  html += seg('plansSeg', [['mine', 'Meus treinos'], ['explore', 'Explorar']], UI.plansSeg);
  html += UI.plansSeg === 'explore' ? renderExplore() : renderMyPlans();
  return html;
};

function renderMyPlans() {
  let html = '<p class="muted small page-sub">O treino ativo é o que aparece na tela inicial e no calendário.</p>';
  html += `<button class="card instant-cta" data-action="openInstant"><span class="qi">⚡</span><div><b>Treino Imediato</b><div class="small muted">Um treino novo baseado nas suas preferências</div></div><span class="chev">›</span></button>`;
  if (!S.plans.length) html += `<div class="card">${emptyState('Nenhum treino ainda', 'Crie sua própria rotina ou escolha uma pronta em Explorar.', '📋')}</div>`;
  S.plans.forEach((p) => {
    const active = p.id === S.activePlanId;
    const nDays = planDays(p).length;
    const last = sortedLogs().find((l) => l.planId === p.id);
    const week = WEEK_ORDER.map((wd) => {
      const pd = planDay(p, wd);
      return `<li><span class="d">${DAY_SHORT[wd]}</span>${pd ? `<span class="ellipsis">${esc(pd.title || 'Treino')} <span class="muted">· ${pd.exercises.length} ex.</span></span>` : '<span class="rest">Descanso</span>'}</li>`;
    }).join('');
    html += `<div class="card plan-card ${active ? 'active' : ''}">
      <div class="card-head">
        <div style="min-width:0" data-action="viewPlan" data-id="${p.id}" role="button"><h3 class="ellipsis">${esc(p.name)}</h3>
          <div class="small muted">${nDays} ${nDays === 1 ? 'dia' : 'dias'} por semana${p.weeks ? ` · ${p.weeks} semanas` : ''}</div>
          ${last ? `<div class="small accent">Último treino: ${DAY_SHORT[fromKey(last.date).getDay()]}, ${fmtDateShort(last.date)}</div>` : ''}</div>
        ${active ? '<span class="badge accent">Ativo</span>' : `<button class="btn sm" data-action="activatePlan" data-id="${p.id}">Usar</button>`}
      </div>
      <ul class="plan-week">${week}</ul>
      <div class="row-actions"><button class="link" data-action="viewPlan" data-id="${p.id}">Ver</button><button class="link" data-action="editPlan" data-id="${p.id}">Editar</button><button class="link muted" data-action="dupPlan" data-id="${p.id}">Duplicar</button></div>
    </div>`;
  });
  return html;
}

function programCard(p) {
  const col = planMuscles(programDaysAsPlan(p));
  return `<button class="card prog-card" data-action="openProgram" data-id="${p.id}">
    <div class="prog-txt"><div class="eyebrow" style="color:${GOALS[p.goal].c}">${GOALS[p.goal].n}</div><h3>${esc(p.name)}</h3><div class="small muted">${esc(p.sub)}</div>
    <div class="tags">${programTags(p).slice(0, 3).map((t) => `<span class="tag">${t}</span>`).join('')}</div></div>
    <div class="mini-body">${bodySVG('front', col)}${bodySVG('back', col)}</div>
  </button>`;
}
function renderExplore() {
  const f = UI.exploreFilter || {};
  const list = PROGRAMS.filter((p) => (!f.goal || p.goal === f.goal) && (!f.level || p.level === +f.level) && (!f.place || p.place === f.place) && (!f.days || Object.keys(p.days).length === +f.days || (+f.days === 5 && Object.keys(p.days).length >= 5)));
  let html = `<div class="hero-scroll">${Object.entries(GOALS).filter(([k]) => PROGRAMS.some((p) => p.goal === k)).map(([k, g]) => `
    <button class="hero-card" style="--hc:${g.c}" data-action="exploreGoal" data-g="${k}">
      <span class="hero-k">Objetivo</span><b>${g.n}</b><small>${g.d}</small><span class="hero-btn">Ver treinos ›</span>
    </button>`).join('')}</div>`;
  const fsel = (k, opts, label) => `<select class="chip-select ${f[k] ? 'on' : ''}" data-bind="xf_${k}"><option value="">${label}</option>${opts.map(([v, l]) => `<option value="${v}" ${String(f[k]) === String(v) ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
  html += `<div class="filter-row">
    ${fsel('goal', Object.entries(GOALS).map(([k, g]) => [k, g.n]), 'Objetivo')}
    ${fsel('level', Object.entries(LEVELS), 'Nível')}
    ${fsel('days', [[3, '3 dias'], [4, '4 dias'], [5, '5+ dias']], 'Frequência')}
    ${fsel('place', [['academia', 'Academia'], ['casa', 'Em casa']], 'Local')}
  </div>`;
  if (Object.values(f).some(Boolean)) {
    html += `<div class="section-title">${list.length} ${list.length === 1 ? 'programa' : 'programas'} <button class="link" data-action="clearExplore">Limpar filtros</button></div>`;
    html += list.map(programCard).join('') || `<div class="card">${emptyState('Nenhum programa', 'Tente outros filtros.')}</div>`;
  } else {
    Object.entries(GOALS).forEach(([k, g]) => {
      const ps = PROGRAMS.filter((p) => p.goal === k);
      if (ps.length) html += `<div class="section-title">${g.n}</div>${ps.map(programCard).join('')}`;
    });
  }
  html += `<div class="section-title">Por grupo muscular</div><div class="group-grid">${Object.entries(GROUPS).map(([k, g]) => `<button class="group-card" style="--gc:${g.c}" data-action="exploreMuscle" data-m="${g.m[0]}"><b>${g.n}</b><small>${EXERCISES.filter((e) => e.m.some((m) => g.m.includes(m))).length} exercícios</small></button>`).join('')}</div>`;
  return html;
}
PAGE_INPUT.plans = function (el, type) {
  if (type !== 'change' || !el.dataset.bind.startsWith('xf_')) return;
  UI.exploreFilter = UI.exploreFilter || {};
  UI.exploreFilter[el.dataset.bind.slice(3)] = el.value;
  render();
};

/* ---------------- Programa pronto ---------------- */
SHEETS.program = {
  render(data) {
    const p = PROGRAMS.find((x) => x.id === data.id);
    const days = programDaysAsPlan(p);
    const col = planMuscles(days);
    const open = data.more;
    return `${sheetHead(esc(p.name))}
    <div class="sheet-body" id="sheetBody">
      <div class="prog-hero" style="--hc:${GOALS[p.goal].c}"><div class="eyebrow" style="color:var(--hc)">${GOALS[p.goal].n}</div><h1>${esc(p.name)}</h1><div class="muted">${esc(p.sub)}</div></div>
      <p class="desc ${open ? '' : 'clamp'}">${esc(p.desc)}</p>${!open ? '<button class="link" data-action="progMore">Ver mais</button>' : ''}
      <div class="tags">${programTags(p).map((t) => `<span class="tag">${t}</span>`).join('')}</div>
      <div class="card">${bodyPair(col)}<div class="legend center"><span><i class="lg-dot" style="background:var(--accent)"></i>Principais</span><span><i class="lg-dot" style="background:var(--accent-mid)"></i>Secundários</span></div></div>
      ${WEEK_ORDER.filter((wd) => days[wd]).map((wd, n) => `
        <div class="day-block"><div class="day-num">${n + 1}</div><div><div class="eyebrow">${DAY_LONG[wd]}</div><h3>${esc(days[wd].title)}</h3></div></div>
        <div class="card"><ul class="ex-list">${days[wd].exercises.map((x) => `<li class="ex-row" data-action="openExercise" data-id="${x.exId}" data-name="${esc(x.name)}">${exThumb(x.name, x.exId)}<div class="ex-info"><div class="ex-name">${esc(x.name)} ${techBadge(x.tech)}</div><div class="ex-meta">${x.sets} séries • ${esc(x.reps)} reps • ${fmtRest(x.rest)}</div></div></li>`).join('')}</ul></div>`).join('')}
      <div class="tech-legend">${Object.entries(TECHNIQUES).filter(([k]) => k).map(([k, t]) => `${techBadge(k)} ${t.n}`).join(' · ')}</div>
      <button class="btn primary full big sticky-cta" data-action="useProgram" data-id="${p.id}">Usar este treino</button>
    </div>`;
  },
};

/* ---------------- Ver treino (meu) ---------------- */
SHEETS.planView = {
  render(data) {
    const p = S.plans.find((x) => x.id === data.id);
    if (!p) return sheetHead('Treino');
    const col = planMuscles(p.days);
    const active = p.id === S.activePlanId;
    const prog = planProgress(p);
    return `${sheetHead(esc(p.name), { right: `<button class="link" data-action="editPlan" data-id="${p.id}">Editar</button>` })}
    <div class="sheet-body" id="sheetBody">
      <div class="plan-hero-top"><div><h1>${esc(p.name)}</h1><div class="muted small">${prog.days} dias por semana${p.weeks ? ` · ${p.weeks} semanas` : ''}</div></div>${prog.prog ? ring(prog.prog.pct, `${Math.round(prog.prog.pct * 100)}%`, 62) : ''}</div>
      ${p.desc ? `<p class="desc">${esc(p.desc)}</p>` : ''}
      ${active ? '<span class="badge accent">Treino ativo</span>' : `<button class="btn primary full" data-action="activatePlan" data-id="${p.id}">Usar como treino ativo</button>`}
      <div class="card mt">${bodyPair(col)}</div>
      ${WEEK_ORDER.filter((wd) => planDay(p, wd)).map((wd) => {
        const d = p.days[wd];
        const last = sortedLogs().find((l) => l.planId === p.id && l.wd === wd);
        return `<div class="day-block"><div class="day-num">${DAY_SHORT[wd]}</div><div style="flex:1"><h3>${esc(d.title || 'Treino')}</h3><div class="small muted">${d.exercises.length} exercícios${last ? ` · último: ${fmtDateShort(last.date)}` : ''}</div></div><button class="btn sm" data-action="trainDay" data-id="${p.id}" data-wd="${wd}">Treinar</button></div>
        <div class="card"><ul class="ex-list">${d.exercises.map((x) => `<li class="ex-row" data-action="openExercise" data-id="${x.exId || ''}" data-name="${esc(x.name)}">${exThumb(x.name, x.exId)}<div class="ex-info"><div class="ex-name">${esc(x.name)} ${techBadge(x.tech)}</div><div class="ex-meta">${x.sets} × ${esc(x.reps)} • ${fmtRest(x.rest)}</div></div></li>`).join('')}</ul></div>`;
      }).join('') || emptyState('Treino vazio', 'Toque em Editar para adicionar exercícios.')}
      <div class="row-actions"><button class="link" data-action="dupPlan" data-id="${p.id}">Duplicar</button><button class="link" data-action="exportIcs" data-id="${p.id}">Lembretes no Calendário</button><button class="link" data-action="sharePlan" data-id="${p.id}">Compartilhar</button></div>
    </div>`;
  },
};

/* ---------------- Editor de treino ---------------- */
SHEETS.plan = {
  render(data) {
    const pe = data.plan;
    const days = WEEK_ORDER.map((wd) => {
      const day = pe.days[wd] || { title: '', exercises: [] };
      const open = String(data.open) === String(wd);
      const n = day.exercises.length;
      const others = WEEK_ORDER.filter((o) => o !== wd && pe.days[o] && pe.days[o].exercises.length);
      return `<div class="card day-card ${open ? 'open' : ''}">
        <button class="day-toggle" data-action="toggleDay" data-wd="${wd}">
          <span class="day-name">${DAY_LONG[wd]}</span>
          <span class="day-sum ${n ? 'on' : ''}">${n ? `${esc(day.title || 'Treino')} · ${n} ex.` : 'Descanso'}</span><span class="chev">›</span>
        </button>
        ${open ? `<div class="day-body">
          <input data-bind="dtitle" data-wd="${wd}" placeholder="Nome do dia (ex: Peito e Tríceps)" value="${esc(day.title)}">
          ${day.exercises.map((ex, i) => `<div class="plan-ex">
            <div class="plan-ex-top">
              ${exThumb(ex.name, ex.exId, 'xs')}
              ${ex.exId ? `<button class="plan-ex-name" data-action="pickFor" data-mode="planReplace" data-wd="${wd}" data-i="${i}">${esc(ex.name)}<small>trocar</small></button>` : `<input data-bind="ename" data-wd="${wd}" data-i="${i}" placeholder="Nome do exercício" value="${esc(ex.name)}">`}
              ${i > 0 ? `<button class="icon-btn sm" data-action="movePlanEx" data-wd="${wd}" data-i="${i}" aria-label="Subir">↑</button>` : ''}
              <button class="icon-btn sm" data-action="removePlanEx" data-wd="${wd}" data-i="${i}" aria-label="Remover">✕</button>
            </div>
            <div class="plan-ex-grid">
              <label><span>Séries</span><input data-bind="esets" data-wd="${wd}" data-i="${i}" inputmode="numeric" value="${esc(ex.sets)}"></label>
              <label><span>Reps</span><input data-bind="ereps" data-wd="${wd}" data-i="${i}" placeholder="10 ou 8-12" value="${esc(ex.reps)}"></label>
              <label><span>Descanso</span>${restSelect('erest', ex.rest, `data-wd="${wd}" data-i="${i}"`)}</label>
              <label><span>Técnica</span><select data-bind="etech" data-wd="${wd}" data-i="${i}">${Object.entries(TECHNIQUES).map(([k, t]) => `<option value="${k}" ${k === (ex.tech || '') ? 'selected' : ''}>${t.n}</option>`).join('')}</select></label>
            </div>
          </div>`).join('')}
          <div class="row-actions">
            <button class="link" data-action="pickFor" data-mode="planAdd" data-wd="${wd}">+ Exercício da biblioteca</button>
            <button class="link muted" data-action="addFreePlanEx" data-wd="${wd}">+ Nome livre</button>
          </div>
          <div class="row-actions">
            ${others.length ? `<select class="copy-select" data-bind="copyFrom" data-wd="${wd}"><option value="">Copiar de…</option>${others.map((o) => `<option value="${o}">${DAY_LONG[o]}</option>`).join('')}</select>` : ''}
            ${n ? `<button class="link muted" data-action="clearDay" data-wd="${wd}">Virar descanso</button>` : ''}
          </div>
        </div>` : ''}
      </div>`;
    }).join('');
    return `${sheetHead(pe.isNew ? 'Novo treino' : 'Editar treino', { left: 'Cancelar', right: '<button class="btn primary sm" data-action="savePlan">Salvar</button>' })}
    <div class="sheet-body" id="sheetBody">
      <label class="field"><span>Nome do treino</span><input data-bind="pname" placeholder="Ex: Abóbora" value="${esc(pe.name)}"></label>
      <label class="field"><span>Comentários</span><textarea data-bind="pdesc" placeholder="Objetivo, observações… (opcional)">${esc(pe.desc || '')}</textarea></label>
      <label class="field"><span>Duração do programa (semanas, opcional)</span><input data-bind="pweeks" inputmode="numeric" placeholder="ex: 8" value="${esc(pe.weeks || '')}"></label>
      <p class="small muted hint">Toque em um dia para montar os exercícios. Dias sem exercícios são descanso.</p>
      ${days}
      ${!pe.isNew ? '<button class="btn ghost full danger" data-action="deletePlan">Excluir este treino</button>' : ''}
    </div>`;
  },
  input(el, data, type) {
    const pe = data.plan, b = el.dataset.bind, wd = el.dataset.wd, i = +el.dataset.i;
    if (b === 'pname') { pe.name = el.value; return; }
    if (b === 'pdesc') { pe.desc = el.value; return; }
    if (b === 'pweeks') { pe.weeks = parseInt(el.value, 10) || null; return; }
    if (b === 'copyFrom') {
      if (type !== 'change' || !el.value) return;
      const src = pe.days[el.value], day = ensureDay(pe, wd);
      day.title = day.title || src.title;
      day.exercises = src.exercises.map((e) => ({ ...e, id: uid() }));
      refreshSheet(); return;
    }
    const day = ensureDay(pe, wd);
    if (b === 'dtitle') { day.title = el.value; return; }
    const ex = day.exercises[i];
    if (!ex) return;
    if (b === 'ename') { ex.name = el.value; const f = findEx(el.value); ex.exId = f && norm(f.n) === norm(el.value) ? f.id : null; }
    else if (b === 'esets') ex.sets = parseInt(el.value, 10) || '';
    else if (b === 'ereps') ex.reps = el.value;
    else if (b === 'erest') ex.rest = +el.value;
    else if (b === 'etech') ex.tech = el.value;
  },
};
function ensureDay(pe, wd) { if (!pe.days[wd]) pe.days[wd] = { title: '', exercises: [] }; return pe.days[wd]; }
function openPlanEditor(plan) {
  const pe = plan ? clone(plan) : { id: uid(), name: '', desc: '', weeks: null, startDate: todayKey(), days: {}, isNew: true };
  pushSheet('plan', { plan: pe, open: null });
}
function savePlan(data) {
  const pe = data.plan;
  const plan = { id: pe.id, name: (pe.name || '').trim() || 'Meu treino', desc: (pe.desc || '').trim(), weeks: pe.weeks || null, startDate: pe.startDate || todayKey(), source: pe.source, days: {} };
  Object.keys(pe.days).forEach((wd) => {
    const day = pe.days[wd];
    const exercises = day.exercises.filter((e) => (e.name || '').trim()).map((e) => ({
      id: e.id || uid(), exId: e.exId || null, name: e.name.trim(), sets: parseInt(e.sets, 10) || 3,
      reps: String(e.reps || '').trim() || '10', rest: e.rest ?? 90, tech: e.tech || '',
    }));
    if (exercises.length) plan.days[wd] = { title: (day.title || '').trim(), exercises };
  });
  const idx = S.plans.findIndex((p) => p.id === plan.id);
  if (idx >= 0) S.plans[idx] = plan; else S.plans.push(plan);
  if (!activePlan()) S.activePlanId = plan.id;
  save();
  popSheet();
  if (UI.stack.length) refreshSheet(); else render();
  toast('Treino salvo');
}

Object.assign(actions, {
  activatePlan(el) {
    S.activePlanId = el.dataset.id; save();
    if (topSheet()) refreshSheet();
    render(); toast('Treino ativo atualizado');
  },
  newPlan() { openPlanEditor(null); },
  editPlan(el) { openPlanEditor(S.plans.find((p) => p.id === el.dataset.id)); },
  viewPlan(el) { pushSheet('planView', { id: el.dataset.id }); },
  dupPlan(el) {
    const p = clone(S.plans.find((x) => x.id === el.dataset.id));
    p.id = uid(); p.name = `${p.name} (cópia)`; p.startDate = todayKey();
    S.plans.push(p); save(); render(); toast('Treino duplicado');
  },
  savePlan() { savePlan(topSheet().data); },
  deletePlan() {
    const pe = topSheet().data.plan;
    if (!confirm(`Excluir o treino “${pe.name}”? O histórico já registrado continua salvo.`)) return;
    S.plans = S.plans.filter((p) => p.id !== pe.id);
    if (S.activePlanId === pe.id) S.activePlanId = S.plans[0] ? S.plans[0].id : null;
    save(); closeAllSheets();
  },
  toggleDay(el) { const d = topSheet().data; d.open = String(d.open) === el.dataset.wd ? null : el.dataset.wd; refreshSheet(); },
  addFreePlanEx(el) { ensureDay(topSheet().data.plan, el.dataset.wd).exercises.push({ id: uid(), name: '', exId: null, sets: 3, reps: '10', rest: 90, tech: '' }); refreshSheet(); },
  removePlanEx(el) { topSheet().data.plan.days[el.dataset.wd].exercises.splice(+el.dataset.i, 1); refreshSheet(); },
  movePlanEx(el) { const a = topSheet().data.plan.days[el.dataset.wd].exercises, i = +el.dataset.i; [a[i - 1], a[i]] = [a[i], a[i - 1]]; refreshSheet(); },
  clearDay(el) { topSheet().data.plan.days[el.dataset.wd] = { title: '', exercises: [] }; refreshSheet(); },
  trainDay(el) {
    const p = S.plans.find((x) => x.id === el.dataset.id), wd = +el.dataset.wd, d = p.days[wd];
    UI.stack = []; drawSheet();
    startDraft(newDraft({ date: todayKey(), planId: p.id, wd, title: d.title || DAY_LONG[wd], exercises: d.exercises.map((e) => draftExercise(e.name, e.exId, e.sets, e.reps, e.rest, e.tech, todayKey())) }));
  },
  openProgram(el) { pushSheet('program', { id: el.dataset.id }); },
  progMore() { topSheet().data.more = true; refreshSheet(); },
  useProgram(el) {
    const p = PROGRAMS.find((x) => x.id === el.dataset.id);
    const plan = planFromProgram(p);
    S.plans.push(plan); S.activePlanId = plan.id; save();
    UI.plansSeg = 'mine'; UI.tab = 'plans';
    closeAllSheets();
    toast(`“${p.name}” agora é seu treino ativo`);
  },
  exploreGoal(el) { UI.exploreFilter = { goal: el.dataset.g }; render(); },
  clearExplore() { UI.exploreFilter = {}; render(); },
  exploreMuscle(el) { UI.tab = 'exercises'; UI.exMuscle = el.dataset.m; UI.exSearch = ''; closeAllSheets(); window.scrollTo(0, 0); },
});
