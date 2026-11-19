'use strict';
/* =========================================================
   Forja — execução do treino, resumo final e Treino Imediato
   ========================================================= */

function draftExercise(name, exId, nSets, reps, rest, tech, dateKey, excludeId) {
  const last = name ? lastPerf(exKey(name, exId), dateKey, excludeId) : null;
  const { lo, hi } = repRange(reps);
  const target = hi || lo || '';
  const n = Math.max(1, parseInt(nSets, 10) || (last ? last.sets.length : 3));
  const sets = [];
  for (let i = 0; i < n; i++) {
    const ls = last ? last.sets[Math.min(i, last.sets.length - 1)] : null;
    sets.push({ w: ls && ls.w != null ? ls.w : '', r: target || (ls && ls.r != null ? ls.r : ''), done: false });
  }
  return { key: uid(), name: name || '', exId: exId || null, reps: reps || '', rest: rest ?? S.settings.restDefault, tech: tech || '', note: '', sets, planned: n, custom: !name };
}
function newDraft(o) {
  return Object.assign({ id: uid(), logId: null, planId: null, wd: fromKey(o.date).getDay(), notes: '', startedAt: Date.now(), restSec: 0, durationMin: '', exercises: [] }, o);
}
function startDraft(draft) {
  if (S.draft && !S.draft.logId && (S.draft.date !== draft.date || S.draft.title !== draft.title)) {
    if (!confirm(`Já existe um treino em andamento (${S.draft.title}, ${fmtDateShort(S.draft.date)}). Descartar e começar outro?`)) return;
  }
  S.draft = draft;
  save();
  pushSheet('workout');
}
function startPlanned(key, wd) {
  const plan = activePlan(), pd = planDay(plan, wd);
  startDraft(newDraft({
    date: key, planId: plan ? plan.id : null, wd, title: pd ? pd.title || DAY_LONG[wd] : 'Treino',
    exercises: pd ? pd.exercises.map((e) => draftExercise(e.name, e.exId, e.sets, e.reps, e.rest, e.tech, key)) : [],
  }));
}
function startFromList(title, list, key = todayKey()) {
  startDraft(newDraft({ date: key, title, exercises: list.map((x) => draftExercise(x.name, x.exId, x.sets, x.reps, x.rest, x.tech, key)) }));
}
function editLog(id) {
  const l = S.logs.find((x) => x.id === id);
  if (!l) return;
  if (S.draft && !S.draft.logId && !confirm('Há um treino em andamento. Ele será descartado para editar este registro. Continuar?')) return;
  S.draft = {
    id: uid(), logId: l.id, date: l.date, planId: l.planId, wd: l.wd, title: l.title, notes: l.notes || '',
    startedAt: l.startedAt || null, restSec: l.restSec || 0, durationMin: l.durationMin || '',
    exercises: l.exercises.map((e) => ({ key: uid(), name: e.name, exId: e.exId || null, reps: e.reps || '', rest: e.rest ?? 90, tech: e.tech || '', note: e.note || '', planned: e.planned || e.sets.length, custom: false, sets: e.sets.map((s) => ({ w: s.w ?? '', r: s.r ?? '', done: true })) })),
  };
  save();
  pushSheet('workout');
}
const isLive = (d) => !d.logId && d.date === todayKey();

/* Sugestão inteligente de progressão */
function suggestion(ex, d) {
  const e = findEx(ex.name, ex.exId);
  if (!ex.name || (e && exGroup(e) === 'cardio')) return null;
  const last = lastPerf(exKey(ex.name, ex.exId), d.date, d.logId);
  const { lo, hi } = repRange(ex.reps);
  if (!last) return { text: `Primeira vez: escolha uma carga em que você termine ${hi ? `${lo === hi ? hi : `${lo}–${hi}`} repetições` : 'as repetições'} com boa técnica, sentindo que faltam 1–2 para a falha.` };
  const w = Math.max(0, ...last.sets.map((s) => s.w || 0));
  if (!w) return null;
  const inc = e && (e.eq === 'halteres' || !e.c) ? 1 : 2.5;
  const allHit = hi && last.sets.every((s) => (s.r || 0) >= hi);
  const anyMiss = lo && last.sets.some((s) => (s.r || 0) < lo);
  if (allHit) return { text: `Você completou todas as repetições na última vez com ${fmtNum(w)} kg. Hora de subir para <b>${fmtNum(w + inc)} kg</b>.`, w: w + inc, up: true };
  if (anyMiss) return { text: `Na última vez algumas séries ficaram abaixo de ${lo} reps. Mantenha <b>${fmtNum(w)} kg</b> e foque em completar.`, w };
  return { text: `Mantenha <b>${fmtNum(w)} kg</b> e tente fazer 1 repetição a mais em cada série.`, w };
}

