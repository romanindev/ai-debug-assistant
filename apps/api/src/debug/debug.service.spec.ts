import type { DebugAnalysis } from '@ai-debug-assistant/contracts';

import type { AiService } from '../ai/ai.service';
import { DebugService } from './debug.service';

describe('DebugService', () => {
  let service: DebugService;
  let aiService: jest.Mocked<Pick<AiService, 'analyzeDebug'>>;

  beforeEach(() => {
    aiService = {
      analyzeDebug: jest.fn(),
    };
    service = new DebugService(aiService as AiService);
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
    });
  });
});
