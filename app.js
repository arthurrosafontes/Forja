'use strict';

/* =========================================================
   Configuração
   ========================================================= */
const APP_NAME = 'Forja';
const STORE_KEY = 'treino-app-v1';
const DAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAY_LONG = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Seg → Dom (editor de treinos)
const REST_OPTIONS = [0, 30, 45, 60, 75, 90, 120, 150, 180, 240, 300];

/* =========================================================
   Utilidades
   ========================================================= */
const $ = (s) => document.querySelector(s);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clone = (o) => JSON.parse(JSON.stringify(o));
const pad = (n) => String(n).padStart(2, '0');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const todayKey = () => toKey(new Date());
const norm = (s) => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const fmtNum = (n) => (Math.round(n * 100) / 100).toLocaleString('pt-BR');
const fmtDateShort = (k) => { const d = fromKey(k); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; };
const fmtRest = (s) => (!s ? 'sem descanso' : s >= 60 ? `${Math.floor(s / 60)}:${pad(s % 60)} min` : `${s}s`);
const parseNum = (v) => {
  if (v === '' || v == null) return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return isNaN(n) ? null : n;
};

/* =========================================================
   Dados (salvos no próprio aparelho)
   ========================================================= */
let S;
const UI = {
  tab: 'home',
  month: null,        // primeiro dia do mês exibido no calendário
  selected: null,     // dia selecionado (YYYY-MM-DD)
  progressEx: null,   // exercício escolhido em Progresso
  metric: 'max',      // 'max' | 'vol'
  tipIndex: null,     // ponto selecionado no gráfico
  openLog: null,      // registro aberto no Histórico
  planEdit: null,     // cópia do treino em edição
  planOpenDay: null,
  sheetMode: null,    // 'workout' | 'plan'
};

function seed() {
  const ex = (name, sets, reps, rest) => ({ id: uid(), name, sets, reps, rest });
  const peito = () => [ex('Supino reto', 4, '10', 90), ex('Supino inclinado com halteres', 3, '12', 90), ex('Crucifixo na máquina', 3, '12', 60), ex('Tríceps corda', 3, '12', 60)];
  const id = uid();
  return {
    version: 1,
    theme: 'dark',
    activePlanId: id,
    plans: [{
      id,
      name: 'Abóbora',
      days: {
        1: { title: 'Peito e Tríceps', exercises: peito() },
        2: { title: 'Costas e Bíceps', exercises: [ex('Puxada frontal', 4, '10', 90), ex('Remada baixa', 3, '12', 90), ex('Rosca direta', 3, '10', 60), ex('Rosca martelo', 3, '12', 60)] },
        3: { title: 'Pernas', exercises: [ex('Agachamento livre', 4, '8', 120), ex('Leg press', 3, '12', 90), ex('Cadeira extensora', 3, '12', 60), ex('Mesa flexora', 3, '12', 60)] },
        4: { title: 'Ombros', exercises: [ex('Desenvolvimento com halteres', 4, '10', 90), ex('Elevação lateral', 3, '15', 60), ex('Crucifixo inverso', 3, '12', 60)] },
        5: { title: 'Peito e Tríceps', exercises: peito() },
      },
    }],
    logs: [],
    draft: null,
  };
}

function load() {
  try { S = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { S = null; }
  if (!S || !Array.isArray(S.plans) || !Array.isArray(S.logs)) { S = seed(); save(); }
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); }
  catch (e) { toast('Não foi possível salvar (armazenamento cheio?)'); }
}
let saveTimer = null;
function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 300); }

const activePlan = () => S.plans.find((p) => p.id === S.activePlanId) || null;
const planDay = (plan, wd) => {
  const d = plan && plan.days && plan.days[wd];
  return d && d.exercises && d.exercises.length ? d : null;
};

/* Última vez que um exercício foi feito (até a data informada) */
function lastPerf(name, upToKey, excludeLogId) {
  const n = norm(name);
  if (!n) return null;
  let best = null;
  for (const log of S.logs) {
    if (log.id === excludeLogId) continue;
    if (upToKey && log.date > upToKey) continue;
    const ex = log.exercises.find((e) => norm(e.name) === n);
    if (!ex || !ex.sets.length) continue;
    if (!best || log.date > best.date || (log.date === best.date && (log.savedAt || 0) > (best.savedAt || 0))) {
      best = { date: log.date, savedAt: log.savedAt, sets: ex.sets };
    }
  }
  return best;
}

/* Próximo dia com treino no plano ativo */
function nextWorkout(afterKey) {
  const plan = activePlan();
  if (!plan) return null;
  const d = fromKey(afterKey);
  for (let i = 1; i <= 7; i++) {
    const nd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
    const day = planDay(plan, nd.getDay());
    if (day) return { key: toKey(nd), date: nd, day };
  }
  return null;
}

const setChips = (sets) => sets.map((s) =>
  `<span class="chip">${s.w != null ? fmtNum(s.w) + ' kg' : '—'} × ${s.r != null ? fmtNum(s.r) : '—'}</span>`).join('');

function logStats(l) {
  let sets = 0, vol = 0;
  l.exercises.forEach((e) => e.sets.forEach((s) => { sets++; vol += (s.w || 0) * (s.r || 0); }));
  return { sets, vol, ex: l.exercises.length };
}

/* =========================================================
   Ofensiva (halter com chama)
   ========================================================= */
const TIERS = [
  { min: 0, name: 'Apagada', c1: '#555555', c2: '#9a9a9a' },
  { min: 1, name: 'Laranja', c1: '#ff5a00', c2: '#ffb347' },
  { min: 10, name: 'Vermelha', c1: '#e01010', c2: '#ff7a4d' },
  { min: 20, name: 'Rosa', c1: '#e0157a', c2: '#ff9ad5' },
  { min: 30, name: 'Roxa', c1: '#7a2cff', c2: '#c9a2ff' },
  { min: 50, name: 'Azul', c1: '#0a6cff', c2: '#8fe0ff' },
  { min: 100, name: 'Dourada', c1: '#e8a200', c2: '#fff0a0' },
];
const tierFor = (n) => [...TIERS].reverse().find((t) => n >= t.min);
const nextTier = (n) => TIERS.find((t) => t.min > n) || null;

const FLAME_PATH = 'M32 3C36.5 11 45 16 45 28C45 36 39.2 42 32 42C24.8 42 19 36 19 28C19 21.5 22.5 16.5 26 12.5C26.4 18 28.6 21 31 21.8C29.6 14.5 30.2 8.6 32 3Z';
const FLAME_INNER = 'M32 23.5C34.8 27.6 38 29.6 38 34C38 37.4 35.4 40 32 40C28.6 40 26 37.4 26 34C26 30.4 29 28.2 32 23.5Z';
const DUMBBELL = '<rect x="17" y="46" width="30" height="5" rx="1.5"/><rect x="11" y="39" width="7" height="19" rx="2.2"/><rect x="4.5" y="42.5" width="6" height="12" rx="2"/><rect x="46" y="39" width="7" height="19" rx="2.2"/><rect x="53.5" y="42.5" width="6" height="12" rx="2"/>';

