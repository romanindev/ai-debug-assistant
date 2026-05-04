# Project Progress

Last updated: May 1, 2026

## Current Checkpoint

AI Debug Assistant currently has a working full-stack debug analysis flow.

The default local mode uses `AI_PROVIDER=mock`, so the app can run without external API keys. The OpenAI provider is implemented behind the same provider interface, but it has not yet been manually verified with a real `OPENAI_API_KEY`.

## Completed

- pnpm workspace monorepo
- NestJS API app
- React/Vite web app
- Tailwind CSS UI
- `GET /health`
- `POST /debug/analyze`
- shared `packages/contracts` package
- Zod schemas for debug request/response contracts
- dual ESM/CJS contracts build for Vite and Jest/API compatibility
- `AiModule`
- `AiProvider` interface
- `MockAiProvider`
- `OpenAiProvider`
- provider selection through `AI_PROVIDER`
- prompt builder with visible version: `debug-analysis.v1.prompt.ts`
- structured OpenAI output parsing through the shared schema
- stable API error response shape
- frontend rendering for validation/provider errors
- basic redaction before external AI provider calls
- UI warning about secrets in pasted logs
- root and workspace README files
- roadmap phases 1-7 completed

## Verification

The latest implemented checkpoint has been verified with:

```bash
pnpm --filter api test
pnpm --filter api test:e2e
pnpm build
pnpm lint
```

Manual OpenAI verification is still pending.

## Current Important Notes

- Keep `AI_PROVIDER=mock` as the default for local development and automated tests.
- Do not log raw `errorText`.
- Do not remove the mock provider after OpenAI verification.
- `packages/contracts` intentionally builds both ESM and CJS output:
  - ESM for Vite/web;
  - CJS for Jest/API compatibility.

## Next Phase

Next roadmap phase: **Phase 8: Lightweight Observability**.

Implementation target:

- add minimal backend logs around AI calls;
- log provider name;
- log prompt version;
- log request duration;
- log success/failure status;
- log error category;
- avoid raw user input and secrets in logs.

After Phase 8, manually verify `AI_PROVIDER=openai` with a real `OPENAI_API_KEY`.
