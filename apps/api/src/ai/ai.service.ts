import type {
  AnalyzeDebugRequest,
  DebugAnalysis,
} from '@ai-debug-assistant/contracts';
import { Inject, Injectable, Logger, Optional } from '@nestjs/common';

import { AI_PROVIDER } from './ai.constants';
import { AiProviderError } from './ai-provider.error';
import type { AiProvider } from './ai-provider.interface';
import { DEBUG_ANALYSIS_PROMPT_VERSION } from './prompts/debug-analysis.v1.prompt';

type ErrorLogger = Pick<Logger, 'log'>;

type AiCallLog = {
  event: 'ai.analyze_debug';
  provider: string;
  promptVersion: string;
  durationMs: number;
  status: 'success' | 'failure';
  errorCategory?: string;
};

@Injectable()
export class AiService {
  constructor(
    @Inject(AI_PROVIDER) private readonly provider: AiProvider,
    @Optional()
    private readonly logger: ErrorLogger = new Logger(AiService.name),
  ) {}

  async analyzeDebug(input: AnalyzeDebugRequest): Promise<DebugAnalysis> {
    const startedAt = Date.now();

    try {
      const analysis = await this.provider.analyzeDebug(input);

      this.logAiCall({
        event: 'ai.analyze_debug',
        provider: this.provider.name,
        promptVersion: DEBUG_ANALYSIS_PROMPT_VERSION,
        durationMs: Date.now() - startedAt,
        status: 'success',
      });

      return analysis;
    } catch (error) {
      this.logAiCall({
        event: 'ai.analyze_debug',
        provider: this.provider.name,
        promptVersion: DEBUG_ANALYSIS_PROMPT_VERSION,
        durationMs: Date.now() - startedAt,
        status: 'failure',
        errorCategory: this.getErrorCategory(error),
      });

      throw error;
    }
  }

  private logAiCall(log: AiCallLog): void {
    this.logger.log(JSON.stringify(log));
  }

  private getErrorCategory(error: unknown): string {
    if (error instanceof AiProviderError) {
      return error.code;
    }

    return 'UNKNOWN_ERROR';
  }
}
