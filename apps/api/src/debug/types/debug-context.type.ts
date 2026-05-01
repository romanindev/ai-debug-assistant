export const DEBUG_CONTEXTS = [
  'react',
  'node',
  'nestjs',
  'typescript',
  'general',
] as const;

export type DebugContext = (typeof DEBUG_CONTEXTS)[number];
