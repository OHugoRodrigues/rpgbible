# Contrato para a próxima rodada de frontend

## Integração

- Importar tipos, conteúdo, store e adaptadores de `@/src`.
- Criar o store no cliente com `createBrowserDemoStore()` e fornecer a instância via Context ou hook fino.
- Não duplicar score, recompensa, constância ou validações em componentes.
- Para testes de interface, injetar `FakeArMissionAdapter`; usar `WebXrMissionAdapter` somente no aparelho real.
- A rota AR deve importar a implementação real dinamicamente para manter Three.js fora do bundle inicial.
- Ao concluir as cinco perguntas, chamar `completeOnboarding()`; não guardar as respostas brutas em estado de componente, analytics ou logs.
- Consumir `getPersonalizedDavidStages()` e o catálogo de recomendações; componentes não devem recalcular a segmentação.
- Parakletos chama apenas `POST /api/parakletos`. Exibir `identityNotice` no primeiro contato e mantê-lo acessível na ajuda.
- Minigames devem usar as actions do store (`startMinigame`, `answerMinigame`, recuperação e retomada); o componente apenas renderiza o relógio derivado de `deadlineAt`.
- Ao entrar em `cooldown`, oferecer a leitura indicada e agendar `BrowserRecoveryNotifier` somente se a permissão já existir. Na reabertura, comparar o horário atual com `cooldownAvailableAt`.

## Sequência sugerida

`home -> pilgrim -> journeys -> chapters -> discovery -> preparation -> ar -> quiz -> result -> profile`

O onboarding de personalização pode entrar entre `home` e `pilgrim`; a URL ainda será definida pela designer.

As rotas podem mudar sem alterar o domínio; `DemoStep` é o estado semântico, não uma URL obrigatória.

## Gate de AR

Antes de exibir o CTA, chamar `isSupported()`. `start()` precisa ser disparado por gesto do usuário. O frontend pode usar `mountLaunchButton()` quando quiser delegar a abertura da sessão ao `ARButton` oficial do Three.js.
