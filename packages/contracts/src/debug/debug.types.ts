import type { z } from 'zod';

import type {
  analyzeDebugRequestSchema,
  debugAnalysisSchema,
  debugContextSchema,
} from './debug.schema.js';

export type DebugContext = z.infer<typeof debugContextSchema>;

export type AnalyzeDebugRequest = z.infer<typeof analyzeDebugRequestSchema>;

export type DebugAnalysis = z.infer<typeof debugAnalysisSchema>;
