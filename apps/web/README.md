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
VITE_API_TIMEOUT_MS=60000
```

The API should allow this frontend origin through `CORS_ORIGIN`.
Authenticated requests use httpOnly cookies, so the shared Axios client sends credentials with API calls.

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
5. Logged-in requests are persisted to user-scoped history.
6. The UI renders:
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
    auth/
      AuthPage.tsx
      api/
        authApi.ts
      hooks/
        useAuthQueries.ts
    debug/
      DebugAssistantPage.tsx
      types.ts
      api/
        analyzeDebug.ts
        listAnalyses.ts
      hooks/
        useAnalysesQuery.ts
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

Auth state is loaded from `GET /auth/me`, and login/register/logout actions use mutations:

```txt
src/features/auth/hooks/useAuthQueries.ts
```

The debug analysis action uses a mutation:

```txt
src/features/debug/hooks/useAnalyzeDebugMutation.ts
```

The persisted history list uses a query:

```txt
src/features/debug/hooks/useAnalysesQuery.ts
```

## Current Status

- API health status is displayed in the header.
- Debug form is implemented.
- Loading, empty, error, and success states are implemented.
- Result UI is structured for the current API response.
- Styling uses Tailwind CSS utility classes.
- Debug contract types are shared through `@ai-debug-assistant/contracts`.
- API validation/provider errors are rendered as user-facing messages.
- The input form warns users to review logs for secrets before submitting.
- Failed debug requests can be retried.
- The last successful result stays visible when a later request fails.
- Generated analysis and code examples can be copied.
- Timeout and provider errors are mapped to clearer user-facing messages.
- Login and registration pages are available at `/login` and `/register`.
- Header controls show login/register links when logged out and user/logout controls when logged in.
- Logged-in users can view and reopen their persisted analysis history.

## Future Web Backlog

- Add UI tests once the flow stabilizes.
- Add richer history management such as delete or search.
