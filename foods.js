'use strict';
/* =========================================================
   Forja — tabela de alimentos (valores por 100 g, aproximados,
   baseados na TACO/UNICAMP e em médias de rótulos)
   F(id, nome, kcal, proteína, carboidrato, gordura, fibra, porções, categoria)
   ========================================================= */
const FOODS = [];
const FOOD_CATS = { cereais: 'Cereais, pães e massas', leguminosas: 'Feijões e grãos', carnes: 'Carnes, peixes e ovos', laticinios: 'Leite e derivados', frutas: 'Frutas', vegetais: 'Verduras e legumes', gorduras: 'Óleos, castanhas e sementes', doces: 'Doces e açúcares', bebidas: 'Bebidas', pratos: 'Pratos prontos e salgados', suplementos: 'Suplementos' };
function F(id, n, kcal, p, c, f, fib, por, cat, al) { FOODS.push({ id, n, kcal, p, c, f, fib, por: por || [], cat, al: al || [] }); }

/* Cereais, pães, massas, tubérculos */
F('arroz_branco', 'Arroz branco cozido', 128, 2.5, 28.1, 0.2, 1.6, [['Colher de sopa cheia', 25], ['Escumadeira', 90]], 'cereais', ['arroz']);
F('arroz_integral', 'Arroz integral cozido', 124, 2.6, 25.8, 1.0, 2.7, [['Colher de sopa cheia', 25], ['Escumadeira', 90]], 'cereais');
F('macarrao', 'Macarrão cozido', 158, 5.8, 30.9, 0.9, 1.8, [['Pegador', 110], ['Prato raso', 220]], 'cereais', ['espaguete', 'massa']);
F('macarrao_molho', 'Macarrão ao molho de tomate', 120, 4.0, 22.0, 2.0, 1.8, [['Prato raso', 250]], 'pratos');
F('pao_frances', 'Pão francês', 300, 8.0, 58.6, 3.1, 2.3, [['Unidade', 50]], 'cereais', ['pão de sal', 'pãozinho']);
F('pao_forma', 'Pão de forma', 253, 12.0, 44.1, 2.7, 2.3, [['Fatia', 25]], 'cereais');
F('pao_integral', 'Pão de forma integral', 253, 9.4, 49.9, 3.7, 6.9, [['Fatia', 25]], 'cereais');
F('pao_queijo', 'Pão de queijo', 363, 5.1, 34.2, 24.6, 0.6, [['Unidade média', 30]], 'cereais');
F('tapioca', 'Tapioca (goma)', 240, 0.1, 59.0, 0.1, 0.1, [['Tapioca média', 60]], 'cereais', ['beiju']);
F('cuscuz', 'Cuscuz de milho cozido', 113, 2.2, 25.3, 0.7, 2.1, [['Fatia', 100]], 'cereais');
F('aveia', 'Aveia em flocos', 394, 13.9, 66.6, 8.5, 9.1, [['Colher de sopa', 15]], 'cereais');
F('granola', 'Granola', 420, 10.0, 66.0, 13.0, 7.0, [['Colher de sopa', 15], ['Xícara', 60]], 'cereais');
F('cereal_matinal', 'Cereal matinal (flocos de milho)', 365, 7.2, 83.8, 1.0, 4.1, [['Xícara', 30]], 'cereais', ['sucrilhos', 'corn flakes']);
F('biscoito_cracker', 'Biscoito cream cracker', 432, 10.1, 68.7, 14.4, 2.5, [['Unidade', 6]], 'cereais', ['bolacha água e sal']);
F('biscoito_recheado', 'Biscoito recheado', 472, 6.4, 70.5, 19.6, 3.0, [['Unidade', 14]], 'doces', ['bolacha recheada']);
F('batata_cozida', 'Batata inglesa cozida', 52, 1.2, 11.9, 0.0, 1.3, [['Unidade média', 130]], 'cereais', ['batata']);
F('batata_doce', 'Batata-doce cozida', 77, 0.6, 18.4, 0.1, 2.2, [['Unidade média', 130], ['Fatia', 40]], 'cereais');
F('mandioca', 'Mandioca cozida', 125, 0.6, 30.1, 0.3, 1.6, [['Pedaço', 70]], 'cereais', ['aipim', 'macaxeira']);
F('batata_frita', 'Batata frita', 267, 5.0, 35.6, 13.1, 8.1, [['Porção pequena', 80], ['Porção média', 120]], 'pratos', ['fritas']);
F('pure_batata', 'Purê de batata', 89, 1.8, 13.0, 3.5, 1.2, [['Colher de servir', 60]], 'pratos');
F('milho', 'Milho verde cozido', 98, 3.2, 17.1, 2.4, 4.6, [['Colher de sopa', 20], ['Espiga', 100]], 'cereais');
F('farofa', 'Farofa de mandioca', 406, 2.1, 80.3, 9.1, 7.8, [['Colher de sopa', 15]], 'cereais');
F('farinha_mandioca', 'Farinha de mandioca', 361, 1.6, 87.9, 0.3, 6.4, [['Colher de sopa', 15]], 'cereais');
F('pizza_mussarela', 'Pizza de mussarela', 265, 11.5, 30.0, 11.0, 1.8, [['Fatia', 110]], 'pratos', ['pizza']);
F('lasanha', 'Lasanha à bolonhesa', 170, 9.0, 14.0, 8.5, 1.0, [['Pedaço', 250]], 'pratos');

