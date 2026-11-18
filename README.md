# Forja — app de academia (PWA)

App pessoal de academia que funciona no iPhone como aplicativo (via "Adicionar à Tela de Início").
Não precisa de servidor nem banco de dados: os dados ficam salvos no próprio aparelho.

## Arquivos
- `index.html` — estrutura da página
- `style.css` — visual (cores, tema claro/escuro)
- `app.js` — toda a lógica (calendário, treinos, registro, gráfico, histórico, backup)
- `manifest.json` — nome/ícone do app na tela inicial
- `sw.js` — service worker (faz o app abrir sem internet)
- `icons/` — ícones

## Testar no computador
Abra um terminal nesta pasta e rode:

    python3 -m http.server 8000

Depois acesse http://localhost:8000

## Publicar de graça (Netlify + GitHub)
1. Crie um repositório no GitHub e suba esta pasta.
2. No Netlify: Add new site → Import an existing project → GitHub → escolha o repositório.
   (Não precisa de comando de build; pasta de publicação: a raiz.)
3. A cada `git push`, o site atualiza sozinho.

## Instalar no iPhone
Abra o link no **Safari** → botão Compartilhar → **Adicionar à Tela de Início**.

## Dicas
- Use **Histórico → Exportar backup** de vez em quando. Se apagar o app da tela inicial, os dados vão junto.
- Para trocar o nome do app: mude "Forja" em `index.html` (title, apple-mobile-web-app-title, brand-name) e em `manifest.json`.
- O ícone da tela inicial vem de `icons/icon-180.png` (linha `apple-touch-icon` no `index.html`). O iPhone copia o ícone no momento em que você adiciona o app; se trocar o ícone depois, remova o app da tela inicial e adicione de novo.
- Se uma atualização demorar a aparecer, feche o app e abra de novo.
