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

Create `apps/api/.env`:

```bash
PORT=3000
CORS_ORIGIN=http://localhost:5173
AI_PROVIDER=mock
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
AI_REQUEST_TIMEOUT_MS=15000
```

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
- Unit and e2e tests cover the current API flow.

## Next API Steps

- Add lightweight observability for AI calls.
