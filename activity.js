'use strict';
/* =========================================================
   Forja — aba Atividades (resumo, fadiga, histórico),
   detalhe do treino, ofensiva e conquistas
   ========================================================= */

const FATIGUE = [
  { k: 'fadigado', n: 'Fadigado', c: '#ff4d4d' },
  { k: 'recuperando', n: 'Em recuperação', c: '#f5a623' },
  { k: 'quase', n: 'Quase recuperado', c: '#f5d623' },
  { k: 'ok', n: 'Recuperado', c: '#2ecc71' },
];
function fatigueMap() {
  const now = Date.now(), score = {};
  S.logs.forEach((l) => {
    const t = (l.startedAt || fromKey(l.date).getTime() + 18 * 3600e3) + (l.durationMin || 60) * 60e3;
    const hrs = (now - t) / 3600e3;
    if (hrs < 0 || hrs > 96) return;
    const decay = 1 - hrs / 96;
    l.exercises.forEach((e) => {
      const ex = findEx(e.name, e.exId);
      if (!ex) return;
      ex.m.forEach((m) => { score[m] = (score[m] || 0) + e.sets.length * decay; });
      ex.s.forEach((m) => { score[m] = (score[m] || 0) + e.sets.length * decay * 0.5; });
    });
  });
  const out = {};
  Object.keys(MUSCLES).forEach((m) => {
    const s = score[m] || 0;
    out[m] = s >= 7 ? FATIGUE[0] : s >= 3.5 ? FATIGUE[1] : s > 0.5 ? FATIGUE[2] : FATIGUE[3];
  });
  return out;
}
function prEvents() {
  const best = {}, ev = [];
  [...S.logs].sort((a, b) => a.date.localeCompare(b.date) || (a.savedAt || 0) - (b.savedAt || 0)).forEach((l) => l.exercises.forEach((e) => {
    const k = exKey(e.name, e.exId), st = exStats(e.sets);
    if (!st.maxW) return;
    if (best[k] != null && st.maxW > best[k]) ev.push({ date: l.date, name: e.name, id: e.exId, v: st.maxW, old: best[k] });
    best[k] = Math.max(best[k] || 0, st.maxW);
  }));
  return ev.reverse();
}
function periodTotals(fromK, toK) {
  const logs = logsBetween(fromK, toK);
  const t = { n: logs.length, dur: 0, kcal: 0, sets: 0, reps: 0, vol: 0, ex: new Set() };
  logs.forEach((l) => { const s = logStats(l); t.dur += s.dur; t.kcal += s.kcal; t.sets += s.sets; t.reps += s.reps; t.vol += s.vol; l.exercises.forEach((e) => t.ex.add(exKey(e.name, e.exId))); });
  t.ex = t.ex.size;
  return { t, logs };
}

PAGES.activity = function () {
  let html = `<div class="page-head"><h1>Atividades</h1><button class="btn ghost sm" data-action="exportCsv">Exportar</button></div>`;
  html += seg('actSeg', [['resumo', 'Resumo'], ['historico', 'Histórico']], UI.actSeg);
  html += UI.actSeg === 'historico' ? renderHistoryTab() : renderSummaryTab();
  return html;
};