/* Feijões e grãos */
F('feijao_carioca', 'Feijão carioca cozido', 76, 4.8, 13.6, 0.5, 8.5, [['Concha média', 140], ['Colher de sopa', 20]], 'leguminosas', ['feijão']);
F('feijao_preto', 'Feijão preto cozido', 77, 4.5, 14.0, 0.5, 8.4, [['Concha média', 140]], 'leguminosas');
F('lentilha', 'Lentilha cozida', 93, 6.3, 16.3, 0.5, 7.9, [['Concha média', 140]], 'leguminosas');
F('grao_bico', 'Grão-de-bico cozido', 164, 8.9, 27.4, 2.6, 7.6, [['Colher de sopa', 25]], 'leguminosas');
F('feijoada', 'Feijoada', 117, 8.7, 11.6, 6.5, 5.1, [['Concha média', 150]], 'pratos');
F('soja', 'Soja cozida', 151, 12.8, 9.4, 7.0, 5.6, [['Colher de sopa', 25]], 'leguminosas');

/* Carnes, peixes, ovos */
F('frango_grelhado', 'Peito de frango grelhado', 159, 32.0, 0.0, 2.5, 0, [['Filé médio', 100]], 'carnes', ['frango', 'peito de frango', 'filé de frango']);
F('frango_desfiado', 'Frango desfiado cozido', 163, 31.5, 0.0, 3.2, 0, [['Colher de sopa', 25]], 'carnes');
F('coxa_frango', 'Coxa de frango assada (com pele)', 215, 28.5, 0.0, 11.0, 0, [['Unidade', 90]], 'carnes', ['sobrecoxa']);
F('patinho', 'Patinho grelhado', 219, 35.9, 0.0, 7.3, 0, [['Bife médio', 100]], 'carnes', ['bife']);
F('carne_moida', 'Carne moída refogada', 212, 26.7, 0.0, 10.9, 0, [['Colher de sopa', 25], ['Colher de servir', 60]], 'carnes');
F('alcatra', 'Alcatra grelhada', 241, 31.9, 0.0, 11.6, 0, [['Bife médio', 100]], 'carnes');
F('contrafile', 'Contrafilé grelhado', 278, 32.4, 0.0, 15.5, 0, [['Bife médio', 120]], 'carnes');
F('picanha', 'Picanha grelhada', 289, 26.4, 0.0, 19.5, 0, [['Fatia', 80]], 'carnes');
F('costela', 'Costela bovina assada', 373, 28.8, 0.0, 27.7, 0, [['Pedaço', 120]], 'carnes');
F('carne_panela', 'Carne de panela', 215, 27.3, 0.0, 10.9, 0, [['Pedaço', 100]], 'carnes');
F('hamburguer', 'Hambúrguer bovino grelhado', 210, 20.0, 2.0, 13.5, 0, [['Unidade', 90]], 'carnes');
F('lombo_porco', 'Lombo de porco assado', 210, 35.7, 0.0, 6.4, 0, [['Fatia', 80]], 'carnes');
F('bisteca', 'Bisteca de porco grelhada', 280, 28.9, 0.0, 17.4, 0, [['Unidade', 110]], 'carnes');
F('linguica', 'Linguiça toscana grelhada', 296, 23.2, 0.0, 21.3, 0, [['Gomo', 70]], 'carnes', ['linguiça']);
F('salsicha', 'Salsicha', 257, 12.0, 3.0, 22.0, 0, [['Unidade', 50]], 'carnes');
F('bacon', 'Bacon frito', 466, 30.0, 1.0, 37.0, 0, [['Fatia', 10]], 'carnes');
F('presunto', 'Presunto', 94, 14.3, 2.1, 2.7, 0, [['Fatia', 15]], 'carnes');
F('peito_peru', 'Peito de peru fatiado', 102, 19.0, 2.0, 2.0, 0, [['Fatia', 15]], 'carnes');
F('tilapia', 'Tilápia grelhada', 128, 26.0, 0.0, 2.7, 0, [['Filé', 120]], 'carnes', ['peixe']);
F('salmao', 'Salmão grelhado', 229, 26.1, 0.0, 13.1, 0, [['Posta', 120]], 'carnes');
F('atum', 'Atum em lata', 166, 26.2, 0.0, 6.0, 0, [['Lata drenada', 120], ['Colher de sopa', 20]], 'carnes');
F('sardinha', 'Sardinha em lata (óleo)', 285, 15.9, 0.0, 24.0, 0, [['Unidade', 25]], 'carnes');
F('camarao', 'Camarão cozido', 90, 19.0, 0.0, 1.0, 0, [['Colher de sopa', 20]], 'carnes');
F('ovo_cozido', 'Ovo cozido', 146, 13.3, 0.6, 9.5, 0, [['Unidade', 50]], 'carnes', ['ovo']);
F('ovo_frito', 'Ovo frito', 240, 15.6, 1.2, 18.6, 0, [['Unidade', 50]], 'carnes');
F('ovo_mexido', 'Ovo mexido', 196, 13.5, 1.5, 15.0, 0, [['Colher de sopa', 30], ['2 ovos', 110]], 'carnes', ['omelete']);
F('clara', 'Clara de ovo cozida', 59, 13.4, 0.0, 0.1, 0, [['Unidade', 33]], 'carnes');
F('strogonoff_frango', 'Strogonoff de frango', 157, 15.0, 3.0, 9.0, 0.3, [['Colher de servir', 100]], 'pratos', ['estrogonofe']);
F('strogonoff_carne', 'Strogonoff de carne', 173, 15.0, 3.0, 11.0, 0.3, [['Colher de servir', 100]], 'pratos');
F('parmegiana', 'Frango à parmegiana', 220, 18.0, 8.0, 13.0, 0.5, [['Porção', 200]], 'pratos');

