'use strict';
/* =========================================================
   Forja — núcleo: utilidades, dados, cálculos, gráficos,
   telas sobrepostas (folhas), cronômetro, eventos
   ========================================================= */
const APP_NAME = 'Forja';
const STORE_KEY = 'treino-app-v1';
const DAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAY_LONG = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const REST_OPTIONS = [0, 30, 45, 60, 75, 90, 120, 150, 180, 240, 300];

/* ---------------- Utilidades ---------------- */
const $ = (s) => document.querySelector(s);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clone = (o) => JSON.parse(JSON.stringify(o));
const pad = (n) => String(n).padStart(2, '0');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = (k) => { const [y, mo, d] = k.split('-').map(Number); return new Date(y, mo - 1, d); };
const todayKey = () => toKey(new Date());
const addDays = (k, n) => { const d = fromKey(k); d.setDate(d.getDate() + n); return toKey(d); };
const daysBetween = (a, b) => Math.round((fromKey(b) - fromKey(a)) / 86400000);
const norm = (s) => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ');
const stripPar = (s) => String(s || '').replace(/\s*\(.*?\)\s*/g, ' ').trim();
const fmtNum = (n, d = 2) => (Math.round((n || 0) * 10 ** d) / 10 ** d).toLocaleString('pt-BR');
const fmtInt = (n) => Math.round(n || 0).toLocaleString('pt-BR');
const fmtKg = (n) => (n >= 10000 ? `${fmtNum(n / 1000, 1)} t` : `${fmtInt(n)} kg`);
const fmtDateShort = (k) => { const d = fromKey(k); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; };
const fmtDateLong = (k) => { const d = fromKey(k); return `${d.getDate()} de ${MONTHS[d.getMonth()].toLowerCase()} de ${d.getFullYear()}`; };
const fmtRest = (s) => (!s ? 'sem descanso' : s >= 60 ? `${Math.floor(s / 60)}:${pad(s % 60)} min` : `${s}s`);
const fmtMin = (m) => (m >= 60 ? `${Math.floor(m / 60)}h${pad(Math.round(m % 60))}` : `${Math.round(m)} min`);
const parseNum = (v) => {
  if (v === '' || v == null) return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return isNaN(n) ? null : n;
};
const sum = (arr) => arr.reduce((a, b) => a + (b || 0), 0);
const plural = (n, s, p) => `${fmtInt(n)} ${n === 1 ? s : p}`;
function repRange(reps) {
  const nums = String(reps || '').match(/\d+/g);
  if (!nums) return { lo: null, hi: null };
  const a = +nums[0], b = nums[1] ? +nums[1] : a;
  return { lo: Math.min(a, b), hi: Math.max(a, b) };
}
const e1rm = (w, r) => (!w || !r ? 0 : r === 1 ? w : w * (1 + r / 30));

/* ---------------- Dados ---------------- */
let S;
const UI = {
  tab: 'home', month: null, selected: null, stack: [], tips: {},
  plansSeg: 'mine', actSeg: 'resumo', bodySeg: 'peso', period: 28,
  exView: 'front', exMuscle: null, exSearch: '', exEquip: '', histMonth: null,
};

function defaults() {
  return {
    version: 2, theme: 'dark', activePlanId: null, plans: [], logs: [], draft: null,
    profile: { name: '', sex: '', birth: '', height: null, goal: 'hipertrofia', level: 2 },
    settings: { restDefault: 90, warmup: true, sound: true, vibrate: true, wakeLock: true, autoTimer: true, remindTime: '18:00', smart: true },
    body: { weights: [], goal: null, measures: [], assess: [] },
    achievements: {}, customExercises: [], dismissed: {}, onboarded: false,
    instant: { dur: 45, equip: 'academia', level: 2, goal: 'hipertrofia', groups: ['peito', 'triceps'] },
    diet: { auto: true, addTraining: false, goal: { kcal: 2200, p: 150, c: 250, f: 70, water: 2500 }, days: {}, favorites: [], recent: [], customFoods: [] },
    ai: { key: '', model: '', usage: { date: '', n: 0 }, limit: 20 },
  };
}

