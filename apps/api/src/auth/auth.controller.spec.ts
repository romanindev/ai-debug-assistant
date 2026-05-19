import type { Request, Response } from 'express';

import { AuthController } from './auth.controller';
import type { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<
    Pick<
      AuthService,
      | 'register'
      | 'login'
      | 'getCurrentUser'
      | 'getCurrentUserFromCookieHeader'
      | 'getCookieName'
      | 'getCookieMaxAgeMs'
      | 'isCookieSecure'
    >
  >;
  let response: {
    cookie: jest.Mock;
    clearCookie: jest.Mock;
  };

  beforeEach(() => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      getCurrentUser: jest.fn(),
      getCurrentUserFromCookieHeader: jest.fn(),
      getCookieName: jest.fn().mockReturnValue('ai_debug_session'),
      getCookieMaxAgeMs: jest.fn().mockReturnValue(604800000),
      isCookieSecure: jest.fn().mockReturnValue(false),
    };
    response = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };
    controller = new AuthController(authService as AuthService);
  });

  it('sets an httpOnly auth cookie on registration', async () => {
    const user = {
      id: 'user-id',
      email: 'dev@example.com',
      createdAt: '2026-05-19T10:00:00.000Z',
    };
    authService.register.mockResolvedValue({
      user,
      token: 'signed-token',
    });

    await expect(
      controller.register(
        { email: 'dev@example.com', password: 'password123' },
        response as unknown as Response,
      ),
    ).resolves.toEqual({ user });
    expect(response.cookie).toHaveBeenCalledWith(
      'ai_debug_session',
      'signed-token',
      {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 604800000,
      },
    );
  });

  it('clears the auth cookie on logout', () => {
    expect(controller.logout(response as unknown as Response)).toEqual({
      user: null,
    });
    expect(response.clearCookie).toHaveBeenCalledWith('ai_debug_session', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    });
  });

  it('returns the current user from the auth cookie', async () => {
    const user = {
      id: 'user-id',
      email: 'dev@example.com',
      createdAt: '2026-05-19T10:00:00.000Z',
    };
    authService.getCurrentUserFromCookieHeader.mockResolvedValue(user);
    const request = {
      headers: {
        cookie: 'other=value; ai_debug_session=signed-token',
      },
    } as Request;

    await expect(controller.me(request)).resolves.toEqual({ user });
    expect(authService.getCurrentUserFromCookieHeader).toHaveBeenCalledWith(
      'other=value; ai_debug_session=signed-token',
    );
  });
});
