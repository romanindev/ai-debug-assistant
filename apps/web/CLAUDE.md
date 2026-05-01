# Web Workspace

This workspace contains the React frontend for AI Debug Assistant.

## Purpose

The web app provides a clean developer-focused UI for submitting errors, logs, and stack traces and displaying structured AI debugging feedback.

## Tech Stack

- React
- TypeScript
- Vite
- Axios
- React Query

## Architecture Guidelines

Prefer feature-based structure:

```txt
src/
  main.tsx
  App.tsx

  api/
    httpClient.ts
    queryClient.ts

  features/
    debug/
      api/
      components/
      hooks/
      types.ts
      DebugAssistantPage.tsx

    health/
      useHealthQuery.ts
```

## Responsibilities

API layer should:

- use the shared Axios client
- keep endpoint calls small and typed
- return response data, not raw Axios responses

React Query hooks should:

- own server-state fetching/mutation logic
- define query keys clearly
- keep components free from request details

Components should:

- focus on rendering and user interaction
- avoid direct API calls
- receive typed props
- stay small and readable


## API Communication

Use Axios through the shared client:

```typescript
import { httpClient } from '../../api/httpClient';
```

Do not create new Axios instances inside features unless there is a clear reason.

Use `VITE_API_URL` for the API base URL.

## Main User Flow

The planned primary flow is:

1. User pastes error/log/stack trace.
2. User selects context:
   - React
   - Node.js
   - NestJS
   - TypeScript
   - General
3. User submits the form. 
4. UI shows loading state. 
5. API returns structured debugging analysis. 
6. UI displays:
   - summary
   - possible cause
   - suggested fix
   - code example
   - checklist

## UX Guidelines

The UI should feel like a developer tool:

- clean
- minimal
- readable
- fast
- practical

Prioritize clarity over visual complexity.

Always handle:

- loading state
- error state
- empty state
- successful result state

## TypeScript Guidelines

Define shared feature types close to the feature:

```text
features/debug/types.ts
```

Avoid using `any`.

Prefer explicit request and response types.

## React Query Guidelines

Use mutations for analyze actions:

```typescript
useMutation({
  mutationFn: analyzeDebug,
});
```
Use queries only for fetch/read operations such as health checks.

## Styling Direction

Keep styling simple for MVP.

Avoid introducing a large design system too early.

Prefer clear layout and reusable small components when needed.

## Code Style

- Keep components focused.
- Avoid premature abstraction.
- Do not mix API logic directly into UI components.
- Prefer readable names.
- Keep the MVP simple but production-minded.