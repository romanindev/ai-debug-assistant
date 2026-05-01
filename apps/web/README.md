# AI Debug Assistant Web

React frontend for AI Debug Assistant.

The web app lets a developer paste an error, log, or stack trace, choose a technical context, submit it to the API, and view structured debugging guidance.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- TanStack React Query

## Environment

Create `apps/web/.env`:

```bash
VITE_API_URL=http://localhost:3000
```

The API should allow this frontend origin through `CORS_ORIGIN`.

## Commands

Run from the repository root:

```bash
pnpm dev:web
pnpm --filter web build
pnpm --filter web lint
pnpm --filter web preview
```

For the full local flow:

```bash
pnpm dev:api
pnpm dev:web
```

Then open:

```txt
http://localhost:5173
```

## Main Flow

1. User pastes an error, log, or stack trace.
2. User selects a context:
   - React
   - Node.js
   - NestJS
   - TypeScript
   - General
3. User submits the form.
4. The app calls `POST /debug/analyze`.
5. The UI renders:
   - summary
   - possible cause
   - suggested fix
   - code example
   - checklist

## Structure

```txt
src/
  main.tsx
  App.tsx
  index.css
  api/
    httpClient.ts
    queryClient.ts
    health.ts
  features/
    health/
      useHealthQuery.ts
    debug/
      DebugAssistantPage.tsx
      types.ts
      api/
        analyzeDebug.ts
      hooks/
        useAnalyzeDebugMutation.ts
```

Shared debug request/response types come from:

```txt
packages/contracts
```

## API Usage

All HTTP calls use the shared Axios client:

```txt
src/api/httpClient.ts
```

Server-state is handled through React Query:

```txt
src/api/queryClient.ts
```

The debug analysis action uses a mutation:

```txt
src/features/debug/hooks/useAnalyzeDebugMutation.ts
```

## Current Status

- API health status is displayed in the header.
- Debug form is implemented.
- Loading, empty, error, and success states are implemented.
- Result UI is structured for the current API response.
- Styling uses Tailwind CSS utility classes.
- Debug contract types are shared through `@ai-debug-assistant/contracts`.
- API validation/provider errors are rendered as user-facing messages.

## Next Web Steps

- Add request cancellation or disabled state refinement for repeated submits.
- Add UI tests once the flow stabilizes.
- Add copy actions for generated analysis and code examples.
