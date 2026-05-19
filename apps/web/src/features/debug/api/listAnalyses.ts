import { httpClient } from '../../../api/httpClient';
import type { PersistedDebugAnalysis } from '../types';

export async function listAnalyses(): Promise<PersistedDebugAnalysis[]> {
  const response =
    await httpClient.get<PersistedDebugAnalysis[]>('/debug/analyses');

  return response.data;
}
