import type {
  AnalyzeDebugRequest,
  DebugAnalysis,
} from '@ai-debug-assistant/contracts';

export interface AiProvider {
  analyzeDebug(input: AnalyzeDebugRequest): Promise<DebugAnalysis>;
}
