# Project Progress

Last updated: May 4, 2026

## Current Checkpoint

AI Debug Assistant currently has a working full-stack debug analysis flow.

The default local mode uses `AI_PROVIDER=mock`, so the app can run without external API keys. The OpenAI provider is implemented behind the same provider interface and has been manually verified with a real `OPENAI_API_KEY`.

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
- `LOG_ERROR` flag for opt-in backend error logging
- `VITE_API_TIMEOUT_MS` for frontend request timeout configuration
- centralized web app config in `apps/web/src/config/appConfig.ts`
- lightweight backend observability logs for AI calls
- root and workspace README files
- roadmap phases 1-8 completed

## Verification

The latest implemented checkpoint has been verified with:

```bash
pnpm --filter api test
pnpm --filter api test:e2e
pnpm build
pnpm lint
```

Manual OpenAI verification has been completed with:

- `AI_PROVIDER=openai`
- a real `OPENAI_API_KEY`
- `AI_REQUEST_TIMEOUT_MS=60000`
- `VITE_API_TIMEOUT_MS=60000`

## Current Important Notes

- Keep `AI_PROVIDER=mock` as the default for local development and automated tests.
- Do not log raw `errorText`.
- Do not remove the mock provider after OpenAI verification.
- Do not log raw `errorText`.
- AI observability logs should include metadata only: provider, prompt version, duration, status, and error category.
- `packages/contracts` intentionally builds both ESM and CJS output:
  - ESM for Vite/web;
  - CJS for Jest/API compatibility.

## Next Phase

Next roadmap phase: **Phase 9: Provider Error Taxonomy**.

Implementation target:

- split provider failures into clearer categories such as timeout, auth/config, rate limit, malformed response, and generic provider error;
- keep frontend-facing messages safe and stable;
- use the new categories in observability logs.

Persistence/history remains intentionally delayed until the final phase.
