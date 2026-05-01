import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

import { DEBUG_CONTEXTS, type DebugContext } from '../types/debug-context.type';

export class AnalyzeDebugDto {
  @IsString()
  @MinLength(10)
  @MaxLength(20_000)
  errorText!: string;

  @IsIn(DEBUG_CONTEXTS)
  context!: DebugContext;
}
