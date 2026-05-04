import { AiProviderError } from './ai-provider.error';
import type { AiProvider } from './ai-provider.interface';
import { AiService } from './ai.service';

describe('AiService', () => {
  let provider: jest.Mocked<AiProvider>;
  let logger: { log: jest.MockedFunction<(message: string) => void> };

  beforeEach(() => {
    provider = {
      name: 'openai',
      analyzeDebug: jest.fn(),
    };
    logger = {
      log: jest.fn<void, [string]>(),
    };
  });

  it('logs sanitized metadata for successful AI calls', async () => {
    provider.analyzeDebug.mockResolvedValue({
      summary: 'Summary',
      possibleCause: 'Cause',
      suggestedFix: 'Fix',
      codeExample: null,
      checklist: ['Check logs'],
    });
    const service = new AiService(provider, logger);

    await service.analyzeDebug({
      context: 'typescript',
      errorText: 'SECRET_TOKEN=abc123 TypeError',
    });

    expect(logger.log).toHaveBeenCalledTimes(1);
    const rawLog = getLoggedMessage(logger);
    const log = JSON.parse(rawLog) as {
      event: string;
      provider: string;
      promptVersion: string;
      durationMs: number;
      status: string;
      errorText?: string;
    };

    expect(log).toMatchObject({
      event: 'ai.analyze_debug',
      provider: 'openai',
      promptVersion: 'debug-analysis.v1',
      status: 'success',
    });
    expect(log.durationMs).toEqual(expect.any(Number));
    expect(log.errorText).toBeUndefined();
    expect(rawLog).not.toContain('SECRET_TOKEN');
  });

  it('logs provider error category for failed AI calls', async () => {
    provider.analyzeDebug.mockRejectedValue(
      new AiProviderError('AI_PROVIDER_ERROR', 'AI provider request failed.'),
    );
    const service = new AiService(provider, logger);

    await expect(
      service.analyzeDebug({
        context: 'nestjs',
        errorText: 'TypeError: Cannot read properties of undefined',
      }),
    ).rejects.toThrow('AI provider request failed.');

    expect(logger.log).toHaveBeenCalledTimes(1);
    expect(JSON.parse(getLoggedMessage(logger))).toMatchObject({
      event: 'ai.analyze_debug',
      provider: 'openai',
      promptVersion: 'debug-analysis.v1',
      status: 'failure',
      errorCategory: 'AI_PROVIDER_ERROR',
    });
  });
});

function getLoggedMessage(logger: {
  log: jest.MockedFunction<(message: string) => void>;
}): string {
  const firstCall = logger.log.mock.calls[0];

  if (!firstCall) {
    throw new Error('Expected logger.log to be called.');
  }

  return firstCall[0];
}
