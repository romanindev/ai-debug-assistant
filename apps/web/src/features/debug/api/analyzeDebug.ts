import { httpClient } from '../../../api/httpClient';
import type {
  AnalyzeDebugRequest,
  DebugAnalysis,
} from '../types';

export async function analyzeDebug(
  request: AnalyzeDebugRequest,
): Promise<DebugAnalysis> {
  const response = await httpClient.post<DebugAnalysis>(
    '/debug/analyze',
    request,
  );

  return response.data;
}