function seedPlan() {
  const p = PROGRAMS.find((x) => x.id === 'p_abc');
  const plan = planFromProgram(p);
  plan.name = 'Abóbora';
  plan.desc = 'Treino de exemplo — edite à vontade.';
  return plan;
}

function load() {
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { raw = null; }
  const d = defaults();
  if (!raw || !Array.isArray(raw.plans)) {
    S = d;
    const plan = seedPlan();
    S.plans.push(plan);
    S.activePlanId = plan.id;
  } else {
    S = Object.assign(d, raw);
    S.profile = Object.assign(d.profile, raw.profile || {});
    S.settings = Object.assign(d.settings, raw.settings || {});
    S.body = Object.assign(d.body, raw.body || {});
    S.instant = Object.assign(d.instant, raw.instant || {});
    S.diet = Object.assign(d.diet, raw.diet || {});
    S.ai = Object.assign(d.ai, raw.ai || {});
    S.version = 2;
    indexExercises();
    // migração da versão 1: completa campos novos
    S.plans.forEach((p) => Object.values(p.days || {}).forEach((day) => day.exercises.forEach((e) => {
      if (!e.exId) { const f = findEx(e.name); if (f) e.exId = f.id; }
      if (e.tech == null) e.tech = '';
    })));
  }
  indexExercises();
  save();
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); }
  catch (e) { toast('Não foi possível salvar (armazenamento cheio?)'); }
}
let saveT = null;
function saveSoon() { clearTimeout(saveT); saveT = setTimeout(save, 300); }

const activePlan = () => S.plans.find((p) => p.id === S.activePlanId) || null;
const planDay = (plan, wd) => {
  const d = plan && plan.days && plan.days[wd];
  return d && d.exercises && d.exercises.length ? d : null;
};
const planDays = (plan) => WEEK_ORDER.filter((wd) => planDay(plan, wd));

function planFromProgram(p) {
  const days = {};
  Object.entries(p.days).forEach(([wd, [title, list]]) => {
    days[wd] = {
      title,
      exercises: list.map(([id, sets, reps, rest, tech]) => ({ id: uid(), exId: id, name: EX_BY_ID[id].n, sets, reps, rest, tech: tech || '' })),
    };
  });
  return { id: uid(), name: p.name, desc: p.desc, weeks: p.weeks || null, startDate: todayKey(), source: p.id, days };
}

/* ---------------- Exercícios ---------------- */
const allExercises = () => EXERCISES.concat(S ? S.customExercises : []);
const EX_NORM = new Map();
function indexExercises() {
  EX_NORM.clear();
  const add = (k, e) => { if (k && !EX_NORM.has(k)) EX_NORM.set(k, e); };
  const list = allExercises();
  list.forEach((e) => add(norm(e.n), e));
  list.forEach((e) => (e.al || []).forEach((a) => add(norm(a), e)));
  list.forEach((e) => add(norm(stripPar(e.n)), e));
  KEY_CACHE.clear();
}
function exById(id) { return EX_BY_ID[id] || (S && S.customExercises.find((e) => e.id === id)) || null; }
EX_LOOKUP = exById;
function findEx(name, id) {
  if (id) { const e = exById(id); if (e) return e; }
  if (!name) return null;
  return EX_NORM.get(norm(name)) || EX_NORM.get(norm(stripPar(name))) || null;
}
const KEY_CACHE = new Map();
/* chave única para histórico: id do exercício da biblioteca, ou o nome normalizado */
function exKey(name, id) {
  const ck = (id || '') + '|' + name;
  if (KEY_CACHE.has(ck)) return KEY_CACHE.get(ck);
  const e = findEx(name, id);
  const k = e ? e.id : 'n:' + norm(name);
  KEY_CACHE.set(ck, k);
  return k;
}
const exMuscles = (name, id) => { const e = findEx(name, id); return e ? e.m : []; };
const muscleNames = (arr) => arr.map((m) => MUSCLES[m] ? MUSCLES[m].n : m).join(', ');
const exGroup = (e) => (e && e.m[0] && MUSCLES[e.m[0]] ? MUSCLES[e.m[0]].g : null);

