import type {
  DebugAnalysis,
  DebugContext,
  PersistedDebugAnalysis,
} from '@ai-debug-assistant/contracts';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';

type SaveAnalysisInput = {
  context: DebugContext;
  errorText: string;
  provider: string;
  promptVersion: string;
  analysis: DebugAnalysis;
};

type PersistedAnalysisRow = {
  id: string;
  created_at: Date;
  context: DebugContext;
  error_text: string;
  provider: string;
  prompt_version: string;
  analysis: DebugAnalysis;
};

@Injectable()
export class AnalysisHistoryService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AnalysisHistoryService.name);
  private readonly enabled: boolean;
  private readonly databaseUrl: string | undefined;
  private pool: Pool | undefined;

  constructor(private readonly configService: ConfigService) {
    this.enabled =
      this.configService.get<boolean>('persistence.persistAnalyses') ?? false;
    this.databaseUrl = this.configService.get<string>('database.url');
  }

  async onModuleInit(): Promise<void> {
    if (!this.enabled) {
      return;
    }

    if (!this.databaseUrl) {
      throw new Error('DATABASE_URL is required when PERSIST_ANALYSES=true.');
    }

    await this.getPool().query(`
      CREATE TABLE IF NOT EXISTS debug_analyses (
        id uuid PRIMARY KEY,
        created_at timestamptz NOT NULL DEFAULT now(),
        context text NOT NULL,
        error_text text NOT NULL,
        provider text NOT NULL,
        prompt_version text NOT NULL,
        analysis jsonb NOT NULL
      )
    `);
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool?.end();
  }

  async save(input: SaveAnalysisInput): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      await this.getPool().query(
        `
          INSERT INTO debug_analyses (
            id,
            context,
            error_text,
            provider,
            prompt_version,
            analysis
          )
          VALUES ($1, $2, $3, $4, $5, $6::jsonb)
        `,
        [
          randomUUID(),
          input.context,
          input.errorText,
          input.provider,
          input.promptVersion,
          JSON.stringify(input.analysis),
        ],
      );
    } catch (error) {
      this.logger.warn(
        error instanceof Error
          ? `Failed to persist debug analysis: ${error.message}`
          : 'Failed to persist debug analysis.',
      );
    }
  }

  async listRecent(limit = 20): Promise<PersistedDebugAnalysis[]> {
    if (!this.enabled) {
      return [];
    }

    const normalizedLimit = Math.min(Math.max(limit, 1), 50);
    const result = await this.getPool().query<PersistedAnalysisRow>(
      `
        SELECT
          id,
          created_at,
          context,
          error_text,
          provider,
          prompt_version,
          analysis
        FROM debug_analyses
        ORDER BY created_at DESC
        LIMIT $1
      `,
      [normalizedLimit],
    );

    return result.rows.map(toPersistedDebugAnalysis);
  }

  async findById(id: string): Promise<PersistedDebugAnalysis | null> {
    if (!this.enabled) {
      return null;
    }

    const result = await this.getPool().query<PersistedAnalysisRow>(
      `
        SELECT
          id,
          created_at,
          context,
          error_text,
          provider,
          prompt_version,
          analysis
        FROM debug_analyses
        WHERE id = $1
        LIMIT 1
      `,
      [id],
    );

    const row = result.rows[0];

    return row ? toPersistedDebugAnalysis(row) : null;
  }

  private getPool(): Pool {
    if (!this.pool) {
      this.pool = new Pool({ connectionString: this.databaseUrl });
    }

    return this.pool;
  }
}

function toPersistedDebugAnalysis(
  row: PersistedAnalysisRow,
): PersistedDebugAnalysis {
  return {
    id: row.id,
    createdAt: row.created_at.toISOString(),
    context: row.context,
    errorText: row.error_text,
    provider: row.provider,
    promptVersion: row.prompt_version,
    analysis: row.analysis,
  };
}
