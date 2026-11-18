'use strict';
/* =========================================================
   Forja — dados fixos: músculos, exercícios, programas, conquistas
   ========================================================= */

const MUSCLES = {
  peitoral: { n: 'Peitoral', g: 'peito' },
  ombros: { n: 'Ombros', g: 'ombros' },
  biceps: { n: 'Bíceps', g: 'bracos' },
  triceps: { n: 'Tríceps', g: 'bracos' },
  antebracos: { n: 'Antebraços', g: 'bracos' },
  abdomen: { n: 'Abdômen', g: 'core' },
  obliquos: { n: 'Oblíquos', g: 'core' },
  trapezio: { n: 'Trapézio', g: 'costas' },
  dorsais: { n: 'Dorsais', g: 'costas' },
  lombares: { n: 'Lombares', g: 'costas' },
  gluteos: { n: 'Glúteos', g: 'pernas' },
  quadriceps: { n: 'Quadríceps', g: 'pernas' },
  isquiotibiais: { n: 'Isquiotibiais', g: 'pernas' },
  panturrilhas: { n: 'Panturrilhas', g: 'pernas' },
  adutores: { n: 'Adutores', g: 'pernas' },
  abdutores: { n: 'Abdutores', g: 'pernas' },
  cardio: { n: 'Cardio', g: 'cardio' },
};
const MUSCLE_FRONT = ['ombros', 'peitoral', 'biceps', 'antebracos', 'abdomen', 'obliquos', 'quadriceps', 'adutores', 'abdutores', 'panturrilhas'];
const MUSCLE_BACK = ['trapezio', 'ombros', 'triceps', 'dorsais', 'lombares', 'antebracos', 'gluteos', 'isquiotibiais', 'panturrilhas'];

const GROUPS = {
  peito: { n: 'Peito', c: '#ff7a1a', m: ['peitoral'] },
  costas: { n: 'Costas', c: '#3a8dff', m: ['dorsais', 'trapezio', 'lombares'] },
  ombros: { n: 'Ombros', c: '#b45cff', m: ['ombros'] },
  bracos: { n: 'Braços', c: '#ff4d6d', m: ['biceps', 'triceps', 'antebracos'] },
  pernas: { n: 'Pernas', c: '#2ecc71', m: ['quadriceps', 'isquiotibiais', 'gluteos', 'panturrilhas', 'adutores', 'abdutores'] },
  core: { n: 'Core', c: '#f5c518', m: ['abdomen', 'obliquos'] },
  cardio: { n: 'Cardio', c: '#2bc4c4', m: ['cardio'] },
};

const EQUIP = {
  barra: 'Barra', halteres: 'Halteres', maquina: 'Máquina', polia: 'Polia/Cabo', corporal: 'Peso corporal',
  smith: 'Smith', kettlebell: 'Kettlebell', cardio: 'Aparelho de cardio',
};

/* E(id, nome, primários, secundários, equipamento, animação, acessório, opções, preparação, passos, dicas)
   opções: c=composto, r=rotação da animação (inclinado), al=apelidos, lvl=nível (1 iniciante,2,3) */
const EXERCISES = [];
function E(id, n, m, s, eq, a, p, o, prep, steps, tips) {
  EXERCISES.push({ id, n, m, s, eq, a, p, c: !!o.c, r: o.r || 0, rev: !!o.rev, al: o.al || [], lvl: o.lvl || 1, prep, steps, tips });
}

/* ---------------- Peito ---------------- */
E('supino_reto_barra', 'Supino Reto (barra)', ['peitoral'], ['triceps', 'ombros'], 'barra', 'bench', 'barbell', { c: 1, al: ['supino reto', 'supino'] },
  'Deite no banco com os olhos logo abaixo da barra, pés firmes no chão e escápulas encaixadas para trás. Segure a barra um pouco mais aberto que a largura dos ombros.',
  ['Tire a barra do suporte e posicione-a acima do peito com os braços estendidos.', 'Desça de forma controlada até tocar de leve a parte média do peito.', 'Empurre a barra de volta para cima até quase estender os cotovelos.', 'Repita mantendo o mesmo trajeto em todas as repetições.'],
  ['Mantenha glúteos e ombros apoiados no banco o tempo todo.', 'Cotovelos entre 45° e 70° em relação ao tronco, sem abrir demais.', 'Solte o ar ao empurrar a barra.']);
E('supino_reto_halteres', 'Supino Reto (halteres)', ['peitoral'], ['triceps', 'ombros'], 'halteres', 'bench', 'dumbbell', { c: 1 },
  'Sente no banco com um halter apoiado em cada coxa. Deite levando os halteres junto ao peito e firme os pés no chão.',
  ['Empurre os halteres para cima até os braços ficarem quase estendidos.', 'Desça devagar abrindo os cotovelos até sentir o peitoral alongar.', 'Suba novamente aproximando os halteres no topo.'],
  ['Os halteres permitem maior amplitude: aproveite, mas sem dor no ombro.', 'Controle a descida em cerca de 2 segundos.']);
E('supino_inclinado_barra', 'Supino Inclinado (barra)', ['peitoral'], ['ombros', 'triceps'], 'barra', 'bench', 'barbell', { c: 1, r: -22 },
  'Ajuste o banco entre 30° e 45°. Deite com a barra alinhada à parte alta do peito e escápulas retraídas.',
  ['Retire a barra e estabilize acima da parte superior do peito.', 'Desça controlando até próximo da clavícula.', 'Empurre para cima e levemente para trás até estender os braços.'],
  ['Inclinação muito alta transfere o trabalho para os ombros.', 'Mantenha o quadril no banco.']);
E('supino_inclinado_halteres', 'Supino Inclinado (halteres)', ['peitoral'], ['ombros', 'triceps'], 'halteres', 'bench', 'dumbbell', { c: 1, r: -22 },
  'Banco entre 30° e 45°. Comece com os halteres na altura do peito e as palmas voltadas para a frente.',
  ['Empurre os halteres para cima até quase encostá-los.', 'Desça devagar até a altura do peito.', 'Suba novamente sem perder a postura.'],
  ['Pense em “abraçar” o movimento ao subir.', 'Não deixe os punhos dobrarem para trás.']);
E('supino_declinado_barra', 'Supino Declinado (barra)', ['peitoral'], ['triceps'], 'barra', 'bench', 'barbell', { c: 1, r: 14 },
  'Prenda as pernas no apoio do banco declinado e deite com a barra alinhada à parte baixa do peito.',
  ['Retire a barra com ajuda ou com cuidado.', 'Desça até a parte inferior do peito.', 'Empurre de volta até estender os braços.'],
  ['Use um parceiro para tirar e recolocar a barra.', 'Mantenha o movimento curto e controlado.']);
E('supino_maquina', 'Supino na Máquina', ['peitoral'], ['triceps', 'ombros'], 'maquina', 'chest_press', 'handle', { c: 1, al: ['chest press'] },
  'Ajuste o banco para que as pegadas fiquem na altura do meio do peito. Costas apoiadas e pés no chão.',
  ['Empurre as pegadas para a frente até quase estender os braços.', 'Volte devagar até sentir o peitoral alongar.', 'Repita sem deixar o peso encostar entre as repetições.'],
  ['Ótimo para iniciantes aprenderem o movimento de empurrar.', 'Não tire as costas do encosto.']);
E('crucifixo_halteres', 'Crucifixo (halteres)', ['peitoral'], ['ombros'], 'halteres', 'fly', 'dumbbell', {},
  'Deite no banco reto com os halteres acima do peito, palmas voltadas uma para a outra e cotovelos levemente flexionados.',
  ['Abra os braços em arco, descendo os halteres para os lados.', 'Pare quando sentir um bom alongamento no peito.', 'Feche o arco trazendo os halteres de volta ao centro.'],
  ['Os cotovelos ficam travados levemente dobrados durante todo o movimento.', 'Use cargas moderadas: o foco é o alongamento.']);
E('crucifixo_maquina', 'Crucifixo na Máquina (voador)', ['peitoral'], ['ombros'], 'maquina', 'pec_deck', 'handle', { al: ['crucifixo maquina', 'peck deck', 'voador', 'crucifixo na maquina'] },
  'Sente com as costas apoiadas e ajuste o banco para que as pegadas fiquem na altura do peito.',
  ['Com cotovelos levemente flexionados, aproxime as pegadas à frente do peito.', 'Segure 1 segundo contraindo o peitoral.', 'Volte devagar até sentir o alongamento.'],
  ['Não deixe os ombros subirem em direção às orelhas.', 'Movimento lento e controlado rende mais que carga alta.']);
E('crossover', 'Crossover (polia)', ['peitoral'], ['ombros'], 'polia', 'cable_cross', 'handle', {},
  'Fique no centro do crossover com as polias no alto, um pé à frente do outro e tronco levemente inclinado.',
  ['Puxe as pegadas para baixo e para a frente, cruzando à frente do quadril.', 'Contraia o peitoral por um instante.', 'Volte abrindo os braços de forma controlada.'],
  ['Mantenha os cotovelos levemente dobrados.', 'Mude a altura das polias para focar regiões diferentes do peito.']);
