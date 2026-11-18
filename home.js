'use strict';
/* =========================================================
   Forja — aba Início
   ========================================================= */

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? 'Boa noite' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

PAGES.home = function () {
  const name = (S.profile.name || '').split(' ')[0];
  const initial = (name || 'F')[0].toUpperCase();
  let html = `<div class="hello">
    <div><div class="muted small">${greeting()}${name ? ',' : ''}</div><h1>${name ? esc(name) : 'Bem-vindo à Forja'}</h1></div>
    <button class="avatar" data-action="openProfile" aria-label="Perfil">${initial}</button>
  </div>`;

  if (S.draft && !S.draft.logId) {
    html += `<div class="banner">
      <div><div class="t">Treino em andamento</div><div class="small muted">${esc(S.draft.title)} · ${fmtDateShort(S.draft.date)}</div></div>
      <button class="btn primary sm" data-action="openDraft">Continuar</button>
    </div>`;
  }
  html += renderCalendar();
  html += activePlanCard();
  html += dietHomeCard();
  html += deloadBanner();
  html += renderDayPanel();
  html += `<div class="section-title">Atalhos</div>
  <div class="quick">
    <button class="qcard" data-action="openInstant"><span class="qi">⚡</span><b>Treino Imediato</b><small>Gerado na hora</small></button>
    <button class="qcard" data-action="goExplore"><span class="qi">🧭</span><b>Explorar</b><small>${PROGRAMS.length} programas prontos</small></button>
    <button class="qcard" data-action="openTool" data-tool="plates"><span class="qi">🏋️</span><b>Anilhas</b><small>Quanto pôr na barra</small></button>
    <button class="qcard" data-action="openTool" data-tool="orm"><span class="qi">📈</span><b>Calculadora 1RM</b><small>Carga máxima e %</small></button>
    <button class="qcard" data-action="openBodyEntry" data-kind="weight"><span class="qi">⚖️</span><b>Registrar peso</b><small>${currentWeight() ? fmtNum(currentWeight(), 1) + ' kg atual' : 'Acompanhe seu corpo'}</small></button>
    <button class="qcard" data-action="openHiit"><span class="qi">⏱️</span><b>HIIT / Intervalos</b><small>Tabata, EMOM e mais</small></button>
    <button class="qcard" data-action="aiPhoto"><span class="qi">📸</span><b>Foto do prato</b><small>Calorias com IA</small></button>
    <button class="qcard" data-action="openAchievements"><span class="qi">🏆</span><b>Conquistas</b><small>${Object.keys(S.achievements).length}/${ACHIEVEMENTS.length} desbloqueadas</small></button>
  </div>`;
  return html;
};

/* ---------------- Calendário ---------------- */
function calBounds() { const y = new Date().getFullYear(); return { min: y * 12, max: (y + 1) * 12 + 11 }; }
function calendarGrid(m, opts) {
  const y = m.getFullYear(), mo = m.getMonth();
  const startPad = new Date(y, mo, 1).getDay();
  const days = new Date(y, mo + 1, 0).getDate();
  const logDates = new Set(S.logs.map((l) => l.date));
  const tk = todayKey();
  const plan = activePlan();
  let cells = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d) => `<div class="cal-wd">${d}</div>`).join('');
  for (let i = 0; i < startPad; i++) cells += '<div class="cal-cell empty"></div>';
  for (let d = 1; d <= days; d++) {
    const dt = new Date(y, mo, d), key = toKey(dt);
    const cls = [key === tk ? 'today' : '', key === opts.selected ? 'selected' : '', key > tk && planDay(plan, dt.getDay()) ? 'planned' : ''].join(' ');
    cells += `<button class="cal-cell ${cls}" data-action="${opts.action}" data-key="${key}"><span>${d}</span>${logDates.has(key) ? '<i class="dot"></i>' : ''}</button>`;
  }
  return `<div class="cal-grid">${cells}</div>`;
}
function renderCalendar() {
  const m = UI.month, y = m.getFullYear(), mo = m.getMonth();
  const idx = y * 12 + mo, b = calBounds();
  const now = new Date();
  const showToday = UI.selected !== todayKey() || idx !== now.getFullYear() * 12 + now.getMonth();
  return `<section class="card">
    <div class="cal-head">
      <div class="cal-nav">
        <button class="arrow" data-action="month" data-d="-1" ${idx <= b.min ? 'disabled' : ''} aria-label="Mês anterior">‹</button>
        <h2>${MONTHS[mo]} ${y}</h2>
        <button class="arrow" data-action="month" data-d="1" ${idx >= b.max ? 'disabled' : ''} aria-label="Próximo mês">›</button>
      </div>
      ${showToday ? '<button class="today-pill" data-action="goToday">Hoje</button>' : ''}
    </div>
    ${calendarGrid(m, { selected: UI.selected, action: 'pickDay' })}
    <div class="cal-legend"><span><i class="dot"></i>Treinou</span><span><i class="und"></i>Treino planejado</span></div>
  </section>`;
}

