import { Module } from '@nestjs/common';

import { AI_PROVIDER } from './ai.constants';
import { AiService } from './ai.service';
import { MockAiProvider } from './providers/mock-ai.provider';

@Module({
  providers: [
    AiService,
    MockAiProvider,
    {
      provide: AI_PROVIDER,
      useExisting: MockAiProvider,
    },
  ],
  exports: [AiService],
})
export class AiModule {}
