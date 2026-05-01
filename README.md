# AI Debug Assistant

AI Debug Assistant is a full-stack pet project for exploring AI-powered application development.

The project is built as a small monorepo where a developer can paste an error, log, or stack trace, choose a technical context, and receive structured debugging guidance. The app supports a deterministic mock provider for local development and an OpenAI provider for real LLM-backed analysis.

## Purpose

This is a learning project, not a production-ready product.

The main goal is to practice and demonstrate:

- full-stack TypeScript development;
- monorepo organization with pnpm workspaces;
- NestJS API design and validation;
- React application structure with feature-based modules;
- TanStack React Query for server-state management;
- Tailwind CSS for practical UI implementation;
- incremental AI integration patterns;
- working with LLMs through a clean backend boundary.

The project is intentionally kept small and explicit. It should be easy to read, change, and extend while learning how AI-powered products are shaped.

## What It Does

The current flow:

1. User opens the web app.
2. User pastes an error, log, or stack trace.
3. User selects a context:
   - React
   - Node.js
   - NestJS
   - TypeScript
   - General
4. Web app sends the request to the API.
5. API validates the request.
6. API returns a structured debug analysis.
7. UI displays:
   - summary
   - possible cause
   - suggested fix
   - code example
   - checklist

## Current Status

- Monorepo foundation is in place.
- API health endpoint is implemented.
- `POST /debug/analyze` is implemented with request validation.
- Debug analysis can run through the mock provider or the OpenAI provider.
- OpenAI integration uses structured output parsing against the shared contract schema.
- API and web handle validation/provider errors through a stable error response shape.
- Web app is connected to the API.
- Main debug form and result UI are implemented.
- API unit and e2e tests cover the current backend flow.

## Not Production Ready

This repository is not intended to be production-ready.

Known limitations:

- no authentication;
- no persistence or user history;
- no rate limiting;
- no observability setup;
- no deployment configuration;
- no sensitive-data handling strategy;
- no production security hardening.

These parts may be added later as learning milestones.

## Tech Stack

- Monorepo: pnpm workspaces
- Backend: NestJS, TypeScript, class-validator
- Frontend: React, TypeScript, Vite, Tailwind CSS
- Data fetching: Axios, TanStack React Query
- Infrastructure: Docker Compose
- Testing: Jest, Supertest
- AI integration: provider interface, mock provider, OpenAI provider

## Repository Structure

```txt
apps/
  api/   NestJS backend API
  web/   React frontend application

packages/
  contracts/   Shared API contracts and Zod schemas
```

Workspace-specific documentation:

- `apps/api/README.md`
- `apps/web/README.md`

## Environment

Create local environment files from `.env.example`.

API:

```bash
PORT=3000
CORS_ORIGIN=http://localhost:5173
AI_PROVIDER=mock
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
AI_REQUEST_TIMEOUT_MS=15000
```

Web:

```bash
VITE_API_URL=http://localhost:3000
```

## Install

```bash
pnpm install
```

## Development

Run both apps:

```bash
pnpm dev
```

Run apps separately:

```bash
pnpm dev:api
pnpm dev:web
```

Default local URLs:

```txt
API: http://localhost:3000
Web: http://localhost:5173
```

## Checks

```bash
pnpm build
pnpm lint
pnpm --filter api test
pnpm --filter api test:e2e
```

## API Contract

Main endpoint:

```txt
POST /debug/analyze
```

Request:

```json
{
  "errorText": "TypeError: Cannot read properties of undefined",
  "context": "react"
}
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

## Planned Learning Milestones

1. Improve provider-level error handling.
2. Add input safety and secret redaction before external provider calls.
3. Add lightweight observability for AI calls.
4. Improve frontend handling for validation and provider errors.
5. Optionally add persistence for analysis history.

## License

MIT License. See `LICENSE`.