/* ---------------- Card do treino ativo ---------------- */
function planProgress(plan) {
  const days = planDays(plan).length;
  const ws = weekStatus();
  const doneWeek = ws.filter((w) => w.st === 'done' && w.planned).length + ws.filter((w) => w.st === 'done' && !w.planned).length;
  const weekPct = days ? Math.min(1, doneWeek / days) : 0;
  let prog = null;
  if (plan.weeks && plan.startDate) {
    const total = plan.weeks * days;
    const done = S.logs.filter((l) => l.date >= plan.startDate && l.planId === plan.id).length;
    const week = Math.min(plan.weeks, Math.floor(daysBetween(plan.startDate, todayKey()) / 7) + 1);
    prog = { pct: total ? Math.min(1, done / total) : 0, done, total, week };
  }
  return { days, doneWeek, weekPct, prog };
}
function activePlanCard() {
  const plan = activePlan();
  if (!plan) {
    return `<button class="plan-hero empty-plan" data-action="tab" data-tab="plans">
      <div><div class="eyebrow">Nenhum treino ativo</div><b>Escolha ou crie um treino</b></div><span class="chev">›</span></button>`;
  }
  const p = planProgress(plan);
  const ws = weekStatus();
  return `<div class="plan-hero">
    <div class="plan-hero-top">
      <div style="min-width:0">
        <div class="eyebrow">Treino ativo</div>
        <h2 class="ellipsis">${esc(plan.name)}</h2>
        <div class="small muted">${p.prog ? `Semana ${p.prog.week} de ${plan.weeks} · ${p.prog.done}/${p.prog.total} treinos` : `${p.days} dias por semana`}</div>
      </div>
      ${ring(p.prog ? p.prog.pct : p.weekPct, p.prog ? `${Math.round(p.prog.pct * 100)}%` : `${p.doneWeek}/${p.days}`, 62)}
    </div>
    <div class="week-strip">${ws.map((w) => `<div class="ws ${w.st}"><span>${DAY_SHORT[w.wd][0]}</span><i>${w.st === 'done' ? '✓' : w.st === 'missed' ? '×' : w.date.getDate()}</i></div>`).join('')}</div>
    <div class="row-actions"><button class="link" data-action="viewPlan" data-id="${plan.id}">Ver treino</button><button class="link muted" data-action="tab" data-tab="plans">Trocar</button></div>
  </div>`;
}