function renderSummaryTab() {
  const tk = todayKey(), P = UI.period;
  const from = addDays(tk, -(P - 1)), pFrom = addDays(from, -P), pTo = addDays(from, -1);
  const { t, logs } = periodTotals(from, tk);
  const { t: pt } = periodTotals(pFrom, pTo);
  const delta = (a, b) => (!b ? '' : `<em class="${a >= b ? 'up' : 'down'}">${a >= b ? '▲' : '▼'} ${Math.abs(Math.round(((a - b) / b) * 100))}%</em>`);
  let html = '';

  // resumo do mês anterior
  const now = new Date(), pm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const pmKey = `month-${pm.getFullYear()}-${pad(pm.getMonth() + 1)}`;
  const pmLogs = S.logs.filter((l) => l.date.startsWith(`${pm.getFullYear()}-${pad(pm.getMonth() + 1)}`));
  if (pmLogs.length && !S.dismissed[pmKey]) {
    const pmt = periodTotals(toKey(pm), toKey(new Date(now.getFullYear(), now.getMonth(), 0))).t;
    html += `<div class="card month-card"><button class="icon-btn sm close-x" data-action="dismiss" data-k="${pmKey}" aria-label="Fechar">✕</button>
      <div class="eyebrow">Resumo de ${MONTHS[pm.getMonth()]}</div>
      <h3>${plural(pmt.n, 'treino', 'treinos')} · ${fmtKg(pmt.vol)} levantados</h3>
      <div class="small muted">${fmtMin(pmt.dur)} de treino · ${fmtInt(pmt.kcal)} kcal · ${pmt.sets} séries</div></div>`;
  }

  html += `<div class="period-row">${seg('period', [[7, '7 dias'], [14, '14 dias'], [28, '28 dias'], [90, '90 dias']], P)}</div>
  <div class="stats-grid three">
    <div class="stat"><b>${t.n}</b><span>Treinos</span>${delta(t.n, pt.n)}</div>
    <div class="stat"><b>${fmtMin(t.dur)}</b><span>Tempo</span>${delta(t.dur, pt.dur)}</div>
    <div class="stat"><b>${fmtInt(t.kcal)}</b><span>Calorias</span>${delta(t.kcal, pt.kcal)}</div>
    <div class="stat"><b>${t.ex}</b><span>Exercícios</span>${delta(t.ex, pt.ex)}</div>
    <div class="stat"><b>${t.sets}</b><span>Séries</span>${delta(t.sets, pt.sets)}</div>
    <div class="stat"><b>${fmtInt(t.reps)}</b><span>Repetições</span>${delta(t.reps, pt.reps)}</div>
  </div>
  <div class="card"><div class="card-head"><h3>Carga total</h3><b class="accent">${fmtKg(t.vol)}</b></div><div class="small muted">Comparado aos ${P} dias anteriores: ${pt.vol ? delta(t.vol, pt.vol) : 'sem dados'}</div></div>`;

  // frequência semanal
  const weeks = [];
  const monday = (k) => { const d = fromKey(k); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return toKey(d); };
  const cur = monday(tk);
  for (let i = 7; i >= 0; i--) {
    const ws = addDays(cur, -7 * i), we = addDays(ws, 6);
    weeks.push({ label: fmtDateShort(ws), y: logsBetween(ws, we).length, hl: i === 0 });
  }
  html += `<div class="section-title">Frequência semanal</div><div class="card">${barChart(weeks)}<div class="small muted center">Treinos por semana · últimas 8 semanas</div></div>`;

  // fadiga muscular
  const fat = fatigueMap();
  const fcol = Object.fromEntries(Object.entries(fat).map(([m, f]) => [m, f.c]));
  const ready = Object.entries(fat).filter(([m, f]) => f.k === 'ok' && m !== 'cardio').map(([m]) => m);
  const tired = Object.entries(fat).filter(([m, f]) => f.k === 'fadigado' || f.k === 'recuperando').map(([m]) => m);
  html += `<div class="section-title">Fadiga muscular</div><div class="card">
    ${bodyPair(fcol)}
    <div class="legend center wrap">${FATIGUE.map((f) => `<span><i class="lg-dot" style="background:${f.c}"></i>${f.n}</span>`).join('')}</div>
    ${tired.length ? `<p class="small"><b>Descansando:</b> ${muscleNames(tired)}</p>` : ''}
    <p class="small"><b>Prontos para treinar:</b> ${ready.length === Object.keys(MUSCLES).length - 1 ? 'todos' : muscleNames(ready)}</p>
    <p class="small muted">Estimativa pelas séries feitas nas últimas 96 horas.</p>
  </div>`;

  // regiões mais treinadas
  const load = muscleLoad(logs);
  const totalLoad = sum(Object.values(load)) || 1;
  const ranked = Object.entries(load).filter(([m]) => m !== 'cardio').sort((a, b) => b[1] - a[1]);
  const mx = ranked.length ? ranked[0][1] : 1;
  const hcol = Object.fromEntries(ranked.map(([m, v]) => [m, `color-mix(in srgb, var(--accent) ${Math.round(25 + 75 * (v / mx))}%, var(--surface-2))`]));
  const showAll = UI.open === 'regions';
  html += `<div class="section-title">Regiões mais treinadas</div><div class="card">
    ${ranked.length ? `${bodyPair(hcol)}
    <ul class="bars">${(showAll ? ranked : ranked.slice(0, 5)).map(([m, v]) => `<li><span>${MUSCLES[m].n}</span><div><i style="width:${(v / mx) * 100}%"></i></div><b>${Math.round((v / totalLoad) * 100)}%</b></li>`).join('')}</ul>
    ${ranked.length > 5 ? `<button class="link" data-action="toggleOpen" data-k="regions">${showAll ? 'Ver menos' : 'Ver mais'}</button>` : ''}` : emptyState('Sem treinos no período', 'Registre treinos para ver quais regiões você mais trabalha.')}
  </div>`;

  // distribuição por grupo
  const gl = {};
  Object.entries(load).forEach(([m, v]) => { const g = MUSCLES[m].g; gl[g] = (gl[g] || 0) + v; });
  const segs = Object.entries(gl).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([g, v]) => ({ label: GROUPS[g].n, v, c: GROUPS[g].c }));
  html += `<div class="section-title">Tipos de exercício</div><div class="card">${donut(segs, [String(t.sets), 'séries'])}</div>`;

  // recordes recentes
  const prs = prEvents().slice(0, 5);
  html += `<div class="section-title">Recordes recentes</div><div class="card">${prs.length ? prs.map((p) => `<div class="pr-row" data-action="openExercise" data-id="${p.id || ''}" data-name="${esc(p.name)}"><div><b>${esc(p.name)}</b><div class="small muted">${fmtDateLong(p.date)} · antes ${fmtNum(p.old)} kg</div></div><span class="pr-v">${fmtNum(p.v)} kg</span></div>`).join('') : emptyState('Nenhum recorde ainda', 'Quando você superar sua maior carga em um exercício, aparece aqui. 🏆')}</div>`;

  // conquistas
  const got = Object.keys(S.achievements).length;
  html += `<button class="card ach-cta" data-action="openAchievements"><span class="qi">🏆</span><div><b>Conquistas</b><div class="small muted">${got} de ${ACHIEVEMENTS.length} desbloqueadas</div></div><span class="chev">›</span></button>`;
  return html;
}

