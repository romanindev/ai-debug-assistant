import {
  ConflictException,
  Injectable,
  OnModuleDestroy,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createHmac,
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';
import { Pool } from 'pg';

import type { AuthTokenPayload, PublicUser } from './auth.types';

const scrypt = promisify(scryptCallback);

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
};

@Injectable()
export class AuthService implements OnModuleDestroy {
  private readonly databaseUrl: string | undefined;
  private readonly jwtSecret: string | undefined;
  private readonly cookieMaxAgeMs: number;
  private pool: Pool | undefined;
  private schemaReady = false;

  constructor(private readonly configService: ConfigService) {
    this.databaseUrl = this.configService.get<string>('database.url');
    this.jwtSecret = this.configService.get<string>('auth.jwtSecret');
    this.cookieMaxAgeMs =
      this.configService.get<number>('auth.cookieMaxAgeMs') ?? 604800000;
  }

  async register({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ user: PublicUser; token: string }> {
    this.getJwtSecret();
    await this.ensureSchema();

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await this.findUserByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException('Email is already registered.');
    }

    const passwordHash = await hashPassword(password);
    const result = await this.getPool().query<UserRow>(
      `
        INSERT INTO users (id, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, email, password_hash, created_at
      `,
      [randomUUID(), normalizedEmail, passwordHash],
    );
    const user = result.rows[0];

    if (!user) {
      throw new Error('Failed to create user.');
    }

    return {
      user: toPublicUser(user),
      token: this.signToken(user),
    };
  }

  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ user: PublicUser; token: string }> {
    this.getJwtSecret();
    await this.ensureSchema();

    const user = await this.findUserByEmail(normalizeEmail(email));

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return {
      user: toPublicUser(user),
      token: this.signToken(user),
    };
  }

  async getCurrentUser(token: string | undefined): Promise<PublicUser | null> {
    if (!token) {
      return null;
    }

    const payload = this.verifyToken(token);

    if (!payload) {
      return null;
    }

    await this.ensureSchema();

    const result = await this.getPool().query<UserRow>(
      `
        SELECT id, email, password_hash, created_at
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [payload.sub],
    );
    const user = result.rows[0];

    return user ? toPublicUser(user) : null;
  }

  getCookieName(): string {
    return (
      this.configService.get<string>('auth.cookieName') ?? 'ai_debug_session'
    );
  }

  getCookieMaxAgeMs(): number {
    return this.cookieMaxAgeMs;
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool?.end();
  }

  isCookieSecure(): boolean {
    return this.configService.get<boolean>('auth.cookieSecure') ?? false;
  }

  private async ensureSchema(): Promise<void> {
    if (this.schemaReady) {
      return;
    }

    if (!this.databaseUrl) {
      throw new Error('DATABASE_URL is required for authentication.');
    }

    await this.getPool().query(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY,
        email text UNIQUE NOT NULL,
        password_hash text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    this.schemaReady = true;
  }

  private async findUserByEmail(email: string): Promise<UserRow | null> {
    const result = await this.getPool().query<UserRow>(
      `
        SELECT id, email, password_hash, created_at
        FROM users
        WHERE email = $1
        LIMIT 1
      `,
      [email],
    );

    return result.rows[0] ?? null;
  }

  private signToken(user: UserRow): string {
    const secret = this.getJwtSecret();
    const now = Math.floor(Date.now() / 1000);
    const payload: AuthTokenPayload = {
      sub: user.id,
      email: user.email,
      iat: now,
      exp: now + Math.floor(this.cookieMaxAgeMs / 1000),
    };

    return signJwt(payload, secret);
  }

  private verifyToken(token: string): AuthTokenPayload | null {
    try {
      const payload = verifyJwt(token, this.getJwtSecret());

      if (payload.exp <= Math.floor(Date.now() / 1000)) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  private getPool(): Pool {
    if (!this.pool) {
      this.pool = new Pool({ connectionString: this.databaseUrl });
    }

    return this.pool;
  }

  private getJwtSecret(): string {
    if (!this.jwtSecret) {
      throw new Error('AUTH_JWT_SECRET is required for authentication.');
    }

    return this.jwtSecret;
  }
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('base64url');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `scrypt$${salt}$${derivedKey.toString('base64url')}`;
}

async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [algorithm, salt, expectedHash] = storedHash.split('$');

  if (algorithm !== 'scrypt' || !salt || !expectedHash) {
    return false;
  }

  const actualKey = (await scrypt(password, salt, 64)) as Buffer;
  const expectedKey = Buffer.from(expectedHash, 'base64url');

  return (
    actualKey.length === expectedKey.length &&
    timingSafeEqual(actualKey, expectedKey)
  );
}

function signJwt(payload: AuthTokenPayload, secret: string): string {
  const encodedHeader = encodeBase64Url({ alg: 'HS256', typ: 'JWT' });
  const encodedPayload = encodeBase64Url(payload);
  const signature = createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyJwt(token: string, secret: string): AuthTokenPayload {
  const [encodedHeader, encodedPayload, signature] = token.split('.');

  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error('Invalid JWT.');
  }

  const header = JSON.parse(
    Buffer.from(encodedHeader, 'base64url').toString('utf8'),
  ) as { alg?: unknown; typ?: unknown };

  if (header.alg !== 'HS256' || header.typ !== 'JWT') {
    throw new Error('Invalid JWT header.');
  }

  const expectedSignature = createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  if (
    signature.length !== expectedSignature.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    throw new Error('Invalid JWT signature.');
  }

  const payload = JSON.parse(
    Buffer.from(encodedPayload, 'base64url').toString('utf8'),
  ) as AuthTokenPayload;

  if (!isAuthTokenPayload(payload)) {
    throw new Error('Invalid JWT payload.');
  }

  return payload;
}

function encodeBase64Url(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toPublicUser(user: UserRow): PublicUser {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.created_at.toISOString(),
  };
}

function isAuthTokenPayload(payload: unknown): payload is AuthTokenPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'sub' in payload &&
    typeof payload.sub === 'string' &&
    'email' in payload &&
    typeof payload.email === 'string' &&
    'iat' in payload &&
    typeof payload.iat === 'number' &&
    'exp' in payload &&
    typeof payload.exp === 'number'
  );
}