/* ---------------- Painel do dia ---------------- */
function renderDayPanel() {
  const key = UI.selected, d = fromKey(key), tk = todayKey();
  const isToday = key === tk, isFuture = key > tk;
  const plan = activePlan();
  const logs = S.logs.filter((l) => l.date === key).sort((a, b) => (a.savedAt || 0) - (b.savedAt || 0));
  let html = `<div class="section-head">
    <div class="eyebrow">${isToday ? 'Hoje' : isFuture ? 'Planejado' : 'Dia selecionado'}</div>
    <h2>${DAY_LONG[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()].toLowerCase()}</h2>
  </div>`;
  logs.forEach((l) => { html += doneCard(l); });
  if (!logs.length) {
    if (!plan) html += `<div class="card">${emptyState('Nenhum treino ativo', 'Crie um treino ou escolha um pronto na aba Treinos.')}</div>`;
    else {
      const pd = planDay(plan, d.getDay());
      if (pd) html += plannedCard(pd, key, d.getDay(), !isFuture);
      else {
        html += `<div class="card rest-card"><div class="rest-ic">😴</div><div><h3>Dia de descanso</h3><div class="small muted">O descanso também faz parte do treino: é nele que o músculo cresce.</div></div></div>`;
        const nx = nextWorkout(key);
        if (nx) {
          html += `<div class="eyebrow mt">Próximo treino · ${DAY_LONG[nx.date.getDay()]} ${fmtDateShort(nx.key)}</div>`;
          html += plannedCard(nx.day, nx.key, nx.date.getDay(), false);
        }
      }
    }
  }
  if (!isFuture) html += `<button class="btn ghost full" data-action="startFree" data-key="${key}">${logs.length ? '+ Registrar outro treino' : '+ Registrar treino livre'}</button>`;
  return html;
}
function nextWorkout(afterKey) {
  const plan = activePlan();
  if (!plan) return null;
  for (let i = 1; i <= 7; i++) {
    const k = addDays(afterKey, i), d = fromKey(k), day = planDay(plan, d.getDay());
    if (day) return { key: k, date: d, day };
  }
  return null;
}
function plannedCard(pd, key, wd, canStart) {
  const techs = new Set();
  let estMin = 0;
  const items = pd.exercises.map((ex) => {
    const k = exKey(ex.name, ex.exId);
    const last = lastPerf(k, key);
    const e = findEx(ex.name, ex.exId);
    if (ex.tech) techs.add(ex.tech);
    estMin += (+ex.sets || 3) * (0.8 + (ex.rest || 60) / 60);
    return `<li class="ex-row" data-action="openExercise" data-name="${esc(ex.name)}" data-id="${ex.exId || ''}">
      ${exThumb(ex.name, ex.exId)}
      <div class="ex-info">
        <div class="ex-name">${esc(ex.name)} ${techBadge(ex.tech)}</div>
        <div class="ex-meta">${ex.sets} × ${esc(ex.reps)} · descanso ${fmtRest(ex.rest)}</div>
        ${last ? `<div class="last">Última vez (${fmtDateShort(last.date)}) · <b>${plural(last.sets.length, 'série', 'séries')}</b></div><div class="chips">${chips(last.sets)}</div>`
        : `<div class="last">${e ? muscleNames(e.m) : 'Ainda sem registro'}</div>`}
      </div>
    </li>`;
  }).join('');
  const muscles = {};
  pd.exercises.forEach((ex) => { const e = findEx(ex.name, ex.exId); if (e) { e.s.forEach((m) => { muscles[m] = muscles[m] || 'var(--accent-mid)'; }); e.m.forEach((m) => { muscles[m] = 'var(--accent)'; }); } });
  const hasDraft = S.draft && !S.draft.logId && S.draft.date === key;
  return `<div class="card">
    <div class="card-head"><div><h3>${esc(pd.title || DAY_LONG[wd])}</h3><div class="small muted">${pd.exercises.length} exercícios · ~${Math.round(estMin)} min</div></div>
    <div class="mini-body">${bodySVG('front', muscles)}${bodySVG('back', muscles)}</div></div>
    <ul class="ex-list">${items}</ul>
    ${techs.size ? `<div class="tech-legend">${[...techs].map((t) => `${techBadge(t)} ${TECHNIQUES[t].n}`).join(' · ')}</div>` : ''}
    ${canStart ? `<button class="btn primary full" data-action="${hasDraft ? 'openDraft' : 'startPlanned'}" data-key="${key}" data-wd="${wd}">${hasDraft ? 'Continuar treino' : 'Começar treino'}</button>` : ''}
  </div>`;
}
function doneCard(l) {
  const st = logStats(l);
  return `<div class="card done-card" data-action="openLog" data-id="${l.id}">
    <div class="card-head"><div><div class="done-tag">✓ Treino concluído</div><h3>${esc(l.title)}</h3></div><span class="chev">›</span></div>
    <div class="stat-row">
      <div><b>${fmtMin(st.dur)}</b><span>Duração</span></div>
      <div><b>${st.sets}</b><span>Séries</span></div>
      <div><b>${fmtKg(st.vol)}</b><span>Volume</span></div>
      <div><b>${fmtInt(st.kcal)}</b><span>kcal</span></div>
    </div>
  </div>`;
}

Object.assign(actions, {
  month(el) {
    const d = +el.dataset.d, b = calBounds();
    const idx = UI.month.getFullYear() * 12 + UI.month.getMonth() + d;
    if (idx < b.min || idx > b.max) return;
    UI.month = new Date(Math.floor(idx / 12), idx % 12, 1);
    render();
  },
  goToday() { const n = new Date(); UI.selected = todayKey(); UI.month = new Date(n.getFullYear(), n.getMonth(), 1); render(); },
  pickDay(el) { UI.selected = el.dataset.key; render(); },
  goExplore() { UI.tab = 'plans'; UI.plansSeg = 'explore'; closeAllSheets(); window.scrollTo(0, 0); },
});
