# Peregrino

Fundação técnica do vertical slice do hackathon. Esta rodada contém domínio, conteúdo, personalização, LLM server-side com fallback, persistência local, WebXR e testes; a interface visual foi intencionalmente adiada.

## Comandos

- `pnpm dev` — ambiente local.
- `pnpm check` — tipos e lint.
- `pnpm test` — testes unitários.
- `pnpm test:e2e` — health check pelo servidor local.
- `pnpm build` — build Cloudflare/Sites.

Consulte `docs/architecture.md`, `docs/frontend-handoff.md` e `docs/ar-device-checklist.md` antes de iniciar a camada visual.

Para habilitar a LLM, copie `.env.example` para `.env.local` e preencha `OPENAI_API_KEY` e `OPENAI_MODEL`. Sem essas variáveis, Parakletos permanece funcional com conteúdo curado local. Consulte `docs/llm-parakletos.md` e `docs/minigames-e-recuperacao.md`.