function renderHistoryTab() {
  const m = UI.histMonth || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  UI.histMonth = m;
  const prefix = `${m.getFullYear()}-${pad(m.getMonth() + 1)}`;
  const sel = UI.histSel || todayKey();
  const logs = sortedLogs().filter((l) => l.date.startsWith(prefix));
  const total = periodTotals(`${prefix}-01`, `${prefix}-31`).t;
  let html = `<div class="card">
    <div class="cal-head"><div class="cal-nav">
      <button class="arrow" data-action="histMonth" data-d="-1">‹</button><h2>${MONTHS[m.getMonth()]} ${m.getFullYear()}</h2><button class="arrow" data-action="histMonth" data-d="1">›</button>
    </div></div>
    ${calendarGrid(m, { selected: sel, action: 'histDay' })}
    <div class="small muted center mt">${plural(total.n, 'treino', 'treinos')} · ${fmtKg(total.vol)} · ${fmtMin(total.dur)}</div>
  </div>
  <button class="btn ghost full" data-action="startFree" data-key="${sel > todayKey() ? todayKey() : sel}">+ Adicionar treino em ${fmtDateShort(sel > todayKey() ? todayKey() : sel)}</button>`;
  if (!logs.length) html += `<div class="card mt">${emptyState('Nenhum treino neste mês', 'Os treinos registrados aparecem aqui.', '🗓️')}</div>`;
  logs.forEach((l) => {
    const st = logStats(l), d = fromKey(l.date);
    const ms = Object.entries(muscleLoad([l])).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
    html += `<div class="card log-card ${l.date === sel ? 'hl' : ''}" data-action="openLog" data-id="${l.id}">
      <div class="log-date"><b>${d.getDate()}</b><span>${DAY_SHORT[d.getDay()]}</span></div>
      <div class="log-info"><div class="t">${esc(l.title)}</div><div class="small muted ellipsis">${ms.length ? muscleNames(ms) : plural(st.ex, 'exercício', 'exercícios')}</div>
      <div class="small">${fmtMin(st.dur)} · ${st.sets} séries · ${fmtKg(st.vol)}</div></div><span class="chev">›</span></div>`;
  });
  return html;
}