function streakIcon(tier, size, animate) {
  const gid = 'fl' + uid();
  return `<svg class="streak-ico ${animate ? 'alive' : ''}" viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">
    <defs><linearGradient id="${gid}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${tier.c1}"/><stop offset="1" stop-color="${tier.c2}"/></linearGradient></defs>
    <g class="flame" transform="translate(0 2.5)"><path fill="url(#${gid})" d="${FLAME_PATH}"/><path fill="${tier.min ? '#fff3d6' : '#cfcfcf'}" opacity=".85" d="${FLAME_INNER}"/></g>
    <g class="db">${DUMBBELL}</g>
  </svg>`;
}

/* Regra: conta treinos seguidos. Dias de descanso do treino ativo não quebram;
   pular um dia de treino programado zera. Sem treino ativo: zera após 3 dias sem treinar.
   Hoje ainda não conta como falta (dá tempo de treinar). */
function streakInfo() {
  if (!S.logs.length) return { current: 0, best: 0 };
  const done = new Set(S.logs.map((l) => l.date));
  const plan = activePlan();
  const usePlan = plan && WEEK_ORDER.some((wd) => planDay(plan, wd));
  const tk = todayKey();
  const first = S.logs.reduce((m, l) => (l.date < m ? l.date : m), tk);
  const d = fromKey(first);
  let cur = 0, best = 0, gap = 0;
  for (let key = toKey(d); key <= tk; d.setDate(d.getDate() + 1), key = toKey(d)) {
    if (done.has(key)) { cur++; gap = 0; }
    else if (key !== tk) {
      if (usePlan) { if (planDay(plan, d.getDay())) cur = 0; }
      else if (++gap >= 3) cur = 0;
    }
    best = Math.max(best, cur);
  }
  return { current: cur, best };
}

function weekStatus() {
  const plan = activePlan();
  const done = new Set(S.logs.map((l) => l.date));
  const tk = todayKey(), now = new Date();
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  return WEEK_ORDER.map((wd, i) => {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const key = toKey(d), planned = !!planDay(plan, wd);
    let st = 'rest';
    if (done.has(key)) st = 'done';
    else if (key === tk) st = planned ? 'today' : 'rest';
    else if (key > tk) st = planned ? 'planned' : 'rest';
    else st = planned ? 'missed' : 'rest';
    return { wd, key, st };
  });
}

function renderStreakPill() {
  const { current } = streakInfo();
  const t = tierFor(current);
  $('#streakBtn').innerHTML = `${streakIcon(t, 26, false)}<b style="color:${current ? t.c1 : 'var(--muted)'}">${current}</b>`;
}

function streakHTML() {
  const { current, best } = streakInfo();
  const t = tierFor(current), nx = nextTier(current);
  const prevMin = t.min;
  const pct = nx ? Math.round(((current - prevMin) / (nx.min - prevMin)) * 100) : 100;
  const week = weekStatus().map((w) => {
    const inner = w.st === 'done' ? streakIcon(t.min ? t : TIERS[1], 26, false)
      : w.st === 'missed' ? '<span class="wk-x">×</span>'
      : w.st === 'rest' ? '<span class="wk-rest">—</span>' : '';
    return `<div class="wk ${w.st}"><span class="wk-d">${DAY_SHORT[w.wd][0]}</span><div class="wk-c">${inner}</div></div>`;
  }).join('');
  const tiers = TIERS.slice(1).map((x, i) => {
    const nextMin = TIERS[i + 2] ? TIERS[i + 2].min - 1 : null;
    return `<li class="${x === t ? 'on' : ''}">${streakIcon(x, 30, false)}<span class="tn">Chama ${x.name}</span><span class="muted small">${nextMin ? `${x.min}–${nextMin}` : `${x.min}+`} treinos</span></li>`;
  }).join('');
  return `<div class="sheet-head">
      <span style="width:52px"></span>
      <div class="sheet-title"><b>Ofensiva</b></div>
      <button class="link" data-action="closeSheet">Fechar</button>
    </div>
    <div class="sheet-body" id="sheetBody">
      <div class="streak-hero" style="--c1:${t.c1};--c2:${t.c2}">
        ${streakIcon(t, 132, current > 0)}
        <div class="streak-num" style="color:${current ? t.c1 : 'var(--muted)'}">${current}</div>
        <div class="muted">${current === 1 ? 'treino seguido' : 'treinos seguidos'}</div>
        <span class="badge" style="margin-top:10px;color:${t.c1};background:${t.c1}22">Chama ${t.name}</span>
      </div>
      <div class="card">
        ${nx ? `<div class="small"><b>Faltam ${nx.min - current}</b> ${nx.min - current === 1 ? 'treino' : 'treinos'} para a chama <b style="color:${nx.c1}">${nx.name}</b></div>
          <div class="streak-bar"><i style="width:${pct}%;background:linear-gradient(90deg,${t.c1},${nx.c1})"></i></div>`
        : '<div class="small"><b>Chama máxima!</b> Continue assim.</div>'}
        <div class="stats" style="grid-template-columns:1fr 1fr">
          <div class="stat"><b>${current}</b><span>Atual</span></div>
          <div class="stat"><b>${best}</b><span>Recorde</span></div>
        </div>
      </div>
      <div class="card"><h3>Esta semana</h3><div class="week-row">${week}</div></div>
      <div class="card"><h3>Cores da chama</h3><ul class="tier-list">${tiers}</ul></div>
      <p class="small muted" style="margin:4px 4px 0">Cada treino registrado aumenta a ofensiva. Os dias de descanso do seu treino ativo não quebram a sequência — ela só zera se você pular um dia de treino programado.</p>
    </div>`;
}

/* =========================================================
   Renderização geral
   ========================================================= */
function render() {
  renderStreakPill();
  const v = $('#view');
  if (UI.tab === 'home') v.innerHTML = renderHome();
  else if (UI.tab === 'plans') v.innerHTML = renderPlans();
  else if (UI.tab === 'progress') v.innerHTML = renderProgress();
  else v.innerHTML = renderHistory();
  document.querySelectorAll('.tabbar button').forEach((b) => b.classList.toggle('on', b.dataset.tab === UI.tab));
}

function applyTheme() {
  document.documentElement.dataset.theme = S.theme;
  document.querySelector('meta[name="theme-color"]').setAttribute('content', S.theme === 'dark' ? '#0a0a0a' : '#ffffff');
}

