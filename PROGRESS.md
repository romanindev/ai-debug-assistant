# Project Progress

Last updated: May 19, 2026

## Current Checkpoint

AI Debug Assistant currently has a working full-stack debug analysis flow with optional OpenAI analysis, optional PostgreSQL persistence, authentication, and user-scoped analysis history.

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
- provider error taxonomy for timeout, auth/config, rate limit, malformed response, and generic provider failures
- frontend retry, copy-result, timeout-message, and last-successful-result UX
- optional PostgreSQL analysis persistence behind `PERSIST_ANALYSES=true`
- persisted analysis list/detail endpoints
- API authentication with register, login, logout, and current-user endpoints
- password hashing for stored credentials
- JWT session stored in an httpOnly cookie
- user-scoped persisted analysis history
- web login and registration pages
- web header auth controls
- authenticated web history list with saved analysis reopen
- root and workspace README files
- roadmap phases 1-12 completed

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
- AI observability logs should include metadata only: provider, prompt version, duration, status, and error category.
- Provider errors should expose safe public messages while preserving raw provider failures only as internal causes.
- Persistence is optional and controlled by `PERSIST_ANALYSES=true`.
- Persisted analysis history is scoped by authenticated API user when auth cookie is present.
- Logged-out debug analysis remains stateless and does not write persisted history.
- Phase 12 is complete for the planned learning scope.
- Auth is suitable for the project learning milestone, but not production-hardened.
- `packages/contracts` intentionally builds both ESM and CJS output:
  - ESM for Vite/web;
  - CJS for Jest/API compatibility.

## Roadmap Status

The planned roadmap is complete through **Phase 12: Authentication And User-Scoped History**.

Potential future work, if the project continues:

- add UI/component tests for the web app;
- introduce migration tooling instead of lazy schema creation;
- add rate limiting and stronger auth/session hardening;
- improve deployment configuration;
- expand history management features such as delete or search.
