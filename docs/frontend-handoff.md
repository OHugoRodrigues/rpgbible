# Contrato para a próxima rodada de frontend

## Integração

- Importar tipos, conteúdo, store e adaptadores de `@/src`.
- Criar o store no cliente com `createBrowserDemoStore()` e fornecer a instância via Context ou hook fino.
- Não duplicar score, recompensa, constância ou validações em componentes.
- Para testes de interface, injetar `FakeArMissionAdapter`; usar `WebXrMissionAdapter` somente no aparelho real.
- A rota AR deve importar a implementação real dinamicamente para manter Three.js fora do bundle inicial.

## Sequência sugerida

`home -> pilgrim -> journeys -> chapters -> discovery -> preparation -> ar -> quiz -> result -> profile`

As rotas podem mudar sem alterar o domínio; `DemoStep` é o estado semântico, não uma URL obrigatória.

## Gate de AR

Antes de exibir o CTA, chamar `isSupported()`. `start()` precisa ser disparado por gesto do usuário. O frontend pode usar `mountLaunchButton()` quando quiser delegar a abertura da sessão ao `ARButton` oficial do Three.js.