/* ---------------- Início ---------------- */
function renderHome() {
  let html = '';
  if (S.draft && !S.draft.logId) {
    html += `<div class="banner">
      <div><div class="t">Treino em andamento</div><div class="small muted">${esc(S.draft.title)} · ${fmtDateShort(S.draft.date)}</div></div>
      <button class="btn primary sm" data-action="openDraft">Continuar</button>
    </div>`;
  }
  html += renderCalendar();
  const plan = activePlan();
  html += `<button class="plan-switch" data-action="tab" data-tab="plans">
    <span>Treino ativo: <b>${plan ? esc(plan.name) : 'nenhum'}</b></span><span class="muted">Trocar ›</span>
  </button>`;
  html += renderDayPanel();
  return html;
}

function calBounds() {
  const y = new Date().getFullYear();
  return { min: y * 12, max: (y + 1) * 12 + 11 }; // jan deste ano → dez do ano que vem
}

function renderCalendar() {
  const m = UI.month, y = m.getFullYear(), mo = m.getMonth();
  const startPad = new Date(y, mo, 1).getDay();
  const days = new Date(y, mo + 1, 0).getDate();
  const logDates = new Set(S.logs.map((l) => l.date));
  const tk = todayKey();
  const idx = y * 12 + mo, b = calBounds();
  const plan = activePlan();

  let cells = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d) => `<div class="cal-wd">${d}</div>`).join('');
  for (let i = 0; i < startPad; i++) cells += '<div class="cal-cell empty"></div>';
  for (let d = 1; d <= days; d++) {
    const key = toKey(new Date(y, mo, d));
    const cls = [
      key === tk ? 'today' : '',
      key === UI.selected ? 'selected' : '',
      key > tk && planDay(plan, new Date(y, mo, d).getDay()) ? 'planned' : '',
    ].join(' ');
    cells += `<button class="cal-cell ${cls}" data-action="pickDay" data-key="${key}"><span>${d}</span>${logDates.has(key) ? '<i class="dot"></i>' : ''}</button>`;
  }
  const showToday = UI.selected !== tk || idx !== new Date().getFullYear() * 12 + new Date().getMonth();
  return `<section class="card">
    <div class="cal-head">
      <div class="cal-nav">
        <button class="arrow" data-action="month" data-d="-1" ${idx <= b.min ? 'disabled' : ''} aria-label="Mês anterior">‹</button>
        <h2>${MONTHS[mo]} ${y}</h2>
        <button class="arrow" data-action="month" data-d="1" ${idx >= b.max ? 'disabled' : ''} aria-label="Próximo mês">›</button>
      </div>
      ${showToday ? '<button class="today-pill" data-action="goToday">Hoje</button>' : ''}
    </div>
    <div class="cal-grid">${cells}</div>
  </section>`;
}

function renderDayPanel() {
  const key = UI.selected, d = fromKey(key), tk = todayKey();
  const isToday = key === tk, isFuture = key > tk;
  const plan = activePlan();
  const logs = S.logs.filter((l) => l.date === key).sort((a, b) => (a.savedAt || 0) - (b.savedAt || 0));

  let html = `<div class="section-head">
    <div class="eyebrow">${isToday ? 'Hoje' : isFuture ? 'Planejado' : 'Dia selecionado'}</div>
    <h2>${DAY_LONG[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()].toLowerCase()}</h2>
  </div>`;

  logs.forEach((l) => { html += logCard(l, true); });

  if (!logs.length) {
    if (!plan) {
      html += `<div class="card empty"><b>Nenhum treino ativo</b>Crie ou escolha um treino na aba Treinos.</div>`;
    } else {
      const pd = planDay(plan, d.getDay());
      if (pd) {
        html += plannedCard(pd, key, d.getDay(), !isFuture);
      } else {
        html += `<div class="card"><h3>Dia de descanso</h3><div class="small muted" style="margin-top:4px">Nada programado no treino ${esc(plan.name)}.</div></div>`;
        const nx = nextWorkout(key);
        if (nx) {
          html += `<div class="eyebrow mt">Próximo treino · ${DAY_LONG[nx.date.getDay()]} ${fmtDateShort(nx.key)}</div>`;
          html += plannedCard(nx.day, nx.key, nx.date.getDay(), false);
        }
      }
    }
  }
  if (!isFuture) {
    html += `<button class="btn ghost full" data-action="startFree">${logs.length ? '+ Registrar outro treino' : 'Registrar treino livre'}</button>`;
  }
  return html;
}

function plannedCard(pd, key, wd, canStart) {
  const items = pd.exercises.map((ex) => {
    const last = lastPerf(ex.name, key);
    return `<li>
      <div class="ex-name">${esc(ex.name)}</div>
      <div class="ex-meta">${ex.sets} × ${esc(ex.reps)} · descanso ${fmtRest(ex.rest)}</div>
      ${last
        ? `<div class="last">Última vez (${fmtDateShort(last.date)}) · <b>${last.sets.length} séries</b></div><div class="chips">${setChips(last.sets)}</div>`
        : '<div class="last">Ainda sem registro</div>'}
    </li>`;
  }).join('');
  const hasDraft = S.draft && !S.draft.logId && S.draft.date === key;
  return `<div class="card">
    <div class="card-head"><h3>${esc(pd.title || DAY_LONG[wd])}</h3><span class="badge">${pd.exercises.length} exercícios</span></div>
    <ul class="ex-list">${items}</ul>
    ${canStart ? `<button class="btn primary full" data-action="${hasDraft ? 'openDraft' : 'startPlanned'}" data-key="${key}" data-wd="${wd}">${hasDraft ? 'Continuar treino' : 'Começar treino'}</button>` : ''}
  </div>`;
}

function logCard(l, expanded) {
  const st = logStats(l), d = fromKey(l.date);
  const head = `<div class="log-toggle" ${expanded ? '' : `data-action="toggleLog" data-id="${l.id}" role="button"`}>
      <div class="log-date"><b>${d.getDate()}</b><span>${DAY_SHORT[d.getDay()]}</span></div>
      <div class="log-info">
        <div class="t">${esc(l.title)}</div>
        <div class="small muted">${st.ex} ${st.ex === 1 ? "exercício" : "exercícios"} · ${st.sets} ${st.sets === 1 ? "série" : "séries"}${st.vol ? ` · ${fmtNum(st.vol)} kg` : ''}</div>
      </div>
      ${expanded ? '<span class="done-tag">✓ Feito</span>' : '<span class="chev">›</span>'}
    </div>`;
  const open = expanded || UI.openLog === l.id;
  const body = open ? `
    <ul class="ex-list mt">${l.exercises.map((e) => `<li><div class="ex-name">${esc(e.name)}</div><div class="chips">${setChips(e.sets)}</div></li>`).join('')}</ul>
    ${l.notes ? `<p class="notes">${esc(l.notes)}</p>` : ''}
    <div class="row-actions"><button class="link" data-action="editLog" data-id="${l.id}">Editar</button><button class="link danger" data-action="deleteLog" data-id="${l.id}">Excluir</button></div>` : '';
  return `<div class="card">${head}${body}</div>`;
}

