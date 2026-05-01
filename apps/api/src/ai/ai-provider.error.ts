export class AiProviderError extends Error {
  constructor(
    readonly code: 'AI_PROVIDER_ERROR' | 'AI_MALFORMED_RESPONSE',
    readonly publicMessage: string,
    readonly status = 502,
    options?: ErrorOptions,
  ) {
    super(publicMessage, options);
  }
}