/* ---------------- Estatísticas ---------------- */
function exStats(sets) {
  let maxW = 0, best = 0, vol = 0, reps = 0, maxR = 0;
  sets.forEach((s) => {
    const w = s.w || 0, r = s.r || 0;
    maxW = Math.max(maxW, w); best = Math.max(best, e1rm(w, r));
    vol += w * r; reps += r; maxR = Math.max(maxR, r);
  });
  return { maxW, e1rm: best, vol, reps, maxR, sets: sets.length };
}
function logStats(l) {
  let sets = 0, vol = 0, reps = 0;
  l.exercises.forEach((e) => e.sets.forEach((s) => { sets++; vol += (s.w || 0) * (s.r || 0); reps += s.r || 0; }));
  const dur = l.durationMin || Math.max(10, Math.round(sets * 2.6));
  return { sets, vol, reps, ex: l.exercises.length, dur, kcal: kcalFor(l, dur) };
}
function currentWeight() {
  const w = [...S.body.weights].sort((a, b) => a.date.localeCompare(b.date)).pop();
  return w ? w.kg : null;
}
function kcalFor(l, dur) {
  const kg = currentWeight() || 75;
  const cardioShare = l.exercises.filter((e) => exGroup(findEx(e.name, e.exId)) === 'cardio').length / Math.max(1, l.exercises.length);
  const met = 5 + 3 * cardioShare;
  return Math.round(met * kg * (dur / 60));
}
/* todas as sessões de um exercício, em ordem */
function exHistory(key) {
  const out = [];
  S.logs.forEach((l) => l.exercises.forEach((e) => {
    if (exKey(e.name, e.exId) === key && e.sets.length) out.push({ date: l.date, log: l, ex: e, st: exStats(e.sets) });
  }));
  return out.sort((a, b) => a.date.localeCompare(b.date) || (a.log.savedAt || 0) - (b.log.savedAt || 0));
}
function lastPerf(key, upToKey, excludeLogId) {
  let best = null;
  for (const l of S.logs) {
    if (l.id === excludeLogId || (upToKey && l.date > upToKey)) continue;
    const e = l.exercises.find((x) => exKey(x.name, x.exId) === key);
    if (!e || !e.sets.length) continue;
    if (!best || l.date > best.date || (l.date === best.date && (l.savedAt || 0) > (best.savedAt || 0))) best = { date: l.date, savedAt: l.savedAt, sets: e.sets, ex: e };
  }
  return best;
}
function bestsFor(key, excludeLogId) {
  const b = { maxW: null, e1rm: null, vol: null, maxR: null };
  exHistory(key).forEach((h) => {
    if (h.log.id === excludeLogId) return;
    ['maxW', 'e1rm', 'vol', 'maxR'].forEach((k) => { if (h.st[k] > 0 && (!b[k] || h.st[k] > b[k].v)) b[k] = { v: h.st[k], date: h.date }; });
  });
  return b;
}
/* carga muscular (séries) por músculo num conjunto de treinos */
function muscleLoad(logs) {
  const load = {};
  logs.forEach((l) => l.exercises.forEach((e) => {
    const ex = findEx(e.name, e.exId);
    if (!ex) return;
    const n = e.sets.length;
    ex.m.forEach((m) => { load[m] = (load[m] || 0) + n; });
    ex.s.forEach((m) => { load[m] = (load[m] || 0) + n * 0.5; });
  }));
  return load;
}
const logsBetween = (fromK, toK) => S.logs.filter((l) => l.date >= fromK && l.date <= toK);
const sortedLogs = () => [...S.logs].sort((a, b) => b.date.localeCompare(a.date) || (b.savedAt || 0) - (a.savedAt || 0));
function age() {
  if (!S.profile.birth) return null;
  const b = new Date(S.profile.birth), n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--;
  return a;
}

