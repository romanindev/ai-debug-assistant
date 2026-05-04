import { Module } from '@nestjs/common';

import { AnalysisHistoryService } from './analysis-history.service';

@Module({
  providers: [AnalysisHistoryService],
  exports: [AnalysisHistoryService],
})
export class AnalysisHistoryModule {}
