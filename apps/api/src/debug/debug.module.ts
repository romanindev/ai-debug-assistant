import { Module } from '@nestjs/common';

import { AiModule } from '../ai/ai.module';
import { AnalysisHistoryModule } from '../analysis-history/analysis-history.module';
import { DebugController } from './debug.controller';
import { DebugService } from './debug.service';

@Module({
  imports: [AiModule, AnalysisHistoryModule],
  controllers: [DebugController],
  providers: [DebugService],
})
export class DebugModule {}
