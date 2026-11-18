'use strict';
/* =========================================================
   Forja — Dieta: metas, diário por refeição, água e IA (Gemini)
   A chave da IA fica salva só no aparelho (nunca no código).
   ========================================================= */
const MEALS = [['cafe', 'Café da manhã', '☕'], ['almoco', 'Almoço', '🍽️'], ['lanche', 'Lanche', '🍎'], ['jantar', 'Jantar', '🌙'], ['ceia', 'Ceia', '🥛']];
const MEAL_NAME = Object.fromEntries(MEALS.map(([k, n]) => [k, n]));
const GEMINI = 'https://generativelanguage.googleapis.com/v1beta';
const GOAL_FACTOR = { emagrecer: 0.8, definicao: 0.88, hipertrofia: 1.1, forca: 1.05, resistencia: 1.0 };

function mealByTime() {
  const h = new Date().getHours() + new Date().getMinutes() / 60;
  return h < 10.5 ? 'cafe' : h < 15 ? 'almoco' : h < 18.5 ? 'lanche' : h < 22 ? 'jantar' : 'ceia';
}
const allFoods = () => FOODS.concat(S.diet.customFoods || []);
const foodById = (id) => FOOD_BY_ID[id] || (S.diet.customFoods || []).find((f) => f.id === id) || null;
function dayData(key, create) {
  let d = S.diet.days[key];
  if (!d && create) { d = S.diet.days[key] = { meals: {}, water: 0 }; }
  if (d) MEALS.forEach(([k]) => { if (!d.meals[k]) d.meals[k] = []; });
  return d || { meals: Object.fromEntries(MEALS.map(([k]) => [k, []])), water: 0 };
}
function scaleItem(per100, g) {
  const k = (g || 0) / 100;
  return { kcal: Math.round(per100.kcal * k), p: +(per100.p * k).toFixed(1), c: +(per100.c * k).toFixed(1), f: +(per100.f * k).toFixed(1) };
}
const per100Of = (food) => ({ kcal: food.kcal, p: food.p, c: food.c, f: food.f });
function dayTotals(key) {
  const d = dayData(key);
  const t = { kcal: 0, p: 0, c: 0, f: 0, n: 0 };
  MEALS.forEach(([k]) => d.meals[k].forEach((it) => { t.kcal += it.kcal; t.p += it.p; t.c += it.c; t.f += it.f; t.n++; }));
  return t;
}

/* Meta automática: Mifflin-St Jeor × atividade × objetivo */
function autoGoals() {
  const w = currentWeight() || 75, h = S.profile.height || 175, a = age() || 30;
  const bmr = 10 * w + 6.25 * h - 5 * a + (S.profile.sex === 'F' ? -161 : 5);
  const days = activePlan() ? planDays(activePlan()).length : 3;
  const factor = Math.min(1.725, 1.2 + 0.075 * days);
  const goal = S.profile.goal || 'hipertrofia';
  const kcal = Math.round((bmr * factor * (GOAL_FACTOR[goal] || 1)) / 10) * 10;
  const p = Math.round(w * (goal === 'emagrecer' || goal === 'definicao' ? 2.2 : 2.0));
  const f = Math.round(w * 0.9);
  const c = Math.max(50, Math.round((kcal - p * 4 - f * 9) / 4));
  return { kcal, p, c, f, water: Math.round((w * 35) / 50) * 50, bmr: Math.round(bmr), tdee: Math.round(bmr * factor), factor, days };
}
function goalsFor(key) {
  const g = S.diet.auto ? autoGoals() : Object.assign({}, S.diet.goal);
  if (S.diet.addTraining) {
    const extra = sum(S.logs.filter((l) => l.date === key).map((l) => logStats(l).kcal));
    if (extra) { g.kcal += extra; g.c += Math.round(extra / 4); g.extra = extra; }
  }
  return g;
}

