import { Body, Controller, Post } from '@nestjs/common';

import { DebugService } from './debug.service';
import { AnalyzeDebugDto } from './dto/analyze-debug.dto';
import type { DebugAnalysis } from './types/debug-analysis.type';

@Controller('debug')
export class DebugController {
  constructor(private readonly debugService: DebugService) {}

  @Post('analyze')
  analyze(@Body() dto: AnalyzeDebugDto): DebugAnalysis {
    return this.debugService.analyze(dto);
  }
}
