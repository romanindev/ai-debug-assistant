export const AI_PROVIDER = Symbol('AI_PROVIDER');

export const AI_PROVIDER_NAMES = ['mock', 'openai'] as const;

export type AiProviderName = (typeof AI_PROVIDER_NAMES)[number];
