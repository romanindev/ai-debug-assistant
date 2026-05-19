import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

import { AnalysisHistoryService } from './analysis-history.service';

jest.mock('pg', () => ({
  Pool: jest.fn(),
}));

const PoolMock = Pool as unknown as jest.Mock;

describe('AnalysisHistoryService', () => {
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

  it('returns an empty history when persistence is disabled', async () => {
    const service = new AnalysisHistoryService(
      createConfigService({
        persistAnalyses: false,
      }),
    );

    await expect(service.listRecent()).resolves.toEqual([]);
    await expect(
      service.save({
        context: 'typescript',
        errorText: 'TypeError',
        provider: 'mock',
        promptVersion: 'debug-analysis.v1',
        analysis: {
          summary: 'Summary',
          possibleCause: 'Cause',
          suggestedFix: 'Fix',
          codeExample: null,
          checklist: ['Check logs'],
        },
      }),
    ).resolves.toBeUndefined();
  });

  it('prepares user-scoped history columns when persistence is enabled', async () => {
    query.mockResolvedValue({ rows: [] });
    const service = new AnalysisHistoryService(
      createConfigService({
        persistAnalyses: true,
        databaseUrl: 'postgresql://app:app@localhost:5432/app',
      }),
    );

    await service.onModuleInit();

    expect(query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('CREATE TABLE IF NOT EXISTS debug_analyses'),
    );
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('ADD COLUMN IF NOT EXISTS user_id uuid'),
    );
    expect(query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('debug_analyses_user_id_created_at_idx'),
    );
  });

  it('does not persist analysis history without a user id', async () => {
    query.mockResolvedValue({ rows: [] });
    const service = new AnalysisHistoryService(
      createConfigService({
        persistAnalyses: true,
        databaseUrl: 'postgresql://app:app@localhost:5432/app',
      }),
    );

    await service.save({
      context: 'typescript',
      errorText: 'TypeError',
      provider: 'mock',
      promptVersion: 'debug-analysis.v1',
      analysis: {
        summary: 'Summary',
        possibleCause: 'Cause',
        suggestedFix: 'Fix',
        codeExample: null,
        checklist: ['Check logs'],
      },
    });

    expect(query).not.toHaveBeenCalled();
  });

  it('persists analysis history with the authenticated user id', async () => {
    query.mockResolvedValue({ rows: [] });
    const service = new AnalysisHistoryService(
      createConfigService({
        persistAnalyses: true,
        databaseUrl: 'postgresql://app:app@localhost:5432/app',
      }),
    );

    await service.save({
      userId: 'user-id',
      context: 'typescript',
      errorText: 'TypeError',
      provider: 'mock',
      promptVersion: 'debug-analysis.v1',
      analysis: {
        summary: 'Summary',
        possibleCause: 'Cause',
        suggestedFix: 'Fix',
        codeExample: null,
        checklist: ['Check logs'],
      },
    });

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO debug_analyses'),
      expect.arrayContaining(['user-id']),
    );
  });

  it('filters recent analyses by authenticated user id', async () => {
    query.mockResolvedValue({ rows: [] });
    const service = new AnalysisHistoryService(
      createConfigService({
        persistAnalyses: true,
        databaseUrl: 'postgresql://app:app@localhost:5432/app',
      }),
    );

    await expect(service.listRecent('user-id')).resolves.toEqual([]);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE user_id = $1'),
      ['user-id', 20],
    );
  });

  it('does not return history when no user id is available', async () => {
    query.mockResolvedValue({ rows: [] });
    const service = new AnalysisHistoryService(
      createConfigService({
        persistAnalyses: true,
        databaseUrl: 'postgresql://app:app@localhost:5432/app',
      }),
    );

    await expect(service.listRecent(undefined)).resolves.toEqual([]);
    await expect(
      service.findById('analysis-id', undefined),
    ).resolves.toBeNull();

    expect(query).not.toHaveBeenCalled();
  });

  it('requires DATABASE_URL when persistence is enabled', async () => {
    const service = new AnalysisHistoryService(
      createConfigService({
        persistAnalyses: true,
      }),
    );

    await expect(service.onModuleInit()).rejects.toThrow(
      'DATABASE_URL is required when PERSIST_ANALYSES=true.',
    );
  });
});

function createConfigService({
  persistAnalyses,
  databaseUrl,
}: {
  persistAnalyses: boolean;
  databaseUrl?: string;
}): ConfigService {
  return {
    get: jest.fn((key: string) => {
      if (key === 'persistence.persistAnalyses') {
        return persistAnalyses;
      }

      if (key === 'database.url') {
        return databaseUrl;
      }

      return undefined;
    }),
  } as unknown as ConfigService;
}
