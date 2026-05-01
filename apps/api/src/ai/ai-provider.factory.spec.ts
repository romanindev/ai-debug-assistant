import type { DebugAnalysis } from '@ai-debug-assistant/contracts';

import type { AiProvider } from './ai-provider.interface';
import { selectAiProvider } from './ai-provider.factory';

describe('selectAiProvider', () => {
  const analysis: DebugAnalysis = {
    summary: 'Summary',
    possibleCause: 'Possible cause',
    suggestedFix: 'Suggested fix',
    checklist: ['Check the stack trace.'],
  };

  const mockProvider: AiProvider = {
    analyzeDebug: jest.fn().mockResolvedValue(analysis),
  };

  it('returns the mock provider by default', () => {
    expect(selectAiProvider(undefined, { mock: mockProvider })).toBe(
      mockProvider,
    );
  });

  it('returns the mock provider when configured explicitly', () => {
    expect(selectAiProvider('mock', { mock: mockProvider })).toBe(mockProvider);
  });

  it('throws for unsupported providers', () => {
    expect(() => selectAiProvider('openai', { mock: mockProvider })).toThrow(
      'Unsupported AI_PROVIDER "openai". Supported providers: mock',
    );
  });
});
