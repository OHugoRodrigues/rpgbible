# Arquitetura do Peregrino

## Princípios

- O domínio não depende de React, rotas, CSS ou WebXR.
- A interface futura consome apenas os exports de `src/index.ts`.
- Todo estado de demonstração é local, serializável e versionado.
- WebXR fica atrás de `ArMissionAdapter`; testes e ambientes incompatíveis usam o fake.
- Conteúdo bíblico é estático, revisável pelo PO e separado das regras.

## Camadas

1. `src/domain`: tipos, pontuação, recompensas e constância; funções puras.
2. `src/content`: jornadas, capítulos, microconteúdo, itens e quiz.
3. `src/application`: engine, migração e store Zustand injetável.
4. `src/ar`: contrato, fake e implementação WebXR/Three.js com carregamento dinâmico.
5. `app/api`: endpoints operacionais; hoje contém apenas health check.
6. `app`: reservada para a designer e a próxima rodada de interface.

## Persistência

O frontend deverá instanciar `createBrowserDemoStore()` em código client-side. A chave é `peregrino-demo-v1`; o schema atual é `1`. O reset recria o estado inicial com três dias de constância já seedados.

## Fluxo de missão

`discovery(20) -> preparation(20) -> ar(30) -> quiz(0..30) -> finalize`

`finalizeMission` exige todas as etapas, registra o quarto dia, calcula o tier e concede a Pedra de Davi e o Escudo da Fé.
