import { Module } from '@nestjs/common';

import { AiModule } from '../ai/ai.module';
import { DebugController } from './debug.controller';
import { DebugService } from './debug.service';

@Module({
  imports: [AiModule],
  controllers: [DebugController],
  providers: [DebugService],
})
export class DebugModule {}