/* ---------------- Página ---------------- */
PAGES.diet = function () {
  const key = UI.dietDay || todayKey();
  UI.dietDay = key;
  const d = dayData(key), t = dayTotals(key), g = goalsFor(key);
  const left = g.kcal - t.kcal;
  const isToday = key === todayKey(), dt = fromKey(key);
  const bar = (label, v, goal, color) => `<div class="macro"><div class="macro-top"><span>${label}</span><b>${fmtInt(v)}<small>/${fmtInt(goal)} g</small></b></div><div class="progress"><i style="width:${Math.min(100, (v / Math.max(1, goal)) * 100)}%;background:${color}"></i></div></div>`;
  const usage = aiUsageToday();
  let html = `<div class="page-head"><h1>Dieta</h1><button class="btn ghost sm" data-action="openGoals">Metas</button></div>
  <div class="day-nav"><button class="arrow" data-action="dietDay" data-d="-1">‹</button><b>${isToday ? 'Hoje' : DAY_LONG[dt.getDay()]}, ${dt.getDate()} de ${MONTHS[dt.getMonth()].toLowerCase()}</b><button class="arrow" data-action="dietDay" data-d="1" ${isToday ? 'disabled' : ''}>›</button></div>
  <div class="card diet-hero">
    <div class="diet-ring">${ring(t.kcal / Math.max(1, g.kcal), fmtInt(t.kcal), 112, left < 0 ? 'var(--danger)' : null)}<small>de ${fmtInt(g.kcal)} kcal</small></div>
    <div class="diet-side">
      <div class="left-kcal ${left < 0 ? 'down' : ''}"><b>${fmtInt(Math.abs(left))}</b><span>${left < 0 ? 'kcal acima da meta' : 'kcal restantes'}</span></div>
      ${g.extra ? `<div class="small muted">Inclui +${fmtInt(g.extra)} kcal do treino</div>` : ''}
      ${bar('Proteína', t.p, g.p, '#ff7a1a')}${bar('Carboidrato', t.c, g.c, '#3a8dff')}${bar('Gordura', t.f, g.f, '#f5c518')}
    </div>
  </div>
  <div class="ai-actions">
    <button class="ai-btn main" data-action="aiPhoto"><span>📸</span><b>Foto do prato</b><small>IA calcula as calorias</small></button>
    <button class="ai-btn" data-action="aiText"><span>✍️</span><b>Descrever</b><small>“2 ovos e 1 pão”</small></button>
    <button class="ai-btn" data-action="openFood" data-meal="${mealByTime()}"><span>🔍</span><b>Buscar</b><small>${FOODS.length}+ alimentos</small></button>
  </div>
  <div class="small muted center ai-usage">${S.ai.key ? `IA: ${usage}/${S.ai.limit} análises hoje · <button class="link" data-action="openAiSetup">configurar</button>` : '<button class="link" data-action="openAiSetup">Configurar a IA (grátis) para usar a foto do prato</button>'}</div>`;

  // água
  const cups = Math.round(d.water / 250), goalCups = Math.max(1, Math.round(g.water / 250));
  html += `<div class="card water-card">
    <div class="card-head"><div><h3>💧 Água</h3><div class="small muted">${fmtNum(d.water / 1000, 2)} de ${fmtNum(g.water / 1000, 1)} litros</div></div>
    <div class="row-btns"><button class="icon-btn" data-action="water" data-d="-250">−</button><button class="icon-btn accent-btn" data-action="water" data-d="250">+</button></div></div>
    <div class="cups">${Array.from({ length: Math.max(goalCups, cups) }, (_, i) => `<span class="cup ${i < cups ? 'on' : ''}" data-action="waterSet" data-n="${i + 1}"></span>`).join('')}</div>
    <div class="small muted">Cada copo = 250 ml</div>
  </div>`;

  // refeições
  const yesterday = dayData(addDays(key, -1));
  const yN = sum(MEALS.map(([k]) => yesterday.meals[k].length));
  if (!t.n && yN) html += `<button class="btn ghost full" data-action="copyYesterday">↺ Copiar refeições de ontem (${yN} itens)</button>`;
  MEALS.forEach(([k, n, ic]) => {
    const items = d.meals[k];
    const kc = sum(items.map((x) => x.kcal));
    html += `<div class="card meal-card">
      <div class="card-head"><h3>${ic} ${n}</h3><span class="muted small">${kc ? fmtInt(kc) + ' kcal' : ''}</span></div>
      ${items.length ? `<ul class="food-list">${items.map((it) => `<li data-action="editFoodItem" data-meal="${k}" data-id="${it.id}"><div><b>${esc(it.name)}</b><small>${fmtInt(it.g)} g · P ${fmtNum(it.p, 0)} · C ${fmtNum(it.c, 0)} · G ${fmtNum(it.f, 0)}${it.src === 'ia' ? ' · 🤖' : ''}</small></div><span>${fmtInt(it.kcal)}</span></li>`).join('')}</ul>` : ''}
      <div class="row-actions"><button class="link" data-action="openFood" data-meal="${k}">+ Adicionar</button><button class="link muted" data-action="aiPhoto" data-meal="${k}">📸 Foto</button></div>
    </div>`;
  });

  // semana
  const week = [];
  for (let i = 6; i >= 0; i--) { const k = addDays(key, -i); week.push({ label: DAY_SHORT[fromKey(k).getDay()], y: dayTotals(k).kcal, hl: k === key }); }
  const logged = week.filter((w) => w.y > 0);
  const avg = logged.length ? sum(logged.map((w) => w.y)) / logged.length : 0;
  const avgP = logged.length ? sum([...Array(7)].map((_, i) => dayTotals(addDays(key, -i)).p)) / logged.length : 0;
  html += `<div class="section-title">Últimos 7 dias</div><div class="card">${barChart(week)}
    <div class="stat-row"><div><b>${fmtInt(avg)}</b><span>kcal/dia</span></div><div><b>${fmtInt(avgP)} g</b><span>proteína/dia</span></div><div><b>${logged.length}/7</b><span>dias registrados</span></div><div><b>${fmtInt(g.kcal)}</b><span>meta</span></div></div></div>
    <p class="small muted hint">Valores aproximados (tabela TACO e estimativas da IA). Para objetivos clínicos, procure um nutricionista.</p>`;
  return html;
};