/* ---------------- Ofensiva ---------------- */
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
    <g class="db">${DUMBBELL}</g></svg>`;
}
function streakInfo() {
  if (!S.logs.length) return { current: 0, best: 0 };
  const done = new Set(S.logs.map((l) => l.date));
  const plan = activePlan();
  const usePlan = plan && planDays(plan).length;
  const tk = todayKey();
  const first = S.logs.reduce((mn, l) => (l.date < mn ? l.date : mn), tk);
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
function weekStatus(refKey) {
  const plan = activePlan();
  const done = new Set(S.logs.map((l) => l.date));
  const tk = todayKey(), now = fromKey(refKey || tk);
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  return WEEK_ORDER.map((wd, i) => {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const key = toKey(d), planned = !!planDay(plan, wd);
    let st = 'rest';
    if (done.has(key)) st = 'done';
    else if (key === tk) st = planned ? 'today' : 'rest';
    else if (key > tk) st = planned ? 'planned' : 'rest';
    else st = planned ? 'missed' : 'rest';
    return { wd, key, st, planned, date: d };
  });
}
function renderStreakPill() {
  const { current } = streakInfo();
  const t = tierFor(current);
  $('#streakBtn').innerHTML = `${streakIcon(t, 26, false)}<b style="color:${current ? t.c1 : 'var(--muted)'}">${current}</b>`;
}

/* ---------------- Conquistas ---------------- */
function checkAchievements(ctx = {}) {
  const has = (id) => S.achievements[id];
  const got = [];
  const give = (id) => { if (!has(id)) { S.achievements[id] = todayKey(); got.push(ACHIEVEMENTS.find((a) => a.id === id)); } };
  const n = S.logs.length;
  [[1, 'first'], [5, 'w5'], [10, 'w10'], [25, 'w25'], [50, 'w50'], [100, 'w100'], [250, 'w250']].forEach(([k, id]) => { if (n >= k) give(id); });
  const st = streakInfo();
  [[7, 's7'], [20, 's20'], [50, 's50']].forEach(([k, id]) => { if (st.best >= k) give(id); });
  let total = 0, maxSession = 0;
  const kinds = new Set();
  S.logs.forEach((l) => { const s = logStats(l); total += s.vol; maxSession = Math.max(maxSession, s.vol); l.exercises.forEach((e) => kinds.add(exKey(e.name, e.exId))); });
  if (maxSession >= 1000) give('ton1');
  if (maxSession >= 5000) give('ton5');
  if (total >= 100000) give('tot100');
  if (kinds.size >= 30) give('variety');
  const prs = S.prCount || 0;
  if (prs >= 1) give('pr1');
  if (prs >= 25) give('pr25');
  if (ctx.startHour != null && ctx.startHour < 7) give('early');
  if (ctx.startHour != null && ctx.startHour >= 21) give('night');
  const ws = weekStatus();
  if (ws.some((w) => w.planned) && ws.filter((w) => w.planned).every((w) => w.st === 'done')) give('week');
  if (S.body.weights.length || S.body.measures.length) give('body');
  if (ctx.photo) give('photo');
  const ddays = Object.values((S.diet && S.diet.days) || {});
  if (ddays.some((dd) => Object.values(dd.meals || {}).some((m) => m.length))) give('meal1');
  if (typeof goalsFor === 'function' && Object.entries((S.diet && S.diet.days) || {}).some(([k, dd]) => dd.water && dd.water >= goalsFor(k).water)) give('water');
  if (got.length) save();
  return got;
}

/* ---------------- Gráficos (SVG próprios) ---------------- */
function lineChart(id, pts, o = {}) {
  if (!pts.length) return `<div class="chart-empty">${o.empty || 'Sem dados para esse período'}</div>`;
  const W = 340, H = o.h || 190, pl = 40, pr = 14, pt = 14, pb = 26;
  const ys = pts.map((p) => p.y).concat(o.goal != null ? [o.goal] : []);
  let mn = Math.min(...ys), mx = Math.max(...ys);
  if (mn === mx) { mn = Math.max(0, mn - 5); mx = mx + 5; }
  const padY = (mx - mn) * 0.15;
  mn = Math.max(0, mn - padY); mx += padY;
  const n = pts.length;
  const X = (i) => (n === 1 ? pl + (W - pl - pr) / 2 : pl + (i * (W - pl - pr)) / (n - 1));
  const Y = (v) => pt + (H - pt - pb) * (1 - (v - mn) / (mx - mn));
  let tip = UI.tips[id];
  if (tip == null || tip >= n) tip = n - 1;
  let g = '';
  for (let i = 0; i <= 3; i++) {
    const v = mn + ((mx - mn) * i) / 3, y = Y(v);
    g += `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}"/><text class="axis" x="${pl - 6}" y="${y + 3}" text-anchor="end">${fmtNum(v, v < 10 ? 1 : 0)}</text>`;
  }
  const li = n <= 1 ? [0] : n === 2 ? [0, 1] : [0, Math.floor((n - 1) / 2), n - 1];
  const xl = [...new Set(li)].map((i) => `<text class="axis" x="${X(i)}" y="${H - 6}" text-anchor="middle">${esc(pts[i].label)}</text>`).join('');
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ');
  const area = `${line} L${X(n - 1).toFixed(1)},${H - pb} L${X(0).toFixed(1)},${H - pb} Z`;
  const avg = sum(pts.map((p) => p.y)) / n;
  const extra = (o.avg && n > 1 ? `<line class="avg" x1="${pl}" x2="${W - pr}" y1="${Y(avg)}" y2="${Y(avg)}"/>` : '')
    + (o.goal != null ? `<line class="goal" x1="${pl}" x2="${W - pr}" y1="${Y(o.goal)}" y2="${Y(o.goal)}"/>` : '');
  const dots = pts.map((p, i) => `<circle class="pt ${i === tip ? 'on' : ''}" cx="${X(i)}" cy="${Y(p.y)}" r="${i === tip ? 5.5 : 3.5}"/>
    <circle class="hit" cx="${X(i)}" cy="${Y(p.y)}" r="15" data-action="chartTip" data-chart="${id}" data-i="${i}"/>`).join('');
  const u = o.unit || '';
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">
    <defs><linearGradient id="fade${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ff7a1a" stop-opacity=".28"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></linearGradient></defs>
    ${g}${n > 1 ? `<path d="${area}" fill="url(#fade${id})"/>` : ''}${extra}<path class="line" d="${line}"/>${xl}${dots}</svg>
    <div class="tip">${esc(pts[tip].full || pts[tip].label)} · <b>${fmtNum(pts[tip].y, 1)} ${u}</b></div>
    ${o.avg && n > 1 ? `<div class="legend"><span><i class="lg-line"></i>${esc(o.label || 'Valor')}</span><span><i class="lg-avg"></i>Média: ${fmtNum(avg, 1)} ${u}</span>${o.goal != null ? `<span><i class="lg-goal"></i>Meta: ${fmtNum(o.goal, 1)} ${u}</span>` : ''}</div>` : ''}`;
}
function barChart(pts, o = {}) {
  const W = 340, H = o.h || 150, pl = 6, pr = 6, pt = 18, pb = 22;
  const mx = Math.max(1, ...pts.map((p) => p.y));
  const n = pts.length, bw = (W - pl - pr) / n;
  let s = '';
  pts.forEach((p, i) => {
    const h = ((H - pt - pb) * p.y) / mx, x = pl + i * bw + bw * 0.18, y = H - pb - h;
    s += `<rect class="bar ${p.hl ? 'on' : ''}" x="${x}" y="${y}" width="${bw * 0.64}" height="${Math.max(h, p.y ? 2 : 0)}" rx="4"/>`;
    if (p.y) s += `<text class="axis" x="${x + bw * 0.32}" y="${y - 4}" text-anchor="middle">${esc(p.v != null ? p.v : fmtNum(p.y, 0))}</text>`;
    s += `<text class="axis" x="${x + bw * 0.32}" y="${H - 6}" text-anchor="middle">${esc(p.label)}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">${s}</svg>`;
}
function donut(segs, center) {
  const total = sum(segs.map((s) => s.v));
  if (!total) return '<div class="chart-empty">Sem dados para esse período</div>';
  const R = 42, C = 2 * Math.PI * R;
  let off = 0, arcs = '';
  segs.forEach((s) => {
    const len = (s.v / total) * C;
    arcs += `<circle cx="60" cy="60" r="${R}" fill="none" stroke="${s.c}" stroke-width="16" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-off}" transform="rotate(-90 60 60)"/>`;
    off += len;
  });
  const legend = segs.map((s) => `<li><i style="background:${s.c}"></i><span>${esc(s.label)}</span><b>${Math.round((s.v / total) * 100)}%</b></li>`).join('');
  return `<div class="donut-wrap"><svg viewBox="0 0 120 120" class="donut">${arcs}<text x="60" y="58" text-anchor="middle" class="donut-n">${esc(center ? center[0] : '')}</text><text x="60" y="72" text-anchor="middle" class="donut-l">${esc(center ? center[1] : '')}</text></svg><ul class="donut-legend">${legend}</ul></div>`;
}
function ring(pct, label, size = 64, color) {
  const R = 26, C = 2 * Math.PI * R, len = Math.max(0, Math.min(1, pct)) * C;
  return `<svg class="ring" viewBox="0 0 64 64" width="${size}" height="${size}"><circle cx="32" cy="32" r="${R}" class="ring-bg"/><circle cx="32" cy="32" r="${R}" class="ring-fg" style="${color ? `stroke:${color}` : ''}" stroke-dasharray="${len} ${C}" transform="rotate(-90 32 32)"/><text x="32" y="36" text-anchor="middle">${esc(label)}</text></svg>`;
}

