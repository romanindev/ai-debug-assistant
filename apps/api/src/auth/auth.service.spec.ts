import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

import { AuthService } from './auth.service';

jest.mock('pg', () => ({
  Pool: jest.fn(),
}));

const PoolMock = Pool as unknown as jest.Mock;

describe('AuthService', () => {
  let query: jest.MockedFunction<
    (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>
  >;
  let end: jest.Mock;

  beforeEach(() => {
    query = jest.fn();
    end = jest.fn();
    PoolMock.mockImplementation(() => ({ query, end }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('registers a user and returns a signed token', async () => {
    query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'user-id',
            email: 'dev@example.com',
            password_hash: 'stored-hash',
            created_at: new Date('2026-05-19T10:00:00.000Z'),
          },
        ],
      });
    const service = new AuthService(createConfigService());

    const result = await service.register({
      email: ' Dev@Example.com ',
      password: 'password123',
    });

    expect(result.user).toEqual({
      id: 'user-id',
      email: 'dev@example.com',
      createdAt: '2026-05-19T10:00:00.000Z',
    });
    expect(result.token.split('.')).toHaveLength(3);
    expect(query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('INSERT INTO users'),
      expect.arrayContaining(['dev@example.com']),
    );
  });

  it('rejects duplicate registration emails', async () => {
    query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({
      rows: [
        {
          id: 'user-id',
          email: 'dev@example.com',
          password_hash: 'hash',
          created_at: new Date('2026-05-19T10:00:00.000Z'),
        },
      ],
    });
    const service = new AuthService(createConfigService());

    await expect(
      service.register({
        email: 'dev@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('logs in a user with a valid password', async () => {
    query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'user-id',
            email: 'dev@example.com',
            password_hash: 'stored-hash',
            created_at: new Date('2026-05-19T10:00:00.000Z'),
          },
        ],
      });
    const service = new AuthService(createConfigService());
    const registration = await service.register({
      email: 'dev@example.com',
      password: 'password123',
    });
    const insertedPasswordHash = getInsertedPasswordHash(query);

    query.mockResolvedValueOnce({
      rows: [
        {
          id: 'user-id',
          email: 'dev@example.com',
          password_hash: insertedPasswordHash,
          created_at: new Date('2026-05-19T10:00:00.000Z'),
        },
      ],
    });

    const login = await service.login({
      email: 'dev@example.com',
      password: 'password123',
    });

    expect(login.user).toEqual(registration.user);
    expect(typeof login.token).toBe('string');
  });

  it('rejects login with an invalid password', async () => {
    query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({
      rows: [
        {
          id: 'user-id',
          email: 'dev@example.com',
          password_hash: 'scrypt$salt$hash',
          created_at: new Date('2026-05-19T10:00:00.000Z'),
        },
      ],
    });
    const service = new AuthService(createConfigService());

    await expect(
      service.login({
        email: 'dev@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('returns the current user from a valid token', async () => {
    query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'user-id',
            email: 'dev@example.com',
            password_hash: 'stored-hash',
            created_at: new Date('2026-05-19T10:00:00.000Z'),
          },
        ],
      });
    const service = new AuthService(createConfigService());
    const registration = await service.register({
      email: 'dev@example.com',
      password: 'password123',
    });

    query.mockResolvedValueOnce({
      rows: [
        {
          id: 'user-id',
          email: 'dev@example.com',
          password_hash: 'stored-hash',
          created_at: new Date('2026-05-19T10:00:00.000Z'),
        },
      ],
    });

    await expect(service.getCurrentUser(registration.token)).resolves.toEqual(
      registration.user,
    );
  });

  it('returns null for an invalid current-user token', async () => {
    const service = new AuthService(createConfigService());

    await expect(service.getCurrentUser('invalid-token')).resolves.toBeNull();
    expect(query).not.toHaveBeenCalled();
  });

  it('requires DATABASE_URL for auth operations', async () => {
    const service = new AuthService(
      createConfigService({
        databaseUrl: '',
      }),
    );

    await expect(
      service.register({
        email: 'dev@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow('DATABASE_URL is required for authentication.');
  });

  it('requires AUTH_JWT_SECRET before database writes', async () => {
    const service = new AuthService(
      createConfigService({
        jwtSecret: '',
      }),
    );

    await expect(
      service.register({
        email: 'dev@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow('AUTH_JWT_SECRET is required for authentication.');
    expect(query).not.toHaveBeenCalled();
  });
});

function createConfigService({
  databaseUrl = 'postgresql://app:app@localhost:5432/ai_debug_assistant',
  jwtSecret = 'test-secret',
}: {
  databaseUrl?: string;
  jwtSecret?: string;
} = {}): ConfigService {
  return {
    get: jest.fn((key: string) => {
      if (key === 'database.url') {
        return databaseUrl;
      }

      if (key === 'auth.jwtSecret') {
        return jwtSecret;
      }

      if (key === 'auth.cookieMaxAgeMs') {
        return 604800000;
      }

      if (key === 'auth.cookieName') {
        return 'ai_debug_session';
      }

      if (key === 'auth.cookieSecure') {
        return false;
      }

      return undefined;
    }),
  } as unknown as ConfigService;
}

function getInsertedPasswordHash(
  query: jest.MockedFunction<
    (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>
  >,
): string {
  const insertCall = query.mock.calls[2];

  if (!insertCall) {
    throw new Error('Expected user insert query to be called.');
  }

  const params = insertCall[1] as unknown[];
  const passwordHash = params[2];

  if (typeof passwordHash !== 'string') {
    throw new Error('Expected inserted password hash to be a string.');
  }

  return passwordHash;
}
