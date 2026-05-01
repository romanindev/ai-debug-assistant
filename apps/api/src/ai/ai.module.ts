import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AI_PROVIDER } from './ai.constants';
import { selectAiProvider } from './ai-provider.factory';
import { AiService } from './ai.service';
import { MockAiProvider } from './providers/mock-ai.provider';
import { OpenAiProvider } from './providers/openai.provider';

@Module({
  providers: [
    AiService,
    MockAiProvider,
    OpenAiProvider,
    {
      provide: AI_PROVIDER,
      inject: [ConfigService, MockAiProvider, OpenAiProvider],
      useFactory: (
        configService: ConfigService,
        mockProvider: MockAiProvider,
        openAiProvider: OpenAiProvider,
      ) =>
        selectAiProvider(configService.get<string>('ai.provider'), {
          mock: mockProvider,
          openai: openAiProvider,
        }),
    },
  ],
  exports: [AiService],
})
export class AiModule {}