E('flexao', 'Flexão de Braço', ['peitoral'], ['triceps', 'ombros', 'abdomen'], 'corporal', 'pushup', null, { c: 1, al: ['flexao', 'flexão'] },
  'Apoie as mãos no chão um pouco mais abertas que os ombros e estenda as pernas, formando uma linha reta da cabeça aos pés.',
  ['Desça o corpo dobrando os cotovelos até o peito ficar próximo do chão.', 'Empurre o chão para voltar à posição inicial.', 'Mantenha o abdômen firme durante todo o movimento.'],
  ['Se estiver difícil, apoie os joelhos no chão.', 'Não deixe o quadril cair nem subir demais.']);
E('flexao_joelhos', 'Flexão de Joelhos', ['peitoral'], ['triceps', 'ombros'], 'corporal', 'pushup', null, { c: 1 },
  'Apoie mãos e joelhos no chão, com as mãos um pouco mais abertas que os ombros e o tronco alinhado com as coxas.',
  ['Desça o peito em direção ao chão dobrando os cotovelos.', 'Empurre de volta até estender os braços.', 'Repita mantendo o corpo reto.'],
  ['Ótima porta de entrada para a flexão completa.', 'Coloque uma toalha sob os joelhos para conforto.']);
E('paralelas', 'Mergulho nas Paralelas', ['peitoral', 'triceps'], ['ombros'], 'corporal', 'dips', null, { c: 1, lvl: 2, al: ['paralelas', 'mergulho'] },
  'Segure as barras paralelas e suba até estender os braços, com o corpo suspenso.',
  ['Desça dobrando os cotovelos e inclinando levemente o tronco à frente.', 'Pare quando os ombros ficarem um pouco abaixo dos cotovelos.', 'Empurre para cima até estender os braços.'],
  ['Tronco mais inclinado = mais peito; mais reto = mais tríceps.', 'Evite descer demais se sentir desconforto no ombro.']);
E('pullover', 'Pullover (halter)', ['peitoral', 'dorsais'], ['triceps'], 'halteres', 'pullover', 'dumbbell', {},
  'Deite no banco segurando um halter com as duas mãos acima do peito, cotovelos levemente flexionados.',
  ['Leve o halter para trás da cabeça em arco, sem dobrar mais os cotovelos.', 'Desça até sentir alongar peito e costas.', 'Volte o halter para cima do peito.'],
  ['Mantenha o quadril baixo e o abdômen firme.', 'Respire fundo na descida.']);

/* ---------------- Costas ---------------- */
E('puxada_frontal', 'Puxada Frontal (polia)', ['dorsais'], ['biceps', 'trapezio'], 'polia', 'pulldown', 'handle', { c: 1, al: ['puxada frontal', 'puxada alta', 'pulldown'] },
  'Sente na máquina com as coxas presas no apoio e segure a barra mais aberto que os ombros.',
  ['Puxe a barra em direção à parte alta do peito, levando os cotovelos para baixo.', 'Aproxime as escápulas no final do movimento.', 'Volte devagar até estender os braços.'],
  ['Não balance o tronco para trás para roubar.', 'Pense em puxar com os cotovelos, não com as mãos.']);
E('puxada_triangulo', 'Puxada com Triângulo (polia)', ['dorsais'], ['biceps'], 'polia', 'pulldown', 'handle', { c: 1 },
  'Encaixe o triângulo na polia alta, sente e segure com as palmas voltadas uma para a outra.',
  ['Puxe o triângulo até a altura do peito.', 'Mantenha o peito aberto e os ombros para baixo.', 'Retorne controlando até estender os braços.'],
  ['Incline o tronco só um pouco para trás.', 'Ótima variação para quem sente o ombro na pegada aberta.']);
E('barra_fixa', 'Barra Fixa', ['dorsais'], ['biceps', 'antebracos'], 'corporal', 'pullup', null, { c: 1, lvl: 2, al: ['barra fixa', 'pull up'] },
  'Segure a barra com as palmas para a frente, mãos um pouco mais abertas que os ombros, e fique pendurado com os braços estendidos.',
  ['Puxe o corpo para cima até o queixo passar a barra.', 'Desça devagar até estender os braços.', 'Repita sem balançar o corpo.'],
  ['Use elástico ou máquina graviton se ainda não consegue fazer.', 'Inicie o movimento “abaixando” os ombros.']);
E('remada_curvada', 'Remada Curvada (barra)', ['dorsais'], ['trapezio', 'biceps', 'lombares'], 'barra', 'row', 'barbell', { c: 1, lvl: 2, al: ['remada curvada'] },
  'Em pé, segure a barra com as mãos na largura dos ombros. Flexione levemente os joelhos e incline o tronco à frente com a coluna reta.',
  ['Puxe a barra em direção ao umbigo, levando os cotovelos para trás.', 'Aperte as escápulas no topo.', 'Desça a barra de forma controlada.'],
  ['Coluna neutra o tempo todo: não arredonde as costas.', 'Mantenha o tronco parado; só os braços se movem.']);
E('remada_t', 'Remada T (barra)', ['dorsais'], ['trapezio', 'ombros', 'biceps'], 'barra', 'row', 'barbell', { c: 1, lvl: 2, al: ['remada cavalinho', 'remada t'] },
  'Posicione uma ponta da barra presa no canto ou no aparelho. Fique sobre a barra, incline o tronco e segure próximo às anilhas.',
  ['Puxe a barra em direção ao peito, mantendo os cotovelos próximos ao corpo.', 'Contraia as costas no topo.', 'Desça controlando o peso.'],
  ['Joelhos levemente dobrados para proteger a lombar.', 'Não suba o tronco para ajudar na puxada.']);
E('remada_unilateral', 'Remada Unilateral (halter)', ['dorsais'], ['biceps', 'trapezio'], 'halteres', 'row', 'dumbbell', { c: 1, al: ['serrote', 'remada unilateral'] },
  'Apoie um joelho e a mão do mesmo lado no banco. Segure o halter com o outro braço estendido.',
  ['Puxe o halter em direção ao quadril.', 'Leve o cotovelo para trás e próximo ao corpo.', 'Desça até estender totalmente o braço.'],
  ['Mantenha as costas paralelas ao chão.', 'Evite girar o tronco para subir o peso.']);
E('remada_baixa', 'Remada Baixa (polia)', ['dorsais'], ['trapezio', 'biceps'], 'polia', 'seated_row', 'handle', { c: 1, al: ['remada baixa', 'remada sentada'] },
  'Sente com os pés apoiados na plataforma e joelhos levemente flexionados. Segure o triângulo com a coluna ereta.',
  ['Puxe o triângulo até o abdômen.', 'Aproxime as escápulas e abra o peito.', 'Retorne estendendo os braços, sem curvar a coluna.'],
  ['Não use o balanço do tronco.', 'Segure 1 segundo na contração.']);
E('remada_maquina', 'Remada na Máquina', ['dorsais'], ['trapezio', 'biceps'], 'maquina', 'seated_row', 'handle', { c: 1 },
  'Ajuste o banco para que as pegadas fiquem na altura do peito e apoie o peito no encosto.',
  ['Puxe as pegadas levando os cotovelos para trás.', 'Contraia as costas no final.', 'Volte devagar até estender os braços.'],
  ['O apoio no peito protege a lombar.', 'Varie a pegada para trabalhar ângulos diferentes.']);
E('levantamento_terra', 'Levantamento Terra (barra)', ['lombares', 'gluteos', 'isquiotibiais'], ['dorsais', 'trapezio', 'quadriceps', 'antebracos'], 'barra', 'deadlift', 'barbell', { c: 1, lvl: 3, al: ['terra', 'levantamento terra'] },
  'Fique com os pés na largura do quadril e a barra sobre o meio dos pés. Agache segurando a barra com as mãos fora das pernas, coluna neutra.',
  ['Empurre o chão com os pés e estenda joelhos e quadril ao mesmo tempo.', 'Mantenha a barra raspando nas pernas durante a subida.', 'Termine em pé com o quadril estendido, sem inclinar para trás.', 'Desça a barra pelo mesmo caminho.'],
  ['Nunca arredonde a lombar.', 'Comece leve e aprenda a técnica com calma.', 'Prenda o ar e firme o abdômen antes de cada repetição.']);
E('pulldown_braco_reto', 'Pulldown Braço Reto (polia)', ['dorsais'], ['triceps'], 'polia', 'straight_pulldown', 'handle', {},
  'Em frente à polia alta, segure a barra com os braços estendidos e incline levemente o tronco.',
  ['Puxe a barra para baixo em arco até as coxas, braços quase retos.', 'Contraia as dorsais no final.', 'Volte devagar até a altura dos olhos.'],
  ['Cotovelos levemente dobrados e fixos.', 'Ótimo para “sentir” as dorsais antes das puxadas.']);
