import type { DebugAnalysis } from '@ai-debug-assistant/contracts';
import { Injectable } from '@nestjs/common';

import { AiService } from '../ai/ai.service';
import { AnalyzeDebugDto } from './dto/analyze-debug.dto';

@Injectable()
export class DebugService {
  constructor(private readonly aiService: AiService) {}

  analyze(dto: AnalyzeDebugDto): Promise<DebugAnalysis> {
    return this.aiService.analyzeDebug(dto);
  }
}
