'use strict';
/* =========================================================
   Forja — perfil, configurações, ferramentas, boas-vindas e início
   ========================================================= */

function profileFields(p) {
  return `<label class="field"><span>Nome</span><input data-bind="p_name" value="${esc(p.name)}" placeholder="Como quer ser chamado?"></label>
  <div class="grid2">
    <label class="field"><span>Sexo</span><select data-bind="p_sex"><option value="">—</option><option value="M" ${p.sex === 'M' ? 'selected' : ''}>Masculino</option><option value="F" ${p.sex === 'F' ? 'selected' : ''}>Feminino</option></select></label>
    <label class="field"><span>Nascimento</span><input type="date" data-bind="p_birth" value="${esc(p.birth)}"></label>
    <label class="field"><span>Altura (cm)</span><input data-bind="p_height" inputmode="numeric" value="${esc(p.height || '')}" placeholder="175"></label>
    <label class="field"><span>Nível</span><select data-bind="p_level">${Object.entries(LEVELS).map(([k, v]) => `<option value="${k}" ${+p.level === +k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
  </div>
  <label class="field"><span>Objetivo principal</span><select data-bind="p_goal">${Object.entries(GOALS).map(([k, g]) => `<option value="${k}" ${p.goal === k ? 'selected' : ''}>${g.n} — ${g.d}</option>`).join('')}</select></label>`;
}
function onProfileInput(el) {
  const b = el.dataset.bind;
  if (!b.startsWith('p_')) return false;
  const k = b.slice(2);
  S.profile[k] = k === 'height' ? parseInt(el.value, 10) || null : k === 'level' ? +el.value : el.value;
  if (k === 'goal') S.instant.goal = el.value;
  if (k === 'level') S.instant.level = +el.value;
  saveSoon();
  return true;
}
const toggle = (key, label, sub) => `<label class="switch-row"><div><b>${label}</b>${sub ? `<small>${sub}</small>` : ''}</div><input type="checkbox" data-bind="s_${key}" ${S.settings[key] ? 'checked' : ''}><i></i></label>`;

SHEETS.profile = {
  render() {
    const st = streakInfo(), tot = S.logs.length;
    const vol = sum(S.logs.map((l) => logStats(l).vol));
    return `${sheetHead('Minha conta')}
    <div class="sheet-body" id="sheetBody">
      <div class="profile-hero">
        <div class="avatar big">${esc((S.profile.name || 'F')[0].toUpperCase())}</div>
        <div><h2>${esc(S.profile.name || 'Atleta Forja')}</h2><div class="small muted">${tot} treinos · ${fmtKg(vol)} levantados · recorde de ofensiva ${st.best}</div></div>
      </div>
      <div class="section-title">Dados pessoais</div><div class="card">${profileFields(S.profile)}</div>

      <div class="section-title">Configurações dos treinos</div><div class="card list-card">
        <label class="switch-row"><div><b>Descanso padrão</b><small>Usado em exercícios novos</small></div>${restSelect('s_restDefault', S.settings.restDefault, 'class="mini-select"')}</label>
        ${toggle('autoTimer', 'Cronômetro automático', 'Começa o descanso ao marcar ✓')}
        ${toggle('smart', 'Sugestão inteligente', 'Indica quando subir a carga')}
        ${toggle('warmup', 'Lembrete de aquecimento', 'No primeiro exercício do treino')}
        ${toggle('sound', 'Som ao fim do descanso')}
        ${toggle('vibrate', 'Vibrar ao fim do descanso', 'Nem todo iPhone permite')}
        ${toggle('wakeLock', 'Manter a tela ligada', 'Durante o treino')}
      </div>

      <div class="section-title">Aparência</div><div class="card">${seg('sheet:theme', [['dark', 'Escuro'], ['light', 'Claro'], ['auto', 'Automático']], S.theme)}</div>

      <div class="section-title">Lembretes</div><div class="card">
        <p class="small muted" style="margin-top:0">O iPhone não deixa apps instalados pela tela inicial mandarem notificações sem um servidor. Por isso, a Forja cria eventos repetidos no app <b>Calendário</b> nos seus dias de treino — e o Calendário te avisa.</p>
        <label class="field"><span>Horário do lembrete</span><input type="time" data-bind="s_remindTime" value="${esc(S.settings.remindTime)}"></label>
        <button class="btn full" data-action="exportIcs" ${activePlan() ? '' : 'disabled'}>📅 Adicionar lembretes ao Calendário</button>
      </div>

      <div class="section-title">Seus dados</div><div class="card list-card">
        <button class="menu-row" data-action="exportData"><span>💾</span><b>Exportar backup</b><span class="chev">›</span></button>
        <button class="menu-row" data-action="importData"><span>📥</span><b>Importar backup</b><span class="chev">›</span></button>
        <button class="menu-row" data-action="exportCsv"><span>📊</span><b>Exportar treinos (planilha CSV)</b><span class="chev">›</span></button>
      </div>
      <p class="small muted hint">Tudo fica salvo só neste aparelho. Faça backup de vez em quando — se apagar o app da tela inicial ou trocar de celular, é ele que traz tudo de volta.</p>

      <div class="section-title">Ajuda</div><div class="card list-card">
        <button class="menu-row" data-action="openFaq"><span>💬</span><b>Dúvidas frequentes</b><span class="chev">›</span></button>
        <button class="menu-row" data-action="openWelcome"><span>🧭</span><b>Reiniciar tutorial</b><span class="chev">›</span></button>
        <button class="menu-row" data-action="openAchievements"><span>🏆</span><b>Conquistas</b><span class="chev">›</span></button>
        <button class="menu-row" data-action="openTool" data-tool="plates"><span>🏋️</span><b>Calculadora de anilhas</b><span class="chev">›</span></button>
        <button class="menu-row" data-action="openTool" data-tool="orm"><span>📈</span><b>Calculadora de 1RM</b><span class="chev">›</span></button>
      </div>
      <button class="btn ghost full danger" data-action="wipeData">Apagar todos os dados</button>
      <p class="small muted center">Forja · versão 2.0 · feito para uso pessoal</p>
    </div>`;
  },
  input(el, data, type) {
    if (onProfileInput(el)) { if (type === 'change') render(); return; }
    const b = el.dataset.bind;
    if (b.startsWith('s_')) {
      const k = b.slice(2);
      S.settings[k] = el.type === 'checkbox' ? el.checked : k === 'restDefault' ? +el.value : el.value;
      save();
    }
  },
};

SHEETS.faq = {
  render() {
    return `${sheetHead('Dúvidas frequentes')}<div class="sheet-body" id="sheetBody">${FAQ.map(([q, a], i) => `
      <div class="card faq ${UI.open === 'faq' + i ? 'open' : ''}" data-action="toggleOpen" data-k="faq${i}"><div class="card-head"><b>${q}</b><span class="chev">›</span></div>${UI.open === 'faq' + i ? `<p>${a}</p>` : ''}</div>`).join('')}</div>`;
  },
};

/* ---------------- Boas-vindas ---------------- */
SHEETS.welcome = {
  render(data) {
    const step = data.step || 0;
    const slides = [
      ['🔥', 'Bem-vindo à Forja', 'Seu app de academia pessoal: monte treinos, registre cargas, acompanhe a evolução e mantenha a chama da ofensiva acesa.'],
      ['📋', 'Treinos do seu jeito', 'Crie rotinas por dia da semana ou escolha um dos programas prontos em Explorar. Sem ideia do que fazer hoje? Use o Treino Imediato.'],
      ['🏋️', 'Durante o treino', 'Cada exercício tem animação e instruções. Marque ✓ nas séries, o descanso começa sozinho e a sugestão inteligente diz quando subir a carga.'],
      ['📈', 'Evolução de verdade', 'Gráficos por exercício, recordes pessoais, mapa de fadiga muscular, medidas do corpo e fotos de progresso — tudo salvo só no seu celular.'],
    ];
    if (step < slides.length) {
      const [ic, t, d] = slides[step];
      return `<div class="sheet-body welcome" id="sheetBody">
        <div class="welcome-slide">${step === 0 ? `<div class="welcome-logo">${streakIcon(TIERS[1], 120, true)}</div>` : `<div class="welcome-ic">${ic}</div>`}<h1>${t}</h1><p>${d}</p></div>
        <div class="dots">${[...slides, 0].map((_, i) => `<i class="${i === step ? 'on' : ''}"></i>`).join('')}</div>
        <button class="btn primary full big" data-action="welcomeNext">Continuar</button>
        <button class="link center-block" data-action="welcomeSkip">Pular</button>
      </div>`;
    }
    return `${sheetHead('Sobre você', { left: 'Pular', leftAction: 'welcomeSkip' })}<div class="sheet-body" id="sheetBody">
      <p class="muted">Esses dados ajudam a calcular IMC, calorias e a montar treinos para o seu nível. Ficam só no seu aparelho.</p>
      ${profileFields(S.profile)}
      <label class="field"><span>Peso atual (kg, opcional)</span><input data-bind="w_kg" inputmode="decimal" value="${esc(data.kg || '')}"></label>
      <button class="btn primary full big" data-action="welcomeDone">Começar a treinar</button>
    </div>`;
  },
  input(el, data) {
    if (el.dataset.bind === 'w_kg') { data.kg = el.value; return; }
    onProfileInput(el);
  },
};

/* ---------------- Ferramentas ---------------- */
const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
const PLATE_COLORS = { 25: '#e01010', 20: '#3a8dff', 15: '#f5c518', 10: '#2ecc71', 5: '#f5f5f5', 2.5: '#555', 1.25: '#999' };
SHEETS.tool = {
  render(data) {
    if (data.tool === 'plates') {
      const target = parseNum(data.target) || 0, bar = data.bar ?? 20;
      let left = Math.max(0, (target - bar) / 2);
      const side = [];
      PLATES.forEach((p) => { while (left >= p - 1e-9) { side.push(p); left -= p; } });
      const actual = bar + 2 * sum(side);
      const vis = side.map((p) => `<i class="plate" style="--pc:${PLATE_COLORS[p]};height:${40 + p * 2.4}px"><span>${fmtNum(p)}</span></i>`).join('');
      return `${sheetHead('Calculadora de anilhas')}<div class="sheet-body" id="sheetBody">
        <label class="field"><span>Peso total desejado (kg)</span><input class="big-input" data-bind="target" inputmode="decimal" value="${esc(data.target || '')}" placeholder="80"></label>
        <div class="field"><span>Barra</span>${seg('sheet:bar', [[20, 'Olímpica 20 kg'], [15, '15 kg'], [10, '10 kg'], [0, 'Sem barra']], bar)}</div>
        <div class="card plate-card">
          <div class="barbell"><div class="bar-shaft"></div><div class="plates">${vis || '<span class="muted small">Só a barra</span>'}</div></div>
          <h3 class="center">${side.length ? `Em cada lado: ${side.map((p) => fmtNum(p)).join(' + ')} kg` : target ? 'Nenhuma anilha necessária' : 'Digite o peso'}</h3>
          ${target && Math.abs(actual - target) > 0.01 ? `<p class="small muted center">Mais próximo possível: ${fmtNum(actual)} kg</p>` : ''}
        </div></div>`;
    }
    const w = parseNum(data.w), r = parseNum(data.r);
    const orm = w && r ? e1rm(w, Math.min(r, 30)) : 0;
    return `${sheetHead('Calculadora de 1RM')}<div class="sheet-body" id="sheetBody">
      <div class="grid2"><label class="field"><span>Peso (kg)</span><input class="big-input" data-bind="w" inputmode="decimal" value="${esc(data.w || '')}"></label>
      <label class="field"><span>Repetições</span><input class="big-input" data-bind="r" inputmode="numeric" value="${esc(data.r || '')}"></label></div>
      <div class="card center"><div class="small muted">1RM estimado</div><div class="orm">${orm ? fmtNum(orm, 1) : '—'}<small> kg</small></div></div>
      ${orm ? `<div class="card"><div class="pct-grid">${[100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50].map((p) => `<div class="pct-cell"><b>${p}%</b><span>${fmtNum(Math.round((orm * p) / 100 / 0.5) * 0.5)} kg</span><small>~${Math.max(1, Math.round(30 * (100 / p - 1)))} reps</small></div>`).join('')}</div></div>` : ''}
      <p class="small muted hint">Fórmula de Epley. Use séries de até 10 repetições para estimativas mais confiáveis.</p></div>`;
  },
  input(el, data, type) {
    if (type !== 'input') return;
    data[el.dataset.bind] = el.value;
    const top = $('#sheetBody'), pos = el.selectionStart;
    refreshSheet();
    const again = document.querySelector(`#sheet [data-bind="${el.dataset.bind}"]`);
    if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (e) { /* ok */ } }
    if (top) $('#sheetBody').scrollTop = top.scrollTop;
  },
};

