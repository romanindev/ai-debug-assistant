import { buildDebugAnalysisPrompt } from './debug-analysis.v1.prompt';

describe('buildDebugAnalysisPrompt', () => {
  it('includes context and debug input', () => {
    expect(
      buildDebugAnalysisPrompt({
        context: 'react',
        errorText: 'TypeError: Cannot read properties of undefined',
      }),
    ).toContain('Context: react');
    expect(
      buildDebugAnalysisPrompt({
        context: 'react',
        errorText: 'TypeError: Cannot read properties of undefined',
      }),
    ).toContain('TypeError: Cannot read properties of undefined');
  });
});
