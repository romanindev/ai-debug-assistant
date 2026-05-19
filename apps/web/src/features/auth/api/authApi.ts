import axios from 'axios';

import { httpClient } from '../../../api/httpClient';
import type { AuthCredentials, AuthResponse } from '../types';

type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: string[];
  };
};

export class AuthError extends Error {
  readonly code: string;

  constructor(message: string, code = 'AUTH_ERROR') {
    super(message);
    this.code = code;
  }
}

export async function getCurrentUser(): Promise<AuthResponse> {
  const response = await httpClient.get<AuthResponse>('/auth/me');

  return response.data;
}

export async function register(
  credentials: AuthCredentials,
): Promise<AuthResponse> {
  try {
    const response = await httpClient.post<AuthResponse>(
      '/auth/register',
      credentials,
    );

    return response.data;
  } catch (error) {
    throw toAuthError(error);
  }
}

export async function login(
  credentials: AuthCredentials,
): Promise<AuthResponse> {
  try {
    const response = await httpClient.post<AuthResponse>(
      '/auth/login',
      credentials,
    );

    return response.data;
  } catch (error) {
    throw toAuthError(error);
  }
}

export async function logout(): Promise<AuthResponse> {
  const response = await httpClient.post<AuthResponse>('/auth/logout');

  return response.data;
}

function toAuthError(error: unknown): Error {
  if (isApiErrorResponse(error)) {
    const apiError = error.response.data.error;

    return new AuthError(getAuthErrorMessage(apiError.code, apiError.message));
  }

  if (axios.isAxiosError(error) && !error.response) {
    return new AuthError(
      'Could not reach the API. Check that the backend is running.',
      error.code ?? 'NETWORK_ERROR',
    );
  }

  return error instanceof Error
    ? error
    : new AuthError('Authentication request failed.');
}

function getAuthErrorMessage(code: string, message: string): string {
  if (code === 'CONFLICT') {
    return 'This email is already registered.';
  }

  if (code === 'UNAUTHORIZED') {
    return 'Invalid email or password.';
  }

  if (code === 'VALIDATION_ERROR') {
    return 'Enter a valid email and a password with at least 8 characters.';
  }

  return message || 'Authentication request failed.';
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