/* ---------------- Componentes ---------------- */
const seg = (name, options, cur) => `<div class="seg">${options.map(([v, l]) => `<button class="${String(cur) === String(v) ? 'on' : ''}" data-action="seg" data-name="${name}" data-v="${v}">${l}</button>`).join('')}</div>`;
const chips = (sets) => sets.map((s) => `<span class="chip">${s.w != null ? fmtNum(s.w) + ' kg' : '—'} × ${s.r != null ? fmtNum(s.r) : '—'}</span>`).join('');
const muscleTag = (m) => (MUSCLES[m] ? `<span class="mtag" style="--tc:${GROUPS[MUSCLES[m].g].c}">${MUSCLES[m].n}</span>` : '');
const emptyState = (title, text, icon = '') => `<div class="empty">${icon ? `<div class="empty-ic">${icon}</div>` : ''}<b>${title}</b>${text}</div>`;
function exThumb(name, id, size = 'sm') {
  const e = findEx(name, id);
  if (e) return `<div class="thumb ${size}"${window.Fig3D && Fig3D.ok ? ` data-snap3d="${e.id}|0.55|0|150"` : ''}>${figureSVG(e, { t: 0.55 })}</div>`;
  return `<div class="thumb ${size} letter">${esc((name || '?').trim()[0] || '?').toUpperCase()}</div>`;
}
const techBadge = (t) => (t && TECHNIQUES[t] ? `<span class="tech" title="${TECHNIQUES[t].n}">${TECHNIQUES[t].s}</span>` : '');
function sheetHead(title, o = {}) {
  return `<div class="sheet-head">
    <button class="link" data-action="${o.leftAction || 'back'}">${o.left || (UI.stack.length > 1 ? '‹ Voltar' : 'Fechar')}</button>
    <div class="sheet-title"><b>${title}</b>${o.sub ? `<small>${o.sub}</small>` : ''}</div>
    ${o.right || '<span style="width:56px"></span>'}
  </div>`;
}
const restSelect = (bind, cur, extra = '') => {
  const opts = REST_OPTIONS.includes(cur) ? REST_OPTIONS : [...REST_OPTIONS, cur].sort((a, b) => a - b);
  return `<select data-bind="${bind}" ${extra}>${opts.map((s) => `<option value="${s}" ${s === cur ? 'selected' : ''}>${s ? fmtRest(s) : 'Sem'}</option>`).join('')}</select>`;
};