/* ---------------- Busca de alimentos ---------------- */
function foodMatches(f, q) {
  if (!q) return true;
  const hay = norm(f.n + ' ' + (f.al || []).join(' '));
  return norm(q).split(' ').every((w) => hay.includes(w));
}
function foodRow(f, data) {
  const fav = (S.diet.favorites || []).includes(f.id);
  return `<li data-action="pickFood" data-id="${f.id}"><div><b>${fav ? '★ ' : ''}${esc(f.n)}</b><small>${fmtInt(f.kcal)} kcal · P ${fmtNum(f.p, 1)} · C ${fmtNum(f.c, 1)} · G ${fmtNum(f.f, 1)} <em>/100 g</em></small></div><span class="chev">›</span></li>`;
}
function foodListHTML(data) {
  const q = data.q || '';
  if (q) {
    const list = allFoods().filter((f) => foodMatches(f, q));
    return list.length ? `<div class="card"><ul class="food-list">${list.map((f) => foodRow(f, data)).join('')}</ul></div>` : `<div class="card">${emptyState('Nada encontrado', 'Crie o alimento com os dados do rótulo, ou use “Descrever” para a IA estimar.')}</div>`;
  }
  let html = '';
  const favs = (S.diet.favorites || []).map(foodById).filter(Boolean);
  if (favs.length) html += `<div class="section-title">Favoritos</div><div class="card"><ul class="food-list">${favs.map((f) => foodRow(f, data)).join('')}</ul></div>`;
  const rec = (S.diet.recent || []).map(foodById).filter(Boolean).filter((f) => !favs.includes(f)).slice(0, 8);
  if (rec.length) html += `<div class="section-title">Recentes</div><div class="card"><ul class="food-list">${rec.map((f) => foodRow(f, data)).join('')}</ul></div>`;
  if ((S.diet.customFoods || []).length) html += `<div class="section-title">Meus alimentos</div><div class="card"><ul class="food-list">${S.diet.customFoods.map((f) => foodRow(f, data)).join('')}</ul></div>`;
  Object.entries(FOOD_CATS).forEach(([c, n]) => {
    const list = FOODS.filter((f) => f.cat === c);
    if (list.length) html += `<div class="section-title">${n}</div><div class="card"><ul class="food-list">${list.map((f) => foodRow(f, data)).join('')}</ul></div>`;
  });
  return html;
}
SHEETS.food = {
  render(data) {
    return `${sheetHead('Adicionar alimento', { sub: MEAL_NAME[data.meal] })}
    <div class="sheet-body" id="sheetBody">
      <div class="search"><span>⌕</span><input data-bind="fq" type="search" placeholder="Buscar: arroz, frango, banana…" value="${esc(data.q || '')}"></div>
      <div class="row-actions"><button class="link" data-action="newCustomFood">+ Criar alimento (do rótulo)</button></div>
      <div id="foodList">${foodListHTML(data)}</div>
    </div>`;
  },
  input(el, data, type) {
    if (el.dataset.bind !== 'fq' || type !== 'input') return;
    data.q = el.value; $('#foodList').innerHTML = foodListHTML(data);
  },
};
SHEETS.foodAmount = {
  render(data) {
    const f = data.food;
    const v = scaleItem(data.per100, data.g);
    const fav = f.id && (S.diet.favorites || []).includes(f.id);
    return `${sheetHead(esc(f.n), { right: f.id ? `<button class="link" data-action="toggleFav" data-id="${f.id}">${fav ? '★' : '☆'}</button>` : '' })}
    <div class="sheet-body" id="sheetBody">
      <div class="amount-hero"><b id="amtKcal">${fmtInt(v.kcal)}</b><span>kcal</span></div>
      <div class="stat-row" id="amtMacros"><div><b>${fmtNum(v.p, 1)} g</b><span>Proteína</span></div><div><b>${fmtNum(v.c, 1)} g</b><span>Carbo</span></div><div><b>${fmtNum(v.f, 1)} g</b><span>Gordura</span></div><div><b>${fmtInt(data.g)} g</b><span>Quantidade</span></div></div>
      <label class="field mt"><span>Quantidade (gramas)</span><input class="big-input" data-bind="ag" inputmode="numeric" value="${esc(data.g)}"></label>
      ${(f.por || []).length ? `<div class="field"><span>Medidas caseiras</span><div class="chip-pick">${f.por.map(([n, g]) => [1, 2, 3].map((q) => `<button data-action="setPortion" data-g="${g * q}">${q > 1 ? q + '× ' : ''}${esc(n)} (${g * q} g)</button>`).join('')).join('')}</div></div>` : ''}
      <div class="field"><span>Refeição</span><div class="chip-pick">${MEALS.map(([k, n]) => `<button class="${data.meal === k ? 'on' : ''}" data-action="setMeal" data-m="${k}">${n}</button>`).join('')}</div></div>
      <button class="btn primary full big" data-action="saveFoodItem">${data.itemId ? 'Salvar' : 'Adicionar'}</button>
      ${data.itemId ? '<button class="btn ghost full danger" data-action="deleteFoodItem">Remover</button>' : ''}
    </div>`;
  },
  input(el, data, type) {
    if (el.dataset.bind !== 'ag' || type !== 'input') return;
    data.g = Math.max(0, parseNum(el.value) || 0);
    const v = scaleItem(data.per100, data.g);
    $('#amtKcal').textContent = fmtInt(v.kcal);
    $('#amtMacros').innerHTML = `<div><b>${fmtNum(v.p, 1)} g</b><span>Proteína</span></div><div><b>${fmtNum(v.c, 1)} g</b><span>Carbo</span></div><div><b>${fmtNum(v.f, 1)} g</b><span>Gordura</span></div><div><b>${fmtInt(data.g)} g</b><span>Quantidade</span></div>`;
  },
};
SHEETS.customFood = {
  render(data) {
    const x = data.f;
    const fld = (k, l) => `<label class="field"><span>${l}</span><input data-bind="cf_${k}" inputmode="decimal" value="${esc(x[k] ?? '')}"></label>`;
    return `${sheetHead('Novo alimento', { right: '<button class="btn primary sm" data-action="saveCustomFood">Salvar</button>' })}
    <div class="sheet-body" id="sheetBody">
      <label class="field"><span>Nome</span><input data-bind="cf_n" value="${esc(x.n)}" placeholder="Ex: Barra de proteína marca X"></label>
      <p class="small muted hint">Copie da tabela nutricional do rótulo. Se o rótulo for por porção, informe o tamanho da porção.</p>
      <label class="field"><span>Tamanho da porção do rótulo (g)</span><input data-bind="cf_por" inputmode="decimal" value="${esc(x.por ?? 100)}"></label>
      <div class="grid2">${fld('kcal', 'Calorias (kcal)')}${fld('p', 'Proteína (g)')}${fld('c', 'Carboidrato (g)')}${fld('f', 'Gordura (g)')}</div>
    </div>`;
  },
  input(el, data) { data.f[el.dataset.bind.slice(3)] = el.dataset.bind === 'cf_n' ? el.value : el.value; },
};

