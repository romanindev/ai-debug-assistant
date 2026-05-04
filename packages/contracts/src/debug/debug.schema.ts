import { z } from 'zod';

import { DEBUG_CONTEXTS } from './debug.constants.js';

export const debugContextSchema = z.enum(DEBUG_CONTEXTS);

export const analyzeDebugRequestSchema = z.object({
  errorText: z.string().min(10).max(20_000),
  context: debugContextSchema,
});

export const debugAnalysisSchema = z.object({
  summary: z.string().min(1),
  possibleCause: z.string().min(1),
  suggestedFix: z.string().min(1),
  codeExample: z.string().min(1).nullable(),
  checklist: z.array(z.string().min(1)).min(1),
});

export const persistedDebugAnalysisSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  context: debugContextSchema,
  errorText: z.string().min(1),
  provider: z.string().min(1),
  promptVersion: z.string().min(1),
  analysis: debugAnalysisSchema,
});