/* ---------------- Páginas e folhas ---------------- */
const PAGES = {};   // abas: home, plans, exercises, activity, body
const SHEETS = {};  // telas sobrepostas: { render(data), input(el, data, type) }
const actions = {};

function render() {
  renderStreakPill();
  const v = $('#view');
  v.innerHTML = (PAGES[UI.tab] || PAGES.home)();
  document.querySelectorAll('.tabbar button').forEach((b) => b.classList.toggle('on', b.dataset.tab === UI.tab));
  startFigures();
  if (window.Fig3D) Fig3D.fillSnaps();
}
function topSheet() { return UI.stack[UI.stack.length - 1]; }
function drawSheet(keepScroll) {
  const sh = $('#sheet');
  const top = topSheet();
  if (!top) {
    sh.hidden = true; sh.innerHTML = ''; document.body.classList.remove('locked');
    releaseWake();
    return;
  }
  const html = SHEETS[top.type].render(top.data);
  sh.innerHTML = html;
  sh.dataset.type = top.type;
  sh.hidden = false;
  document.body.classList.add('locked');
  const body = $('#sheetBody');
  if (body) body.scrollTop = keepScroll ? top.scroll || 0 : 0;
  if (SHEETS[top.type].after) SHEETS[top.type].after(top.data);
  startFigures();
  if (window.Fig3D) Fig3D.fillSnaps();
  if (top.type === 'workout') requestWake(); else if (!UI.stack.some((x) => x.type === 'workout')) releaseWake();
}
function saveScroll() { const t = topSheet(), b = $('#sheetBody'); if (t && b) t.scroll = b.scrollTop; }
function pushSheet(type, data = {}) { saveScroll(); UI.stack.push({ type, data, scroll: 0 }); drawSheet(false); }
function replaceSheet(type, data = {}) { UI.stack.pop(); UI.stack.push({ type, data, scroll: 0 }); drawSheet(false); }
function refreshSheet() { saveScroll(); drawSheet(true); }
function popSheet() {
  UI.stack.pop();
  drawSheet(true);
  if (!UI.stack.length) render();
}
function closeAllSheets() { UI.stack = []; drawSheet(); render(); }

