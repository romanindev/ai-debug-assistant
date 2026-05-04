import type { DebugAnalysis } from '@ai-debug-assistant/contracts';

import type { AiService } from '../ai/ai.service';
import type { AnalysisHistoryService } from '../analysis-history/analysis-history.service';
import { DebugService } from './debug.service';

describe('DebugService', () => {
  let service: DebugService;
  let aiService: jest.Mocked<
    Pick<AiService, 'analyzeDebug' | 'getProviderName'>
  >;
  let analysisHistoryService: jest.Mocked<
    Pick<AnalysisHistoryService, 'save' | 'listRecent' | 'findById'>
  >;

  beforeEach(() => {
    aiService = {
      analyzeDebug: jest.fn(),
      getProviderName: jest.fn().mockReturnValue('mock'),
    };
    analysisHistoryService = {
      save: jest.fn().mockResolvedValue(undefined),
      listRecent: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue(null),
    };
    service = new DebugService(
      aiService as AiService,
      analysisHistoryService as AnalysisHistoryService,
    );
  });

  describe('analyze', () => {
    it('delegates debug analysis to the AI service', async () => {
      const analysis: DebugAnalysis = {
        summary:
          'Detected a typescript debugging issue: TypeError: Cannot read properties of undefined',
        possibleCause: 'Possible cause',
        suggestedFix: 'Suggested fix',
        codeExample:
          'if (value == null) throw new Error("Expected value to be defined");',
        checklist: ['Inspect the stack trace.'],
      };
      aiService.analyzeDebug.mockResolvedValue(analysis);

      const request = {
        context: 'typescript',
        errorText: 'TypeError: Cannot read properties of undefined',
      } as const;

      await expect(service.analyze(request)).resolves.toBe(analysis);
      expect(aiService.analyzeDebug).toHaveBeenCalledWith(request);
      expect(analysisHistoryService.save).toHaveBeenCalledWith({
        context: 'typescript',
        errorText: 'TypeError: Cannot read properties of undefined',
        provider: 'mock',
        promptVersion: 'debug-analysis.v1',
        analysis,
      });
    });

    it('saves redacted debug input after analysis succeeds', async () => {
      const analysis: DebugAnalysis = {
        summary: 'Summary',
        possibleCause: 'Possible cause',
        suggestedFix: 'Suggested fix',
        codeExample: null,
        checklist: ['Inspect the stack trace.'],
      };
      aiService.analyzeDebug.mockResolvedValue(analysis);

      await service.analyze({
        context: 'node',
        errorText: 'OPENAI_API_KEY=sk-test-token TypeError',
      });

      const savedInput = getSavedAnalysisInput(analysisHistoryService);

      expect(savedInput.errorText).toBe(
        'OPENAI_API_KEY= [REDACTED_SECRET] TypeError',
      );
      expect(savedInput.analysis.summary).toBe('Summary');
    });

    it('saves redacted analysis text after analysis succeeds', async () => {
      const analysis: DebugAnalysis = {
        summary: 'OPENAI_API_KEY=sk-test-token caused the failure',
        possibleCause: 'token: abc123 was included',
        suggestedFix: 'Remove password="super-secret"',
        codeExample: 'const password = "super-secret";',
        checklist: ['Check OPENAI_API_KEY=sk-test-token'],
      };
      aiService.analyzeDebug.mockResolvedValue(analysis);

      await service.analyze({
        context: 'node',
        errorText: 'TypeError: Cannot read properties of undefined',
      });

      const savedAnalysis = getSavedAnalysisInput(
        analysisHistoryService,
      ).analysis;

      expect(JSON.stringify(savedAnalysis)).not.toContain('sk-test-token');
      expect(JSON.stringify(savedAnalysis)).not.toContain('abc123');
      expect(JSON.stringify(savedAnalysis)).not.toContain('super-secret');
      expect(savedAnalysis).toMatchObject({
        summary: 'OPENAI_API_KEY= [REDACTED_SECRET] caused the failure',
        possibleCause: 'token: [REDACTED_SECRET] was included',
        checklist: ['Check OPENAI_API_KEY= [REDACTED_SECRET]'],
      });
      expect(savedAnalysis?.suggestedFix).toContain('[REDACTED_SECRET]');
      expect(savedAnalysis?.codeExample).toContain('[REDACTED_SECRET]');
    });
  });

  describe('listAnalyses', () => {
    it('delegates to analysis history service', async () => {
      await expect(service.listAnalyses()).resolves.toEqual([]);
      expect(analysisHistoryService.listRecent).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAnalysis', () => {
    it('returns an analysis by id', async () => {
      const persistedAnalysis = {
        id: '4fd0459d-c9de-4dfa-b573-a6506202fb8f',
        createdAt: '2026-05-04T11:05:23.192Z',
        context: 'typescript',
        errorText: 'TypeError',
        provider: 'mock',
        promptVersion: 'debug-analysis.v1',
        analysis: {
          summary: 'Summary',
          possibleCause: 'Cause',
          suggestedFix: 'Fix',
          codeExample: null,
          checklist: ['Check logs'],
        },
      } as const;
      analysisHistoryService.findById.mockResolvedValue(persistedAnalysis);

      await expect(service.getAnalysis(persistedAnalysis.id)).resolves.toBe(
        persistedAnalysis,
      );
      expect(analysisHistoryService.findById).toHaveBeenCalledWith(
        persistedAnalysis.id,
      );
    });

    it('throws when an analysis is not found', async () => {
      await expect(
        service.getAnalysis('4fd0459d-c9de-4dfa-b573-a6506202fb8f'),
      ).rejects.toThrow('Analysis was not found.');
    });
  });
});

function getSavedAnalysisInput(
  analysisHistoryService: jest.Mocked<
    Pick<AnalysisHistoryService, 'save' | 'listRecent' | 'findById'>
  >,
): Parameters<AnalysisHistoryService['save']>[0] {
  const firstCall = analysisHistoryService.save.mock.calls[0];

  if (!firstCall) {
    throw new Error('Expected analysisHistoryService.save to be called.');
  }

  return firstCall[0];
}
