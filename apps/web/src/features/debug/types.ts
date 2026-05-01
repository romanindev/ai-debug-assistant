export const DEBUG_CONTEXTS = [
  'react',
  'node',
  'nestjs',
  'typescript',
  'general',
] as const;

export type DebugContext = (typeof DEBUG_CONTEXTS)[number];

export type AnalyzeDebugRequest = {
  errorText: string;
  context: DebugContext;
};

export type DebugAnalysis = {
  summary: string;
  possibleCause: string;
  suggestedFix: string;
  codeExample?: string;
  checklist: string[];
};