function applyTheme() {
  let t = S.theme;
  if (t === 'auto') t = window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  document.documentElement.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]').setAttribute('content', t === 'dark' ? '#0a0a0a' : '#ffffff');
}

/* ---------------- Cronômetro de descanso ---------------- */
const T = { end: 0, total: 0, int: null, fired: false, audio: null, hideT: null, started: 0 };
function unlockAudio() {
  try {
    if (!T.audio) { const C = window.AudioContext || window.webkitAudioContext; if (C) T.audio = new C(); }
    if (T.audio && T.audio.state === 'suspended') T.audio.resume();
  } catch (e) { /* sem som */ }
}
function beep() {
  const ctx = T.audio;
  if (!ctx || !S.settings.sound) return;
  [0, 0.28, 0.56].forEach((t) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
    const s = ctx.currentTime + t;
    g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(0.35, s + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.2);
    o.start(s); o.stop(s + 0.22);
  });
}
function startTimer(sec, label) {
  if (!sec) return;
  clearTimeout(T.hideT);
  addRestTime();
  T.total = sec; T.end = Date.now() + sec * 1000; T.fired = false; T.started = Date.now();
  const el = $('#timer');
  el.classList.remove('finished');
  $('#timerLabel').textContent = label || 'Descanso';
  el.hidden = false;
  clearInterval(T.int); T.int = setInterval(tick, 250); tick();
}
function addRestTime() {
  if (T.started && S.draft) { S.draft.restSec = (S.draft.restSec || 0) + Math.round((Math.min(Date.now(), T.end) - T.started) / 1000); }
  T.started = 0;
}
function tick() {
  const left = Math.max(0, Math.ceil((T.end - Date.now()) / 1000));
  $('#timerTime').textContent = `${Math.floor(left / 60)}:${pad(left % 60)}`;
  $('#timerFill').style.width = `${T.total ? (left / T.total) * 100 : 0}%`;
  if (left <= 0 && !T.fired) {
    T.fired = true; clearInterval(T.int); addRestTime();
    beep();
    if (S.settings.vibrate && navigator.vibrate) navigator.vibrate([200, 100, 200]);
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
function stopTimer() { addRestTime(); clearInterval(T.int); clearTimeout(T.hideT); $('#timer').hidden = true; }

/* Manter a tela ligada durante o treino */
let wakeLock = null;
async function requestWake() {
  if (!S.settings.wakeLock || wakeLock || !('wakeLock' in navigator)) return;
  try { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); } catch (e) { wakeLock = null; }
}
function releaseWake() { if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; } }