/* Leite e derivados */
F('leite_integral', 'Leite integral', 61, 2.9, 4.3, 3.2, 0, [['Copo (200 ml)', 200], ['Xícara', 150]], 'laticinios', ['leite']);
F('leite_desnatado', 'Leite desnatado', 35, 3.4, 4.9, 0.1, 0, [['Copo (200 ml)', 200]], 'laticinios');
F('leite_po', 'Leite em pó integral', 497, 25.4, 39.2, 26.9, 0, [['Colher de sopa', 15]], 'laticinios');
F('iogurte_natural', 'Iogurte natural integral', 51, 4.1, 1.9, 3.0, 0, [['Pote', 170]], 'laticinios', ['iogurte']);
F('iogurte_grego', 'Iogurte grego', 120, 5.0, 13.0, 5.5, 0, [['Pote', 100]], 'laticinios');
F('mussarela', 'Queijo mussarela', 330, 22.6, 3.0, 25.2, 0, [['Fatia', 20]], 'laticinios', ['queijo']);
F('minas_frescal', 'Queijo minas frescal', 264, 17.4, 3.2, 20.2, 0, [['Fatia', 30]], 'laticinios', ['queijo branco']);
F('queijo_prato', 'Queijo prato', 360, 22.7, 1.9, 29.1, 0, [['Fatia', 20]], 'laticinios');
F('parmesao', 'Queijo parmesão ralado', 453, 35.6, 1.7, 33.5, 0, [['Colher de sopa', 10]], 'laticinios');
F('requeijao', 'Requeijão cremoso', 257, 9.6, 2.4, 23.4, 0, [['Colher de sopa', 30]], 'laticinios');
F('manteiga', 'Manteiga', 726, 0.4, 0.1, 82.4, 0, [['Colher de chá', 5], ['Ponta de faca', 10]], 'gorduras');
F('margarina', 'Margarina', 596, 0.0, 0.0, 67.0, 0, [['Colher de chá', 5]], 'gorduras');