/* ---------------- Detalhe do treino ---------------- */
SHEETS.log = {
  render(data) {
    const l = S.logs.find((x) => x.id === data.id);
    if (!l) return sheetHead('Treino');
    const st = logStats(l);
    const planned = sum(l.exercises.map((e) => Math.max(e.planned || 0, e.sets.length)));
    const pct = planned ? Math.min(1, st.sets / planned) : 1;
    const rest = Math.min(st.dur * 60, l.restSec || 0) / 60;
    const prep = l.startedAt ? Math.min(5, st.dur * 0.08) : 0;
    const exec = Math.max(0, st.dur - rest - prep);
    const load = muscleLoad([l]);
    const mx = Math.max(1, ...Object.values(load));
    const colors = Object.fromEntries(Object.entries(load).map(([m, v]) => [m, `color-mix(in srgb, var(--accent) ${Math.round(35 + 65 * (v / mx))}%, transparent)`]));
    return `${sheetHead(esc(l.title), { sub: fmtDateLong(l.date), right: `<button class="link" data-action="editLog" data-id="${l.id}">Editar</button>` })}
    <div class="sheet-body" id="sheetBody">
      <div class="section-title">Resumo</div>
      <div class="card">
        <div class="card-head"><b>Concluído</b><b class="accent">${Math.round(pct * 100)}%</b></div>
        <div class="progress"><i style="width:${pct * 100}%"></i></div>
        <div class="stat-row mt">
          <div><b>${st.ex}</b><span>Exercícios</span></div><div><b>${st.sets}</b><span>Séries</span></div>
          <div><b>${fmtInt(st.reps)}</b><span>Reps</span></div><div><b>${fmtKg(st.vol)}</b><span>Carga</span></div>
        </div>
      </div>
      <div class="section-title">Tempo · ${fmtMin(st.dur)}</div>
      <div class="card">${donut([{ label: 'Em execução', v: exec, c: '#ff7a1a' }, { label: 'Descanso', v: rest, c: '#3a8dff' }, { label: 'Preparação', v: prep, c: '#8c8c8c' }].filter((x) => x.v > 0), [fmtInt(st.kcal), 'kcal'])}</div>
      <div class="section-title">Exercícios</div>
      <div class="card"><ul class="ex-list">${l.exercises.map((e) => `<li class="ex-row" data-action="openExercise" data-id="${e.exId || ''}" data-name="${esc(e.name)}">
        ${exThumb(e.name, e.exId)}<div class="ex-info"><div class="ex-name">${esc(e.name)} ${techBadge(e.tech)}</div><div class="chips">${chips(e.sets)}</div>${e.note ? `<div class="small muted">📝 ${esc(e.note)}</div>` : ''}</div>
        <span class="done-mark sm">✓</span></li>`).join('')}</ul></div>
      ${l.notes ? `<div class="section-title">Observações</div><div class="card"><p class="notes" style="margin:0">${esc(l.notes)}</p></div>` : ''}
      <div class="section-title">Músculos treinados</div>
      <div class="card">${bodyPair(colors)}<p class="small muted center">${muscleNames(Object.keys(load).sort((a, b) => load[b] - load[a]))}</p></div>
      <button class="btn primary full big" data-action="trainAgain" data-id="${l.id}">Treinar novamente</button>
      <div class="row-actions center"><button class="link" data-action="shareLog" data-id="${l.id}">Compartilhar</button><button class="link danger" data-action="deleteLog" data-id="${l.id}">Excluir</button></div>
    </div>`;
  },
};