/* ---------------- Fotos (IndexedDB) ---------------- */
const PhotoDB = {
  db: null,
  open() {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((res, rej) => {
      const r = indexedDB.open('forja-fotos', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('photos', { keyPath: 'id' });
      r.onsuccess = () => { this.db = r.result; res(this.db); };
      r.onerror = () => rej(r.error);
    });
  },
  async tx(mode, fn) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const t = db.transaction('photos', mode), st = t.objectStore('photos');
      const out = fn(st);
      t.oncomplete = () => res(out && out.result !== undefined ? out.result : out);
      t.onerror = () => rej(t.error);
    });
  },
  all() { return this.tx('readonly', (st) => st.getAll()); },
  put(p) { return this.tx('readwrite', (st) => st.put(p)); },
  del(id) { return this.tx('readwrite', (st) => st.delete(id)); },
  clear() { return this.tx('readwrite', (st) => st.clear()); },
};

/* ---------------- Aviso rápido ---------------- */
let toastT = null;
function toast(msg, ms = 2400) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), ms);
}
function celebrate(list) {
  if (!list || !list.length) return;
  const a = list[0];
  toast(`${a.ic} Conquista: ${a.n}${list.length > 1 ? ` (+${list.length - 1})` : ''}`, 3500);
}

/* ---------------- Ações globais ---------------- */
Object.assign(actions, {
  tab(el) { UI.tab = el.dataset.tab; closeAllSheets(); window.scrollTo(0, 0); },
  back() { popSheet(); },
  closeAll() { closeAllSheets(); },
  seg(el) {
    const n = el.dataset.name, v = el.dataset.v;
    if (n === 'period') UI.period = +v;
    else if (n.startsWith('sheet:')) { const t = topSheet(); t.data[n.slice(6)] = v; UI.tips = {}; refreshSheet(); return; }
    else UI[n] = v;
    UI.tips = {};
    render();
  },
  toggleTheme() {
    S.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(); save();
  },
  chartTip(el) { UI.tips[el.dataset.chart] = +el.dataset.i; if (topSheet()) refreshSheet(); else render(); },
  timerAdj(el) { adjustTimer(+el.dataset.d); },
  timerStop() { stopTimer(); },
  dismiss(el) { S.dismissed[el.dataset.k] = true; save(); render(); },
  toggleOpen(el) { const k = el.dataset.k; UI.open = UI.open === k ? null : k; if (topSheet()) refreshSheet(); else render(); },
});

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const fn = actions[el.dataset.action];
  if (fn) { e.preventDefault(); fn(el, e); }
});
function onBind(e) {
  const el = e.target;
  if (!el.dataset || !el.dataset.bind) return;
  const top = topSheet();
  if (top && el.closest('#sheet')) {
    const h = SHEETS[top.type].input;
    if (h) h(el, top.data, e.type);
  } else {
    const h = PAGE_INPUT[UI.tab];
    if (h) h(el, e.type);
  }
}
const PAGE_INPUT = {};
document.addEventListener('input', onBind);
document.addEventListener('change', onBind);
