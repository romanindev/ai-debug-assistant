import { MockAiProvider } from './mock-ai.provider';

describe('MockAiProvider', () => {
  let provider: MockAiProvider;

  beforeEach(() => {
    provider = new MockAiProvider();
  });

  describe('analyzeDebug', () => {
    it('returns structured debug analysis', async () => {
      await expect(
        provider.analyzeDebug({
          context: 'typescript',
          errorText: 'TypeError: Cannot read properties of undefined',
        }),
      ).resolves.toEqual({
        summary:
          'Detected a typescript debugging issue: TypeError: Cannot read properties of undefined',
        possibleCause:
          'The issue is likely caused by a mismatch between the expected runtime state and the actual value or execution path.',
        suggestedFix:
          'Start by isolating the failing line, checking the relevant inputs, and verifying that the environment matches the code assumptions.',
        codeExample:
          'if (value == null) throw new Error("Expected value to be defined");',
        checklist: [
          'Read the first error line and identify the failing symbol or operation.',
          'Inspect the stack trace from top to bottom until it reaches your application code.',
          'Reproduce the issue with the smallest possible input or component state.',
          'Add a focused guard, type check, or failing test before changing broader code.',
        ],
      });
    });
  });
});