/* ---------------- Metas ---------------- */
SHEETS.goals = {
  render() {
    const a = autoGoals(), g = S.diet.auto ? a : S.diet.goal;
    const missing = !S.profile.height || !S.profile.sex || !S.profile.birth || !currentWeight();
    const fld = (k, l) => `<label class="field"><span>${l}</span><input data-bind="g_${k}" inputmode="numeric" value="${esc(S.diet.goal[k] ?? '')}"></label>`;
    return `${sheetHead('Metas da dieta')}
    <div class="sheet-body" id="sheetBody">
      <div class="card list-card">
        <label class="switch-row"><div><b>Calcular automaticamente</b><small>Pelo seu peso, altura, idade, treino e objetivo</small></div><input type="checkbox" data-bind="g_auto" ${S.diet.auto ? 'checked' : ''}><i></i></label>
        <label class="switch-row"><div><b>Somar calorias do treino</b><small>Nos dias treinados, a meta aumenta</small></div><input type="checkbox" data-bind="g_addTraining" ${S.diet.addTraining ? 'checked' : ''}><i></i></label>
      </div>
      ${S.diet.auto ? `<div class="card">
        <div class="stats-grid two"><div class="stat"><b>${fmtInt(g.kcal)}</b><span>kcal/dia</span></div><div class="stat"><b>${fmtNum(g.water / 1000, 1)} L</b><span>água/dia</span></div>
        <div class="stat"><b>${g.p} g</b><span>proteína</span></div><div class="stat"><b>${g.c} g</b><span>carboidrato</span></div><div class="stat"><b>${g.f} g</b><span>gordura</span></div><div class="stat"><b>${GOALS[S.profile.goal] ? GOALS[S.profile.goal].n : '—'}</b><span>objetivo</span></div></div>
        <p class="small muted">Metabolismo basal ${fmtInt(a.bmr)} kcal (Mifflin-St Jeor) × atividade ${fmtNum(a.factor, 2)} (${a.days} treinos/semana) = gasto de ${fmtInt(a.tdee)} kcal, ajustado para o objetivo. Proteína ${S.profile.goal === 'emagrecer' || S.profile.goal === 'definicao' ? '2,2' : '2,0'} g/kg e gordura 0,9 g/kg.</p>
        ${missing ? '<button class="link" data-action="openProfile">Complete peso, altura, sexo e nascimento para um cálculo preciso</button>' : ''}
      </div>` : `<div class="grid2">${fld('kcal', 'Calorias (kcal)')}${fld('water', 'Água (ml)')}${fld('p', 'Proteína (g)')}${fld('c', 'Carboidrato (g)')}${fld('f', 'Gordura (g)')}</div>`}
    </div>`;
  },
  input(el, data, type) {
    const k = el.dataset.bind.slice(2);
    if (k === 'auto' || k === 'addTraining') { S.diet[k] = el.checked; if (k === 'auto' && !el.checked) S.diet.goal = Object.assign({}, autoGoals()); save(); if (type === 'change') { refreshSheet(); } return; }
    S.diet.goal[k] = parseInt(el.value, 10) || 0; saveSoon();
  },
};