E('hiperextensao', 'Hiperextensão Lombar', ['lombares'], ['gluteos', 'isquiotibiais'], 'corporal', 'back_ext', null, { al: ['extensao lombar', 'banco romano'] },
  'Posicione o quadril no apoio do banco romano com os pés presos e o tronco estendido. Cruze os braços no peito.',
  ['Desça o tronco flexionando o quadril.', 'Suba até o tronco ficar alinhado com as pernas.', 'Repita de forma controlada.'],
  ['Não suba além da linha do corpo.', 'Segure uma anilha no peito para progredir.']);
E('encolhimento', 'Encolhimento (halteres)', ['trapezio'], ['antebracos'], 'halteres', 'shrug', 'dumbbell', { al: ['encolhimento'] },
  'Em pé, segure um halter em cada mão ao lado do corpo, braços estendidos.',
  ['Suba os ombros em direção às orelhas.', 'Segure 1 segundo no topo.', 'Desça devagar.'],
  ['Não gire os ombros: o movimento é só para cima e para baixo.', 'Mantenha os braços relaxados e retos.']);
E('face_pull', 'Face Pull (polia)', ['ombros', 'trapezio'], ['biceps'], 'polia', 'face_pull', 'handle', {},
  'Ajuste a polia na altura do rosto com a corda. Segure as pontas com as palmas para dentro e dê um passo para trás.',
  ['Puxe a corda em direção ao rosto, abrindo os cotovelos.', 'Separe as mãos ao final, ao lado das orelhas.', 'Volte controlando.'],
  ['Excelente para a saúde dos ombros.', 'Use carga leve e foque na contração.']);

/* ---------------- Ombros ---------------- */
E('desenvolvimento_halteres', 'Desenvolvimento (halteres)', ['ombros'], ['triceps'], 'halteres', 'shoulder_press', 'dumbbell', { c: 1, al: ['desenvolvimento com halteres', 'desenvolvimento'] },
  'Sente no banco com encosto reto e segure os halteres na altura dos ombros, palmas para a frente.',
  ['Empurre os halteres para cima até quase estender os braços.', 'Aproxime os halteres no topo sem bater.', 'Desça até a altura das orelhas.'],
  ['Não arqueie a lombar: mantenha as costas no encosto.', 'Cotovelos levemente à frente do corpo.']);
E('desenvolvimento_barra', 'Desenvolvimento (barra)', ['ombros'], ['triceps', 'trapezio'], 'barra', 'shoulder_press', 'hbar', { c: 1, lvl: 2, al: ['desenvolvimento militar'] },
  'Em pé ou sentado, segure a barra na altura da clavícula com as mãos um pouco mais abertas que os ombros.',
  ['Empurre a barra para cima, passando perto do rosto.', 'Estenda os braços acima da cabeça.', 'Desça de forma controlada até a clavícula.'],
  ['Glúteos e abdômen contraídos para não arquear a coluna.', 'Leve a cabeça levemente para trás quando a barra passar.']);
E('desenvolvimento_maquina', 'Desenvolvimento na Máquina', ['ombros'], ['triceps'], 'maquina', 'shoulder_press', 'handle', { c: 1 },
  'Ajuste o banco para que as pegadas fiquem na altura dos ombros e apoie as costas.',
  ['Empurre as pegadas para cima.', 'Pare antes de travar os cotovelos.', 'Volte devagar.'],
  ['Boa opção para iniciantes.', 'Mantenha os pés firmes no chão.']);
E('elevacao_lateral', 'Elevação Lateral (halteres)', ['ombros'], ['trapezio'], 'halteres', 'lateral_raise', 'dumbbell', { al: ['elevacao lateral'] },
  'Em pé, halteres ao lado do corpo, cotovelos levemente flexionados e tronco um pouco inclinado à frente.',
  ['Eleve os braços para os lados até a altura dos ombros.', 'Segure por um instante.', 'Desça devagar.'],
  ['Lidere o movimento com os cotovelos, não com as mãos.', 'Carga leve e muita técnica: é um músculo pequeno.']);
E('elevacao_lateral_polia', 'Elevação Lateral (polia)', ['ombros'], [], 'polia', 'lateral_raise', 'handle', {},
  'Fique de lado para a polia baixa e segure a pegada com a mão mais distante.',
  ['Eleve o braço lateralmente até a altura do ombro.', 'Segure 1 segundo.', 'Volte devagar.'],
  ['A polia mantém tensão constante durante todo o movimento.', 'Não incline o corpo para o lado.']);
E('elevacao_lateral_maquina', 'Elevação Lateral (máquina)', ['ombros'], [], 'maquina', 'lateral_raise', 'handle', {},
  'Sente na máquina com os braços apoiados nas almofadas e o peito no encosto.',
  ['Eleve os cotovelos para os lados até a altura dos ombros.', 'Segure por um instante.', 'Desça controlando.'],
  ['Mantenha os ombros longe das orelhas.', 'Ajuste o banco para alinhar o ombro ao eixo da máquina.']);
E('elevacao_frontal', 'Elevação Frontal (halteres)', ['ombros'], ['peitoral'], 'halteres', 'front_raise', 'dumbbell', {},
  'Em pé, halteres à frente das coxas com as palmas voltadas para o corpo.',
  ['Eleve um ou os dois halteres à frente até a altura dos olhos.', 'Segure por um instante.', 'Desça devagar.'],
  ['Evite balançar o tronco.', 'Cotovelos levemente flexionados.']);
E('crucifixo_inverso', 'Crucifixo Inverso (máquina)', ['ombros'], ['trapezio', 'dorsais'], 'maquina', 'pec_deck', 'handle', { rev: 1, al: ['crucifixo inverso'] },
  'Sente de frente para o encosto da máquina voador e segure as pegadas com os braços à frente.',
  ['Abra os braços para trás em arco.', 'Aproxime as escápulas no final.', 'Volte devagar até a frente.'],
  ['Foco na parte de trás dos ombros.', 'Não use impulso.']);
E('remada_alta', 'Remada Alta (barra)', ['ombros', 'trapezio'], ['biceps'], 'barra', 'upright_row', 'hbar', { c: 1 },
  'Em pé, segure a barra à frente das coxas com as mãos na largura dos ombros.',
  ['Puxe a barra para cima perto do corpo, levando os cotovelos para cima e para fora.', 'Pare na altura do peito.', 'Desça controlando.'],
  ['Não suba acima do peito se sentir o ombro.', 'Pegada mais aberta é mais confortável.']);

/* ---------------- Bíceps / Antebraço ---------------- */
E('rosca_direta', 'Rosca Direta (barra)', ['biceps'], ['antebracos'], 'barra', 'curl', 'hbar', { al: ['rosca direta'] },
  'Em pé, segure a barra com as palmas para cima, mãos na largura dos ombros e cotovelos junto ao corpo.',
  ['Flexione os cotovelos trazendo a barra até o peito.', 'Contraia os bíceps no topo.', 'Desça devagar até estender os braços.'],
  ['Não balance o tronco.', 'Cotovelos fixos ao lado do corpo.']);
E('rosca_alternada', 'Rosca Alternada (halteres)', ['biceps'], ['antebracos'], 'halteres', 'curl', 'dumbbell', { al: ['rosca alternada'] },
  'Em pé, um halter em cada mão com os braços estendidos e palmas voltadas para o corpo.',
  ['Suba um halter girando a palma para cima durante o movimento.', 'Contraia no topo e desça devagar.', 'Repita com o outro braço.'],
  ['Mantenha o cotovelo parado.', 'Controle a descida.']);
E('rosca_martelo', 'Rosca Martelo (halteres)', ['biceps', 'antebracos'], [], 'halteres', 'curl', 'dumbbell', { al: ['rosca martelo'] },
  'Em pé, halteres ao lado do corpo com as palmas voltadas uma para a outra.',
  ['Flexione os cotovelos mantendo a pegada neutra.', 'Suba até a altura do ombro.', 'Desça controlando.'],
  ['Trabalha bastante o braquial e o antebraço.', 'Não deixe os cotovelos irem para a frente.']);
E('rosca_scott', 'Rosca Scott', ['biceps'], ['antebracos'], 'barra', 'curl', 'hbar', {},
  'Sente no banco Scott com a parte de trás dos braços apoiada na almofada, segurando a barra W.',
  ['Flexione os cotovelos trazendo a barra em direção aos ombros.', 'Contraia no topo.', 'Desça devagar sem estender totalmente.'],
  ['O apoio impede trapaças com o corpo.', 'Cuidado com o final da descida: não “solte” o peso.']);
E('rosca_concentrada', 'Rosca Concentrada (halter)', ['biceps'], [], 'halteres', 'curl', 'dumbbell', {},
  'Sente no banco, apoie o cotovelo na parte interna da coxa e segure o halter com o braço estendido.',
  ['Flexione o cotovelo trazendo o halter ao ombro.', 'Contraia bem no topo.', 'Desça devagar.'],
  ['Movimento curto e muito focado.', 'Não mexa o ombro.']);
