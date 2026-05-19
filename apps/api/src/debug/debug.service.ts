import type {
  DebugAnalysis,
  PersistedDebugAnalysis,
} from '@ai-debug-assistant/contracts';
import { Injectable, NotFoundException } from '@nestjs/common';

import { AiService } from '../ai/ai.service';
import { DEBUG_ANALYSIS_PROMPT_VERSION } from '../ai/prompts/debug-analysis.v1.prompt';
import { redactSensitiveInput } from '../ai/safety/redact-sensitive-input';
import { AnalysisHistoryService } from '../analysis-history/analysis-history.service';
import { AnalyzeDebugDto } from './dto/analyze-debug.dto';

@Injectable()
export class DebugService {
  constructor(
    private readonly aiService: AiService,
    private readonly analysisHistoryService: AnalysisHistoryService,
  ) {}

  async analyze(dto: AnalyzeDebugDto, userId?: string): Promise<DebugAnalysis> {
    const analysis = await this.aiService.analyzeDebug(dto);

    await this.analysisHistoryService.save({
      userId,
      context: dto.context,
      errorText: redactSensitiveInput(dto.errorText),
      provider: this.aiService.getProviderName(),
      promptVersion: DEBUG_ANALYSIS_PROMPT_VERSION,
      analysis: redactDebugAnalysis(analysis),
    });

    return analysis;
  }

  listAnalyses(userId?: string): Promise<PersistedDebugAnalysis[]> {
    return this.analysisHistoryService.listRecent(userId);
  }

  async getAnalysis(
    id: string,
    userId?: string,
  ): Promise<PersistedDebugAnalysis> {
    const analysis = await this.analysisHistoryService.findById(id, userId);

    if (!analysis) {
      throw new NotFoundException('Analysis was not found.');
    }

    return analysis;
  }
}

function redactDebugAnalysis(analysis: DebugAnalysis): DebugAnalysis {
  return {
    summary: redactSensitiveInput(analysis.summary),
    possibleCause: redactSensitiveInput(analysis.possibleCause),
    suggestedFix: redactSensitiveInput(analysis.suggestedFix),
    codeExample: analysis.codeExample
      ? redactSensitiveInput(analysis.codeExample)
      : analysis.codeExample,
    checklist: analysis.checklist.map((item) => redactSensitiveInput(item)),
  };
}
