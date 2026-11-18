'use strict';
/* =========================================================
   Forja — extras: mapa de consistência, alerta de platô/deload,
   cronômetro de intervalos (HIIT) e compartilhar treino por código
   ========================================================= */

/* ---------------- Mapa de consistência (estilo calendário de contribuições) ---------------- */
function consistencyHeatmap() {
  const weeks = 26, tk = todayKey();
  const end = fromKey(tk);
  end.setDate(end.getDate() + (6 - ((end.getDay() + 6) % 7))); // domingo desta semana
  const vol = {};
  S.logs.forEach((l) => { vol[l.date] = (vol[l.date] || 0) + logStats(l).vol + 1; });
  const vals = Object.values(vol).sort((a, b) => a - b);
  const q = (p) => vals.length ? vals[Math.floor((vals.length - 1) * p)] : 0;
  const t1 = q(0.33), t2 = q(0.66);
  let cols = '', days = 0;
  const startK = addDays(toKey(end), -(weeks * 7 - 1));
  for (let w = 0; w < weeks; w++) {
    let cells = '';
    for (let d = 0; d < 7; d++) {
      const k = addDays(startK, w * 7 + d);
      const v = vol[k] || 0;
      const lvl = k > tk ? 'f' : !v ? 0 : v <= t1 ? 1 : v <= t2 ? 2 : 3;
      if (v) days++;
      cells += `<i class="hm l${lvl}" title="${fmtDateShort(k)}"></i>`;
    }
    cols += `<div class="hm-col">${cells}</div>`;
  }
  const months = [];
  for (let w = 0; w < weeks; w += 4) { const d = fromKey(addDays(startK, w * 7)); months.push(MONTHS[d.getMonth()].slice(0, 3)); }
  return `<div class="section-title">Consistência · 6 meses</div><div class="card">
    <div class="hm-wrap"><div class="hm-days"><span>S</span><span></span><span>Q</span><span></span><span>S</span><span></span><span>D</span></div><div class="hm-grid">${cols}</div></div>
    <div class="hm-months">${months.map((m) => `<span>${m}</span>`).join('')}</div>
    <div class="legend center"><span>Menos</span><i class="hm l0"></i><i class="hm l1"></i><i class="hm l2"></i><i class="hm l3"></i><span>Mais</span></div>
    <p class="small muted center">${plural(days, 'dia de treino', 'dias de treino')} nos últimos 6 meses</p></div>`;
}

/* ---------------- Platô e semana leve (deload) ---------------- */
function plateaus() {
  const from = addDays(todayKey(), -42);
  const keys = new Set();
  S.logs.forEach((l) => { if (l.date >= from) l.exercises.forEach((e) => keys.add(exKey(e.name, e.exId))); });
  const out = [];
  keys.forEach((k) => {
    const h = exHistory(k).filter((x) => x.date >= from && x.st.e1rm > 0);
    if (h.length < 4) return;
    const e = findEx(h[0].ex.name, h[0].ex.exId);
    if (e && exGroup(e) === 'cardio') return;
    const last = h.slice(-3), before = h.slice(0, -3);
    const prevBest = Math.max(...before.map((x) => x.st.e1rm));
    const lastBest = Math.max(...last.map((x) => x.st.e1rm));
    if (lastBest <= prevBest * 1.005) out.push({ name: h[0].ex.name, id: h[0].ex.exId, best: prevBest, sessions: h.length });
  });
  return out;
}
function trainingWeeksInRow() {
  let n = 0;
  const now = fromKey(todayKey());
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  for (let i = 1; i < 30; i++) {
    const ws = toKey(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() - 7 * i));
    if (logsBetween(ws, addDays(ws, 6)).length >= 2) n++; else break;
  }
  return n;
}
function deloadInfo() {
  const p = plateaus(), w = trainingWeeksInRow();
  return { p, w, need: p.length >= 2 || w >= 8 };
}
function deloadCard(compact) {
  const d = deloadInfo();
  if (!d.need) return compact ? '' : `<div class="section-title">Progressão</div><div class="card">${emptyState('Tudo progredindo', 'Nenhum platô detectado nas últimas 6 semanas. Continue assim! 📈')}</div>`;
  const list = d.p.slice(0, 4).map((x) => `<li data-action="openExercise" data-id="${x.id || ''}" data-name="${esc(x.name)}">${esc(x.name)} <small>· 1RM parado em ~${fmtNum(x.best, 1)} kg</small></li>`).join('');
  return `${compact ? '' : '<div class="section-title">Progressão</div>'}<div class="card deload-card">
    ${compact ? `<button class="icon-btn sm close-x" data-action="dismiss" data-k="deload-${weekKey()}" aria-label="Fechar">✕</button>` : ''}
    <div class="eyebrow">⚠️ Hora de uma semana leve?</div>
    <h3>${d.p.length >= 2 ? `${d.p.length} exercícios pararam de evoluir` : `${d.w} semanas seguidas de treino`}</h3>
    ${list ? `<ul class="plateau-list">${list}</ul>` : ''}
    <p class="small muted">Uma semana de <b>deload</b> ajuda o corpo a se recuperar e voltar a progredir: mantenha os mesmos exercícios, mas use cerca de 60% da carga e metade das séries. Durma bem e capriche na proteína.</p>
  </div>`;
}
function weekKey() { const d = fromKey(todayKey()); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return toKey(d); }
function deloadBanner() { return S.dismissed['deload-' + weekKey()] ? '' : deloadCard(true); }