E('rosca_polia', 'Rosca na Polia', ['biceps'], ['antebracos'], 'polia', 'curl', 'handle', {},
  'De frente para a polia baixa, segure a barra com as palmas para cima.',
  ['Flexione os cotovelos trazendo a barra ao peito.', 'Segure 1 segundo.', 'Volte devagar.'],
  ['A polia mantém tensão constante.', 'Cotovelos colados ao corpo.']);
E('rosca_inversa_polia', 'Rosca Inversa (polia)', ['biceps', 'antebracos'], [], 'polia', 'curl', 'handle', {},
  'De frente para a polia baixa, segure a barra com as palmas voltadas para baixo (pegada pronada).',
  ['Mantenha os cotovelos junto ao corpo.', 'Flexione os cotovelos até a barra chegar à altura do peito.', 'Segure por um segundo e desça lentamente.'],
  ['Punhos firmes durante todo o exercício.', 'Sem impulso do corpo.']);
E('rosca_punho', 'Rosca de Punho (barra)', ['antebracos'], [], 'barra', 'wrist_curl', 'dumbbell', {},
  'Sente no banco com os antebraços apoiados nas coxas e os punhos para fora dos joelhos, segurando a barra com as palmas para cima.',
  ['Flexione os punhos levantando a barra.', 'Desça devagar deixando a barra rolar até os dedos.', 'Repita com amplitude completa.'],
  ['Carga leve e muitas repetições funcionam bem.', 'Somente os punhos se movem.']);

/* ---------------- Tríceps ---------------- */
E('triceps_corda', 'Tríceps Corda (polia)', ['triceps'], [], 'polia', 'pushdown', 'handle', { al: ['triceps corda'] },
  'De frente para a polia alta com a corda, segure as pontas e cole os cotovelos ao lado do corpo.',
  ['Empurre a corda para baixo até estender os braços.', 'Abra a corda no final do movimento.', 'Volte devagar até os antebraços ficarem paralelos ao chão.'],
  ['Os cotovelos não saem do lugar.', 'Tronco levemente inclinado à frente.']);
E('triceps_barra', 'Tríceps na Polia (barra)', ['triceps'], [], 'polia', 'pushdown', 'handle', { al: ['triceps pulley', 'triceps polia'] },
  'De frente para a polia alta, segure a barra reta com as palmas para baixo e cotovelos junto ao corpo.',
  ['Empurre a barra para baixo até estender os braços.', 'Contraia o tríceps no final.', 'Volte controlando.'],
  ['Não deixe os ombros irem para a frente.', 'Mantenha os punhos retos.']);
E('triceps_testa', 'Tríceps Testa (barra)', ['triceps'], [], 'barra', 'skull', 'barbell', { al: ['triceps testa'] },
  'Deite no banco segurando a barra W acima do peito com os braços estendidos.',
  ['Dobre apenas os cotovelos, descendo a barra em direção à testa.', 'Pare um pouco antes de encostar.', 'Estenda os braços de volta.'],
  ['Cotovelos apontando para cima, sem abrir.', 'Comece leve: é um movimento delicado para o cotovelo.']);
E('triceps_frances', 'Tríceps Francês (halter)', ['triceps'], [], 'halteres', 'overhead_ext', 'dumbbell', { al: ['triceps frances'] },
  'Sentado ou em pé, segure um halter com as duas mãos acima da cabeça, braços estendidos.',
  ['Desça o halter atrás da cabeça dobrando os cotovelos.', 'Mantenha os cotovelos apontados para cima.', 'Estenda os braços de volta.'],
  ['Abdômen firme para não arquear a lombar.', 'Amplitude completa para alongar bem o tríceps.']);
E('triceps_banco', 'Tríceps no Banco', ['triceps'], ['peitoral', 'ombros'], 'corporal', 'bench_dips', null, { al: ['mergulho no banco'] },
  'Apoie as mãos na borda de um banco atrás de você e estenda as pernas à frente.',
  ['Desça o corpo dobrando os cotovelos até cerca de 90°.', 'Empurre o banco para subir.', 'Mantenha as costas próximas ao banco.'],
  ['Joelhos dobrados deixam o exercício mais fácil.', 'Evite descer demais.']);
E('triceps_coice', 'Tríceps Coice (halter)', ['triceps'], [], 'halteres', 'kickback', 'dumbbell', { al: ['triceps coice', 'kickback'] },
  'Apoie uma mão e um joelho no banco. Segure o halter com o braço dobrado e o cotovelo junto ao corpo.',
  ['Estenda o cotovelo levando o halter para trás.', 'Segure 1 segundo com o braço reto.', 'Volte devagar.'],
  ['Só o antebraço se move.', 'Mantenha o braço paralelo ao tronco.']);

/* ---------------- Pernas ---------------- */
E('agachamento_livre', 'Agachamento Livre (barra)', ['quadriceps', 'gluteos'], ['isquiotibiais', 'lombares', 'adutores'], 'barra', 'squat', 'barbell_back', { c: 1, lvl: 2, al: ['agachamento livre', 'agachamento'] },
  'Posicione a barra sobre a parte alta das costas (trapézio), pés na largura dos ombros com as pontas levemente para fora.',
  ['Desça levando o quadril para trás e dobrando os joelhos, como se fosse sentar.', 'Desça até as coxas ficarem pelo menos paralelas ao chão.', 'Empurre o chão para subir, mantendo o peito aberto.'],
  ['Joelhos acompanham a direção das pontas dos pés.', 'Calcanhares sempre no chão.', 'Firme o abdômen antes de descer.']);
E('agachamento_smith', 'Agachamento no Smith', ['quadriceps', 'gluteos'], ['isquiotibiais'], 'smith', 'squat', 'barbell_back', { c: 1 },
  'Posicione-se sob a barra do Smith com ela apoiada nas costas e os pés um pouco à frente do corpo.',
  ['Destrave a barra e agache até as coxas ficarem paralelas ao chão.', 'Suba empurrando com os calcanhares.', 'Trave a barra ao terminar.'],
  ['Pés mais à frente aumentam o trabalho dos glúteos.', 'Mantenha a coluna neutra.']);
E('agachamento_goblet', 'Agachamento Goblet (halter)', ['quadriceps', 'gluteos'], ['abdomen'], 'halteres', 'goblet', 'dumbbell', { c: 1, al: ['goblet'] },
  'Segure um halter na vertical junto ao peito, pés um pouco mais abertos que os ombros.',
  ['Agache mantendo o tronco ereto e o halter junto ao peito.', 'Desça até os cotovelos passarem entre os joelhos.', 'Suba empurrando o chão.'],
  ['Excelente para aprender o agachamento.', 'Peito sempre aberto.']);
E('agachamento_sumo', 'Agachamento Sumô (halter)', ['adutores', 'gluteos', 'quadriceps'], [], 'halteres', 'goblet', 'dumbbell', { c: 1 },
  'Pés bem afastados com as pontas para fora. Segure um halter com as duas mãos entre as pernas.',
  ['Agache descendo o quadril reto para baixo.', 'Mantenha os joelhos abertos.', 'Suba contraindo glúteos e parte interna das coxas.'],
  ['Tronco o mais ereto possível.', 'Não deixe os joelhos caírem para dentro.']);
E('agachamento_corporal', 'Agachamento (peso corporal)', ['quadriceps', 'gluteos'], ['isquiotibiais'], 'corporal', 'squat_bw', null, { c: 1 },
  'Em pé, pés na largura dos ombros e braços à frente para equilíbrio.',
  ['Agache levando o quadril para trás.', 'Desça até onde conseguir manter a coluna reta.', 'Suba empurrando o chão.'],
  ['Ótimo para aquecer ou treinar em casa.', 'Mantenha os calcanhares no chão.']);
E('agachamento_bulgaro', 'Agachamento Búlgaro (halteres)', ['quadriceps', 'gluteos'], ['isquiotibiais', 'adutores'], 'halteres', 'bulgarian', 'dumbbell', { c: 1, lvl: 2, al: ['bulgaro'] },
  'De costas para um banco, apoie o peito de um pé sobre ele e dê um passo largo à frente com o outro pé. Segure os halteres ao lado do corpo.',
  ['Desça dobrando o joelho da frente até a coxa ficar paralela ao chão.', 'Suba empurrando com o calcanhar da frente.', 'Complete as repetições e troque de perna.'],
  ['Tronco levemente inclinado foca mais os glúteos.', 'Ajuste a distância até ficar estável.']);
E('leg_press', 'Leg Press 45°', ['quadriceps', 'gluteos'], ['isquiotibiais', 'adutores'], 'maquina', 'leg_press', 'sled', { c: 1, al: ['leg press', 'leg press 45', 'leg press aberto'] },
  'Sente na máquina com as costas e o quadril apoiados e os pés na plataforma na largura dos ombros.',
  ['Destrave a plataforma e desça dobrando os joelhos até cerca de 90°.', 'Empurre a plataforma de volta sem travar os joelhos.', 'Repita mantendo o quadril no banco.'],
  ['Pés mais altos = mais glúteos; mais baixos = mais quadríceps.', 'Não deixe a lombar sair do encosto no final da descida.']);
