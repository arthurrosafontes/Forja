# Forja — app de academia (PWA)

App pessoal de academia que funciona no iPhone como aplicativo (via "Adicionar à Tela de Início").
Não precisa de servidor nem banco de dados: os dados ficam salvos no próprio aparelho.

## Arquivos
- `index.html` — estrutura da página
- `style.css` — visual (tema claro/escuro)
- `data.js` — exercícios (com instruções), programas prontos, conquistas, dúvidas
- `figures.js` — animações dos exercícios (bonequinho)
- `body.js` — mapa do corpo (frente/costas)
- `core.js` — dados, cálculos, gráficos, cronômetro
- `home.js`, `workout.js`, `plans.js`, `exercises.js`, `activity.js`, `bodyview.js`, `profile.js` — as telas
- `manifest.json`, `sw.js` — instalação na tela inicial e funcionamento offline
- `apple-touch-icon.png`, `icon-*.png`, `icon.svg` — ícones (todos na raiz, de propósito)

Ao publicar uma atualização, mude o número em `const CACHE = 'forja-v6'` no `sw.js`.

## Testar no computador
Abra um terminal nesta pasta e rode:

    python3 -m http.server 8000

Depois acesse http://localhost:8000

## Publicar de graça (GitHub Pages — sem selo de propaganda)
1. Crie um repositório **público** no GitHub (ex: `forja`) e suba TODOS os arquivos desta pasta na raiz dele.
2. No repositório: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   escolha **main** e a pasta **/ (root)** → **Save**.
3. Em 1–2 minutos o link aparece no topo dessa mesma página:
   `https://SEU-USUARIO.github.io/forja/`
4. Para atualizar: suba os arquivos novos no repositório (commit/push). O site atualiza sozinho.

Obs.: projetos gratuitos novos na Netlify (desde ago/2026) mostram um selo "Powered by Netlify"
que não dá para desligar no plano grátis — por isso o GitHub Pages.

## Instalar no iPhone
Abra o link no **Safari** → botão Compartilhar → **Adicionar à Tela de Início**.

## Dicas
- Use **Histórico → Exportar backup** de vez em quando. Se apagar o app da tela inicial, os dados vão junto.
- Para trocar o nome do app: mude "Forja" em `index.html` (title, apple-mobile-web-app-title, brand-name) e em `manifest.json`.
- O ícone da tela inicial vem de `apple-touch-icon.png` (linha `apple-touch-icon` no `index.html`). O iPhone copia o ícone no momento em que você adiciona o app; se trocar o ícone depois, remova o app da tela inicial e adicione de novo.
- Se uma atualização demorar a aparecer, feche o app e abra de novo.
