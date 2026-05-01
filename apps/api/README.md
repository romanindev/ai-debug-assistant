# AI Debug Assistant API

NestJS backend for AI Debug Assistant.

The API validates debugging input, exposes health and debug analysis endpoints, and returns a structured analysis response. The current analysis implementation is intentionally mocked so the product flow can be built before adding a real LLM provider.

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
  debug/
    debug.module.ts
    debug.controller.ts
    debug.service.ts
    dto/
      analyze-debug.dto.ts
    types/
      debug-analysis.type.ts
      debug-context.type.ts
```

## Current Status

- Health endpoint is implemented.
- Debug analysis endpoint is implemented.
- Request validation is enabled globally through `ValidationPipe`.
- Debug analysis response is mocked.
- Unit and e2e tests cover the current API flow.

## Next API Steps

- Add an isolated AI module.
- Move prompt construction into readable prompt files.
- Request structured JSON from the LLM provider.
- Validate provider responses before returning them to the web app.
- Add provider timeout/error handling.