E('hack', 'Agachamento Hack (máquina)', ['quadriceps'], ['gluteos'], 'maquina', 'squat', 'barbell_back', { c: 1, al: ['hack'] },
  'Posicione as costas no encosto e os ombros sob as almofadas, pés na plataforma na largura do quadril.',
  ['Destrave e desça dobrando os joelhos.', 'Vá até as coxas ficarem paralelas à plataforma.', 'Suba empurrando a plataforma.'],
  ['Joelhos alinhados com os pés.', 'Mantenha as costas coladas no encosto.']);
E('cadeira_extensora', 'Cadeira Extensora', ['quadriceps'], [], 'maquina', 'leg_extension', 'pad', { al: ['extensora', 'extensao de pernas', 'extensão de pernas (máquina)'] },
  'Sente na máquina com as costas apoiadas e o rolo na frente dos tornozelos. Alinhe o joelho com o eixo da máquina.',
  ['Estenda os joelhos até as pernas ficarem retas.', 'Contraia o quadríceps por 1 segundo.', 'Desça devagar sem deixar o peso bater.'],
  ['Segure nas pegadas laterais para não levantar o quadril.', 'Ótimo para finalizar o treino de pernas.']);
E('mesa_flexora', 'Mesa Flexora', ['isquiotibiais'], ['panturrilhas'], 'maquina', 'leg_curl', 'pad', { al: ['flexora', 'mesa flexora'] },
  'Deite de bruços na máquina com o rolo logo acima dos calcanhares e os joelhos fora do banco.',
  ['Flexione os joelhos trazendo os calcanhares em direção aos glúteos.', 'Segure por um instante.', 'Volte devagar.'],
  ['Não tire o quadril do banco.', 'Controle a fase de descida.']);
E('cadeira_flexora', 'Cadeira Flexora', ['isquiotibiais'], [], 'maquina', 'seated_leg_curl', 'pad', { al: ['flexao de pernas sentado', 'flexão de pernas sentado (máquina)'] },
  'Sente na máquina com o rolo atrás dos tornozelos e a trava sobre as coxas.',
  ['Flexione os joelhos levando os calcanhares para baixo e para trás.', 'Contraia por um instante.', 'Volte devagar até estender.'],
  ['Mantenha as costas apoiadas.', 'Movimento controlado em toda a amplitude.']);
E('stiff', 'Stiff (barra)', ['isquiotibiais', 'gluteos'], ['lombares'], 'barra', 'stiff', 'barbell', { c: 1, lvl: 2, al: ['stiff', 'levantamento terra romeno', 'terra romeno'] },
  'Em pé, segure a barra à frente das coxas com os joelhos levemente flexionados.',
  ['Incline o tronco à frente levando o quadril para trás, com a barra perto das pernas.', 'Desça até sentir alongar a parte de trás das coxas.', 'Volte estendendo o quadril.'],
  ['Coluna sempre reta.', 'O movimento é do quadril, não da lombar.']);
E('afundo', 'Afundo (halteres)', ['quadriceps', 'gluteos'], ['isquiotibiais'], 'halteres', 'lunge', 'dumbbell', { c: 1, al: ['afundo', 'avanco'] },
  'Em pé com um halter em cada mão, dê um passo largo à frente.',
  ['Desça o quadril até os dois joelhos ficarem a cerca de 90°.', 'O joelho de trás quase toca o chão.', 'Suba empurrando com a perna da frente.'],
  ['Tronco ereto.', 'Joelho da frente não deve passar muito da ponta do pé.']);
E('passada', 'Passada (halteres)', ['quadriceps', 'gluteos'], ['isquiotibiais', 'adutores'], 'halteres', 'lunge', 'dumbbell', { c: 1 },
  'Em pé com os halteres ao lado do corpo, em um espaço livre à frente.',
  ['Dê um passo à frente e desça o quadril.', 'Empurre com a perna da frente e traga a de trás para dar o próximo passo.', 'Alterne as pernas caminhando.'],
  ['Passos maiores trabalham mais os glúteos.', 'Mantenha o abdômen firme.']);
E('elevacao_pelvica', 'Elevação Pélvica (barra)', ['gluteos'], ['isquiotibiais'], 'barra', 'hip_thrust', 'barbell_hip', { c: 1, al: ['hip thrust', 'elevacao pelvica'] },
  'Apoie a parte alta das costas no banco, com a barra sobre o quadril (use uma almofada) e os pés firmes no chão.',
  ['Empurre o quadril para cima até o tronco ficar alinhado com as coxas.', 'Contraia os glúteos no topo por 1 segundo.', 'Desça o quadril devagar.'],
  ['Queixo levemente para baixo.', 'Canelas na vertical no topo do movimento.']);
E('gluteo_cabo', 'Glúteo no Cabo (coice)', ['gluteos'], ['isquiotibiais'], 'polia', 'glute_kick', 'cable_ankle', { al: ['coice', 'gluteo coice'] },
  'Prenda a tornozeleira na polia baixa e fique de frente para o aparelho, segurando-se nele.',
  ['Leve a perna para trás estendendo o quadril.', 'Contraia o glúteo no final.', 'Volte devagar sem encostar o peso.'],
  ['Não arqueie a lombar para subir mais.', 'Movimento curto e bem contraído.']);
E('cadeira_abdutora', 'Cadeira Abdutora', ['abdutores', 'gluteos'], [], 'maquina', 'abduction', 'none', { al: ['abdutora'] },
  'Sente na máquina com as costas apoiadas e as almofadas por fora dos joelhos.',
  ['Abra as pernas empurrando as almofadas para fora.', 'Segure por um instante.', 'Feche devagar.'],
  ['Inclinar o tronco à frente aumenta o trabalho dos glúteos.', 'Controle a volta.']);
E('cadeira_adutora', 'Cadeira Adutora', ['adutores'], [], 'maquina', 'abduction', 'none', { rev: 1, al: ['adutora'] },
  'Sente na máquina com as almofadas por dentro dos joelhos e as pernas abertas.',
  ['Feche as pernas apertando as almofadas.', 'Segure por um instante.', 'Abra devagar.'],
  ['Não deixe o peso “puxar” as pernas na volta.', 'Ajuste a amplitude inicial com conforto.']);
E('panturrilha_pe', 'Panturrilha em Pé', ['panturrilhas'], [], 'maquina', 'calf_raise', 'none', { al: ['panturrilha', 'gemeos'] },
  'Posicione a ponta dos pés em um degrau ou na plataforma da máquina, com os calcanhares para fora.',
  ['Suba na ponta dos pés o máximo possível.', 'Segure 1 segundo no topo.', 'Desça até alongar bem a panturrilha.'],
  ['Amplitude completa é o segredo.', 'Joelhos estendidos, sem travar.']);
E('panturrilha_sentado', 'Panturrilha Sentado', ['panturrilhas'], [], 'maquina', 'seated_calf', 'pad', {},
  'Sente na máquina com a almofada sobre as coxas e a ponta dos pés na plataforma.',
  ['Suba os calcanhares o máximo possível.', 'Segure no topo.', 'Desça alongando bem.'],
  ['Trabalha mais o sóleo (parte de baixo da panturrilha).', 'Ritmo lento.']);

/* ---------------- Abdômen / Core ---------------- */
E('abdominal_reto', 'Abdominal Reto', ['abdomen'], [], 'corporal', 'crunch', null, { al: ['abdominal', 'abdominal reto', 'crunch'] },
  'Deite de costas com os joelhos dobrados e os pés no chão. Mãos atrás da cabeça ou cruzadas no peito.',
  ['Suba o tronco tirando as escápulas do chão.', 'Contraia o abdômen no topo.', 'Desça devagar.'],
  ['Não puxe o pescoço com as mãos.', 'Solte o ar ao subir.']);
E('abdominal_bicicleta', 'Abdominal Bicicleta', ['abdomen', 'obliquos'], [], 'corporal', 'crunch', null, {},
  'Deite de costas com as mãos atrás da cabeça e as pernas elevadas, joelhos dobrados.',
  ['Leve o cotovelo direito em direção ao joelho esquerdo enquanto estende a perna direita.', 'Alterne os lados como se pedalasse.', 'Mantenha a lombar no chão.'],
  ['Movimento controlado, sem pressa.', 'Gire o tronco, não só os cotovelos.']);
E('abdominal_infra', 'Elevação de Pernas (abdominal infra)', ['abdomen'], ['obliquos'], 'corporal', 'leg_raise', null, { al: ['infra', 'abdominal infra'] },
  'Deite de costas com as pernas estendidas e as mãos ao lado do corpo ou sob o quadril.',
  ['Eleve as pernas até formarem cerca de 90° com o tronco.', 'Desça devagar sem encostar os pés no chão.', 'Repita mantendo a lombar apoiada.'],
  ['Joelhos levemente dobrados deixam mais fácil.', 'Não use impulso.']);
