import {
  debugAnalysisSchema,
  type AnalyzeDebugRequest,
  type DebugAnalysis,
} from '@ai-debug-assistant/contracts';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';

import { AiProviderError } from '../ai-provider.error';
import type { AiProvider } from '../ai-provider.interface';
import { buildDebugAnalysisPrompt } from '../prompts/debug-analysis.v1.prompt';
import { redactSensitiveInput } from '../safety/redact-sensitive-input';

@Injectable()
export class OpenAiProvider implements AiProvider {
  constructor(private readonly configService: ConfigService) {}

  async analyzeDebug(input: AnalyzeDebugRequest): Promise<DebugAnalysis> {
    const client = this.createClient();
    const model = this.configService.get<string>('ai.openai.model');

    if (!model) {
      throw new Error('OPENAI_MODEL is required when AI_PROVIDER=openai.');
    }

    const redactedInput: AnalyzeDebugRequest = {
      ...input,
      errorText: redactSensitiveInput(input.errorText),
    };

    const response = await client.responses
      .parse({
        model,
        input: [
          {
            role: 'system',
            content:
              'You are a senior software debugging assistant. Return only structured debugging guidance that matches the requested schema.',
          },
          {
            role: 'user',
            content: buildDebugAnalysisPrompt(redactedInput),
          },
        ],
        text: {
          format: zodTextFormat(debugAnalysisSchema, 'debug_analysis'),
        },
      })
      .catch((error: unknown) => {
        throw new AiProviderError(
          'AI_PROVIDER_ERROR',
          'AI provider request failed.',
          502,
          error instanceof Error ? { cause: error } : undefined,
        );
      });

    if (!response.output_parsed) {
      throw new AiProviderError(
        'AI_MALFORMED_RESPONSE',
        'AI provider returned an invalid response.',
      );
    }

    return response.output_parsed;
  }

  assertConfigured(): void {
    this.getApiKey();
  }

  private createClient(): OpenAI {
    return new OpenAI({
      apiKey: this.getApiKey(),
      timeout: this.configService.get<number>(
        'ai.openai.requestTimeoutMs',
        15_000,
      ),
      maxRetries: 0,
    });
  }

  private getApiKey(): string {
    const apiKey = this.configService.get<string>('ai.openai.apiKey');

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required when AI_PROVIDER=openai.');
    }

    return apiKey;
  }
}
