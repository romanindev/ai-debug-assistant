# AI Debug Assistant Roadmap

This roadmap describes how the project should evolve from the current mock full-stack flow into a small but well-structured AI-powered debugging assistant.

The project is a pet and learning project. The goal is not to rush toward production readiness, but to practice building an AI-powered full-stack application with clean boundaries, testable modules, and incremental delivery.

## Current Baseline

Implemented:

- pnpm workspace monorepo
- NestJS API app
- React/Vite web app
- Tailwind CSS UI
- `GET /health`
- `POST /debug/analyze`
- request validation on the API
- mock structured debug analysis response
- frontend debug form and result UI
- API unit and e2e tests
- root and workspace README files
- shared `packages/contracts` workspace with debug types and Zod schemas
- isolated API `AiModule` with `AiProvider` interface and `MockAiProvider`
- `AI_PROVIDER` configuration with validated provider selection
- OpenAI provider using the Responses API and structured output parsing
- stable API error response shape for validation/provider failures
- basic input redaction before external AI provider calls
- UI warning about secrets in pasted logs

Current important limitation:

- OpenAI provider has not been verified with a real `OPENAI_API_KEY` yet.
- AI calls do not have lightweight observability logs yet.

## Guiding Principles

- Move in small, reviewable steps.
- Keep the full user flow working after every phase.
- Prefer clear boundaries over clever abstractions.
- Keep mock behavior available even after real LLM integration.
- Validate both user input and AI output.
- Avoid persistence until there is a real product need.
- Do not expose provider-specific details to the frontend.
- Treat LLM responses as untrusted external data.

## Target Architecture Direction

```txt
apps/
  api/
    src/
      debug/
        debug.module.ts
        debug.controller.ts
        debug.service.ts
      ai/
        ai.module.ts
        ai.service.ts
        ai-provider.interface.ts
        providers/
          mock-ai.provider.ts
          openai.provider.ts
        prompts/
          debug-analysis.v1.prompt.ts

  web/
    src/
      features/
        debug/

packages/
  contracts/
    src/
      debug/
        debug.constants.ts
        debug.schema.ts
        debug.types.ts
```

The `debug` domain should not know whether the analysis comes from a mock provider, OpenAI, or another LLM provider. It should depend on an AI service boundary that returns validated structured data.

## Phase 1: Shared Contracts Package

Status: completed.

Goal: create a single source of truth for the debug API contract.

Add:

```txt
packages/contracts
```

Include:

- `DebugContext`
- `AnalyzeDebugRequest`
- `DebugAnalysis`
- Zod schemas for request and response validation

Expected shape:

```ts
debugContextSchema
analyzeDebugRequestSchema
debugAnalysisSchema

type DebugContext
type AnalyzeDebugRequest
type DebugAnalysis
```

API should use the shared schemas/types for:

- DTO-compatible validation decisions
- response typing
- future AI output validation

Web should use the shared types for:

- request typing
- response typing
- context options

Acceptance criteria:

- API and web no longer duplicate debug contract types.
- `pnpm build` passes.
- `pnpm lint` passes.
- API unit and e2e tests pass.
- The current mock flow still works from web to API.

Notes:

- Keep this package focused on contracts only.
- Do not add app-specific logic to `packages/contracts`.
- Avoid turning it into a general shared utilities package.

## Phase 2: AI Module With Provider Interface

Status: completed.

Goal: introduce an AI boundary without adding a real external provider yet.

Add API module:

```txt
apps/api/src/ai
```

Suggested structure:

```txt
ai/
  ai.module.ts
  ai.service.ts
  ai-provider.interface.ts
  providers/
    mock-ai.provider.ts
  prompts/
    debug-analysis.v1.prompt.ts
```

Provider interface:

```ts
export interface AiProvider {
  analyzeDebug(input: AnalyzeDebugRequest): Promise<DebugAnalysis>;
}
```

Responsibilities:

- `DebugService` handles debug domain orchestration.
- `AiService` owns the provider boundary.
- `AiProvider` implementations produce debug analysis.
- `MockAiProvider` preserves the current deterministic behavior.

Acceptance criteria:

- `DebugService` no longer builds the mock analysis directly.
- Mock behavior is moved behind `AiProvider`.
- Current API response shape stays compatible.
- Existing tests are updated and pass.
- No OpenAI dependency is introduced in this phase.

## Phase 3: Provider Selection Through Configuration

Status: completed.

Goal: make the AI provider switchable through environment configuration.

Add config:

```bash
AI_PROVIDER=mock
```

Initial allowed values:

```txt
mock
```

Later:

```txt
openai
```

Responsibilities:

- API config owns the selected provider name.
- `AiModule` wires the correct provider.
- Invalid provider config should fail clearly at startup.

Acceptance criteria:

- The app starts with `AI_PROVIDER=mock`.
- Missing provider config has a safe default or clear error.
- Provider-specific details do not leak into `DebugController`.

## Phase 4: OpenAI Provider

Status: completed.

Goal: add a real LLM provider without changing the debug API contract.

Add:

```txt
providers/openai.provider.ts
```

Config:

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_MODEL=
AI_REQUEST_TIMEOUT_MS=15000
```

Provider responsibilities:

- build the prompt;
- call the LLM;
- request structured JSON output;
- parse the provider response;
- validate it against `debugAnalysisSchema`;
- return `DebugAnalysis`;
- throw meaningful provider-level errors.

Acceptance criteria:

- `AI_PROVIDER=mock` still works without API keys.
- `AI_PROVIDER=openai` requires OpenAI config.
- LLM output is validated before returning to the controller.
- Malformed LLM output does not reach the frontend as a successful response.
- Tests can still run without network access by using the mock provider.

## Phase 5: Prompt Versioning

Status: completed.

Goal: make prompt changes explicit and reviewable.

Prompt files:

```txt
prompts/debug-analysis.v1.prompt.ts
```

Prompt builder should accept structured input:

```ts
buildDebugAnalysisPrompt(input: AnalyzeDebugRequest): string
```

Guidelines:

- Keep prompts readable.
- Keep provider-specific formatting out of domain services.
- Version prompts when behavior meaningfully changes.
- Avoid inline prompt strings in controllers or domain services.

Acceptance criteria:

- Prompt construction is isolated.
- Prompt version is visible in code.
- Prompt changes are easy to review.

## Phase 6: Error Handling And Frontend Feedback

Status: completed.

Goal: handle expected API and AI failures intentionally.

Backend error categories:

- request validation error;
- unsupported context;
- provider timeout;
- provider authentication/configuration error;
- malformed provider response;
- unknown internal error.

Frontend behavior:

- show validation errors clearly;
- show provider failure as a recoverable state;
- keep the last successful result visible when useful;
- allow retry;
- do not show internal stack traces.

Acceptance criteria:

- API returns consistent error shapes.
- Web renders useful messages for validation and provider failures.
- Sensitive provider details are not exposed to the client.

## Phase 7: Input Safety And Redaction

Status: completed.

Goal: reduce the risk of sending sensitive data to an external LLM.

Possible additions:

- UI warning near the input field;
- max input length;
- basic secret redaction before provider calls;
- avoid logging full `errorText`;
- tests for obvious secret patterns.

Examples of data to consider:

- API keys;
- tokens;
- passwords;
- database URLs;
- private URLs;
- emails if not needed for analysis.

Acceptance criteria:

- Full raw user input is not logged.
- Provider input can be redacted before external calls.
- UI communicates that pasted logs may contain sensitive data.

## Phase 8: Lightweight Observability

Status: next.

Goal: make AI calls understandable during development.

Track:

- provider name;
- prompt version;
- request duration;
- success/failure status;
- error category.

Avoid:

- logging full user input;
- logging secrets;
- adding heavyweight observability tools too early.

Acceptance criteria:

- Failed provider calls are diagnosable locally.
- Logs contain enough metadata to debug behavior.
- Logs avoid sensitive payloads.

## Phase 9: Optional Persistence

Goal: add storage only when there is a real product reason.

Potential use cases:

- analysis history;
- saved analyses;
- user feedback;
- prompt/version comparison;
- usage tracking.

Possible stack:

- PostgreSQL from existing Docker Compose;
- Prisma or another migration-aware ORM;
- separate persistence module in API.

Acceptance criteria:

- Persistence has a clear product reason.
- Database schema is minimal.
- Existing analyze flow still works without unnecessary coupling.

## Suggested Immediate Next Steps

1. Add lightweight observability for AI calls.
2. Track provider name, prompt version, duration, success/failure, and error category.
3. Ensure observability logs never include raw `errorText` or secrets.
4. Verify the OpenAI provider manually with `OPENAI_API_KEY`.
5. Decide whether persistence/history has enough product value to add.

## Decision Log

### Use `packages/contracts`

Reason:

- API and web currently duplicate request/response types.
- LLM output must be validated at runtime.
- Shared contracts reduce drift between frontend and backend.

### Use Zod for schemas

Reason:

- TypeScript types disappear at runtime.
- AI/provider output is untrusted data.
- Zod can provide both runtime validation and inferred TypeScript types.

### Keep provider interface

Reason:

- The debug flow should not depend directly on OpenAI or any specific provider.
- Mock provider must remain useful for local development and tests.
- Future providers should implement the same contract.

### Keep mock provider after OpenAI integration

Reason:

- Allows development without API keys.
- Keeps tests deterministic.
- Provides a fallback/demo mode.

### Delay persistence

Reason:

- Current product flow does not need a database.
- Adding persistence too early would increase complexity without improving the core learning goal.