SHEETS.workout = {
  render() {
    const d = S.draft;
    if (!d) return sheetHead('Treino');
    const live = isLive(d);
    const totalSets = sum(d.exercises.map((e) => e.sets.length));
    const doneSets = sum(d.exercises.map((e) => e.sets.filter((s) => s.done).length));
    const pct = totalSets ? doneSets / totalSets : 0;
    const exs = d.exercises.map((ex, i) => workoutExCard(ex, i, d)).join('');
    const dt = fromKey(d.date);
    return `${sheetHead(esc(d.title || 'Treino'), {
      left: d.logId ? 'Cancelar' : 'Fechar', leftAction: 'closeWorkout',
      sub: live ? `<span id="elapsed">${elapsedText(d)}</span> · ${doneSets}/${totalSets} séries` : `${DAY_LONG[dt.getDay()]}, ${fmtDateShort(d.date)}`,
      right: '<button class="btn primary sm" data-action="saveWorkout">Salvar</button>',
    })}
    <div class="wk-progress"><i style="width:${pct * 100}%"></i></div>
    <div class="sheet-body" id="sheetBody">
      <label class="field"><span>Nome do treino</span><input data-bind="title" value="${esc(d.title)}"></label>
      ${!live ? `<label class="field"><span>Duração (minutos)</span><input data-bind="durationMin" inputmode="numeric" placeholder="ex: 60" value="${esc(d.durationMin)}"></label>` : ''}
      ${!d.logId && d.exercises.length ? '<p class="small muted hint">Marque ✓ em cada série feita — o descanso começa sozinho. Toque na animação para ver as instruções.</p>' : ''}
      ${exs || emptyState('Nenhum exercício', 'Adicione exercícios para começar.')}
      <button class="btn ghost full" data-action="pickFor" data-mode="draftAdd">+ Adicionar exercício</button>
      <label class="field mt"><span>Observações do treino</span><textarea data-bind="notes" placeholder="Como foi o treino? (opcional)">${esc(d.notes)}</textarea></label>
      <button class="btn primary full big" data-action="saveWorkout">${d.logId ? 'Salvar alterações' : 'Finalizar treino'}</button>
      ${!d.logId ? '<button class="btn ghost full danger" data-action="discardDraft">Descartar treino</button>' : ''}
    </div>`;
  },
  input(el, data, type) {
    const d = S.draft;
    if (!d) return;
    const b = el.dataset.bind, i = +el.dataset.ex, j = +el.dataset.set;
    if (b === 'title') d.title = el.value;
    else if (b === 'notes') d.notes = el.value;
    else if (b === 'durationMin') d.durationMin = el.value;
    else if (b === 'exname') { d.exercises[i].name = el.value; const f = findEx(el.value); d.exercises[i].exId = f ? f.id : null; }
    else if (b === 'exnote') d.exercises[i].note = el.value;
    else if (b === 'rest') d.exercises[i].rest = +el.value;
    else if (b === 'w' || b === 'r') d.exercises[i].sets[j][b] = el.value;
    saveSoon();
  },
};
function elapsedText(d) {
  const s = Math.max(0, Math.floor((Date.now() - (d.startedAt || Date.now())) / 1000));
  return `⏱ ${Math.floor(s / 3600) ? Math.floor(s / 3600) + ':' : ''}${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}
setInterval(() => { const el = document.getElementById('elapsed'); if (el && S && S.draft) el.textContent = elapsedText(S.draft); }, 1000);

function workoutExCard(ex, i, d) {
  const e = findEx(ex.name, ex.exId);
  const last = ex.name ? lastPerf(exKey(ex.name, ex.exId), d.date, d.logId) : null;
  const sug = !d.logId && S.settings.smart ? suggestion(ex, d) : null;
  const doneAll = ex.sets.length && ex.sets.every((s) => s.done);
  const isCardio = e && exGroup(e) === 'cardio';
  const rows = ex.sets.map((s, j) => `
    <div class="set-row ${s.done ? 'done' : ''}">
      <span class="set-n">${j + 1}</span>
      <input data-bind="w" data-ex="${i}" data-set="${j}" inputmode="decimal" placeholder="0" value="${esc(typeof s.w === 'number' ? String(s.w).replace('.', ',') : s.w)}">
      <input data-bind="r" data-ex="${i}" data-set="${j}" inputmode="numeric" placeholder="0" value="${esc(s.r)}">
      <button class="check ${s.done ? 'on' : ''}" data-action="toggleSet" data-ex="${i}" data-set="${j}" aria-label="Série feita">✓</button>
    </div>`).join('');
  const warmW = last ? Math.max(0, ...last.sets.map((s) => s.w || 0)) : 0;
  const showWarm = S.settings.warmup && !d.logId && i === 0 && e && e.c;
  const tech = ex.tech && TECHNIQUES[ex.tech];
  return `<div class="card ex-card ${doneAll ? 'all-done' : ''}">
    <div class="ex-card-head">
      <button class="thumb md" data-action="openExercise" data-name="${esc(ex.name)}" data-id="${ex.exId || ''}"${e && window.Fig3D && Fig3D.ok ? ` data-snap3d="${e.id}|0.55|0|170"` : ''}>${e ? figureSVG(e, { animate: !(window.Fig3D && Fig3D.ok) }) : `<span>${esc((ex.name || '?')[0] || '?')}</span>`}</button>
      <div class="ex-info">
        ${ex.custom ? `<input class="ex-title-input" data-bind="exname" data-ex="${i}" placeholder="Nome do exercício" value="${esc(ex.name)}">` : `<h3>${esc(ex.name)} ${techBadge(ex.tech)}</h3>`}
        <div class="small muted">${e ? muscleNames(e.m.concat(e.s).slice(0, 4)) : 'Exercício livre'}</div>
      </div>
      ${doneAll ? '<span class="done-mark">✓</span>' : ''}
    </div>
    <div class="ex-tools">
      <button class="pill-btn" data-action="pickFor" data-mode="draftReplace" data-ex="${i}">⇄ Substituir</button>
      <button class="pill-btn" data-action="toggleExNote" data-ex="${i}">＋ Nota</button>
      ${i > 0 ? `<button class="pill-btn" data-action="moveDraftEx" data-ex="${i}">↑</button>` : ''}
      <button class="pill-btn" data-action="removeEx" data-ex="${i}">✕</button>
    </div>
    ${tech ? `<div class="tech-box">${techBadge(ex.tech)} <b>${tech.n}:</b> ${tech.d}</div>` : ''}
    <div class="ex-meta">${ex.reps ? `Meta: <b>${esc(ex.reps)}</b> ${isCardio ? 'min' : 'reps'} ·` : ''} Descanso ${restSelect('rest', ex.rest, `data-ex="${i}" class="mini-select"`)}</div>
    ${showWarm ? `<div class="warm-box">🔥 <b>Aquecimento:</b> 1–2 séries leves${warmW ? ` com ~${fmtNum(Math.round(warmW * 0.5 / 2.5) * 2.5)} kg` : ''} × 12, sem cansar.</div>` : ''}
    ${sug ? `<div class="smart-box"><div><b>💡 Sugestão inteligente</b><p>${sug.text}</p></div>${sug.w != null ? `<button class="btn sm" data-action="applySug" data-ex="${i}" data-w="${sug.w}">Aplicar</button>` : ''}</div>` : ''}
    ${last ? `<div class="last">Última vez (${fmtDateShort(last.date)})</div><div class="chips">${chips(last.sets)}</div>` : ''}
    <div class="set-table">
      <div class="set-row head"><span></span><span>${isCardio ? 'Nível/km' : 'Peso (kg)'}</span><span>${isCardio ? 'Minutos' : 'Reps'}</span><span></span></div>
      ${rows}
    </div>
    <div class="row-actions">
      <button class="link" data-action="addSet" data-ex="${i}">+ Série</button>
      ${ex.sets.length > 1 ? `<button class="link muted" data-action="removeSet" data-ex="${i}">− Remover última</button>` : ''}
    </div>
    ${ex.showNote || ex.note ? `<textarea class="ex-note" data-bind="exnote" data-ex="${i}" placeholder="Nota sobre este exercício (ajuste do banco, pegada…)">${esc(ex.note)}</textarea>` : ''}
  </div>`;
}

function saveWorkout() {
  const d = S.draft;
  const anyDone = d.exercises.some((e) => e.sets.some((s) => s.done));
  if (!anyDone && !confirm('Nenhuma série foi marcada com ✓. Salvar todas as séries preenchidas?')) return;
  const exercises = d.exercises.map((e) => ({
    name: (e.name || '').trim() || 'Exercício', exId: e.exId || (findEx(e.name) || {}).id || null,
    reps: e.reps || '', rest: e.rest, tech: e.tech || '', note: (e.note || '').trim(), planned: e.planned || e.sets.length,
    sets: e.sets.filter((s) => (anyDone ? s.done : true)).map((s) => ({ w: parseNum(s.w), r: parseNum(s.r) })).filter((s) => s.w != null || s.r != null),
  })).filter((e) => e.sets.length);
  if (!exercises.length) { alert('Preencha pelo menos uma série para salvar.'); return; }
  stopTimer();
  const prev = d.logId ? S.logs.find((l) => l.id === d.logId) : null;
  let durationMin = parseNum(d.durationMin);
  if (isLive(d) && d.startedAt) durationMin = Math.min(240, Math.max(1, Math.round((Date.now() - d.startedAt) / 60000)));
  const log = {
    id: d.logId || uid(), date: d.date, planId: d.planId, wd: d.wd, title: (d.title || '').trim() || 'Treino',
    exercises, notes: (d.notes || '').trim(), savedAt: prev ? prev.savedAt : Date.now(),
    startedAt: d.startedAt || null, durationMin: durationMin || null, restSec: d.restSec || 0,
  };
  // recordes pessoais
  const prs = [];
  log.exercises.forEach((e) => {
    const k = exKey(e.name, e.exId), b = bestsFor(k, log.id), st = exStats(e.sets);
    if (!b.maxW && !b.e1rm) return; // primeira vez não conta como recorde
    if (b.maxW && st.maxW > b.maxW.v) prs.push({ name: e.name, kind: 'Maior carga', v: `${fmtNum(st.maxW)} kg`, old: `${fmtNum(b.maxW.v)} kg` });
    else if (b.e1rm && st.e1rm > b.e1rm.v + 0.01) prs.push({ name: e.name, kind: '1RM estimado', v: `${fmtNum(st.e1rm, 1)} kg`, old: `${fmtNum(b.e1rm.v, 1)} kg` });
    else if (b.vol && st.vol > b.vol.v) prs.push({ name: e.name, kind: 'Volume', v: `${fmtInt(st.vol)} kg`, old: `${fmtInt(b.vol.v)} kg` });
  });
  const before = streakInfo().current;
  const idx = S.logs.findIndex((l) => l.id === log.id);
  if (idx >= 0) S.logs[idx] = log; else S.logs.push(log);
  if (!prev) S.prCount = (S.prCount || 0) + prs.length;
  S.draft = null;
  save();
  const ach = checkAchievements({ startHour: !prev && d.startedAt ? new Date(d.startedAt).getHours() : null });
  const after = streakInfo().current;
  UI.selected = log.date;
  const dt = fromKey(log.date);
  UI.month = new Date(dt.getFullYear(), dt.getMonth(), 1);
  render();
  if (prev) { popSheet(); toast('Treino atualizado'); return; }
  replaceSheet('summary', { logId: log.id, prs, ach, streak: { before, after } });
}

/* ---------------- Resumo final ---------------- */
SHEETS.summary = {
  render(data) {
    const l = S.logs.find((x) => x.id === data.logId);
    if (!l) return sheetHead('Resumo');
    const st = logStats(l);
    const t = tierFor(data.streak.after);
    const newTier = data.streak.after > data.streak.before && tierFor(data.streak.before) !== t;
    const load = muscleLoad([l]);
    const mx = Math.max(1, ...Object.values(load));
    const colors = Object.fromEntries(Object.entries(load).map(([m, v]) => [m, `color-mix(in srgb, var(--accent) ${Math.round(35 + 65 * (v / mx))}%, transparent)`]));
    return `${sheetHead('Treino concluído', { left: 'Fechar', leftAction: 'closeAll' })}
    <div class="sheet-body" id="sheetBody">
      <div class="summary-hero">
        <div class="big-check">✓</div>
        <h1>Mandou bem!</h1>
        <div class="muted">${esc(l.title)} · ${fmtDateLong(l.date)}</div>
      </div>
      <div class="stats-grid">
        <div class="stat"><b>${fmtMin(st.dur)}</b><span>Duração</span></div>
        <div class="stat"><b>${fmtKg(st.vol)}</b><span>Volume</span></div>
        <div class="stat"><b>${st.sets}</b><span>Séries</span></div>
        <div class="stat"><b>${fmtInt(st.reps)}</b><span>Repetições</span></div>
        <div class="stat"><b>${st.ex}</b><span>Exercícios</span></div>
        <div class="stat"><b>${fmtInt(st.kcal)}</b><span>kcal (est.)</span></div>
      </div>
      <div class="card streak-mini" data-action="openStreak">
        ${streakIcon(t, 48, true)}
        <div><b style="color:${t.c1}">${data.streak.after} ${data.streak.after === 1 ? 'treino seguido' : 'treinos seguidos'}</b>
        <div class="small muted">${newTier ? `Nova cor: chama ${t.name}! 🔥` : 'Ofensiva atualizada'}</div></div>
      </div>
      ${data.prs.length ? `<div class="section-title">🏆 Recordes pessoais</div><div class="card">${data.prs.map((p) => `<div class="pr-row"><div><b>${esc(p.name)}</b><div class="small muted">${p.kind} · antes ${p.old}</div></div><span class="pr-v">${p.v}</span></div>`).join('')}</div>` : ''}
      ${data.ach.length ? `<div class="section-title">Conquistas desbloqueadas</div><div class="ach-grid">${data.ach.map((a) => `<div class="ach on"><span>${a.ic}</span><b>${a.n}</b><small>${a.d}</small></div>`).join('')}</div>` : ''}
      <div class="section-title">Músculos trabalhados</div>
      <div class="card">${bodyPair(colors)}<p class="small muted center">${muscleNames(Object.keys(load).sort((a, b) => load[b] - load[a]).slice(0, 6))}</p></div>
      <button class="btn ghost full" data-action="shareLog" data-id="${l.id}">Compartilhar resumo</button>
      <button class="btn primary full big" data-action="closeAll">Concluir</button>
    </div>`;
  },
};
function shareText(l) {
  const st = logStats(l);
  return `🔥 ${l.title} — ${fmtDateShort(l.date)}\n⏱ ${fmtMin(st.dur)} · ${st.sets} séries · ${fmtKg(st.vol)}\n\n` +
    l.exercises.map((e) => `• ${e.name}: ${e.sets.map((s) => `${s.w != null ? fmtNum(s.w) : '—'}×${s.r != null ? fmtNum(s.r) : '—'}`).join(', ')}`).join('\n') + '\n\nFeito com Forja';
}

/* ---------------- Treino Imediato ---------------- */
const INSTANT_GROUPS = {
  peito: ['Peito', ['peitoral']], costas: ['Costas', ['dorsais', 'trapezio']], ombros: ['Ombros', ['ombros']],
  biceps: ['Bíceps', ['biceps']], triceps: ['Tríceps', ['triceps']], quadriceps: ['Quadríceps', ['quadriceps']],
  posterior: ['Posterior', ['isquiotibiais']], gluteos: ['Glúteos', ['gluteos', 'abdutores']], panturrilhas: ['Panturrilha', ['panturrilhas']],
  abdomen: ['Abdômen', ['abdomen', 'obliquos']], cardio: ['Cardio', ['cardio']],
};
const INSTANT_EQUIP = {
  academia: ['Academia completa', null], maquinas: ['Máquinas e cabos', ['maquina', 'polia', 'corporal', 'cardio']],
  halteres: ['Halteres', ['halteres', 'corporal']], casa: ['Sem equipamentos', ['corporal']],
};
const INSTANT_DUR = { 20: 3, 30: 4, 45: 5, 60: 7, 90: 9 };

function instantCandidates(groupKey, excl = new Set()) {
  const pref = S.instant, eq = INSTANT_EQUIP[pref.equip][1];
  const ms = INSTANT_GROUPS[groupKey][1];
  return EXERCISES.filter((e) => e.m.some((m) => ms.includes(m)) && (!eq || eq.includes(e.eq)) && e.lvl <= Math.max(1, +pref.level) + (pref.level >= 2 ? 1 : 0) && !excl.has(e.id));
}
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
function instantItem(e) {
  const g = GOALS[S.instant.goal] || GOALS.hipertrofia;
  if (exGroup(e) === 'cardio') return { exId: e.id, name: e.n, sets: 1, reps: S.instant.dur >= 45 ? '15' : '10', rest: 0, tech: '' };
  return { exId: e.id, name: e.n, sets: g.sets + (+S.instant.level === 3 ? 1 : 0), reps: g.reps, rest: g.rest, tech: '' };
}
function generateInstant() {
  const p = S.instant;
  const groups = p.groups.length ? p.groups : ['peito', 'costas', 'quadriceps'];
  const n = INSTANT_DUR[p.dur] || 5;
  const used = new Set(), list = [];
  let gi = 0, guard = 0;
  while (list.length < n && guard++ < 60) {
    const gk = groups[gi % groups.length];
    let cands = instantCandidates(gk, used);
    const firstOfGroup = !list.some((x) => x.g === gk);
    if (firstOfGroup && cands.some((e) => e.c)) cands = cands.filter((e) => e.c);
    if (cands.length) { const e = pickRandom(cands); used.add(e.id); list.push(Object.assign(instantItem(e), { g: gk })); }
    gi++;
  }
  list.sort((a, b) => (EX_BY_ID[b.exId].c ? 1 : 0) - (EX_BY_ID[a.exId].c ? 1 : 0) || (exGroup(EX_BY_ID[a.exId]) === 'cardio' ? 1 : 0) - (exGroup(EX_BY_ID[b.exId]) === 'cardio' ? 1 : 0));
  return list;
}
SHEETS.instant = {
  render(data) {
    const p = S.instant;
    if (!data.list) data.list = generateInstant();
    const muscles = {};
    data.list.forEach((x) => { const e = findEx(x.name, x.exId); if (e) e.m.forEach((m) => { muscles[m] = 'var(--accent)'; }); });
    const sel = (bind, obj, cur) => `<select data-bind="${bind}" class="chip-select">${Object.entries(obj).map(([k, v]) => `<option value="${k}" ${String(k) === String(cur) ? 'selected' : ''}>${Array.isArray(v) ? v[0] : v.n || v}</option>`).join('')}</select>`;
    const est = Math.round(sum(data.list.map((x) => x.sets * (0.8 + (x.rest || 0) / 60) + (x.rest === 0 ? +x.reps : 0))));
    return `${sheetHead('Treino Imediato', { sub: 'Um treino novo, montado na hora' })}
    <div class="sheet-body" id="sheetBody">
      <div class="filters">
        <label><span>Duração</span>${sel('dur', { 20: '20 min', 30: '30 min', 45: '45 min', 60: '60 min', 90: '90 min' }, p.dur)}</label>
        <label><span>Equipamentos</span>${sel('equip', INSTANT_EQUIP, p.equip)}</label>
        <label><span>Nível</span>${sel('level', LEVELS, p.level)}</label>
        <label><span>Objetivo</span>${sel('goal', GOALS, p.goal)}</label>
      </div>
      <div class="section-title">Músculos</div>
      <div class="chip-pick">${Object.entries(INSTANT_GROUPS).map(([k, [n]]) => `<button class="${p.groups.includes(k) ? 'on' : ''}" data-action="instantGroup" data-g="${k}">${n}</button>`).join('')}</div>
      <div class="card instant-head">
        <div class="mini-body">${bodySVG('front', muscles)}${bodySVG('back', muscles)}</div>
        <div><b>${data.list.length} exercícios · ~${est} min</b><div class="small muted">${GOALS[p.goal].n} · ${LEVELS[p.level]}</div>
        <button class="link" data-action="instantRegen">↻ Gerar outro</button></div>
      </div>
      <div class="section-title">Exercícios <button class="link" data-action="pickFor" data-mode="instantAdd">+ Adicionar</button></div>
      <div class="card"><ul class="ex-list">${data.list.map((x, i) => {
        const e = findEx(x.name, x.exId);
        return `<li class="ex-row">
          <button class="thumb sm" data-action="openExercise" data-id="${x.exId}" data-name="${esc(x.name)}"${e && window.Fig3D && Fig3D.ok ? ` data-snap3d="${e.id}|0.55|0|150"` : ''}>${e ? figureSVG(e, { t: 0.55 }) : ''}</button>
          <div class="ex-info"><div class="ex-name">${esc(x.name)}</div><div class="ex-meta">${x.sets} séries • ${esc(x.reps)} ${e && exGroup(e) === 'cardio' ? 'min' : 'reps'}</div><div>${e ? muscleTag(e.m[0]) : ''}</div></div>
          <div class="row-btns"><button class="icon-btn sm" data-action="instantSwap" data-i="${i}" aria-label="Trocar">⇄</button><button class="icon-btn sm" data-action="instantRemove" data-i="${i}" aria-label="Remover">✕</button></div>
        </li>`;
      }).join('') || '<li>' + emptyState('Nada encontrado', 'Escolha outros músculos ou equipamentos.') + '</li>'}</ul></div>
      <div class="tech-legend">Dica: toque no exercício para ver a animação e as instruções.</div>
      <button class="btn ghost full" data-action="instantSave">Salvar em Meus treinos</button>
      <button class="btn primary full big" data-action="instantStart" ${data.list.length ? '' : 'disabled'}>Iniciar treino</button>
    </div>`;
  },
  input(el, data, type) {
    if (type !== 'change') return;
    const b = el.dataset.bind;
    S.instant[b] = ['dur', 'level'].includes(b) ? +el.value : el.value;
    save();
    data.list = generateInstant();
    refreshSheet();
  },
};

Object.assign(actions, {
  startPlanned(el) { startPlanned(el.dataset.key, +el.dataset.wd); },
  startFree(el) { startDraft(newDraft({ date: el.dataset.key || UI.selected, title: 'Treino livre', exercises: [] })); },
  openDraft() { if (S.draft) pushSheet('workout'); },
  closeWorkout() {
    const d = S.draft;
    if (d && d.logId) S.draft = null;
    save();
    popSheet();
    if (S.draft) toast('Treino guardado — continue quando quiser');
  },
  discardDraft() {
    if (!confirm('Descartar este treino? As séries marcadas serão perdidas.')) return;
    S.draft = null; save(); stopTimer(); closeAllSheets();
  },
  saveWorkout,
  toggleSet(el) {
    const d = S.draft, i = +el.dataset.ex, ex = d.exercises[i], s = ex.sets[+el.dataset.set];
    s.done = !s.done;
    save();
    refreshSheet();
    if (s.done && !d.logId) {
      unlockAudio();
      const isLastOfEx = ex.sets.every((x) => x.done);
      // super-série: sem descanso entre este exercício e o próximo
      if (ex.tech === 'superserie' && d.exercises[i + 1]) return;
      if (S.settings.autoTimer) startTimer(ex.rest, isLastOfEx ? 'Descanso · próximo exercício' : 'Descanso');
    }
  },
  addSet(el) {
    const ex = S.draft.exercises[+el.dataset.ex], prev = ex.sets[ex.sets.length - 1];
    ex.sets.push({ w: prev ? prev.w : '', r: prev ? prev.r : '', done: false });
    save(); refreshSheet();
  },
  removeSet(el) { const ex = S.draft.exercises[+el.dataset.ex]; if (ex.sets.length > 1) ex.sets.pop(); save(); refreshSheet(); },
  removeEx(el) {
    const ex = S.draft.exercises[+el.dataset.ex];
    if (!confirm(`Remover “${ex.name || 'exercício'}” deste treino?`)) return;
    S.draft.exercises.splice(+el.dataset.ex, 1); save(); refreshSheet();
  },
  moveDraftEx(el) { const a = S.draft.exercises, i = +el.dataset.ex; [a[i - 1], a[i]] = [a[i], a[i - 1]]; save(); refreshSheet(); },
  toggleExNote(el) { const ex = S.draft.exercises[+el.dataset.ex]; ex.showNote = !ex.showNote; refreshSheet(); },
  applySug(el) {
    const ex = S.draft.exercises[+el.dataset.ex];
    ex.sets.forEach((s) => { if (!s.done) s.w = +el.dataset.w; });
    save(); refreshSheet(); toast('Carga sugerida aplicada');
  },
  shareLog(el) {
    const l = S.logs.find((x) => x.id === el.dataset.id);
    const text = shareText(l);
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast('Resumo copiado'));
  },
  openInstant() { pushSheet('instant', {}); },
  instantGroup(el) {
    const g = el.dataset.g, arr = S.instant.groups;
    const i = arr.indexOf(g);
    if (i >= 0) arr.splice(i, 1); else arr.push(g);
    save(); topSheet().data.list = generateInstant(); refreshSheet();
  },
  instantRegen() { topSheet().data.list = generateInstant(); refreshSheet(); },
  instantSwap(el) {
    const data = topSheet().data, i = +el.dataset.i, cur = data.list[i];
    const e = EX_BY_ID[cur.exId];
    const used = new Set(data.list.map((x) => x.exId));
    const gk = cur.g || Object.keys(INSTANT_GROUPS).find((k) => INSTANT_GROUPS[k][1].includes(e ? e.m[0] : ''));
    const cands = gk ? instantCandidates(gk, used) : [];
    if (!cands.length) { toast('Sem outra opção para esse músculo com esses filtros'); return; }
    data.list[i] = Object.assign(instantItem(pickRandom(cands)), { g: gk });
    refreshSheet();
  },
  instantRemove(el) { topSheet().data.list.splice(+el.dataset.i, 1); refreshSheet(); },
  instantStart() { const list = topSheet().data.list; UI.stack = []; drawSheet(); startFromList('Treino Imediato', list); },
  instantSave() {
    const list = topSheet().data.list, wd = new Date().getDay();
    const plan = { id: uid(), name: `Treino Imediato ${fmtDateShort(todayKey())}`, desc: 'Gerado pelo Treino Imediato.', weeks: null, startDate: todayKey(), days: { [wd]: { title: 'Treino Imediato', exercises: list.map((x) => ({ id: uid(), exId: x.exId, name: x.name, sets: x.sets, reps: x.reps, rest: x.rest, tech: '' })) } } };
    S.plans.push(plan); save(); toast('Salvo em Meus treinos');
  },
});
