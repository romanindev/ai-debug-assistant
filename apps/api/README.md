# AI Debug Assistant API

NestJS backend for AI Debug Assistant.

The API validates debugging input, exposes health and debug analysis endpoints, and returns a structured analysis response. The analysis can run through a deterministic mock provider or through OpenAI, selected by `AI_PROVIDER`.

## Stack

- NestJS
- TypeScript
- `@nestjs/config`
- `class-validator`
- `class-transformer`
- Jest / Supertest

## Environment

Create root `.env` for Docker Compose:

```bash
POSTGRES_USER=app
POSTGRES_PASSWORD=app
POSTGRES_DB=ai_debug_assistant
POSTGRES_PORT=5432
```

Create `apps/api/.env`:

```bash
PORT=3000
CORS_ORIGIN=http://localhost:5173
AI_PROVIDER=mock
LOG_ERROR=false
PERSIST_ANALYSES=false
DATABASE_URL=postgresql://app:app@localhost:5432/ai_debug_assistant
AUTH_JWT_SECRET=change-me
AUTH_COOKIE_NAME=ai_debug_session
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_MAX_AGE_MS=604800000
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
AI_REQUEST_TIMEOUT_MS=60000
```

`PERSIST_ANALYSES=true` enables optional analysis history persistence. When it is disabled, the debug flow stays stateless and does not require PostgreSQL.
Auth endpoints require both `DATABASE_URL` and `AUTH_JWT_SECRET`.

Keep `DATABASE_URL` aligned with the root `.env` database values when changing them.

## Commands

Run from the repository root:

```bash
pnpm dev:api
pnpm --filter api build
pnpm --filter api lint
pnpm --filter api test
pnpm --filter api test:e2e
```

## Endpoints

### `GET /health`

Returns API status.

```json
{
  "status": "ok",
  "service": "ai-debug-assistant-api"
}
```

### `POST /debug/analyze`

Analyzes an error, log, or stack trace and returns structured debugging guidance.

Request:

```json
{
  "errorText": "TypeError: Cannot read properties of undefined",
  "context": "react"
}
```

Allowed `context` values:

```txt
react
node
nestjs
typescript
general
```

Response:

```json
{
  "summary": "Detected a react debugging issue: TypeError: Cannot read properties of undefined",
  "possibleCause": "The issue is likely caused by a mismatch between the expected runtime state and the actual value or execution path.",
  "suggestedFix": "Start by isolating the failing line, checking the relevant inputs, and verifying that the environment matches the code assumptions.",
  "codeExample": "if (!data) return null;",
  "checklist": [
    "Read the first error line and identify the failing symbol or operation.",
    "Inspect the stack trace from top to bottom until it reaches your application code.",
    "Reproduce the issue with the smallest possible input or component state.",
    "Add a focused guard, type check, or failing test before changing broader code."
  ]
}
```

### `GET /debug/analyses`

Returns recent persisted analyses when `PERSIST_ANALYSES=true`.

When persistence is disabled, the endpoint returns an empty list.

```json
[]
```

### `GET /debug/analyses/:id`

Returns one persisted analysis by id when `PERSIST_ANALYSES=true`.

Returns `404` when the analysis does not exist or persistence is disabled.

### `POST /auth/register`

Creates a user, sets an httpOnly auth cookie, and returns the public user.

```json
{
  "user": {
    "id": "user-id",
    "email": "dev@example.com",
    "createdAt": "2026-05-19T10:00:00.000Z"
  }
}
```

### `POST /auth/login`

Logs in an existing user, sets an httpOnly auth cookie, and returns the public user.

### `GET /auth/me`

Returns the current user from the auth cookie, or `null` when the request is logged out.

```json
{
  "user": null
}
```

### `POST /auth/logout`

Clears the auth cookie.

## Structure

```txt
src/
  main.ts
  app.module.ts
  app.controller.ts
  config/
    configuration.ts
  ai/
    ai.module.ts
    ai.service.ts
    ai-provider.interface.ts
    providers/
      mock-ai.provider.ts
      openai.provider.ts
    prompts/
      debug-analysis.v1.prompt.ts
    safety/
      redact-sensitive-input.ts
  analysis-history/
    analysis-history.module.ts
    analysis-history.service.ts
  auth/
    auth.module.ts
    auth.controller.ts
    auth.service.ts
    dto/
  debug/
    debug.module.ts
    debug.controller.ts
    debug.service.ts
    dto/
      analyze-debug.dto.ts
```

Shared debug request/response types and Zod schemas live in:

```txt
packages/contracts
```

## Current Status

- Health endpoint is implemented.
- Debug analysis endpoint is implemented.
- Request validation is enabled globally through `ValidationPipe`.
- Debug context and response types come from `@ai-debug-assistant/contracts`.
- Debug analysis is delegated through `AiService`.
- Available AI providers are `MockAiProvider` and `OpenAiProvider`.
- AI provider selection is configured through `AI_PROVIDER`.
- OpenAI integration uses the Responses API with structured output validation.
- API errors use a consistent `{ error: { code, message, details? } }` shape.
- OpenAI provider input is redacted for common secrets before external calls.
- Auth API foundation exposes register, login, logout, and current-user endpoints.
- Unit and e2e tests cover the current API flow.

## Next API Steps

- Scope persisted analyses to authenticated users.