/* ---------------- Treinos (planos) ---------------- */
function renderPlans() {
  const cards = S.plans.map((p) => {
    const active = p.id === S.activePlanId;
    const nDays = WEEK_ORDER.filter((wd) => planDay(p, wd)).length;
    const week = WEEK_ORDER.map((wd) => {
      const pd = planDay(p, wd);
      return `<li><span class="d">${DAY_SHORT[wd]}</span>${pd ? `<span>${esc(pd.title || 'Treino')} <span class="muted">· ${pd.exercises.length} ex.</span></span>` : '<span class="rest">Descanso</span>'}</li>`;
    }).join('');
    return `<div class="card plan-card ${active ? 'active' : ''}">
      <div class="card-head">
        <div><h3>${esc(p.name)}</h3><div class="small muted">${nDays} ${nDays === 1 ? 'dia' : 'dias'} de treino por semana</div></div>
        ${active ? '<span class="badge accent">Ativo</span>' : `<button class="btn sm" data-action="activatePlan" data-id="${p.id}">Usar</button>`}
      </div>
      <ul class="plan-week">${week}</ul>
      <div class="row-actions"><button class="link" data-action="editPlan" data-id="${p.id}">Editar</button><button class="link muted" data-action="dupPlan" data-id="${p.id}">Duplicar</button></div>
    </div>`;
  }).join('');
  return `<div class="page-head"><h1>Treinos</h1><button class="btn primary sm" data-action="newPlan">+ Novo</button></div>
    <p class="muted small" style="margin:0 4px 14px">O treino ativo é o que aparece na tela inicial.</p>
    ${cards || '<div class="card empty"><b>Nenhum treino ainda</b>Toque em “+ Novo” para criar.</div>'}`;
}

