import type {
  DebugAnalysis,
  PersistedDebugAnalysis,
} from '@ai-debug-assistant/contracts';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { DebugService } from './debug.service';
import { AnalyzeDebugDto } from './dto/analyze-debug.dto';

@Controller('debug')
export class DebugController {
  constructor(private readonly debugService: DebugService) {}

  @Post('analyze')
  analyze(@Body() dto: AnalyzeDebugDto): Promise<DebugAnalysis> {
    return this.debugService.analyze(dto);
  }

  @Get('analyses')
  listAnalyses(): Promise<PersistedDebugAnalysis[]> {
    return this.debugService.listAnalyses();
  }

  @Get('analyses/:id')
  getAnalysis(@Param('id') id: string): Promise<PersistedDebugAnalysis> {
    return this.debugService.getAnalysis(id);
  }
}
