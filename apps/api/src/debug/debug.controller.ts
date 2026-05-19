import type {
  DebugAnalysis,
  PersistedDebugAnalysis,
} from '@ai-debug-assistant/contracts';
import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import { AuthService } from '../auth/auth.service';
import { DebugService } from './debug.service';
import { AnalyzeDebugDto } from './dto/analyze-debug.dto';

@Controller('debug')
export class DebugController {
  constructor(
    private readonly debugService: DebugService,
    private readonly authService: AuthService,
  ) {}

  @Post('analyze')
  async analyze(
    @Body() dto: AnalyzeDebugDto,
    @Req() request: Request,
  ): Promise<DebugAnalysis> {
    const user = await this.getCurrentUser(request);

    return this.debugService.analyze(dto, user?.id);
  }

  @Get('analyses')
  async listAnalyses(
    @Req() request: Request,
  ): Promise<PersistedDebugAnalysis[]> {
    const user = await this.getCurrentUser(request);

    return this.debugService.listAnalyses(user?.id);
  }

  @Get('analyses/:id')
  async getAnalysis(
    @Param('id') id: string,
    @Req() request: Request,
  ): Promise<PersistedDebugAnalysis> {
    const user = await this.getCurrentUser(request);

    return this.debugService.getAnalysis(id, user?.id);
  }

  private getCurrentUser(request: Request) {
    return this.authService.getCurrentUserFromCookieHeader(
      request.headers.cookie,
    );
  }
}