/* ---------------- Progresso ---------------- */
function exerciseIndex() {
  const map = new Map();
  [...S.logs].sort((a, b) => a.date.localeCompare(b.date)).forEach((l) => l.exercises.forEach((e) => {
    const k = norm(e.name);
    const cur = map.get(k) || { key: k, name: e.name, count: 0 };
    cur.name = e.name; cur.count++;
    map.set(k, cur);
  }));
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

function renderProgress() {
  const list = exerciseIndex();
  if (!list.length) {
    return `<div class="page-head"><h1>Progresso</h1></div>
      <div class="card empty"><b>Sem dados ainda</b>Registre seus treinos e a evolução de carga de cada exercício aparece aqui.</div>`;
  }
  if (!UI.progressEx || !list.find((x) => x.key === UI.progressEx)) {
    const last = [...S.logs].sort((a, b) => b.date.localeCompare(a.date))[0];
    UI.progressEx = norm(last.exercises[0]?.name) || list[0].key;
  }
  const sessions = [...S.logs]
    .filter((l) => l.exercises.some((e) => norm(e.name) === UI.progressEx))
    .sort((a, b) => a.date.localeCompare(b.date) || (a.savedAt || 0) - (b.savedAt || 0))
    .map((l) => {
      const e = l.exercises.find((x) => norm(x.name) === UI.progressEx);
      const max = Math.max(0, ...e.sets.map((s) => s.w || 0));
      const vol = e.sets.reduce((t, s) => t + (s.w || 0) * (s.r || 0), 0);
      return { date: l.date, max, vol, sets: e.sets };
    });

  const unit = 'kg';
  const pts = sessions.map((s) => ({ key: s.date, y: UI.metric === 'max' ? s.max : s.vol }));
  if (UI.tipIndex == null || UI.tipIndex >= pts.length) UI.tipIndex = pts.length - 1;
  const tip = pts[UI.tipIndex];

  const first = pts[0].y, lastV = pts[pts.length - 1].y, best = Math.max(...pts.map((p) => p.y));
  const diff = lastV - first;
  const options = list.map((x) => `<option value="${esc(x.key)}" ${x.key === UI.progressEx ? 'selected' : ''}>${esc(x.name)} (${x.count})</option>`).join('');

  return `<div class="page-head"><h1>Progresso</h1></div>
    <div class="card">
      <select data-bind="progressEx">${options}</select>
      <div class="seg">
        <button class="${UI.metric === 'max' ? 'on' : ''}" data-action="metric" data-m="max">Carga máxima</button>
        <button class="${UI.metric === 'vol' ? 'on' : ''}" data-action="metric" data-m="vol">Volume</button>
      </div>
      ${lineChart(pts)}
      <div class="tip">${fmtDateShort(tip.key)} · <b>${fmtNum(tip.y)} ${unit}</b></div>
      <div class="stats">
        <div class="stat"><b>${fmtNum(best)}</b><span>Recorde</span></div>
        <div class="stat"><b>${fmtNum(lastV)}</b><span>Último</span></div>
        <div class="stat"><b class="${diff > 0 ? 'up' : diff < 0 ? 'down' : ''}">${diff > 0 ? '+' : ''}${fmtNum(diff)}</b><span>Evolução</span></div>
        <div class="stat"><b>${pts.length}</b><span>Treinos</span></div>
      </div>
    </div>
    <div class="month-label">Sessões</div>
    <div class="card"><ul class="ex-list" style="margin:0">
      ${[...sessions].reverse().map((s) => `<li><div class="ex-meta" style="margin:0"><b style="color:var(--text)">${fmtDateShort(s.date)}</b> · máx ${fmtNum(s.max)} kg · vol ${fmtNum(s.vol)} kg</div><div class="chips">${setChips(s.sets)}</div></li>`).join('')}
    </ul></div>`;
}

function lineChart(points) {
  const W = 340, H = 190, pl = 38, pr = 14, pt = 12, pb = 26;
  let ys = points.map((p) => p.y);
  let min = Math.min(...ys), max = Math.max(...ys);
  if (min === max) { min = Math.max(0, min - 5); max = max + 5; }
  const padY = (max - min) * 0.12;
  min = Math.max(0, min - padY); max = max + padY;
  const n = points.length;
  const X = (i) => (n === 1 ? pl + (W - pl - pr) / 2 : pl + (i * (W - pl - pr)) / (n - 1));
  const Y = (v) => pt + (H - pt - pb) * (1 - (v - min) / (max - min));

  let grid = '';
  for (let i = 0; i <= 3; i++) {
    const v = min + ((max - min) * i) / 3, y = Y(v);
    grid += `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}"/><text class="axis" x="${pl - 6}" y="${y + 3}" text-anchor="end">${fmtNum(Math.round(v * 10) / 10)}</text>`;
  }
  const labelIdx = n <= 1 ? [0] : n === 2 ? [0, 1] : [0, Math.floor((n - 1) / 2), n - 1];
  const xl = [...new Set(labelIdx)].map((i) => `<text class="axis" x="${X(i)}" y="${H - 6}" text-anchor="middle">${fmtDateShort(points[i].key)}</text>`).join('');
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ');
  const area = `${line} L${X(n - 1).toFixed(1)},${H - pb} L${X(0).toFixed(1)},${H - pb} Z`;
  const dots = points.map((p, i) => `
    <circle class="pt ${i === UI.tipIndex ? 'on' : ''}" cx="${X(i)}" cy="${Y(p.y)}" r="${i === UI.tipIndex ? 5.5 : 4}"/>
    <circle class="hit" cx="${X(i)}" cy="${Y(p.y)}" r="16" data-action="chartTip" data-i="${i}"/>`).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">
    <defs><linearGradient id="fade" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ff7a1a" stop-opacity=".28"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></linearGradient></defs>
    ${grid}${n > 1 ? `<path d="${area}" fill="url(#fade)"/>` : ''}<path class="line" d="${line}"/>${xl}${dots}
  </svg>`;
}

/* ---------------- Histórico ---------------- */
function renderHistory() {
  const logs = [...S.logs].sort((a, b) => b.date.localeCompare(a.date) || (b.savedAt || 0) - (a.savedAt || 0));
  let html = '<div class="page-head"><h1>Histórico</h1></div>';
  if (!logs.length) {
    html += '<div class="card empty"><b>Nenhum treino registrado</b>Seus treinos salvos aparecem aqui.</div>';
  } else {
    let curMonth = '';
    logs.forEach((l) => {
      const d = fromKey(l.date), m = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
      if (m !== curMonth) { html += `<div class="month-label">${m}</div>`; curMonth = m; }
      html += logCard(l, false);
    });
  }
  html += `<div class="month-label">Backup</div>
    <div class="card">
      <div class="small muted">Seus dados ficam salvos só neste aparelho. Faça um backup de vez em quando — se apagar o app da tela inicial ou trocar de celular, é ele que traz tudo de volta.</div>
      <div class="row-actions">
        <button class="btn sm" data-action="exportData">Exportar backup</button>
        <button class="btn ghost sm" data-action="importData">Importar backup</button>
      </div>
    </div>`;
  return html;
}

/* =========================================================
   Folha: registrar / editar treino
   ========================================================= */
function draftExercise(name, nSets, reps, rest, key, excludeId) {
  const last = name ? lastPerf(name, key, excludeId) : null;
  const target = parseInt(reps, 10) || '';
  const n = Math.max(1, parseInt(nSets, 10) || (last ? last.sets.length : 3));
  const sets = [];
  for (let i = 0; i < n; i++) {
    const ls = last ? last.sets[Math.min(i, last.sets.length - 1)] : null;
    sets.push({ w: ls && ls.w != null ? ls.w : '', r: target || (ls && ls.r != null ? ls.r : ''), done: false });
  }
  return { key: uid(), name: name || '', reps: reps || '', rest: rest ?? 90, sets, custom: !name };
}

function startDraft(draft) {
  if (S.draft && !S.draft.logId) {
    if (!confirm(`Já existe um treino em andamento (${S.draft.title}, ${fmtDateShort(S.draft.date)}). Descartar e começar outro?`)) return;
  }
  S.draft = draft;
  save();
  openWorkout();
}

function startPlanned(key, wd) {
  const plan = activePlan();
  const pd = planDay(plan, wd);
  startDraft({
    id: uid(), logId: null, date: key, planId: plan ? plan.id : null, wd,
    title: pd ? pd.title || DAY_LONG[wd] : 'Treino',
    notes: '',
    exercises: pd ? pd.exercises.map((e) => draftExercise(e.name, e.sets, e.reps, e.rest, key)) : [],
  });
}

function startFree(key) {
  startDraft({ id: uid(), logId: null, date: key, planId: null, wd: fromKey(key).getDay(), title: 'Treino livre', notes: '', exercises: [draftExercise('', 3, '', 90, key)] });
}

function editLog(id) {
  const l = S.logs.find((x) => x.id === id);
  if (!l) return;
  if (S.draft && !S.draft.logId && !confirm('Há um treino em andamento. Ele será descartado para editar este registro. Continuar?')) return;
  S.draft = {
    id: uid(), logId: l.id, date: l.date, planId: l.planId, wd: l.wd, title: l.title, notes: l.notes || '',
    exercises: l.exercises.map((e) => ({ key: uid(), name: e.name, reps: e.reps || '', rest: e.rest ?? 90, custom: false, sets: e.sets.map((s) => ({ w: s.w ?? '', r: s.r ?? '', done: true })) })),
  };
  save();
  openWorkout();
}

function openSheet(mode, html) {
  UI.sheetMode = mode;
  const sh = $('#sheet');
  sh.dataset.mode = mode;
  sh.innerHTML = html;
  sh.hidden = false;
  document.body.classList.add('locked');
}
function closeSheet() {
  const sh = $('#sheet');
  sh.hidden = true;
  sh.innerHTML = '';
  UI.sheetMode = null;
  document.body.classList.remove('locked');
}
function rerenderSheet(builder) {
  const body = $('#sheetBody');
  const top = body ? body.scrollTop : 0;
  $('#sheet').innerHTML = builder();
  const nb = $('#sheetBody');
  if (nb) nb.scrollTop = top;
}

function openWorkout() { openSheet('workout', workoutHTML()); }

function workoutHTML() {
  const d = S.draft;
  const restOpts = (cur) => {
    const opts = REST_OPTIONS.includes(cur) ? REST_OPTIONS : [...REST_OPTIONS, cur].sort((a, b) => a - b);
    return opts.map((s) => `<option value="${s}" ${s === cur ? 'selected' : ''}>${s ? fmtRest(s) : 'Sem'}</option>`).join('');
  };
  const exs = d.exercises.map((ex, i) => {
    const last = ex.name ? lastPerf(ex.name, d.date, d.logId) : null;
    const rows = ex.sets.map((s, j) => `
      <div class="set-row ${s.done ? 'done' : ''}">
        <span class="set-n">${j + 1}</span>
        <input data-bind="w" data-ex="${i}" data-set="${j}" inputmode="decimal" placeholder="0" value="${esc(s.w)}">
        <input data-bind="r" data-ex="${i}" data-set="${j}" inputmode="numeric" placeholder="0" value="${esc(s.r)}">
        <button class="check ${s.done ? 'on' : ''}" data-action="toggleSet" data-ex="${i}" data-set="${j}" aria-label="Série feita">✓</button>
      </div>`).join('');
    return `<div class="card ex-card">
      <div class="ex-card-head">
        ${ex.custom ? `<input data-bind="exname" data-ex="${i}" placeholder="Nome do exercício" value="${esc(ex.name)}">` : `<h3>${esc(ex.name)}</h3>`}
        <button class="icon-btn sm" data-action="removeEx" data-ex="${i}" aria-label="Remover exercício">×</button>
      </div>
      <div class="ex-meta" style="margin-top:6px">${ex.reps ? `Meta: ${esc(ex.reps)} reps ·` : ''} Descanso <select data-bind="rest" data-ex="${i}">${restOpts(ex.rest)}</select></div>
      ${last ? `<div class="last">Última vez (${fmtDateShort(last.date)})</div><div class="chips">${setChips(last.sets)}</div>` : ''}
      <div class="set-table">
        <div class="set-row head"><span></span><span>Peso (kg)</span><span>Reps</span><span></span></div>
        ${rows}
      </div>
      <div class="row-actions">
        <button class="link" data-action="addSet" data-ex="${i}">+ Série</button>
        ${ex.sets.length > 1 ? `<button class="link muted" data-action="removeSet" data-ex="${i}">− Remover última</button>` : ''}
      </div>
    </div>`;
  }).join('');
  const dt = fromKey(d.date);
  return `<div class="sheet-head">
      <button class="link" data-action="closeWorkout">${d.logId ? 'Cancelar' : 'Fechar'}</button>
      <div class="sheet-title"><b>${esc(d.title || 'Treino')}</b><small>${DAY_LONG[dt.getDay()]}, ${fmtDateShort(d.date)}</small></div>
      <button class="btn primary sm" data-action="saveWorkout">Salvar</button>
    </div>
    <div class="sheet-body" id="sheetBody">
      <label class="field"><span>Nome do treino</span><input data-bind="title" value="${esc(d.title)}"></label>
      ${!d.logId ? '<p class="small muted" style="margin:-4px 4px 14px">Marque ✓ em cada série feita — o cronômetro de descanso começa sozinho.</p>' : ''}
      ${exs}
      <button class="btn ghost full" data-action="addEx">+ Adicionar exercício</button>
      <label class="field mt"><span>Observações</span><textarea data-bind="notes" placeholder="Como foi o treino? (opcional)">${esc(d.notes)}</textarea></label>
    </div>`;
}

function onWorkoutInput(el) {
  const d = S.draft;
  if (!d) return;
  const b = el.dataset.bind, i = +el.dataset.ex, j = +el.dataset.set;
  if (b === 'title') d.title = el.value;
  else if (b === 'notes') d.notes = el.value;
  else if (b === 'exname') d.exercises[i].name = el.value;
  else if (b === 'rest') d.exercises[i].rest = +el.value;
  else if (b === 'w' || b === 'r') d.exercises[i].sets[j][b] = el.value;
  saveSoon();
}

function saveWorkout() {
  const d = S.draft;
  const anyDone = d.exercises.some((e) => e.sets.some((s) => s.done));
  if (!anyDone && !confirm('Nenhuma série foi marcada com ✓. Salvar todas as séries preenchidas?')) return;
  const exercises = d.exercises.map((e) => ({
    name: (e.name || '').trim() || 'Exercício',
    reps: e.reps || '',
    rest: e.rest,
    sets: e.sets
      .filter((s) => (anyDone ? s.done : true))
      .map((s) => ({ w: parseNum(s.w), r: parseNum(s.r) }))
      .filter((s) => s.w != null || s.r != null),
  })).filter((e) => e.sets.length);
  if (!exercises.length) { alert('Preencha pelo menos uma série para salvar.'); return; }
  const log = {
    id: d.logId || uid(), date: d.date, planId: d.planId, wd: d.wd,
    title: (d.title || '').trim() || 'Treino', exercises, notes: (d.notes || '').trim(),
    savedAt: d.logId ? (S.logs.find((l) => l.id === d.logId)?.savedAt || Date.now()) : Date.now(),
  };
  const before = streakInfo().current;
  const idx = S.logs.findIndex((l) => l.id === log.id);
  if (idx >= 0) S.logs[idx] = log; else S.logs.push(log);
  const after = streakInfo().current;
  S.draft = null;
  save();
  stopTimer();
  closeSheet();
  UI.selected = log.date;
  const dt = fromKey(log.date);
  UI.month = new Date(dt.getFullYear(), dt.getMonth(), 1);
  UI.tab = 'home';
  render();
  if (after > before && tierFor(after) !== tierFor(before)) toast(`Nova chama ${tierFor(after).name}! 🔥 ${after} seguidos`);
  else if (after > before) toast(`Treino salvo · ofensiva ${after} 🔥`);
  else toast('Treino salvo 💪');
}

/* =========================================================
   Folha: editor de treinos (planos)
   ========================================================= */
function openPlanEditor(plan) {
  UI.planEdit = plan ? clone(plan) : { id: uid(), name: '', days: {}, isNew: true };
  UI.planOpenDay = null;
  openSheet('plan', planHTML());
}

function ensureDay(pe, wd) {
  if (!pe.days[wd]) pe.days[wd] = { title: '', exercises: [] };
  return pe.days[wd];
}

function planHTML() {
  const pe = UI.planEdit;
  const restOpts = (cur) => REST_OPTIONS.map((s) => `<option value="${s}" ${s === cur ? 'selected' : ''}>${s ? fmtRest(s) : 'Sem'}</option>`).join('');
  const days = WEEK_ORDER.map((wd) => {
    const day = pe.days[wd] || { title: '', exercises: [] };
    const open = String(UI.planOpenDay) === String(wd);
    const n = day.exercises.length;
    const others = WEEK_ORDER.filter((o) => o !== wd && pe.days[o] && pe.days[o].exercises.length);
    return `<div class="card day-card ${open ? 'open' : ''}">
      <button class="day-toggle" data-action="toggleDay" data-wd="${wd}">
        <span class="day-name">${DAY_LONG[wd]}</span>
        <span class="day-sum ${n ? 'on' : ''}">${n ? `${esc(day.title || 'Treino')} · ${n} ex.` : 'Descanso'}</span>
        <span class="chev">›</span>
      </button>
      ${open ? `<div class="day-body">
        <input data-bind="dtitle" data-wd="${wd}" placeholder="Nome do dia (ex: Peito)" value="${esc(day.title)}">
        ${day.exercises.map((ex, i) => `<div class="plan-ex">
          <div class="plan-ex-top">
            <input data-bind="ename" data-wd="${wd}" data-i="${i}" placeholder="Nome do exercício" value="${esc(ex.name)}">
            ${i > 0 ? `<button class="icon-btn sm" data-action="movePlanEx" data-wd="${wd}" data-i="${i}" aria-label="Subir">↑</button>` : ''}
            <button class="icon-btn sm" data-action="removePlanEx" data-wd="${wd}" data-i="${i}" aria-label="Remover">×</button>
          </div>
          <div class="plan-ex-grid">
            <label><span>Séries</span><input data-bind="esets" data-wd="${wd}" data-i="${i}" inputmode="numeric" value="${esc(ex.sets)}"></label>
            <label><span>Reps</span><input data-bind="ereps" data-wd="${wd}" data-i="${i}" placeholder="10 ou 8-12" value="${esc(ex.reps)}"></label>
            <label><span>Descanso</span><select data-bind="erest" data-wd="${wd}" data-i="${i}">${restOpts(ex.rest)}</select></label>
          </div>
        </div>`).join('')}
        <div class="row-actions">
          <button class="link" data-action="addPlanEx" data-wd="${wd}">+ Exercício</button>
          ${others.length ? `<select class="copy-select" data-bind="copyFrom" data-wd="${wd}"><option value="">Copiar de…</option>${others.map((o) => `<option value="${o}">${DAY_LONG[o]}</option>`).join('')}</select>` : ''}
          ${n ? `<button class="link muted" data-action="clearDay" data-wd="${wd}">Virar descanso</button>` : ''}
        </div>
      </div>` : ''}
    </div>`;
  }).join('');
  return `<div class="sheet-head">
      <button class="link" data-action="closePlan">Cancelar</button>
      <div class="sheet-title"><b>${pe.isNew ? 'Novo treino' : 'Editar treino'}</b></div>
      <button class="btn primary sm" data-action="savePlan">Salvar</button>
    </div>
    <div class="sheet-body" id="sheetBody">
      <label class="field"><span>Nome do treino</span><input data-bind="pname" placeholder="Ex: Abóbora" value="${esc(pe.name)}"></label>
      <p class="small muted" style="margin:0 4px 12px">Toque em um dia para montar os exercícios. Dias sem exercícios são descanso.</p>
      ${days}
      ${!pe.isNew ? '<button class="btn ghost full danger" data-action="deletePlan">Excluir este treino</button>' : ''}
    </div>`;
}

function onPlanInput(el) {
  const pe = UI.planEdit;
  if (!pe) return;
  const b = el.dataset.bind, wd = el.dataset.wd, i = +el.dataset.i;
  if (b === 'pname') { pe.name = el.value; return; }
  if (b === 'copyFrom') {
    if (!el.value) return;
    const src = pe.days[el.value];
    const day = ensureDay(pe, wd);
    day.title = day.title || src.title;
    day.exercises = src.exercises.map((e) => ({ ...e, id: uid() }));
    rerenderSheet(planHTML);
    return;
  }
  const day = ensureDay(pe, wd);
  if (b === 'dtitle') { day.title = el.value; return; }
  const ex = day.exercises[i];
  if (!ex) return;
  if (b === 'ename') ex.name = el.value;
  else if (b === 'esets') ex.sets = parseInt(el.value, 10) || '';
  else if (b === 'ereps') ex.reps = el.value;
  else if (b === 'erest') ex.rest = +el.value;
}

function savePlan() {
  const pe = UI.planEdit;
  const plan = { id: pe.id, name: (pe.name || '').trim() || 'Meu treino', days: {} };
  Object.keys(pe.days).forEach((wd) => {
    const day = pe.days[wd];
    const exercises = day.exercises
      .filter((e) => (e.name || '').trim())
      .map((e) => ({ id: e.id || uid(), name: e.name.trim(), sets: parseInt(e.sets, 10) || 3, reps: String(e.reps || '').trim() || '10', rest: e.rest ?? 90 }));
    if (exercises.length) plan.days[wd] = { title: (day.title || '').trim(), exercises };
  });
  const idx = S.plans.findIndex((p) => p.id === plan.id);
  if (idx >= 0) S.plans[idx] = plan; else S.plans.push(plan);
  if (!activePlan()) S.activePlanId = plan.id;
  save();
  closeSheet();
  UI.planEdit = null;
  render();
  toast('Treino salvo');
}

/* =========================================================
   Cronômetro de descanso
   ========================================================= */
const T = { end: 0, total: 0, int: null, fired: false, audio: null, hideT: null };

function unlockAudio() {
  try {
    if (!T.audio) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (C) T.audio = new C();
    }
    if (T.audio && T.audio.state === 'suspended') T.audio.resume();
  } catch (e) { /* sem som */ }
}
function beep() {
  const ctx = T.audio;
  if (!ctx) return;
  [0, 0.28, 0.56].forEach((t) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = 880;
    o.connect(g); g.connect(ctx.destination);
    const s = ctx.currentTime + t;
    g.gain.setValueAtTime(0.0001, s);
    g.gain.exponentialRampToValueAtTime(0.35, s + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, s + 0.2);
    o.start(s); o.stop(s + 0.22);
  });
}
function startTimer(sec) {
  if (!sec) return;
  clearTimeout(T.hideT);
  T.total = sec; T.end = Date.now() + sec * 1000; T.fired = false;
  const el = $('#timer');
  el.classList.remove('finished');
  $('#timerLabel').textContent = 'Descanso';
  el.hidden = false;
  clearInterval(T.int);
  T.int = setInterval(tick, 250);
  tick();
}
function tick() {
  const left = Math.max(0, Math.ceil((T.end - Date.now()) / 1000));
  $('#timerTime').textContent = `${Math.floor(left / 60)}:${pad(left % 60)}`;
  $('#timerFill').style.width = `${T.total ? (left / T.total) * 100 : 0}%`;
  if (left <= 0 && !T.fired) {
    T.fired = true;
    clearInterval(T.int);
    beep();
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    $('#timer').classList.add('finished');
    $('#timerLabel').textContent = 'Bora, próxima série!';
    T.hideT = setTimeout(stopTimer, 5000);
  }
}
function adjustTimer(d) {
  if (T.fired) { startTimer(Math.max(5, d)); return; }
  T.end += d * 1000;
  T.total = Math.max(T.total, Math.ceil((T.end - Date.now()) / 1000));
  tick();
}
function stopTimer() {
  clearInterval(T.int); clearTimeout(T.hideT);
  $('#timer').hidden = true;
}

/* =========================================================
   Backup
   ========================================================= */
async function exportData() {
  const data = JSON.stringify({ app: APP_NAME, exportedAt: new Date().toISOString(), data: { ...S, draft: null } }, null, 2);
  const name = `forja-backup-${todayKey()}.json`;
  const file = new File([data], name, { type: 'application/json' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Backup do Forja' }); return; }
    catch (e) { if (e.name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const d = parsed.data || parsed;
      if (!Array.isArray(d.plans) || !Array.isArray(d.logs)) throw new Error('formato');
      if (!confirm(`Importar backup com ${d.plans.length} treino(s) e ${d.logs.length} registro(s)? Os dados atuais deste aparelho serão substituídos.`)) return;
      S = { version: 1, theme: S.theme, activePlanId: d.activePlanId || (d.plans[0] && d.plans[0].id) || null, plans: d.plans, logs: d.logs, draft: null };
      save();
      render();
      toast('Backup importado');
    } catch (e) {
      alert('Arquivo inválido. Escolha um backup exportado por este app.');
    }
  };
  reader.readAsText(file);
}

/* =========================================================
   Aviso rápido
   ========================================================= */
let toastT = null;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 2200);
}

/* =========================================================
   Ações (cliques)
   ========================================================= */
const actions = {
  tab(el) { UI.tab = el.dataset.tab; render(); window.scrollTo(0, 0); },
  openStreak() { openSheet('streak', streakHTML()); },
  closeSheet() { closeSheet(); },
  toggleTheme() { S.theme = S.theme === 'dark' ? 'light' : 'dark'; applyTheme(); save(); },

  month(el) {
    const d = +el.dataset.d, b = calBounds();
    const idx = UI.month.getFullYear() * 12 + UI.month.getMonth() + d;
    if (idx < b.min || idx > b.max) return;
    UI.month = new Date(Math.floor(idx / 12), idx % 12, 1);
    render();
  },
  goToday() {
    const n = new Date();
    UI.selected = todayKey();
    UI.month = new Date(n.getFullYear(), n.getMonth(), 1);
    render();
  },
  pickDay(el) { UI.selected = el.dataset.key; render(); },

  startPlanned(el) { startPlanned(el.dataset.key, +el.dataset.wd); },
  startFree() { startFree(UI.selected); },
  openDraft() { if (S.draft) openWorkout(); },
  closeWorkout() {
    if (S.draft && S.draft.logId) { S.draft = null; save(); }
    closeSheet();
    render();
    if (S.draft) toast('Treino guardado — continue quando quiser');
  },
  saveWorkout,
  toggleSet(el) {
    const ex = S.draft.exercises[+el.dataset.ex];
    const s = ex.sets[+el.dataset.set];
    s.done = !s.done;
    save();
    rerenderSheet(workoutHTML);
    if (s.done && !S.draft.logId) { unlockAudio(); startTimer(ex.rest); }
  },
  addSet(el) {
    const ex = S.draft.exercises[+el.dataset.ex];
    const prev = ex.sets[ex.sets.length - 1];
    ex.sets.push({ w: prev ? prev.w : '', r: prev ? prev.r : '', done: false });
    save(); rerenderSheet(workoutHTML);
  },
  removeSet(el) {
    const ex = S.draft.exercises[+el.dataset.ex];
    if (ex.sets.length > 1) ex.sets.pop();
    save(); rerenderSheet(workoutHTML);
  },
  addEx() {
    S.draft.exercises.push(draftExercise('', 3, '', 90, S.draft.date));
    save(); rerenderSheet(workoutHTML);
    const b = $('#sheetBody'); if (b) b.scrollTop = b.scrollHeight;
  },
  removeEx(el) {
    const ex = S.draft.exercises[+el.dataset.ex];
    if (!confirm(`Remover “${ex.name || 'exercício'}” deste treino?`)) return;
    S.draft.exercises.splice(+el.dataset.ex, 1);
    save(); rerenderSheet(workoutHTML);
  },

  toggleLog(el) { UI.openLog = UI.openLog === el.dataset.id ? null : el.dataset.id; render(); },
  editLog(el) { editLog(el.dataset.id); },
  deleteLog(el) {
    if (!confirm('Excluir este treino do histórico?')) return;
    S.logs = S.logs.filter((l) => l.id !== el.dataset.id);
    save(); render(); toast('Treino excluído');
  },

  activatePlan(el) { S.activePlanId = el.dataset.id; save(); render(); toast('Treino ativo atualizado'); },
  newPlan() { openPlanEditor(null); },
  editPlan(el) { openPlanEditor(S.plans.find((p) => p.id === el.dataset.id)); },
  dupPlan(el) {
    const p = clone(S.plans.find((x) => x.id === el.dataset.id));
    p.id = uid(); p.name = `${p.name} (cópia)`;
    S.plans.push(p); save(); render(); toast('Treino duplicado');
  },
  closePlan() { closeSheet(); UI.planEdit = null; },
  savePlan,
  deletePlan() {
    const pe = UI.planEdit;
    if (!confirm(`Excluir o treino “${pe.name}”? O histórico já registrado continua salvo.`)) return;
    S.plans = S.plans.filter((p) => p.id !== pe.id);
    if (S.activePlanId === pe.id) S.activePlanId = S.plans[0] ? S.plans[0].id : null;
    save(); closeSheet(); UI.planEdit = null; render();
  },
  toggleDay(el) {
    UI.planOpenDay = String(UI.planOpenDay) === el.dataset.wd ? null : el.dataset.wd;
    rerenderSheet(planHTML);
  },
  addPlanEx(el) {
    ensureDay(UI.planEdit, el.dataset.wd).exercises.push({ id: uid(), name: '', sets: 3, reps: '10', rest: 90 });
    rerenderSheet(planHTML);
    const inputs = document.querySelectorAll(`[data-bind="ename"][data-wd="${el.dataset.wd}"]`);
    if (inputs.length) inputs[inputs.length - 1].focus();
  },
  removePlanEx(el) {
    UI.planEdit.days[el.dataset.wd].exercises.splice(+el.dataset.i, 1);
    rerenderSheet(planHTML);
  },
  movePlanEx(el) {
    const arr = UI.planEdit.days[el.dataset.wd].exercises, i = +el.dataset.i;
    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    rerenderSheet(planHTML);
  },
  clearDay(el) {
    UI.planEdit.days[el.dataset.wd] = { title: '', exercises: [] };
    rerenderSheet(planHTML);
  },

  metric(el) { UI.metric = el.dataset.m; UI.tipIndex = null; render(); },
  chartTip(el) { UI.tipIndex = +el.dataset.i; render(); },

  timerAdj(el) { adjustTimer(+el.dataset.d); },
  timerStop() { stopTimer(); },

  exportData,
  importData() { $('#importFile').click(); },
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const fn = actions[el.dataset.action];
  if (fn) fn(el, e);
});

function onBind(e) {
  const el = e.target;
  if (!el.dataset || !el.dataset.bind) return;
  if (el.dataset.bind === 'progressEx') {
    if (e.type === 'change') { UI.progressEx = el.value; UI.tipIndex = null; render(); }
    return;
  }
  if (el.dataset.bind === 'copyFrom') { if (e.type === 'change') onPlanInput(el); return; }
  if (UI.sheetMode === 'workout') onWorkoutInput(el);
  else if (UI.sheetMode === 'plan') onPlanInput(el);
}
document.addEventListener('input', onBind);
document.addEventListener('change', onBind);

$('#importFile').addEventListener('change', (e) => {
  const f = e.target.files && e.target.files[0];
  if (f) importData(f);
  e.target.value = '';
});

// Ao voltar para o app (ex: depois de bloquear a tela), atualiza "hoje" e o cronômetro
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (!$('#timer').hidden && !T.fired) tick();
  if (UI.lastToday !== todayKey()) {
    const was = UI.selected === UI.lastToday;
    UI.lastToday = todayKey();
    if (was) actions.goToday();
    else if (!UI.sheetMode) render();
  }
});

/* =========================================================
   Início
   ========================================================= */
function init() {
  load();
  applyTheme();
  const n = new Date();
  UI.selected = todayKey();
  UI.lastToday = UI.selected;
  UI.month = new Date(n.getFullYear(), n.getMonth(), 1);
  render();
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}
init();