/* ---------------- HIIT / intervalos ---------------- */
const HIIT_PRESETS = [
  ['Tabata', 20, 10, 8], ['30/30', 30, 30, 10], ['40/20', 40, 20, 8], ['EMOM 10', 60, 0, 10], ['Sprints', 15, 45, 10],
];
const H = { int: null, run: null };
SHEETS.hiit = {
  render(data) {
    const c = data.cfg;
    const r = H.run;
    if (r) {
      const left = Math.max(0, Math.ceil((r.end - (r.paused || Date.now())) / 1000));
      const label = { prep: 'Prepare-se', work: 'Trabalho', rest: 'Descanso', done: 'Concluído!' }[r.phase];
      return `${sheetHead('Intervalos', { left: 'Parar', leftAction: 'hiitStop' })}
      <div class="sheet-body hiit-run ${r.phase}" id="sheetBody">
        <div class="hiit-round">${r.phase === 'done' ? '🎉' : `Rodada ${r.round} de ${c.rounds}`}</div>
        <div class="hiit-circle"><b id="hiitTime">${r.phase === 'done' ? '✓' : left}</b><span id="hiitLabel">${label}</span></div>
        <div class="hiit-total small muted">Total: ${fmtMin(((c.work + c.rest) * c.rounds) / 60)}</div>
        ${r.phase === 'done' ? '<button class="btn primary full big" data-action="hiitStop">Finalizar</button>' : `<button class="btn primary full big" data-action="hiitPause">${r.paused ? '▶ Continuar' : '❚❚ Pausar'}</button><button class="btn ghost full" data-action="hiitSkip">Pular fase ›</button>`}
      </div>`;
    }
    const num = (k, l, step) => `<div class="hiit-num"><span>${l}</span><div><button class="icon-btn" data-action="hiitAdj" data-k="${k}" data-d="${-step}">−</button><b>${c[k]}${k === 'rounds' ? '' : 's'}</b><button class="icon-btn" data-action="hiitAdj" data-k="${k}" data-d="${step}">+</button></div></div>`;
    return `${sheetHead('HIIT / Intervalos')}
    <div class="sheet-body" id="sheetBody">
      <div class="chip-pick">${HIIT_PRESETS.map(([n, w, rs, ro]) => `<button class="${c.work === w && c.rest === rs && c.rounds === ro ? 'on' : ''}" data-action="hiitPreset" data-w="${w}" data-r="${rs}" data-n="${ro}">${n}</button>`).join('')}</div>
      <div class="card mt">${num('work', 'Trabalho', 5)}${num('rest', 'Descanso', 5)}${num('rounds', 'Rodadas', 1)}</div>
      <p class="small muted center">Duração total: <b>${fmtMin(((c.work + c.rest) * c.rounds + 10) / 60)}</b> · bipes no início e no fim de cada fase</p>
      <p class="small muted hint">Ideias: polichinelo, burpee, corrida na esteira, bicicleta, agachamento com salto, corda.</p>
      <button class="btn primary full big" data-action="hiitStart">Começar</button>
    </div>`;
  },
};
function hiitPhase(phase, dur) { H.run.phase = phase; H.run.end = Date.now() + dur * 1000; beep(); if (S.settings.vibrate && navigator.vibrate) navigator.vibrate(150); }
function hiitTick() {
  const r = H.run, t = topSheet();
  if (!r || !t || t.type !== 'hiit') { clearInterval(H.int); H.int = null; return; }
  if (r.paused || r.phase === 'done') return;
  const left = Math.ceil((r.end - Date.now()) / 1000);
  const el = document.getElementById('hiitTime');
  if (left > 0) { if (el) el.textContent = left; if (left <= 3 && r.lastBeep !== left) { r.lastBeep = left; shortBeep(); } return; }
  hiitNext();
}
function hiitNext() {
  const r = H.run, c = topSheet().data.cfg;
  if (r.phase === 'prep') hiitPhase('work', c.work);
  else if (r.phase === 'work' && c.rest > 0 && r.round < c.rounds) hiitPhase('rest', c.rest);
  else if (r.round < c.rounds) { r.round++; hiitPhase('work', c.work); }
  else { r.phase = 'done'; beep(); setTimeout(beep, 400); }
  refreshSheet();
}
function shortBeep() {
  const ctx = T.audio; if (!ctx || !S.settings.sound) return;
  const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 660; o.connect(g); g.connect(ctx.destination);
  const s = ctx.currentTime; g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(0.25, s + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.12); o.start(s); o.stop(s + 0.14);
}