/* ---------------- Backup e lembretes ---------------- */
async function exportData() {
  let photos = [];
  try { photos = await PhotoDB.all(); } catch (e) { photos = []; }
  const withPhotos = photos.length ? confirm(`Incluir suas ${photos.length} fotos de progresso no backup? (o arquivo fica maior)`) : false;
  const data = JSON.stringify({ app: APP_NAME, version: 2, exportedAt: new Date().toISOString(), data: { ...S, draft: null }, photos: withPhotos ? photos : [] });
  shareFile(new File([data], `forja-backup-${todayKey()}.json`, { type: 'application/json' }));
}
function importData(file) {
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const parsed = JSON.parse(reader.result);
      const d = parsed.data || parsed;
      if (!Array.isArray(d.plans) || !Array.isArray(d.logs)) throw new Error('formato');
      if (!confirm(`Importar backup com ${d.plans.length} treino(s) e ${d.logs.length} registro(s)? Os dados atuais deste aparelho serão substituídos.`)) return;
      const theme = S.theme;
      localStorage.setItem(STORE_KEY, JSON.stringify(Object.assign({}, d, { theme, draft: null, onboarded: true })));
      load();
      if (parsed.photos && parsed.photos.length) { await PhotoDB.clear(); for (const p of parsed.photos) await PhotoDB.put(p); UI.photos = null; }
      closeAllSheets(); toast('Backup importado');
    } catch (e) { alert('Arquivo inválido. Escolha um backup exportado pela Forja.'); }
  };
  reader.readAsText(file);
}
function exportIcs(planId) {
  const plan = S.plans.find((p) => p.id === planId) || activePlan();
  if (!plan) return;
  const [hh, mm] = (S.settings.remindTime || '18:00').split(':');
  const codes = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  let ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Forja//PT-BR\r\nCALSCALE:GREGORIAN\r\n';
  planDays(plan).forEach((wd) => {
    const d = new Date(); d.setDate(d.getDate() + ((wd - d.getDay() + 7) % 7));
    const ds = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(hh)}${pad(mm)}00`;
    const t = plan.days[wd].title || 'Treino';
    ics += `BEGIN:VEVENT\r\nUID:forja-${plan.id}-${wd}@forja\r\nDTSTAMP:${stamp}\r\nDTSTART:${ds}\r\nDURATION:PT1H\r\nRRULE:FREQ=WEEKLY;BYDAY=${codes[wd]}\r\nSUMMARY:🔥 Treino: ${t.replace(/[,;]/g, ' ')}\r\nDESCRIPTION:${plan.name.replace(/[,;]/g, ' ')} — abra a Forja e mantenha a ofensiva!\r\nBEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:Hora do treino\r\nTRIGGER:-PT0M\r\nEND:VALARM\r\nEND:VEVENT\r\n`;
  });
  ics += 'END:VCALENDAR\r\n';
  shareFile(new File([ics], 'forja-lembretes.ics', { type: 'text/calendar' }));
  toast('Abra o arquivo no Calendário para adicionar');
}

Object.assign(actions, {
  openProfile() { pushSheet('profile'); },
  openFaq() { pushSheet('faq'); },
  openWelcome() { pushSheet('welcome', { step: 0 }); },
  welcomeNext() { topSheet().data.step++; refreshSheet(); },
  welcomeSkip() { S.onboarded = true; save(); closeAllSheets(); },
  welcomeDone() {
    const kg = parseNum(topSheet().data.kg);
    if (kg && kg > 20 && kg < 400) { S.body.weights = S.body.weights.filter((w) => w.date !== todayKey()); S.body.weights.push({ id: uid(), date: todayKey(), kg }); }
    S.onboarded = true; save(); closeAllSheets();
    toast(S.profile.name ? `Bora treinar, ${S.profile.name.split(' ')[0]}! 🔥` : 'Bora treinar! 🔥');
  },
  openTool(el) { pushSheet('tool', { tool: el.dataset.tool, bar: 20 }); },
  exportData, importData() { $('#importFile').click(); },
  exportIcs(el) { exportIcs(el.dataset.id); },
  wipeData() {
    if (!confirm('Apagar TODOS os dados deste aparelho (treinos, histórico, corpo e fotos)? Isso não pode ser desfeito.')) return;
    if (!confirm('Tem certeza mesmo? Recomendo exportar um backup antes.')) return;
    localStorage.removeItem(STORE_KEY); PhotoDB.clear().catch(() => {});
    location.reload();
  },
});
// tema pelo seletor do perfil
const _seg = actions.seg;
actions.seg = function (el) {
  if (el.dataset.name === 'sheet:theme') { S.theme = el.dataset.v; applyTheme(); save(); refreshSheet(); return; }
  if (el.dataset.name === 'sheet:bar') { topSheet().data.bar = +el.dataset.v; refreshSheet(); return; }
  _seg(el);
};

/* =========================================================
   Início do app
   ========================================================= */
function init() {
  load();
  applyTheme();
  const n = new Date();
  UI.selected = todayKey();
  UI.lastToday = UI.selected;
  UI.month = new Date(n.getFullYear(), n.getMonth(), 1);
  render();
  if (!S.onboarded) pushSheet('welcome', { step: 0 });
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
  if (window.matchMedia) matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { if (S.theme === 'auto') applyTheme(); });
}
$('#importFile').addEventListener('change', (e) => { const f = e.target.files && e.target.files[0]; if (f) importData(f); e.target.value = ''; });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (!$('#timer').hidden && !T.fired) tick();
  if (topSheet() && topSheet().type === 'workout') requestWake();
  if (UI.lastToday !== todayKey()) {
    const was = UI.selected === UI.lastToday;
    UI.lastToday = todayKey();
    if (was) actions.goToday(); else if (!topSheet()) render();
  }
});
init();
