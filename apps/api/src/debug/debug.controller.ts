import type { DebugAnalysis } from '@ai-debug-assistant/contracts';
import { Body, Controller, Post } from '@nestjs/common';

import { DebugService } from './debug.service';
import { AnalyzeDebugDto } from './dto/analyze-debug.dto';

@Controller('debug')
export class DebugController {
  constructor(private readonly debugService: DebugService) {}

  @Post('analyze')
  analyze(@Body() dto: AnalyzeDebugDto): Promise<DebugAnalysis> {
    return this.debugService.analyze(dto);
  }
}
