import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import { AiProviderError } from '../ai-provider.error';
import { OpenAiProvider, toAiProviderError } from './openai.provider';

describe('OpenAiProvider', () => {
  it('throws a config error when the API key is missing', () => {
    const configService = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;
    const provider = new OpenAiProvider(configService);

    expect(() => provider.assertConfigured()).toThrow(AiProviderError);

    try {
      provider.assertConfigured();
    } catch (error) {
      expect(error).toMatchObject({
        code: 'AI_PROVIDER_CONFIG_ERROR',
        publicMessage: 'OPENAI_API_KEY is required when AI_PROVIDER=openai.',
        status: 500,
      });
    }
  });

  it('throws a config error when the model is missing', async () => {
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'ai.openai.apiKey') {
          return 'test-api-key';
        }

        if (key === 'ai.openai.requestTimeoutMs') {
          return 15_000;
        }

        return undefined;
      }),
    } as unknown as ConfigService;
    const provider = new OpenAiProvider(configService);

    await expect(
      provider.analyzeDebug({
        context: 'typescript',
        errorText: 'TypeError: Cannot read properties of undefined',
      }),
    ).rejects.toMatchObject({
      code: 'AI_PROVIDER_CONFIG_ERROR',
      publicMessage: 'AI provider is not configured correctly.',
      status: 500,
    });
  });

  describe('toAiProviderError', () => {
    it('maps OpenAI timeout errors', () => {
      expect(
        toAiProviderError(new OpenAI.APIConnectionTimeoutError()),
      ).toMatchObject({
        code: 'AI_PROVIDER_TIMEOUT',
        publicMessage: 'AI provider request timed out.',
        status: 504,
      });
    });

    it('maps OpenAI authentication errors', () => {
      expect(
        toAiProviderError(
          new OpenAI.AuthenticationError(
            401,
            {},
            'Invalid API key',
            new Headers(),
          ),
        ),
      ).toMatchObject({
        code: 'AI_PROVIDER_AUTH_ERROR',
        publicMessage: 'AI provider authentication failed.',
        status: 502,
      });
    });

    it('maps OpenAI rate limit errors', () => {
      expect(
        toAiProviderError(
          new OpenAI.RateLimitError(429, {}, 'Rate limited', new Headers()),
        ),
      ).toMatchObject({
        code: 'AI_PROVIDER_RATE_LIMITED',
        publicMessage: 'AI provider rate limit exceeded.',
        status: 429,
      });
    });

    it('maps unknown errors to generic provider errors', () => {
      expect(
        toAiProviderError(new Error('Unexpected SDK failure')),
      ).toMatchObject({
        code: 'AI_PROVIDER_ERROR',
        publicMessage: 'AI provider request failed.',
        status: 502,
      });
    });
  });
});
