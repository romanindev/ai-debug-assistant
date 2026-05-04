import type {
  AnalyzeDebugRequest,
  DebugAnalysis,
} from '@ai-debug-assistant/contracts';
import { Inject, Injectable } from '@nestjs/common';

import { AI_PROVIDER } from './ai.constants';
import type { AiProvider } from './ai-provider.interface';

@Injectable()
export class AiService {
  constructor(@Inject(AI_PROVIDER) private readonly provider: AiProvider) {}

  analyzeDebug(input: AnalyzeDebugRequest): Promise<DebugAnalysis> {
    return this.provider.analyzeDebug(input);
  }
}
