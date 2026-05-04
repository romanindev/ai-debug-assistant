import { httpClient } from '../../../api/httpClient';
import type {
  AnalyzeDebugRequest,
  DebugAnalysis,
} from '../types';

type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: string[];
  };
};

export async function analyzeDebug(
  request: AnalyzeDebugRequest,
): Promise<DebugAnalysis> {
  try {
    const response = await httpClient.post<DebugAnalysis>(
      '/debug/analyze',
      request,
    );

    return response.data;
  } catch (error) {
    throw toAnalyzeDebugError(error);
  }
}

function toAnalyzeDebugError(error: unknown): Error {
  if (isApiErrorResponse(error)) {
    const apiError = error.response.data.error;
    const details = apiError.details?.length
      ? ` ${apiError.details.join(' ')}`
      : '';

    return new Error(`${apiError.message ?? 'Request failed.'}${details}`);
  }

  return error instanceof Error
    ? error
    : new Error('Failed to analyze the submitted input.');
}

function isApiErrorResponse(
  error: unknown,
): error is { response: { data: ApiErrorResponse } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data !== null &&
    'error' in error.response.data &&
    typeof error.response.data.error === 'object' &&
    error.response.data.error !== null &&
    'message' in error.response.data.error &&
    typeof error.response.data.error.message === 'string' &&
    'code' in error.response.data.error &&
    typeof error.response.data.error.code === 'string'
  );
}
