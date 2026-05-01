# API Workspace

This workspace contains the NestJS backend for AI Debug Assistant.

## Purpose

The API is responsible for:

- exposing backend endpoints
- validating incoming requests
- preparing prompts for AI analysis
- calling the AI provider
- returning structured debug analysis results
- handling backend errors consistently

## Tech Stack

- NestJS
- TypeScript
- @nestjs/config
- class-validator / class-transformer planned
- OpenAI SDK planned
- Docker Compose for supporting infrastructure

## Architecture Guidelines

Follow the standard NestJS structure:

```txt
src/
  main.ts
  app.module.ts

  config/
    configuration.ts

  debug/
    debug.module.ts
    debug.controller.ts
    debug.service.ts
    dto/
    types/

  ai/
    ai.module.ts
    ai.service.ts
    prompts/
```

## Responsibilities

Controllers should:

- handle HTTP concerns only
- receive DTOs
- call services
- return responses

Services should:

- contain business logic
- prepare structured data
- call lower-level services when needed

AI-related code should:

- be isolated in the `ai` module
- not leak provider-specific details into controllers
- keep prompts versioned and readable
- return structured results

## Configuration

Use `ConfigModule` and `configuration.ts`.

Do not hardcode environment-specific values such as:

- ports
- CORS origins
- API keys
- provider model names

Prefer config keys such as:

```typescript
configService.getOrThrow('port');
configService.getOrThrow('cors.origin');
```

## API Design

The main planned endpoint is:

```text
POST /debug/analyze
```

Expected input:

```typescript
{
  errorText: string;
  context: 'react' | 'node' | 'nestjs' | 'typescript' | 'general';
}
```

Expected output:

```typescript
{
  summary: string;
  possibleCause: string;
  suggestedFix: string;
  codeExample?: string;
  checklist: string[];
}
```

## Validation

Use DTOs for request validation.

Do not trust raw request bodies.

Prefer clear validation messages and explicit constraints.


## Error Handling

Handle expected errors intentionally.

Avoid wrapping meaningful domain or provider errors into generic errors without preserving context.

Do not expose sensitive internal details to the client.

## AI Integration Guidelines

When adding LLM support:

- keep provider logic in `ai.service.ts`
- keep prompts in `prompts/`
- request structured JSON output
- validate AI responses before returning them
- use timeouts and clear error handling
- avoid sending sensitive user data unnecessarily


## Code Style

- Keep modules small.
- Keep methods focused.
- Use explicit return types for public service methods.
- Prefer readable names over clever abstractions.
- Do not add persistence until the feature needs it.