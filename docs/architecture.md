# Arquitetura do Peregrino

## Princípios

- O domínio não depende de React, rotas, CSS ou WebXR.
- A interface consome o domínio por `@/src`; não reimplementa score, recompensa nem constância.
- Todo estado de demonstração é local, serializável e versionado.
- WebXR fica atrás de `ArMissionAdapter`; testes e ambientes incompatíveis usam o fake.
- Conteúdo bíblico é estático, revisável pelo PO e separado das regras.
- A LLM adapta apresentação, mas nunca cria a verdade de domínio nem seleciona referências livres.
- Respostas brutas sobre idade e fé não são persistidas nem enviadas ao provedor de IA.

## Camadas

1. `src/domain`: tipos, pontuação, recompensas e constância; funções puras.
2. `src/content`: jornadas, capítulos, microconteúdo, itens e quiz.
3. `src/application`: engine, migração e store Zustand injetável.
4. `src/ar`: contrato, fake e implementação WebXR/Three.js com carregamento dinâmico.
5. `src/llm`: contrato do guia, provider OpenAI, fallback curado e guardrails teológicos.
6. `app/api`: health check e proxy server-side de Parakletos.
7. `app`: orquestração de telas a partir do `DemoStep`, sem regra de jogo.
8. `components`: primitivas de moldura, cenas, HUD e uma tela por passo do fluxo.

`src/games` contém o motor puro de tempo, vidas, recuperação e materiais. O catálogo curado fica em `src/content/minigames.ts`; consulte `docs/minigames-e-recuperacao.md`.

## Persistência

O frontend deverá instanciar `createBrowserDemoStore()` em código client-side. A chave é `peregrino-demo-v1`; o schema atual é `2`. O reset recria o estado inicial com três dias de constância já seedados. A migração do schema 1 adiciona `personalization: null`.

## Personalização e LLM

`completeOnboarding()` deriva um perfil mínimo, seleciona uma das três variantes de cada etapa e indica histórias do catálogo curado. `POST /api/parakletos` usa a OpenAI Responses API somente quando as duas variáveis de ambiente estão presentes; caso contrário, permanece funcional por fallback. Consulte `docs/llm-parakletos.md`.

## Fluxo de missão

`discovery(20) -> preparation(20) -> ar(30) -> quiz(0..30) -> finalize`

`finalizeMission` exige todas as etapas, registra o quarto dia, calcula o tier e concede a Pedra de Davi e o Escudo da Fé.

## Duas economias de recompensa

`src/content/rewards.ts` guarda o catálogo da spec §6: cinco colecionáveis (um por capítulo de Davi, memória da história, sem raridade variável) e os seis slots da Armadura de Deus (evolução do Peregrino, com qualidade por desempenho e constância). `equipmentTier` em `src/domain/progression.ts` aplica a regra: 4/7 garante ao menos `rare`, 7/7 leva ao topo, e nenhuma semana incompleta rebaixa o que já foi conquistado.
