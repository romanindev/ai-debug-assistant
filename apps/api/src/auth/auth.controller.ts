import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { AuthResponse } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const { user, token } = await this.authService.register(dto);
    this.setAuthCookie(response, token);

    return { user };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const { user, token } = await this.authService.login(dto);
    this.setAuthCookie(response, token);

    return { user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response): AuthResponse {
    response.clearCookie(this.authService.getCookieName(), {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.authService.isCookieSecure(),
    });

    return { user: null };
  }

  @Get('me')
  async me(@Req() request: Request): Promise<AuthResponse> {
    const user = await this.authService.getCurrentUserFromCookieHeader(
      request.headers.cookie,
    );

    return { user };
  }

  private setAuthCookie(response: Response, token: string): void {
    response.cookie(this.authService.getCookieName(), token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.authService.isCookieSecure(),
      maxAge: this.authService.getCookieMaxAgeMs(),
    });
  }
}
