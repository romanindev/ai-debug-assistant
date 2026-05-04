import { DEBUG_CONTEXTS } from '@ai-debug-assistant/contracts/debug/constants';
import type { DebugContext } from '@ai-debug-assistant/contracts';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class AnalyzeDebugDto {
  @IsString()
  @MinLength(10)
  @MaxLength(20_000)
  errorText!: string;

  @IsIn(DEBUG_CONTEXTS)
  context!: DebugContext;
}
