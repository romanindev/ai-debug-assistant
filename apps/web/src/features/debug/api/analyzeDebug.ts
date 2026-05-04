import axios from 'axios';

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

export class AnalyzeDebugError extends Error {
  readonly code: string;

  constructor(message: string, code = 'ANALYZE_DEBUG_ERROR') {
    super(message);
    this.code = code;
  }
}

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

    return new AnalyzeDebugError(
      `${getApiErrorMessage(apiError.code, apiError.message)}${details}`,
      apiError.code,
    );
  }

  if (axios.isAxiosError(error)) {
    return new AnalyzeDebugError(
      getAxiosErrorMessage(error),
      error.code ?? 'NETWORK_ERROR',
    );
  }

  return error instanceof Error
    ? error
    : new AnalyzeDebugError('Failed to analyze the submitted input.');
}

function getApiErrorMessage(code: string, message: string): string {
  if (code === 'AI_PROVIDER_TIMEOUT') {
    return 'The AI provider timed out. Try again, or submit a shorter trace.';
  }

  if (code === 'AI_PROVIDER_RATE_LIMITED') {
    return 'The AI provider is rate limited. Wait a moment and retry.';
  }

  if (
    code === 'AI_PROVIDER_AUTH_ERROR' ||
    code === 'AI_PROVIDER_CONFIG_ERROR'
  ) {
    return 'The AI provider is not available. Check the API configuration.';
  }

  return message ?? 'Request failed.';
}

function getAxiosErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Failed to analyze the submitted input.';
  }

  if (error.code === 'ECONNABORTED') {
    return 'The request timed out before the API responded. Increase VITE_API_TIMEOUT_MS or retry with a shorter trace.';
  }

  if (!error.response) {
    return 'Could not reach the API. Check that the backend is running and reachable.';
  }

  return 'Request failed.';
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