/* Frutas */
F('banana_prata', 'Banana prata', 98, 1.3, 26.0, 0.1, 2.0, [['Unidade', 65]], 'frutas', ['banana']);
F('banana_nanica', 'Banana nanica', 92, 1.4, 23.8, 0.1, 1.9, [['Unidade', 100]], 'frutas');
F('maca', 'Maçã', 56, 0.3, 15.2, 0.0, 1.3, [['Unidade', 130]], 'frutas');
F('laranja', 'Laranja', 37, 1.0, 8.9, 0.1, 0.8, [['Unidade', 140]], 'frutas');
F('mamao', 'Mamão papaia', 40, 0.5, 10.4, 0.1, 1.0, [['Meia unidade', 150]], 'frutas');
F('manga', 'Manga', 72, 0.4, 19.4, 0.2, 1.6, [['Unidade', 200]], 'frutas');
F('abacaxi', 'Abacaxi', 48, 0.9, 12.3, 0.1, 1.0, [['Fatia', 75]], 'frutas');
F('melancia', 'Melancia', 33, 0.9, 8.1, 0.0, 0.1, [['Fatia', 200]], 'frutas');
F('morango', 'Morango', 30, 0.9, 6.8, 0.3, 1.7, [['Unidade', 12], ['Xícara', 150]], 'frutas');
F('uva', 'Uva', 53, 0.7, 13.6, 0.2, 0.9, [['Cacho pequeno', 100], ['Unidade', 6]], 'frutas');
F('abacate', 'Abacate', 96, 1.2, 6.0, 8.4, 6.3, [['Colher de sopa', 30]], 'frutas');
F('goiaba', 'Goiaba', 54, 1.1, 13.0, 0.4, 6.2, [['Unidade', 170]], 'frutas');
F('pera', 'Pera', 53, 0.6, 14.0, 0.1, 3.0, [['Unidade', 130]], 'frutas');
F('kiwi', 'Kiwi', 51, 1.3, 11.5, 0.6, 2.7, [['Unidade', 75]], 'frutas');
F('acai', 'Açaí na tigela (com xarope)', 110, 0.7, 21.5, 3.7, 2.6, [['Tigela média', 300], ['Copo 500 ml', 450]], 'frutas', ['açaí']);

/* Verduras e legumes */
F('alface', 'Alface', 11, 1.3, 1.7, 0.2, 1.8, [['Prato de sobremesa', 30]], 'vegetais', ['salada verde']);
F('tomate', 'Tomate', 15, 1.1, 3.1, 0.2, 1.2, [['Unidade', 90], ['Fatia', 15]], 'vegetais');
F('salada_mista', 'Salada mista (alface, tomate, cenoura)', 20, 1.1, 3.8, 0.2, 1.8, [['Prato de sobremesa', 80]], 'vegetais', ['salada']);
F('cenoura_crua', 'Cenoura crua', 34, 1.3, 7.7, 0.2, 3.2, [['Colher de sopa ralada', 12]], 'vegetais', ['cenoura']);
F('cenoura_cozida', 'Cenoura cozida', 30, 0.8, 6.7, 0.2, 2.6, [['Colher de sopa', 25]], 'vegetais');
F('brocolis', 'Brócolis cozido', 25, 2.1, 4.4, 0.5, 3.4, [['Ramo', 30]], 'vegetais');
F('couve', 'Couve refogada', 90, 1.7, 8.7, 6.6, 5.7, [['Colher de sopa', 20]], 'vegetais');
F('abobrinha', 'Abobrinha refogada', 24, 1.1, 4.0, 0.5, 1.5, [['Colher de sopa', 30]], 'vegetais');
F('beterraba', 'Beterraba cozida', 32, 1.3, 7.2, 0.1, 1.9, [['Colher de sopa', 25]], 'vegetais');
F('pepino', 'Pepino', 10, 0.9, 2.0, 0.0, 1.1, [['Fatia', 10]], 'vegetais');
F('abobora', 'Abóbora cabotiá cozida', 48, 1.4, 10.8, 0.7, 2.5, [['Pedaço', 80]], 'vegetais');
F('chuchu', 'Chuchu cozido', 19, 0.4, 4.8, 0.0, 1.0, [['Colher de sopa', 25]], 'vegetais');
F('vagem', 'Vagem cozida', 25, 1.5, 5.3, 0.3, 2.4, [['Colher de sopa', 20]], 'vegetais');

/* Óleos, castanhas, sementes */
F('azeite', 'Azeite de oliva', 884, 0.0, 0.0, 100.0, 0, [['Colher de sopa', 13], ['Fio', 5]], 'gorduras');
F('oleo', 'Óleo de soja', 884, 0.0, 0.0, 100.0, 0, [['Colher de sopa', 8]], 'gorduras');
F('amendoim', 'Amendoim torrado', 606, 22.5, 18.7, 54.0, 7.8, [['Punhado', 30]], 'gorduras');
F('pasta_amendoim', 'Pasta de amendoim', 589, 25.0, 20.0, 50.0, 6.0, [['Colher de sopa', 15]], 'gorduras');
F('castanha_para', 'Castanha-do-pará', 643, 14.5, 15.1, 63.5, 7.9, [['Unidade', 4]], 'gorduras');
F('castanha_caju', 'Castanha de caju', 570, 18.5, 29.1, 46.3, 3.7, [['Punhado', 25]], 'gorduras');
F('chia', 'Chia', 486, 16.5, 42.1, 30.7, 34.4, [['Colher de sopa', 12]], 'gorduras');