/* ---------------- Compartilhar treino por código ---------------- */
const b64e = (s) => btoa(unescape(encodeURIComponent(s)));
const b64d = (s) => decodeURIComponent(escape(atob(s)));
function planCode(p) {
  const days = {};
  Object.entries(p.days).forEach(([wd, d]) => { days[wd] = [d.title, d.exercises.map((e) => [e.exId || e.name, e.sets, e.reps, e.rest, e.tech || ''])]; });
  return 'FORJA1:' + b64e(JSON.stringify({ n: p.name, d: p.desc || '', w: p.weeks || null, days }));
}
function planFromCode(text) {
  const m = String(text || '').match(/FORJA1:([A-Za-z0-9+/=]+)/);
  if (!m) throw new Error('Código não encontrado');
  const o = JSON.parse(b64d(m[1]));
  const days = {};
  Object.entries(o.days || {}).forEach(([wd, [title, list]]) => {
    days[wd] = { title, exercises: list.map(([idOrName, sets, reps, rest, tech]) => { const e = exById(idOrName); return { id: uid(), exId: e ? e.id : null, name: e ? e.n : idOrName, sets, reps, rest, tech }; }) };
  });
  return { id: uid(), name: o.n || 'Treino importado', desc: o.d || '', weeks: o.w || null, startDate: todayKey(), days };
}
SHEETS.importPlan = {
  render(data) {
    let preview = '';
    if (data.text) {
      try { const p = planFromCode(data.text); preview = `<div class="card"><b>${esc(p.name)}</b><div class="small muted">${planDays(p).length} dias · ${sum(Object.values(p.days).map((d) => d.exercises.length))} exercícios</div></div>`; data.ok = true; }
      catch (e) { preview = '<p class="small down">Código inválido. Cole a mensagem inteira que você recebeu.</p>'; data.ok = false; }
    }
    return `${sheetHead('Importar treino')}
    <div class="sheet-body" id="sheetBody">
      <p class="muted">Cole a mensagem com o código do treino (começa com <b>FORJA1:</b>) que um amigo te mandou.</p>
      <textarea data-bind="code" rows="5" placeholder="FORJA1:...">${esc(data.text || '')}</textarea>
      <div id="importPreview">${preview}</div>
      <button class="btn primary full big" data-action="doImportPlan">Importar</button>
    </div>`;
  },
  input(el, data, type) { data.text = el.value; if (type === 'change') refreshSheet(); },
};

Object.assign(actions, {
  openHiit() { pushSheet('hiit', { cfg: Object.assign({ work: 20, rest: 10, rounds: 8 }, S.hiit || {}) }); },
  hiitPreset(el) { const c = topSheet().data.cfg; c.work = +el.dataset.w; c.rest = +el.dataset.r; c.rounds = +el.dataset.n; refreshSheet(); },
  hiitAdj(el) { const c = topSheet().data.cfg, k = el.dataset.k; c[k] = Math.max(k === 'rest' ? 0 : k === 'rounds' ? 1 : 5, c[k] + +el.dataset.d); refreshSheet(); },
  hiitStart() {
    unlockAudio();
    S.hiit = Object.assign({}, topSheet().data.cfg); save();
    H.run = { phase: 'prep', round: 1, end: Date.now() + 10000 };
    clearInterval(H.int); H.int = setInterval(hiitTick, 200);
    requestWake();
    refreshSheet();
  },
  hiitPause() {
    const r = H.run;
    if (r.paused) { r.end += Date.now() - r.paused; r.paused = null; } else r.paused = Date.now();
    refreshSheet();
  },
  hiitSkip() { hiitNext(); },
  hiitStop() { clearInterval(H.int); H.int = null; H.run = null; releaseWake(); popSheet(); },
  sharePlan(el) {
    const p = S.plans.find((x) => x.id === el.dataset.id);
    const text = `💪 Treino “${p.name}” na Forja\nPara importar: abra a Forja → Treinos → Importar e cole esta mensagem.\n\n${planCode(p)}`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast('Código copiado'));
  },
  importPlan() { pushSheet('importPlan', {}); },
  doImportPlan() {
    const d = topSheet().data;
    try {
      const p = planFromCode(d.text);
      S.plans.push(p); save();
      UI.tab = 'plans'; UI.plansSeg = 'mine'; closeAllSheets();
      toast(`“${p.name}” importado`);
    } catch (e) { alert('Código inválido. Cole a mensagem inteira que você recebeu.'); }
  },
});
