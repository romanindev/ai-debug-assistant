import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AI_PROVIDER } from './ai.constants';
import { selectAiProvider } from './ai-provider.factory';
import { AiService } from './ai.service';
import { MockAiProvider } from './providers/mock-ai.provider';

@Module({
  providers: [
    AiService,
    MockAiProvider,
    {
      provide: AI_PROVIDER,
      inject: [ConfigService, MockAiProvider],
      useFactory: (
        configService: ConfigService,
        mockProvider: MockAiProvider,
      ) =>
        selectAiProvider(configService.get<string>('ai.provider'), {
          mock: mockProvider,
        }),
    },
  ],
  exports: [AiService],
})
export class AiModule {}