/* Doces */
F('acucar', 'Açúcar', 387, 0.0, 99.5, 0.0, 0, [['Colher de chá', 5], ['Colher de sopa', 12]], 'doces');
F('mel', 'Mel', 309, 0.0, 84.0, 0.0, 0, [['Colher de sopa', 20]], 'doces');
F('chocolate', 'Chocolate ao leite', 540, 7.2, 59.6, 30.3, 2.2, [['Barra pequena', 25], ['Quadradinho', 5]], 'doces');
F('doce_leite', 'Doce de leite', 306, 5.5, 59.5, 6.0, 0, [['Colher de sopa', 20]], 'doces');
F('brigadeiro', 'Brigadeiro', 400, 4.5, 60.0, 16.0, 1.5, [['Unidade', 20]], 'doces');
F('bolo', 'Bolo simples', 340, 5.5, 52.0, 12.0, 1.0, [['Fatia', 60]], 'doces');
F('sorvete', 'Sorvete de creme', 200, 3.5, 24.0, 10.0, 0, [['Bola', 60]], 'doces');

/* Bebidas */
F('cafe', 'Café sem açúcar', 2, 0.1, 0.3, 0.0, 0, [['Xícara', 50], ['Caneca', 200]], 'bebidas');
F('suco_laranja', 'Suco de laranja natural', 33, 0.7, 7.6, 0.1, 0.2, [['Copo (200 ml)', 200]], 'bebidas');
F('refrigerante', 'Refrigerante (normal)', 41, 0.0, 10.5, 0.0, 0, [['Lata (350 ml)', 350], ['Copo', 200]], 'bebidas', ['coca', 'refri']);
F('refrigerante_zero', 'Refrigerante zero', 1, 0.0, 0.0, 0.0, 0, [['Lata (350 ml)', 350]], 'bebidas');
F('cerveja', 'Cerveja', 41, 0.3, 3.3, 0.0, 0, [['Lata (350 ml)', 350], ['Long neck', 355]], 'bebidas');
F('agua_coco', 'Água de coco', 22, 0.0, 5.3, 0.0, 0.1, [['Copo (200 ml)', 200]], 'bebidas');
F('achocolatado', 'Achocolatado em pó', 401, 4.2, 91.2, 2.2, 3.9, [['Colher de sopa', 15]], 'bebidas', ['nescau', 'toddy']);

/* Salgados e lanches */
F('coxinha', 'Coxinha de frango frita', 283, 9.6, 34.5, 11.8, 1.5, [['Unidade média', 80]], 'pratos');
F('pastel', 'Pastel de carne frito', 388, 10.1, 43.1, 20.1, 1.0, [['Unidade', 90]], 'pratos');
F('esfiha', 'Esfiha de carne', 271, 12.0, 34.0, 9.5, 1.5, [['Unidade', 80]], 'pratos');
F('x_burger', 'Hambúrguer (sanduíche completo)', 260, 13.0, 24.0, 12.5, 1.5, [['Unidade', 200]], 'pratos', ['lanche', 'x-burguer']);
F('sushi', 'Sushi / niguiri', 150, 6.0, 28.0, 1.5, 0.5, [['Unidade', 30]], 'pratos');
F('omelete', 'Omelete simples', 154, 10.5, 1.0, 12.0, 0, [['2 ovos', 120]], 'pratos');
F('sopa_legumes', 'Sopa de legumes', 40, 1.5, 6.5, 1.0, 1.2, [['Prato fundo', 300]], 'pratos');

/* Suplementos */
F('whey', 'Whey protein (pó)', 400, 80.0, 8.0, 6.0, 0, [['Scoop', 30]], 'suplementos', ['whey']);
F('creatina', 'Creatina', 0, 0, 0, 0, 0, [['Dose', 5]], 'suplementos');
F('hipercalorico', 'Hipercalórico (pó)', 380, 15.0, 72.0, 3.0, 1.0, [['Dose', 100]], 'suplementos');

const FOOD_BY_ID = Object.fromEntries(FOODS.map((f) => [f.id, f]));