/* ---------------- IA (Gemini) ---------------- */
function aiUsageToday() { return S.ai.usage && S.ai.usage.date === todayKey() ? S.ai.usage.n : 0; }
class AiError extends Error { constructor(code, msg) { super(msg); this.code = code; } }
async function gFetch(path, opts = {}) {
  let res;
  try {
    res = await fetch(GEMINI + path, Object.assign({}, opts, { headers: Object.assign({ 'Content-Type': 'application/json', 'x-goog-api-key': S.ai.key.trim() }, opts.headers || {}) }));
  } catch (e) { throw new AiError('net', 'Sem conexão com a IA. Verifique a internet e tente de novo.'); }
  let body = null;
  try { body = await res.json(); } catch (e) { body = null; }
  if (!res.ok) {
    const msg = (body && body.error && body.error.message) || '';
    if (res.status === 429) throw new AiError('quota', 'O limite gratuito do Google foi atingido por agora. Ele volta sozinho (por minuto ou no dia seguinte) — sem nenhum custo. Enquanto isso, use “Buscar”.');
    if (res.status === 400 && /api key|API_KEY/i.test(msg)) throw new AiError('key', 'Chave inválida. Confira se copiou a chave inteira em Configurar IA.');
    if (res.status === 401 || res.status === 403) throw new AiError('key', 'A chave não tem permissão para usar o Gemini. Verifique a chave no Google AI Studio.');
    if (res.status === 404) throw new AiError('model', msg || 'Modelo não encontrado.');
    throw new AiError('other', `Erro da IA (${res.status}). ${msg}`.trim());
  }
  return body;
}
/* escolhe sozinho o melhor modelo "Flash" disponível na conta (todos têm plano gratuito) */
async function pickModel() {
  const body = await gFetch('/models?pageSize=200', { method: 'GET' });
  const names = (body.models || []).filter((m) => (m.supportedGenerationMethods || []).includes('generateContent')).map((m) => m.name.replace(/^models\//, ''));
  const score = (n) => {
    if (!/flash/.test(n) || /image|tts|audio|live|embed|thinking|computer|robot|8b|exp/.test(n)) return -1;
    const v = parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || '0');
    return v * 10 - (/lite/.test(n) ? 3 : 0) - (/preview/.test(n) ? 1 : 0) + (/latest/.test(n) ? 0.5 : 0);
  };
  const best = names.filter((n) => score(n) >= 0).sort((a, b) => score(b) - score(a))[0];
  S.ai.model = best || 'gemini-flash-latest';
  S.ai.models = names.length;
  save();
  return S.ai.model;
}
async function geminiJSON(parts) {
  if (!S.ai.key) throw new AiError('nokey', 'Configure a IA primeiro.');
  if (aiUsageToday() >= S.ai.limit) throw new AiError('limit', `Você chegou ao limite de ${S.ai.limit} análises por dia que definiu no app. Amanhã zera. (Dá para mudar em Configurar IA.)`);
  const body = { contents: [{ role: 'user', parts }], generationConfig: { temperature: 0.2, responseMimeType: 'application/json' } };
  const call = async (model) => gFetch(`/models/${model}:generateContent`, { method: 'POST', body: JSON.stringify(body) });
  let model = S.ai.model || await pickModel();
  let res;
  try { res = await call(model); } catch (e) {
    if (e.code !== 'model') throw e;
    model = await pickModel(); res = await call(model);
  }
  S.ai.usage = { date: todayKey(), n: aiUsageToday() + 1 };
  save();
  const txt = ((res.candidates || [])[0] || {}).content;
  const raw = txt && txt.parts ? txt.parts.map((p) => p.text || '').join('') : '';
  if (!raw) throw new AiError('empty', 'A IA não respondeu. Tente outra foto.');
  try { return JSON.parse(raw.replace(/^```(?:json)?|```$/g, '').trim()); }
  catch (e) { throw new AiError('parse', 'A resposta da IA veio num formato inesperado. Tente de novo.'); }
}
function foodRefList() { return allFoods().map((f) => `${f.id}|${f.n}`).join('\n'); }
const AI_RULES = `Responda SOMENTE com JSON neste formato:
{"itens":[{"nome":"nome do alimento em português","id":"id da lista ou null","gramas":120,"kcal":150,"proteina":3,"carbo":30,"gordura":1,"confianca":"alta|media|baixa"}],"observacao":"frase curta com dicas ou incertezas"}
Regras: kcal e macros são para a quantidade estimada (não por 100 g). Use o id da lista de referência quando o alimento corresponder (mesmo que aproximado); senão use null. Inclua óleo, manteiga ou molho quando for visível ou típico do preparo. Seja realista com porções brasileiras.
Lista de referência (id|nome):
`;
async function analyzePhoto(dataUrl) {
  const prompt = `Você é um nutricionista. Analise a foto da refeição: identifique cada alimento visível e estime a quantidade em gramas, usando o tamanho do prato (prato raso ≈ 26 cm), talheres, copos e mãos como referência de escala. Se não houver comida na foto, retorne "itens": [] e explique na observação.\n${AI_RULES}${foodRefList()}`;
  return geminiJSON([{ text: prompt }, { inline_data: { mime_type: 'image/jpeg', data: dataUrl.split(',')[1] } }]);
}
async function analyzeText(desc) {
  const prompt = `Você é um nutricionista. A pessoa descreveu o que comeu: "${desc.replace(/"/g, "'")}". Separe em alimentos, estime os gramas de cada um (use medidas caseiras brasileiras quando citadas: colher, concha, fatia, unidade).\n${AI_RULES}${foodRefList()}`;
  return geminiJSON([{ text: prompt }]);
}
function aiToItems(result) {
  return (result.itens || []).map((it) => {
    const g = Math.max(1, Math.min(2000, Math.round(+it.gramas || 100)));
    const food = it.id ? foodById(String(it.id)) : null;
    const per100 = food ? per100Of(food) : { kcal: ((+it.kcal || 0) / g) * 100, p: ((+it.proteina || 0) / g) * 100, c: ((+it.carbo || 0) / g) * 100, f: ((+it.gordura || 0) / g) * 100 };
    return { key: uid(), name: food ? food.n : String(it.nome || 'Alimento'), aiName: it.nome, foodId: food ? food.id : null, g, per100, conf: it.confianca || 'media' };
  });
}

SHEETS.aiMeal = {
  render(data) {
    const head = sheetHead(data.mode === 'text' ? 'Descrever refeição' : 'Foto do prato', { sub: MEAL_NAME[data.meal] });
    if (data.status === 'input') {
      return `${head}<div class="sheet-body" id="sheetBody">
        <label class="field"><span>O que você comeu?</span><textarea data-bind="aidesc" rows="4" placeholder="Ex: 4 colheres de arroz, 1 concha de feijão, 1 filé de frango grelhado e salada">${esc(data.desc || '')}</textarea></label>
        <p class="small muted hint">Quanto mais detalhes (colheres, unidades, gramas), mais precisa fica a estimativa.</p>
        <button class="btn primary full big" data-action="aiRunText">Calcular com IA</button></div>`;
    }
    const img = data.img ? `<img class="ai-img" src="${data.img}" alt="">` : '';
    if (data.status === 'loading') {
      return `${head}<div class="sheet-body" id="sheetBody">${img}<div class="ai-loading"><div class="spinner"></div><b>Analisando a refeição…</b><span class="small muted">Identificando alimentos e estimando as porções</span></div></div>`;
    }
    if (data.status === 'error') {
      return `${head}<div class="sheet-body" id="sheetBody">${img}<div class="card">${emptyState('Não deu certo', esc(data.err), '⚠️')}</div>
        ${data.code === 'key' || data.code === 'nokey' ? '<button class="btn primary full" data-action="openAiSetup">Configurar IA</button>' : `<button class="btn primary full" data-action="${data.mode === 'text' ? 'aiRetryText' : 'aiPhoto'}">Tentar de novo</button>`}
        <button class="btn ghost full" data-action="openFood" data-meal="${data.meal}">Adicionar manualmente</button></div>`;
    }
    const tot = { kcal: 0, p: 0, c: 0, f: 0 };
    data.items.forEach((it) => { const v = scaleItem(it.per100, it.g); tot.kcal += v.kcal; tot.p += v.p; tot.c += v.c; tot.f += v.f; });
    return `${head}<div class="sheet-body" id="sheetBody">${img}
      <div class="card ai-total"><div><b>${fmtInt(tot.kcal)}</b><span>kcal estimadas</span></div><div class="small muted">P ${fmtNum(tot.p, 0)} g · C ${fmtNum(tot.c, 0)} g · G ${fmtNum(tot.f, 0)} g</div></div>
      ${data.obs ? `<div class="smart-box"><div><b>🤖 Observação da IA</b><p>${esc(data.obs)}</p></div></div>` : ''}
      <div class="section-title">Confira e ajuste os gramas</div>
      <div class="card"><ul class="ai-items">${data.items.map((it, i) => {
        const v = scaleItem(it.per100, it.g);
        return `<li><div class="ai-it-top"><div><b>${esc(it.name)}</b><small>${it.foodId ? 'Tabela TACO' : 'Estimativa da IA'} · confiança ${esc(it.conf)}</small></div><button class="icon-btn sm" data-action="aiRemove" data-i="${i}" aria-label="Remover">✕</button></div>
          <div class="ai-it-row"><button class="pill-btn" data-action="aiAdj" data-i="${i}" data-d="-10">−10</button><input data-bind="aig" data-i="${i}" inputmode="numeric" value="${it.g}"><span>g</span><button class="pill-btn" data-action="aiAdj" data-i="${i}" data-d="10">+10</button><b class="ai-kcal" id="aik${i}">${fmtInt(v.kcal)} kcal</b></div></li>`;
      }).join('') || `<li>${emptyState('Nenhum alimento identificado', 'Tente outra foto ou adicione manualmente.')}</li>`}</ul></div>
      <div class="field"><span>Salvar em</span><div class="chip-pick">${MEALS.map(([k, n]) => `<button class="${data.meal === k ? 'on' : ''}" data-action="setMeal" data-m="${k}">${n}</button>`).join('')}</div></div>
      <button class="btn primary full big" data-action="aiSave" ${data.items.length ? '' : 'disabled'}>Salvar na refeição</button>
      <p class="small muted hint">A IA estima pela aparência — pode errar 20–30%. Ajustar os gramas deixa o registro bem mais preciso.</p>
    </div>`;
  },
  input(el, data, type) {
    if (el.dataset.bind === 'aidesc') { data.desc = el.value; return; }
    if (el.dataset.bind === 'aig') {
      const it = data.items[+el.dataset.i]; it.g = Math.max(0, parseNum(el.value) || 0);
      const k = document.getElementById('aik' + el.dataset.i); if (k) k.textContent = `${fmtInt(scaleItem(it.per100, it.g).kcal)} kcal`;
      if (type === 'change') refreshSheet();
    }
  },
};

SHEETS.aiSetup = {
  render(data) {
    const has = !!S.ai.key;
    return `${sheetHead('Configurar IA')}
    <div class="sheet-body" id="sheetBody">
      <div class="card">
        <h3>🤖 Google Gemini (grátis)</h3>
        <p class="small muted">A foto do prato é analisada pela IA do Google. A chave fica salva <b>só neste aparelho</b> — não vai para o GitHub nem para o código do app.</p>
        <label class="field"><span>Chave da API</span><input data-bind="aikey" type="${data.show ? 'text' : 'password'}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Cole aqui a sua chave" value="${esc(data.key != null ? data.key : S.ai.key)}"></label>
        <div class="row-actions"><button class="link" data-action="aiShowKey">${data.show ? 'Ocultar' : 'Mostrar'} chave</button>${has ? '<button class="link danger" data-action="aiRemoveKey">Remover chave</button>' : ''}</div>
        <button class="btn primary full" data-action="aiTest">${data.testing ? 'Testando…' : 'Salvar e testar chave'}</button>
        ${data.result ? `<div class="test-result ${data.ok ? 'ok' : 'bad'}">${data.ok ? '✅' : '⚠️'} ${esc(data.result)}</div>` : ''}
        ${S.ai.model ? `<p class="small muted">Modelo em uso: <b>${esc(S.ai.model)}</b> (escolhido automaticamente)</p>` : ''}
      </div>
      <div class="card list-card">
        <label class="switch-row"><div><b>Limite de análises por dia</b><small>Uma trava extra do app (hoje: ${aiUsageToday()})</small></div><select data-bind="ailimit" class="mini-select">${[5, 10, 20, 30, 50].map((n) => `<option value="${n}" ${S.ai.limit === n ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      </div>
      <div class="section-title">Para nunca pagar nada</div>
      <div class="card free-card">
        <p>✅ <b>Não ative o faturamento (billing)</b> no projeto do Google Cloud ligado a essa chave. Sem faturamento, o Google só permite o plano gratuito: quando o limite acaba, ele apenas recusa os pedidos por um tempo — não existe cobrança.</p>
        <p>✅ O app usa só modelos “Flash”, que têm uso gratuito, e para sozinho no limite diário acima.</p>
        <p>✅ Nunca coloque a chave em arquivos do GitHub. Se ela vazar, gere outra no AI Studio e apague a antiga.</p>
        <p class="small muted">No plano gratuito, o Google pode usar o conteúdo enviado (as fotos de comida) para melhorar os produtos dele.</p>
        <a class="btn ghost full" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Abrir Google AI Studio</a>
      </div>
    </div>`;
  },
  input(el, data, type) {
    if (el.dataset.bind === 'aikey') data.key = el.value.trim();
    if (el.dataset.bind === 'ailimit' && type === 'change') { S.ai.limit = +el.value; save(); }
  },
};

/* ---------------- Ações ---------------- */
async function startPhotoFlow(file, meal) {
  const data = { mode: 'photo', status: 'loading', meal, items: [] };
  try { data.img = await compressImage(file, 1024); } catch (e) { alert('Não consegui abrir essa imagem.'); return; }
  pushSheet('aiMeal', data);
  try {
    const r = await analyzePhoto(data.img);
    data.items = aiToItems(r); data.obs = r.observacao || ''; data.status = 'done';
  } catch (e) { data.status = 'error'; data.err = e.message; data.code = e.code; }
  if (topSheet() && topSheet().data === data) refreshSheet();
}
async function runText(data) {
  if (!(data.desc || '').trim()) { alert('Descreva o que você comeu.'); return; }
  data.status = 'loading'; refreshSheet();
  try {
    const r = await analyzeText(data.desc);
    data.items = aiToItems(r); data.obs = r.observacao || ''; data.status = 'done';
  } catch (e) { data.status = 'error'; data.err = e.message; data.code = e.code; }
  if (topSheet() && topSheet().data === data) refreshSheet();
}
function addItems(dayKey, meal, items) {
  const d = dayData(dayKey, true);
  items.forEach((it) => { d.meals[meal].push(Object.assign({ id: uid() }, it)); if (it.foodId) { S.diet.recent = [it.foodId, ...(S.diet.recent || []).filter((x) => x !== it.foodId)].slice(0, 20); } });
  save();
  celebrate(checkAchievements());
}

Object.assign(actions, {
  dietDay(el) { const k = addDays(UI.dietDay || todayKey(), +el.dataset.d); if (k > todayKey()) return; UI.dietDay = k; render(); },
  openGoals() { pushSheet('goals'); },
  openFood(el) { pushSheet('food', { meal: el.dataset.meal || mealByTime(), day: UI.dietDay || todayKey(), q: '' }); },
  pickFood(el) {
    const f = foodById(el.dataset.id), from = topSheet().data;
    pushSheet('foodAmount', { food: f, per100: per100Of(f), g: (f.por && f.por[0] ? f.por[0][1] : 100), meal: from.meal, day: from.day });
  },
  setPortion(el) { const d = topSheet().data; d.g = +el.dataset.g; refreshSheet(); },
  setMeal(el) { topSheet().data.meal = el.dataset.m; refreshSheet(); },
  toggleFav(el) { const id = el.dataset.id, a = S.diet.favorites || (S.diet.favorites = []); const i = a.indexOf(id); if (i >= 0) a.splice(i, 1); else a.push(id); save(); refreshSheet(); },
  saveFoodItem() {
    const d = topSheet().data;
    if (!d.g) { alert('Informe a quantidade.'); return; }
    const item = Object.assign({ foodId: d.food.id || null, name: d.food.n, g: d.g, src: d.src || 'manual', per100: d.per100 }, scaleItem(d.per100, d.g));
    const day = dayData(d.day, true);
    if (d.itemId) {
      MEALS.forEach(([k]) => { day.meals[k] = day.meals[k].filter((x) => x.id !== d.itemId); });
      day.meals[d.meal].push(Object.assign({ id: d.itemId }, item)); save();
    } else addItems(d.day, d.meal, [item]);
    UI.dietDay = d.day;
    closeAllSheets(); UI.tab = 'diet'; render();
    toast(`${d.food.n} adicionado`);
  },
  editFoodItem(el) {
    const day = dayData(UI.dietDay, true), it = day.meals[el.dataset.meal].find((x) => x.id === el.dataset.id);
    if (!it) return;
    const food = it.foodId ? foodById(it.foodId) : null;
    const per100 = it.per100 || (food ? per100Of(food) : { kcal: (it.kcal / it.g) * 100, p: (it.p / it.g) * 100, c: (it.c / it.g) * 100, f: (it.f / it.g) * 100 });
    pushSheet('foodAmount', { food: food || { n: it.name, por: [] }, per100, g: it.g, meal: el.dataset.meal, day: UI.dietDay, itemId: it.id, src: it.src });
  },
  deleteFoodItem() {
    const d = topSheet().data, day = dayData(d.day, true);
    MEALS.forEach(([k]) => { day.meals[k] = day.meals[k].filter((x) => x.id !== d.itemId); });
    save(); closeAllSheets(); toast('Removido');
  },
  newCustomFood() { pushSheet('customFood', { f: { n: (topSheet() && topSheet().data.q) || '', por: 100 } }); },
  saveCustomFood() {
    const x = topSheet().data.f, por = parseNum(x.por) || 100;
    if (!(x.n || '').trim()) { alert('Dê um nome ao alimento.'); return; }
    const k = 100 / por;
    const f = { id: 'cf_' + uid(), n: x.n.trim(), kcal: (parseNum(x.kcal) || 0) * k, p: (parseNum(x.p) || 0) * k, c: (parseNum(x.c) || 0) * k, f: (parseNum(x.f) || 0) * k, fib: 0, por: por !== 100 ? [['Porção do rótulo', por]] : [], cat: 'meus', al: [] };
    (S.diet.customFoods || (S.diet.customFoods = [])).push(f); save();
    popSheet(); toast('Alimento criado');
  },
  water(el) { const d = dayData(UI.dietDay || todayKey(), true); d.water = Math.max(0, d.water + +el.dataset.d); save(); celebrate(checkAchievements()); render(); },
  waterSet(el) { const d = dayData(UI.dietDay || todayKey(), true); const n = +el.dataset.n; d.water = Math.round(d.water / 250) === n ? (n - 1) * 250 : n * 250; save(); celebrate(checkAchievements()); render(); },
  copyYesterday() {
    const key = UI.dietDay, y = dayData(addDays(key, -1));
    const d = dayData(key, true);
    MEALS.forEach(([k]) => { d.meals[k] = d.meals[k].concat(y.meals[k].map((it) => Object.assign({}, it, { id: uid() }))); });
    save(); render(); toast('Refeições copiadas');
  },
  aiPhoto(el) {
    const meal = (el && el.dataset.meal) || (topSheet() && topSheet().type === 'aiMeal' ? topSheet().data.meal : mealByTime());
    if (!S.ai.key) { pushSheet('aiSetup', {}); toast('Configure a IA primeiro'); return; }
    UI.pendingMeal = meal;
    if (topSheet() && topSheet().type === 'aiMeal') { UI.stack.pop(); drawSheet(true); }
    $('#mealPhoto').click();
  },
  aiText() {
    if (!S.ai.key) { pushSheet('aiSetup', {}); toast('Configure a IA primeiro'); return; }
    pushSheet('aiMeal', { mode: 'text', status: 'input', meal: mealByTime(), items: [] });
  },
  aiRunText() { runText(topSheet().data); },
  aiRetryText() { const d = topSheet().data; d.status = 'input'; refreshSheet(); },
  aiAdj(el) { const it = topSheet().data.items[+el.dataset.i]; it.g = Math.max(0, it.g + +el.dataset.d); refreshSheet(); },
  aiRemove(el) { topSheet().data.items.splice(+el.dataset.i, 1); refreshSheet(); },
  aiSave() {
    const d = topSheet().data, day = UI.dietDay || todayKey();
    const items = d.items.filter((it) => it.g > 0).map((it) => Object.assign({ foodId: it.foodId, name: it.name, g: it.g, src: 'ia', per100: it.per100 }, scaleItem(it.per100, it.g)));
    addItems(day, d.meal, items);
    UI.tab = 'diet'; closeAllSheets();
    toast(`${items.length} ${items.length === 1 ? 'item salvo' : 'itens salvos'} em ${MEAL_NAME[d.meal]}`);
  },
  openAiSetup() { pushSheet('aiSetup', {}); },
  aiShowKey() { const d = topSheet().data; d.show = !d.show; refreshSheet(); },
  aiRemoveKey() { if (!confirm('Remover a chave deste aparelho?')) return; S.ai.key = ''; S.ai.model = ''; save(); topSheet().data = {}; refreshSheet(); },
  async aiTest() {
    const d = topSheet().data;
    const key = (d.key != null ? d.key : S.ai.key || '').trim();
    if (!key) { alert('Cole a chave primeiro.'); return; }
    S.ai.key = key; S.ai.model = ''; save();
    d.testing = true; d.result = ''; refreshSheet();
    try {
      const model = await pickModel();
      d.ok = true; d.result = `Chave funcionando! ${S.ai.models || ''} modelos disponíveis; usando ${model}.`;
    } catch (e) { d.ok = false; d.result = e.message; }
    d.testing = false;
    if (topSheet() && topSheet().data === d) refreshSheet();
  },
});

document.addEventListener('change', (e) => {
  if (e.target.id !== 'mealPhoto') return;
  const f = e.target.files && e.target.files[0];
  e.target.value = '';
  if (f) startPhotoFlow(f, UI.pendingMeal || mealByTime());
});

/* resumo da dieta na tela inicial */
function dietHomeCard() {
  const key = todayKey(), t = dayTotals(key), g = goalsFor(key), w = dayData(key).water;
  return `<button class="card diet-home" data-action="tab" data-tab="diet">
    ${ring(t.kcal / Math.max(1, g.kcal), fmtInt(t.kcal), 58)}
    <div><div class="eyebrow">Dieta de hoje</div><b>${fmtInt(Math.max(0, g.kcal - t.kcal))} kcal restantes</b>
    <div class="small muted">Proteína ${fmtInt(t.p)}/${g.p} g · Água ${fmtNum(w / 1000, 1)}/${fmtNum(g.water / 1000, 1)} L</div></div><span class="chev">›</span></button>`;
}
