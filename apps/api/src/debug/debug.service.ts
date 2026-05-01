import { Injectable } from '@nestjs/common';

import { AnalyzeDebugDto } from './dto/analyze-debug.dto';
import { DebugAnalysis } from './types/debug-analysis.type';

@Injectable()
export class DebugService {
  analyze({ context, errorText }: AnalyzeDebugDto): DebugAnalysis {
    const firstLine = errorText.trim().split('\n')[0] ?? 'Runtime issue';

    return {
      summary: `Detected a ${context} debugging issue: ${firstLine}`,
      possibleCause:
        'The issue is likely caused by a mismatch between the expected runtime state and the actual value or execution path.',
      suggestedFix:
        'Start by isolating the failing line, checking the relevant inputs, and verifying that the environment matches the code assumptions.',
      codeExample: this.getCodeExample(context),
      checklist: [
        'Read the first error line and identify the failing symbol or operation.',
        'Inspect the stack trace from top to bottom until it reaches your application code.',
        'Reproduce the issue with the smallest possible input or component state.',
        'Add a focused guard, type check, or failing test before changing broader code.',
      ],
    };
  }

  private getCodeExample(context: AnalyzeDebugDto['context']): string {
    if (context === 'react') {
      return 'if (!data) return null;';
    }

    if (context === 'typescript') {
      return 'if (value == null) throw new Error("Expected value to be defined");';
    }

    return 'console.error(error);';
  }
}
