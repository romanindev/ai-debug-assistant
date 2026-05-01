# AI Debug Assistant

AI Debug Assistant is a full-stack monorepo project for building an AI-powered debugging tool.

The application helps developers analyze errors, logs, stack traces, and runtime issues and returns structured debugging guidance.

## Tech Stack

- Monorepo: pnpm workspaces
- Frontend: React, TypeScript, Vite, Axios, React Query
- Backend: NestJS, TypeScript
- Infrastructure: Docker Compose
- AI integration: planned LLM provider integration

## Workspaces

- `apps/api` — NestJS backend API
- `apps/web` — React frontend application

## Product Goal

The main goal is to build a production-style AI Debug Assistant that can return structured analysis:

- summary
- possible cause
- suggested fix
- code example
- checklist

## Engineering Principles

- Prefer simple, maintainable solutions.
- Do not overengineer the MVP.
- Keep responsibilities clearly separated.
- Use TypeScript types intentionally.
- Avoid introducing abstractions before they are needed.
- Keep code readable and explicit.
- Follow the existing project structure.
- Do not invent new architecture without a clear reason.

## Monorepo Guidelines

When working on a specific workspace, check the local `CLAUDE.md` first:

- for backend changes, read `apps/api/CLAUDE.md`
- for frontend changes, read `apps/web/CLAUDE.md`

Root-level changes should be limited to:

- workspace configuration
- shared scripts
- Docker Compose
- documentation
- repository-wide tooling

Avoid placing application-specific logic in the root.

## Development Workflow

Use pnpm from the repository root.

Common commands:

```bash
pnpm dev
pnpm dev:api
pnpm dev:web
pnpm build
pnpm lint
```

Install dependencies using workspace filters:

```bash
pnpm --filter api add <package>
pnpm --filter web add <package>
```

Do not install app-specific dependencies in the root package unless they are truly repository-wide tools.

## Current Architecture Direction

The project should evolve incrementally:

1. Basic monorepo foundation 
2. Backend debug analysis endpoint 
3. Frontend debug form and result UI 
4. Mock AI response 
5. LLM provider integration 
6. Structured output validation 
7. Error handling, retries, and observability 
8. Optional persistence/history

Always prefer small, reviewable changes.