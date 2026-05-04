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
  const openAiProvider: AiProvider & { assertConfigured: jest.Mock } = {
    analyzeDebug: jest.fn().mockResolvedValue(analysis),
    assertConfigured: jest.fn(),
  };

  it('returns the mock provider by default', () => {
    expect(
      selectAiProvider(undefined, {
        mock: mockProvider,
        openai: openAiProvider,
      }),
    ).toBe(mockProvider);
  });

  it('returns the mock provider when configured explicitly', () => {
    expect(
      selectAiProvider('mock', {
        mock: mockProvider,
        openai: openAiProvider,
      }),
    ).toBe(mockProvider);
  });

  it('returns the OpenAI provider when configured explicitly', () => {
    expect(
      selectAiProvider('openai', {
        mock: mockProvider,
        openai: openAiProvider,
      }),
    ).toBe(openAiProvider);
    expect(openAiProvider.assertConfigured).toHaveBeenCalledTimes(1);
  });

  it('throws for unsupported providers', () => {
    expect(() =>
      selectAiProvider('anthropic', {
        mock: mockProvider,
        openai: openAiProvider,
      }),
    ).toThrow(
      'Unsupported AI_PROVIDER "anthropic". Supported providers: mock, openai',
    );
  });

  it('throws when OpenAI provider is selected without required configuration', () => {
    openAiProvider.assertConfigured.mockImplementation(() => {
      throw new Error('OPENAI_API_KEY is required when AI_PROVIDER=openai.');
    });

    expect(() =>
      selectAiProvider('openai', {
        mock: mockProvider,
        openai: openAiProvider,
      }),
    ).toThrow('OPENAI_API_KEY is required when AI_PROVIDER=openai.');
  });
});