E('elevacao_pernas_barra', 'Elevação de Pernas na Barra', ['abdomen'], ['obliquos', 'antebracos'], 'corporal', 'hanging_raise', null, { lvl: 3 },
  'Pendure-se na barra fixa com os braços estendidos.',
  ['Eleve as pernas à frente até a altura do quadril ou mais.', 'Desça devagar sem balançar.', 'Repita com controle.'],
  ['Comece com os joelhos dobrados.', 'Evite balanço do corpo.']);
E('prancha', 'Prancha', ['abdomen'], ['obliquos', 'ombros', 'gluteos'], 'corporal', 'plank', null, { al: ['prancha abdominal'] },
  'Apoie os antebraços no chão com os cotovelos sob os ombros e estenda as pernas.',
  ['Eleve o quadril formando uma linha reta da cabeça aos pés.', 'Contraia abdômen e glúteos.', 'Mantenha a posição pelo tempo definido (registre os segundos como repetições).'],
  ['Não deixe o quadril cair.', 'Respire normalmente.']);
E('prancha_lateral', 'Prancha Lateral', ['obliquos'], ['abdomen', 'ombros'], 'corporal', 'plank', null, {},
  'Deite de lado apoiado em um antebraço, cotovelo sob o ombro e pernas estendidas.',
  ['Eleve o quadril alinhando o corpo.', 'Mantenha a posição.', 'Troque de lado.'],
  ['Quadril alto e alinhado.', 'Registre os segundos como repetições.']);
E('abdominal_polia', 'Abdominal na Polia (ajoelhado)', ['abdomen'], ['obliquos'], 'polia', 'cable_crunch', 'handle', { lvl: 2 },
  'Ajoelhe de frente para a polia alta segurando a corda ao lado da cabeça.',
  ['Flexione o tronco levando os cotovelos em direção às coxas.', 'Contraia o abdômen no final.', 'Volte devagar.'],
  ['O quadril fica parado: quem se move é a coluna.', 'Permite progredir com carga.']);
E('abdominal_maquina', 'Abdominal na Máquina', ['abdomen'], [], 'maquina', 'crunch', null, {},
  'Sente na máquina, segure as pegadas e apoie os pés.',
  ['Flexione o tronco à frente contraindo o abdômen.', 'Segure por um instante.', 'Volte devagar.'],
  ['Use carga moderada.', 'Movimento curto e controlado.']);
E('russian_twist', 'Giro Russo', ['obliquos'], ['abdomen'], 'corporal', 'crunch', null, {},
  'Sente no chão com os joelhos dobrados, incline o tronco para trás e tire os pés do chão (ou mantenha apoiados).',
  ['Gire o tronco levando as mãos para um lado.', 'Gire para o outro lado.', 'Conte cada lado como uma repetição.'],
  ['Segure uma anilha para dificultar.', 'Coluna reta.']);

/* ---------------- Cardio ---------------- */
E('esteira', 'Esteira (corrida/caminhada)', ['cardio'], ['quadriceps', 'panturrilhas'], 'cardio', 'run', null, { al: ['esteira', 'corrida', 'caminhada'] },
  'Suba na esteira, ajuste a velocidade inicial baixa e posicione-se no centro.',
  ['Aqueça caminhando 3–5 minutos.', 'Aumente a velocidade/inclinação até a intensidade desejada.', 'Desacelere aos poucos no final.'],
  ['Registre os minutos no campo “reps”.', 'Postura ereta, sem segurar no corrimão.']);
E('bicicleta', 'Bicicleta Ergométrica', ['cardio'], ['quadriceps'], 'cardio', 'bike', null, { al: ['bike', 'bicicleta'] },
  'Ajuste o banco para que a perna fique quase estendida com o pedal embaixo.',
  ['Pedale em ritmo leve para aquecer.', 'Aumente a carga ou o ritmo.', 'Finalize com 2–3 minutos leves.'],
  ['Registre os minutos no campo “reps”.', 'Ótimo cardio de baixo impacto.']);
E('eliptico', 'Elíptico (transport)', ['cardio'], ['quadriceps', 'gluteos'], 'cardio', 'run', null, { al: ['transport', 'eliptico'] },
  'Suba no aparelho, segure as alças e comece a pedalar devagar.',
  ['Mantenha um ritmo constante.', 'Use os braços para ajudar no movimento.', 'Ajuste a resistência conforme o objetivo.'],
  ['Registre os minutos no campo “reps”.', 'Baixo impacto nas articulações.']);
E('pular_corda', 'Pular Corda', ['cardio'], ['panturrilhas'], 'corporal', 'jump', null, {},
  'Segure as pontas da corda com os cotovelos próximos ao corpo.',
  ['Gire a corda usando os punhos.', 'Salte baixo, só o suficiente para a corda passar.', 'Mantenha um ritmo constante.'],
  ['Registre os minutos ou saltos.', 'Aterrisse na ponta dos pés.']);
E('polichinelo', 'Polichinelo', ['cardio'], ['ombros', 'panturrilhas'], 'corporal', 'jack', null, {},
  'Em pé com os pés juntos e os braços ao lado do corpo.',
  ['Salte abrindo as pernas e levando os braços acima da cabeça.', 'Salte de volta à posição inicial.', 'Repita em ritmo constante.'],
  ['Ótimo para aquecer.', 'Aterrisse suavemente.']);
E('burpee', 'Burpee', ['cardio'], ['peitoral', 'quadriceps', 'abdomen'], 'corporal', 'pushup', null, { lvl: 2 },
  'Em pé com os pés na largura dos ombros.',
  ['Agache e apoie as mãos no chão.', 'Jogue as pernas para trás e faça uma flexão.', 'Volte as pernas, levante e salte com os braços para cima.'],
  ['Mantenha o ritmo, mesmo que mais devagar.', 'Excelente para queimar calorias.']);
E('escada', 'Escada / Simulador de Escada', ['cardio'], ['gluteos', 'quadriceps'], 'cardio', 'run', null, {},
  'Suba no aparelho e segure levemente nas alças.',
  ['Comece em ritmo leve.', 'Aumente o ritmo até a intensidade desejada.', 'Desacelere ao final.'],
  ['Registre os minutos no campo “reps”.', 'Não apoie o peso do corpo nas alças.']);
E('remo_ergometro', 'Remo Ergômetro', ['cardio'], ['dorsais', 'quadriceps'], 'cardio', 'seated_row', 'handle', {},
  'Sente no aparelho, prenda os pés e segure a pegada com os braços estendidos.',
  ['Empurre com as pernas primeiro.', 'Depois incline levemente o tronco e puxe a pegada até o abdômen.', 'Volte na ordem inversa.'],
  ['Pernas, tronco, braços — e volta: braços, tronco, pernas.', 'Registre minutos no campo “reps”.']);

const EX_BY_ID = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/* ---------------- Programas prontos (Explorar) ----------------
   dias: { diaDaSemana(0=dom): [título, [[exId, séries, reps, descanso, técnica?], ...]] } */
