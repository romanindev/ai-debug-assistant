import type { AnalyzeDebugRequest } from '@ai-debug-assistant/contracts';

export const DEBUG_ANALYSIS_PROMPT_VERSION = 'debug-analysis.v1';

export function buildDebugAnalysisPrompt({
  context,
  errorText,
}: AnalyzeDebugRequest): string {
  return [
    'Analyze this debugging input and return practical guidance for a developer.',
    '',
    `Context: ${context}`,
    '',
    'Debug input:',
    errorText,
    '',
    'Focus on the most likely cause, a concrete fix, and a short checklist.',
    'Keep the response concise and avoid inventing details that are not supported by the input.',
  ].join('\n');
}
