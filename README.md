# Peregrino

Plataforma de engajamento bíblico que transforma as Escrituras em jornadas interativas. O RPG é a
mecânica; a formação bíblica é o produto.

Esta rodada entrega o vertical slice completo da spec: domínio, conteúdo, personalização, LLM
server-side com fallback, persistência local, WebXR, testes **e a interface**, que consome o domínio
de `@/src` em vez de reimplementá-lo.

## Fluxo do piloto

`home → pilgrim → journeys → chapters → discovery → preparation → ar → quiz → result → profile`

Davi é a única jornada disponível; Moisés, Josué, Abraão, Jacó e Jesus aparecem bloqueados para
comunicar o universo maior. Dentro de Davi, "A Provação" é o capítulo jogável.

## Comandos

- `pnpm dev` — ambiente local em `http://localhost:5173`.
- `pnpm check` — tipos e lint (`src`, `app`, `tests`, `components`).
- `pnpm test` — testes unitários.
- `pnpm test:e2e` — Playwright contra o servidor local.
- `pnpm build` — build Cloudflare/Sites.

> Se `pnpm dev` avisar que já existe um servidor, confira `.vinext/dev/lock.json`. Evite a porta
> 3000 se outro projeto já registrou um service worker nela: a origem `localhost:3000` é
> compartilhada e o SW antigo intercepta as requisições deste app.

## Arte substituível

Os itens e recompensas usam a pixel art recortada das folhas de `ref/` pelo script
descrito abaixo. O que ainda não tem arte final é desenhado em vetor ou em CSS, sempre atrás de um
caminho de arquivo: soltar o PNG no lugar esperado substitui o desenho sem tocar em código.

| Caminho | Estado |
|---|---|
| `public/assets/items/*.png` | Recortados de `ref/` (coroa, harpa, pedra, funda, escudo, capacete, cinturão, couraça, calçados, espada) |
| `public/assets/rewards/*.png` | Recortados de `ref/` (palha, capim, madeira, prata, ouro, gemas) |
| `public/assets/items/scroll.png` | **Falta** — Pergaminho de Samuel, hoje em vetor |
| `public/assets/items/staff.png` | **Falta** — Cajado do pastor, hoje em vetor |
| `public/assets/scenes/{valley,camp,pasture}.png` | **Falta** — cenas desenhadas em CSS |
| `public/assets/characters/goliath.png` | **Falta** — Golias em SVG compartilhado por DOM e AR |
| `public/assets/characters/pilgrim-{male,female}-{short,long}.png` | **Falta** — variantes de cabelo; ao adicioná-las, registre o nome em `AVAILABLE_VARIANTS` em `components/screens/PilgrimSprite.tsx` |

## Documentação

`docs/architecture.md`, `docs/frontend-handoff.md`, `docs/llm-parakletos.md`,
`docs/minigames-e-recuperacao.md` e `docs/ar-device-checklist.md`.

Para habilitar a LLM, copie `.env.example` para `.env.local` e preencha `OPENAI_API_KEY` e
`OPENAI_MODEL`. Sem essas variáveis, Parakletos permanece funcional com conteúdo curado local.

## Fontes

`public/fonts` traz Cinzel, Silkscreen e Inter, todas sob a SIL Open Font License, servidas
localmente para que a demo não dependa de rede.