const PROGRAMS = [
  {
    id: 'p_iniciante', name: 'Primeiros Passos', sub: 'Corpo inteiro para iniciantes',
    goal: 'hipertrofia', level: 1, place: 'academia', weeks: 8,
    desc: 'Treino de corpo inteiro 3x por semana para quem está começando. Usa máquinas e movimentos simples para aprender a técnica com segurança, ganhar força e criar o hábito de treinar.',
    days: {
      1: ['Corpo Inteiro A', [['leg_press', 3, '12', 90], ['supino_maquina', 3, '12', 90], ['puxada_frontal', 3, '12', 90], ['desenvolvimento_maquina', 3, '12', 60], ['cadeira_flexora', 3, '12', 60], ['prancha', 3, '30', 45]]],
      3: ['Corpo Inteiro B', [['agachamento_goblet', 3, '12', 90], ['supino_reto_halteres', 3, '12', 90], ['remada_baixa', 3, '12', 90], ['elevacao_lateral', 3, '12', 60], ['rosca_alternada', 2, '12', 60], ['triceps_corda', 2, '12', 60]]],
      5: ['Corpo Inteiro A', [['leg_press', 3, '12', 90], ['supino_maquina', 3, '12', 90], ['puxada_frontal', 3, '12', 90], ['desenvolvimento_maquina', 3, '12', 60], ['cadeira_flexora', 3, '12', 60], ['abdominal_reto', 3, '15', 45]]],
    },
  },
  {
    id: 'p_abc', name: 'ABC Clássico', sub: 'Hipertrofia em 3 divisões',
    goal: 'hipertrofia', level: 2, place: 'academia', weeks: 12,
    desc: 'A divisão mais popular das academias: peito e tríceps, costas e bíceps, pernas e ombros. Pode ser feito 3x (A-B-C) ou 6x por semana (repetindo).',
    days: {
      1: ['A — Peito e Tríceps', [['supino_reto_barra', 4, '8-10', 120], ['supino_inclinado_halteres', 3, '10-12', 90], ['crucifixo_maquina', 3, '12', 60], ['paralelas', 3, '10', 90], ['triceps_corda', 3, '12', 60], ['triceps_frances', 3, '12', 60]]],
      3: ['B — Costas e Bíceps', [['puxada_frontal', 4, '10', 90], ['remada_curvada', 4, '8-10', 120], ['remada_baixa', 3, '12', 90], ['pulldown_braco_reto', 3, '12', 60], ['rosca_direta', 3, '10', 60], ['rosca_martelo', 3, '12', 60]]],
      5: ['C — Pernas e Ombros', [['agachamento_livre', 4, '8-10', 150], ['leg_press', 3, '12', 120], ['cadeira_extensora', 3, '12', 60], ['mesa_flexora', 3, '12', 60], ['desenvolvimento_halteres', 3, '10', 90], ['elevacao_lateral', 3, '15', 60], ['panturrilha_pe', 4, '15', 45]]],
    },
  },
  {
    id: 'p_abcd', name: 'ABCD Avançado', sub: 'Mais volume por grupo',
    goal: 'hipertrofia', level: 3, place: 'academia', weeks: 12,
    desc: 'Quatro divisões com alto volume para quem já treina há mais de um ano. Cada grupo muscular recebe atenção total em seu dia.',
    days: {
      1: ['A — Peito', [['supino_reto_barra', 4, '6-8', 150], ['supino_inclinado_barra', 4, '8-10', 120], ['supino_declinado_barra', 3, '10', 90], ['crossover', 3, '12-15', 60], ['crucifixo_halteres', 3, '12', 60]]],
      2: ['B — Costas', [['barra_fixa', 4, '6-10', 120], ['remada_curvada', 4, '8', 120], ['remada_unilateral', 3, '10', 90], ['puxada_triangulo', 3, '12', 90], ['encolhimento', 4, '12', 60], ['hiperextensao', 3, '15', 60]]],
      4: ['C — Pernas', [['agachamento_livre', 5, '5-8', 180], ['leg_press', 4, '10', 120], ['stiff', 4, '8-10', 120], ['cadeira_extensora', 3, '15', 60, 'dropset'], ['mesa_flexora', 3, '12', 60], ['panturrilha_pe', 5, '12', 45]]],
      5: ['D — Ombros e Braços', [['desenvolvimento_barra', 4, '8', 120], ['elevacao_lateral', 4, '12-15', 60, 'dropset'], ['face_pull', 3, '15', 60], ['rosca_direta', 3, '10', 60, 'superserie'], ['triceps_testa', 3, '10', 90], ['rosca_martelo', 3, '12', 60, 'superserie'], ['triceps_corda', 3, '12', 60]]],
    },
  },
  {
    id: 'p_ppl', name: 'Push Pull Legs', sub: 'Empurrar · Puxar · Pernas',
    goal: 'hipertrofia', level: 3, place: 'academia', weeks: 12,
    desc: 'Divisão por padrão de movimento, feita 2x na semana (6 dias). Alta frequência e volume para quem tem tempo e experiência.',
    days: {
      1: ['Push — Empurrar', [['supino_reto_barra', 4, '6-8', 150], ['desenvolvimento_halteres', 3, '8-10', 120], ['supino_inclinado_halteres', 3, '10', 90], ['elevacao_lateral', 4, '15', 60], ['triceps_corda', 3, '12', 60]]],
      2: ['Pull — Puxar', [['levantamento_terra', 3, '5', 180], ['barra_fixa', 4, '8', 120], ['remada_baixa', 3, '10', 90], ['face_pull', 3, '15', 60], ['rosca_alternada', 3, '10', 60]]],
      3: ['Legs — Pernas', [['agachamento_livre', 4, '6-8', 180], ['stiff', 3, '10', 120], ['leg_press', 3, '12', 120], ['cadeira_flexora', 3, '12', 60], ['panturrilha_sentado', 4, '15', 45]]],
      4: ['Push — Empurrar', [['supino_inclinado_barra', 4, '8', 120], ['paralelas', 3, '10', 90], ['desenvolvimento_maquina', 3, '10', 90], ['crossover', 3, '15', 60], ['triceps_frances', 3, '12', 60]]],
      5: ['Pull — Puxar', [['remada_curvada', 4, '8', 120], ['puxada_frontal', 3, '10', 90], ['remada_unilateral', 3, '10', 90], ['crucifixo_inverso', 3, '15', 60], ['rosca_martelo', 3, '12', 60]]],
      6: ['Legs — Pernas', [['agachamento_bulgaro', 3, '10', 120], ['elevacao_pelvica', 4, '10', 120], ['hack', 3, '12', 120], ['mesa_flexora', 3, '12', 60], ['panturrilha_pe', 4, '15', 45]]],
    },
  },
  {
    id: 'p_upper_lower', name: 'Superior / Inferior', sub: 'Força e hipertrofia 4x',
    goal: 'forca', level: 2, place: 'academia', weeks: 10,
    desc: 'Alterna dias de membros superiores e inferiores. Combina básicos pesados (força) com acessórios (hipertrofia). Ótimo custo-benefício para 4 dias.',
    days: {
      1: ['Superior — Força', [['supino_reto_barra', 4, '5', 180], ['remada_curvada', 4, '5', 180], ['desenvolvimento_barra', 3, '6', 150], ['barra_fixa', 3, '6-8', 120], ['triceps_testa', 2, '10', 60]]],
      2: ['Inferior — Força', [['agachamento_livre', 4, '5', 180], ['stiff', 3, '6', 150], ['leg_press', 3, '8', 120], ['panturrilha_pe', 4, '10', 60], ['prancha', 3, '45', 45]]],
      4: ['Superior — Volume', [['supino_inclinado_halteres', 3, '10', 90], ['remada_baixa', 3, '10', 90], ['elevacao_lateral', 3, '15', 60], ['puxada_frontal', 3, '12', 90], ['rosca_alternada', 3, '12', 60], ['triceps_corda', 3, '12', 60]]],
      5: ['Inferior — Volume', [['agachamento_bulgaro', 3, '10', 90], ['elevacao_pelvica', 3, '12', 90], ['cadeira_extensora', 3, '15', 60], ['mesa_flexora', 3, '15', 60], ['abdominal_infra', 3, '15', 45]]],
    },
  },
  {
    id: 'p_5x5', name: 'Força 5x5', sub: 'Básicos pesados 3x',
    goal: 'forca', level: 2, place: 'academia', weeks: 12,
    desc: 'Programa clássico de força: poucos exercícios multiarticulares, 5 séries de 5, aumentando a carga sempre que completar todas as repetições.',
    days: {
      1: ['Treino A', [['agachamento_livre', 5, '5', 180], ['supino_reto_barra', 5, '5', 180], ['remada_curvada', 5, '5', 180]]],
      3: ['Treino B', [['agachamento_livre', 5, '5', 180], ['desenvolvimento_barra', 5, '5', 180], ['levantamento_terra', 1, '5', 240]]],
      5: ['Treino A', [['agachamento_livre', 5, '5', 180], ['supino_reto_barra', 5, '5', 180], ['remada_curvada', 5, '5', 180]]],
    },
  },
  {
    id: 'p_emagrecer', name: 'Emagrecer com Saúde', sub: 'Musculação + cardio',
    goal: 'emagrecer', level: 1, place: 'academia', weeks: 8,
    desc: 'Combina musculação em circuito com descansos curtos e cardio no final. Ajuda a preservar músculos enquanto aumenta o gasto calórico.',
    days: {
      1: ['Superior + Cardio', [['supino_maquina', 3, '15', 45], ['puxada_frontal', 3, '15', 45], ['desenvolvimento_maquina', 3, '15', 45], ['remada_baixa', 3, '15', 45], ['esteira', 1, '20', 0]]],
      3: ['Inferior + Cardio', [['leg_press', 3, '15', 45], ['cadeira_extensora', 3, '15', 45], ['mesa_flexora', 3, '15', 45], ['elevacao_pelvica', 3, '15', 45], ['bicicleta', 1, '20', 0]]],
      5: ['Corpo Inteiro + Cardio', [['agachamento_goblet', 3, '15', 45], ['flexao', 3, '12', 45], ['remada_unilateral', 3, '12', 45], ['abdominal_reto', 3, '20', 30], ['eliptico', 1, '25', 0]]],
    },
  },
  {
    id: 'p_casa', name: 'Treino em Casa', sub: 'Sem equipamentos',
    goal: 'definicao', level: 1, place: 'casa', weeks: 6,
    desc: 'Só com o peso do corpo: ideal para dias sem academia, viagens ou para começar em casa. Faça em circuito para deixar mais intenso.',
    days: {
      1: ['Superior', [['flexao_joelhos', 3, '12', 45], ['flexao', 3, '8', 60], ['triceps_banco', 3, '12', 45], ['prancha', 3, '30', 30], ['abdominal_reto', 3, '15', 30], ['abdominal_bicicleta', 3, '20', 30]]],
      3: ['Inferior', [['agachamento_corporal', 4, '20', 45], ['afundo', 3, '12', 45], ['elevacao_pelvica', 3, '15', 45], ['panturrilha_pe', 3, '20', 30], ['abdominal_infra', 3, '15', 30]]],
      5: ['Cardio e Core', [['polichinelo', 3, '40', 30], ['burpee', 3, '10', 45], ['pular_corda', 3, '60', 30], ['prancha_lateral', 3, '30', 30], ['russian_twist', 3, '20', 30]]],
    },
  },
  {
    id: 'p_gluteos', name: 'Foco em Glúteos e Pernas', sub: 'Inferiores com ênfase',
    goal: 'hipertrofia', level: 2, place: 'academia', weeks: 10,
    desc: 'Dois dias de inferiores com ênfase em glúteos e um dia de superiores para manter o equilíbrio. Muito usado em treinos femininos, mas serve para qualquer pessoa.',
    days: {
      1: ['Glúteos e Posteriores', [['elevacao_pelvica', 4, '10', 120], ['stiff', 3, '10', 120], ['agachamento_bulgaro', 3, '10', 90], ['gluteo_cabo', 3, '15', 45], ['cadeira_abdutora', 3, '20', 45]]],
      3: ['Superiores', [['puxada_frontal', 3, '12', 90], ['supino_reto_halteres', 3, '12', 90], ['remada_baixa', 3, '12', 90], ['elevacao_lateral', 3, '15', 60], ['triceps_corda', 3, '12', 60], ['abdominal_reto', 3, '20', 30]]],
      5: ['Quadríceps e Glúteos', [['agachamento_livre', 4, '8-10', 150], ['leg_press', 3, '12', 120], ['afundo', 3, '12', 90], ['cadeira_extensora', 3, '15', 60], ['cadeira_adutora', 3, '15', 45], ['panturrilha_pe', 3, '15', 45]]],
    },
  },
  {
    id: 'p_definicao', name: 'Definição Muscular', sub: 'Volume alto, descanso curto',
    goal: 'definicao', level: 2, place: 'academia', weeks: 8,
    desc: 'Séries de 12–15 repetições com descansos curtos e super-séries. Mantém a musculatura enquanto aumenta o gasto calórico do treino.',
    days: {
      1: ['Peito, Ombros e Tríceps', [['supino_inclinado_halteres', 4, '12', 60], ['crossover', 3, '15', 45, 'superserie'], ['flexao', 3, '12', 45], ['elevacao_lateral', 4, '15', 45], ['triceps_corda', 3, '15', 45, 'superserie'], ['triceps_banco', 3, '15', 45]]],
      2: ['Pernas', [['leg_press', 4, '15', 60], ['afundo', 3, '12', 60], ['cadeira_extensora', 3, '15', 45, 'superserie'], ['cadeira_flexora', 3, '15', 45], ['panturrilha_pe', 4, '20', 30], ['bicicleta', 1, '15', 0]]],
      4: ['Costas e Bíceps', [['puxada_frontal', 4, '12', 60], ['remada_unilateral', 3, '12', 60], ['pulldown_braco_reto', 3, '15', 45], ['rosca_alternada', 3, '12', 45, 'superserie'], ['rosca_martelo', 3, '12', 45], ['esteira', 1, '15', 0]]],
      5: ['Core e Cardio', [['abdominal_polia', 4, '15', 45], ['abdominal_infra', 3, '15', 30], ['prancha', 3, '45', 30], ['russian_twist', 3, '20', 30], ['eliptico', 1, '25', 0]]],
    },
  },
];

