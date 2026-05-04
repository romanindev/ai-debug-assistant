import { ConfigService } from '@nestjs/config';

import { OpenAiProvider } from './openai.provider';

describe('OpenAiProvider', () => {
  it('throws a clear error when the API key is missing', () => {
    const configService = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;
    const provider = new OpenAiProvider(configService);

    expect(() => provider.assertConfigured()).toThrow(
      'OPENAI_API_KEY is required when AI_PROVIDER=openai.',
    );
  });
});
