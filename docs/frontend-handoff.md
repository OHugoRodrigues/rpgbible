# Interface: como ela consome o domínio

A interface desta rodada já segue o contrato abaixo. O documento deixou de ser um pedido e passou a
descrever o que está implementado, para que a próxima pessoa mantenha a mesma separação.

## Integração

- Tipos, conteúdo, store e adaptadores vêm de `@/src`. `app/page.tsx` não define regra de jogo.
- `app/providers/store-provider.tsx` cria o store com `createBrowserDemoStore()` e o expõe por
  `useDemoStore` (seletor) e `useDemoActions` (ações). No servidor usa um storage inerte, porque
  `localStorage` não existe lá.
- Score, recompensa, constância e validação nunca são recalculados em componentes.
- `useHydrated()` evita divergência de hidratação antes de o `persist` restaurar o estado.
- A rota AR importa `WebXrMissionAdapter` dinamicamente, mantendo Three.js fora do bundle inicial.
  Testes devem injetar `FakeArMissionAdapter`.
- `completeOnboarding()` é chamado ao fim das cinco perguntas; as respostas cruas não são guardadas
  em estado de componente, analytics ou log.
- Parakletos chama apenas `POST /api/parakletos`, com `PersonalizationProfile` do domínio. Enviar um
  valor fora das uniões (`audienceTone`, `narrativePreference`) faz a rota responder 400 em silêncio.
- `PARAKLETOS_IDENTITY_NOTICE` é importado de `@/src/llm/parakletos-policy`, nunca duplicado.

## Telas

Uma por `DemoStep`, em `components/screens/`:

`home → pilgrim → journeys → chapters → discovery → preparation → ar → quiz → result → profile`

A calibração é o único passo puramente de interface: fica entre `pilgrim` e `journeys`, é opcional e
só toca o domínio quando `completeOnboarding` roda.

## Quiz

`answerQuiz` só marca a pergunta como concluída no acerto, e apenas o acerto de primeira tentativa
pontua. A tela pede nova tentativa em vez de avançar com resposta errada — avançar deixaria a etapa
aberta e `finalizeMission` lançaria.

## Design system

`app/globals.css` concentra tokens, tipografia e reset; ele precisa continuar importado por
`app/layout.tsx` ou nada disso chega ao bundle. As primitivas de moldura estão em
`components/frame/` e não devem ser recriadas por tela.

Um `<dialog>` fechado é `display: none` pelo estilo do agente. Declarar `display` na regra base de um
diálogo sobrescreve isso e o deixa permanentemente visível — sempre acompanhe de
`:not([open]) { display: none }`.

## Arte substituível

Cenas, Golias, variantes de cabelo e ícones de item tentam um arquivo em `public/assets/` e caem
para a versão desenhada quando ele não existe. A tabela de caminhos está no README.

## Gate de AR

`isSupported()` roda antes de exibir o CTA; `start()` precisa de gesto do usuário. Onde não há
`immersive-ar`, o confronto acontece em DOM com a mesma arte de Golias, para que a demo nunca fique
sem clímax.
