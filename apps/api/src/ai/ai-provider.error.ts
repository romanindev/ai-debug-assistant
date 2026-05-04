export type AiProviderErrorCode =
  | 'AI_PROVIDER_TIMEOUT'
  | 'AI_PROVIDER_AUTH_ERROR'
  | 'AI_PROVIDER_CONFIG_ERROR'
  | 'AI_PROVIDER_RATE_LIMITED'
  | 'AI_PROVIDER_ERROR'
  | 'AI_MALFORMED_RESPONSE';

export class AiProviderError extends Error {
  constructor(
    readonly code: AiProviderErrorCode,
    readonly publicMessage: string,
    readonly status = 502,
    options?: ErrorOptions,
  ) {
    super(publicMessage, options);
  }
}
