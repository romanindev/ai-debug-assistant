import {
  debugAnalysisSchema,
  type AnalyzeDebugRequest,
  type DebugAnalysis,
} from '@ai-debug-assistant/contracts';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';

import type { AiProvider } from '../ai-provider.interface';
import { buildDebugAnalysisPrompt } from '../prompts/debug-analysis.v1.prompt';

@Injectable()
export class OpenAiProvider implements AiProvider {
  constructor(private readonly configService: ConfigService) {}

  async analyzeDebug(input: AnalyzeDebugRequest): Promise<DebugAnalysis> {
    const client = this.createClient();
    const model = this.configService.get<string>('ai.openai.model');

    if (!model) {
      throw new Error('OPENAI_MODEL is required when AI_PROVIDER=openai.');
    }

    const response = await client.responses.parse({
      model,
      input: [
        {
          role: 'system',
          content:
            'You are a senior software debugging assistant. Return only structured debugging guidance that matches the requested schema.',
        },
        {
          role: 'user',
          content: buildDebugAnalysisPrompt(input),
        },
      ],
      text: {
        format: zodTextFormat(debugAnalysisSchema, 'debug_analysis'),
      },
    });

    if (!response.output_parsed) {
      throw new Error('OpenAI response did not include parsed debug analysis.');
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