/* ---------------- Ofensiva ---------------- */
SHEETS.streak = {
  render() {
    const { current, best } = streakInfo();
    const t = tierFor(current), nx = nextTier(current);
    const pct = nx ? Math.round(((current - t.min) / (nx.min - t.min)) * 100) : 100;
    const week = weekStatus().map((w) => {
      const inner = w.st === 'done' ? streakIcon(t.min ? t : TIERS[1], 26, false) : w.st === 'missed' ? '<span class="wk-x">×</span>' : w.st === 'rest' ? '<span class="wk-rest">—</span>' : '';
      return `<div class="wk ${w.st}"><span class="wk-d">${DAY_SHORT[w.wd][0]}</span><div class="wk-c">${inner}</div></div>`;
    }).join('');
    const tiers = TIERS.slice(1).map((x, i) => {
      const nm = TIERS[i + 2] ? TIERS[i + 2].min - 1 : null;
      return `<li class="${x === t ? 'on' : ''}">${streakIcon(x, 30, false)}<span class="tn">Chama ${x.name}</span><span class="muted small">${nm ? `${x.min}–${nm}` : `${x.min}+`} treinos</span></li>`;
    }).join('');
    return `${sheetHead('Ofensiva')}
    <div class="sheet-body" id="sheetBody">
      <div class="streak-hero" style="--c1:${t.c1}">
        ${streakIcon(t, 132, current > 0)}
        <div class="streak-num" style="color:${current ? t.c1 : 'var(--muted)'}">${current}</div>
        <div class="muted">${current === 1 ? 'treino seguido' : 'treinos seguidos'}</div>
        <span class="badge" style="margin-top:10px;color:${t.c1};background:${t.c1}22">Chama ${t.name}</span>
      </div>
      <div class="card">
        ${nx ? `<div class="small"><b>Faltam ${nx.min - current}</b> ${nx.min - current === 1 ? 'treino' : 'treinos'} para a chama <b style="color:${nx.c1}">${nx.name}</b></div>
          <div class="streak-bar"><i style="width:${pct}%;background:linear-gradient(90deg,${t.c1},${nx.c1})"></i></div>` : '<div class="small"><b>Chama máxima!</b> Continue assim.</div>'}
        <div class="stats-grid two mt"><div class="stat"><b>${current}</b><span>Atual</span></div><div class="stat"><b>${best}</b><span>Recorde</span></div></div>
      </div>
      <div class="card"><h3>Esta semana</h3><div class="week-row">${week}</div></div>
      <div class="card"><h3>Cores da chama</h3><ul class="tier-list">${tiers}</ul></div>
      <p class="small muted hint">Cada treino registrado aumenta a ofensiva. Os dias de descanso do seu treino ativo não quebram a sequência — ela só zera se você pular um dia de treino programado.</p>
    </div>`;
  },
};

SHEETS.achievements = {
  render() {
    const got = Object.keys(S.achievements).length;
    return `${sheetHead('Conquistas', { sub: `${got} de ${ACHIEVEMENTS.length}` })}
    <div class="sheet-body" id="sheetBody">
      <div class="progress big"><i style="width:${(got / ACHIEVEMENTS.length) * 100}%"></i></div>
      <div class="ach-grid">${ACHIEVEMENTS.map((a) => {
        const d = S.achievements[a.id];
        return `<div class="ach ${d ? 'on' : ''}"><span>${d ? a.ic : '🔒'}</span><b>${a.n}</b><small>${a.d}</small>${d ? `<em>${fmtDateShort(d)}</em>` : ''}</div>`;
      }).join('')}</div>
    </div>`;
  },
};

function exportCsv() {
  const rows = [['data', 'treino', 'exercicio', 'serie', 'peso_kg', 'reps', 'duracao_min']];
  [...S.logs].sort((a, b) => a.date.localeCompare(b.date)).forEach((l) => l.exercises.forEach((e) => e.sets.forEach((s, i) => rows.push([l.date, l.title, e.name, i + 1, s.w ?? '', s.r ?? '', l.durationMin || '']))));
  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n');
  shareFile(new File(['﻿' + csv], `forja-treinos-${todayKey()}.csv`, { type: 'text/csv' }));
}
async function shareFile(file) {
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: file.name }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(file), a = document.createElement('a');
  a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

Object.assign(actions, {
  openLog(el) { pushSheet('log', { id: el.dataset.id }); },
  editLog(el) { editLog(el.dataset.id); },
  deleteLog(el) {
    if (!confirm('Excluir este treino do histórico?')) return;
    S.logs = S.logs.filter((l) => l.id !== el.dataset.id); save();
    closeAllSheets(); toast('Treino excluído');
  },
  trainAgain(el) {
    const l = S.logs.find((x) => x.id === el.dataset.id);
    UI.stack = []; drawSheet();
    startDraft(newDraft({ date: todayKey(), planId: l.planId, title: l.title, exercises: l.exercises.map((e) => draftExercise(e.name, e.exId, e.sets.length, e.reps || '', e.rest ?? 90, e.tech, todayKey())) }));
  },
  histMonth(el) { const m = UI.histMonth; UI.histMonth = new Date(m.getFullYear(), m.getMonth() + +el.dataset.d, 1); render(); },
  histDay(el) {
    UI.histSel = el.dataset.key;
    const ls = S.logs.filter((l) => l.date === UI.histSel);
    if (ls.length === 1) { pushSheet('log', { id: ls[0].id }); return; }
    render();
  },
  openStreak() { pushSheet('streak'); },
  openAchievements() { pushSheet('achievements'); },
  exportCsv,
});