const GOALS = {
  hipertrofia: { n: 'Hipertrofia', d: 'Ganhar massa muscular', reps: '8-12', sets: 3, rest: 90, c: '#ff7a1a' },
  forca: { n: 'Força', d: 'Levantar mais peso', reps: '4-6', sets: 4, rest: 150, c: '#e01010' },
  emagrecer: { n: 'Perder peso', d: 'Queimar gordura', reps: '12-15', sets: 3, rest: 45, c: '#2ecc71' },
  definicao: { n: 'Definição', d: 'Músculos marcados', reps: '12-15', sets: 3, rest: 60, c: '#3a8dff' },
  resistencia: { n: 'Resistência', d: 'Mais fôlego', reps: '15-20', sets: 3, rest: 45, c: '#2bc4c4' },
};
const LEVELS = { 1: 'Iniciante', 2: 'Intermediário', 3: 'Avançado' };
const TECHNIQUES = {
  '': { n: 'Normal', s: '' },
  piramide: { n: 'Pirâmide', s: 'P', d: 'Aumente a carga a cada série e diminua as repetições.' },
  superserie: { n: 'Super-série', s: 'S', d: 'Faça este exercício e o próximo em sequência, sem descanso entre eles.' },
  dropset: { n: 'Drop-set', s: 'D', d: 'Na última série, ao chegar na falha, reduza a carga ~20% e continue sem descanso.' },
  falha: { n: 'Até a falha', s: 'F', d: 'Na última série, faça repetições até não conseguir mais com boa técnica.' },
};

/* ---------------- Conquistas ---------------- */
const ACHIEVEMENTS = [
  { id: 'first', n: 'Primeiro passo', d: 'Registre seu primeiro treino', ic: '🏁' },
  { id: 'w5', n: 'Pegando o ritmo', d: '5 treinos registrados', ic: '💪' },
  { id: 'w10', n: 'Dois dígitos', d: '10 treinos registrados', ic: '🔟' },
  { id: 'w25', n: 'Frequentador', d: '25 treinos registrados', ic: '🏋️' },
  { id: 'w50', n: 'Rato de academia', d: '50 treinos registrados', ic: '🐀' },
  { id: 'w100', n: 'Centenário', d: '100 treinos registrados', ic: '💯' },
  { id: 'w250', n: 'Lenda da Forja', d: '250 treinos registrados', ic: '👑' },
  { id: 's7', n: 'Chama acesa', d: 'Ofensiva de 7 treinos', ic: '🔥' },
  { id: 's20', n: 'Chama vermelha', d: 'Ofensiva de 20 treinos', ic: '❤️‍🔥' },
  { id: 's50', n: 'Chama azul', d: 'Ofensiva de 50 treinos', ic: '💙' },
  { id: 'ton1', n: 'Uma tonelada', d: 'Levante 1.000 kg em um único treino', ic: '🪨' },
  { id: 'ton5', n: 'Cinco toneladas', d: 'Levante 5.000 kg em um único treino', ic: '🏗️' },
  { id: 'tot100', n: '100 toneladas', d: '100.000 kg levantados no total', ic: '🚛' },
  { id: 'pr1', n: 'Recordista', d: 'Bata seu primeiro recorde pessoal', ic: '🏆' },
  { id: 'pr25', n: 'Máquina de recordes', d: 'Bata 25 recordes pessoais', ic: '🥇' },
  { id: 'early', n: 'Madrugador', d: 'Comece um treino antes das 7h', ic: '🌅' },
  { id: 'night', n: 'Coruja', d: 'Comece um treino depois das 21h', ic: '🦉' },
  { id: 'week', n: 'Semana perfeita', d: 'Cumpra todos os treinos planejados de uma semana', ic: '📅' },
  { id: 'body', n: 'De olho no corpo', d: 'Registre seu peso ou medidas', ic: '📏' },
  { id: 'photo', n: 'Antes e depois', d: 'Adicione uma foto de progresso', ic: '📸' },
  { id: 'variety', n: 'Variado', d: 'Faça 30 exercícios diferentes', ic: '🎯' },
];

const FAQ = [
  ['Meus dados ficam salvos onde?', 'Tudo fica salvo apenas neste aparelho, dentro do próprio app. Nada é enviado para servidores. Por isso, faça backups de vez em quando (Perfil → Exportar backup).'],
  ['Se eu apagar o app da tela inicial, perco tudo?', 'Sim, os dados são apagados junto. Antes de remover, exporte um backup e depois importe no app novo.'],
  ['Como funciona a ofensiva?', 'Cada dia com treino registrado soma 1. Dias de descanso do seu treino ativo não quebram a sequência; ela só zera se você pular um dia de treino programado.'],
  ['O que é 1RM?', 'É a estimativa da carga máxima que você levantaria em uma única repetição. Calculamos pela fórmula de Epley a partir do peso e das repetições de cada série.'],
  ['O que é volume?', 'É a soma de peso × repetições de todas as séries. Mostra quanto trabalho total você fez — subir o volume ao longo das semanas é sinal de progresso.'],
  ['Como a sugestão inteligente funciona?', 'Se no último treino você completou todas as repetições do alvo, o app sugere aumentar a carga. Se não completou, sugere manter e buscar mais repetições.'],
  ['As calorias são exatas?', 'Não. São estimativas baseadas no tempo de treino, no seu peso e no tipo de atividade (MET). Use como referência.'],
  ['Como recebo lembretes?', 'O iPhone não permite notificações automáticas em apps instalados assim sem um servidor. Em Perfil → Lembretes você gera eventos para o app Calendário, que avisam nos seus dias de treino.'],
  ['Os vídeos dos exercícios?', 'Cada exercício tem uma animação própria mostrando o movimento e um botão que abre vídeos do exercício no YouTube.'],
];
