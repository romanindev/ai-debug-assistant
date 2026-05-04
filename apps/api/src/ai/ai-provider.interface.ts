import type {
  AnalyzeDebugRequest,
  DebugAnalysis,
} from '@ai-debug-assistant/contracts';

import type { AiProviderName } from './ai.constants';

export interface AiProvider {
  readonly name: AiProviderName;
  analyzeDebug(input: AnalyzeDebugRequest): Promise<DebugAnalysis>;
}
