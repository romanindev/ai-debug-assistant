import { ConfigService } from '@nestjs/config';

import { AnalysisHistoryService } from './analysis-history.service';

describe('AnalysisHistoryService', () => {
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
